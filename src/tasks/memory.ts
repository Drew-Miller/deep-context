import { randomUUID } from "node:crypto";
import { lstat, readdir, realpath } from "node:fs/promises";
import path from "node:path";
import { atomicWrite, exists, readText, within } from "../core/fs.js";
import { normalizeTaskName } from "../core/names.js";
import { git } from "../core/git.js";
import { parseMarkdown, renderMarkdown } from "../frontmatter/index.js";
import { selectFeatureContext } from "../routing/index.js";
import { defaultReadOnlySource, createIsolatedSource, resolveSourceBinding, sourceSnapshot, validateSourceBinding, type SourceBinding, type SourceAttachOptions } from "./source.js";
import { assertNoPending, pendingTransactions, repairTransactions, withProjectLock, writeTransaction } from "./transactions.js";
export { withProjectLock } from "./transactions.js";

export interface MemorySelectorOptions { chatId?: string | null; bindingId?: string; expectedRevision?: number }
export interface StartMemoryTaskOptions extends MemorySelectorOptions { description: string; name?: string; feature?: string; runtime?: string; sourceBinding?: SourceBinding; predecessorTaskId?: string }
export interface ResumeMemoryTaskOptions extends MemorySelectorOptions { takeover?: boolean; runtime?: string }
export interface SaveMemoryTaskOptions extends MemorySelectorOptions { note?: string; notes?: string; nextAction?: string; release?: boolean }
export interface AttachMemorySourceOptions extends MemorySelectorOptions, SourceAttachOptions {}
interface State extends Record<string, unknown> { schema_version: number; task_id: string; task: string; title: string; status: "active" | "closed"; state_revision: number; owner_binding_id: string | null; source_binding: SourceBinding }
interface Binding extends Record<string, unknown> { task_id: string; binding_id: string; runtime: string; runtime_chat_id: string | null; status: "active" | "released" }
interface Task { root: string; state: State; body: string; legacy: boolean }
export interface MemoryTaskResult { taskId: string; taskPath: string; title: string; status: string; legacy: boolean; bindingId: string | null; ownerBindingId: string | null; stateRevision: number; sourceBinding: SourceBinding; requiredReads: string[] }

const uuid = (value: unknown): value is string => typeof value === "string" && /^[0-9a-f]{8}-[0-9a-f]{4}-[1-8][0-9a-f]{3}-[89ab][0-9a-f]{3}-[0-9a-f]{12}$/i.test(value);
function checkIdentity(options: MemorySelectorOptions): void {
  if (options.bindingId && !uuid(options.bindingId)) throw new Error("Invalid binding ID");
  if (options.chatId != null && !/^[A-Za-z0-9._:-]{1,200}$/.test(options.chatId)) throw new Error("Invalid chat ID");
}
function checkRevision(state: State, options: MemorySelectorOptions): void {
  if (!Number.isInteger(options.expectedRevision)) throw new Error("Shared task mutation requires expectedRevision");
  if (options.expectedRevision !== state.state_revision) throw new Error("Task state revision changed; reload before saving");
}
function statePath(task: Task) { return path.join(task.root, "TASK_STATE.md"); }
function chatPath(task: Task, id: string) { if (!uuid(id)) throw new Error("Invalid binding ID"); return path.join(task.root, "chats", id, "MEMORY.md"); }
function stateText(task: Task) { return renderMarkdown(task.state, task.body); }

