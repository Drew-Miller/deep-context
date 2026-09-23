import { execFile } from "node:child_process";
import { appendFile, cp, mkdtemp, mkdir, readdir, readFile, rm, writeFile } from "node:fs/promises";
import os from "node:os";
import path from "node:path";
import { promisify } from "node:util";
import { afterEach, describe, expect, it } from "vitest";
import { finalizeClosure, prepareClosure } from "../src/closure/index.js";
import { stageClosure } from "../src/closure/recovery.js";
import { parseMarkdown, renderMarkdown } from "../src/frontmatter/index.js";
import { initProject } from "../src/projects/index.js";
import { attachMemorySource, resolveMemoryTask, resumeMemoryTask, startMemoryTask } from "../src/tasks/memory.js";

const exec = promisify(execFile);
const cleanup: string[] = [];
afterEach(async () => Promise.all(cleanup.splice(0).map((target) => rm(target, { recursive: true, force: true }))));

async function gitRepository(base: string, name = "source"): Promise<string> {
  const repository = path.join(base, name);
  await exec("git", ["init", repository]);
  await exec("git", ["-C", repository, "config", "user.email", "test@example.com"]);
  await exec("git", ["-C", repository, "config", "user.name", "Test"]);
  await writeFile(path.join(repository, "README.md"), "# Source\n");
  await exec("git", ["-C", repository, "add", "."]);
  await exec("git", ["-C", repository, "commit", "-m", "initial"]);
  return repository;
}

async function markdownNotes(root: string, relative = ""): Promise<string[]> {
  const directory = path.join(root, relative);
  const notes: string[] = [];
  for (const entry of await readdir(directory, { withFileTypes: true })) {
    const child = path.join(relative, entry.name);
    if (child === "worktree" || child.startsWith(`worktree${path.sep}`) || child === "CLOSURE_REVIEW.md") continue;
    if (entry.isDirectory()) notes.push(...await markdownNotes(root, child));
    else if (entry.isFile() && entry.name.endsWith(".md")) notes.push(child);
  }
  return notes.sort();
}

async function approveAllTaskNotes(reviewPath: string): Promise<void> {
  const review = parseMarkdown(await readFile(reviewPath, "utf8"));
  const taskRoot = path.dirname(reviewPath);
  review.data.status = "approved";
  review.data.reviewer = "memory-closure-test";
  review.data.findings_resolved = true;
  review.data.unresolved_findings = [];
  review.data.promotion_references = [];
  review.data.knowledge_review = (await markdownNotes(taskRoot)).map((file) => ({ path: file, classification: "transient", promotion_references: [] }));
  await writeFile(reviewPath, renderMarkdown(review.data, review.body));
}

async function memoryProject(withRepository = false): Promise<{ base: string; project: string; repository?: string }> {
  const base = await mkdtemp(path.join(os.tmpdir(), "deep-context-memory-closure-"));
  cleanup.push(base);
  const repository = withRepository ? await gitRepository(base) : undefined;
  const project = await initProject(path.join(base, "home"), { name: "project", ...(repository ? { repository } : {}) });
  return { base, project, repository };
}

