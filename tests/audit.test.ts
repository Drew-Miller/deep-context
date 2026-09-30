import { execFile } from "node:child_process";
import { createHash } from "node:crypto";
import { mkdtemp, mkdir, readFile, rm, symlink, writeFile } from "node:fs/promises";
import { fileURLToPath } from "node:url";
import os from "node:os";
import path from "node:path";
import { promisify } from "node:util";
import { afterEach, describe, expect, it } from "vitest";
import { initProject } from "../src/projects/index.js";

const exec = promisify(execFile);
const cleanup: string[] = [];
const helper = path.resolve(path.dirname(fileURLToPath(import.meta.url)), "../plugins/deep-context/skills/deep-audit/scripts/inventory.mjs");
afterEach(async () => Promise.all(cleanup.splice(0).map((target) => rm(target, { recursive: true, force: true }))));

function hash(value: string): string {
  return createHash("sha256").update(value).digest("hex");
}

describe("deep-audit inventory", () => {
  it("enumerates a normal initialized project without assuming the self-project planning home or reading private bodies", async () => {
    const base = await mkdtemp(path.join(os.tmpdir(), "deep-context-audit-"));
    cleanup.push(base);
    const repository = path.join(base, "source");
    await exec("git", ["init", repository]);
    await exec("git", ["-C", repository, "config", "user.email", "audit@example.test"]);
    await exec("git", ["-C", repository, "config", "user.name", "Audit Test"]);
    await writeFile(path.join(repository, "README.md"), "# Fixture source\n");
    await exec("git", ["-C", repository, "add", "README.md"]);
    await exec("git", ["-C", repository, "commit", "-m", "fixture"]);
    const context = await initProject(base, { name: "Audit Fixture", repository, register: false });

    const queue = path.join(context, "WORK_QUEUE.md");
    const localArchive = path.join(context, ".local", "archives", "sample", "PRIVATE.txt");
    const unknown = path.join(context, "custom", "notes.md");
    const sentinel = "PRIVATE-SENTINEL-DO-NOT-COPY";
    await mkdir(path.dirname(localArchive), { recursive: true });
    await mkdir(path.dirname(unknown), { recursive: true });
    await writeFile(queue, "# Fixture's declared schedule\n\nKeep this.\n");
    await writeFile(localArchive, sentinel);
    await writeFile(unknown, "# Project extension\n");
    await symlink(base, path.join(context, "escape"));
    const queueBefore = hash(await readFile(queue, "utf8"));
    const archiveBefore = hash(await readFile(localArchive, "utf8"));

    const first = (await exec(process.execPath, [helper, "--project", context])).stdout;
    const second = (await exec(process.execPath, [helper, "--project", context])).stdout;
    expect(second).toBe(first);
    const inventory = JSON.parse(first) as {
      schemaVersion: number;
      entries: Array<{ path: string; type: string; roleHint: string }>;
      errors: Array<unknown>;
    };
    const paths = inventory.entries.map((entry) => entry.path);
    expect(inventory.schemaVersion).toBe(1);
    expect(paths).toEqual([...paths].sort());
    expect(paths).toEqual(expect.arrayContaining([".", "AGENTS.md", "CONTEXT_MAP.md", "WORK_QUEUE.md", "docs/architecture.md", ".local/archives/sample/PRIVATE.txt", "custom/notes.md", "escape"]));
    expect(paths).not.toContain("docs/plan/TASKS.md");
    expect(paths.some((entry) => entry.startsWith("escape/") || entry.startsWith("repo/"))).toBe(false);
    expect(inventory.entries.find((entry) => entry.path === "escape")?.type).toBe("symlink");
    expect(paths).not.toContain("repo");
    expect(inventory.entries.find((entry) => entry.path === "custom/notes.md")?.roleHint).toBe("unresolved");
    expect(inventory.errors).toEqual([]);
    expect(first).not.toContain(sentinel);
    expect(hash(await readFile(queue, "utf8"))).toBe(queueBefore);
    expect(hash(await readFile(localArchive, "utf8"))).toBe(archiveBefore);
  });

  it("rejects a symlink used as the context root", async () => {
    const base = await mkdtemp(path.join(os.tmpdir(), "deep-context-audit-link-"));
    cleanup.push(base);
    const root = path.join(base, "context");
    const alias = path.join(base, "alias");
    await mkdir(root);
    await symlink(root, alias);
    await expect(exec(process.execPath, [helper, "--project", alias])).rejects.toThrow();
  });
});
