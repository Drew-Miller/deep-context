import { createHash } from "node:crypto";
import { lstat, readFile, readlink } from "node:fs/promises";
import path from "node:path";
import { exists, readText, within } from "../core/fs.js";
import { layoutPaths } from "../core/layout.js";
import { markdownRecords, isForwarder } from "../core/records.js";
import type { Diagnostic } from "../core/types.js";
import { parseMarkdown } from "../frontmatter/index.js";
import { workItemSchema, featureSchema, requirementSchema, decisionSchema, reportSchema, sourceSchema } from "../frontmatter/schemas.js";
import { buildIndexes } from "../indexing/index.js";
import { validateMemoryTasks } from "../tasks/memory.js";
import { pendingContextOperations } from "../backlog/transactions.js";
import { pendingFilenameOperations } from "../migration/transactions.js";
import { validateRepositoryAttachment } from "./index.js";

export async function validateCompactProject(root: string): Promise<Diagnostic[]> {
  const p = layoutPaths(root), diagnostics: Diagnostic[] = [];
  const error = (code: string, message: string, file?: string) => diagnostics.push({ level: "error", code, message, path: file });
  for (const file of ["AGENTS.md", "CONTEXT_MAP.md", "PROJECT.md", "docs/architecture.md", ".local/state.json"]) if (!await exists(path.join(root, file))) error("missing-required", `Missing required file: ${file}`, file);
  for (const retired of ["doc", "docs/plan", "START_HERE.md", "repo"]) {
    try { await lstat(path.join(root, retired)); error("retired-layout-path", `Retired live path: ${retired}`, retired); }
    catch (e) { if ((e as NodeJS.ErrnoException).code !== "ENOENT") throw e; }
  }
  for (const name of ["AGENTS.md", "CONTEXT_MAP.md", "PROJECT.md"]) {
    const file = path.join(root, name);
    if (await exists(file) && /(^|[^A-Za-z0-9_.-])(?:repo|doc)\//m.test(await readText(file))) error("retired-startup-route", `Startup route still names a retired context path: ${name}`, file);
  }
  try {
    const state = JSON.parse(await readText(path.join(root, ".local/state.json")));
    if (typeof state.repositoryPath === "string") for (const name of ["AGENTS.md", "START_HERE.md", "CLAUDE.md"]) {
      const file = path.join(state.repositoryPath, name);
      if (await exists(file) && /\.deep-context\/(?:doc|repo)(?:\/|\b)|\.deep-context\/START_HERE\.md/.test(await readText(file))) error("retired-source-startup-route", `Source startup still names a retired context path: ${name}`, file);
    }
  } catch (e) { error("invalid-project-state", String(e), path.join(root, ".local/state.json")); }
  const ids = new Map<string, string>();
  type Record = { file: string; data: { [key: string]: unknown }; body: string };
  const collections: { [key: string]: Record[] } = {};
  const warning = (code: string, message: string, file?: string) => diagnostics.push({ level: "warning", code, message, path: file });
  for (const [name, directory, schema] of [["features", p.features, featureSchema], ["requirements", p.requirements, requirementSchema], ["decisions", p.decisions, decisionSchema], ["reports", p.reports, reportSchema], ["sources", p.sources, sourceSchema], ["work", p.work, workItemSchema]] as const) {
    collections[name] = [];
    let records: Record[];
    try { records = await markdownRecords(directory); }
    catch (e) { error("invalid-frontmatter", String(e), directory); continue; }
    for (const record of records) {
      if (path.basename(record.file) === "INDEX.md") continue;
      if (name === "features" && path.basename(record.file) !== p.featureFile) continue;
      if (isForwarder(record.data)) { error("legacy-forwarder", "Compact records use ID aliases instead of forwarding files", record.file); continue; }
      if (name === "work" && record.data.order !== undefined && (!Number.isSafeInteger(record.data.order) || Number(record.data.order) < 1)) error("invalid-work-order", "Work order must be a positive safe integer", record.file);
      try { record.data = schema.parse(record.data); }
      catch (e) { error("invalid-frontmatter", String(e), record.file); continue; }
      const identity = record.data.id ?? (name === "features" ? record.data.name : undefined);
      for (const id of [identity, ...(Array.isArray(record.data.aliases) ? record.data.aliases : [])]) {
        if (typeof id !== "string" || !id) { error("invalid-id", "ID and aliases must be nonempty strings", record.file); continue; }
        if (ids.has(id)) error("duplicate-id", `Duplicate ID or alias ${id}: ${ids.get(id)}`, record.file);
        else ids.set(id, record.file);
      }
      collections[name].push(record);
    }
  }
  const features = new Set(collections.features.map(r => r.data.name));
  const work = new Map<string, Record>();
  for (const r of collections.work) for (const id of [r.data.id, ...(r.data.aliases as string[])]) work.set(String(id), r);
  const positions = new Map<number, string>();
  const ref = async (value: unknown, file: string) => {
    if (typeof value !== "string" || /^(?:https?:|mailto:)/.test(value) || ids.has(value)) return;
    const target = path.resolve(root, value.split("#")[0]);
    if (!await exists(target)) error("broken-reference", `Reference does not exist: ${value}`, file);
  };
  for (const records of Object.values(collections)) for (const r of records) {
    for (const name of Array.isArray(r.data.features) ? r.data.features : r.data.feature ? [r.data.feature] : []) if (!features.has(name)) error("unknown-feature", `Unknown feature ${String(name)}`, r.file);
    for (const key of ["targets", "contracts", "requirements", "decisions"]) for (const value of Array.isArray(r.data[key]) ? r.data[key] as unknown[] : []) await ref(value, r.file);
    if (typeof r.data.source === "string" && /^(?:\.{1,2}\/|doc\/|docs\/|repo\/|work\/|sources\/|tasks\/|\.local\/)/.test(r.data.source)) await ref(r.data.source, r.file);
    if (r.data.depends_on && typeof r.data.depends_on === "object") for (const name of Object.keys(r.data.depends_on)) if (!features.has(name)) error("unknown-feature", `Unknown dependency ${name}`, r.file);
  }
  const tasks = new Map<string, Record>();
  for (const directory of [path.join(root, "tasks"), path.join(root, ".local/archives")]) {
    // Only immediate task roots are live/recoverable; immutable nested migration snapshots are not tasks.
    const { readdir } = await import("node:fs/promises");
    if (!await exists(directory)) continue;
    for (const entry of await readdir(directory, { withFileTypes: true })) {
      if (!entry.isDirectory()) continue;
      const file = path.join(directory, entry.name, "TASK_STATE.md");
      if (!await exists(file)) continue;
      const document = parseMarkdown(await readText(file));
      if (typeof document.data.task_id === "string") tasks.set(document.data.task_id, { file, ...document });
    }
  }
  for (const r of collections.work) {
    const data = workItemSchema.parse(r.data);
    if (data.order !== undefined) {
      if (!["planned", "proposed"].includes(data.status)) error("invalid-work-order", "Only queued work may have order", r.file);
      if (positions.has(data.order)) error("duplicate-queue-position", `Order ${data.order} also used by ${positions.get(data.order)}`, r.file);
      positions.set(data.order, data.id);
    }
    for (const id of [...data.related, ...data.conflicts]) if (!work.has(id)) error("unknown-work", `Unknown work ID ${id}`, r.file);
    const merged = data.merged_into ?? data.merged_target;
    if (data.status === "merged" && (typeof merged !== "string" || !work.has(merged) || work.get(merged) === r)) error("invalid-merged-target", "Merged work must identify another canonical target", r.file);
    for (const id of data.tasks) {
      const task = tasks.get(id);
      if (!task && typeof r.data.prior_ledger_state === "string" && !/^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i.test(id)) warning("historical-task-reference", `Legacy milestone label ${id} is not a live task binding`, r.file);
      else if (!task) error("unknown-task", `Work references missing task ${id}`, r.file);
      else if (Array.isArray(task.data.work_items) && !task.data.work_items.some(value => work.get(String(value)) === r)) error("work-task-link-mismatch", `Task ${id} does not link back to ${data.id}`, r.file);
    }
  }
  for (const task of tasks.values()) for (const id of Array.isArray(task.data.work_items) ? task.data.work_items : []) {
    const item = work.get(String(id));
    if (!item || !(item.data.tasks as string[]).includes(String(task.data.task_id))) error("work-task-link-mismatch", `Task links missing reciprocal work ${String(id)}`, task.file);
  }
  const topLevelDocs = (await markdownRecords(p.docs)).filter(r => path.dirname(r.file) === p.docs && path.basename(r.file) !== "architecture.md");
  for (const r of [...collections.features,...collections.requirements,...collections.decisions,...collections.reports,...collections.work,...topLevelDocs]) {
    for (const match of r.body.matchAll(/\]\(([^\s)]+)\)/g)) {
      const value = match[1]; if (/^(?:[a-z]+:|#|\/)/i.test(value)) continue;
      const target = path.resolve(path.dirname(r.file), value.split("#")[0]);
      if (!await exists(target)) error("broken-link", `Markdown link does not exist: ${value}`, r.file);
    }
  }
  try {
    const state = JSON.parse(await readText(path.join(root,".local/state.json")));
    if (typeof state.migrationMap === "string") {
      const map = path.resolve(root,state.migrationMap);
      if (!within(path.join(root,".local/archives"),map)) throw new Error("Migration evidence escapes archive storage");
      JSON.parse(await readText(map));
      const archive = path.dirname(map), original=path.join(archive,"original");
      const manual = path.join(archive,"original-manifest.json"), generated=path.join(archive,"hashes.json");
      const entries: Array<{path:string;sha256?:string;symlink?:string}> = await exists(manual) ? JSON.parse(await readText(manual)) : Object.entries(JSON.parse(await readText(generated))).map(([name,sha256])=>({path:name,sha256:String(sha256)}));
      for (const entry of entries) {
        const file=path.resolve(original,entry.path); if (!within(original,file)) throw new Error("Snapshot path escapes original tree");
        if(entry.symlink) { if(await readlink(file)!==entry.symlink) error("historical-evidence-changed", `Original symlink changed: ${entry.path}`, map); }
        else if(createHash("sha256").update(await readFile(file)).digest("hex")!==entry.sha256) error("historical-evidence-changed", `Original bytes changed: ${entry.path}`, map);
      }
    }
  } catch(e) { error("invalid-migration-evidence",String(e)); }
  const sources = new Map(collections.sources.map(r => [String(r.data.id), { file: r.file, data: sourceSchema.parse(r.data) }]));
  await validateRepositoryAttachment(root, sources, diagnostics);
  try { for (const message of await validateMemoryTasks(root)) error("invalid-task-memory", message); }
  catch (e) { error("invalid-task-memory", String(e)); }
  if ((await pendingContextOperations(root)).length) error("pending-context-operation", "Context operation requires repair-context");
  if ((await pendingFilenameOperations(root)).length) error("pending-filename-operation", "Filename operation requires repair-filenames");
  for (const [target, expected] of await buildIndexes(root)) if (!await exists(target) || await readText(target) !== expected) error("stale-index", `Generated index is stale: ${path.relative(root, target)}`, target);
  return diagnostics;
}
