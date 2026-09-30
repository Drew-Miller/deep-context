import { existsSync, lstatSync, readFileSync } from "node:fs";
import path from "node:path";

/** Detect live canonical roots only. Archives and legacy docs/plan are not layout markers. */
export function layoutPaths(root: string) {
  root = path.resolve(root);
  const at = (name: string) => path.join(root, name);
  const journal = at(".local/layout-operation.json");
  if (existsSync(journal) && JSON.parse(readFileSync(journal,"utf8")).status !== "committed") throw new Error("Layout migration is incomplete; run repair-layout");
  let marker: unknown;
  if (existsSync(at(".local/state.json"))) {
    const state = JSON.parse(readFileSync(at(".local/state.json"), "utf8"));
    marker = state.layout ?? state.manualLayout;
    if (marker !== undefined && marker !== "compact-v1" && marker !== "legacy") throw new Error(`Unsupported context layout: ${String(marker)}`);
  }
  const legacy = marker === "legacy" || existsSync(at("doc"));
  const compact = marker === "compact-v1" || ["work/items", "sources/records", "docs/architecture.md", "docs/features", "docs/requirements", "docs/decisions", "docs/reports"].some(name => existsSync(at(name)));
  if (legacy && compact) throw new Error("Mixed canonical layouts; inspect or repair layout migration before continuing");
  const kind = legacy ? "legacy" as const : "compact" as const;
  const isCompact = kind === "compact";
  const docs = at(isCompact ? "docs" : "doc");
  const collection = (name: string) => path.join(docs, name);
  for (const entry of [docs, at("work"), at("sources"), at("tasks")]) {
    if (existsSync(entry) && lstatSync(entry).isSymbolicLink()) throw new Error(`Canonical storage cannot be a symlink: ${entry}`);
  }
  const features = collection("features"), requirements = collection("requirements"), decisions = collection("decisions"), reports = collection("reports");
  const work = at(isCompact ? "work/items" : "doc/backlog");
  return {
    kind, compact: isCompact, docs, features, requirements, decisions, reports,
    sources: at(isCompact ? "sources/records" : "doc/sources"), work,
    backlog: work, active: isCompact ? work : collection("active"),
    architecture: collection(isCompact ? "architecture.md" : "ARCHITECTURE.md"),
    featureFile: isCompact ? "overview.md" : "FEATURE.md", contractFile: isCompact ? "contracts.md" : "CONTRACTS.md",
    featureOverview: isCompact ? "overview.md" : "FEATURE.md", featureContracts: isCompact ? "contracts.md" : "CONTRACTS.md",
    indexes: {
      features: isCompact ? path.join(features, "INDEX.md") : collection("FEATURES.md"),
      requirements: isCompact ? path.join(requirements, "INDEX.md") : collection("REQUIREMENTS.md"),
      decisions: isCompact ? path.join(decisions, "INDEX.md") : collection("DECISIONS.md"),
      reports: isCompact ? path.join(reports, "INDEX.md") : collection("REPORTS.md"),
      sources: at(isCompact ? "sources/INDEX.md" : "doc/SOURCES.md"),
      work: at(isCompact ? "work/INDEX.md" : "doc/BACKLOG.md"),
    },
  };
}
