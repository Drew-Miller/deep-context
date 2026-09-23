import { cp, mkdtemp, mkdir, rm, symlink, unlink, writeFile } from "node:fs/promises";
import { fileURLToPath } from "node:url";
import os from "node:os";
import path from "node:path";
import { afterEach, describe, expect, it } from "vitest";
// @ts-expect-error The distribution checker is intentionally executable JavaScript without declarations.
import { checkCatalog, checkPackage } from "../tooling/check-package.mjs";

const cleanup: string[] = [];
const sourcePackage = path.resolve(path.dirname(fileURLToPath(import.meta.url)), "../plugins/deep-context");
afterEach(async () => Promise.all(cleanup.splice(0).map((target) => rm(target, { recursive: true, force: true }))));

async function fixture() {
  const root = await mkdtemp(path.join(os.tmpdir(), "deep-context-package-test-"));
  cleanup.push(root);
  const target = path.join(root, "deep-context");
  await cp(sourcePackage, target, { recursive: true });
  return target;
}

describe("plugin package boundary", () => {
  it("accepts the exact distributable package", async () => {
    const target = await fixture();
    await expect(checkPackage(target)).resolves.toMatchObject({ packageRoot: target });
  });

  it.each([".git", "node_modules", ".venv", ".deep-context", ".local", "src", "tests"])("rejects forbidden package directory %s", async (directory) => {
    const target = await fixture();
    await mkdir(path.join(target, directory));
    await expect(checkPackage(target)).rejects.toThrow(/Unexpected package directory/);
  });

  it.each([
    ["unexpected file", async (target: string) => { await writeFile(path.join(target, "notes.md"), "not distributable\n"); }],
    ["symlink escape", async (target: string) => { await symlink(os.tmpdir(), path.join(target, "templates", "escape")); }],
    ["missing required file", async (target: string) => { await unlink(path.join(target, "dist", "cli.mjs")); }]
  ])("rejects %s", async (_name, mutate) => {
    const target = await fixture();
    await mutate(target);
    await expect(checkPackage(target)).rejects.toThrow();
  });

  it("rejects a marketplace source that would expose the repository root", async () => {
    const root = await mkdtemp(path.join(os.tmpdir(), "deep-context-catalog-test-"));
    cleanup.push(root);
    const catalog = path.join(root, ".agents", "plugins", "marketplace.json");
    await mkdir(path.dirname(catalog), { recursive: true });
    await writeFile(catalog, JSON.stringify({
      name: "deep-context-repo",
      plugins: [{ name: "deep-context", source: { source: "local", path: "./" } }]
    }));
    await expect(checkCatalog(root)).rejects.toThrow(/\.\/plugins\/deep-context/);
  });
});
