import { execFile } from "node:child_process";
import { mkdir, mkdtemp, readFile, readdir, rename, rm, writeFile } from "node:fs/promises";
import os from "node:os";
import path from "node:path";
import { promisify } from "node:util";
import { describe, expect, it } from "vitest";
import { activateBacklog, captureBacklog } from "../src/backlog/index.js";
import { markdownRecords } from "../src/core/records.js";
import { parseMarkdown, renderMarkdown } from "../src/frontmatter/index.js";
import { migrateFilenames } from "../src/migration/filenames.js";
import { repairFilenameOperations } from "../src/migration/transactions.js";
import { legacyInitProject as initProject } from "./legacy-fixture.js";
import { resolveMemoryTask, startMemoryTask } from "../src/tasks/memory.js";
import { validateProject } from "../src/validation/index.js";

const exec = promisify(execFile);

async function fixture(run: (root: string, home: string) => Promise<void>): Promise<void> {
  const home = await mkdtemp(path.join(os.tmpdir(), "deep-filenames-"));
  try { await run(await initProject(home, { name: "fixture" }), home); }
  finally { await rm(home, { recursive: true, force: true }); }
}

describe("descriptive canonical filenames", () => {
  it("migrates legacy Backlog and Active files with one-hop aliases and stable task binding", async () => fixture(async (root) => {
    const captured = await captureBacklog(root, { title: "Readable work", pitch: "Show the work", provenance: "Fixture" });
    const backlogId = String(parseMarkdown(await readFile(captured, "utf8")).data.id);
    const activated = await activateBacklog(root, backlogId, "Ship it", {});
    const activeId = String(parseMarkdown(await readFile(activated, "utf8")).data.id);
    const legacyBacklog = path.join(path.dirname(captured), `${backlogId}.md`);
    const legacyActive = path.join(path.dirname(activated), `${activeId}.md`);
    await rename(captured, legacyBacklog);
    await rename(activated, legacyActive);
    const backlog = parseMarkdown(await readFile(legacyBacklog, "utf8"));
    backlog.data.activation = path.relative(root, legacyActive);
    await writeFile(legacyBacklog, renderMarkdown(backlog.data, backlog.body));
    const task = await startMemoryTask(root, { chatId: "fresh-chat", name: "Read task", description: "Preserve binding" });
    const binding = await readFile(path.join(task.taskPath, "chats", task.bindingId!, "MEMORY.md"), "utf8");

    const preview = await migrateFilenames(root);
    expect(preview.moves.map((move) => move.id)).toEqual([activeId, backlogId].sort());
    await migrateFilenames(root, { apply: true });
    expect(parseMarkdown(await readFile(legacyBacklog, "utf8")).data.redirect_to).toBe(path.relative(root, captured));
    expect(parseMarkdown(await readFile(legacyActive, "utf8")).data.redirect_to).toBe(path.relative(root, activated));
    expect(parseMarkdown(await readFile(captured, "utf8")).data.id).toBe(backlogId);
    expect(parseMarkdown(await readFile(captured, "utf8")).data.activation).toBe(path.relative(root, activated));
    expect(parseMarkdown(await readFile(activated, "utf8")).data.id).toBe(activeId);
    expect((await resolveMemoryTask(root, undefined, { chatId: "fresh-chat" })).taskId).toBe(task.taskId);
    expect(await readFile(path.join(task.taskPath, "chats", task.bindingId!, "MEMORY.md"), "utf8")).toBe(binding);
    expect(await validateProject(root)).toEqual([]);

    const renamed = parseMarkdown(await readFile(captured, "utf8"));
    renamed.data.title = "A different readable title";
    await writeFile(captured, renderMarkdown(renamed.data, renamed.body));
    const result = await migrateFilenames(root, { id: backlogId, apply: true });
    const current = path.join(root, result.moves[0]!.to);
    expect(path.basename(current)).toMatch(/^a-different-readable-title--BACKLOG-/);
    expect(parseMarkdown(await readFile(legacyBacklog, "utf8")).data.redirect_to).toBe(result.moves[0]!.to);
    expect(parseMarkdown(await readFile(captured, "utf8")).data.redirect_to).toBe(result.moves[0]!.to);
    expect(await validateProject(root)).toEqual([]);
  }));

  it("uses bounded fallback slugs and preserves unstructured legacy reports", async () => fixture(async (root) => {
    const first = await captureBacklog(root, { title: "🚀", pitch: "One", provenance: "Fixture" });
    const second = await captureBacklog(root, { title: "🚀", pitch: "Two", provenance: "Fixture" });
    const long = await captureBacklog(root, { title: "x".repeat(500), pitch: "Long", provenance: "Fixture" });
    expect(path.basename(first)).toMatch(/^backlog--BACKLOG-/);
    expect(first).not.toBe(second);
    expect(path.basename(long).length).toBeLessThan(240);
    const report = path.join(root, "doc", "reports", "legacy-report.md");
    await writeFile(report, "# Historical report\n\nKeep this filename.\n");
    expect((await migrateFilenames(root)).exceptions).toContain(path.relative(root, report));
    expect(await readFile(report, "utf8")).toContain("Historical report");
  }));

  it("refuses an occupied case-folded destination and detects broken aliases", async () => fixture(async (root) => {
    const captured = await captureBacklog(root, { title: "Collision", pitch: "Pitch", provenance: "Fixture" });
    const id = String(parseMarkdown(await readFile(captured, "utf8")).data.id);
    const legacy = path.join(path.dirname(captured), `${id}.md`);
    await rename(captured, legacy);
    const collision = path.join(path.dirname(captured), path.basename(captured).toUpperCase());
    await writeFile(collision, renderMarkdown({ id: "OTHER", title: "Other", pitch: "Other", status: "proposed", provenance: "Fixture" }, "# Other\n"));
    expect((await migrateFilenames(root)).conflicts).toHaveLength(1);
    await expect(migrateFilenames(root, { apply: true })).rejects.toThrow("conflicts");
    await rm(collision);
    await migrateFilenames(root, { apply: true });
    await rm(captured);
    expect((await validateProject(root)).map((diagnostic) => diagnostic.code)).toContain("broken-forwarder");
  }));

  it("refreshes a migrated source record without recreating its legacy ID-only file", async () => {
    const home = await mkdtemp(path.join(os.tmpdir(), "deep-source-names-"));
    try {
      const repository = path.join(home, "repository");
      await exec("git", ["init", repository]);
      await exec("git", ["-C", repository, "config", "user.name", "Fixture"]);
      await exec("git", ["-C", repository, "config", "user.email", "fixture@example.com"]);
      await writeFile(path.join(repository, "notes.txt"), "Source text\n");
      await exec("git", ["-C", repository, "add", "."]);
      await exec("git", ["-C", repository, "commit", "-m", "fixture"]);
      const root = await initProject(home, { name: "fixture", repository });
      const sources = path.join(root, "doc", "sources");
      const record = (await markdownRecords(sources)).find(({ data }) => data.path === "notes.txt")!;
      expect(path.basename(record.file)).toMatch(/^notes-txt--SRC-/);
      const legacy = path.join(sources, `${record.data.id}.md`);
      await rename(record.file, legacy);
      const authored = parseMarkdown(await readFile(legacy, "utf8"));
      authored.data.disposition = "imported";
      authored.data.reason = "Reviewed fixture source";
      await writeFile(legacy, renderMarkdown(authored.data, `${authored.body}\nAuthored interpretation.\n`));
      await migrateFilenames(root, { apply: true });
      await initProject(home, { name: "fixture", repository });
      const after = parseMarkdown(await readFile(record.file, "utf8"));
      expect(after.data.id).toBe(record.data.id);
      expect(after.data.disposition).toBe("imported");
      expect(after.body).toContain("Authored interpretation.");
      expect(parseMarkdown(await readFile(legacy, "utf8")).data.redirect_id).toBe(record.data.id);
      expect((await readdir(sources)).filter((name) => name.includes(String(record.data.id)))).toHaveLength(2);
      expect(await validateProject(root)).toEqual([]);
    } finally { await rm(home, { recursive: true, force: true }); }
  });

  it("repairs a journal only when files retain their recorded before or after bytes", async () => fixture(async (root) => {
    const source = path.join(root, "doc", "sources", "SRC-EXAMPLE.md");
    const before = renderMarkdown({ id: "SRC-EXAMPLE", path: "old.txt", kind: "text", tracking: "not-applicable", disposition: "imported", reason: "Fixture", origin: "confirmed", targets: [] }, "# Source\n");
    await writeFile(source, before);
    const destination = path.join(root, "doc", "sources", "old-txt--SRC-EXAMPLE.md");
    const forwarded = renderMarkdown({ redirect_id: "SRC-EXAMPLE", redirect_to: path.relative(root, destination) }, "# Moved\n");
    const journal = path.join(root, ".local", "filename-operations", "interrupted.json");
    await mkdir(path.dirname(journal), { recursive: true });
    await writeFile(journal, JSON.stringify({ version: 1, status: "pending", writes: [
      { path: path.relative(root, destination), before: null, after: before },
      { path: path.relative(root, source), before, after: forwarded }
    ] }));
    await writeFile(destination, before);
    await writeFile(source, `${before}\nIntervening edit.\n`);
    await expect(repairFilenameOperations(root)).rejects.toThrow("Recovery refuses changed record");
    expect(await readFile(source, "utf8")).toContain("Intervening edit.");
    await writeFile(source, before);
    expect(await repairFilenameOperations(root)).toEqual([journal]);
    expect(await readFile(source, "utf8")).toBe(forwarded);
    expect(await readFile(destination, "utf8")).toBe(before);
    await rm(path.join(root, "doc", "SOURCES.md"));
    expect(await repairFilenameOperations(root)).toEqual([]);
    expect(await readFile(path.join(root, "doc", "SOURCES.md"), "utf8")).toContain("old-txt--SRC-EXAMPLE.md");
  }));
});
