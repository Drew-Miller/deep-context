import path from "node:path";
import { createHash } from "node:crypto";
import { lstat, readdir, readlink, readFile, realpath, rm } from "node:fs/promises";
import { atomicWrite, createExclusive, exists, readText, within } from "../core/fs.js";
import { layoutPaths } from "../core/layout.js";
import { isForwarder, readableSlug } from "../core/records.js";
import { parseMarkdown, renderMarkdown } from "../frontmatter/index.js";
import { withProjectLock, assertNoPending } from "../tasks/transactions.js";
import { assertNoPendingContext } from "../backlog/transactions.js";
import { assertNoPendingFilenameOperations } from "./transactions.js";
import { rebuildIndexes } from "../indexing/index.js";

interface Write { path: string; before: string | null; after: string | null; symlink?: boolean }
interface Journal { version: 1; status: "pending" | "committed"; archive: string; writes: Write[]; paths: Record<string, string> }
const journalPath = (root: string) => path.join(root, ".local/layout-operation.json");
const hash = (text: string) => createHash("sha256").update(text).digest("hex");

async function files(root: string, directory: string): Promise<string[]> {
  if (!await exists(directory)) return [];
  const result: string[] = [];
  for (const entry of await readdir(directory, { withFileTypes: true })) {
    if (entry.name === "worktree" || entry.name === ".git") continue;
    const file = path.join(directory, entry.name);
    if (entry.isSymbolicLink()) throw new Error(`Migration rejects nested symlink: ${path.relative(root, file)}`);
    if (entry.isDirectory()) result.push(...await files(root, file));
    else if (entry.isFile()) result.push(file);
  }
  return result.sort();
}

function replaceRootPath(text: string, old: string, next: string): string {
  return text.replace(new RegExp(`(^|[^A-Za-z0-9_.-])${old.replace(/[.*+?^${}()|[\]\\]/g, "\\$&")}`, "g"), (_match, prefix: string) => `${prefix}${next}`);
}

function repairText(text: string, from: string, to: string, paths: Record<string, string>, sourcePrefix?: string): string {
  // Repair actual Markdown links before plain root-relative references.
  text = text.replace(/\]\(([^\s)]+)\)/g, (match, target: string) => {
    if (/^(?:[a-z]+:|#|\/)/i.test(target)) return match;
    const [name, anchor] = target.split("#");
    if (sourcePrefix && name.startsWith("repo/")) {
      const source = path.posix.normalize(path.posix.join(sourcePrefix, name.slice(5)));
      const relative = path.posix.relative(path.posix.dirname(to), source);
      return `](${relative}${anchor ? `#${anchor}` : ""})`;
    }
    const old = path.posix.normalize(path.posix.join(path.posix.dirname(from), name));
    const mapped = paths[old];
    if (!mapped) return match;
    const relative = path.posix.relative(path.posix.dirname(to), mapped);
    return `](${relative}${anchor ? `#${anchor}` : ""})`;
  });
  for (const [old, next] of Object.entries(paths).sort((a, b) => b[0].length - a[0].length)) text = replaceRootPath(text, old, next);
  for (const [old, next] of [["doc/backlog/", "work/items/"], ["doc/active/", "work/items/"], ["doc/shelf/", "work/items/"], ["doc/sources/", "sources/records/"], ["doc/", "docs/"]]) text = replaceRootPath(text, old, next);
  if (sourcePrefix) text = replaceRootPath(text, "repo/", `${sourcePrefix}/`);
  return text;
}

