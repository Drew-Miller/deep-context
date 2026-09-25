import { randomUUID } from "node:crypto";
import { lstat, readdir } from "node:fs/promises";
import path from "node:path";
import { atomicWrite, exists, readText, within } from "../core/fs.js";
import { rebuildIndexes } from "../indexing/index.js";
import { withProjectLock } from "../tasks/transactions.js";

interface Write { path: string; before: string | null; after: string }
interface Operation { version: 1; status: "pending" | "committed"; writes: Write[] }

const collections = ["requirements", "decisions", "reports", "sources"] as const;
const operationDirectory = (root: string): string => path.join(root, ".local", "filename-operations");

async function safeTarget(root: string, relative: string): Promise<string> {
  const target = path.resolve(root, relative);
  if (!target.endsWith(".md") || !collections.some((name) => {
    const directory = path.join(root, "doc", name);
    return within(directory, target) && target !== directory;
  })) throw new Error(`Filename operation target is outside approved record storage: ${relative}`);
  let current = target;
  while (current !== root && within(root, current)) {
    try { if ((await lstat(current)).isSymbolicLink()) throw new Error(`Filename operation rejects symlink target: ${relative}`); }
    catch (error) { if ((error as NodeJS.ErrnoException).code !== "ENOENT") throw error; }
    current = path.dirname(current);
  }
  return target;
}

export async function pendingFilenameOperations(root: string): Promise<string[]> {
  const directory = operationDirectory(root);
  if (!await exists(directory)) return [];
  const pending: string[] = [];
  for (const name of (await readdir(directory)).sort()) {
    if (!name.endsWith(".json")) continue;
    const file = path.join(directory, name);
    const operation = JSON.parse(await readText(file)) as Partial<Operation>;
    if (operation.status !== "committed") pending.push(file);
  }
  return pending;
}

export async function assertNoPendingFilenameOperations(root: string): Promise<void> {
  if ((await pendingFilenameOperations(root)).length) throw new Error("Filename operation needs repair-filenames before new changes");
}

async function applyOperation(root: string, file: string, operation: Operation): Promise<void> {
  if (operation.version !== 1 || !Array.isArray(operation.writes) || !operation.writes.length) throw new Error("Invalid filename recovery journal");
  const targets = new Set<string>();
  for (const write of operation.writes) {
    if (typeof write.path !== "string" || typeof write.after !== "string" || (write.before !== null && typeof write.before !== "string")) throw new Error("Invalid filename recovery write");
    const target = await safeTarget(root, write.path);
    if (targets.has(target)) throw new Error(`Duplicate filename recovery path: ${write.path}`);
    targets.add(target);
    const current = await exists(target) ? await readText(target) : null;
    if (current !== write.before && current !== write.after) throw new Error(`Recovery refuses changed record: ${write.path}`);
  }
  for (const write of operation.writes) await atomicWrite(await safeTarget(root, write.path), write.after);
  await atomicWrite(file, JSON.stringify({ ...operation, status: "committed" }));
}

/** Caller holds the shared project lock. Original and destination bytes are journaled before writes. */
export async function writeFilenameOperation(root: string, writes: Map<string, string>): Promise<void> {
  await assertNoPendingFilenameOperations(root);
  const operation: Operation = { version: 1, status: "pending", writes: [] };
  for (const [target, after] of writes) {
    const safe = await safeTarget(root, path.relative(root, target));
    operation.writes.push({ path: path.relative(root, safe), before: await exists(safe) ? await readText(safe) : null, after });
  }
  if (!operation.writes.length) return;
  const file = path.join(operationDirectory(root), `${randomUUID()}.json`);
  await atomicWrite(file, JSON.stringify(operation));
  await applyOperation(root, file, operation);
}

export async function repairFilenameOperations(root: string): Promise<string[]> {
  return withProjectLock(root, async () => {
    const pending = await pendingFilenameOperations(root);
    for (const file of pending) await applyOperation(root, file, JSON.parse(await readText(file)) as Operation);
    await rebuildIndexes(root);
    return pending;
  });
}
