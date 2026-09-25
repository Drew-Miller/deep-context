import { execFile } from "node:child_process";
import { mkdtemp, readFile, rm } from "node:fs/promises";
import os from "node:os";
import path from "node:path";
import { promisify } from "node:util";
import { afterEach, describe, expect, it } from "vitest";
import { captureBacklog } from "../src/backlog/index.js";
import { reorderBacklog } from "../src/backlog/order.js";
import { parseMarkdown } from "../src/frontmatter/index.js";
import { initProject } from "../src/projects/index.js";
import { listMemoryTasks, startMemoryTask } from "../src/tasks/memory.js";
import { reorderMemoryTask } from "../src/tasks/order.js";

const exec = promisify(execFile);
const cleanup: string[] = [];
const cli = path.resolve("plugins/deep-context/bin/deep-context.cjs");

afterEach(async () => { await Promise.all(cleanup.splice(0).map(target => rm(target, { recursive: true, force: true }))); });

describe("DC-14 ordering integration", () => {
  it("keeps reversed Backlog and task order through generated-index rebuild and a fresh CLI process", async () => {
    const home = await mkdtemp(path.join(os.tmpdir(), "deep-dc14-integration-"));
    cleanup.push(home);
    const project = await initProject(home, { name: "dc14", register: false });
    const firstBacklogPath = await captureBacklog(project, { title: "First queue item", pitch: "First fixture record", provenance: "Integration test" });
    const secondBacklogPath = await captureBacklog(project, { title: "Second queue item", pitch: "Second fixture record", provenance: "Integration test" });
    const firstBacklogId = String(parseMarkdown(await readFile(firstBacklogPath, "utf8")).data.id);
    const secondBacklogId = String(parseMarkdown(await readFile(secondBacklogPath, "utf8")).data.id);

    expect((await reorderBacklog(project, firstBacklogId, { before: secondBacklogId })).map(item => item.id)).toEqual([firstBacklogId, secondBacklogId]);
    expect((await reorderBacklog(project, secondBacklogId, { before: firstBacklogId })).map(item => item.id)).toEqual([secondBacklogId, firstBacklogId]);

    const firstTask = await startMemoryTask(project, { name: "First task", description: "First task objective", chatId: "first-chat" });
    const secondTask = await startMemoryTask(project, { name: "Second task", description: "Second task objective", chatId: "second-chat" });
    const firstState = await readFile(path.join(firstTask.taskPath, "TASK_STATE.md"), "utf8");
    const firstBinding = await readFile(path.join(firstTask.taskPath, "chats", firstTask.bindingId!, "MEMORY.md"), "utf8");

    expect((await reorderMemoryTask(project, firstTask.taskId, { before: secondTask.taskId })).map(item => item.taskId)).toEqual([firstTask.taskId, secondTask.taskId]);
    expect((await reorderMemoryTask(project, secondTask.taskId, { before: firstTask.taskId })).map(item => item.taskId)).toEqual([secondTask.taskId, firstTask.taskId]);
    expect((await listMemoryTasks(project)).map(item => [item.taskId, item.queuePosition])).toEqual([[secondTask.taskId, 1], [firstTask.taskId, 2]]);
    expect(await readFile(path.join(firstTask.taskPath, "TASK_STATE.md"), "utf8")).toBe(firstState);
    expect(await readFile(path.join(firstTask.taskPath, "chats", firstTask.bindingId!, "MEMORY.md"), "utf8")).toBe(firstBinding);

    await rm(path.join(project, "doc", "BACKLOG.md"));
    await rm(path.join(project, ".local", "chat-index.json"), { force: true });
    await exec(process.execPath, [cli, "rebuild-indexes", "--project", project]);

    const rebuiltBacklog = await readFile(path.join(project, "doc", "BACKLOG.md"), "utf8");
    expect(rebuiltBacklog.indexOf(`| 1 | ${secondBacklogId} |`)).toBeLessThan(rebuiltBacklog.indexOf(`| 2 | ${firstBacklogId} |`));
    const listed = JSON.parse((await exec(process.execPath, [cli, "list-tasks", "--project", project, "--json"])).stdout) as Array<{ taskId: string; queuePosition: number; ownerBindingId: string | null }>;
    expect(listed.map(item => [item.taskId, item.queuePosition])).toEqual([[secondTask.taskId, 1], [firstTask.taskId, 2]]);
    const resolved = JSON.parse((await exec(process.execPath, [cli, "resolve-task", "--project", project, "--task", firstTask.taskId, "--binding-id", firstTask.bindingId!, "--json"])).stdout) as { taskId: string; ownerBindingId: string; isOwner: boolean; stateRevision: number };
    expect(resolved).toMatchObject({ taskId: firstTask.taskId, ownerBindingId: firstTask.bindingId, isOwner: true, stateRevision: firstTask.stateRevision });
  });
});
