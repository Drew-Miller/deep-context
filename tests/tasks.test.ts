import { execFile } from "node:child_process";
import { mkdtemp, mkdir, readFile, readdir, rm, writeFile } from "node:fs/promises";
import os from "node:os";
import path from "node:path";
import { promisify } from "node:util";
import { afterEach, describe, expect, it } from "vitest";
import { initProject } from "../src/projects/index.js";
import { checkpointTask, createTask } from "../src/tasks/index.js";
import { finalizeClosure, prepareClosure } from "../src/closure/index.js";
import { parseMarkdown, renderMarkdown } from "../src/frontmatter/index.js";
import { rebuildIndexes } from "../src/indexing/index.js";
import { selectFeatureContext } from "../src/routing/index.js";
import { validateProject } from "../src/validation/index.js";

const exec = promisify(execFile);
const cleanup: string[] = [];
afterEach(async () => Promise.all(cleanup.splice(0).map((target) => rm(target, { recursive: true, force: true }))));

async function approveReview(reviewPath: string): Promise<void> {
  const review = parseMarkdown(await readFile(reviewPath, "utf8"));
  const taskRoot = path.dirname(reviewPath);
  review.data.status = "approved";
  review.data.reviewer = "test-reviewer";
  review.data.findings_resolved = true;
  review.data.knowledge_review = (await readdir(taskRoot)).filter((file) => file.endsWith(".md") && file !== "CLOSURE_REVIEW.md")
    .map((file) => ({ path: file, classification: "transient" }));
  await writeFile(reviewPath, renderMarkdown(review.data, review.body));
}

