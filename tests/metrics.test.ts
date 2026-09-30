import { mkdtemp, mkdir, readFile, rm, writeFile } from "node:fs/promises";
import os from "node:os";
import path from "node:path";
import { afterEach, describe, expect, it } from "vitest";
import { canonicalRecordById } from "../src/core/records.js";
import { parseMarkdown, renderMarkdown } from "../src/frontmatter/index.js";
import { buildIndexes } from "../src/indexing/index.js";
import { migrateFilenames } from "../src/migration/filenames.js";
import { compareUsage, metricsHistory, projectStats, readCodexUsage, recordMetrics } from "../src/metrics/index.js";
import { legacyInitProject as initProject } from "./legacy-fixture.js";

const cleanup: string[] = [];
afterEach(async () => Promise.all(cleanup.splice(0).map((target) => rm(target, { recursive: true, force: true }))));

async function fixture(): Promise<string> {
  const home = await mkdtemp(path.join(os.tmpdir(), "deep-metrics-"));
  cleanup.push(home);
  const root = await initProject(home, { name: "Metrics Fixture" });
  for (const name of ["selected", "other"]) {
    const directory = path.join(root, "doc", "features", name);
    await mkdir(directory, { recursive: true });
    await writeFile(path.join(directory, "FEATURE.md"), `---\nname: ${name}\ndescription: ${name}\nstatus: active\ncontracts: [doc/features/${name}/CONTRACTS.md]\ndepends_on: {}\n---\n\n# ${name}\n`);
    await writeFile(path.join(directory, "CONTRACTS.md"), `# ${name} contract\n`);
  }
  await writeFile(path.join(root, "doc", "requirements", "REQ-METRICS.md"), "---\nid: REQ-METRICS\ntitle: Metrics\nstatus: active\nfeature: selected\norigin: confirmed\n---\n\n# Metrics\n");
  for (const [target, contents] of await buildIndexes(root)) await writeFile(target, contents);
  return root;
}

