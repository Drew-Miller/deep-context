import { randomUUID } from "node:crypto";
import { cp, lstat, readlink, realpath, readdir, rename, rm, rmdir, symlink } from "node:fs/promises";
import path from "node:path";
import { atomicWrite, createExclusive, ensureDir, exists, readText } from "../core/fs.js";
import { projectRegistryPath, updateAgentsBlock } from "../config/index.js";
import { git, isGitRepository } from "../core/git.js";
import type { ProjectState, SourceRecord } from "../core/types.js";
import { parseMarkdown, renderMarkdown } from "../frontmatter/index.js";
import { inventoryRepository } from "../importing/index.js";
import { rebuildIndexes } from "../indexing/index.js";
import { architectureTemplate, contextMap, projectAgents, projectContextAgent, projectOverview } from "./templateFiles.js";
import { stringify } from "yaml";
import { validateProject } from "../validation/index.js";

export function normalizeName(value: string): string {
  const normalized = value.toLowerCase().trim().replace(/[^a-z0-9]+/g, "-").replace(/^-|-$/g, "");
  if (!normalized) throw new Error("Project name must contain letters or numbers");
  return normalized;
}

type ProjectIdentity = ProjectState & { projectId?: string };
type ProjectRegistry = { version: 1; projects: Array<{ projectRoot: string; repositoryPath?: string; repositoryCommonDir?: string; projectId?: string }> };

export async function machineStatePath(projectRoot: string): Promise<string> {
  const current = path.join(projectRoot, ".local", "state.json");
  if (await exists(current)) return current;
  const legacy = path.join(projectRoot, ".deep-context", "state.json");
  return (await exists(legacy)) ? legacy : current;
}

export async function initProject(home: string, options: { name: string; repository?: string; contextPath?: string; register?: boolean; installRouting?: boolean }): Promise<string> {
  const name = normalizeName(options.name);
  const requestedContext = path.resolve(options.contextPath ?? (options.repository ? path.join(await primaryCheckout(options.repository), ".deep-context") : path.join(home, name)));
  let projectRoot = await realpath(requestedContext).catch(() => requestedContext);
  if (options.repository && projectRoot === await realpath(options.repository)) throw new Error("Context storage must not be the source repository root");
  let statePath = await machineStatePath(projectRoot);
  const previous = (await exists(statePath)) ? (JSON.parse(await readText(statePath)) as ProjectIdentity) : undefined;
  if (await exists(statePath)) {
    const previousRoot = previous?.projectRoot ? await realpath(previous.projectRoot).catch(() => path.resolve(previous.projectRoot)) : undefined;
    const requestedRoot = await realpath(projectRoot).catch(() => path.resolve(projectRoot));
    if (previous?.name !== name || previousRoot !== requestedRoot) throw new Error(`Conflicting project identity at ${projectRoot}`);
  }

  for (const directory of ["doc/features", "doc/requirements", "doc/backlog", "doc/active", "doc/decisions", "doc/sources", "doc/reports", "tasks", ".local"]) {
    await ensureDir(path.join(projectRoot, directory));
  }
  projectRoot = await realpath(projectRoot);
  statePath = await machineStatePath(projectRoot);

  const requestedRepository = options.repository ? await realpath(options.repository) : undefined;
  const repositoryPath = requestedRepository ?? previous?.repositoryPath;
  let imported: ProjectState["import"];
  const link = path.join(projectRoot, "repo");
  const linkedRepository = await repositoryLink(link);
  if (repositoryPath) {
    const resolvedRepository = await realpath(repositoryPath);
    if (linkedRepository && linkedRepository !== resolvedRepository) throw new Error(`Conflicting repository attachment at ${projectRoot}`);
    if (previous?.repositoryPath && await realpath(previous.repositoryPath) !== resolvedRepository) throw new Error(`Conflicting repository attachment at ${projectRoot}`);
    if (!linkedRepository) await symlink(resolvedRepository, link);
    if (options.installRouting !== false) await updateAgentsBlock(path.join(resolvedRepository, "AGENTS.md"), projectRoot);
    if (isContained(projectRoot, resolvedRepository)) await ignorePrivateContext(resolvedRepository);
    const inventory = await inventoryRepository(resolvedRepository, { excludedRoots: [projectRoot] });
    imported = { head: inventory.head, branch: inventory.branch, dirty: inventory.dirty, capturedAt: new Date().toISOString() };
    for (const record of inventory.records) await writeSourceRecord(projectRoot, record);
    await markAbsentSourceRecords(projectRoot, new Set(inventory.records.map((record) => record.path)));
  } else if (linkedRepository) {
    throw new Error(`Repository link exists without a repository identity at ${projectRoot}`);
  }

  await createExclusive(path.join(projectRoot, "AGENTS.md"), projectAgents(name));
  await createExclusive(path.join(projectRoot, "CONTEXT_MAP.md"), contextMap(name));
  const projectId = await ensureCanonicalProjectId(path.join(projectRoot, "PROJECT.md"), name, repositoryPath, previous?.projectId ?? randomUUID());
  await createExclusive(path.join(projectRoot, "doc", "ARCHITECTURE.md"), architectureTemplate);
  await removeLegacyAgent(projectRoot);

  const now = new Date().toISOString();
  const state: ProjectIdentity = { schemaVersion: 1, name, projectRoot, repositoryPath, projectId, createdAt: previous?.createdAt ?? now, updatedAt: now, import: imported ?? previous?.import };
  await atomicWrite(statePath, `${JSON.stringify(state, null, 2)}\n`);
  await rebuildIndexes(projectRoot);
  if (options.register === true) await registerProject(projectRoot);
  return projectRoot;
}

