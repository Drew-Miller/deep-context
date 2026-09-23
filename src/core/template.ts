import { existsSync, readFileSync } from "node:fs";
import path from "node:path";
import { fileURLToPath } from "node:url";

const moduleDirectory = path.dirname(fileURLToPath(import.meta.url));

function templateRoot(): string {
  const candidates = [
    process.env.DEEP_CONTEXT_TEMPLATE_ROOT,
    path.resolve(moduleDirectory, "../templates"),
    path.resolve(moduleDirectory, "../../templates"),
    path.resolve(moduleDirectory, "../../../templates"),
    path.resolve(process.cwd(), "templates"),
  ].filter((candidate): candidate is string => Boolean(candidate));
  const root = candidates.find((candidate) => existsSync(candidate));
  if (!root) throw new Error("Deep Context templates directory could not be resolved");
  return root;
}

export function renderTemplate(relative: string, values: Record<string, string>): string {
  let contents = readFileSync(path.join(templateRoot(), relative), "utf8");
  for (const [key, value] of Object.entries(values)) contents = contents.replaceAll(`{{${key}}}`, value);
  const unresolved = contents.match(/\{\{[A-Z0-9_]+\}\}/g);
  if (unresolved) throw new Error(`Unresolved template values in ${relative}: ${unresolved.join(", ")}`);
  return contents.endsWith("\n") ? contents : `${contents}\n`;
}
