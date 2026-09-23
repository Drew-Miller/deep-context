import { createHash } from "node:crypto";
import { lstat, readdir, readFile, readlink, realpath } from "node:fs/promises";
import path from "node:path";
import { exists, readText, within } from "../core/fs.js";
import { git, isGitRepository } from "../core/git.js";
import { parseMarkdown } from "../frontmatter/index.js";
import { machineStatePath } from "../projects/index.js";

export type SourceMode = "none" | "read-only" | "isolated" | "existing";
export type SourceOwnership = "none" | "deep-context" | "external";
export interface SourceBinding { mode: SourceMode; path?: string; ownership: SourceOwnership; head?: string; common_dir?: string; evidence?: Record<string, unknown> }
export interface SourceAttachOptions { sourceMode: SourceMode; sourcePath?: string; sourceRulesReviewed?: boolean; ownership?: SourceOwnership }

export async function defaultReadOnlySource(root: string): Promise<SourceBinding> {
  const state = JSON.parse(await readText(await machineStatePath(root))) as { repositoryPath?: string };
  return sourceSnapshot(root, state.repositoryPath ? { mode: "read-only", path: state.repositoryPath, ownership: "external" } : { mode: "none", ownership: "none" });
}

export function validateSourceBinding(binding: SourceBinding): void {
  if (!binding || !["none", "read-only", "isolated", "existing"].includes(binding.mode) || !["none", "external", "deep-context"].includes(binding.ownership)) throw new Error("Invalid source binding");
  if (binding.mode === "none" && (binding.path || binding.ownership !== "none")) throw new Error("Absent source cannot have a path or checkout ownership");
  if (binding.mode !== "none" && !binding.path) throw new Error("Source binding requires a path");
  if (binding.mode === "isolated" && binding.ownership !== "deep-context") throw new Error("Isolated checkout requires recorded ownership");
  if (binding.mode !== "isolated" && binding.ownership === "deep-context") throw new Error("Only isolated checkouts can be Deep Context-owned");
  if (binding.mode === "existing" && binding.ownership !== "external") throw new Error("Existing checkouts must be externally owned");
}

/** Evidence is deterministic; timestamps belong to checkpoints, not fingerprints. */
export async function sourceSnapshot(projectRoot: string, binding: SourceBinding): Promise<SourceBinding> {
  validateSourceBinding(binding);
  if (binding.mode === "none") return { mode: "none", ownership: "none", evidence: { kind: "absent" } };
  const source = await realpath(binding.path!);
  const context = await realpath(projectRoot);
  if (within(context, source) && binding.mode !== "isolated") throw new Error("Source path cannot be inside context storage");
  if (await isGitRepository(source)) {
    const root = await realpath(await git(source, ["rev-parse", "--show-toplevel"]));
    const head = (await git(root, ["rev-parse", "--verify", "HEAD"], true)) || undefined;
    const common = await realpath(path.resolve(root, await git(root, ["rev-parse", "--git-common-dir"])));
    if (binding.common_dir && common !== binding.common_dir) throw new Error("Source repository identity changed");
    const specs = ["--", path.relative(root, source) || "."];
    if (within(root, context) && root !== context) specs.push(`:(exclude,literal)${path.relative(root, context)}`);
    specs.push(":(exclude,glob)**/.deep-context/**");
    const names = [...new Set((await git(root, ["ls-files", "--cached", "--others", "--exclude-standard", "-z", ...specs])).split("\0").filter(Boolean))].sort();
    const status = await git(root, ["status", "--porcelain=v1", "-z", ...specs]);
    const staged = await git(root, ["diff", "--binary", "--cached", ...specs]);
    const hash = createHash("sha256").update(head ?? "unborn").update(status).update(staged);
    for (const name of names) await hashFile(hash, path.join(root, name), name);
    return { ...binding, path: source, head, common_dir: common, evidence: { kind: "git", source_sha256: hash.digest("hex"), dirty: Boolean(status), files: names.length } };
  }
  const hash = createHash("sha256");
  let count = 0;
  async function walk(file: string): Promise<void> {
    if (within(context, file)) return;
    if (++count > 10000) throw new Error("Select a narrower source: evidence exceeds 10,000 entries");
    const info = await lstat(file);
    if (info.isDirectory()) {
      for (const entry of (await readdir(file)).sort()) await walk(path.join(file, entry));
    } else await hashFile(hash, file, path.relative(source, file));
  }
  await walk(source);
  return { ...binding, path: source, evidence: { kind: "filesystem", tree_sha256: hash.digest("hex") } };
}

async function hashFile(hash: ReturnType<typeof createHash>, file: string, name: string): Promise<void> {
  hash.update(name).update("\0");
  try {
    const info = await lstat(file);
    if (info.isSymbolicLink()) hash.update("link:").update(await readlink(file));
    else if (info.isFile()) {
      if (info.size > 20 * 1024 * 1024) throw new Error(`Source evidence file exceeds 20 MiB: ${name}`);
      hash.update(String(info.mode)).update(await readFile(file));
    } else hash.update("directory");
  } catch (error) {
    if ((error as NodeJS.ErrnoException).code !== "ENOENT") throw error;
    hash.update("missing");
  }
}

export async function resolveSourceBinding(root: string, options: SourceAttachOptions): Promise<SourceBinding> {
  if (!options.sourcePath && options.sourceMode !== "none") throw new Error("Source attachment requires --source-path");
  if (options.sourceMode !== "read-only" && options.sourceMode !== "none" && !options.sourceRulesReviewed) throw new Error("Confirm source rules before attaching an editable source mode");
  return sourceSnapshot(root, { mode: options.sourceMode, ...(options.sourcePath ? { path: options.sourcePath } : {}), ownership: options.ownership ?? (options.sourceMode === "none" ? "none" : options.sourceMode === "isolated" ? "deep-context" : "external") });
}

export async function createIsolatedSource(root: string, taskPath: string, options: SourceAttachOptions, taskId: string): Promise<SourceBinding> {
  const overview = parseMarkdown(await readText(path.join(root, "PROJECT.md"))).data;
  if (overview.source_worktree_policy === "prohibited") throw new Error("Source policy prohibits another editable worktree");
  if (overview.source_worktree_policy !== undefined && !["allowed", "review-required"].includes(String(overview.source_worktree_policy))) throw new Error("Unknown source worktree policy");
  const base = await resolveSourceBinding(root, options);
  if (!base.path || !base.head || !(await isGitRepository(base.path))) throw new Error("Isolated source mode requires a committed Git repository");
  const target = path.join(taskPath, "worktree");
  if (await exists(target)) throw new Error("Task worktree already exists without a completed attachment; repair or inspect it before reuse");
  const branch = `deep-context/memory-${taskId}`;
  if (await git(base.path, ["show-ref", "--verify", `refs/heads/${branch}`], true)) throw new Error(`Task branch already exists: ${branch}`);
  await git(base.path, ["worktree", "add", "-b", branch, target, base.head]);
  return sourceSnapshot(root, { mode: "isolated", path: target, ownership: "deep-context" });
}