export async function migrateProject(oldPath: string, repository: string): Promise<{ projectRoot: string; backup: string }> {
  const oldRoot = await realpath(oldPath);
  const source = await primaryCheckout(repository);
  const destination = path.join(source, ".deep-context");
  if (oldRoot === destination) throw new Error("Project already uses in-repository storage");
  if (await exists(destination)) throw new Error(`Conflicting migration destination: ${destination}`);
  await preflightMigration(oldRoot, source);
  const oldState = JSON.parse(await readText(await machineStatePath(oldRoot))) as ProjectIdentity;
  if (await realpath(oldState.repositoryPath ?? "") !== source) throw new Error("Migration source repository does not match project identity");
  const sourceAgentsPath = path.join(source, "AGENTS.md");
  const sourceIgnorePath = path.join(source, ".gitignore");
  const originalAgents = await exists(sourceAgentsPath) ? await readText(sourceAgentsPath) : null;
  const originalIgnore = await exists(sourceIgnorePath) ? await readText(sourceIgnorePath) : null;
  let routedAgents: string | undefined;
  let updatedIgnore: string | undefined;
  let backup: string | undefined;
  await cp(oldRoot, destination, { recursive: true, force: false, errorOnExist: true });
  try {
    const oldMachine = path.join(destination, ".deep-context");
    if (await exists(oldMachine)) await rename(oldMachine, path.join(destination, ".local"));
    const statePath = path.join(destination, ".local", "state.json");
    await atomicWrite(statePath, `${JSON.stringify({ ...oldState, projectRoot: destination, repositoryPath: source }, null, 2)}\n`);
    await migrateShelf(destination);
    await migrateClosureArchives(destination);
    await rewriteMovedReferences(destination);
    await removeLegacyAgent(destination);
    const agentsPath = path.join(destination, "AGENTS.md");
    const oldAgents = await readText(agentsPath);
    await atomicWrite(agentsPath, oldAgents.replaceAll("deep-start or deep-resume", "deep-task").replaceAll("Shelf", "Backlog") + "\n\n## Automatic context care\n\nResolve known chat bindings on startup. Read BACKLOG.md and ACTIVE.md at planning and scope changes. Save useful decisions, discoveries, blockers, evidence and future ideas as they arise. Refresh indexes and validate affected context. An unbound chat stays at project scope.\n");
    const mapPath = path.join(destination, "CONTEXT_MAP.md");
    const oldMap = await readText(mapPath);
    let nextMap = oldMap.replaceAll("doc/shelf", "doc/backlog").replaceAll("SHELF.md", "BACKLOG.md").replaceAll("Shelf", "Backlog").replaceAll(".deep-context/state.json", ".local/state.json").replaceAll(".deep-context/chat-index.json", ".local/chat-index.json");
    nextMap = nextMap.replace(/(^\| `doc\/backlog\/\*\.md`[^\n]*\n)/m, "$1| `doc/active/*.md` | Accepted objectives and executing tasks | Canonical |\n");
    nextMap = nextMap.replace("`BACKLOG.md`,", "`BACKLOG.md`, `ACTIVE.md`,");
    nextMap = nextMap.replace(/^\| `doc\/reports\/closures\/\*`[^\n]*$/m, "| `doc/reports/closures/*.md` | Concise durable closure conclusions | Canonical |\n| `.local/archives/*` | Raw closed task and chat memory | Local archive |");
    await atomicWrite(mapPath, nextMap + "\n\n## In-repository storage\n\n`tasks/` and `.local/` are local-only. All Git worktrees resolve this primary checkout's context. Raw closed memory is retained in `.local/archives/`; concise closure conclusions belong in `doc/reports/closures/*.md`. Unfinished Backlog writes are journaled under `.local/context-operations/` and require repair-context.\n");
    await initProject(path.dirname(destination), { name: oldState.name, repository: source, contextPath: destination, installRouting: false });
    updatedIgnore = await readText(sourceIgnorePath);
    await requireValidMigration(destination);
    await preflightMigration(oldRoot, source);
    await updateAgentsBlock(sourceAgentsPath, destination);
    routedAgents = await readText(sourceAgentsPath);
    await initProject(path.dirname(destination), { name: oldState.name, repository: source, contextPath: destination, installRouting: false });
    await requireValidMigration(destination);
    backup = `${oldRoot}.backup-${new Date().toISOString().replace(/[:.]/g, "-")}`;
    if (await exists(backup)) throw new Error(`Migration backup already exists: ${backup}`);
    await preflightMigration(oldRoot, source);
    await rename(oldRoot, backup);
    await symlink(destination, oldRoot);
    await registerProject(destination);
    return { projectRoot: destination, backup };
  } catch (error) {
    if (backup && await exists(backup)) {
      const oldInfo = await lstat(oldRoot).catch((failure) => {
        if ((failure as NodeJS.ErrnoException).code === "ENOENT") return undefined;
        throw failure;
      });
      if (oldInfo?.isSymbolicLink() && await readlink(oldRoot) === destination) await rm(oldRoot);
      if (!(await exists(oldRoot))) await rename(backup, oldRoot);
    }
    if (routedAgents && await exists(sourceAgentsPath) && await readText(sourceAgentsPath) === routedAgents) {
      if (originalAgents === null) await rm(sourceAgentsPath);
      else await atomicWrite(sourceAgentsPath, originalAgents);
    }
    if (updatedIgnore && await exists(sourceIgnorePath) && await readText(sourceIgnorePath) === updatedIgnore) {
      if (originalIgnore === null) await rm(sourceIgnorePath);
      else await atomicWrite(sourceIgnorePath, originalIgnore);
    }
    if (await exists(oldRoot) && !(await lstat(oldRoot)).isSymbolicLink()) await rm(destination, { recursive: true, force: true });
    throw error;
  }
}