async function regularFile(file: string): Promise<void> {
  if (!(await lstat(file)).isFile()) throw new Error(`Canonical task file must be regular: ${file}`);
}
async function readTask(root: string): Promise<Task> {
  const file = path.join(root, "TASK_STATE.md");
  await regularFile(file);
  const doc = parseMarkdown(await readText(file));
  const version = doc.data.schema_version;
  if (version !== undefined && version !== 1 && version !== 2) throw new Error("Unsupported task schema version");
  const legacy = version !== 2;
  if (legacy) return { root, body: doc.body, legacy, state: { ...doc.data, task_id: "", title: String(doc.data.title ?? doc.data.task), state_revision: 0, owner_binding_id: null, source_binding: { mode: "none", ownership: "none" } } as State };
  const s = doc.data as State;
  if (!uuid(s.task_id) || typeof s.title !== "string" || typeof s.task !== "string" || !Number.isInteger(s.state_revision) || s.state_revision < 1 || !["active", "closed"].includes(s.status) || (s.owner_binding_id !== null && !uuid(s.owner_binding_id))) throw new Error(`Invalid task metadata: ${file}`);
  validateSourceBinding(s.source_binding);
  if (s.status === "active" && s.task !== path.basename(root)) throw new Error("Task folder identity mismatch");
  if (s.source_binding.ownership === "deep-context" && path.resolve(s.source_binding.path!) !== path.join(root, "worktree") && s.status !== "closed") throw new Error("Owned checkout escapes task worktree");
  return { root, state: s, body: doc.body, legacy };
}
async function tasks(root: string): Promise<Task[]> {
  const result: Task[] = [];
  for (const folder of ["tasks", ".local/archives", "doc/reports/closures"]) {
    const base = path.join(root, folder);
    if (!await exists(base)) continue;
    for (const entry of await readdir(base, { withFileTypes: true })) {
      if (entry.isSymbolicLink()) throw new Error("Task directory cannot be a symlink");
      if (!entry.isDirectory()) continue;
      const candidate = path.join(base, entry.name);
      if (await exists(path.join(candidate, "TASK_STATE.md"))) result.push(await readTask(candidate));
    }
  }
  const ids = new Set<string>();
  for (const task of result.filter(t => !t.legacy)) {
    if (ids.has(task.state.task_id)) throw new Error("Duplicate task ID; inspect incomplete closure or migration");
    ids.add(task.state.task_id);
  }
  return result;
}
async function bindings(task: Task): Promise<Binding[]> {
  const root = path.join(task.root, "chats");
  if (!await exists(root)) return [];
  if (!(await lstat(root)).isDirectory() || (await lstat(root)).isSymbolicLink()) throw new Error("Invalid chat memory directory");
  const result: Binding[] = [];
  for (const entry of await readdir(root, { withFileTypes: true })) {
    if (!entry.isDirectory() || !uuid(entry.name)) throw new Error("Invalid chat memory entry");
    const file = chatPath(task, entry.name);
    await regularFile(file);
    const data = parseMarkdown(await readText(file)).data as Binding;
    if (data.task_id !== task.state.task_id || data.binding_id !== entry.name || data.runtime !== "codex" || !["active", "released"].includes(data.status)) throw new Error("Invalid chat-to-task association");
    checkIdentity({ chatId: data.runtime_chat_id });
    if (data.status === "active" && data.binding_id !== task.state.owner_binding_id) throw new Error("Active chat does not own shared task state");
    result.push(data);
  }
  if (task.state.owner_binding_id && !result.some(b => b.binding_id === task.state.owner_binding_id && b.status === "active")) throw new Error("Task owner binding is missing");
  return result;
}
async function association(root: string, chatId?: string | null): Promise<{ task: Task; binding: Binding } | undefined> {
  if (!chatId) return undefined;
  const found = [];
  for (const task of await tasks(root)) for (const binding of await bindings(task)) {
    if (binding.status === "active" && binding.runtime_chat_id === chatId) found.push({ task, binding });
  }
  if (found.length > 1) throw new Error("Conflicting active chat associations");
  return found[0];
}
async function select(root: string, selector: string): Promise<Task> {
  const candidates = (await tasks(root)).filter(t => t.state.task_id === selector || t.state.task === selector || t.state.title === selector || t.root === path.resolve(selector) || t.root === path.resolve(root, selector));
  if (candidates.length !== 1) throw new Error(candidates.length ? "Task selector is ambiguous; use UUID or path" : `Unknown task: ${selector}`);
  return candidates[0];
}
function result(task: Task, bindingId: string | null = null): MemoryTaskResult {
  const project = task.state.status === "closed" ? path.resolve(task.root, "../../../..") : path.resolve(task.root, "../..");
  return { taskId: task.state.task_id, taskPath: task.root, title: task.state.title, status: task.state.status, legacy: task.legacy, bindingId, ownerBindingId: task.state.owner_binding_id, stateRevision: task.state.state_revision, sourceBinding: task.state.source_binding,
    requiredReads: [...(task.state.status === "closed" ? [path.join(task.root, "REPORT.md")] : [path.join(project, "AGENTS.md"), path.join(project, "CONTEXT_MAP.md")]), ...["AGENTS.md", "TASK_CONTEXT.md", "CONTEXT_MANIFEST.md", "TASK_STATE.md", "WORKLOG.md"].map(f => path.join(task.root, f)), ...(uuid(task.state.predecessor_binding_id) ? [chatPath(task, task.state.predecessor_binding_id)] : []), ...(uuid(task.state.last_binding_id) && task.state.last_binding_id !== task.state.predecessor_binding_id ? [chatPath(task, task.state.last_binding_id)] : []), ...(bindingId ? [chatPath(task, bindingId)] : [])] };
}
export async function resolveMemoryTask(root: string, selector?: string, options: MemorySelectorOptions = {}): Promise<MemoryTaskResult> {
  checkIdentity(options);
  await assertNoPending(root);
  const bound = await association(root, options.chatId);
  const task = selector ? await select(root, selector) : bound?.task;
  if (!task) throw new Error("No task is associated with this chat; supply an explicit task selector");
  if (bound && bound.task.state.task_id !== task.state.task_id) throw new Error("Chat binding and task selector disagree");
  return result(task, bound?.binding.binding_id ?? null);
}
export async function assertMemoryOwner(taskPath: string, options: MemorySelectorOptions): Promise<Binding> {
  checkIdentity(options);
  const task = await readTask(taskPath);
  if (task.legacy || task.state.status !== "active") throw new Error("Task requires explicit resume/migration or is closed");
  if (task.state.pending_source) throw new Error("Source attachment needs repair-tasks before further mutation");
  checkRevision(task.state, options);
  const current = (await bindings(task)).find(b => b.binding_id === task.state.owner_binding_id);
  if (!current || (options.bindingId && current.binding_id !== options.bindingId) || (options.chatId && current.runtime_chat_id !== options.chatId) || (!options.chatId && !options.bindingId)) throw new Error("Task ownership changed; reload before saving");
  return current;
}
function newBinding(taskId: string, id: string, chatId?: string | null): Binding {
  return { task_id: taskId, binding_id: id, runtime: "codex", runtime_chat_id: chatId ?? null, status: "active", created_at: new Date().toISOString(), identity_source: chatId ? "provided-runtime-id" : "explicit-task-path", identity_verified: false };
}
const chatBody = "# Chat Memory\n\n## Discoveries\n\n- None yet.\n\n## Handoff\n\nRead TASK_STATE.md for the next safe action.\n";

