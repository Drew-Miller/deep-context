import { execFile } from "node:child_process";
import { mkdtemp, mkdir, readFile, rm, unlink, writeFile } from "node:fs/promises";
import os from "node:os";
import path from "node:path";
import { promisify } from "node:util";
import { afterEach, describe, expect, it } from "vitest";
import { initProject } from "../src/projects/index.js";
import { rebuildIndexes } from "../src/indexing/index.js";
import { validateProject } from "../src/validation/index.js";

const cleanup: string[] = [];
const exec = promisify(execFile);
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
    await writeFile(path.join(root, "doc", "decisions", "unindexed.md"), "# Missing decision metadata\n");
    await rebuildIndexes(root);
    const diagnostics = await validateProject(root);
    expect(diagnostics.filter((item) => item.code === "broken-reference")).toHaveLength(4);
    expect(diagnostics.filter((item) => item.code === "unknown-feature")).toHaveLength(2);
    expect(diagnostics.map((item) => item.code)).toContain("invalid-frontmatter");
  });

  it("reconciles the attached source inventory and ignores intentionally retired records", async () => {
    const home = await mkdtemp(path.join(os.tmpdir(), "deep-context-validation-"));
    cleanup.push(home);
    const repository = path.join(home, "repository");
    await exec("git", ["init", repository]);
    await exec("git", ["-C", repository, "config", "user.email", "test@example.com"]);
    await exec("git", ["-C", repository, "config", "user.name", "Test"]);
    await writeFile(path.join(repository, "README.md"), "# Original\n");
    await writeFile(path.join(repository, "profile.local.json"), "{\"private\": true}\n");
    await exec("git", ["-C", repository, "add", "."]);
    await exec("git", ["-C", repository, "commit", "-m", "initial"]);
    const root = await initProject(home, { name: "Inventory", repository });
    expect(await validateProject(root)).toEqual([]);
    const sourceDirectory = path.join(root, "doc", "sources");
    const sourceFiles = await import("node:fs/promises").then(({ readdir }) => readdir(sourceDirectory));
    const sourceRecords = await Promise.all(sourceFiles.map(async (file) => ({ file, contents: await readFile(path.join(sourceDirectory, file), "utf8") })));
    const sourceFile = path.join(sourceDirectory, sourceRecords.find((record) => record.contents.includes("path: README.md"))!.file);
    const source = await readFile(sourceFile, "utf8");
    await writeFile(sourceFile, source.replace("tracking: tracked", "tracking: untracked"));
    await writeFile(path.join(repository, "README.md"), "# Changed\n");
    await writeFile(path.join(repository, "new.md"), "New\n");
    const retired = path.join(sourceDirectory, "SRC-RETIRED.md");
    await writeFile(retired, "---\nid: SRC-RETIRED\npath: retired.md\nkind: text\ntracking: not-applicable\ndisposition: imported\nreason: retired\norigin: confirmed\ntargets: []\n---\n\n# Retired\n");
    await rebuildIndexes(root);
    const diagnostics = await validateProject(root);
    expect(diagnostics.map((item) => item.code)).toEqual(expect.arrayContaining(["source-inventory-added", "source-inventory-changed", "stale-source-record"]));
    expect(diagnostics.find((item) => item.message.includes("retired.md"))).toBeUndefined();
    await unlink(path.join(repository, "README.md"));
    const removed = await validateProject(root);
    expect(removed.map((item) => item.code)).toContain("source-inventory-removed");
  });
});