async function removeLegacyAgent(root: string): Promise<void> {
  const legacyAgent = path.join(root, "agents", "PROJECT_CONTEXT_AGENT.md");
  if (await exists(legacyAgent) && await readText(legacyAgent) === projectContextAgent) {
    await rm(legacyAgent);
    if ((await readdir(path.dirname(legacyAgent))).length === 0) await rmdir(path.dirname(legacyAgent));
  }
}

async function preflightMigration(oldRoot: string, repository: string): Promise<void> {
  for (const location of [path.join(oldRoot, "tasks"), path.join(oldRoot, ".deep-context", "locks"), path.join(oldRoot, ".local", "locks")]) {
    if (await exists(location) && (await readdir(location)).length) throw new Error(`Migration refuses active tasks or locks at ${location}`);
  }
  const listed = await git(repository, ["worktree", "list", "--porcelain"]);
  if ((listed.match(/^worktree /gm) ?? []).length > 1) throw new Error("Migration requires review of existing Git worktrees");
}

async function requireValidMigration(root: string): Promise<void> {
  const errors = (await validateProject(root)).filter((item) => item.level === "error");
  if (errors.length) throw new Error(`Migrated project did not validate: ${errors.slice(0, 5).map((item) => `${item.code}: ${item.message}`).join("; ")}`);
}

