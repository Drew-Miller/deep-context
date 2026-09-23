import { execFile } from "node:child_process";
import { mkdtemp, mkdir, readFile, realpath, rm, writeFile } from "node:fs/promises";
import os from "node:os";
import path from "node:path";
import { promisify } from "node:util";
import { afterEach, beforeEach, describe, expect, it } from "vitest";
import { findProjectRoot, initProject, migrateProject, resolveExplicitProject } from "../src/projects/index.js";
import { validateProject } from "../src/validation/index.js";
import { captureBacklog } from "../src/backlog/index.js";
import { startMemoryTask } from "../src/tasks/memory.js";
import { defaultReadOnlySource } from "../src/tasks/source.js";

const cleanup: string[] = [];
const exec = promisify(execFile);
let previousConfigDirectory: string | undefined;
beforeEach(async () => {
  previousConfigDirectory = process.env.DEEP_CONTEXT_CONFIG_DIR;
  const configDirectory = await mkdtemp(path.join(os.tmpdir(), "deep-context-project-config-"));
  cleanup.push(configDirectory);
  process.env.DEEP_CONTEXT_CONFIG_DIR = configDirectory;
});
afterEach(async () => {
  if (previousConfigDirectory === undefined) delete process.env.DEEP_CONTEXT_CONFIG_DIR;
  else process.env.DEEP_CONTEXT_CONFIG_DIR = previousConfigDirectory;
  await Promise.all(cleanup.splice(0).map((target) => rm(target, { recursive: true, force: true })));
});

