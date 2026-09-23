import { createHash } from "node:crypto";
import { cp, readdir, rm, realpath, readFile } from "node:fs/promises";
import path from "node:path";
import { atomicWrite, ensureDir, exists, readText, within } from "../core/fs.js";
import { git } from "../core/git.js";
import { parseMarkdown, renderMarkdown } from "../frontmatter/index.js";
import { machineStatePath } from "../projects/index.js";
import { rebuildIndexes } from "../indexing/index.js";
import type { ProjectState } from "../core/types.js";
import { normalizeTaskName } from "../core/names.js";
import { assertMemoryOwner, resolveMemoryTask, withProjectLock, rebuildChatIndex } from "../tasks/memory.js";
import { sourceSnapshot } from "../tasks/source.js";
import { recoverClosure, stageClosure } from "./recovery.js";

export interface ClosureOptions { chatId?: string | null; bindingId?: string; expectedRevision?: number }

async function closureTaskRoot(root: string, selector: string): Promise<string> {
  const candidate = path.join(root, "tasks", normalizeTaskName(selector));
  // Interrupted cleanup leaves both active and archived records. Resolve the
  // explicit active UUID so the evidence-guarded receipt can finish cleanup.
  const activeMatches: string[] = [];
  for (const entry of await readdir(path.join(root, "tasks"), { withFileTypes: true })) {
    if (!entry.isDirectory()) continue;
    const task = path.join(root, "tasks", entry.name);
    if (await exists(path.join(task, "TASK_STATE.md")) && parseMarkdown(await readText(path.join(task, "TASK_STATE.md"))).data.task_id === selector) activeMatches.push(task);
  }
  if (activeMatches.length > 1) throw new Error("Duplicate active task UUID");
  const target = activeMatches[0] ?? (await exists(path.join(candidate, "TASK_STATE.md")) ? candidate : (await resolveMemoryTask(root, selector)).taskPath);
  const actual = await realpath(target);
  const taskDirectory = await realpath(path.join(root, "tasks"));
  if (!within(taskDirectory, actual) || actual === taskDirectory) throw new Error("Closure requires an active task inside this project");
  return actual;
}

async function walkFiles(root: string, skip?: (relative: string) => boolean): Promise<string[]> {
  if (!(await exists(root))) return [];
  const output: string[] = [];
  async function visit(directory: string): Promise<void> {
    for (const entry of await readdir(directory, { withFileTypes: true })) {
      const absolute = path.join(directory, entry.name);
      const relative = path.relative(root, absolute);
      if (skip?.(relative)) continue;
      if (entry.isSymbolicLink()) throw new Error(`Context evidence may not contain a symlink: ${absolute}`);
      if (entry.isDirectory()) await visit(absolute);
      else if (entry.isFile()) output.push(absolute);
    }
  }
  await visit(root);
  return output.sort();
}

async function evidence(projectRoot: string, taskRoot: string): Promise<{ fingerprint: string; summary: string }> {
  const state = parseMarkdown(await readText(path.join(taskRoot, "TASK_STATE.md"))).data;
  const worktree = path.join(taskRoot, "worktree");
  const hash = createHash("sha256");
  let summary: string;
  if (state.schema_version === 2) {
    const source = await sourceSnapshot(projectRoot, state.source_binding as Parameters<typeof sourceSnapshot>[1]);
    hash.update(JSON.stringify(source));
    summary = `Task ID: ${String(state.task_id)}\nSource evidence: ${JSON.stringify(source)}`;
  } else {
    const base = String(state.base_commit);
    const head = await git(worktree, ["rev-parse", "HEAD"]);
    const committed = await git(worktree, ["diff", "--binary", `${base}...${head}`]);
    const working = await git(worktree, ["diff", "--binary", "HEAD"]);
    const staged = await git(worktree, ["diff", "--binary", "--cached", "HEAD"]);
    const untracked = (await git(worktree, ["ls-files", "--others", "--exclude-standard", "-z"])).split("\0").filter(Boolean).sort();
    hash.update(JSON.stringify({ base, head, committed, working, staged, untracked }));
    for (const file of untracked) hash.update(file).update(await readFile(path.join(worktree, file)));
    summary = `Base: ${base}\nHEAD: ${head}\nCommitted diff bytes: ${Buffer.byteLength(committed)}\nWorking diff bytes: ${Buffer.byteLength(working)}\nStaged diff bytes: ${Buffer.byteLength(staged)}\nUntracked files: ${untracked.length}`;
  }
  const taskFiles = await walkFiles(taskRoot, (relative) => relative === "worktree" || relative.startsWith(`worktree${path.sep}`) || relative === "CLOSURE_REVIEW.md");
  const contextFiles = await walkFiles(path.join(projectRoot, "doc"), (relative) => relative.startsWith(`reports${path.sep}closures${path.sep}`));
  const authorityFiles = ["AGENTS.md", "CONTEXT_MAP.md", "PROJECT.md", "START_HERE.md", "docs/plan/TASKS.md", "docs/plan/STATUS.json"]
    .map((relative) => path.join(projectRoot, relative));
  for (const file of [...taskFiles, ...contextFiles, ...authorityFiles]) {
    if (await exists(file)) hash.update(path.relative(projectRoot, file)).update(await readText(file));
  }
  return { fingerprint: hash.digest("hex"), summary };
}