async function migrateShelf(root: string): Promise<void> {
  const oldDirectory = path.join(root, "doc", "shelf");
  if (!(await exists(oldDirectory))) return;
  const backlog = path.join(root, "doc", "backlog");
  if (await exists(backlog)) {
    if ((await readdir(backlog)).length) throw new Error("Backlog destination conflicts with legacy Shelf");
    await rmdir(backlog);
  }
  await rename(oldDirectory, backlog);
  for (const entry of await readdir(backlog)) {
    if (!entry.endsWith(".md")) continue;
    const target = path.join(backlog, entry);
    const document = parseMarkdown(await readText(target));
    const data = document.data;
    const oldStatus = String(data.status ?? "shelved");
    const status = oldStatus === "implemented" ? "done" : oldStatus.startsWith("implemented-") ? "active" : oldStatus === "shelved" ? "proposed" : "deferred";
    const pitch = document.body.split(/\n\s*\n/).map((part) => part.trim()).find((part) => part && !part.startsWith("#")) ?? String(data.title);
    data.pitch = pitch.replace(/\s+/g, " ").slice(0, 280);
    data.status = status;
    data.status_history = [...(Array.isArray(data.status_history) ? data.status_history : []), { from: oldStatus, to: status, reason: "Shelf-to-Backlog terminology migration" }];
    data.provenance = typeof data.source === "string" ? data.source : JSON.stringify(data.source ?? "legacy Shelf record");
    data.related = Array.isArray(data.related) ? data.related : [];
    data.conflicts = Array.isArray(data.conflicts) ? data.conflicts : [];
    await atomicWrite(target, `---\n${stringify(data).trimEnd()}\n---\n${document.body.replaceAll("Shelf", "Backlog")}`);
  }
  await rm(path.join(root, "doc", "SHELF.md"), { force: true });
}

async function migrateClosureArchives(root: string): Promise<void> {
  const oldDirectory = path.join(root, "doc", "reports", "closures");
  if (!await exists(oldDirectory)) return;
  const archiveDirectory = path.join(root, ".local", "archives");
  await ensureDir(archiveDirectory);
  for (const entry of await readdir(oldDirectory, { withFileTypes: true })) {
    if (!entry.isDirectory()) continue;
    const oldArchive = path.join(oldDirectory, entry.name);
    if (!await exists(path.join(oldArchive, "TASK_STATE.md"))) continue;
    const newArchive = path.join(archiveDirectory, entry.name);
    if (await exists(newArchive)) throw new Error(`Conflicting local closure archive: ${newArchive}`);
    const report = path.join(oldArchive, "REPORT.md");
    if (await exists(report)) {
      const durable = path.join(oldDirectory, `${entry.name}.md`);
      if (await exists(durable)) throw new Error(`Conflicting durable closure report: ${durable}`);
      await cp(report, durable, { force: false, errorOnExist: true });
    }
    await rename(oldArchive, newArchive);
  }
}

