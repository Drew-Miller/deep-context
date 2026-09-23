import { mkdtemp, mkdir, rm, writeFile } from "node:fs/promises";
import os from "node:os";
import path from "node:path";
import { afterEach, describe, expect, it } from "vitest";
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
});