export async function prepareClosure(projectRoot: string, taskName: string, options: ClosureOptions = {}): Promise<string> {
  if (!(await exists(path.join(projectRoot, "tasks")))) throw new Error(`Unknown task: ${taskName}`);
  return withProjectLock(projectRoot, () => prepare(projectRoot, taskName, options));
}

async function prepare(projectRoot: string, taskName: string, options: ClosureOptions): Promise<string> {
  const taskRoot = await closureTaskRoot(projectRoot, taskName);
  const name = path.basename(taskRoot);
  if (!(await exists(path.join(taskRoot, "TASK_STATE.md")))) throw new Error(`Unknown task: ${taskName}`);
  const taskState = parseMarkdown(await readText(path.join(taskRoot, "TASK_STATE.md"))).data;
  if (taskState.schema_version === 2) await assertMemoryOwner(taskRoot, options);
  if (taskState.task !== name) throw new Error(`Task identity mismatch: expected ${name}`);
  await rebuildIndexes(projectRoot);
  const current = await evidence(projectRoot, taskRoot);
  const review = renderMarkdown({
    task: name,
    ...(taskState.task_id ? { task_id: taskState.task_id } : {}),
    status: "pending",
    evidence_fingerprint: current.fingerprint,
    reviewer: null,
    findings_resolved: false,
    promotion_references: [],
    knowledge_review: [],
    unresolved_findings: [],
    verification_evidence: [],
    updated_at: new Date().toISOString(),
  }, `# Closure Review\n\n## Evidence\n\n${current.summary}\n\n## Drift Findings\n\n- Pending Project Context review.\n\n## Durable Knowledge Classification\n\n- Review TASK_STATE.md and WORKLOG.md; promote architecture, contracts, requirements, decisions, or future intent.\n\n## Unresolved Questions\n\n- Closure review has not been completed.\n\n## Finalization Instructions\n\nAn agent must review the evidence, update durable context, list promotion references, set \`findings_resolved: true\`, identify itself in \`reviewer\`, set \`status: approved\`, and rerun \`close-task\` if evidence changes.\n`);
  const target = path.join(taskRoot, "CLOSURE_REVIEW.md");
  const instructions = "## Classification Record\n\nAdd one `knowledge_review` entry for every task-local Markdown note: `{ path, classification: transient|promoted, promotion_references: [] }`. Promoted paths must exist under `doc/` or at `PROJECT.md`; no path under `tasks/` counts as durable. Empty `unresolved_findings` is required. Classify a note as transient only after inspecting it and confirming no knowledge needed by future work remains there.\n\n";
  await atomicWrite(target, review.replace("## Finalization Instructions\n", `${instructions}## Finalization Instructions\n`));
  return target;
}

export async function finalizeClosure(projectRoot: string, taskName: string, options: ClosureOptions = {}): Promise<string> {
  if (!(await exists(path.join(projectRoot, "tasks")))) throw new Error("Run close-task before --finalize");
  const archive = await withProjectLock(projectRoot, () => finalize(projectRoot, taskName, options));
  await rebuildChatIndex(projectRoot);
  return archive;
}

