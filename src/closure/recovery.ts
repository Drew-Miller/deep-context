import { createHash } from "node:crypto";
import { readdir, readFile, realpath, rm } from "node:fs/promises";
import path from "node:path";
import { atomicWrite, exists } from "../core/fs.js";
import { git } from "../core/git.js";
import { parseMarkdown } from "../frontmatter/index.js";
import { sourceSnapshot, type SourceBinding } from "../tasks/source.js";
import { rebuildIndexes } from "../indexing/index.js";

interface Receipt { taskId: string; taskDigest: string; archiveDigest: string; contextDigest: string; source: string }

async function digestTree(root: string, skip: (relative: string) => boolean = () => false): Promise<string> {
  const hash = createHash("sha256");
  async function walk(directory: string): Promise<void> {
    if (!(await exists(directory))) return;
    for (const entry of (await readdir(directory, { withFileTypes: true })).sort((a, b) => a.name.localeCompare(b.name))) {
      const file = path.join(directory, entry.name);
      const relative = path.relative(root, file);
      if (skip(relative)) continue;
      if (entry.isSymbolicLink()) throw new Error(`Closure recovery rejects symlink: ${file}`);
      if (entry.isDirectory()) await walk(file);
      else if (entry.isFile()) hash.update(relative).update(await readFile(file));
    }
  }
  await walk(root);
  return hash.digest("hex");
}

const skipWorktree = (relative: string) => relative === "worktree" || relative.startsWith(`worktree${path.sep}`);
async function contextDigest(root: string): Promise<string> {
  const hash = createHash("sha256");
  hash.update(await digestTree(path.join(root, "doc"), (relative) => relative.startsWith(`reports${path.sep}closures${path.sep}`) || (!relative.includes(path.sep) && relative !== "ARCHITECTURE.md")));
  for (const file of ["AGENTS.md", "CONTEXT_MAP.md", "PROJECT.md", "START_HERE.md", "docs/plan/TASKS.md", "docs/plan/STATUS.json"]) {
    if (await exists(path.join(root, file))) hash.update(file).update(await readFile(path.join(root, file)));
  }
  return hash.digest("hex");
}

function paths(root: string, taskRoot: string, taskId: unknown) {
  if (typeof taskId !== "string" || !/^[0-9a-f-]{36}$/i.test(taskId)) throw new Error("Invalid closure task identity");
  return { receipt: path.join(root, ".local/closure-operations", `${path.basename(taskRoot)}.json`), archive: path.join(root, ".local/archives", taskId) };
}

/** Stage a durable receipt only after the entire memory archive has been written. */
export async function stageClosure(root: string, taskRoot: string, state: Record<string, unknown>): Promise<void> {
  const target = paths(root, taskRoot, state.task_id);
  const receipt: Receipt = {
    taskId: String(state.task_id), taskDigest: await digestTree(taskRoot, skipWorktree),
    archiveDigest: await digestTree(target.archive), contextDigest: await contextDigest(root),
    source: JSON.stringify(await sourceSnapshot(root, state.source_binding as SourceBinding)),
  };
  await atomicWrite(target.receipt, JSON.stringify(receipt));
}

/** A failed cleanup can be retried without destroying changed notes or a changed archive. */
export async function recoverClosure(root: string, taskRoot: string, state: Record<string, unknown>): Promise<string | undefined> {
  const target = paths(root, taskRoot, state.task_id);
  if (!(await exists(target.receipt))) return undefined;
  const receipt = JSON.parse(await readFile(target.receipt, "utf8")) as Receipt;
  if (receipt.taskId !== state.task_id || receipt.taskDigest !== await digestTree(taskRoot, skipWorktree) || receipt.archiveDigest !== await digestTree(target.archive) || receipt.contextDigest !== await contextDigest(root)) throw new Error("Closure recovery evidence changed; preserve task and archive for review");
  const binding = state.source_binding as SourceBinding;
  const owned = binding.ownership === "deep-context";
  const worktree = path.join(taskRoot, "worktree");
  if (!owned || await exists(worktree)) {
    if (receipt.source !== JSON.stringify(await sourceSnapshot(root, binding))) throw new Error("Closure recovery source evidence changed");
  }
  if (owned && await exists(worktree)) {
    if (!binding.path || await realpath(binding.path) !== worktree) throw new Error("Closure recovery worktree identity mismatch");
    if (await git(worktree, ["status", "--porcelain=v1"])) throw new Error("Task worktree is not clean");
    // Use the owned checkout's own Git identity; never remove a borrowed checkout.
    await git(worktree, ["worktree", "remove", worktree]);
  }
  await rebuildIndexes(root);
  await rm(taskRoot, { recursive: true });
  await rm(target.receipt);
  return target.archive;
}