describe("deep metrics", () => {
  it("measures bounded context and durable document links without counting unrelated feature content", async () => {
    const root = await fixture();
    const report = await projectStats(root, "selected", "feature");
    expect(report.documents.features).toBe(2);
    expect(report.documents.requirementsWithFeature).toBe(1);
    expect(report.health.valid).toBe(true);
    expect(report.context.selectedFiles).toContain("doc/requirements/REQ-METRICS.md");
    expect(report.context.selectedFiles.join(" ")).not.toContain("other");
    expect(report.context.selectedBytes).toBeGreaterThan(0);
    expect(report.context.routableCorpusBytes).toBeGreaterThan(report.context.selectedBytes!);
    const target = await recordMetrics(root, report);
    expect(target).toContain("/.local/metrics/");
    expect(JSON.parse(await readFile(target, "utf8")).documents.features).toBe(2);
    const history = await metricsHistory(root);
    expect(history).toHaveLength(1);
    expect(history[0]).toMatchObject({ kind: "deep-context-stats", feature: "selected", validationErrors: 0, measuredTokens: null });
  });

  it("excludes migrated forwarders from canonical counts and corpus bytes while retaining legacy reports", async () => {
    const root = await fixture();
    await writeFile(path.join(root, "doc", "backlog", "BACKLOG-METRICS.md"), renderMarkdown({
      id: "BACKLOG-METRICS", title: "Metrics backlog", pitch: "Measure context", status: "proposed",
      features: [], tokens: [], provenance: "Fixture", related: [], conflicts: [],
    }, "# Metrics backlog\n"));
    await writeFile(path.join(root, "doc", "decisions", "DEC-METRICS.md"), renderMarkdown({
      id: "DEC-METRICS", title: "Metrics decision", status: "accepted", features: ["selected"],
    }, "# Metrics decision\n"));
    await writeFile(path.join(root, "doc", "reports", "REPORT-METRICS.md"), renderMarkdown({
      id: "REPORT-METRICS", title: "Metrics report", status: "accepted", features: ["selected"],
    }, "# Metrics report\n"));
    const legacyReport = path.join(root, "doc", "reports", "historical-note.md");
    await writeFile(legacyReport, "# Historical note\n\nLegacy report without an ID.\n");
    for (const [target, contents] of await buildIndexes(root)) await writeFile(target, contents);

    const before = await projectStats(root, "selected", "deep");
    expect(before.health.valid).toBe(true);
    expect(before.documents).toMatchObject({ requirements: 1, decisions: 1, reports: 2, backlog: 1 });

    const migration = await migrateFilenames(root, { apply: true });
    expect(migration.moves.map(({ id }) => id).sort()).toEqual(["BACKLOG-METRICS", "DEC-METRICS", "REPORT-METRICS", "REQ-METRICS"]);
    expect(migration.exceptions).toContain("doc/reports/historical-note.md");
    const after = await projectStats(root, "selected", "deep");
    expect(after.health.valid).toBe(true);
    expect(after.documents).toMatchObject({ requirements: 1, decisions: 1, reports: 2, backlog: 1 });
    expect(after.context.routableCorpusFiles).toBe(before.context.routableCorpusFiles);
    expect(after.context.routableCorpusBytes).toBe(before.context.routableCorpusBytes);
    expect(after.context.selectedBytes).toBe(before.context.selectedBytes);
    expect(await readFile(legacyReport, "utf8")).toContain("Legacy report without an ID.");

    const oldReport = path.join(root, "doc", "reports", "REPORT-METRICS.md");
    const malformedForwarder = parseMarkdown(await readFile(oldReport, "utf8"));
    malformedForwarder.data.id = "REPORT-METRICS";
    malformedForwarder.data.features = ["selected"];
    await writeFile(oldReport, renderMarkdown(malformedForwarder.data, malformedForwarder.body));
    const guarded = await projectStats(root, "selected", "deep");
    expect(guarded.documents.reports).toBe(2);
    expect(guarded.context.routableCorpusBytes).toBe(after.context.routableCorpusBytes);
    expect(guarded.context.selectedFiles).not.toContain("doc/reports/REPORT-METRICS.md");
    expect(guarded.health.errorsByCode["invalid-forwarder"]).toBe(1);
    expect(await canonicalRecordById(path.join(root, "doc", "reports"), "REPORT-METRICS")).toBe(path.join(root, migration.moves.find(({ id }) => id === "REPORT-METRICS")!.to));
  });

  it("reports structural errors without claiming semantic accuracy", async () => {
    const root = await fixture();
    await writeFile(path.join(root, "doc", "FEATURES.md"), "stale\n");
    const report = await projectStats(root);
    expect(report.health.valid).toBe(false);
    expect(report.health.errorsByCode["stale-index"]).toBeGreaterThan(0);
    expect(report.usage).toBeNull();
  });

  it("sums measured Codex turns without double counting cached or reasoning tokens", async () => {
    const directory = await mkdtemp(path.join(os.tmpdir(), "deep-metrics-usage-"));
    cleanup.push(directory);
    const file = path.join(directory, "run.jsonl");
    await writeFile(file, [
      JSON.stringify({ type: "thread.started", thread_id: "fixture" }),
      JSON.stringify({ type: "turn.completed", usage: { input_tokens: 100, cached_input_tokens: 60, output_tokens: 20, reasoning_output_tokens: 8 } }),
      JSON.stringify({ type: "turn.completed", usage: { input_tokens: 50, cached_input_tokens: 10, output_tokens: 5, reasoning_output_tokens: 0 } }),
    ].join("\n"));
    expect(await readCodexUsage(file)).toEqual({ completedTurns: 2, inputTokens: 150, cachedInputTokens: 70, outputTokens: 25, reasoningOutputTokens: 8, totalTokens: 175 });
    const deep = path.join(directory, "deep.jsonl");
    await writeFile(deep, `${JSON.stringify({ type: "turn.completed", usage: { input_tokens: 75, cached_input_tokens: 40, output_tokens: 15 } })}\n`);
    const comparison = await compareUsage(file, deep, 0.9, 0.9);
    expect(comparison.qualityMaintained).toBe(true);
    expect(comparison.totalReductionPercent).toBe(48.6);
    expect((await compareUsage(file, deep, 1, 0.5)).qualityMaintained).toBe(false);
    await expect(compareUsage(file, deep, 1.2, 1)).rejects.toThrow("scores");
  });

  it("rejects invalid token counters and JSONL without completed turns", async () => {
    const directory = await mkdtemp(path.join(os.tmpdir(), "deep-metrics-invalid-"));
    cleanup.push(directory);
    const file = path.join(directory, "run.jsonl");
    await writeFile(file, `${JSON.stringify({ type: "turn.completed", usage: { input_tokens: 10, cached_input_tokens: 11, output_tokens: 1 } })}\n`);
    await expect(readCodexUsage(file)).rejects.toThrow("Inconsistent usage");
    await writeFile(file, '{"type":"thread.started"}\n');
    await expect(readCodexUsage(file)).rejects.toThrow("no completed turns");
  });
});