async function finalize(projectRoot: string, taskName: string, options: ClosureOptions): Promise<string> {
  const taskRoot = await closureTaskRoot(projectRoot, taskName);
  const name = path.basename(taskRoot);
  const reviewPath = path.join(taskRoot, "CLOSURE_REVIEW.md");
  if (!(await exists(reviewPath))) throw new Error("Run close-task before --finalize");
  const taskState = parseMarkdown(await readText(path.join(taskRoot, "TASK_STATE.md"))).data;
  if (taskState.schema_version === 2) await assertMemoryOwner(taskRoot, options);
  if (taskState.schema_version === 2) {
    const recovered = await recoverClosure(projectRoot, taskRoot, taskState);
    if (recovered) return recovered;
  }
  if (taskState.task !== name) throw new Error(`Task identity mismatch: expected ${name}`);
  const review = parseMarkdown(await readText(reviewPath));
  if (review.data.task !== name) throw new Error(`Closure review identity mismatch: expected ${name}`);
  if (taskState.task_id && review.data.task_id !== taskState.task_id) throw new Error("Closure task UUID mismatch");
  if (review.data.status !== "approved" || review.data.findings_resolved !== true || !review.data.reviewer) throw new Error("Closure review is not approved and fully resolved");
  if (!Array.isArray(review.data.unresolved_findings) || review.data.unresolved_findings.length > 0) throw new Error("Closure has unresolved findings");
  const noteFiles = (await walkFiles(taskRoot, (relative) => relative === "worktree" || relative.startsWith(`worktree${path.sep}`) || relative === "CLOSURE_REVIEW.md"))
    .filter((file) => path.basename(file) !== "CLOSURE_REVIEW.md");
  const knowledge = review.data.knowledge_review;
  if (!Array.isArray(knowledge)) throw new Error("Task notes need explicit knowledge classification");
  const classified = new Map<string, { classification: string; promotion_references?: unknown }>();
  for (const item of knowledge) {
    if (!item || typeof item !== "object" || Array.isArray(item)) throw new Error("Invalid knowledge classification");
    const entry = item as { path?: unknown; classification?: unknown; promotion_references?: unknown };
    if (typeof entry.path !== "string" || !["transient", "promoted"].includes(String(entry.classification)) || classified.has(entry.path)) throw new Error("Invalid or duplicate knowledge classification");
    classified.set(entry.path, { classification: String(entry.classification), promotion_references: entry.promotion_references });
  }
  const noteNames = new Set(noteFiles.map((file) => path.relative(taskRoot, file)));
  if (classified.size !== noteNames.size || [...classified.keys()].some((file) => !noteNames.has(file))) throw new Error("Every task note must be classified before finalization");
  for (const note of noteNames) if (!classified.has(note)) throw new Error(`Unclassified task note: ${note}`);
  const promotions = Array.isArray(review.data.promotion_references) ? review.data.promotion_references.map(String) : [];
  const promoted = new Set<string>();
  for (const [note, entry] of classified) {
    if (entry.classification !== "promoted") continue;
    const references = entry.promotion_references;
    if (!Array.isArray(references) || references.length === 0 || references.some((value) => typeof value !== "string")) throw new Error(`Missing durable promotion for ${note}`);
    for (const reference of references as string[]) promoted.add(reference);
  }
  if (promotions.length !== promoted.size || promotions.some((reference) => !promoted.has(reference))) throw new Error("Promotion references do not match classified task notes");
  const taskStateBody = parseMarkdown(await readText(path.join(taskRoot, "TASK_STATE.md"))).body;
  const pending = taskStateBody.match(/## Decisions and Discoveries Awaiting Promotion\n\n([\s\S]*?)(?=\n## |$)/)?.[1]?.trim();
  if (pending && pending !== "- None." && classified.get("TASK_STATE.md")?.classification !== "promoted") throw new Error("Task discoveries remain unpromoted");
  for (const file of noteFiles) {
    if (/\bUNCLASSIFIED\b/i.test(await readText(file))) throw new Error(`Unclassified durable information remains in ${path.relative(taskRoot, file)}`);
  }
  for (const reference of promotions) {
    const target = path.resolve(projectRoot, reference);
    const durableRoot = path.join(projectRoot, "doc");
    if (!(within(durableRoot, target) && target !== durableRoot) && target !== path.join(projectRoot, "PROJECT.md")) throw new Error(`Promotion must point to durable project context: ${reference}`);
    if (!(await exists(target))) throw new Error(`Missing promotion reference: ${reference}`);
    const actual = await realpath(target);
    if (!within(await realpath(durableRoot), actual) && actual !== await realpath(path.join(projectRoot, "PROJECT.md"))) throw new Error(`Promotion escapes durable context: ${reference}`);
  }
  const current = await evidence(projectRoot, taskRoot);
  if (review.data.evidence_fingerprint !== current.fingerprint) throw new Error("Closure evidence changed after review; run close-task and review again");
  const binding = taskState.source_binding as { ownership?: string; path?: string } | undefined;
  const ownsWorktree = taskState.schema_version !== 2 || binding?.ownership === "deep-context";
  const worktree = taskState.schema_version === 2 ? binding?.path : path.join(taskRoot, "worktree");
  if (ownsWorktree) {
    if (!worktree || await realpath(worktree) !== path.join(taskRoot, "worktree")) throw new Error("Owned worktree identity mismatch");
    const status = await git(worktree, ["status", "--porcelain=v1"]);
    if (status) throw new Error("Task worktree is not clean; finalization refuses destructive cleanup");
  }
  const projectState = JSON.parse(await readText(await machineStatePath(projectRoot))) as ProjectState;
  if (ownsWorktree && !projectState.repositoryPath) throw new Error("Project has no recorded source repository");
  const repository = projectState.repositoryPath;
  const archiveName = taskState.task_id ? String(taskState.task_id) : `${name}-${new Date().toISOString().replace(/[:.]/g, "-")}`;
  const archiveRoot = path.join(projectRoot, ".local", "archives", archiveName);
  if (taskState.schema_version === 2 && await exists(archiveRoot)) throw new Error("Incomplete archive exists without a recovery receipt; preserve it for explicit review before retrying");
  await ensureDir(archiveRoot);
  for (const entry of await readdir(taskRoot, { withFileTypes: true })) {
    if (entry.name === "worktree") continue;
    await cp(path.join(taskRoot, entry.name), path.join(archiveRoot, entry.name), { recursive: true });
  }
  const manifest = parseMarkdown(await readText(path.join(taskRoot, "CONTEXT_MANIFEST.md"))).data;
  const levels = manifest.features && typeof manifest.features === "object" && !Array.isArray(manifest.features)
    ? manifest.features as Record<string, unknown> : {};
  const features = Object.entries(levels).filter(([, level]) => level === "feature" || level === "deep").map(([feature]) => feature).sort();
  const reportPath = path.join(projectRoot, "doc", "reports", "closures", `${archiveName}.md`);
  await atomicWrite(reportPath, renderMarkdown({
    id: `CLOSURE-${archiveName.toUpperCase()}`,
    title: `Closure of ${name}`,
    status: "accepted",
    features,
    task: name,
    ...(taskState.task_id ? { task_id: taskState.task_id } : {}),
    evidence_fingerprint: current.fingerprint,
  }, `# Closure of ${name}\n\nReviewed by ${String(review.data.reviewer)}.\n\nPromoted durable context: ${promotions.length ? promotions.join(", ") : "none"}.\n\nRaw task and chat evidence is retained locally under .local/archives/${archiveName}/. Use the evidence fingerprint to identify this closure.`));
  await rebuildIndexes(projectRoot);
  if (taskState.schema_version === 2) {
    for (const name of ["AGENTS.md", "CONTEXT_MANIFEST.md"]) {
      const archivedPath = path.join(archiveRoot, name);
      const original = await readText(archivedPath);
      await atomicWrite(archivedPath, "<!-- Closed archive: read-only history; do not execute or resume source work here. -->\n" + original.replace(/\.\.\/\.\.\//g, "../../../../"));
    }
    const archivedStatePath = path.join(archiveRoot, "TASK_STATE.md");
    const archivedState = parseMarkdown(await readText(archivedStatePath));
    archivedState.data.status = "closed";
    archivedState.data.owner_binding_id = null;
    await atomicWrite(archivedStatePath, renderMarkdown(archivedState.data, archivedState.body));
    for (const file of await walkFiles(path.join(archiveRoot, "chats"))) {
      if (path.basename(file) !== "MEMORY.md") continue;
      const chat = parseMarkdown(await readText(file));
      chat.data.status = "released";
      await atomicWrite(file, renderMarkdown(chat.data, chat.body));
    }
    await stageClosure(projectRoot, taskRoot, taskState);
    return (await recoverClosure(projectRoot, taskRoot, taskState))!;
  }
  if (ownsWorktree) await git(repository!, ["worktree", "remove", worktree!]);
  await rm(taskRoot, { recursive: true });
  return archiveRoot;
}