export async function startMemoryTask(root: string, options: StartMemoryTaskOptions): Promise<MemoryTaskResult> {
  checkIdentity(options);
  if (!options.description.trim()) throw new Error("Memory task description is required");
  if (options.runtime && options.runtime !== "codex") throw new Error("Only local Codex chat bindings are supported");
  return withProjectLock(root, async () => {
    await assertNoPending(root);
    const bound = await association(root, options.chatId);
    if (bound) return result(bound.task, bound.binding.binding_id);
    const id = randomUUID(), bindingId = randomUUID();
    const title = options.name?.trim() || options.description.trim().split(/\r?\n/, 1)[0].slice(0, 100);
    const folder = `${normalizeTaskName(title).slice(0, 64)}--${id}`;
    const taskRoot = path.join(await realpath(root), "tasks", folder);
    if (options.sourceBinding && !["none", "read-only"].includes(options.sourceBinding.mode)) throw new Error("Start creates memory only; use attach-source for editable checkouts");
    const source = options.sourceBinding ? await sourceSnapshot(root, options.sourceBinding) : await defaultReadOnlySource(root);
    if (options.predecessorTaskId && (await select(root, options.predecessorTaskId)).state.status !== "closed") throw new Error("Predecessor must be a closed task");
    const state: State = { schema_version: 2, task_id: id, task: folder, title, status: "active", state_revision: 1, owner_binding_id: bindingId, source_binding: source, created_at: new Date().toISOString(), ...(options.predecessorTaskId ? { predecessor_task_id: options.predecessorTaskId } : {}) };
    const task: Task = { root: taskRoot, state, body: taskBody(options.description), legacy: false };
    const selection = options.feature ? await selectFeatureContext(root, { [options.feature]: "feature" }) : { levels: {}, files: [] };
    const writes = new Map<string, string>([
      [statePath(task), stateText(task)],
      [path.join(taskRoot, "AGENTS.md"), "# Task startup\n\nRead ../../AGENTS.md and ../../CONTEXT_MAP.md, then TASK_CONTEXT.md, CONTEXT_MANIFEST.md and TASK_STATE.md. Resolve the current chat binding and read only its MEMORY.md plus prior notes selected by the handoff. Follow source harness instructions at the recorded execution path. Keep shared-state updates guarded by owner and state revision. Preserve discoveries before closure.\n"],
      [path.join(taskRoot, "TASK_CONTEXT.md"), renderMarkdown({ task_id: id }, `# Task\n\n## Objective\n\n${options.description}\n\n## Acceptance Criteria\n\nRecord concrete acceptance evidence before implementation.\n`)],
      [path.join(taskRoot, "CONTEXT_MANIFEST.md"), renderMarkdown({ task_id: id, context_version: 1, features: selection.levels }, `# Context Manifest\n\n## Always Load\n\n- ../../AGENTS.md\n- ../../CONTEXT_MAP.md\n- TASK_CONTEXT.md\n- TASK_STATE.md\n- ../../doc/FEATURES.md\n- ../../doc/REQUIREMENTS.md\n\n## Selected Context\n\n${selection.files.map(f => "- ../../" + f).join("\n") || "No feature bodies selected yet."}\n\nDependencies start at contract level and never recursively expand without evidence.\n`)],
      [path.join(taskRoot, "WORKLOG.md"), "# Worklog\n\nTask history; promote durable conclusions before closure.\n"],
      [chatPath(task, bindingId), renderMarkdown(newBinding(id, bindingId, options.chatId), chatBody)]
    ]);
    await writeTransaction(root, writes);
    return result(task, bindingId);
  });
}

