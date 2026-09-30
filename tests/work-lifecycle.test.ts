import { mkdtemp, mkdir, readFile, rm, writeFile } from "node:fs/promises";
import os from "node:os";
import path from "node:path";
import { afterEach, describe, expect, it } from "vitest";
import { activateWorkItem, captureWorkItem, completeWorkItem } from "../src/backlog/index.js";
import { reorderWorkItems } from "../src/backlog/order.js";
import { parseMarkdown } from "../src/frontmatter/index.js";
import { startMemoryTask } from "../src/tasks/memory.js";

const cleanup: string[] = [];
afterEach(async () => Promise.all(cleanup.splice(0).map(target => rm(target, { recursive: true, force: true }))));

async function compactFixture(): Promise<string> {
  const root = await mkdtemp(path.join(os.tmpdir(), "deep-work-lifecycle-"));
  cleanup.push(root);
  await Promise.all(["work/items", "docs", "tasks", ".local/operations", ".local/locks"].map(directory => mkdir(path.join(root, directory), { recursive: true })));
  await writeFile(path.join(root, ".local/state.json"), JSON.stringify({ layout: "compact-v1" }));
  return root;
}

describe("compact work lifecycle", () => {
  it("keeps one canonical record through queue, execution, and explicit completion", async () => {
    const root = await compactFixture();
    const first = await captureWorkItem(root, { title: "Same title", pitch: "First objective", provenance: "fixture" });
    const second = await captureWorkItem(root, { title: "Same title", pitch: "Second objective", provenance: "fixture" });
    expect(path.basename(second)).toBe("same-title-2.md");
    const firstId = parseMarkdown(await readFile(first, "utf8")).data.id as string;
    const secondId = parseMarkdown(await readFile(second, "utf8")).data.id as string;
    await reorderWorkItems(root, secondId, { before: firstId });
    await activateWorkItem(root, firstId, "Execute the first objective");
    await completeWorkItem(root, firstId, "Implemented with one durable outcome.", ["desktop check"]);
    const finished = parseMarkdown(await readFile(first, "utf8")).data;
    expect(finished).toMatchObject({ status: "done", outcome: "Implemented with one durable outcome.", open_gates: ["desktop check"] });
  });

  it("records task and work-item links in one task transaction", async () => {
    const root = await compactFixture();
    const work = await captureWorkItem(root, { title: "Linked objective", pitch: "Use an execution task", provenance: "fixture" });
    const id = String(parseMarkdown(await readFile(work, "utf8")).data.id);
    const task = await startMemoryTask(root, { name: "Linked task", description: "Execute linked objective", chatId: "linked-chat", workItems: [id] });
    expect(parseMarkdown(await readFile(work, "utf8")).data.tasks).toEqual([task.taskId]);
    expect(parseMarkdown(await readFile(path.join(task.taskPath, "TASK_STATE.md"), "utf8")).data.work_items).toEqual([id]);
  });
});
