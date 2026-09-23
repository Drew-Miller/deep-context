import { readdir } from "node:fs/promises";
import path from "node:path";
import { exists, readText } from "../core/fs.js";
import type { ContextLevel } from "../core/types.js";
import { parseMarkdown } from "../frontmatter/index.js";
import { featureSchema } from "../frontmatter/schemas.js";

export interface ContextSelection {
  levels: Record<string, ContextLevel>;
  files: string[];
}

export async function selectFeatureContext(projectRoot: string, requested: Record<string, ContextLevel>): Promise<ContextSelection> {
  const featureRoot = path.join(projectRoot, "doc", "features");
  const definitions = new Map<string, { directory: string; data: ReturnType<typeof featureSchema.parse> }>();
  const requirementPaths = new Map<string, string>();
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
      if (typeof parsed.id === "string") requirementPaths.set(parsed.id, path.relative(projectRoot, file));
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
  for (const [name, level] of Object.entries(levels)) {
    if (level === "none") continue;
    const feature = definitions.get(name)!;
    if (level === "contract") {
      for (const contract of feature.data.contracts) files.add(contract);
    } else {
      files.add(path.relative(projectRoot, path.join(feature.directory, "FEATURE.md")));
      for (const contract of feature.data.contracts) files.add(contract);
      for (const requirement of feature.data.requirements ?? []) files.add(requirementPaths.get(requirement) ?? requirement);
    }
  }
  return { levels, files: [...files].sort() };
}
