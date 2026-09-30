import { layoutPaths } from "../core/layout.js";
import { readdir } from "node:fs/promises";
import path from "node:path";
import { atomicWrite, exists, readText } from "../core/fs.js";
import { isForwarder } from "../core/records.js";
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
  return (await Promise.all(files.map(async (file) => {
    const document = parseMarkdown(await readText(file));
    return { relative: path.relative(root, file), data: document.data, body: document.body };
  }))).filter(({ data }) => !isForwarder(data)).sort((a, b) => String(a.data.id ?? a.data.name ?? a.relative).localeCompare(String(b.data.id ?? b.data.name ?? b.relative)));
}

function backlogLane(status: unknown): number {
  return status === "proposed" || status === "planned" ? 0 : status === "active" ? 1 : status === "deferred" ? 2 : 3;
}

function backlogOrder(rows: Array<{ relative: string; data: Record<string, unknown> }>): typeof rows {
  return rows.sort((a, b) => {
    const lane = backlogLane(a.data.status) - backlogLane(b.data.status);
    if (lane) return lane;
    if (backlogLane(a.data.status) === 0) {
      const aRank = typeof a.data.queue_position === "number" ? a.data.queue_position : Number.POSITIVE_INFINITY;
      const bRank = typeof b.data.queue_position === "number" ? b.data.queue_position : Number.POSITIVE_INFINITY;
      if (aRank !== bRank) return aRank < bRank ? -1 : 1;
    }
    return String(a.data.id).localeCompare(String(b.data.id));
  });
}

function laneLabel(status: unknown): string {
  return backlogLane(status) === 0 ? "Next up" : backlogLane(status) === 1 ? "In progress" : backlogLane(status) === 2 ? "Deferred" : "History";
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
  const layout = layoutPaths(projectRoot);
  if (layout.compact) return buildCompactIndexes(projectRoot);
  const doc = layout.docs;
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
    [path.join(doc, "BACKLOG.md"), render("Backlog Registry", ["Lane", "Position", "ID", "Proposal", "Elevator pitch", "Status", "Features", "Related", "Conflicts", "Context"], backlogOrder(backlog).map(({ relative, data }) => [laneLabel(data.status), backlogLane(data.status) === 0 ? data.queue_position : null, data.id, data.title, data.pitch, data.status, data.features, data.related, data.conflicts, relative]))],
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

async function buildCompactIndexes(root: string): Promise<Map<string, string>> {
  const p = layoutPaths(root);
  const result = new Map<string, string>();
  for (const name of ["features", "requirements", "decisions", "reports", "sources"] as const) {
    const directory = p[name];
    const target = p.indexes[name];
    const rows = (await records(directory, file => path.basename(file) !== "INDEX.md" && (name !== "features" || path.basename(file) === p.featureFile)))
      .filter(row => typeof (row.data.id ?? row.data.name) === "string");
    const links = rows.map(row => {
      const file = path.resolve(path.dirname(directory), row.relative);
      const relative = path.relative(path.dirname(target), file).split(path.sep).join("/");
      const label = String(row.data.title ?? row.data.name ?? row.data.path ?? row.data.id).replaceAll("[", "\\[").replaceAll("]", "\\]");
      return [row.data.id ?? row.data.name, `[${label}](${relative})`, row.data.status ?? row.data.disposition, name === "sources" ? row.data.reason : row.data.feature ?? row.data.features];
    });
    result.set(target, render(name[0].toUpperCase() + name.slice(1), ["ID", "Document", "Status", name === "sources" ? "Reason" : "Features"], links));
  }
  const work = (await records(p.work)).filter(row => typeof row.data.id === "string");
  const sort = (a: typeof work[number], b: typeof work[number]) => Number(a.data.order ?? Infinity) - Number(b.data.order ?? Infinity) || String(a.data.id).localeCompare(String(b.data.id));
  let body = "# Work\n\nGenerated from canonical work/items frontmatter. Item metadata is authoritative; do not maintain a second schedule.\n";
  for (const [title, statuses] of [["Queue", ["proposed", "planned"]], ["Current execution", ["active", "blocked"]], ["Completed and merged", ["done", "merged"]]] as const) {
    const rows = work.filter(row => (statuses as readonly unknown[]).includes(row.data.status)).sort(sort);
    body += `\n## ${title}\n\n| Order | Work item | Status | ID |\n|---|---|---|---|\n`;
    for (const row of rows) body += `| ${cell(row.data.order)} | [${cell(row.data.title)}](${row.relative.split(path.sep).join("/")}) | ${cell(row.data.status)} | ${cell(row.data.id)} |\n`;
    if (!rows.length) body += "| — | None | — | — |\n";
  }
  result.set(p.indexes.work, body);
  return result;
}
