import { execFile } from "node:child_process";
import { mkdtemp, readFile, readdir, realpath, rm, writeFile } from "node:fs/promises";
import os from "node:os";
import path from "node:path";
import { promisify } from "node:util";
import { afterEach, describe, expect, it } from "vitest";
import { initProject } from "../src/projects/index.js";
import { parseMarkdown, renderMarkdown } from "../src/frontmatter/index.js";
import { attachMemorySource, rebuildChatIndex, repairMemoryTasks, resolveMemoryTask, resumeMemoryTask, saveMemoryTask, startMemoryTask, validateMemoryTasks } from "../src/tasks/memory.js";
import { sourceSnapshot } from "../src/tasks/source.js";
import { withProjectLock } from "../src/tasks/transactions.js";
import { createTask } from "../src/tasks/index.js";

const exec = promisify(execFile);
const cleanup: string[] = [];
afterEach(async () => { await Promise.all(cleanup.splice(0).map(p => rm(p, { recursive: true, force: true }))); });
async function fixture(git = false, contained = false) {
  const base = await realpath(await mkdtemp(path.join(os.tmpdir(), "deep memory space ")));
  cleanup.push(base);
  const repository = path.join(base, "source");
  if (git) {
    await exec("git", ["init", repository]);
    await exec("git", ["-C", repository, "config", "user.name", "Fixture"]);
    await exec("git", ["-C", repository, "config", "user.email", "fixture@example.com"]);
    await writeFile(path.join(repository, "README.md"), "source\n");
    await exec("git", ["-C", repository, "add", "."]);
    await exec("git", ["-C", repository, "commit", "-m", "fixture"]);
  }
  const project = await initProject(base, { name: "memory", repository: git ? repository : undefined, contextPath: contained ? path.join(repository, "deep-context") : undefined });
  return { project, repository, base };
}

