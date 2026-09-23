import { randomUUID } from "node:crypto";
import { lstat, readdir } from "node:fs/promises";
import path from "node:path";
import { atomicWrite, exists, readText, within } from "../core/fs.js";
import { rebuildIndexes } from "../indexing/index.js";
import { withProjectLock } from "../tasks/transactions.js";

interface Write { path: string; before: string | null; after: string }
interface Operation { version: 1; status: "pending" | "committed"; writes: Write[] }

function operationDirectory(root: string): string { return path.join(root, ".local", "context-operations"); }

async function safeTarget(root: string, relative: string): Promise<string> {
  const target = path.resolve(root, relative);
  const backlog = path.join(root, "doc", "backlog");
  const active = path.join(root, "doc", "active");
  if ((!within(backlog, target) || target === backlog) && (!within(active, target) || target === active)) throw new Error("Context operation target is outside Backlog or Active storage");
  if (!target.endsWith(".md")) throw new Error("Context operation target must be Markdown");
  let current = target;
  while (current !== root && within(root, current)) {
    try { if ((await lstat(current)).isSymbolicLink()) throw new Error("Context operation rejects symlink target"); }
    catch (error) { if ((error as NodeJS.ErrnoException).code !== "ENOENT") throw error; }
    current = path.dirname(current);
  }
  return target;
}

export async function pendingContextOperations(root: string): Promise<string[]> {
  const directory = operationDirectory(root);
  if (!await exists(directory)) return [];
  const result: string[] = [];
  for (const name of (await readdir(directory)).sort()) {
    if (!name.endsWith(".json")) continue;
    const file = path.join(directory, name);
    const operation = JSON.parse(await readText(file)) as Partial<Operation>;
    if (operation.status !== "committed") result.push(file);
  }
  return result;
}

export async function assertNoPendingContext(root: string): Promise<void> {
  if ((await pendingContextOperations(root)).length) throw new Error("Backlog operation needs repair-context before new changes");
}

async function applyOperation(root: string, file: string, operation: Operation): Promise<void> {
  if (operation.version !== 1 || !Array.isArray(operation.writes) || !operation.writes.length) throw new Error("Invalid Backlog recovery journal");
  const targets = new Set<string>();
  for (const write of operation.writes) {
    if (typeof write.path !== "string" || typeof write.after !== "string" || (write.before !== null && typeof write.before !== "string")) throw new Error("Invalid Backlog recovery write");
    const target = await safeTarget(root, write.path);
    if (targets.has(target)) throw new Error("Duplicate Backlog recovery path");
    targets.add(target);
    const current = await exists(target) ? await readText(target) : null;
    if (current !== write.before && current !== write.after) throw new Error(`Recovery refuses changed context: ${write.path}`);
  }
  for (const write of operation.writes) await atomicWrite(await safeTarget(root, write.path), write.after);
  await atomicWrite(file, JSON.stringify({ ...operation, status: "committed" }));
}

/** Caller holds the project lock. Persist intent before changing any canonical document. */
export async function writeContextOperation(root: string, writes: Map<string, string>): Promise<void> {
  await assertNoPendingContext(root);
  const operation: Operation = { version: 1, status: "pending", writes: [] };
  for (const [target, after] of writes) {
    const safe = await safeTarget(root, path.relative(root, target));
    operation.writes.push({ path: path.relative(root, safe), before: await exists(safe) ? await readText(safe) : null, after });
  }
  const file = path.join(operationDirectory(root), `${randomUUID()}.json`);
  await atomicWrite(file, JSON.stringify(operation));
  await applyOperation(root, file, operation);
}

export async function repairContextOperations(root: string): Promise<string[]> {
  return withProjectLock(root, async () => {
    const pending = await pendingContextOperations(root);
    for (const file of pending) await applyOperation(root, file, JSON.parse(await readText(file)) as Operation);
    await rebuildIndexes(root);
    return pending;
  });
}
