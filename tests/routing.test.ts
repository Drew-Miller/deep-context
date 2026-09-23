import { mkdtemp, mkdir, rm, writeFile } from "node:fs/promises";
import os from "node:os";
import path from "node:path";
import { afterEach, describe, expect, it } from "vitest";
import { buildIndexes } from "../src/indexing/index.js";
import { selectFeatureContext } from "../src/routing/index.js";

const cleanup: string[] = [];
afterEach(async () => Promise.all(cleanup.splice(0).map((target) => rm(target, { recursive: true, force: true }))));

async function feature(root: string, name: string, dependencies: string, requirements: string[] = []): Promise<void> {
  const directory = path.join(root, "doc", "features", name);
  await mkdir(directory, { recursive: true });
  const requirementYaml = requirements.length ? `requirements:\n${requirements.map((item) => `  - ${item}`).join("\n")}\n` : "";
  await writeFile(path.join(directory, "FEATURE.md"), `---\nname: ${name}\ndescription: ${name}\nstatus: active\nowns: []\ntokens: []\ncontracts:\n  - doc/features/${name}/CONTRACTS.md\n${requirementYaml}depends_on:${dependencies}\n---\n\n# ${name}\n`);
  await writeFile(path.join(directory, "CONTRACTS.md"), `# ${name} contract\n`);
}

async function canonical(root: string, collection: "decisions" | "reports", id: string, features: string[]): Promise<string> {
  const directory = path.join(root, "doc", collection);
  await mkdir(directory, { recursive: true });
  const file = path.join(directory, `${id}.md`);
  await writeFile(file, `---\nid: ${id}\ntitle: ${id}\nstatus: accepted\nfeatures:\n${features.map((name) => `  - ${name}`).join("\n")}\n---\n\n# ${id}\n`);
  return path.relative(root, file);
}

describe("bounded feature routing", () => {
  it("selects only the primary feature and its direct dependency", async () => {
    const root = await mkdtemp(path.join(os.tmpdir(), "deep-context-routing-"));
    cleanup.push(root);
    await feature(root, "a", "\n  b: contract");
    await feature(root, "b", "\n  c: contract");
    await feature(root, "c", " {}");
    const selection = await selectFeatureContext(root, { a: "feature" });
    expect(selection.levels).toEqual({ a: "feature", b: "contract" });
    expect(selection.files).toContain("doc/features/a/FEATURE.md");
    expect(selection.files).toContain("doc/features/b/CONTRACTS.md");
    expect(selection.files.join("\n")).not.toContain("features/c/");
  });

  it("loads declared atomic requirements at feature depth", async () => {
    const root = await mkdtemp(path.join(os.tmpdir(), "deep-context-routing-"));
    cleanup.push(root);
    await mkdir(path.join(root, "doc", "requirements"), { recursive: true });
    await writeFile(path.join(root, "doc", "requirements", "REQ-1.md"), "---\nid: REQ-1\ntitle: One\nstatus: active\norigin: confirmed\n---\n\n# One\n");
    await feature(root, "a", " {}", ["REQ-1"]);
    const selection = await selectFeatureContext(root, { a: "feature" });
    expect(selection.files).toContain("doc/requirements/REQ-1.md");
    const contractOnly = await selectFeatureContext(root, { a: "contract" });
    expect(contractOnly.files).not.toContain("doc/requirements/REQ-1.md");
  });

  it("loads requirements owned by the selected feature without an explicit feature list", async () => {
    const root = await mkdtemp(path.join(os.tmpdir(), "deep-context-routing-"));
    cleanup.push(root);
    await mkdir(path.join(root, "doc", "requirements"), { recursive: true });
    await writeFile(path.join(root, "doc", "requirements", "REQ-OWNED.md"), "---\nid: REQ-OWNED\ntitle: Owned\nstatus: active\nfeature: a\norigin: confirmed\n---\n\n# Owned\n");
    await feature(root, "a", " {}");
    const selection = await selectFeatureContext(root, { a: "feature" });
    expect(selection.files).toContain("doc/requirements/REQ-OWNED.md");
  });

  it("adds only feature-associated decisions and reports at deep context", async () => {
    const root = await mkdtemp(path.join(os.tmpdir(), "deep-context-routing-"));
    cleanup.push(root);
    await feature(root, "a", " {}");
    await feature(root, "b", " {}");
    const decision = await canonical(root, "decisions", "DEC-1", ["a"]);
    const report = await canonical(root, "reports", "REP-1", ["a"]);
    await canonical(root, "decisions", "DEC-OTHER", ["b"]);
    await canonical(root, "reports", "REP-OTHER", ["b"]);
    await writeFile(path.join(root, "doc", "reports", "legacy.md"), "# Legacy report\n");
    const featureSelection = await selectFeatureContext(root, { a: "feature" });
    expect(featureSelection.files).not.toContain(decision);
    expect(featureSelection.files).not.toContain(report);
    const deepSelection = await selectFeatureContext(root, { a: "deep" });
    expect(deepSelection.files).toContain(decision);
    expect(deepSelection.files).toContain(report);
    expect(deepSelection.files.join("\n")).not.toContain("OTHER");
    expect(deepSelection.files.join("\n")).not.toContain("legacy.md");
  });

  it("indexes legacy reports with deterministic fallback metadata", async () => {
    const root = await mkdtemp(path.join(os.tmpdir(), "deep-context-routing-"));
    cleanup.push(root);
    await mkdir(path.join(root, "doc", "reports"), { recursive: true });
    await writeFile(path.join(root, "doc", "reports", "legacy.md"), "# Legacy report\n");
    const contents = (await buildIndexes(root)).get(path.join(root, "doc", "REPORTS.md"));
    expect(contents).toContain("REPORT-LEGACY");
    expect(contents).toContain("Legacy report");
    expect(contents).toContain("reports/legacy.md");
  });
});
