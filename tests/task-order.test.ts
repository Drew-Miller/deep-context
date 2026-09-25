import { mkdtemp, readFile, rm, writeFile } from "node:fs/promises";
import os from "node:os";
import path from "node:path";
import { afterEach, describe, expect, it } from "vitest";
import { initProject } from "../src/projects/index.js";
import { renderMarkdown } from "../src/frontmatter/index.js";
import { listMemoryTasks, startMemoryTask, validateMemoryTasks } from "../src/tasks/memory.js";
import { reorderMemoryTask } from "../src/tasks/order.js";

const cleanup: string[] = [];
afterEach(async () => { await Promise.all(cleanup.splice(0).map(root => rm(root, { recursive: true, force: true }))); });

async function fixture(): Promise<string> {
  const root = await mkdtemp(path.join(os.tmpdir(), "deep task order "));
  cleanup.push(root);
  return initProject(root, { name: "order" });
}

describe("memory task ordering", () => {
  it("persists explicit queue order independently of task state and bindings", async () => {
    const project = await fixture();
    const first = await startMemoryTask(project, { chatId: "first", name: "First", description: "First task" });
    const second = await startMemoryTask(project, { chatId: "second", name: "Second", description: "Second task" });
    const firstState = await readFile(path.join(first.taskPath, "TASK_STATE.md"), "utf8");
    const firstBinding = await readFile(path.join(first.taskPath, "chats", first.bindingId!, "MEMORY.md"), "utf8");

    expect((await listMemoryTasks(project)).map(task => task.queuePosition)).toEqual([null, null]);
    await reorderMemoryTask(project, first.taskId, { after: second.taskId });
    const reopened = await listMemoryTasks(project);
    expect(reopened.map(task => [task.taskId, task.queuePosition])).toEqual([[second.taskId, 1], [first.taskId, 2]]);
    await reorderMemoryTask(project, first.taskId, { before: second.taskId });
    expect((await listMemoryTasks(project)).map(task => task.taskId)).toEqual([first.taskId, second.taskId]);
    expect(await readFile(path.join(first.taskPath, "TASK_STATE.md"), "utf8")).toBe(firstState);
    expect(await readFile(path.join(first.taskPath, "chats", first.bindingId!, "MEMORY.md"), "utf8")).toBe(firstBinding);
    expect(await readFile(path.join(project, "tasks", "ORDER.md"), "utf8")).toContain("version: 1");
  });

  it("diagnoses malformed, duplicate, and unknown queue entries without changing task records", async () => {
    const project = await fixture();
    const task = await startMemoryTask(project, { chatId: "known", description: "Known task" });
    const unknown = "00000000-0000-4000-8000-000000000000";
    await writeFile(path.join(project, "tasks", "ORDER.md"), renderMarkdown({ version: 1, entries: [
      { task_id: task.taskId, position: 1 },
      { task_id: task.taskId, position: 1 },
      { task_id: unknown, position: 0 }
    ] }, "# Task Order"));

    const diagnostics = await validateMemoryTasks(project);
    expect(diagnostics).toContain(`Task order has duplicate task ID: ${task.taskId}`);
    expect(diagnostics).toContain("Task order has duplicate position: 1");
    expect(diagnostics).toContain(`Task order has invalid position for ${unknown}`);
    await expect(reorderMemoryTask(project, unknown, { position: 1 })).rejects.toThrow(`Unknown task: ${unknown}`);
    await expect(reorderMemoryTask(project, task.taskId, { position: 1 })).rejects.toThrow("Task order is invalid");
  });

  it("reports valid-position references to unknown task IDs", async () => {
    const project = await fixture();
    await startMemoryTask(project, { chatId: "known", description: "Known task" });
    const unknown = "00000000-0000-4000-8000-000000000000";
    await writeFile(path.join(project, "tasks", "ORDER.md"), renderMarkdown({ version: 1, entries: [{ task_id: unknown, position: 1 }] }, "# Task Order"));
    expect(await validateMemoryTasks(project)).toContain(`Task order references unknown task ID: ${unknown}`);
  });
});