export async function resumeMemoryTask(root: string, selector: string, options: ResumeMemoryTaskOptions = {}): Promise<MemoryTaskResult> {
  checkIdentity(options);
  return withProjectLock(root, async () => {
    await assertNoPending(root);
    const task = await select(root, selector);
    if (task.state.status === "closed") throw new Error("Closed tasks cannot be resumed; start a new task with a predecessor link");
    if (task.state.pending_source) throw new Error("Source attachment needs repair-tasks before resume");
    const bound = await association(root, options.chatId);
    if (bound && bound.task.root !== task.root) throw new Error("This chat owns another task; save-task --release before switching");
    if (bound && bound.binding.binding_id === task.state.owner_binding_id) return result(task, bound.binding.binding_id);
    if (options.bindingId && !options.chatId && options.bindingId === task.state.owner_binding_id) return result(task, options.bindingId);
    if (task.state.owner_binding_id && !options.takeover) throw new Error("Task has another owner; explicit --takeover is required");
    if (!task.legacy) checkRevision(task.state, options);
    const writes = new Map<string, string>();
    if (task.legacy) {
      const old = parseMarkdown(await readText(statePath(task))).data;
      let source: SourceBinding = { mode: "none", ownership: "none" };
      if (old.worktree) {
        const worktree = await realpath(path.resolve(task.root, String(old.worktree)));
        if (worktree !== path.join(task.root, "worktree") || await git(worktree, ["branch", "--show-current"]) !== old.branch) throw new Error("Legacy worktree identity mismatch");
        source = await sourceSnapshot(root, { mode: "isolated", path: worktree, ownership: "deep-context" });
      }
      task.state = { ...old, schema_version: 2, task_id: randomUUID(), task: path.basename(task.root), title: String(old.task), owner_binding_id: null, state_revision: 0, status: "active", source_binding: source, migrated_at: new Date().toISOString() };
      task.legacy = false;
      const reviewPath = path.join(task.root, "CLOSURE_REVIEW.md");
      if (await exists(reviewPath)) {
        const review = parseMarkdown(await readText(reviewPath)); review.data.status = "stale";
        writes.set(reviewPath, renderMarkdown(review.data, review.body));
      }
    }
    if (task.state.owner_binding_id) {
      const file = chatPath(task, task.state.owner_binding_id);
      const old = parseMarkdown(await readText(file)); old.data.status = "released";
      writes.set(file, renderMarkdown(old.data, old.body));
    }
    const predecessor = task.state.owner_binding_id ?? task.state.last_binding_id;
    if (uuid(predecessor)) task.state.predecessor_binding_id = predecessor;
    const id = randomUUID();
    task.state.owner_binding_id = id; task.state.state_revision++; task.state.updated_at = new Date().toISOString();
    writes.set(chatPath(task, id), renderMarkdown(newBinding(task.state.task_id, id, options.chatId), chatBody));
    writes.set(statePath(task), stateText(task));
    await writeTransaction(root, writes);
    return result(task, id);
  });
}