describe("project initialization", () => {
  it("creates a self-describing empty project without invented facts", async () => {
    const home = await mkdtemp(path.join(os.tmpdir(), "deep-context-home-"));
    cleanup.push(home);
    const root = await initProject(home, { name: "Example Project" });
    expect(await readFile(path.join(root, "CONTEXT_MAP.md"), "utf8")).toContain("Indexes can be deleted and rebuilt");
    expect(await readFile(path.join(root, "doc", "FEATURES.md"), "utf8")).not.toContain("billing");
    expect(await validateProject(root)).toEqual([]);
  });

  it("preserves edited canonical bodies on rerun", async () => {
    const home = await mkdtemp(path.join(os.tmpdir(), "deep-context-home-"));
    cleanup.push(home);
    const root = await initProject(home, { name: "Example" });
    const project = path.join(root, "PROJECT.md");
    const original = await readFile(project, "utf8");
    await import("node:fs/promises").then(({ writeFile }) => writeFile(project, `${original}\nUser truth.\n`));
    await initProject(home, { name: "Example" });
    expect(await readFile(project, "utf8")).toContain("User truth.");
  });

  it("preserves an attached repository on empty reinit and rejects a conflicting attachment", async () => {
    const home = await mkdtemp(path.join(os.tmpdir(), "deep-context-home-"));
    cleanup.push(home);
    const repository = path.join(home, "repository");
    const other = path.join(home, "other");
    for (const target of [repository, other]) {
      await exec("git", ["init", target]);
      await exec("git", ["-C", target, "config", "user.email", "test@example.com"]);
      await exec("git", ["-C", target, "config", "user.name", "Test"]);
      await writeFile(path.join(target, "README.md"), "# Test\n");
      await exec("git", ["-C", target, "add", "."]);
      await exec("git", ["-C", target, "commit", "-m", "initial"]);
    }
    const root = await initProject(home, { name: "Example", repository });
    await initProject(home, { name: "Example" });
    const state = JSON.parse(await readFile(path.join(root, ".local", "state.json"), "utf8"));
    expect(state.repositoryPath).toBe(await realpath(repository));
    await expect(initProject(home, { name: "Example", repository: other, contextPath: root })).rejects.toThrow("Conflicting repository attachment");
  });

  it("uses an exact explicit context root and records a canonical project identity", async () => {
    const base = await mkdtemp(path.join(os.tmpdir(), "deep-context-explicit-"));
    cleanup.push(base);
    const contextPath = path.join(base, "repository", "deep-context");
    const root = await initProject(path.join(base, "ignored"), { name: "Example", contextPath, register: false });
    expect(root).toBe(await realpath(contextPath));
    expect(await resolveExplicitProject(contextPath)).toBe(await realpath(contextPath));
    expect(await readFile(path.join(root, "PROJECT.md"), "utf8")).toMatch(/project_id: [0-9a-f-]{36}/);
  });

  it("preserves and migrates the canonical PROJECT.md identity", async () => {
    const base = await mkdtemp(path.join(os.tmpdir(), "deep-context-project-id-"));
    cleanup.push(base);
    const root = await initProject(base, { name: "Example", register: false });
    await writeFile(path.join(root, "PROJECT.md"), "---\nproject_id: canonical-id\n---\n# Example\n");
    await initProject(base, { name: "Example", register: false });
    const state = JSON.parse(await readFile(path.join(root, ".local", "state.json"), "utf8"));
    expect(state.projectId).toBe("canonical-id");
  });

  it("resolves a repository-contained context and a registered external context", async () => {
    const base = await mkdtemp(path.join(os.tmpdir(), "deep-context-resolve-"));
    cleanup.push(base);
    const repository = path.join(base, "repository");
    await mkdir(path.join(repository, "nested"), { recursive: true });
    await exec("git", ["init", repository]);
    await exec("git", ["-C", repository, "config", "user.email", "test@example.com"]);
    await exec("git", ["-C", repository, "config", "user.name", "Test"]);
    await writeFile(path.join(repository, "README.md"), "# Test\n");
    await exec("git", ["-C", repository, "add", "."]);
    await exec("git", ["-C", repository, "commit", "-m", "initial"]);
    await writeFile(path.join(repository, "AGENTS.md"), "# Source instructions\n\nKeep this.\n");
    const contained = await initProject(path.join(base, "home"), { name: "Example", repository, contextPath: path.join(repository, "deep-context"), register: false });
    expect(await findProjectRoot(path.join(repository, "nested"))).toBe(await realpath(contained));
    expect(await readFile(path.join(repository, "AGENTS.md"), "utf8")).toContain("Keep this.");
    expect(await readFile(path.join(repository, "AGENTS.md"), "utf8")).toContain("<!-- deep-context:start -->");
    expect(await readFile(path.join(repository, ".gitignore"), "utf8")).toContain("/.deep-context/tasks/");

    expect(await findProjectRoot(path.join(repository, "nested"))).toBe(await realpath(contained));
  });

  it("resolves a registered project from a linked Git worktree", async () => {
    const base = await mkdtemp(path.join(os.tmpdir(), "deep-context-worktree-"));
    cleanup.push(base);
    const repository = path.join(base, "repository");
    const worktree = path.join(base, "worktree");
    await exec("git", ["init", repository]);
    await exec("git", ["-C", repository, "config", "user.email", "test@example.com"]);
    await exec("git", ["-C", repository, "config", "user.name", "Test"]);
    await writeFile(path.join(repository, "README.md"), "# Test\n");
    await exec("git", ["-C", repository, "add", "."]);
    await exec("git", ["-C", repository, "commit", "-m", "initial"]);
    const external = await initProject(path.join(base, "home"), { name: "External", repository, register: true });
    await exec("git", ["-C", repository, "worktree", "add", "-b", "feature", worktree]);
    expect(await findProjectRoot(worktree)).toBe(await realpath(external));
  });

  it("migrates an external project with a recoverable backup and historical Backlog ID", async () => {
    const base = await mkdtemp(path.join(os.tmpdir(), "deep-context-migration-"));
    cleanup.push(base);
    const repository = path.join(base, "source repo");
    await exec("git", ["init", repository]);
    await exec("git", ["-C", repository, "config", "user.email", "test@example.com"]);
    await exec("git", ["-C", repository, "config", "user.name", "Test"]);
    await writeFile(path.join(repository, "README.md"), "# Source\n");
    await exec("git", ["-C", repository, "add", "."]);
    await exec("git", ["-C", repository, "commit", "-m", "initial"]);
    const oldRoot = path.join(base, "old project");
    await initProject(base, { name: "source-repo", repository, contextPath: oldRoot });
    await mkdir(path.join(oldRoot, "doc", "shelf"));
    await writeFile(path.join(oldRoot, "doc", "shelf", "SHELF-0001.md"), "---\nid: SHELF-0001\ntitle: Import context\nstatus: shelved\ntype: future-work\nfeatures: []\ntokens: []\n---\n\n# Import context\n\nKeep a recoverable record of the import.\n");
    const oldArchive = path.join(oldRoot, "doc", "reports", "closures", "old-task");
    await mkdir(oldArchive, { recursive: true });
    await writeFile(path.join(oldArchive, "TASK_STATE.md"), "---\ntask: old-task\n---\n\n# Closed task\n");
    await writeFile(path.join(oldArchive, "REPORT.md"), "---\nid: REPORT-OLD-TASK\ntitle: Old closure\nstatus: accepted\nfeatures: []\n---\n\n# Old closure\n");
    const { projectRoot, backup } = await migrateProject(oldRoot, repository);
    expect(projectRoot).toBe(path.join(await realpath(repository), ".deep-context"));
    expect(await realpath(oldRoot)).toBe(projectRoot);
    expect(await readFile(path.join(backup, "doc", "shelf", "SHELF-0001.md"), "utf8")).toContain("status: shelved");
    expect(await readFile(path.join(projectRoot, "doc", "backlog", "SHELF-0001.md"), "utf8")).toContain("pitch: Keep a recoverable record");
    expect(await readFile(path.join(projectRoot, "doc", "BACKLOG.md"), "utf8")).toContain("SHELF-0001");
    expect(await readFile(path.join(projectRoot, ".local", "archives", "old-task", "TASK_STATE.md"), "utf8")).toContain("Closed task");
    expect(await readFile(path.join(projectRoot, "doc", "reports", "closures", "old-task.md"), "utf8")).toContain("Old closure");
    expect(await validateProject(projectRoot)).toEqual([]);
  });

  it("shares one project home across worktrees while keeping task and chat memory separate", async () => {
    const base = await mkdtemp(path.join(os.tmpdir(), "deep-context-shared-worktrees-"));
    cleanup.push(base);
    const repository = path.join(base, "source repo");
    const second = path.join(base, "second checkout");
    await exec("git", ["init", repository]);
    await exec("git", ["-C", repository, "config", "user.email", "test@example.com"]);
    await exec("git", ["-C", repository, "config", "user.name", "Test"]);
    await writeFile(path.join(repository, "README.md"), "# Source\n");
    await exec("git", ["-C", repository, "add", "."]);
    await exec("git", ["-C", repository, "commit", "-m", "initial"]);
    const root = await initProject(base, { name: "source-repo", repository });
    await exec("git", ["-C", repository, "worktree", "add", "-b", "second", second]);
    expect(await findProjectRoot(repository)).toBe(root);
    expect(await findProjectRoot(second)).toBe(root);
    const before = await defaultReadOnlySource(root);
    await captureBacklog(root, { title: "Future search", pitch: "Add search to help locate context quickly.", provenance: "Fixture request" });
    const firstTask = await startMemoryTask(root, { description: "Inspect routing", chatId: "first-chat" });
    const secondTask = await startMemoryTask(await findProjectRoot(second), { description: "Inspect indexing", chatId: "second-chat" });
    expect(firstTask.taskPath).not.toBe(secondTask.taskPath);
    expect(firstTask.taskPath).toContain(path.join(root, "tasks"));
    expect(secondTask.taskPath).toContain(path.join(root, "tasks"));
    const after = await defaultReadOnlySource(root);
    expect(after.evidence).toEqual(before.evidence);
  });

  it("leaves the original home and repository routing intact when migration validation fails", async () => {
    const base = await mkdtemp(path.join(os.tmpdir(), "deep-context-migration-rollback-"));
    cleanup.push(base);
    const repository = path.join(base, "source repo");
    await exec("git", ["init", repository]);
    await exec("git", ["-C", repository, "config", "user.email", "test@example.com"]);
    await exec("git", ["-C", repository, "config", "user.name", "Test"]);
    await writeFile(path.join(repository, "README.md"), "# Source\n");
    await exec("git", ["-C", repository, "add", "."]);
    await exec("git", ["-C", repository, "commit", "-m", "initial"]);
    const oldRoot = path.join(base, "external context");
    await initProject(base, { name: "source-repo", repository, contextPath: oldRoot });
    await writeFile(path.join(oldRoot, "doc", "requirements", "REQ-BAD.md"), "---\nid: REQ-BAD\ntitle: Missing evidence\nstatus: active\norigin: confirmed\nsource: doc/missing.md\n---\n\n# Missing evidence\n");
    const originalAgents = await readFile(path.join(repository, "AGENTS.md"), "utf8");
    const originalContext = await realpath(oldRoot);
    await expect(migrateProject(oldRoot, repository)).rejects.toThrow("did not validate");
    expect(await readFile(path.join(repository, "AGENTS.md"), "utf8")).toBe(originalAgents);
    expect(await realpath(oldRoot)).toBe(originalContext);
    await expect(realpath(path.join(repository, ".deep-context"))).rejects.toMatchObject({ code: "ENOENT" });
    await expect(readFile(path.join(repository, ".gitignore"), "utf8")).rejects.toMatchObject({ code: "ENOENT" });
  });
});