async function rewriteMovedReferences(root: string): Promise<void> {
  for (const folder of ["doc", "docs/plan"]) {
    const directory = path.join(root, folder);
    if (!await exists(directory)) continue;
    async function visit(current: string): Promise<void> {
      for (const entry of await readdir(current, { withFileTypes: true })) {
        const target = path.join(current, entry.name);
        if (entry.isDirectory()) await visit(target);
        else if (entry.isFile() && entry.name.endsWith(".md")) {
          const original = await readText(target);
          const updated = original.replaceAll("doc/shelf/", "doc/backlog/").replaceAll("doc/SHELF.md", "doc/BACKLOG.md");
          if (updated !== original) await atomicWrite(target, updated);
        }
      }
    }
    await visit(directory);
  }
}

export async function registerProject(projectRoot: string): Promise<void> {
  const resolved = await resolveExplicitProject(projectRoot);
  const state = JSON.parse(await readText(await machineStatePath(resolved))) as ProjectIdentity;
  const registry = await readRegistry();
  const projects = registry.projects.filter((project) => project.projectRoot !== resolved);
  projects.push({ projectRoot: resolved, repositoryPath: state.repositoryPath, repositoryCommonDir: state.repositoryPath ? await commonGitDirectory(state.repositoryPath) : undefined, projectId: state.projectId });
  projects.sort((left, right) => left.projectRoot.localeCompare(right.projectRoot));
  await atomicWrite(projectRegistryPath(), `${JSON.stringify({ version: 1, projects }, null, 2)}\n`);
}

export async function resolveExplicitProject(candidate: string): Promise<string> {
  const resolved = await realpath(candidate).catch(() => path.resolve(candidate));
  const statePath = await machineStatePath(resolved);
  if (!(await exists(statePath))) throw new Error(`No Deep Context project at ${candidate}`);
  const state = JSON.parse(await readText(statePath)) as ProjectIdentity;
  const stateRoot = await realpath(state.projectRoot).catch(() => path.resolve(state.projectRoot));
  if (state.schemaVersion !== 1 || !state.name || stateRoot !== resolved) throw new Error(`Invalid Deep Context project at ${candidate}`);
  const canonicalId = parseMarkdown(await readText(path.join(resolved, "PROJECT.md"))).data.project_id;
  if (state.projectId !== canonicalId) throw new Error(`Conflicting canonical project identity at ${candidate}`);
  const linked = await repositoryLink(path.join(resolved, "repo"));
  if (state.repositoryPath) {
    const repository = await realpath(state.repositoryPath);
    if (linked !== repository) throw new Error(`Invalid repository attachment at ${candidate}`);
  } else if (linked) {
    throw new Error(`Invalid repository attachment at ${candidate}`);
  }
  return resolved;
}

async function ensureCanonicalProjectId(target: string, name: string, repository: string | undefined, fallbackId: string): Promise<string> {
  if (!(await exists(target))) {
    await createExclusive(target, projectOverview(name, repository, fallbackId));
    return fallbackId;
  }
  const document = parseMarkdown(await readText(target));
  if (typeof document.data.project_id === "string" && document.data.project_id) return document.data.project_id;
  document.data.project_id = fallbackId;
  await atomicWrite(target, `---\n${stringify(document.data).trimEnd()}\n---\n${document.body}`);
  return fallbackId;
}

function isContained(candidate: string, root: string): boolean {
  return candidate.startsWith(`${root}${path.sep}`);
}

async function excludeLocalContext(repository: string, contextRoot: string): Promise<void> {
  const relative = path.relative(repository, contextRoot);
  if (!relative || relative.startsWith("..") || path.isAbsolute(relative)) return;
  const gitPath = await git(repository, ["rev-parse", "--git-path", "info/exclude"], true);
  if (!gitPath) return;
  const excludePath = path.isAbsolute(gitPath) ? gitPath : path.resolve(repository, gitPath);
  const original = (await exists(excludePath)) ? await readText(excludePath) : "";
  const entries = new Set(original.split(/\r?\n/).filter(Boolean));
  const pattern = `/${relative.replace(/[\\*?\[\]#! ]/g, "\\$&")}/`;
  if (entries.has(pattern)) return;
  await ensureDir(path.dirname(excludePath));
  await atomicWrite(excludePath, `${original.trimEnd()}${original.trim() ? "\n" : ""}${pattern}\n`);
}