describe("durable chat task memory", () => {
  it("keeps UUID identity independent of duplicate titles and rebuildable indexes", async () => {
    const { project } = await fixture();
    const a = await startMemoryTask(project, { description: "First objective", name: "Same title", chatId: "a" });
    const b = await startMemoryTask(project, { description: "Second objective", name: "Same title", chatId: "b" });
    expect(a.taskId).not.toBe(b.taskId);
    expect(await startMemoryTask(project, { description: "Not a scope override", chatId: "a" })).toEqual(a);
    await expect(resolveMemoryTask(project, "Same title")).rejects.toThrow("ambiguous");
    await expect(resolveMemoryTask(project, b.taskId, { chatId: "a" })).rejects.toThrow("disagree");
    await rm(await rebuildChatIndex(project));
    expect((await resolveMemoryTask(project, undefined, { chatId: "a" })).taskId).toBe(a.taskId);
    expect(JSON.parse(await readFile(await rebuildChatIndex(project), "utf8")).bindings).toHaveLength(2);
    expect(await validateMemoryTasks(project)).toEqual([]);
  });

  it("supports no-Git bindings, revisions, literal checkpoints and authorized transfer", async () => {
    const { project } = await fixture();
    const task = await startMemoryTask(project, { description: "No source required" });
    expect(task.sourceBinding.mode).toBe("none");
    expect(await readdir(task.taskPath)).not.toContain("worktree");
    await expect(resolveMemoryTask(project)).rejects.toThrow("No task");
    const saved = await saveMemoryTask(project, task.taskPath, { bindingId: task.bindingId!, expectedRevision: 1, nextAction: "Check $1 and $&\nThen review.", note: "Important finding" });
    expect(await readFile(path.join(task.taskPath, "TASK_STATE.md"), "utf8")).toContain("Check $1 and $&\nThen review.");
    await expect(saveMemoryTask(project, task.taskId, { bindingId: task.bindingId!, expectedRevision: 1 })).rejects.toThrow("revision changed");
    await expect(resumeMemoryTask(project, task.taskId, { chatId: "second", expectedRevision: saved.stateRevision })).rejects.toThrow("takeover");
    const resumed = await resumeMemoryTask(project, task.taskId, { chatId: "second", expectedRevision: saved.stateRevision, takeover: true });
    expect(resumed.requiredReads).toContain(path.join(task.taskPath, "chats", task.bindingId!, "MEMORY.md"));
    expect(await readFile(path.join(task.taskPath, "chats", task.bindingId!, "MEMORY.md"), "utf8")).toContain("Important finding");
    await expect(saveMemoryTask(project, task.taskId, { bindingId: task.bindingId!, expectedRevision: resumed.stateRevision })).rejects.toThrow("ownership changed");
    await saveMemoryTask(project, task.taskId, { chatId: "second", expectedRevision: resumed.stateRevision, release: true });
    expect((await startMemoryTask(project, { chatId: "second", description: "Separate objective" })).taskId).not.toBe(task.taskId);
  });

  it("hashes source edits while excluding its context and reuses an external checkout", async () => {
    const { project, repository } = await fixture(true, true);
    const task = await startMemoryTask(project, { chatId: "a", description: "Inspect source" });
    const before = await sourceSnapshot(project, task.sourceBinding);
    await writeFile(path.join(project, "notes.md"), "context only");
    expect(await sourceSnapshot(project, task.sourceBinding)).toEqual(before);
    await writeFile(path.join(repository, "README.md"), "first edit");
    const first = await sourceSnapshot(project, task.sourceBinding);
    await writeFile(path.join(repository, "README.md"), "second edit");
    expect(await sourceSnapshot(project, task.sourceBinding)).not.toEqual(first);
    const saved = await saveMemoryTask(project, task.taskId, { chatId: "a", expectedRevision: 1 });
    expect(await readFile(path.join(task.taskPath, "TASK_STATE.md"), "utf8")).toContain("Revalidate source-dependent findings");
    const attached = await attachMemorySource(project, task.taskId, { chatId: "a", expectedRevision: saved.stateRevision, sourceMode: "existing", sourcePath: repository, sourceRulesReviewed: true });
    expect(attached.sourceBinding.ownership).toBe("external");
    expect(await readdir(task.taskPath)).not.toContain("worktree");
  });

  it("rejects prohibited worktrees before persisting an attachment intent", async () => {
    const { project, repository } = await fixture(true);
    const overview = parseMarkdown(await readFile(path.join(project, "PROJECT.md"), "utf8"));
    overview.data.source_worktree_policy = "prohibited";
    await writeFile(path.join(project, "PROJECT.md"), renderMarkdown(overview.data, overview.body));
    const task = await startMemoryTask(project, { chatId: "aftershock-fixture", description: "Read-only review" });
    await expect(attachMemorySource(project, task.taskId, { chatId: "aftershock-fixture", expectedRevision: 1, sourceMode: "isolated", sourcePath: repository, sourceRulesReviewed: true })).rejects.toThrow("prohibits");
    expect((await resolveMemoryTask(project, task.taskId)).stateRevision).toBe(1);
    expect(await validateMemoryTasks(project)).toEqual([]);
  });

  it("recovers partial writes explicitly without overwriting intervening notes", async () => {
    const { project } = await fixture();
    const task = await startMemoryTask(project, { description: "Recover", chatId: "a" });
    const file = path.join(task.taskPath, "WORKLOG.md");
    const before = await readFile(file, "utf8");
    const journal = path.join(project, ".local/operations/interrupted.json");
    await writeFile(journal, JSON.stringify({ version: 1, status: "pending", writes: [{ path: path.relative(project, file), before, after: before + "\nDurable checkpoint\n" }] }));
    await expect(resolveMemoryTask(project, task.taskId)).rejects.toThrow("repair-tasks");
    await writeFile(file, before + "\nExternal note\n");
    await expect(repairMemoryTasks(project)).rejects.toThrow("refuses changed task notes");
    expect(await readFile(file, "utf8")).toContain("External note");
    await writeFile(file, before);
    await repairMemoryTasks(project);
    expect(await readFile(file, "utf8")).toContain("Durable checkpoint");
    expect(await repairMemoryTasks(project)).toEqual([]);
    await withProjectLock(project, async () => {
      await expect(saveMemoryTask(project, task.taskId, { chatId: "a", expectedRevision: 1 })).rejects.toThrow("busy");
    });
  });

  it("migrates legacy memory without replacing notes or worktrees and rejects unknown schemas", async () => {
    const { project } = await fixture(true);
    const root = await createTask(project, "legacy", { sourceRulesReviewed: true });
    await writeFile(path.join(root, "WORKLOG.md"), "Keep legacy discovery");
    const before = await readFile(path.join(root, "TASK_STATE.md"), "utf8");
    expect((await resolveMemoryTask(project, "legacy")).legacy).toBe(true);
    expect(await readFile(path.join(root, "TASK_STATE.md"), "utf8")).toBe(before);
    const migrated = await resumeMemoryTask(project, "legacy", { chatId: "new" });
    expect(migrated.sourceBinding.ownership).toBe("deep-context");
    expect(await readFile(path.join(root, "WORKLOG.md"), "utf8")).toBe("Keep legacy discovery");
    const state = parseMarkdown(await readFile(path.join(root, "TASK_STATE.md"), "utf8"));
    state.data.schema_version = 99;
    await writeFile(path.join(root, "TASK_STATE.md"), renderMarkdown(state.data, state.body));
    await expect(resolveMemoryTask(project, migrated.taskId)).rejects.toThrow("Unsupported task schema");
  });
});
