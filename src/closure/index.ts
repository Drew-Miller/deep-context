import { createHash } from "node:crypto";
import { cp, readdir, rm } from "node:fs/promises";
import path from "node:path";
import { atomicWrite, ensureDir, exists, readText } from "../core/fs.js";
import { git } from "../core/git.js";
import { parseMarkdown, renderMarkdown } from "../frontmatter/index.js";
import { rebuildIndexes } from "../indexing/index.js";
import type { ProjectState } from "../core/types.js";
import { normalizeTaskName } from "../core/names.js";

async function walkFiles(root: string, skip?: (relative: string) => boolean): Promise<string[]> {
  if (!(await exists(root))) return [];
  const output: string[] = [];
  async function visit(directory: string): Promise<void> {
    for (const entry of await readdir(directory, { withFileTypes: true })) {
      const absolute = path.join(directory, entry.name);
      const relative = path.relative(root, absolute);
      if (skip?.(relative)) continue;
      if (entry.isDirectory()) await visit(absolute);
      else if (entry.isFile()) output.push(absolute);
    }
  }
  await visit(root);
  return output.sort();
}

async function evidence(projectRoot: string, taskRoot: string): Promise<{ fingerprint: string; summary: string }> {
  const state = parseMarkdown(await readText(path.join(taskRoot, "TASK_STATE.md"))).data;
  const worktree = path.join(taskRoot, "worktree");
  const base = String(state.base_commit);
  const head = await git(worktree, ["rev-parse", "HEAD"]);
  const committed = await git(worktree, ["diff", "--binary", `${base}...${head}`], true);
  const working = await git(worktree, ["diff", "--binary", "HEAD"], true);
  const staged = await git(worktree, ["diff", "--binary", "--cached", "HEAD"], true);
  const untracked = (await git(worktree, ["ls-files", "--others", "--exclude-standard", "-z"], true)).split("\0").filter(Boolean).sort();
  const hash = createHash("sha256");
  hash.update(JSON.stringify({ base, head, committed, working, staged, untracked }));
  const taskFiles = await walkFiles(taskRoot, (relative) => relative === "worktree" || relative.startsWith(`worktree${path.sep}`) || relative === "CLOSURE_REVIEW.md");
  const contextFiles = await walkFiles(path.join(projectRoot, "doc"), (relative) => relative.startsWith(`reports${path.sep}closures${path.sep}`));
  for (const file of [...taskFiles, ...contextFiles]) hash.update(path.relative(projectRoot, file)).update(await readText(file));
  return { fingerprint: hash.digest("hex"), summary: `Base: ${base}\nHEAD: ${head}\nCommitted diff bytes: ${Buffer.byteLength(committed)}\nWorking diff bytes: ${Buffer.byteLength(working)}\nStaged diff bytes: ${Buffer.byteLength(staged)}\nUntracked files: ${untracked.length}` };
}

export async function prepareClosure(projectRoot: string, taskName: string): Promise<string> {
  const name = normalizeTaskName(taskName);
  const taskRoot = path.join(projectRoot, "tasks", name);
  if (!(await exists(path.join(taskRoot, "TASK_STATE.md")))) throw new Error(`Unknown task: ${taskName}`);
  const taskState = parseMarkdown(await readText(path.join(taskRoot, "TASK_STATE.md"))).data;
  if (taskState.task !== name) throw new Error(`Task identity mismatch: expected ${name}`);
  await rebuildIndexes(projectRoot);
  const current = await evidence(projectRoot, taskRoot);
  const review = renderMarkdown({
    task: name,
    status: "pending",
    evidence_fingerprint: current.fingerprint,
    reviewer: null,
    findings_resolved: false,
    promotion_references: [],
    verification_evidence: [],
    updated_at: new Date().toISOString(),
  }, `# Closure Review\n\n## Evidence\n\n${current.summary}\n\n## Drift Findings\n\n- Pending Project Context review.\n\n## Durable Knowledge Classification\n\n- Review TASK_STATE.md and WORKLOG.md; promote architecture, contracts, requirements, decisions, or future intent.\n\n## Unresolved Questions\n\n- Closure review has not been completed.\n\n## Finalization Instructions\n\nAn agent must review the evidence, update durable context, list promotion references, set \`findings_resolved: true\`, identify itself in \`reviewer\`, set \`status: approved\`, and rerun \`close-task\` if evidence changes.\n`);
  const target = path.join(taskRoot, "CLOSURE_REVIEW.md");
  await atomicWrite(target, review);
  return target;
}

export async function finalizeClosure(projectRoot: string, taskName: string): Promise<string> {
  const name = normalizeTaskName(taskName);
  const taskRoot = path.join(projectRoot, "tasks", name);
  const reviewPath = path.join(taskRoot, "CLOSURE_REVIEW.md");
  if (!(await exists(reviewPath))) throw new Error("Run close-task before --finalize");
  const taskState = parseMarkdown(await readText(path.join(taskRoot, "TASK_STATE.md"))).data;
  if (taskState.task !== name) throw new Error(`Task identity mismatch: expected ${name}`);
  const review = parseMarkdown(await readText(reviewPath));
  if (review.data.task !== name) throw new Error(`Closure review identity mismatch: expected ${name}`);
  if (review.data.status !== "approved" || review.data.findings_resolved !== true || !review.data.reviewer) throw new Error("Closure review is not approved and fully resolved");
  const promotions = Array.isArray(review.data.promotion_references) ? review.data.promotion_references.map(String) : [];
  for (const reference of promotions) {
    const target = path.resolve(projectRoot, reference);
    if (!target.startsWith(`${path.resolve(projectRoot)}${path.sep}`) || !(await exists(target))) throw new Error(`Missing or unsafe promotion reference: ${reference}`);
  }
  const current = await evidence(projectRoot, taskRoot);
  if (review.data.evidence_fingerprint !== current.fingerprint) throw new Error("Closure evidence changed after review; run close-task and review again");
  const worktree = path.join(taskRoot, "worktree");
  const status = await git(worktree, ["status", "--porcelain=v1"]);
  if (status) throw new Error("Task worktree is not clean; finalization refuses destructive cleanup");
  const projectState = JSON.parse(await readText(path.join(projectRoot, ".deep-context", "state.json"))) as ProjectState;
  if (!projectState.repositoryPath) throw new Error("Project has no recorded source repository");
  const repository = projectState.repositoryPath;
  const archiveRoot = path.join(projectRoot, "doc", "reports", "closures", `${name}-${new Date().toISOString().replace(/[:.]/g, "-")}`);
  await ensureDir(archiveRoot);
  for (const entry of await readdir(taskRoot, { withFileTypes: true })) {
    if (entry.name === "worktree") continue;
    await cp(path.join(taskRoot, entry.name), path.join(archiveRoot, entry.name), { recursive: true });
  }
  await git(repository, ["worktree", "remove", worktree]);
  await rm(taskRoot, { recursive: true });
  return archiveRoot;
}