async function ignorePrivateContext(repository: string): Promise<void> {
  const target = path.join(repository, ".gitignore");
  const original = await exists(target) ? await readText(target) : "";
  const marker = "# Deep Context private state";
  if (original.includes(marker)) return;
  const addition = `${marker}\n/.deep-context/tasks/\n/.deep-context/.local/\n/.deep-context/repo\n`;
  await atomicWrite(target, `${original.trimEnd()}${original.trim() ? "\n\n" : ""}${addition}`);
}

async function writeSourceRecord(projectRoot: string, record: SourceRecord): Promise<void> {
  const target = path.join(projectRoot, "doc", "sources", `${record.id}.md`);
  let body: string | undefined;
  if (await exists(target)) {
    const document = parseMarkdown(await readText(target));
    const previous = document.data;
    body = document.body;
    const changed = previous.sha256 !== record.sha256 || previous.tracking !== record.tracking;
    const classified = previous.disposition === "imported" || previous.disposition === "referenced";
    record = {
      ...previous,
      ...record,
      disposition: String(previous.disposition ?? record.disposition) as SourceRecord["disposition"],
      reason: String(previous.reason ?? record.reason),
      origin: String(previous.origin ?? record.origin) as SourceRecord["origin"],
      targets: Array.isArray(previous.targets) ? previous.targets.map(String) : record.targets,
    } as SourceRecord;
    if (changed && classified) {
      const history = Array.isArray(previous.review_history) ? previous.review_history : [];
      record = {
        ...record,
        disposition: "review",
        reason: "Source revision or tracking changed; review the preserved prior classification.",
        review_history: [...history, {
          disposition: previous.disposition,
          reason: previous.reason,
          sha256: previous.sha256,
          tracking: previous.tracking,
        }],
      } as SourceRecord;
    }
  }
  const defaultBody = `# ${record.path}\n\nThis record preserves import provenance. Read the source body through \`repo/${record.path}\` only when its routing metadata makes it relevant.\n`;
  const contents = body === undefined
    ? renderMarkdown(record as unknown as Record<string, unknown>, defaultBody)
    : `---\n${stringify(record).trimEnd()}\n---\n${body}`;
  await atomicWrite(target, contents);
}

async function markAbsentSourceRecords(projectRoot: string, inventoriedPaths: Set<string>): Promise<void> {
  const sourceRoot = path.join(projectRoot, "doc", "sources");
  for (const entry of await readdir(sourceRoot, { withFileTypes: true })) {
    if (!entry.isFile() || !entry.name.endsWith(".md")) continue;
    const target = path.join(sourceRoot, entry.name);
    const document = parseMarkdown(await readText(target));
    const data = document.data;
    if (typeof data.path !== "string" || inventoriedPaths.has(data.path) || data.tracking === "not-applicable" || data.disposition === "excluded" || data.tracking === "missing") continue;
    const history = Array.isArray(data.review_history) ? data.review_history : [];
    data.review_history = [...history, { disposition: data.disposition, reason: data.reason, sha256: data.sha256, tracking: data.tracking }];
    data.tracking = "missing";
    data.disposition = "missing";
    data.reason = "Previously indexed source is absent from the current inventory; review historical provenance.";
    await atomicWrite(target, `---\n${stringify(data).trimEnd()}\n---\n${document.body}`);
  }
}

async function repositoryLink(link: string): Promise<string | undefined> {
  try {
    const info = await lstat(link);
    if (!info.isSymbolicLink()) throw new Error(`Repository attachment is not a symlink: ${link}`);
    return await realpath(path.resolve(path.dirname(link), await readlink(link)));
  } catch (error) {
    if ((error as NodeJS.ErrnoException).code === "ENOENT") return undefined;
    throw error;
  }
}

