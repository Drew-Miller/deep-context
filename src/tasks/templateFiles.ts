import { renderTemplate } from "../core/template.js";

export function taskAgents(task: string): string {
  return renderTemplate("task/AGENTS.md.template", { TASK_NAME: task });
}

export function taskContext(task: string, description: string, base: string, feature?: string): string {
  return renderTemplate("task/TASK_CONTEXT.md.template", {
    TASK_NAME: task,
    BASE_REF: base,
    PRIMARY_FEATURE_LINE: feature ? `primary_feature: ${feature}\n` : "",
    DESCRIPTION: description || "Describe the desired outcome.",
  });
}

export function contextManifest(task: string, levels: Record<string, string>, files: string[]): string {
  const featureYaml = Object.keys(levels).length ? `\n${Object.entries(levels).map(([name, level]) => `  ${name}: ${level}`).join("\n")}` : " {}";
  const selected = files.length ? files.map((file) => `- ../../${file}`).join("\n") : "- No feature bodies selected yet.";
  return renderTemplate("task/CONTEXT_MANIFEST.md.template", { TASK_NAME: task, FEATURES_YAML: featureYaml, SELECTED_FILES: selected });
}

export function taskState(task: string, branch: string, baseRef: string, baseCommit: string): string {
  const now = new Date().toISOString();
  return renderTemplate("task/TASK_STATE.md.template", { TASK_NAME: task, BRANCH: branch, BASE_REF: baseRef, BASE_COMMIT: baseCommit, TIMESTAMP: now });
}
