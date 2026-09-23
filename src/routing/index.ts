import { readdir } from "node:fs/promises";
import path from "node:path";
import { exists, readText } from "../core/fs.js";
import type { ContextLevel } from "../core/types.js";
import { parseMarkdown } from "../frontmatter/index.js";
import { decisionSchema, featureSchema, reportSchema, requirementSchema } from "../frontmatter/schemas.js";

export interface ContextSelection {
  levels: Record<string, ContextLevel>;
  files: string[];
}

async function canonicalFiles(directory: string): Promise<string[]> {
  if (!(await exists(directory))) return [];
  const entries = await readdir(directory, { withFileTypes: true });
  const files: string[] = [];
  for (const entry of entries) {
    const target = path.join(directory, entry.name);
    if (entry.isDirectory()) files.push(...(await canonicalFiles(target)));
    else if (entry.isFile() && entry.name.endsWith(".md")) files.push(target);
  }
  return files.sort();
}

async function featureRecords(projectRoot: string, directory: string, schema: typeof decisionSchema | typeof reportSchema): Promise<Map<string, string[]>> {
  const records = new Map<string, string[]>();
  for (const file of await canonicalFiles(directory)) {
    const document = parseMarkdown(await readText(file));
    if (typeof document.data.id !== "string") continue;
    const data = schema.parse(document.data);
    for (const feature of data.features) {
      const files = records.get(feature) ?? [];
      files.push(path.relative(projectRoot, file));
      records.set(feature, files);
    }
  }
  return records;
}

export async function selectFeatureContext(projectRoot: string, requested: Record<string, ContextLevel>): Promise<ContextSelection> {
  const featureRoot = path.join(projectRoot, "doc", "features");
  const definitions = new Map<string, { directory: string; data: ReturnType<typeof featureSchema.parse> }>();
  const requirementPaths = new Map<string, string>();
  const ownedRequirements = new Map<string, string[]>();
  if (await exists(featureRoot)) {
    for (const entry of await readdir(featureRoot, { withFileTypes: true })) {
      if (!entry.isDirectory()) continue;
      const file = path.join(featureRoot, entry.name, "FEATURE.md");
      if (!(await exists(file))) continue;
      const data = featureSchema.parse(parseMarkdown(await readText(file)).data);
      definitions.set(data.name, { directory: path.dirname(file), data });
    }
  }
  const requirementsRoot = path.join(projectRoot, "doc", "requirements");
  if (await exists(requirementsRoot)) {
    for (const entry of await readdir(requirementsRoot, { withFileTypes: true })) {
      if (!entry.isFile() || !entry.name.endsWith(".md")) continue;
      const file = path.join(requirementsRoot, entry.name);
      const parsed = parseMarkdown(await readText(file)).data;
      if (typeof parsed.id !== "string") continue;
      const data = requirementSchema.parse(parsed);
      const relative = path.relative(projectRoot, file);
      requirementPaths.set(data.id, relative);
      if (data.feature) {
        const requirements = ownedRequirements.get(data.feature) ?? [];
        requirements.push(relative);
        ownedRequirements.set(data.feature, requirements);
      }
    }
  }

  const levels: Record<string, ContextLevel> = {};
  for (const [name, level] of Object.entries(requested)) {
    if (!definitions.has(name)) throw new Error(`Unknown feature: ${name}`);
    levels[name] = level;
  }
  for (const [name, level] of Object.entries(requested)) {
    if (level === "none") continue;
    const feature = definitions.get(name)!;
    for (const [dependency, dependencyLevel] of Object.entries(feature.data.depends_on)) {
      if (!definitions.has(dependency)) throw new Error(`Feature ${name} references unknown dependency ${dependency}`);
      if (!(dependency in levels)) levels[dependency] = dependencyLevel;
    }
  }

  const files = new Set<string>();
  const decisions = await featureRecords(projectRoot, path.join(projectRoot, "doc", "decisions"), decisionSchema);
  const reports = await featureRecords(projectRoot, path.join(projectRoot, "doc", "reports"), reportSchema);
  for (const [name, level] of Object.entries(levels)) {
    if (level === "none") continue;
    const feature = definitions.get(name)!;
    if (level === "contract") {
      for (const contract of feature.data.contracts) files.add(contract);
    } else {
      files.add(path.relative(projectRoot, path.join(feature.directory, "FEATURE.md")));
      for (const contract of feature.data.contracts) files.add(contract);
      for (const requirement of feature.data.requirements ?? []) files.add(requirementPaths.get(requirement) ?? requirement);
      for (const requirement of ownedRequirements.get(name) ?? []) files.add(requirement);
      if (level === "deep") {
        for (const decision of decisions.get(name) ?? []) files.add(decision);
        for (const report of reports.get(name) ?? []) files.add(report);
      }
    }
  }
  return { levels, files: [...files].sort() };
}
