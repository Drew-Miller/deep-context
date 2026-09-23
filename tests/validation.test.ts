import { mkdtemp, mkdir, rm, writeFile } from "node:fs/promises";
import os from "node:os";
import path from "node:path";
import { afterEach, describe, expect, it } from "vitest";
import { initProject } from "../src/projects/index.js";
import { rebuildIndexes } from "../src/indexing/index.js";
import { validateProject } from "../src/validation/index.js";

const cleanup: string[] = [];
afterEach(async () => Promise.all(cleanup.splice(0).map((target) => rm(target, { recursive: true, force: true }))));

describe("reference validation", () => {
  it("reports broken contracts, dependencies, requirement features, sources, and provenance targets", async () => {
    const home = await mkdtemp(path.join(os.tmpdir(), "deep-context-validation-"));
    cleanup.push(home);
    const root = await initProject(home, { name: "References" });
    const featureRoot = path.join(root, "doc", "features", "one");
    await mkdir(featureRoot, { recursive: true });
    await writeFile(path.join(featureRoot, "FEATURE.md"), "---\nname: one\ndescription: One\nstatus: active\nowns: []\ntokens: []\ncontracts: [doc/features/one/MISSING.md]\nrequirements: [REQ-MISSING]\ndepends_on: { absent: contract }\norigin: confirmed\n---\n\n# One\n");
    await writeFile(path.join(root, "doc", "requirements", "REQ-ONE.md"), "---\nid: REQ-ONE\ntitle: One\nstatus: active\nfeature: absent\norigin: confirmed\nsource: repo/MISSING.md#section\n---\n\n# One\n");
    await mkdir(path.join(root, "doc", "sources"), { recursive: true });
    await writeFile(path.join(root, "doc", "sources", "SRC-ONE.md"), "---\nid: SRC-ONE\npath: retired.md\nkind: text\ntracking: not-applicable\ndisposition: imported\nreason: test\norigin: confirmed\ntargets: [doc/MISSING.md]\n---\n\n# Source\n");
    await rebuildIndexes(root);
    const diagnostics = await validateProject(root);
    expect(diagnostics.filter((item) => item.code === "broken-reference")).toHaveLength(4);
    expect(diagnostics.filter((item) => item.code === "unknown-feature")).toHaveLength(2);
  });
});