export async function findProjectRoot(start = process.cwd()): Promise<string> {
  let current = await realpath(start).catch(() => path.resolve(start));
  const resolvedStart = current;
  const repositoryRoot = await git(resolvedStart, ["rev-parse", "--show-toplevel"], true);
  if (repositoryRoot) {
    const primary = await primaryCheckout(repositoryRoot);
    const shared = path.join(primary, ".deep-context");
    if (await exists(path.join(shared, ".local", "state.json"))) return resolveExplicitProject(shared);
  }
  let local: string | undefined;
  while (true) {
    if (await exists(await machineStatePath(current))) {
      local = await resolveExplicitProject(current);
      break;
    }
    const contained = path.join(current, "deep-context");
    if (current === repositoryRoot && await exists(await machineStatePath(contained))) {
      local = await resolveExplicitProject(contained);
      break;
    }
    const parent = path.dirname(current);
    if (parent === current) break;
    current = parent;
  }

  const commonDirectory = repositoryRoot ? await commonGitDirectory(repositoryRoot) : undefined;
  const matches = (await readRegistry()).projects.filter((project) => project.repositoryPath === resolvedStart || (project.repositoryPath && resolvedStart.startsWith(`${project.repositoryPath}${path.sep}`)) || (commonDirectory && project.repositoryCommonDir === commonDirectory));
  const roots = [...new Set(await Promise.all(matches.map(async (project) => {
    const resolved = await resolveExplicitProject(project.projectRoot);
    const state = JSON.parse(await readText(await machineStatePath(resolved))) as ProjectIdentity;
    if (state.projectId !== project.projectId || state.repositoryPath !== project.repositoryPath || (state.repositoryPath && await commonGitDirectory(state.repositoryPath) !== project.repositoryCommonDir)) throw new Error("Stale project registry identity; register the explicit context root again");
    return resolved;
  })))];
  if (local && roots.some((root) => root !== local)) throw new Error(`Multiple Deep Context projects match ${start}; specify an explicit project path`);
  if (local) return local;
  if (roots.length === 1) return roots[0];
  if (roots.length > 1) throw new Error(`Multiple Deep Context projects match ${start}; specify an explicit project path`);
  throw new Error(`No Deep Context project found from ${start}`);
}

export async function primaryCheckout(repository: string): Promise<string> {
  const root = await git(repository, ["rev-parse", "--show-toplevel"]);
  const listed = await git(root, ["worktree", "list", "--porcelain"]);
  const candidates = listed.split(/\n\n/).map((block) => block.match(/^worktree (.+)$/m)?.[1]).filter((item): item is string => Boolean(item));
  for (const candidate of candidates) {
    const marker = path.join(candidate, ".git");
    try { if ((await lstat(marker)).isDirectory()) return await realpath(candidate); } catch { /* absent worktree */ }
  }
  return await realpath(root);
}

async function commonGitDirectory(repository: string): Promise<string | undefined> {
  if (!(await isGitRepository(repository))) return undefined;
  const value = await git(repository, ["rev-parse", "--git-common-dir"], true);
  if (!value) return undefined;
  return realpath(path.isAbsolute(value) ? value : path.resolve(repository, value)).catch(() => path.resolve(repository, value));
}

async function readRegistry(): Promise<ProjectRegistry> {
  const target = projectRegistryPath();
  if (!(await exists(target))) return { version: 1, projects: [] };
  const parsed = JSON.parse(await readText(target)) as Partial<ProjectRegistry>;
  if (parsed.version !== 1 || !Array.isArray(parsed.projects)) throw new Error(`Invalid Deep Context project registry: ${target}`);
  if (parsed.projects.some(project => typeof project?.projectRoot !== "string")) throw new Error(`Invalid Deep Context project registry entry: ${target}`);
  return { version: 1, projects: parsed.projects };
}
