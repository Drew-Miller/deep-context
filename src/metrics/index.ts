import { layoutPaths } from "../core/layout.js";
import { randomUUID } from "node:crypto";
import { createReadStream } from "node:fs";
import { lstat, readdir } from "node:fs/promises";
import path from "node:path";
import { createInterface } from "node:readline";
import { atomicWrite, exists, readText, within } from "../core/fs.js";
import { isForwarder, markdownRecords } from "../core/records.js";
import type { ContextLevel } from "../core/types.js";
import { parseMarkdown } from "../frontmatter/index.js";
import { selectFeatureContext } from "../routing/index.js";
import { validateProject } from "../validation/index.js";

const ROUTING_FILES = ["AGENTS.md", "CONTEXT_MAP.md", "PROJECT.md", "doc/FEATURES.md", "doc/REQUIREMENTS.md", "doc/BACKLOG.md", "doc/ACTIVE.md", "doc/DECISIONS.md", "doc/REPORTS.md"];

async function canonicalMarkdownFiles(directory: string): Promise<string[]> {
  return (await markdownRecords(directory)).filter(({ data }) => !isForwarder(data)).filter(({ file }) => path.basename(file) !== "INDEX.md").map(({ file }) => file);
}

async function sizeOf(root: string, relative: string): Promise<number> {
  const target = path.resolve(root, relative);
  if (!within(root, target)) throw new Error(`Metric path escapes project: ${relative}`);
  const info = await lstat(target);
  if (!info.isFile()) throw new Error(`Metric path is not a regular file: ${relative}`);
  return info.size;
}

function estimateTokens(bytes: number): number {
  return Math.ceil(bytes / 4);
}

export interface UsageTotals {
  completedTurns: number;
  inputTokens: number;
  cachedInputTokens: number;
  outputTokens: number;
  reasoningOutputTokens: number;
  totalTokens: number;
}

export async function readCodexUsage(file: string): Promise<UsageTotals> {
  const totals: UsageTotals = { completedTurns: 0, inputTokens: 0, cachedInputTokens: 0, outputTokens: 0, reasoningOutputTokens: 0, totalTokens: 0 };
  const stream = createReadStream(file, { encoding: "utf8" });
  const lines = createInterface({ input: stream, crlfDelay: Infinity });
  let lineNumber = 0;
  for await (const line of lines) {
    lineNumber++;
    if (!line.trim()) continue;
    let event: unknown;
    try { event = JSON.parse(line); }
    catch { throw new Error(`Invalid JSONL at line ${lineNumber}`); }
    if (!event || typeof event !== "object" || (event as { type?: unknown }).type !== "turn.completed") continue;
    const usage = (event as { usage?: Record<string, unknown> }).usage;
    if (!usage || typeof usage !== "object") throw new Error(`Missing usage at line ${lineNumber}`);
    const count = (key: string, optional = false): number => {
      const value = usage[key];
      if (optional && value === undefined) return 0;
      if (typeof value !== "number" || !Number.isSafeInteger(value) || value < 0) throw new Error(`Invalid ${key} at line ${lineNumber}`);
      return value;
    };
    const input = count("input_tokens");
    const cached = count("cached_input_tokens", true);
    const output = count("output_tokens");
    const reasoning = count("reasoning_output_tokens", true);
    if (cached > input || reasoning > output) throw new Error(`Inconsistent usage at line ${lineNumber}`);
    totals.completedTurns++;
    totals.inputTokens += input;
    totals.cachedInputTokens += cached;
    totals.outputTokens += output;
    totals.reasoningOutputTokens += reasoning;
  }
  if (!totals.completedTurns) throw new Error("JSONL contains no completed turns with usage");
  totals.totalTokens = totals.inputTokens + totals.outputTokens;
  return totals;
}

