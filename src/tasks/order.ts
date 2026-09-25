import { lstat } from "node:fs/promises";
import path from "node:path";
import { exists, readText } from "../core/fs.js";
import { parseMarkdown, renderMarkdown } from "../frontmatter/index.js";
import { assertNoPending, withProjectLock, writeTransaction } from "./transactions.js";

export interface MemoryTaskOrderEntry { taskId: string; position: number }
export interface MemoryTaskPlacement { before?: string; after?: string; position?: number }
interface OrderDocument { entries: MemoryTaskOrderEntry[]; diagnostics: string[] }

const uuid = (value: unknown): value is string => typeof value === "string" && /^[0-9a-f]{8}-[0-9a-f]{4}-[1-8][0-9a-f]{3}-[89ab][0-9a-f]{3}-[0-9a-f]{12}$/i.test(value);
const orderPath = (root: string): string => path.join(root, "tasks", "ORDER.md");
const validPosition = (value: unknown): value is number => typeof value === "number" && Number.isSafeInteger(value) && value > 0;

async function readOrder(root: string): Promise<OrderDocument> {
  const file = orderPath(root);
  if (!await exists(file)) return { entries: [], diagnostics: [] };
  if (!(await lstat(file)).isFile()) return { entries: [], diagnostics: ["Task order must be a regular file"] };
  try {
    const data = parseMarkdown(await readText(file)).data;
    const diagnostics: string[] = [];
    if (data.version !== 1) diagnostics.push("Task order has unsupported version");
    if (!Array.isArray(data.entries)) return { entries: [], diagnostics: [...diagnostics, "Task order entries must be an array"] };
    const entries: MemoryTaskOrderEntry[] = [];
    const taskIds = new Set<string>();
    const positions = new Set<number>();
    for (const entry of data.entries) {
      if (!entry || typeof entry !== "object" || Array.isArray(entry)) {
        diagnostics.push("Task order entry must be a mapping");
        continue;
      }
      const value = entry as { task_id?: unknown; position?: unknown };
      if (!uuid(value.task_id)) {
        diagnostics.push("Task order entry has invalid task ID");
        continue;
      }
      if (!validPosition(value.position)) {
        diagnostics.push(`Task order has invalid position for ${value.task_id}`);
        continue;
      }
      if (taskIds.has(value.task_id)) diagnostics.push(`Task order has duplicate task ID: ${value.task_id}`);
      if (positions.has(value.position)) diagnostics.push(`Task order has duplicate position: ${value.position}`);
      taskIds.add(value.task_id);
      positions.add(value.position);
      entries.push({ taskId: value.task_id, position: value.position });
    }
    return { entries, diagnostics };
  } catch (error) {
    return { entries: [], diagnostics: [error instanceof Error ? `Task order is invalid: ${error.message}` : `Task order is invalid: ${String(error)}`] };
  }
}

export async function memoryTaskOrder(root: string): Promise<MemoryTaskOrderEntry[]> {
  return (await readOrder(root)).entries;
}

export async function validateMemoryTaskOrder(root: string, knownTaskIds: Iterable<string>): Promise<string[]> {
  const order = await readOrder(root);
  const known = new Set(knownTaskIds);
  for (const entry of order.entries) if (!known.has(entry.taskId)) order.diagnostics.push(`Task order references unknown task ID: ${entry.taskId}`);
  return order.diagnostics;
}

function placementIndex(ids: string[], taskId: string, placement: MemoryTaskPlacement): number {
  const choices = [placement.before, placement.after, placement.position].filter(value => value !== undefined);
  if (choices.length !== 1) throw new Error("Specify exactly one task placement");
  if (placement.before !== undefined) {
    const index = ids.indexOf(placement.before);
    if (index === -1) throw new Error(`Unknown task: ${placement.before}`);
    return index;
  }
  if (placement.after !== undefined) {
    const index = ids.indexOf(placement.after);
    if (index === -1) throw new Error(`Unknown task: ${placement.after}`);
    return index + 1;
  }
  if (!validPosition(placement.position)) throw new Error("Task position must be a positive safe integer");
  if (placement.position > ids.length + 1) throw new Error("Task position is outside the current task queue");
  return placement.position - 1;
}

/** Rewrites only tasks/ORDER.md; task state, bindings, and revisions remain untouched. */
export async function reorderMemoryTask(root: string, taskId: string, placement: MemoryTaskPlacement): Promise<MemoryTaskOrderEntry[]> {
  if (!uuid(taskId)) throw new Error("Invalid task ID");
  return withProjectLock(root, async () => {
    await assertNoPending(root);
    const { activeMemoryTaskIds, allMemoryTaskIds } = await import("./memory.js");
    const active = await activeMemoryTaskIds(root);
    if (!active.includes(taskId)) throw new Error(`Unknown task: ${taskId}`);
    const diagnostics = await validateMemoryTaskOrder(root, await allMemoryTaskIds(root));
    if (diagnostics.length) throw new Error(`Task order is invalid; repair it before reordering: ${diagnostics.join("; ")}`);
    const positions = new Map((await readOrder(root)).entries.map(entry => [entry.taskId, entry.position]));
    const queue = [...active].sort((a, b) => (positions.get(a) ?? Number.MAX_SAFE_INTEGER) - (positions.get(b) ?? Number.MAX_SAFE_INTEGER) || a.localeCompare(b));
    queue.splice(queue.indexOf(taskId), 1);
    queue.splice(placementIndex(queue, taskId, placement), 0, taskId);
    const entries = queue.map((id, index) => ({ taskId: id, position: index + 1 }));
    await writeTransaction(root, new Map([[orderPath(root), renderMarkdown({ version: 1, entries: entries.map(entry => ({ task_id: entry.taskId, position: entry.position })) }, "# Task Order\n\nExplicit queue positions for active task records.\n")]]));
    return entries;
  });
}
