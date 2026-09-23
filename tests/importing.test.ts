import { execFile } from "node:child_process";
import { mkdtemp, mkdir, readFile, rm, writeFile } from "node:fs/promises";
import os from "node:os";
import path from "node:path";
import { promisify } from "node:util";
import { afterEach, describe, expect, it } from "vitest";
import { inventoryRepository } from "../src/importing/index.js";
import { initProject } from "../src/projects/index.js";
import { parseMarkdown, renderMarkdown } from "../src/frontmatter/index.js";
import { validateProject } from "../src/validation/index.js";

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

  it("excludes only an explicitly supplied context subtree", async () => {
    const repo = await mkdtemp(path.join(os.tmpdir(), "deep-context-contained-"));
    cleanup.push(repo);
    await exec("git", ["init", repo]);
    await exec("git", ["-C", repo, "config", "user.email", "test@example.com"]);
    await exec("git", ["-C", repo, "config", "user.name", "Test"]);
    await mkdir(path.join(repo, "deep-context"));
    await writeFile(path.join(repo, "README.md"), "# Project\n");
    await writeFile(path.join(repo, "deep-context", "PROJECT.md"), "# Context\n");
    await writeFile(path.join(repo, "other-deep-context.md"), "# Source\n");
    await exec("git", ["-C", repo, "add", "."]);
    await exec("git", ["-C", repo, "commit", "-m", "initial"]);
    const result = await inventoryRepository(repo, { excludedRoots: [path.join(repo, "deep-context")] });
    expect(result.records.map((record) => record.path)).not.toContain("deep-context/PROJECT.md");
    expect(result.records.map((record) => record.path)).toContain("other-deep-context.md");
  });

  it("never imports tracked project context back into source provenance", async () => {
    const repo = await mkdtemp(path.join(os.tmpdir(), "deep-context-tracked-home-"));
    cleanup.push(repo);
    await exec("git", ["init", repo]);
    await mkdir(path.join(repo, ".deep-context"));
    await writeFile(path.join(repo, "README.md"), "# Source\n");
    await writeFile(path.join(repo, ".deep-context", "PROJECT.md"), "# Context\n");
    await exec("git", ["-C", repo, "add", "."]);
    const result = await inventoryRepository(repo);
    expect(result.records.map((item) => item.path)).toContain("README.md");
    expect(result.records.map((item) => item.path)).not.toContain(".deep-context/PROJECT.md");
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
    const sourceFile = path.join(sourceDirectory, (await Promise.all(names.map(async (name) => ({ name, data: parseMarkdown(await readFile(path.join(sourceDirectory, name), "utf8")).data })))).find((record) => record.data.path === "README.md")!.name);
    const document = parseMarkdown(await readFile(sourceFile, "utf8"));
    document.data.disposition = "imported";
    document.data.reason = "human classification";
    document.data.targets = ["PROJECT.md"];
    document.data.custom_metadata = { author: "human" };
    await writeFile(sourceFile, renderMarkdown(document.data, `${document.body}\nHuman-authored provenance.\n`));
    await writeFile(path.join(repo, "README.md"), "# Changed project\n");
    await initProject(home, { name: "project", repository: repo });
    const refreshed = parseMarkdown(await readFile(sourceFile, "utf8"));
    expect(refreshed.data).toMatchObject({
      disposition: "review",
      custom_metadata: { author: "human" },
      review_history: [{ disposition: "imported", reason: "human classification" }],
    });
    expect(refreshed.body).toContain("Human-authored provenance.");
  });

  it("retains a removed untracked source as missing historical provenance", async () => {
    const base = await mkdtemp(path.join(os.tmpdir(), "deep-context-removed-source-"));
    cleanup.push(base);
    const repo = path.join(base, "repo");
    await exec("git", ["init", repo]);
    await exec("git", ["-C", repo, "config", "user.email", "test@example.com"]);
    await exec("git", ["-C", repo, "config", "user.name", "Test"]);
    await writeFile(path.join(repo, "README.md"), "# Project\n");
    await exec("git", ["-C", repo, "add", "."]);
    await exec("git", ["-C", repo, "commit", "-m", "initial"]);
    const source = path.join(repo, "idea.md");
    await writeFile(source, "# Future idea\n");
    const home = path.join(base, "home");
    const project = await initProject(home, { name: "project", repository: repo });
    await rm(source);
    expect((await validateProject(project)).map((item) => item.code)).toContain("source-inventory-removed");
    await initProject(home, { name: "project", repository: repo });
    const records = await import("node:fs/promises").then(({ readdir }) => readdir(path.join(project, "doc", "sources")));
    const bodies = await Promise.all(records.map((file) => readFile(path.join(project, "doc", "sources", file), "utf8")));
    const retained = parseMarkdown(bodies.find((body) => body.includes("path: idea.md"))!);
    expect(retained.data).toMatchObject({ tracking: "missing", disposition: "missing" });
    expect(retained.data.review_history).toBeTruthy();
    expect(await validateProject(project)).toEqual([]);
  });
});
