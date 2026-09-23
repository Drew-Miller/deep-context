import { execFile } from "node:child_process";
import { mkdtemp, mkdir, readFile, rm, writeFile } from "node:fs/promises";
import os from "node:os";
import path from "node:path";
import { promisify } from "node:util";
import { afterEach, describe, expect, it } from "vitest";
import { inventoryRepository } from "../src/importing/index.js";
import { initProject } from "../src/projects/index.js";
import { parseMarkdown, renderMarkdown } from "../src/frontmatter/index.js";

const exec = promisify(execFile);
const cleanup: string[] = [];
afterEach(async () => Promise.all(cleanup.splice(0).map((target) => rm(target, { recursive: true, force: true }))));

describe("repository inventory", () => {
  it("records dirty evidence while excluding protected bodies", async () => {
    const repo = await mkdtemp(path.join(os.tmpdir(), "deep-context-repo-"));
    cleanup.push(repo);
    await exec("git", ["init", repo]);
    await exec("git", ["-C", repo, "config", "user.email", "test@example.com"]);
    await exec("git", ["-C", repo, "config", "user.name", "Test"]);
    await writeFile(path.join(repo, "README.md"), "# Project\n");
    await exec("git", ["-C", repo, "add", "README.md"]);
    await exec("git", ["-C", repo, "commit", "-m", "initial"]);
    await writeFile(path.join(repo, "idea.md"), "future\n");
    await writeFile(path.join(repo, "profile.local.json"), "{\"token\":\"secret\"}\n");
    await mkdir(path.join(repo, "build"));
    await writeFile(path.join(repo, "build", "generated.md"), "generated\n");
    const result = await inventoryRepository(repo);
    expect(result.dirty).toBe(true);
    expect(result.records.find((item) => item.path === "idea.md")?.disposition).toBe("review");
    expect(result.records.find((item) => item.path === "profile.local.json")?.reason).toContain("protected");
    expect(result.records.find((item) => item.path === "profile.local.json")?.sha256).toBeUndefined();
  });

  it("preserves human source dispositions when import is refreshed", async () => {
    const base = await mkdtemp(path.join(os.tmpdir(), "deep-context-refresh-"));
    cleanup.push(base);
    const repo = path.join(base, "repo");
    await exec("git", ["init", repo]);
    await exec("git", ["-C", repo, "config", "user.email", "test@example.com"]);
    await exec("git", ["-C", repo, "config", "user.name", "Test"]);
    await writeFile(path.join(repo, "README.md"), "# Project\n");
    await exec("git", ["-C", repo, "add", "."]);
    await exec("git", ["-C", repo, "commit", "-m", "initial"]);
    const home = path.join(base, "home");
    const project = await initProject(home, { name: "project", repository: repo });
    const sourceDirectory = path.join(project, "doc", "sources");
    const names = await import("node:fs/promises").then(({ readdir }) => readdir(sourceDirectory));
    const sourceFile = path.join(sourceDirectory, names[0]);
    const document = parseMarkdown(await readFile(sourceFile, "utf8"));
    document.data.disposition = "imported";
    document.data.reason = "human classification";
    document.data.targets = ["PROJECT.md"];
    await writeFile(sourceFile, renderMarkdown(document.data, document.body));
    await initProject(home, { name: "project", repository: repo });
    const refreshed = parseMarkdown(await readFile(sourceFile, "utf8"));
    expect(refreshed.data).toMatchObject({ disposition: "imported", reason: "human classification", targets: ["PROJECT.md"] });
  });
});
