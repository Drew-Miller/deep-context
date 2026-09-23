import { lstat, readdir, readlink, realpath } from "node:fs/promises";
import path from "node:path";
import { buildIndexes } from "../indexing/index.js";
import { exists, readText, within } from "../core/fs.js";
import type { Diagnostic, ProjectState, SourceRecord } from "../core/types.js";
import { parseMarkdown } from "../frontmatter/index.js";
import { activeSchema, backlogSchema, decisionSchema, featureSchema, reportSchema, requirementSchema, shelfSchema, sourceSchema } from "../frontmatter/schemas.js";
import { inventoryRepository } from "../importing/index.js";
import { validateMemoryTasks } from "../tasks/memory.js";
import { machineStatePath } from "../projects/index.js";
import { pendingContextOperations } from "../backlog/transactions.js";

async function files(directory: string, basename?: string): Promise<string[]> {
  if (!(await exists(directory))) return [];
  const output: string[] = [];
  for (const entry of await readdir(directory, { withFileTypes: true })) {
    const target = path.join(directory, entry.name);
    if (entry.isDirectory()) output.push(...(await files(target, basename)));
    else if (entry.isFile() && entry.name.endsWith(".md") && (!basename || entry.name === basename)) output.push(target);
  }
  return output.sort();
}

function localReference(value: string): string {
  return value.split("#", 1)[0];
}

async function checkReference(projectRoot: string, reference: string, sourceFile: string, diagnostics: Diagnostic[]): Promise<void> {
  const target = path.resolve(projectRoot, localReference(reference));
  if (!within(projectRoot, target)) {
    diagnostics.push({ level: "error", code: "escaping-reference", message: `Reference escapes project root: ${reference}`, path: sourceFile });
  } else if (!(await exists(target))) {
    diagnostics.push({ level: "error", code: "broken-reference", message: `Reference does not exist: ${reference}`, path: sourceFile });
  }
}

