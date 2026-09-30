import path from "node:path";
import { stringify } from "yaml";
import { readText } from "../core/fs.js";
import { isForwarder, markdownRecords } from "../core/records.js";
import { layoutPaths } from "../core/layout.js";
import { parseMarkdown } from "../frontmatter/index.js";
import { backlogSchema, workItemSchema } from "../frontmatter/schemas.js";
import { rebuildIndexes } from "../indexing/index.js";
import { assertNoPending, withProjectLock, writeTransaction } from "../tasks/transactions.js";
import { assertNoPendingContext, writeContextOperation } from "./transactions.js";
import { assertNoPendingFilenameOperations } from "../migration/transactions.js";

export interface Placement { before?: string; after?: string; position?: number }

export async function reorderBacklog(root: string, id: string, placement: Placement): Promise<Array<{ id: string; queuePosition: number }>> {
  if (layoutPaths(root).compact) return reorderWorkItems(root, id, placement);
  return withProjectLock(root, async () => {
    await assertNoPendingContext(root);
    await assertNoPendingFilenameOperations(root);
    if (Number(placement.before !== undefined) + Number(placement.after !== undefined) + Number(placement.position !== undefined) !== 1) {
      throw new Error("Choose exactly one of before, after, or position");
    }
    const queue = (await markdownRecords(path.join(root, "doc", "backlog")))
      .filter(({ data }) => !isForwarder(data))
      .map(({ file, data }) => ({ file, data: backlogSchema.parse(data) }))
      .filter(({ data }) => data.status === "proposed" || data.status === "planned")
      .sort((a, b) => (a.data.queue_position ?? Number.POSITIVE_INFINITY) - (b.data.queue_position ?? Number.POSITIVE_INFINITY) || a.data.id.localeCompare(b.data.id));
    const moving = queue.find((item) => item.data.id === id);
    if (!moving) throw new Error(`Unknown or non-queueable Backlog ID: ${id}`);
    const rest = queue.filter((item) => item !== moving);
    let index: number;
    if (placement.before !== undefined || placement.after !== undefined) {
      const anchor = placement.before ?? placement.after!;
      if (anchor === id) throw new Error("A Backlog item cannot be placed relative to itself");
      const anchorIndex = rest.findIndex((item) => item.data.id === anchor);
      if (anchorIndex < 0) throw new Error(`Unknown or non-queueable Backlog anchor: ${anchor}`);
      index = anchorIndex + Number(placement.after !== undefined);
    } else {
      const position = placement.position!;
      if (!Number.isSafeInteger(position) || position < 1 || position > queue.length) throw new Error(`Invalid Backlog position: ${position}`);
      index = position - 1;
    }
    rest.splice(index, 0, moving);
    const writes = new Map<string, string>();
    for (const [offset, item] of rest.entries()) {
      if (item.data.queue_position === offset + 1) continue;
      const document = parseMarkdown(await readText(item.file));
      document.data.queue_position = offset + 1;
      writes.set(item.file, `---\n${stringify(document.data).trimEnd()}\n---\n${document.body}`);
    }
    if (writes.size) {
      await writeContextOperation(root, writes);
      await rebuildIndexes(root);
    }
    return rest.map((item, offset) => ({ id: item.data.id, queuePosition: offset + 1 }));
  });
}

export async function reorderWorkItems(root: string, id: string, placement: Placement): Promise<Array<{ id: string; queuePosition: number }>> {
  return withProjectLock(root, async () => {
    await assertNoPending(root);
    await assertNoPendingContext(root);
    await assertNoPendingFilenameOperations(root);
    if (Number(placement.before !== undefined) + Number(placement.after !== undefined) + Number(placement.position !== undefined) !== 1) throw new Error("Choose exactly one of before, after, or position");
    const layout = layoutPaths(root);
    if (!layout.compact) throw new Error("Compact work items require the compact layout");
    const queue = (await markdownRecords(layout.work)).filter(({ data }) => !isForwarder(data)).map(({ file, data }) => ({ file, data: workItemSchema.parse(data) })).filter(({ data }) => data.status === "proposed" || data.status === "planned").sort((a, b) => (a.data.order ?? Number.POSITIVE_INFINITY) - (b.data.order ?? Number.POSITIVE_INFINITY) || a.data.id.localeCompare(b.data.id));
    const moving = queue.find(item => item.data.id === id || item.data.aliases.includes(id));
    if (!moving) throw new Error(`Unknown or non-queueable work item: ${id}`);
    const rest = queue.filter(item => item !== moving);
    let index: number;
    if (placement.before !== undefined || placement.after !== undefined) {
      const anchor = placement.before ?? placement.after!;
      if (anchor === id) throw new Error("A work item cannot be placed relative to itself");
      const anchorIndex = rest.findIndex(item => item.data.id === anchor || item.data.aliases.includes(anchor));
      if (anchorIndex < 0) throw new Error(`Unknown or non-queueable work item anchor: ${anchor}`);
      index = anchorIndex + Number(placement.after !== undefined);
    } else {
      if (!Number.isSafeInteger(placement.position) || placement.position! < 1 || placement.position! > queue.length) throw new Error(`Invalid work item position: ${placement.position}`);
      index = placement.position! - 1;
    }
    rest.splice(index, 0, moving);
    const writes = new Map<string, string>();
    for (const [offset, item] of rest.entries()) {
      if (item.data.order === offset + 1) continue;
      const document = parseMarkdown(await readText(item.file));
      document.data.order = offset + 1;
      writes.set(item.file, `---\n${stringify(document.data).trimEnd()}\n---\n${document.body}`);
    }
    if (writes.size) { await writeTransaction(root, writes); await rebuildIndexes(root); }
    return rest.map((item, offset) => ({ id: item.data.id, queuePosition: offset + 1 }));
  });
}
