import { readdir } from "node:fs/promises";
import path from "node:path";
import { atomicWrite, exists, readText } from "../core/fs.js";
import { parseMarkdown } from "../frontmatter/index.js";

async function markdownFiles(directory: string): Promise<string[]> {
  if (!(await exists(directory))) return [];
  const entries = await readdir(directory, { withFileTypes: true });
  const files: string[] = [];
  for (const entry of entries) {
    const target = path.join(directory, entry.name);
    if (entry.isDirectory()) files.push(...(await markdownFiles(target)));
    else if (entry.isFile() && entry.name.endsWith(".md")) files.push(target);
  }
  return files.sort();
}

function cell(value: unknown): string {
  if (Array.isArray(value)) return value.map(String).join(", ").replaceAll("|", "\\|");
  if (value && typeof value === "object") return Object.entries(value as Record<string, unknown>).map(([key, item]) => `${key} (${String(item)})`).join(", ").replaceAll("|", "\\|");
  return String(value ?? "—").replaceAll("|", "\\|").replaceAll("\n", " ");
}

async function records(directory: string, accept?: (file: string) => boolean): Promise<Array<{ relative: string; data: Record<string, unknown>; body: string }>> {
  const root = path.dirname(directory);
  const files = (await markdownFiles(directory)).filter((file) => !accept || accept(file));
  return Promise.all(files.map(async (file) => {
    const document = parseMarkdown(await readText(file));
    return { relative: path.relative(root, file), data: document.data, body: document.body };
  }));
}

function legacyReportMetadata(relative: string, body: string): Record<string, unknown> {
  const heading = body.match(/^#\s+(.+)$/m)?.[1]?.trim();
  return {
    id: `REPORT-${relative.replace(new RegExp(`^reports\\${path.sep}`), "").replace(/\.md$/, "").replaceAll(path.sep, "-").replace(/[^A-Za-z0-9-]/g, "-").toUpperCase()}`,
    title: heading || path.basename(relative, ".md"),
    status: "unclassified",
    features: [],
  };
}

export async function buildIndexes(projectRoot: string): Promise<Map<string, string>> {
  const doc = path.join(projectRoot, "doc");
  const features = await records(path.join(doc, "features"), (file) => path.basename(file) === "FEATURE.md");
  const requirements = await records(path.join(doc, "requirements"));
  const backlog = await records(path.join(doc, "backlog"));
  const active = await records(path.join(doc, "active"));
  const decisions = (await records(path.join(doc, "decisions"))).filter(({ data }) => typeof data.id === "string");
  const reports = (await records(path.join(doc, "reports"))).map(({ relative, data, body }) => ({ relative, data: typeof data.id === "string" ? data : legacyReportMetadata(relative, body) }));
  const sources = await records(path.join(doc, "sources"));
  return new Map([
    [path.join(doc, "FEATURES.md"), render("Feature Registry", ["Feature", "Purpose", "Ownership", "Dependencies", "Context"], features.map(({ relative, data }) => [data.name, data.description, data.owns, data.depends_on, relative]))],
    [path.join(doc, "REQUIREMENTS.md"), render("Requirement Registry", ["ID", "Requirement", "Feature", "Status", "Context"], requirements.map(({ relative, data }) => [data.id, data.title, data.feature, data.status, relative]))],
    [path.join(doc, "BACKLOG.md"), render("Backlog Registry", ["ID", "Proposal", "Elevator pitch", "Status", "Features", "Related", "Conflicts", "Context"], backlog.map(({ relative, data }) => [data.id, data.title, data.pitch, data.status, data.features, data.related, data.conflicts, relative]))],
    [path.join(doc, "ACTIVE.md"), render("Active Work Registry", ["ID", "Objective", "Status", "Features", "Backlog", "Tasks", "Context"], active.map(({ relative, data }) => [data.id, data.objective, data.status, data.features, data.backlog, data.tasks, relative]))],
    [path.join(doc, "DECISIONS.md"), render("Decision Registry", ["ID", "Decision", "Status", "Features", "Context"], decisions.map(({ relative, data }) => [data.id, data.title, data.status, data.features, relative]))],
    [path.join(doc, "REPORTS.md"), render("Report Registry", ["ID", "Report", "Status", "Features", "Context"], reports.map(({ relative, data }) => [data.id, data.title, data.status, data.features, relative]))],
    [path.join(doc, "SOURCES.md"), render("Source Provenance Registry", ["ID", "Path", "Kind", "Tracking", "Disposition", "Reason", "Record"], sources.map(({ relative, data }) => [data.id, data.path, data.kind, data.tracking, data.disposition, data.reason, relative]))],
  ]);
}

export async function rebuildIndexes(projectRoot: string): Promise<void> {
  for (const [target, contents] of await buildIndexes(projectRoot)) await atomicWrite(target, contents);
}

function render(title: string, headers: string[], rows: unknown[][]): string {
  const header = `| ${headers.join(" | ")} |\n|${headers.map(() => "---").join("|")}|`;
  const body = rows.length ? rows.map((row) => `| ${row.map(cell).join(" | ")} |`).join("\n") : `| ${headers.map(() => "—").join(" | ")} |`;
  return `# ${title}\n\n> Generated from canonical frontmatter. Rebuild safely; do not store unique knowledge here.\n\n${header}\n${body}\n`;
}