export async function projectStats(root: string, feature?: string, level: ContextLevel = "feature", usageFile?: string) {
  const layout = layoutPaths(root);
  const doc = layout.docs;
  const featureDocs = await canonicalMarkdownFiles(path.join(doc, "features"));
  const featureFiles = featureDocs.filter((file) => path.basename(file) === layout.featureFile);
  const requirements = await canonicalMarkdownFiles(path.join(doc, "requirements"));
  const decisions = await canonicalMarkdownFiles(path.join(doc, "decisions"));
  const reports = await canonicalMarkdownFiles(path.join(doc, "reports"));
  const backlog = await canonicalMarkdownFiles(layout.work);
  const active = layout.compact ? backlog : await canonicalMarkdownFiles(layout.active);
  const sources = await canonicalMarkdownFiles(layout.sources);
  const selected = feature ? await selectFeatureContext(root, { [feature]: level }) : null;
  const selectedBytes = selected ? (await Promise.all(selected.files.map((file) => sizeOf(root, file)))).reduce((a, b) => a + b, 0) : null;
  const routableFiles = [...featureDocs, ...requirements, ...decisions, ...reports];
  const routableBytes = (await Promise.all(routableFiles.map((file) => sizeOf(root, path.relative(root, file))))).reduce((a, b) => a + b, 0);
  const routingBytes = (await Promise.all((layout.compact ? ["AGENTS.md", "CONTEXT_MAP.md", "PROJECT.md", ...Object.values(layout.indexes).map(file => path.relative(root, file))] : ROUTING_FILES).map(async (file) => await exists(path.join(root, file)) ? sizeOf(root, file) : 0))).reduce((a, b) => a + b, 0);
  const diagnostics = await validateProject(root);
  const errorsByCode: Record<string, number> = {};
  for (const item of diagnostics) if (item.level === "error") errorsByCode[item.code] = (errorsByCode[item.code] ?? 0) + 1;
  const countStatus = async (files: string[], status: string) => (await Promise.all(files.map(async (file) => parseMarkdown(await readText(file)).data.status === status))).filter(Boolean).length;
  const linkedRequirements = (await Promise.all(requirements.map(async (file) => Boolean(parseMarkdown(await readText(file)).data.feature)))).filter(Boolean).length;
  const linkedReports = (await Promise.all(reports.map(async (file) => {
    const features = parseMarkdown(await readText(file)).data.features;
    return Array.isArray(features) && features.length > 0;
  }))).filter(Boolean).length;
  const closureReports = (await canonicalMarkdownFiles(path.join(doc, "reports", "closures"))).length;
  const sourcesNeedingReview = (await Promise.all(sources.map(async (file) => parseMarkdown(await readText(file)).data.disposition === "review"))).filter(Boolean).length;
  return {
    schemaVersion: 1,
    kind: "deep-context-stats" as const,
    generatedAt: new Date().toISOString(),
    projectRoot: root,
    documents: { features: featureFiles.length, requirements: requirements.length, requirementsWithFeature: linkedRequirements, decisions: decisions.length, reports: reports.length, reportsWithFeature: linkedReports, closureReports, workItems: backlog.length, backlog: layout.compact ? await countStatus(backlog, "proposed") + await countStatus(backlog, "planned") : backlog.length, active: await countStatus(active, "active"), completedObjectives: await countStatus(active, "done"), sourcesNeedingReview },
    health: { valid: diagnostics.every((item) => item.level !== "error"), errorCount: Object.values(errorsByCode).reduce((a, b) => a + b, 0), errorsByCode },
    context: { feature: feature ?? null, level: feature ? level : null, selectedFiles: selected?.files ?? [], selectedBytes, estimatedSelectedTokens: selectedBytes === null ? null : estimateTokens(selectedBytes), routableCorpusFiles: routableFiles.length, routableCorpusBytes: routableBytes, routingBytes, estimatedRoutingTokens: estimateTokens(routingBytes), selectionReductionPercent: selectedBytes === null || !routableBytes ? null : Math.round((1 - (selectedBytes + routingBytes) / (routableBytes + routingBytes)) * 1000) / 10 },
    usage: usageFile ? await readCodexUsage(usageFile) : null,
    measurementNotes: ["Selected context measures router recommendations, not confirmed model reads.", "Selection reduction includes the same fixed routing reference set on both sides; it is a byte comparison, not measured token savings.", "Token estimates use bytes divided by four and are not billing or quota usage.", "Cached input and reasoning output are subsets of input and output; totals do not add them again.", "Document links and mechanical validation do not establish semantic correctness."]
  };
}

export async function compareUsage(baselineFile: string, deepFile: string, baselineScore: number, deepScore: number) {
  for (const score of [baselineScore, deepScore]) if (!Number.isFinite(score) || score < 0 || score > 1) throw new Error("Benchmark scores must be between 0 and 1");
  const [baseline, deepContext] = await Promise.all([readCodexUsage(baselineFile), readCodexUsage(deepFile)]);
  return {
    schemaVersion: 1,
    kind: "deep-context-comparison" as const,
    generatedAt: new Date().toISOString(),
    baseline,
    deepContext,
    baselineScore,
    deepScore,
    qualityMaintained: deepScore >= baselineScore,
    inputReductionPercent: baseline.inputTokens ? Math.round((1 - deepContext.inputTokens / baseline.inputTokens) * 1000) / 10 : null,
    totalReductionPercent: baseline.totalTokens ? Math.round((1 - deepContext.totalTokens / baseline.totalTokens) * 1000) / 10 : null,
    measurementNotes: ["Scores are supplied by the evaluator; this command does not grade answers.", "Compare the same task, model, reasoning settings, and source revision; these are not verified from JSONL.", "Installation, documentation maintenance, and benchmark setup costs are not included."]
  };
}

export async function recordMetrics(root: string, report: object): Promise<string> {
  const target = path.join(root, ".local", "metrics", `${new Date().toISOString().replaceAll(":", "-")}-${randomUUID()}.json`);
  await atomicWrite(target, `${JSON.stringify(report, null, 2)}\n`);
  return target;
}

export async function metricsHistory(root: string, limit = 20) {
  if (!Number.isSafeInteger(limit) || limit < 1 || limit > 1000) throw new Error("History limit must be an integer from 1 to 1000");
  const directory = path.join(root, ".local", "metrics");
  if (!(await exists(directory))) return [];
  const names = (await readdir(directory)).filter((name) => name.endsWith(".json")).sort().reverse().slice(0, limit);
  return Promise.all(names.map(async (name) => {
    const document = JSON.parse(await readText(path.join(directory, name))) as Record<string, unknown>;
    if (document.schemaVersion !== 1 || !["deep-context-stats", "deep-context-comparison"].includes(String(document.kind)) || typeof document.generatedAt !== "string") throw new Error(`Invalid metrics snapshot: ${name}`);
    if (document.kind === "deep-context-stats") {
      const context = document.context as { feature?: string | null; selectionReductionPercent?: number | null } | undefined;
      const health = document.health as { errorCount?: number } | undefined;
      const usage = document.usage as { totalTokens?: number } | null | undefined;
      return { file: name, kind: document.kind, generatedAt: document.generatedAt, feature: context?.feature ?? null, contextReductionPercent: context?.selectionReductionPercent ?? null, validationErrors: health?.errorCount ?? null, measuredTokens: usage?.totalTokens ?? null };
    }
    return { file: name, kind: document.kind, generatedAt: document.generatedAt, baselineScore: document.baselineScore, deepScore: document.deepScore, qualityMaintained: document.qualityMaintained, tokenReductionPercent: document.totalReductionPercent };
  }));
}
