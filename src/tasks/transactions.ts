import { randomUUID } from "node:crypto";
import { lstat, readdir, rm } from "node:fs/promises";
import path from "node:path";
import { atomicWrite, createExclusive, ensureDir, exists, readText, within } from "../core/fs.js";

export async function withProjectLock<T>(root: string, action: () => Promise<T>): Promise<T> {
  const target = path.join(root, ".local/locks/project.lock");
  const token = randomUUID();
  if (!await createExclusive(target, JSON.stringify({ token, pid: process.pid }))) throw new Error("Project task state is busy. Inspect the lock; an abandoned lock requires explicit repair-tasks --unlock <token>.");
  try { return await action(); }
  finally {
    const saved = JSON.parse(await readText(target));
    if (saved.token !== token) throw new Error("Project lock ownership changed unexpectedly");
    await rm(target);
  }
}

interface Write { path: string; before: string | null; after: string }
interface Transaction { version: 1; status: "pending" | "committed"; writes: Write[] }
export async function pendingTransactions(root: string): Promise<string[]> {
  const directory = path.join(root, ".local/operations");
  if (!await exists(directory)) return [];
  const pending: string[] = [];
  for (const name of (await readdir(directory)).sort()) {
    if (!name.endsWith(".json")) continue;
    const target = path.join(directory, name);
    const data = JSON.parse(await readText(target));
    if (data.status !== "committed") pending.push(target);
  }
  return pending;
}
export async function assertNoPending(root: string): Promise<void> {
  if ((await pendingTransactions(root)).length) throw new Error("Task operation is incomplete; run repair-tasks before continuing");
}
async function safeTarget(root: string, relative: string): Promise<string> {
  const target = path.resolve(root, relative);
  if (!within(path.join(root, "tasks"), target) || target === path.join(root, "tasks")) throw new Error("Transaction target escapes task storage");
  let current = target;
  while (within(root, current) && current !== root) {
    try { if ((await lstat(current)).isSymbolicLink()) throw new Error("Task transaction rejects symlink targets"); }
    catch (error) { if ((error as NodeJS.ErrnoException).code !== "ENOENT") throw error; }
    current = path.dirname(current);
  }
  return target;
}
async function applyTransaction(root: string, file: string, tx: Transaction): Promise<void> {
  if (tx.version !== 1 || !Array.isArray(tx.writes) || !tx.writes.length) throw new Error("Unknown transaction format; preserve operation for manual review");
  const targets = new Set<string>();
  for (const write of tx.writes) {
    if (typeof write.path !== "string" || typeof write.after !== "string" || (write.before !== null && typeof write.before !== "string")) throw new Error("Invalid transaction write");
    const target = await safeTarget(root, write.path);
    if (targets.has(target)) throw new Error("Duplicate transaction path");
    targets.add(target);
    const current = await exists(target) ? await readText(target) : null;
    if (current !== write.before && current !== write.after) throw new Error(`Recovery refuses changed task notes: ${write.path}`);
  }
  for (const write of tx.writes) await atomicWrite(await safeTarget(root, write.path), write.after);
  await atomicWrite(file, JSON.stringify({ ...tx, status: "committed" }));
}
/** Caller holds the project lock. All intended contents are durable before any task file changes. */
export async function writeTransaction(root: string, writes: Map<string, string>): Promise<void> {
  await assertNoPending(root);
  const tx: Transaction = { version: 1, status: "pending", writes: [] };
  for (const [target, after] of writes) {
    const relative = path.relative(root, target);
    await safeTarget(root, relative);
    tx.writes.push({ path: relative, before: await exists(target) ? await readText(target) : null, after });
  }
  const file = path.join(root, ".local/operations", `${randomUUID()}.json`);
  await atomicWrite(file, JSON.stringify(tx));
  await applyTransaction(root, file, tx);
}
export async function repairTransactions(root: string, unlock?: string): Promise<string[]> {
  if (unlock) {
    const target = path.join(root, ".local/locks/project.lock");
    const lock = JSON.parse(await readText(target));
    if (lock.token !== unlock || !Number.isInteger(lock.pid) || lock.pid <= 0) throw new Error("Lock identity mismatch");
    try { process.kill(lock.pid, 0); throw new Error("Lock owner is still alive; cannot unlock"); }
    catch (error) { if ((error as NodeJS.ErrnoException).code !== "ESRCH") throw error; }
    await rm(target);
  }
  return withProjectLock(root, async () => {
    const pending = await pendingTransactions(root);
    for (const file of pending) await applyTransaction(root, file, JSON.parse(await readText(file)) as Transaction);
    return pending;
  });
}
