import { mkdtemp, readFile, rm, writeFile } from "node:fs/promises";
import os from "node:os";
import path from "node:path";
import { describe, expect, it } from "vitest";
import { activateBacklog, captureBacklog } from "../src/backlog/index.js";
import { reorderBacklog } from "../src/backlog/order.js";
import { parseMarkdown, renderMarkdown } from "../src/frontmatter/index.js";
import { rebuildIndexes } from "../src/indexing/index.js";
import { initProject } from "../src/projects/index.js";
import { validateProject } from "../src/validation/index.js";

async function fixture(run: (root: string) => Promise<void>): Promise<void> {
  const home = await mkdtemp(path.join(os.tmpdir(), "deep-backlog-order-"));
  try { await run(await initProject(home, { name: "example" })); }
  finally { await rm(home, { recursive: true, force: true }); }
}

describe("Backlog naming and explicit order", () => {
  it("creates descriptive collision-safe paths and keeps the Active activation path", async () => fixture(async (root) => {
    const first = await captureBacklog(root, { title: "Same title", pitch: "First", provenance: "Fixture" });
    const second = await captureBacklog(root, { title: "Same title", pitch: "Second", provenance: "Fixture" });
    expect(first).not.toBe(second);
    expect(path.basename(first)).toMatch(/^same-title--BACKLOG-[0-9A-F-]+\.md$/);
    expect(path.basename(second)).toMatch(/^same-title--BACKLOG-[0-9A-F-]+\.md$/);
    const firstId = String(parseMarkdown(await readFile(first, "utf8")).data.id);
    const active = await activateBacklog(root, firstId, "Do the first thing", {});
    expect(path.basename(active)).toMatch(/^same-title--ACTIVE-[0-9A-F-]+\.md$/);
    expect(parseMarkdown(await readFile(first, "utf8")).data.activation).toBe(path.relative(root, active));
    expect(await validateProject(root)).toEqual([]);
  }));

  it("reorders two items and retains their order after a generated-index rebuild", async () => fixture(async (root) => {
    const first = await captureBacklog(root, { title: "One", pitch: "First item", provenance: "Fixture" });
    const second = await captureBacklog(root, { title: "Two", pitch: "Second item", provenance: "Fixture" });
    const firstId = String(parseMarkdown(await readFile(first, "utf8")).data.id);
    const secondId = String(parseMarkdown(await readFile(second, "utf8")).data.id);
    await reorderBacklog(root, firstId, { before: secondId });
    await reorderBacklog(root, secondId, { before: firstId });
    const prior = await readFile(path.join(root, "doc", "BACKLOG.md"), "utf8");
    expect(prior.indexOf(`| ${secondId} |`)).toBeLessThan(prior.indexOf(`| ${firstId} |`));
    await rebuildIndexes(root);
    expect(await readFile(path.join(root, "doc", "BACKLOG.md"), "utf8")).toBe(prior);
    expect(parseMarkdown(await readFile(second, "utf8")).data.queue_position).toBe(1);
    expect(await validateProject(root)).toEqual([]);
  }));

  it("detects duplicate and invalid positions and stale generated indexes", async () => fixture(async (root) => {
    const first = await captureBacklog(root, { title: "One", pitch: "First", provenance: "Fixture" });
    const second = await captureBacklog(root, { title: "Two", pitch: "Second", provenance: "Fixture" });
    for (const file of [first, second]) {
      const doc = parseMarkdown(await readFile(file, "utf8"));
      doc.data.queue_position = 1;
      await writeFile(file, renderMarkdown(doc.data, doc.body));
    }
    expect((await validateProject(root)).map((diagnostic) => diagnostic.code)).toContain("duplicate-queue-position");
    await rebuildIndexes(root);
    const invalid = parseMarkdown(await readFile(second, "utf8"));
    invalid.data.queue_position = 0;
    await writeFile(second, renderMarkdown(invalid.data, invalid.body));
    const codes = (await validateProject(root)).map((diagnostic) => diagnostic.code);
    expect(codes).toContain("invalid-queue-position");
    expect(codes).toContain("stale-index");
  }));
});
