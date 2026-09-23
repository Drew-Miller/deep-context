import path from "node:path";
import { atomicWrite, createExclusive, ensureDir, exists, readText } from "../core/fs.js";
import { currentBranch, currentHead, git, isGitRepository } from "../core/git.js";
import type { ProjectState } from "../core/types.js";
import { parseMarkdown, renderMarkdown } from "../frontmatter/index.js";
import { selectFeatureContext } from "../routing/index.js";
import { normalizeTaskName } from "../core/names.js";
import { contextManifest, taskAgents, taskContext, taskState } from "./templateFiles.js";

async function repositoryFor(projectRoot: string): Promise<string> {
  const state = JSON.parse(await readText(path.join(projectRoot, ".deep-context", "state.json"))) as ProjectState;
  if (!state.repositoryPath) throw new Error("This project has no attached source repository");
  if (!(await isGitRepository(state.repositoryPath))) throw new Error(`Attached source is not a Git repository: ${state.repositoryPath}`);
  return state.repositoryPath;
}

export async function createTask(projectRoot: string, rawName: string, options: { base?: string; branch?: string; feature?: string; description?: string }): Promise<string> {
  const name = normalizeTaskName(rawName);
  const repository = await repositoryFor(projectRoot);
  const head = await currentHead(repository);
  if (!head) throw new Error("Task worktrees require a source repository with at least one commit");
  const attachedBranch = await currentBranch(repository);
  const baseRef = options.base ?? attachedBranch;
  if (!baseRef) throw new Error("Detached HEAD requires an explicit --base reference");
  const baseCommit = await git(repository, ["rev-parse", "--verify", `${baseRef}^{commit}`]);
  const branch = options.branch ?? `deep-context/${name}`;
  if (!/^[A-Za-z0-9._/-]+$/.test(branch) || branch.includes("..") || branch.startsWith("/") || branch.endsWith("/")) throw new Error(`Unsafe branch name: ${branch}`);
  const taskRoot = path.join(projectRoot, "tasks", name);
  const worktree = path.join(taskRoot, "worktree");
  const statePath = path.join(taskRoot, "TASK_STATE.md");

  if (await exists(statePath)) {
    const existing = parseMarkdown(await readText(statePath)).data;
    if (existing.branch !== branch || path.resolve(taskRoot, String(existing.worktree ?? "")) !== worktree) throw new Error(`Existing task ${name} has different branch/worktree identity`);
    return taskRoot;
  }

  await ensureDir(taskRoot);
  try {
    const branchExists = Boolean(await git(repository, ["show-ref", "--verify", `refs/heads/${branch}`], true));
    if (branchExists) throw new Error(`Branch already exists without a matching recorded task: ${branch}`);
    const selection = options.feature ? await selectFeatureContext(projectRoot, { [options.feature]: "feature" }) : { levels: {}, files: [] };
    await git(repository, ["worktree", "add", "-b", branch, worktree, baseCommit]);
    await createExclusive(path.join(taskRoot, "AGENTS.md"), taskAgents(name));
    await createExclusive(path.join(taskRoot, "TASK_CONTEXT.md"), taskContext(name, options.description ?? "", baseRef, options.feature));
    await createExclusive(path.join(taskRoot, "CONTEXT_MANIFEST.md"), contextManifest(name, selection.levels, selection.files));
    await createExclusive(statePath, taskState(name, branch, baseRef, baseCommit));
    await createExclusive(path.join(taskRoot, "WORKLOG.md"), `# Worklog\n\nTransient working notes. Promote durable knowledge before closure.\n`);
  } catch (error) {
    if (await exists(worktree)) await git(repository, ["worktree", "remove", worktree], true);
    throw error;
  }
  return taskRoot;
}

export async function checkpointTask(projectRoot: string, rawName: string, nextAction?: string): Promise<string> {
  const name = normalizeTaskName(rawName);
  const target = path.join(projectRoot, "tasks", name, "TASK_STATE.md");
  if (!(await exists(target))) throw new Error(`Unknown task: ${name}`);
  const document = parseMarkdown(await readText(target));
  document.data.updated_at = new Date().toISOString();
  const stamp = `- Checkpointed at ${document.data.updated_at}; source HEAD ${(await currentHead(path.join(projectRoot, "tasks", name, "worktree"))) ?? "unavailable"}.`;
  let body = document.body.trimEnd();
  if (nextAction) body = body.replace(/(## Exact Next Safe Action\n\n)([\s\S]*?)(?=\n## |$)/, `$1${nextAction}\n`);
  body = body.replace(/(## Checkpoints\n\n)/, `$1${stamp}\n`);
  await atomicWrite(target, renderMarkdown(document.data, body));
  return target;
}
