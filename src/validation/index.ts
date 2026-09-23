import { readdir } from "node:fs/promises";
import path from "node:path";
import { buildIndexes } from "../indexing/index.js";
import { exists, readText, within } from "../core/fs.js";
import type { Diagnostic } from "../core/types.js";
import { parseMarkdown } from "../frontmatter/index.js";
import { featureSchema, requirementSchema, shelfSchema, sourceSchema } from "../frontmatter/schemas.js";

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
  for (const required of ["AGENTS.md", "CONTEXT_MAP.md", "PROJECT.md", "doc/ARCHITECTURE.md", ".deep-context/state.json"]) {
    if (!(await exists(path.join(projectRoot, required)))) diagnostics.push({ level: "error", code: "missing-required", message: `Missing required file: ${required}`, path: required });
  }
  const featureFiles = await files(path.join(projectRoot, "doc/features"), "FEATURE.md");
  const requirementFiles = await files(path.join(projectRoot, "doc/requirements"));
  const shelfFiles = await files(path.join(projectRoot, "doc/shelf"));
  const sourceFiles = await files(path.join(projectRoot, "doc/sources"));
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
  const sources = new Map<string, { file: string; data: ReturnType<typeof sourceSchema.parse> }>();
  await parseCollection(sourceFiles, sourceSchema, "id", sources);

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
  for (const [target, expected] of await buildIndexes(projectRoot)) {
    if (!(await exists(target)) || (await readText(target)) !== expected) diagnostics.push({ level: "error", code: "stale-index", message: `Generated index is stale: ${path.relative(projectRoot, target)}`, path: target });
  }
  return diagnostics;
}