export async function migrateLayout(root: string, options: { apply?: boolean } = {}) {
  root = path.resolve(root);
  if (await exists(journalPath(root))) {
    const prior = JSON.parse(await readText(journalPath(root))) as Journal;
    if (prior.status !== "committed") throw new Error("Layout migration is incomplete; run repair-layout");
  }
  const layout = layoutPaths(root);
  if (layout.compact) return { moves: [], conflicts: [], fingerprint: hash("compact-v1"), applied: false, alreadyCompact: true };
  const originals = new Map<string, string>();
  for (const directory of ["doc", "docs/plan", "tasks"]) for (const file of await files(root, path.join(root, directory))) {
    if (directory === "tasks" && !file.endsWith(".md")) continue;
    const bytes = await readFile(file);
    if (!Buffer.from(bytes.toString("utf8")).equals(bytes)) throw new Error(`Migration requires review of binary content: ${path.relative(root,file)}`);
    originals.set(path.relative(root, file), bytes.toString("utf8"));
  }
  for (const name of ["AGENTS.md", "CLAUDE.md", "CONTEXT_MAP.md", "PROJECT.md", "START_HERE.md", ".local/state.json"]) if (await exists(path.join(root, name))) originals.set(name, await readText(path.join(root, name)));
  const previousState = originals.has(".local/state.json") ? JSON.parse(originals.get(".local/state.json")!) : {};
  const repositoryPath = typeof previousState.repositoryPath === "string" ? await realpath(previousState.repositoryPath).catch(() => undefined) : undefined;
  const sourcePrefix = repositoryPath ? path.relative(root, repositoryPath).split(path.sep).join("/") : undefined;
  const archive = `.local/archives/layout-${hash(JSON.stringify([...originals])).slice(0,20)}`;
  const paths: Record<string, string> = {};
  const output = new Map<string, string>();
  const occupied = new Set<string>();
  const conflicts: string[] = [];
  const allocate = (dir: string, label: string) => {
    const slug = readableSlug(label, "record");
    for (let n = 1; ; n++) { const candidate = `${dir}/${slug}${n === 1 ? "" : `-${n}`}.md`; if (!occupied.has(candidate.toLowerCase())) { occupied.add(candidate.toLowerCase()); return candidate; } }
  };
  type Doc = { old: string; data: Record<string, unknown>; body: string };
  const work: Doc[] = [], active: Doc[] = [], forwarders: Doc[] = [];
  const indexes: Record<string, string> = { "doc/FEATURES.md": "docs/features/INDEX.md", "doc/REQUIREMENTS.md": "docs/requirements/INDEX.md", "doc/DECISIONS.md": "docs/decisions/INDEX.md", "doc/REPORTS.md": "docs/reports/INDEX.md", "doc/SOURCES.md": "sources/INDEX.md", "doc/BACKLOG.md": "work/INDEX.md", "doc/ACTIVE.md": "work/INDEX.md", "doc/SHELF.md": "work/INDEX.md", "START_HERE.md": "CONTEXT_MAP.md" };
  Object.assign(paths, indexes);
  for (const [old, text] of originals) {
    if (!old.startsWith("doc/")) continue;
    if (indexes[old]) continue;
    if (!old.endsWith(".md")) { paths[old] = `${archive}/original/${old}`; continue; }
    const parsed = parseMarkdown(text), document = { old, ...parsed };
    if (isForwarder(parsed.data)) { forwarders.push(document); continue; }
    if (/^doc\/(backlog|shelf)\//.test(old)) { work.push(document); continue; }
    if (old.startsWith("doc/active/")) { active.push(document); continue; }
    let next: string;
    if (old === "doc/ARCHITECTURE.md") { next = "docs/architecture.md"; occupied.add(next.toLowerCase()); }
    else if (/^doc\/[^/]+\.md$/.test(old)) next = allocate("docs", path.basename(old, ".md"));
    else if (old.startsWith("doc/features/")) next = old.replace(/^doc\//, "docs/").replace(/FEATURE\.md$/, "overview.md").replace(/CONTRACTS\.md$/, "contracts.md");
    else { const collection = old.split("/")[1]; next = allocate(collection === "sources" ? "sources/records" : `docs/${collection}`, String(parsed.data.path ?? parsed.data.title ?? path.basename(old, ".md"))); }
    paths[old] = next;
    if (old.startsWith("doc/reports/") && typeof parsed.data.id !== "string") {
      const data = {
        ...parsed.data,
        id: `REPORT-${hash(old).slice(0, 16).toUpperCase()}`,
        title: parsed.body.match(/^#\s+(.+)$/m)?.[1] ?? path.basename(old, ".md"),
        status: "historical",
        features: [],
        origin: "inferred",
        migration_classification: "Preserved historical report; not newly accepted evidence",
      };
      output.set(next, renderMarkdown(data, parsed.body));
    } else output.set(next, text);
  }
  for (const a of active) {
    const origins = Array.isArray(a.data.backlog) ? a.data.backlog.map(String) : [];
    const matches = work.filter(w => origins.includes(String(w.data.id)));
    if (origins.length > 1 || (origins.length && matches.length !== 1)) { conflicts.push(`Ambiguous Active origins: ${a.old}`); continue; }
    if (!matches.length) { work.push(a); continue; }
    const w = matches[0];
    const compatible = w.data.status === a.data.status || (w.data.status === "planned" && a.data.status === "active") || (w.data.status === "active" && ["done", "superseded"].includes(String(a.data.status)));
    if (!compatible) { conflicts.push(`Contradictory lifecycle: ${w.old} and ${a.old}`); continue; }
    if (w.data.status !== a.data.status) w.data.status_history = [...(Array.isArray(w.data.status_history) ? w.data.status_history : []), { from: w.data.status, to: a.data.status, reason: `Migrated linked execution record ${a.data.id}` }];
    w.data.status = a.data.status;
    w.data.aliases = [...new Set([...(Array.isArray(w.data.aliases) ? w.data.aliases : []), a.data.id])];
    w.data.tasks = [...new Set([...(Array.isArray(w.data.tasks) ? w.data.tasks : []), ...(Array.isArray(a.data.tasks) ? a.data.tasks : [])])];
    w.data.legacy_active = a.data;
    w.body += `\n\n## Prior execution record\n\n${a.body}`;
    paths[a.old] = w.old;
  }
  for (const w of work) {
    const next = allocate("work/items", String(w.data.title ?? w.data.id)); paths[w.old] = next;
    if (w.old.startsWith("doc/shelf/")) {
      w.data.status = "proposed";
      w.data.pitch ??= w.body.split(/\n\s*\n/).find(part => part.trim() && !part.trim().startsWith("#"))?.trim() ?? w.data.title;
      w.data.provenance ??= `Migrated legacy Shelf record ${w.data.id}`;
    }
    if (w.data.status === "deferred") w.data.status = "blocked";
    if (w.data.status === "superseded") { w.data.status = "merged"; if (!w.data.merged_into && !w.data.superseded_by) conflicts.push(`Superseded work needs a merge target: ${w.old}`); else w.data.merged_into ??= w.data.superseded_by; }
    if (["proposed", "planned"].includes(String(w.data.status)) && w.data.queue_position !== undefined) w.data.order = w.data.queue_position;
    delete w.data.queue_position; delete w.data.activation;
    output.set(next, renderMarkdown(w.data, w.body));
  }
  for (const [old, next] of Object.entries(paths)) if (paths[next] && old !== next) paths[old] = paths[next];
  for (const f of forwarders) {
    const target = String(f.data.redirect_to); if (paths[target]) paths[f.old] = paths[target]; else conflicts.push(`Unresolved forwarder: ${f.old}`);
  }
  for (const [old] of originals) if (old.startsWith("docs/plan/")) paths[old] = `${archive}/original/${old}`;
  for (const [old, text] of originals) if (!old.startsWith("doc/") && !old.startsWith("docs/plan/") && old !== "START_HERE.md" && old !== ".local/state.json") output.set(old, text);
  for (const [taskPath, text] of output) {
    if (!taskPath.startsWith("tasks/") || !taskPath.endsWith("/TASK_STATE.md")) continue;
    const task = parseMarkdown(text);
    if (typeof task.data.task_id !== "string") continue;
    const linked = [...output.entries()].filter(([name, body]) => name.startsWith("work/items/") && (parseMarkdown(body).data.tasks as unknown[] | undefined)?.includes(task.data.task_id)).map(([, body]) => String(parseMarkdown(body).data.id));
    if (linked.length) { task.data.work_items = [...new Set([...(Array.isArray(task.data.work_items) ? task.data.work_items : []), ...linked])]; output.set(taskPath, renderMarkdown(task.data, task.body)); }
  }
  for (const [target, text] of output) {
    const old = Object.keys(paths).find(key => paths[key] === target && originals.has(key)) ?? target;
    output.set(target, repairText(text, old, target, paths, sourcePrefix));
  }
  if (originals.has(".local/state.json")) { const state = JSON.parse(originals.get(".local/state.json")!); state.layout = "compact-v1"; state.migrationMap = `${archive}/path-map.json`; output.set(".local/state.json", JSON.stringify(state, null, 2) + "\n"); }
  try {
    const link = await lstat(path.join(root, "repo"));
    if (!link.isSymbolicLink()) conflicts.push("repo is not a symlink; migration cannot remove it");
    else if (!repositoryPath || await realpath(path.join(root, "repo")) !== repositoryPath) conflicts.push("repo symlink does not match repository identity");
  } catch (e) { if ((e as NodeJS.ErrnoException).code !== "ENOENT") throw e; }
  if (repositoryPath) for (const name of ["AGENTS.md", "START_HERE.md", "CLAUDE.md"]) {
    const file = path.join(repositoryPath, name);
    if (!await exists(file)) continue;
    if (/\.deep-context\/(?:doc|repo)(?:\/|\b)|\.deep-context\/START_HERE\.md/.test(await readText(file))) conflicts.push(`Source startup route must be updated before migration: ${name}`);
  }
  for (const name of ["AGENTS.md", "CONTEXT_MAP.md", "PROJECT.md"]) {
    const text = output.get(name);
    if (text && /(^|[^A-Za-z0-9_.-])(?:repo|doc)\//m.test(text)) conflicts.push(`Unresolved legacy startup route: ${name}`);
  }
  for (const target of output.keys()) if (!originals.has(target) && await exists(path.join(root, target))) conflicts.push(`Destination occupied: ${target}`);
  const moves = Object.entries(paths).filter(([a,b]) => a !== b).map(([from,to]) => ({from,to}));
  const fingerprint = hash(JSON.stringify([...originals]) + JSON.stringify([...output]));
  if (!options.apply) return { moves, conflicts, fingerprint, applied: false, alreadyCompact: false };
  if (conflicts.length) throw new Error(`Layout migration conflicts: ${conflicts.join("; ")}`);
  return withProjectLock(root, async () => {
    await assertNoPending(root); await assertNoPendingContext(root); await assertNoPendingFilenameOperations(root);
    for (const [name, before] of originals) if (await readText(path.join(root, name)) !== before) throw new Error(`Migration source changed: ${name}`);
    const writes: Write[] = [];
    for (const [name, before] of originals) {
      const snapshot = path.join(root, archive, "original", name);
      if (!await createExclusive(snapshot, before) && await readText(snapshot) !== before) throw new Error(`Original snapshot differs: ${name}`);
      writes.push({ path: name, before, after: output.get(name) ?? null });
    }
    for (const [name, after] of output) if (!originals.has(name)) writes.push({ path: name, before: null, after });
    try { const info = await lstat(path.join(root, "repo")); if (!info.isSymbolicLink()) throw new Error("repo is not a symlink; refusing to remove it"); writes.push({ path: "repo", before: await readlink(path.join(root, "repo")), after: null, symlink: true }); }
    catch (e) { if ((e as NodeJS.ErrnoException).code !== "ENOENT") throw e; }
    await atomicWrite(path.join(root, archive, "path-map.json"), JSON.stringify(paths, null, 2));
    await atomicWrite(path.join(root, archive, "hashes.json"), JSON.stringify(Object.fromEntries([...originals].map(([name,text]) => [name,hash(text)])), null, 2));
    const journal: Journal = { version: 1, status: "pending", archive, writes, paths };
    await atomicWrite(journalPath(root), JSON.stringify(journal));
    await applyJournal(root, journal);
    return { moves, conflicts, fingerprint, applied: true, alreadyCompact: false, archive };
  });
}

async function applyJournal(root: string, journal: Journal): Promise<void> {
  if (journal.version !== 1 || !Array.isArray(journal.writes) || !journal.archive.startsWith(".local/archives/")) throw new Error("Invalid layout recovery journal");
  for (const w of journal.writes) {
    const target = path.resolve(root, w.path);
    const allowed = ["AGENTS.md","CLAUDE.md","CONTEXT_MAP.md","PROJECT.md","START_HERE.md",".local/state.json","repo"].includes(w.path) || ["doc/","docs/","work/items/","sources/records/"].some(prefix => w.path.startsWith(prefix)) || (w.path.startsWith("tasks/") && w.path.endsWith(".md") && !w.path.includes("/worktree/"));
    if (!within(root, target) || target === root || !allowed || w.path !== path.relative(root,target)) throw new Error("Unsafe layout recovery target");
    for (let parent = path.dirname(target); within(root,parent) && parent !== root; parent=path.dirname(parent)) {
      try { if ((await lstat(parent)).isSymbolicLink()) throw new Error("Layout recovery rejects symlink parent"); } catch(e) { if ((e as NodeJS.ErrnoException).code !== "ENOENT") throw e; }
    }
    if (!w.symlink) { try { if ((await lstat(target)).isSymbolicLink()) throw new Error("Layout recovery rejects symlink target"); } catch(e) { if ((e as NodeJS.ErrnoException).code !== "ENOENT") throw e; } }

    let current: string | null = null;
    try { current = w.symlink ? await readlink(target) : await readText(target); } catch(e) { if ((e as NodeJS.ErrnoException).code !== "ENOENT") throw e; }
    if (current !== w.before && current !== w.after) throw new Error(`Recovery refuses changed file: ${w.path}`);
  }
  for (const w of journal.writes) {
    const target = path.join(root,w.path);
    if (w.after === null) await rm(target, { force: true }); else await atomicWrite(target,w.after);
  }
  async function emptyDirectories(dir: string): Promise<void> {
    if (!await exists(dir)) return;
    for (const e of await readdir(dir,{withFileTypes:true})) if(e.isDirectory()) await emptyDirectories(path.join(dir,e.name));
    if (!(await readdir(dir)).length) await rm(dir,{recursive:true});
  }
  await emptyDirectories(path.join(root,"doc")); await emptyDirectories(path.join(root,"docs/plan"));
  await atomicWrite(journalPath(root),JSON.stringify({...journal,status:"committed"}));
  await rebuildIndexes(root);
}

export async function repairLayout(root: string): Promise<void> {
  root=path.resolve(root);
  await withProjectLock(root,async()=> {
    const journal=JSON.parse(await readText(journalPath(root))) as Journal;
    if(journal.status !== "committed") await applyJournal(root,journal);
  });
}