export async function validateProject(projectRoot: string): Promise<Diagnostic[]> {
  const diagnostics: Diagnostic[] = [];
  for (const required of ["AGENTS.md", "CONTEXT_MAP.md", "PROJECT.md", "doc/ARCHITECTURE.md"]) {
    if (!(await exists(path.join(projectRoot, required)))) diagnostics.push({ level: "error", code: "missing-required", message: `Missing required file: ${required}`, path: required });
  }
  if (!(await exists(await machineStatePath(projectRoot)))) diagnostics.push({ level: "error", code: "missing-required", message: "Missing machine project state", path: projectRoot });
  const featureFiles = await files(path.join(projectRoot, "doc/features"), "FEATURE.md");
  const requirementFiles = await files(path.join(projectRoot, "doc/requirements"));
  const shelfFiles = await files(path.join(projectRoot, "doc/shelf"));
  const backlogFiles = await files(path.join(projectRoot, "doc/backlog"));
  const activeFiles = await files(path.join(projectRoot, "doc/active"));
  const sourceFiles = await files(path.join(projectRoot, "doc/sources"));
  const decisionFiles = await files(path.join(projectRoot, "doc/decisions"));
  const reportFiles = await files(path.join(projectRoot, "doc/reports"));
  const features = new Map<string, { file: string; data: ReturnType<typeof featureSchema.parse> }>();
  const requirements = new Map<string, { file: string; data: ReturnType<typeof requirementSchema.parse> }>();

  async function parseCollection<T extends Record<string, unknown>>(collection: string[], schema: { parse(value: unknown): T }, idField: keyof T, accepted?: Map<string, { file: string; data: T }>): Promise<void> {
    const seen = new Map<string, string>();
    for (const file of collection) {
      try {
        const data = parseMarkdown(await readText(file)).data;
        const parsed = schema.parse(data);
        const id = String(parsed[idField]);
        const previous = seen.get(id);
        if (previous) diagnostics.push({ level: "error", code: "duplicate-id", message: `Duplicate ${id}: ${previous} and ${file}`, path: file });
        else {
          seen.set(id, file);
          accepted?.set(id, { file, data: parsed });
        }
      } catch (error) {
        diagnostics.push({ level: "error", code: "invalid-frontmatter", message: error instanceof Error ? error.message : String(error), path: file });
      }
    }
  }

  await parseCollection(featureFiles, featureSchema, "name", features);
  await parseCollection(requirementFiles, requirementSchema, "id", requirements);
  await parseCollection(shelfFiles, shelfSchema, "id");
  const backlog = new Map<string, { file: string; data: ReturnType<typeof backlogSchema.parse> }>();
  await parseCollection(backlogFiles, backlogSchema, "id", backlog);
  const active = new Map<string, { file: string; data: ReturnType<typeof activeSchema.parse> }>();
  await parseCollection(activeFiles, activeSchema, "id", active);
  for (const item of backlog.values()) {
    for (const feature of item.data.features) if (!features.has(feature)) diagnostics.push({ level: "error", code: "unknown-feature", message: `Backlog references unknown feature ${feature}`, path: item.file });
    for (const related of item.data.related) if (!backlog.has(related) && !active.has(related)) diagnostics.push({ level: "error", code: "unknown-work", message: `Backlog references unknown work ${related}`, path: item.file });
    for (const conflict of item.data.conflicts) if (!backlog.has(conflict) && !active.has(conflict)) diagnostics.push({ level: "error", code: "unknown-work", message: `Backlog references unknown conflicting work ${conflict}`, path: item.file });
  }
  for (const item of active.values()) {
    for (const feature of item.data.features) if (!features.has(feature)) diagnostics.push({ level: "error", code: "unknown-feature", message: `Active work references unknown feature ${feature}`, path: item.file });
    for (const id of item.data.backlog) if (!backlog.has(id)) diagnostics.push({ level: "error", code: "unknown-backlog", message: `Active work references unknown backlog ${id}`, path: item.file });
    for (const id of item.data.backlog) {
      const origin = backlog.get(id);
      if (origin && item.data.status === "active" && origin.data.status !== "active") diagnostics.push({ level: "error", code: "work-status-mismatch", message: `Active work ${item.data.id} has non-active Backlog origin ${id}`, path: item.file });
    }
  }
  for (const item of backlog.values()) {
    const activation = item.data.activation;
    if (typeof activation === "string") {
      const target = path.resolve(projectRoot, activation);
      if (!(await exists(target))) diagnostics.push({ level: "error", code: "broken-activation", message: `Backlog activation is missing: ${activation}`, path: item.file });
    }
  }
  if ((await pendingContextOperations(projectRoot)).length) diagnostics.push({ level: "error", code: "pending-context-operation", message: "Backlog context operation needs repair-context" });
  const sources = new Map<string, { file: string; data: ReturnType<typeof sourceSchema.parse> }>();
  await parseCollection(sourceFiles, sourceSchema, "id", sources);
  const decisions = new Map<string, { file: string; data: ReturnType<typeof decisionSchema.parse> }>();
  const reports = new Map<string, { file: string; data: ReturnType<typeof reportSchema.parse> }>();
  await parseStructuredCollection(decisionFiles, decisionSchema, decisions, diagnostics, false);
  await parseStructuredCollection(reportFiles, reportSchema, reports, diagnostics, true);

  for (const [name, feature] of features) {
    for (const contract of feature.data.contracts) await checkReference(projectRoot, contract, feature.file, diagnostics);
    for (const dependency of Object.keys(feature.data.depends_on)) {
      if (!features.has(dependency)) diagnostics.push({ level: "error", code: "unknown-feature", message: `Feature ${name} references unknown dependency ${dependency}`, path: feature.file });
    }
    for (const requirement of feature.data.requirements ?? []) {
      if (!requirements.has(requirement)) await checkReference(projectRoot, requirement, feature.file, diagnostics);
    }
  }

  for (const requirement of requirements.values()) {
    if (requirement.data.feature && !features.has(requirement.data.feature)) diagnostics.push({ level: "error", code: "unknown-feature", message: `Requirement references unknown feature ${requirement.data.feature}`, path: requirement.file });
    if (typeof requirement.data.source === "string") await checkReference(projectRoot, requirement.data.source, requirement.file, diagnostics);
  }

  for (const source of sources.values()) {
    for (const target of source.data.targets) await checkReference(projectRoot, target, source.file, diagnostics);
  }
  for (const [kind, records] of [["Decision", decisions], ["Report", reports]] as const) {
    for (const record of records.values()) {
      for (const feature of record.data.features) {
        if (!features.has(feature)) diagnostics.push({ level: "error", code: "unknown-feature", message: `${kind} references unknown feature ${feature}`, path: record.file });
      }
    }
  }
  await validateRepositoryAttachment(projectRoot, sources, diagnostics);
  try {
    diagnostics.push(...(await validateMemoryTasks(projectRoot)).map((message) => ({ level: "error" as const, code: "invalid-task-memory", message })));
  } catch (error) {
    diagnostics.push({ level: "error", code: "invalid-task-memory", message: error instanceof Error ? error.message : String(error) });
  }
  for (const [target, expected] of await buildIndexes(projectRoot)) {
    if (!(await exists(target)) || (await readText(target)) !== expected) diagnostics.push({ level: "error", code: "stale-index", message: `Generated index is stale: ${path.relative(projectRoot, target)}`, path: target });
  }
  return diagnostics;
}