describe("task lifecycle", () => {
  it("creates a worktree, checkpoints, and refuses pending finalization", async () => {
    const base = await mkdtemp(path.join(os.tmpdir(), "deep-context-task-"));
    cleanup.push(base);
    const repo = path.join(base, "source repo");
    await exec("git", ["init", repo]);
    await exec("git", ["-C", repo, "config", "user.email", "test@example.com"]);
    await exec("git", ["-C", repo, "config", "user.name", "Test"]);
    await writeFile(path.join(repo, "README.md"), "# Source\n");
    await exec("git", ["-C", repo, "add", "."]);
    await exec("git", ["-C", repo, "commit", "-m", "initial"]);
    const project = await initProject(path.join(base, "home"), { name: "source", repository: repo });
    const task = await createTask(project, "First Task", { description: "Test recovery", sourceRulesReviewed: true });
    await checkpointTask(project, "first-task", "Continue from the recorded test state.");
    expect(await readFile(path.join(task, "TASK_STATE.md"), "utf8")).toContain("Continue from the recorded test state.");
    await prepareClosure(project, "first-task");
    await expect(finalizeClosure(project, "first-task")).rejects.toThrow("not approved");
  });

  it("finalizes only an approved unchanged review and preserves the branch", async () => {
    const base = await mkdtemp(path.join(os.tmpdir(), "deep-context-finalize-"));
    cleanup.push(base);
    const repo = path.join(base, "source");
    await exec("git", ["init", repo]);
    await exec("git", ["-C", repo, "config", "user.email", "test@example.com"]);
    await exec("git", ["-C", repo, "config", "user.name", "Test"]);
    await writeFile(path.join(repo, "README.md"), "# Source\n");
    await exec("git", ["-C", repo, "add", "."]);
    await exec("git", ["-C", repo, "commit", "-m", "initial"]);
    const project = await initProject(path.join(base, "home"), { name: "source", repository: repo });
    await createTask(project, "Done", { sourceRulesReviewed: true });
    const reviewPath = await prepareClosure(project, "done");
    await approveReview(reviewPath);
    const archive = await finalizeClosure(project, "done");
    expect(await readFile(path.join(archive, "CLOSURE_REVIEW.md"), "utf8")).toContain("test-reviewer");
    expect((await exec("git", ["-C", repo, "branch", "--list", "deep-context/done"])).stdout).toContain("deep-context/done");
  });

  it("invalidates approval when task evidence changes", async () => {
    const base = await mkdtemp(path.join(os.tmpdir(), "deep-context-stale-"));
    cleanup.push(base);
    const repo = path.join(base, "source");
    await exec("git", ["init", repo]);
    await exec("git", ["-C", repo, "config", "user.email", "test@example.com"]);
    await exec("git", ["-C", repo, "config", "user.name", "Test"]);
    await writeFile(path.join(repo, "README.md"), "# Source\n");
    await exec("git", ["-C", repo, "add", "."]);
    await exec("git", ["-C", repo, "commit", "-m", "initial"]);
    const project = await initProject(path.join(base, "home"), { name: "source", repository: repo });
    const task = await createTask(project, "Stale", { sourceRulesReviewed: true });
    const reviewPath = await prepareClosure(project, "stale");
    await approveReview(reviewPath);
    await writeFile(path.join(task, "WORKLOG.md"), "# Worklog\n\nNew evidence.\n");
    await expect(finalizeClosure(project, "stale")).rejects.toThrow("evidence changed");
  });

  it("invalidates approval when canonical project context changes", async () => {
    const base = await mkdtemp(path.join(os.tmpdir(), "deep-context-context-stale-"));
    cleanup.push(base);
    const repo = path.join(base, "source");
    await exec("git", ["init", repo]);
    await exec("git", ["-C", repo, "config", "user.email", "test@example.com"]);
    await exec("git", ["-C", repo, "config", "user.name", "Test"]);
    await writeFile(path.join(repo, "README.md"), "# Source\n");
    await exec("git", ["-C", repo, "add", "."]);
    await exec("git", ["-C", repo, "commit", "-m", "initial"]);
    const project = await initProject(path.join(base, "home"), { name: "source", repository: repo });
    await createTask(project, "Context Stale", { sourceRulesReviewed: true });
    const reviewPath = await prepareClosure(project, "context-stale");
    await approveReview(reviewPath);
    await writeFile(path.join(project, "doc", "ARCHITECTURE.md"), "# Changed durable architecture\n");
    await expect(finalizeClosure(project, "context-stale")).rejects.toThrow("evidence changed");
  });

  it("normalizes closure names and cannot traverse outside the task directory", async () => {
    const base = await mkdtemp(path.join(os.tmpdir(), "deep-context-task-name-"));
    cleanup.push(base);
    const project = path.join(base, "project");
    await expect(prepareClosure(project, "../outside")).rejects.toThrow("Unknown task: ../outside");
    await expect(finalizeClosure(project, "../outside")).rejects.toThrow("Run close-task before --finalize");
  });

  it("requires repository-rule review and honors a prohibited worktree policy", async () => {
    const base = await mkdtemp(path.join(os.tmpdir(), "deep-context-source-policy-"));
    cleanup.push(base);
    const repo = path.join(base, "source");
    await exec("git", ["init", repo]);
    await exec("git", ["-C", repo, "config", "user.email", "test@example.com"]);
    await exec("git", ["-C", repo, "config", "user.name", "Test"]);
    await writeFile(path.join(repo, "AGENTS.md"), "# Source rules\n\nRead project standards before acting.\n");
    await exec("git", ["-C", repo, "add", "."]);
    await exec("git", ["-C", repo, "commit", "-m", "initial"]);
    const project = await initProject(path.join(base, "home"), { name: "source", repository: repo });
    await expect(createTask(project, "Guarded", {})).rejects.toThrow("--source-rules-reviewed");
    const overviewPath = path.join(project, "PROJECT.md");
    const overview = parseMarkdown(await readFile(overviewPath, "utf8"));
    overview.data.source_worktree_policy = "prohibited";
    await writeFile(overviewPath, renderMarkdown(overview.data, overview.body));
    await expect(createTask(project, "Guarded", { sourceRulesReviewed: true })).rejects.toThrow("prohibits another editable worktree");
  });

  it("rejects unclassified notes and task-local promotion references", async () => {
    const base = await mkdtemp(path.join(os.tmpdir(), "deep-context-promotion-"));
    cleanup.push(base);
    const repo = path.join(base, "source");
    await exec("git", ["init", repo]);
    await exec("git", ["-C", repo, "config", "user.email", "test@example.com"]);
    await exec("git", ["-C", repo, "config", "user.name", "Test"]);
    await writeFile(path.join(repo, "README.md"), "# Source\n");
    await exec("git", ["-C", repo, "add", "."]);
    await exec("git", ["-C", repo, "commit", "-m", "initial"]);
    const project = await initProject(path.join(base, "home"), { name: "source", repository: repo });
    const task = await createTask(project, "Promote", { sourceRulesReviewed: true });
    await writeFile(path.join(task, "WORKLOG.md"), "# Worklog\n\nUNCLASSIFIED: preserve this finding.\n");
    let reviewPath = await prepareClosure(project, "promote");
    await approveReview(reviewPath);
    await expect(finalizeClosure(project, "promote")).rejects.toThrow("Unclassified durable information");
    await writeFile(path.join(task, "WORKLOG.md"), "# Worklog\n\nPreserve this finding.\n");
    reviewPath = await prepareClosure(project, "promote");
    await approveReview(reviewPath);
    const review = parseMarkdown(await readFile(reviewPath, "utf8"));
    review.data.promotion_references = ["tasks/promote/WORKLOG.md"];
    const records = review.data.knowledge_review as Array<Record<string, unknown>>;
    const worklog = records.find((item) => item.path === "WORKLOG.md")!;
    worklog.classification = "promoted";
    worklog.promotion_references = ["tasks/promote/WORKLOG.md"];
    await writeFile(reviewPath, renderMarkdown(review.data, review.body));
    await expect(finalizeClosure(project, "promote")).rejects.toThrow("durable project context");
  });

  it("fails closed on invalid Git evidence and changed project identity", async () => {
    const base = await mkdtemp(path.join(os.tmpdir(), "deep-context-evidence-"));
    cleanup.push(base);
    const repo = path.join(base, "source");
    await exec("git", ["init", repo]);
    await exec("git", ["-C", repo, "config", "user.email", "test@example.com"]);
    await exec("git", ["-C", repo, "config", "user.name", "Test"]);
    await writeFile(path.join(repo, "README.md"), "# Source\n");
    await exec("git", ["-C", repo, "add", "."]);
    await exec("git", ["-C", repo, "commit", "-m", "initial"]);
    const project = await initProject(path.join(base, "home"), { name: "source", repository: repo });
    const invalid = await createTask(project, "Invalid Base", { sourceRulesReviewed: true });
    const statePath = path.join(invalid, "TASK_STATE.md");
    const state = parseMarkdown(await readFile(statePath, "utf8"));
    state.data.base_commit = "nonexistent-commit";
    await writeFile(statePath, renderMarkdown(state.data, state.body));
    await expect(prepareClosure(project, "invalid-base")).rejects.toThrow();
    await createTask(project, "Changed Project", { sourceRulesReviewed: true });
    const reviewPath = await prepareClosure(project, "changed-project");
    await approveReview(reviewPath);
    await writeFile(path.join(project, "PROJECT.md"), "# Changed canonical project identity\n");
    await expect(finalizeClosure(project, "changed-project")).rejects.toThrow("evidence changed");
  });

  it("recovers a checkpoint and rediscovers a promoted decision after deletion", async () => {
    const base = await mkdtemp(path.join(os.tmpdir(), "deep-context-recovery-"));
    cleanup.push(base);
    const repo = path.join(base, "source");
    await exec("git", ["init", repo]);
    await exec("git", ["-C", repo, "config", "user.email", "test@example.com"]);
    await exec("git", ["-C", repo, "config", "user.name", "Test"]);
    await writeFile(path.join(repo, "README.md"), "# Source\n");
    await exec("git", ["-C", repo, "add", "."]);
    await exec("git", ["-C", repo, "commit", "-m", "initial"]);
    const project = await initProject(path.join(base, "home"), { name: "source", repository: repo });
    const featureRoot = path.join(project, "doc", "features", "memory");
    await mkdir(featureRoot, { recursive: true });
    await writeFile(path.join(featureRoot, "FEATURE.md"), "---\nname: memory\ndescription: Durable knowledge\nstatus: active\nowns: []\ntokens: []\ncontracts: [doc/features/memory/CONTRACTS.md]\ndepends_on: {}\n---\n\n# Memory\n");
    await writeFile(path.join(featureRoot, "CONTRACTS.md"), "# Memory contract\n");
    const task = await createTask(project, "Recovery", { feature: "memory", sourceRulesReviewed: true });
    const statePath = path.join(task, "TASK_STATE.md");
    const state = parseMarkdown(await readFile(statePath, "utf8"));
    state.body = state.body.replace("## Decisions and Discoveries Awaiting Promotion\n\n- None.", "## Decisions and Discoveries Awaiting Promotion\n\n- Signed manifests must be durable.");
    await writeFile(statePath, renderMarkdown(state.data, state.body));
    await checkpointTask(project, "recovery", "Promote the signed-manifest decision before cleanup.");
    const recovered = await readFile(statePath, "utf8");
    expect(recovered).toContain("Promote the signed-manifest decision before cleanup.");
    expect(recovered).toContain("Signed manifests must be durable.");
    const decisionPath = path.join(project, "doc", "decisions", "DEC-RECOVERY.md");
    await writeFile(decisionPath, "---\nid: DEC-RECOVERY\ntitle: Signed manifests\nstatus: accepted\nfeatures: [memory]\n---\n\n# Signed manifests\n\nFuture work must preserve signed manifests.\n");
    await rebuildIndexes(project);
    const reviewPath = await prepareClosure(project, "recovery");
    await approveReview(reviewPath);
    const review = parseMarkdown(await readFile(reviewPath, "utf8"));
    review.data.promotion_references = ["doc/decisions/DEC-RECOVERY.md"];
    const records = review.data.knowledge_review as Array<Record<string, unknown>>;
    const taskState = records.find((item) => item.path === "TASK_STATE.md")!;
    taskState.classification = "promoted";
    taskState.promotion_references = ["doc/decisions/DEC-RECOVERY.md"];
    await writeFile(reviewPath, renderMarkdown(review.data, review.body));
    const archive = await finalizeClosure(project, "recovery");
    expect(await readFile(path.join(archive, "TASK_STATE.md"), "utf8")).toContain("Signed manifests must be durable.");
    await expect(readFile(statePath, "utf8")).rejects.toMatchObject({ code: "ENOENT" });
    expect(await readFile(path.join(project, "doc", "DECISIONS.md"), "utf8")).toContain("DEC-RECOVERY");
    expect(await readFile(path.join(project, "doc", "REPORTS.md"), "utf8")).toContain("Closure of recovery");
    expect((await selectFeatureContext(project, { memory: "deep" })).files).toEqual(expect.arrayContaining([
      "doc/decisions/DEC-RECOVERY.md",
      path.relative(project, path.join(project, "doc", "reports", "closures", `${path.basename(archive)}.md`)),
    ]));
    expect(await validateProject(project)).toEqual([]);
  });
});
