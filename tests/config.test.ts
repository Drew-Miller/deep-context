import { mkdtemp, readFile, rm, writeFile } from "node:fs/promises";
import os from "node:os";
import path from "node:path";
import { afterEach, describe, expect, it } from "vitest";
import { configPath, projectRegistryPath, saveHome, updateAgentsBlock } from "../src/config/index.js";

const cleanup: string[] = [];
afterEach(async () => Promise.all(cleanup.splice(0).map((target) => rm(target, { recursive: true, force: true }))));

describe("global routing marker", () => {
  it("is idempotent and preserves unrelated instructions", async () => {
    const root = await mkdtemp(path.join(os.tmpdir(), "deep-context-agents-"));
    cleanup.push(root);
    const target = path.join(root, "AGENTS.md");
    await writeFile(target, "# User instructions\n\nKeep me.\n");
    await updateAgentsBlock(target);
    const once = await readFile(target, "utf8");
    await updateAgentsBlock(target);
    expect(await readFile(target, "utf8")).toBe(once);
    expect(once).toContain("Keep me.");
  });

  it("rejects malformed markers", async () => {
    const root = await mkdtemp(path.join(os.tmpdir(), "deep-context-agents-"));
    cleanup.push(root);
    const target = path.join(root, "AGENTS.md");
    await writeFile(target, "<!-- deep-context:start -->\nmissing end\n");
    await expect(updateAgentsBlock(target)).rejects.toThrow("Malformed");
  });

  it("uses an isolated configuration directory when requested", async () => {
    const root = await mkdtemp(path.join(os.tmpdir(), "deep-context-config-"));
    cleanup.push(root);
    const previous = process.env.DEEP_CONTEXT_CONFIG_DIR;
    process.env.DEEP_CONTEXT_CONFIG_DIR = root;
    try {
      await saveHome("/tmp/deep-context-home");
      expect(configPath()).toBe(path.join(root, "config.toml"));
      expect(projectRegistryPath()).toBe(path.join(root, "projects.json"));
      expect(await readFile(configPath(), "utf8")).toContain("/tmp/deep-context-home");
    } finally {
      if (previous === undefined) delete process.env.DEEP_CONTEXT_CONFIG_DIR;
      else process.env.DEEP_CONTEXT_CONFIG_DIR = previous;
    }
  });
});
