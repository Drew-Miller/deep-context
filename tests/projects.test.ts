import { mkdtemp, readFile, rm } from "node:fs/promises";
import os from "node:os";
import path from "node:path";
import { afterEach, describe, expect, it } from "vitest";
import { initProject } from "../src/projects/index.js";
import { validateProject } from "../src/validation/index.js";

const cleanup: string[] = [];
afterEach(async () => Promise.all(cleanup.splice(0).map((target) => rm(target, { recursive: true, force: true }))));

describe("project initialization", () => {
  it("creates a self-describing empty project without invented facts", async () => {
    const home = await mkdtemp(path.join(os.tmpdir(), "deep-context-home-"));
    cleanup.push(home);
    const root = await initProject(home, { name: "Example Project" });
    expect(await readFile(path.join(root, "CONTEXT_MAP.md"), "utf8")).toContain("Indexes can be deleted and rebuilt");
    expect(await readFile(path.join(root, "doc", "FEATURES.md"), "utf8")).not.toContain("billing");
    expect(await validateProject(root)).toEqual([]);
  });

  it("preserves edited canonical bodies on rerun", async () => {
    const home = await mkdtemp(path.join(os.tmpdir(), "deep-context-home-"));
    cleanup.push(home);
    const root = await initProject(home, { name: "Example" });
    const project = path.join(root, "PROJECT.md");
    const original = await readFile(project, "utf8");
    await import("node:fs/promises").then(({ writeFile }) => writeFile(project, `${original}\nUser truth.\n`));
    await initProject(home, { name: "Example" });
    expect(await readFile(project, "utf8")).toContain("User truth.");
  });
});