async function parseStructuredCollection<T extends { id: string }>(
  collection: string[],
  schema: { parse(value: unknown): T },
  accepted: Map<string, { file: string; data: T }>,
  diagnostics: Diagnostic[],
  allowLegacy: boolean,
): Promise<void> {
  for (const file of collection) {
    try {
      const data = parseMarkdown(await readText(file)).data;
      if (typeof data.id !== "string") {
        if (!allowLegacy) diagnostics.push({ level: "error", code: "invalid-frontmatter", message: "Canonical decision requires an id and structured frontmatter", path: file });
        continue;
      }
      const parsed = schema.parse(data);
      const previous = accepted.get(parsed.id);
      if (previous) diagnostics.push({ level: "error", code: "duplicate-id", message: `Duplicate ${parsed.id}: ${previous.file} and ${file}`, path: file });
      else accepted.set(parsed.id, { file, data: parsed });
    } catch (error) {
      diagnostics.push({ level: "error", code: "invalid-frontmatter", message: error instanceof Error ? error.message : String(error), path: file });
    }
  }
}

async function validateRepositoryAttachment(
  projectRoot: string,
  sources: Map<string, { file: string; data: SourceRecord }>,
  diagnostics: Diagnostic[],
): Promise<void> {
  const statePath = await machineStatePath(projectRoot);
  let state: ProjectState;
  try {
    state = JSON.parse(await readText(statePath)) as ProjectState;
  } catch (error) {
    diagnostics.push({ level: "error", code: "invalid-state", message: error instanceof Error ? error.message : String(error), path: statePath });
    return;
  }
  if (path.resolve(state.projectRoot) !== path.resolve(projectRoot)) {
    diagnostics.push({ level: "error", code: "state-project-root-mismatch", message: "State projectRoot does not match this project.", path: statePath });
  }

  const link = path.join(projectRoot, "repo");
  let linkedRepository: string | undefined;
  try {
    const info = await lstat(link);
    if (!info.isSymbolicLink()) {
      diagnostics.push({ level: "error", code: "repository-link-invalid", message: "repo must be a symbolic link.", path: link });
      return;
    }
    linkedRepository = await realpath(path.resolve(path.dirname(link), await readlink(link)));
  } catch (error) {
    if ((error as NodeJS.ErrnoException).code !== "ENOENT") diagnostics.push({ level: "error", code: "repository-link-invalid", message: error instanceof Error ? error.message : String(error), path: link });
  }
  if (!state.repositoryPath) {
    if (linkedRepository) diagnostics.push({ level: "error", code: "repository-link-mismatch", message: "repo exists but state has no repositoryPath.", path: link });
    return;
  }

  let stateRepository: string;
  try {
    stateRepository = await realpath(state.repositoryPath);
  } catch (error) {
    diagnostics.push({ level: "error", code: "repository-state-invalid", message: error instanceof Error ? error.message : String(error), path: statePath });
    return;
  }
  if (!linkedRepository) {
    diagnostics.push({ level: "error", code: "repository-link-mismatch", message: "State has repositoryPath but repo link is missing.", path: link });
    return;
  }
  if (linkedRepository !== stateRepository) {
    diagnostics.push({ level: "error", code: "repository-link-mismatch", message: "repo link does not match state.repositoryPath.", path: link });
    return;
  }

  const inventory = await inventoryRepository(stateRepository, { excludedRoots: [projectRoot] });
  const allCurrent = new Map(inventory.records.map((record) => [record.path, record]));
  const current = new Map(inventory.records
    .filter((record) => (record.tracking === "tracked" || record.tracking === "untracked") && record.disposition !== "excluded")
    .map((record) => [record.path, record]));
  const recordsByPath = new Map([...sources.values()].map((record) => [record.data.path, record]));
  for (const [sourcePath, record] of current) {
    const saved = recordsByPath.get(sourcePath);
    if (!saved) {
      diagnostics.push({ level: "error", code: "source-inventory-added", message: `Current source is not recorded: ${sourcePath}`, path: sourcePath });
      continue;
    }
    if (saved.data.sha256 !== record.sha256) {
      diagnostics.push({ level: "error", code: "source-inventory-changed", message: `Recorded source hash is stale: ${sourcePath}`, path: saved.file });
    }
    if (saved.data.tracking !== record.tracking) {
      diagnostics.push({ level: "error", code: "stale-source-record", message: `Recorded source tracking is stale: ${sourcePath}`, path: saved.file });
    }
  }
  for (const saved of sources.values()) {
    if (saved.data.tracking === "not-applicable") continue;
    const latest = allCurrent.get(saved.data.path);
    if ((!latest || latest.tracking === "missing") && saved.data.disposition !== "excluded" && (saved.data.tracking === "tracked" || saved.data.tracking === "untracked")) {
      diagnostics.push({ level: "error", code: "source-inventory-removed", message: `Recorded source is no longer eligible: ${saved.data.path}`, path: saved.file });
    } else if (latest?.disposition === "excluded" && saved.data.disposition !== "excluded") {
      diagnostics.push({ level: "error", code: "source-inventory-changed", message: `Source became excluded: ${saved.data.path}`, path: saved.file });
    }
  }
}
