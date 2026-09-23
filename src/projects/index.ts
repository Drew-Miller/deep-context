import { symlink } from "node:fs/promises";
import path from "node:path";
import { atomicWrite, createExclusive, ensureDir, exists, readText } from "../core/fs.js";
import type { ProjectState, SourceRecord } from "../core/types.js";
import { parseMarkdown, renderMarkdown } from "../frontmatter/index.js";
import { inventoryRepository } from "../importing/index.js";
import { rebuildIndexes } from "../indexing/index.js";
import { architectureTemplate, contextMap, projectAgents, projectContextAgent, projectOverview } from "./templateFiles.js";

export function normalizeName(value: string): string {
  const normalized = value.toLowerCase().trim().replace(/[^a-z0-9]+/g, "-").replace(/^-|-$/g, "");
  if (!normalized) throw new Error("Project name must contain letters or numbers");
  return normalized;
}

export async function initProject(home: string, options: { name: string; repository?: string }): Promise<string> {
  const name = normalizeName(options.name);
  const projectRoot = path.join(home, name);
  const statePath = path.join(projectRoot, ".deep-context", "state.json");
  if (await exists(statePath)) {
    const existing = JSON.parse(await readText(statePath)) as ProjectState;
    if (existing.name !== name || path.resolve(existing.projectRoot) !== path.resolve(projectRoot)) throw new Error(`Conflicting project identity at ${projectRoot}`);
  }

  for (const directory of ["doc/features", "doc/requirements", "doc/shelf", "doc/decisions", "doc/sources", "doc/reports", "agents", "tasks", ".deep-context"]) {
    await ensureDir(path.join(projectRoot, directory));
  }

  let repositoryPath: string | undefined;
  let imported: ProjectState["import"];
  if (options.repository) {
    repositoryPath = path.resolve(options.repository);
    const link = path.join(projectRoot, "repo");
    if (!(await exists(link))) await symlink(repositoryPath, link);
    const inventory = await inventoryRepository(repositoryPath);
    imported = { head: inventory.head, branch: inventory.branch, dirty: inventory.dirty, capturedAt: new Date().toISOString() };
    for (const record of inventory.records) await writeSourceRecord(projectRoot, record);
  }

  await createExclusive(path.join(projectRoot, "AGENTS.md"), projectAgents(name));
  await createExclusive(path.join(projectRoot, "CONTEXT_MAP.md"), contextMap(name));
  await createExclusive(path.join(projectRoot, "PROJECT.md"), projectOverview(name, repositoryPath));
  await createExclusive(path.join(projectRoot, "doc", "ARCHITECTURE.md"), architectureTemplate);
  await createExclusive(path.join(projectRoot, "agents", "PROJECT_CONTEXT_AGENT.md"), projectContextAgent);

  const now = new Date().toISOString();
  const previous = (await exists(statePath)) ? (JSON.parse(await readText(statePath)) as ProjectState) : undefined;
  const state: ProjectState = { schemaVersion: 1, name, projectRoot, repositoryPath, createdAt: previous?.createdAt ?? now, updatedAt: now, import: imported ?? previous?.import };
  await atomicWrite(statePath, `${JSON.stringify(state, null, 2)}\n`);
  await rebuildIndexes(projectRoot);
  return projectRoot;
}

async function writeSourceRecord(projectRoot: string, record: SourceRecord): Promise<void> {
  const target = path.join(projectRoot, "doc", "sources", `${record.id}.md`);
  if (await exists(target)) {
    const previous = parseMarkdown(await readText(target)).data;
    record.disposition = String(previous.disposition ?? record.disposition) as SourceRecord["disposition"];
    record.reason = String(previous.reason ?? record.reason);
    record.origin = String(previous.origin ?? record.origin) as SourceRecord["origin"];
    record.targets = Array.isArray(previous.targets) ? previous.targets.map(String) : record.targets;
  }
  const body = `# ${record.path}\n\nThis record preserves import provenance. Read the source body through \`repo/${record.path}\` only when its routing metadata makes it relevant.\n`;
  await atomicWrite(target, renderMarkdown(record as unknown as Record<string, unknown>, body));
}

export async function findProjectRoot(start = process.cwd()): Promise<string> {
  let current = path.resolve(start);
  while (true) {
    if (await exists(path.join(current, ".deep-context", "state.json"))) return current;
    const parent = path.dirname(current);
    if (parent === current) break;
    current = parent;
  }
  throw new Error(`No Deep Context project found from ${start}`);
}