describe("memory task closure", () => {
  it("retries a staged cleanup by UUID and refuses changes after staging", async () => {
    const { project } = await memoryProject();
    const task = await startMemoryTask(project, { description: "Interrupted cleanup", chatId: "retry" });
    const options = { chatId: "retry", expectedRevision: task.stateRevision };
    await approveAllTaskNotes(await prepareClosure(project, task.taskId, options));
    const archive = path.join(project, ".local/archives", task.taskId);
    await cp(task.taskPath, archive, { recursive: true });
    const state = parseMarkdown(await readFile(path.join(task.taskPath, "TASK_STATE.md"), "utf8"));
    await writeFile(path.join(archive, "TASK_STATE.md"), renderMarkdown({ ...state.data, status: "closed", owner_binding_id: null }, state.body));
    const chatPath = path.join(archive, "chats", task.bindingId!, "MEMORY.md");
    const chat = parseMarkdown(await readFile(chatPath, "utf8"));
    await writeFile(chatPath, renderMarkdown({ ...chat.data, status: "released" }, chat.body));
    await writeFile(path.join(archive, "REPORT.md"), "# Archived fixture\n");
    await stageClosure(project, task.taskPath, state.data);
    const worklog = path.join(task.taskPath, "WORKLOG.md");
    const original = await readFile(worklog, "utf8");
    await appendFile(worklog, "Changed after staging");
    await expect(finalizeClosure(project, task.taskId, options)).rejects.toThrow("recovery evidence changed");
    await writeFile(worklog, original);
    expect(await finalizeClosure(project, task.taskId, options)).toBe(archive);
    expect((await resolveMemoryTask(project, task.taskId)).status).toBe("closed");
  });

  it("closes a schema-version-2 task after classifying every chat note and resolves the archive as closed", async () => {
    const { project } = await memoryProject();
    const started = await startMemoryTask(project, { description: "Close no-source memory", chatId: "chat-none" });
    const review = await prepareClosure(project, started.taskId, { chatId: "chat-none", expectedRevision: started.stateRevision });
    await approveAllTaskNotes(review);
    const archive = await finalizeClosure(project, started.taskId, { chatId: "chat-none", expectedRevision: started.stateRevision });
    const archivedState = parseMarkdown(await readFile(path.join(archive, "TASK_STATE.md"), "utf8"));
    expect(archivedState.data).toMatchObject({ schema_version: 2, task_id: started.taskId, status: "closed", owner_binding_id: null });
    expect(await markdownNotes(archive)).toEqual(expect.arrayContaining([
      "TASK_STATE.md",
      path.join("chats", started.bindingId!, "MEMORY.md"),
    ]));
    const resolved = await resolveMemoryTask(project, started.taskId);
    expect(resolved.taskPath).toBe(archive);
  });

  it("refuses stale task notes, a non-owner chat, and changed read-only source evidence", async () => {
    const { project, repository } = await memoryProject(true);
    const started = await startMemoryTask(project, {
      description: "Guard closure evidence",
      chatId: "chat-owner",
      sourceBinding: { mode: "read-only", path: repository, ownership: "external" },
    });
    const review = await prepareClosure(project, started.taskId, { chatId: "chat-owner", expectedRevision: started.stateRevision });
    await approveAllTaskNotes(review);
    await expect(finalizeClosure(project, started.taskId, { chatId: "other-chat", expectedRevision: started.stateRevision })).rejects.toThrow("ownership changed");
    await appendFile(path.join(started.taskPath, "WORKLOG.md"), "\nStale note.\n");
    await expect(finalizeClosure(project, started.taskId, { chatId: "chat-owner", expectedRevision: started.stateRevision })).rejects.toThrow("evidence changed");

    const freshReview = await prepareClosure(project, started.taskId, { chatId: "chat-owner", expectedRevision: started.stateRevision });
    await approveAllTaskNotes(freshReview);
    await appendFile(path.join(repository!, "README.md"), "Changed source.\n");
    await expect(finalizeClosure(project, started.taskId, { chatId: "chat-owner", expectedRevision: started.stateRevision })).rejects.toThrow("evidence changed");
  });

  it("does not remove a borrowed read-only source checkout during successful closure", async () => {
    const { project, repository } = await memoryProject(true);
    const started = await startMemoryTask(project, {
      description: "Close borrowed source",
      chatId: "chat-borrowed",
      sourceBinding: { mode: "read-only", path: repository, ownership: "external" },
    });
    const review = await prepareClosure(project, started.taskId, { chatId: "chat-borrowed", expectedRevision: started.stateRevision });
    await approveAllTaskNotes(review);
    await finalizeClosure(project, started.taskId, { chatId: "chat-borrowed", expectedRevision: started.stateRevision });
    expect(await readFile(path.join(repository!, "README.md"), "utf8")).toContain("# Source");
  });

  it("removes only a clean Deep Context-owned worktree and preserves its branch", async () => {
    const { project, repository } = await memoryProject(true);
    const started = await startMemoryTask(project, { description: "Close owned worktree", chatId: "chat-owned" });
    const worktree = path.join(started.taskPath, "worktree");
    const branch = `deep-context/memory-${started.taskId}`;
    const attached = await attachMemorySource(project, started.taskId, {
      chatId: "chat-owned",
      bindingId: started.bindingId!,
      expectedRevision: started.stateRevision,
      sourceMode: "isolated",
      sourcePath: repository,
      sourceRulesReviewed: true,
    });
    const review = await prepareClosure(project, started.taskId, { chatId: "chat-owned", expectedRevision: attached.stateRevision });
    await approveAllTaskNotes(review);
    await finalizeClosure(project, started.taskId, { chatId: "chat-owned", expectedRevision: attached.stateRevision });
    await expect(readFile(path.join(worktree, "README.md"), "utf8")).rejects.toMatchObject({ code: "ENOENT" });
    expect((await exec("git", ["-C", repository!, "branch", "--list", branch])).stdout).toContain(branch);
  });

  it("requires every chat memory note to be classified after an ownership transfer", async () => {
    const { project } = await memoryProject();
    const started = await startMemoryTask(project, { description: "Classify transferred chat notes", chatId: "chat-first" });
    const resumed = await resumeMemoryTask(project, started.taskId, {
      chatId: "chat-second",
      expectedRevision: started.stateRevision,
      takeover: true,
    });
    const review = await prepareClosure(project, resumed.taskId, { chatId: "chat-second", expectedRevision: resumed.stateRevision });
    const reviewDocument = parseMarkdown(await readFile(review, "utf8"));
    reviewDocument.data.status = "approved";
    reviewDocument.data.reviewer = "memory-closure-test";
    reviewDocument.data.findings_resolved = true;
    reviewDocument.data.unresolved_findings = [];
    reviewDocument.data.promotion_references = [];
    reviewDocument.data.knowledge_review = (await markdownNotes(resumed.taskPath)).filter((file) => !file.includes(`chats${path.sep}${resumed.bindingId!}${path.sep}`)).map((file) => ({ path: file, classification: "transient", promotion_references: [] }));
    await writeFile(review, renderMarkdown(reviewDocument.data, reviewDocument.body));
    await expect(finalizeClosure(project, resumed.taskId, { chatId: "chat-second", expectedRevision: resumed.stateRevision })).rejects.toThrow("Every task note must be classified");
  });
});