export async function saveMemoryTask(root: string, selector: string, options: SaveMemoryTaskOptions): Promise<MemoryTaskResult> {
  return withProjectLock(root, async () => {
    await assertNoPending(root);
    const task = await select(root, selector);
    const binding = await assertMemoryOwner(task.root, options);
    const memory = parseMarkdown(await readText(chatPath(task, binding.binding_id)));
    const note = options.note ?? options.notes;
    if (note) memory.body += "\n\n## Checkpoint\n\n" + note + "\n";
    const snapshot = await sourceSnapshot(root, task.state.source_binding);
    if (JSON.stringify(snapshot) !== JSON.stringify(task.state.source_binding)) {
      const previousBlockers = task.body.match(/## Active Work and Blockers\n\n([\s\S]*?)(?=\n## |$)/)?.[1]?.trim() ?? "";
      task.body = replaceSection(task.body, "Active Work and Blockers", previousBlockers + "\n\nSource changed since the previous checkpoint. Revalidate source-dependent findings.");
    }
    task.state.source_binding = snapshot;
    if (options.nextAction) task.body = replaceSection(task.body, "Exact Next Safe Action", options.nextAction);
    task.state.state_revision++; task.state.updated_at = new Date().toISOString();
    if (options.release) { task.state.last_binding_id = binding.binding_id; task.state.owner_binding_id = null; memory.data.status = "released"; }
    await writeTransaction(root, new Map([[statePath(task), stateText(task)], [chatPath(task, binding.binding_id), renderMarkdown(memory.data, memory.body)]]));
    return result(task, binding.binding_id);
  });
}

export async function attachMemorySource(root: string, selector: string, options: AttachMemorySourceOptions): Promise<MemoryTaskResult> {
  return withProjectLock(root, async () => {
    await assertNoPending(root);
    const task = await select(root, selector);
    const owner = await assertMemoryOwner(task.root, options);
    const previous = task.state.source_binding;
    if (previous.ownership === "deep-context") throw new Error("Task already owns an isolated checkout; preserve it until closure");
    const candidate = await resolveSourceBinding(root, options);
    const attached = await defaultReadOnlySource(root);
    const identity = previous.common_dir ?? attached.common_dir;
    if (identity && candidate.common_dir !== identity) throw new Error("Attached source does not share the project repository identity");
    if (options.sourceMode === "isolated") {
      const policy = parseMarkdown(await readText(path.join(root, "PROJECT.md"))).data.source_worktree_policy;
      if (policy === "prohibited") throw new Error("Source policy prohibits another editable worktree");
      if (policy !== undefined && !["allowed", "review-required"].includes(String(policy))) throw new Error("Unknown source worktree policy");
      if (!candidate.head || !candidate.common_dir) throw new Error("Isolated source mode requires a committed Git repository");
      if (await exists(path.join(task.root, "worktree"))) throw new Error("Task worktree already exists; repair or inspect it before reuse");
      if (await git(candidate.path!, ["show-ref", "--verify", `refs/heads/deep-context/memory-${task.state.task_id}`], true)) throw new Error("Task branch already exists; inspect before attachment");
      // Persist a recoverable intent before Git creates anything. A missing checkout is surfaced, never guessed.
      task.state.pending_source = { ...options, sourcePath: candidate.path, task_id: task.state.task_id };
      task.state.state_revision++;
      await writeTransaction(root, new Map([[statePath(task), stateText(task)]]));
      task.state.source_binding = await createIsolatedSource(root, task.root, options, task.state.task_id);
      delete task.state.pending_source;
    } else task.state.source_binding = candidate;
    task.state.state_revision++; task.state.updated_at = new Date().toISOString();
    await writeTransaction(root, new Map([[statePath(task), stateText(task)]]));
    return result(task, owner.binding_id);
  });
}

export async function rebuildChatIndex(root: string): Promise<string> {
  return withProjectLock(root, async () => {
    await assertNoPending(root);
    const entries: Record<string, unknown>[] = [];
    const active = new Set<string>();
    for (const task of await tasks(root)) for (const b of await bindings(task)) {
      if (b.status === "active" && b.runtime_chat_id) {
        if (active.has(b.runtime_chat_id)) throw new Error("Conflicting active chat associations");
        active.add(b.runtime_chat_id);
      }
      entries.push({ ...b, task_path: path.relative(root, task.root), task_status: task.state.status });
    }
    entries.sort((a, b) => String(a.binding_id).localeCompare(String(b.binding_id)));
    const target = path.join(root, ".local/chat-index.json");
    await atomicWrite(target, JSON.stringify({ schema_version: 1, bindings: entries }, null, 2) + "\n");
    return target;
  });
}
export async function validateMemoryTasks(root: string): Promise<string[]> {
  const errors: string[] = [];
  try {
    if ((await pendingTransactions(root)).length) errors.push("Task transaction needs repair");
    const chats = new Set<string>();
    for (const task of await tasks(root)) {
      if (task.state.pending_source) errors.push("Source attachment needs repair");
      if (task.legacy) continue;
      for (const file of ["AGENTS.md", "TASK_CONTEXT.md", "CONTEXT_MANIFEST.md", "WORKLOG.md"]) await regularFile(path.join(task.root, file));
      for (const b of await bindings(task)) {
        if (b.status === "active" && b.runtime_chat_id) {
          if (chats.has(b.runtime_chat_id)) errors.push("Duplicate active chat ID");
          chats.add(b.runtime_chat_id);
        }
      }
    }
  } catch (error) { errors.push(error instanceof Error ? error.message : String(error)); }
  return errors;
}
export async function repairMemoryTasks(root: string, unlock?: string): Promise<string[]> {
  const repaired = await repairTransactions(root, unlock);
  await withProjectLock(root, async () => {
    for (const task of await tasks(root)) {
      const pending = task.state.pending_source as SourceAttachOptions | undefined;
      if (!pending) continue;
      const target = path.join(task.root, "worktree");
      if (await exists(target)) {
        const source = await sourceSnapshot(root, { mode: "isolated", path: target, ownership: "deep-context" });
        const base = await sourceSnapshot(root, { mode: "read-only", path: pending.sourcePath, ownership: "external" });
        if (source.common_dir !== base.common_dir || await git(target, ["branch", "--show-current"]) !== `deep-context/memory-${task.state.task_id}`) throw new Error("Pending checkout identity mismatch; preserve for review");
        task.state.source_binding = source;
      } else task.state.source_binding = await createIsolatedSource(root, task.root, pending, task.state.task_id);
      delete task.state.pending_source; task.state.state_revision++;
      await writeTransaction(root, new Map([[statePath(task), stateText(task)]]));
      repaired.push(statePath(task));
    }
  });
  await rebuildChatIndex(root);
  return repaired;
}
function taskBody(description: string): string {
  return "# Task State\n\n## Objective and Acceptance\n\n" + description + "\n\n## Completed Work and Evidence\n\n- None yet.\n\n## Active Work and Blockers\n\n- Ready to begin.\n\n## Decisions and Discoveries Awaiting Promotion\n\n- None.\n\n## Open Questions\n\n- None.\n\n## Exact Next Safe Action\n\nRead the manifest and define acceptance evidence before implementation.\n";
}
function replaceSection(body: string, heading: string, value: string): string {
  const expression = new RegExp("(## " + heading + "\\n\\n)([\\s\\S]*?)(?=\\n## |$)");
  return expression.test(body) ? body.replace(expression, (_match, prefix) => prefix + value.trim() + "\n") : body.trimEnd() + "\n\n## " + heading + "\n\n" + value.trim() + "\n";
}
