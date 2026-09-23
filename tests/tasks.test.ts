import { execFile } from "node:child_process";
import { mkdtemp, readFile, rm, writeFile } from "node:fs/promises";
import os from "node:os";
import path from "node:path";
import { promisify } from "node:util";
import { afterEach, describe, expect, it } from "vitest";
import { initProject } from "../src/projects/index.js";
import { checkpointTask, createTask } from "../src/tasks/index.js";
import { finalizeClosure, prepareClosure } from "../src/closure/index.js";
import { parseMarkdown, renderMarkdown } from "../src/frontmatter/index.js";

const exec = promisify(execFile);
const cleanup: string[] = [];
afterEach(async () => Promise.all(cleanup.splice(0).map((target) => rm(target, { recursive: true, force: true }))));

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
    const task = await createTask(project, "First Task", { description: "Test recovery" });
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
    await createTask(project, "Done", {});
    const reviewPath = await prepareClosure(project, "done");
    const review = parseMarkdown(await readFile(reviewPath, "utf8"));
    review.data.status = "approved";
    review.data.reviewer = "test-reviewer";
    review.data.findings_resolved = true;
    await writeFile(reviewPath, renderMarkdown(review.data, review.body));
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
    const task = await createTask(project, "Stale", {});
    const reviewPath = await prepareClosure(project, "stale");
    const review = parseMarkdown(await readFile(reviewPath, "utf8"));
    review.data.status = "approved";
    review.data.reviewer = "test-reviewer";
    review.data.findings_resolved = true;
    await writeFile(reviewPath, renderMarkdown(review.data, review.body));
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
    await createTask(project, "Context Stale", {});
    const reviewPath = await prepareClosure(project, "context-stale");
    const review = parseMarkdown(await readFile(reviewPath, "utf8"));
    review.data.status = "approved";
    review.data.reviewer = "test-reviewer";
    review.data.findings_resolved = true;
    await writeFile(reviewPath, renderMarkdown(review.data, review.body));
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
});
