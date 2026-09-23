#!/usr/bin/env node
import os from "node:os";
import path from "node:path";
import { Command, CommanderError } from "commander";
import { ensureDir } from "../core/fs.js";
import { loadHome, saveHome, updateAgentsBlock } from "../config/index.js";
import { rebuildIndexes } from "../indexing/index.js";
import { findProjectRoot, initProject, migrateProject, normalizeName, resolveExplicitProject, registerProject } from "../projects/index.js";
import { checkpointTask, createTask } from "../tasks/index.js";
import { finalizeClosure, prepareClosure } from "../closure/index.js";
import { validateProject } from "../validation/index.js";
import { startMemoryTask, resolveMemoryTask, resumeMemoryTask, saveMemoryTask, attachMemorySource, rebuildChatIndex, repairMemoryTasks } from "../tasks/memory.js";
import { activateBacklog, captureBacklog } from "../backlog/index.js";
import { repairContextOperations } from "../backlog/transactions.js";

async function projectFor(options: { project?: string }): Promise<string> {
  return options.project ? resolveExplicitProject(options.project) : findProjectRoot();
}
function identity(options: { chatId?: string; bindingId?: string; expectedRevision?: string }) {
  const revision = options.expectedRevision === undefined ? undefined : Number(options.expectedRevision);
  if (revision !== undefined && (!Number.isSafeInteger(revision) || revision < 0)) throw new Error("--expected-revision must be a nonnegative integer");
  return { chatId: options.chatId ?? process.env.CODEX_THREAD_ID ?? null, bindingId: options.bindingId, expectedRevision: revision };
}
function output(value: unknown, json?: boolean) {
  console.log(json ? JSON.stringify(value) : JSON.stringify(value, null, 2));
}

const program = new Command();
program.name("deep-context").description("Durable filesystem context routing for Codex").version("0.1.0").showHelpAfterError();

program.command("setup")
  .requiredOption("--home <path>", "Deep Context project-control home")
  .option("--agents <path>", "AGENTS.md to update", path.join(os.homedir(), ".codex", "AGENTS.md"))
  .action(async ({ home, agents }) => {
    const resolvedHome = path.resolve(home);
    await ensureDir(resolvedHome);
    await saveHome(resolvedHome);
    await updateAgentsBlock(path.resolve(agents));
    console.log(`Configured Deep Context home: ${resolvedHome}`);
  });

program.command("init")
  .option("--empty", "Create an empty project")
  .option("--repo <path>", "Bootstrap from a Git repository")
  .option("--name <name>", "Project folder name")
  .option("--context <path>", "Explicit context directory; install repository startup routing")
  .action(async ({ empty, repo, name, context }) => {
    if (Boolean(empty) === Boolean(repo)) throw new CommanderError(2, "usage", "Choose exactly one of --empty or --repo <path>");
    const repository = repo ? path.resolve(repo) : undefined;
    const inferred = name ?? (repository ? path.basename(repository) : undefined);
    if (!inferred) throw new CommanderError(2, "usage", "--name is required for --empty");
    const contextPath = context ? path.resolve(context) : undefined;
    const root = await initProject(repository ? path.dirname(repository) : contextPath ? path.dirname(contextPath) : await loadHome(), { name: normalizeName(inferred), repository, contextPath, register: true });
    console.log(`Initialized Deep Context project: ${root}`);
    if (repository) console.log("Repository evidence was inventoried. Agent interpretation remains required for architecture, features, and atomic requirements.");
  });

program.command("migrate-project")
  .argument("<old-context-path>")
  .requiredOption("--repo <path>")
  .action(async (oldContextPath, { repo }) => {
    const result = await migrateProject(path.resolve(oldContextPath), path.resolve(repo));
    console.log(`Migrated project: ${result.projectRoot}\nRecoverable backup: ${result.backup}`);
  });

program.command("capture-backlog")
  .requiredOption("--title <title>")
  .requiredOption("--pitch <pitch>")
  .requiredOption("--provenance <source>")
  .option("--project <path>")
  .option("--feature <name...>")
  .option("--related <id...>")
  .option("--conflict <id...>")
  .action(async (options) => console.log(await captureBacklog(await projectFor(options), { title: options.title, pitch: options.pitch, provenance: options.provenance, features: options.feature, related: options.related, conflicts: options.conflict })));

program.command("activate-backlog")
  .argument("<id>")
  .requiredOption("--objective <text>")
  .option("--project <path>")
  .option("--task <id...>")
  .option("--decision <path>")
  .action(async (id, options) => console.log(await activateBacklog(await projectFor(options), id, options.objective, { tasks: options.task, decision: options.decision })));

program.command("repair-context")
  .option("--project <path>")
  .action(async (options) => output(await repairContextOperations(await projectFor(options))));

program.command("rebuild-indexes")
  .option("--project <path>")
  .action(async ({ project }) => {
    const root = await projectFor({ project });
    await rebuildIndexes(root);
    await rebuildChatIndex(root);
    console.log(`Rebuilt indexes: ${root}`);
  });

program.command("validate")
  .option("--project <path>")
  .action(async ({ project }) => {
    const root = await projectFor({ project });
    const diagnostics = await validateProject(root);
    for (const item of diagnostics) console.error(`${item.level.toUpperCase()} ${item.code}: ${item.message}`);
    if (diagnostics.some((item) => item.level === "error")) process.exitCode = 1;
    else console.log(`Valid Deep Context project: ${root}`);
  });

program.command("create-task")
  .argument("<name>")
  .option("--project <path>")
  .option("--base <ref>")
  .option("--branch <branch>")
  .option("--feature <name>")
  .option("--description <text>")
  .option("--source-rules-reviewed", "Confirm the attached repository instructions permit this worktree")
  .action(async (name, options) => {
    const root = await projectFor(options);
    console.log(`Created task: ${await createTask(root, name, options)}`);
  });

program.command("checkpoint-task")
  .argument("<name>")
  .option("--project <path>")
  .option("--next-action <text>")
  .option("--chat-id <id>")
  .option("--binding-id <id>")
  .option("--expected-revision <number>")
  .action(async (name, options) => {
    const root = await projectFor(options);
    const task = await resolveMemoryTask(root, name);
    if (task.taskId) output(await saveMemoryTask(root, name, { ...identity(options), nextAction: options.nextAction }));
    else console.log(`Checkpointed task state: ${await checkpointTask(root, name, options.nextAction)}`);
  });

program.command("close-task")
  .argument("<name>")
  .option("--project <path>")
  .option("--finalize", "Finalize an approved, unchanged closure review")
  .option("--chat-id <id>")
  .option("--binding-id <id>")
  .option("--expected-revision <number>")
  .action(async (name, options) => {
    const root = await projectFor(options);
    if (options.finalize) console.log(`Finalized and archived task context: ${await finalizeClosure(root, name, identity(options))}`);
    else console.log(`Prepared closure review: ${await prepareClosure(root, name, identity(options))}`);
  });

program.command("register-project").argument("<path>").action(async (target) => {
  const root = await resolveExplicitProject(target);
  await registerProject(root);
  console.log(`Registered project: ${root}`);
});

program.command("start-task")
  .requiredOption("--description <text>")
  .option("--name <title>")
  .option("--predecessor-task-id <id>", "Link a new task to a closed predecessor")
  .option("--project <path>")
  .option("--chat-id <id>")
  .option("--feature <name>")
  .option("--json")
  .action(async (options) => output(await startMemoryTask(await projectFor(options), { ...options, ...identity(options) }), options.json));

program.command("resolve-task")
  .option("--task <id-or-path>")
  .option("--project <path>")
  .option("--chat-id <id>")
  .option("--json")
  .action(async (options) => output(await resolveMemoryTask(await projectFor(options), options.task, identity(options)), options.json));

program.command("resume-task")
  .argument("<task>")
  .option("--project <path>")
  .option("--chat-id <id>")
  .option("--binding-id <id>")
  .option("--expected-revision <number>")
  .option("--takeover")
  .option("--json")
  .action(async (task, options) => output(await resumeMemoryTask(await projectFor(options), task, { ...identity(options), takeover: options.takeover }), options.json));

program.command("save-task")
  .argument("<task>")
  .option("--project <path>")
  .option("--chat-id <id>")
  .option("--binding-id <id>")
  .option("--expected-revision <number>")
  .option("--next-action <text>")
  .option("--note <text>")
  .option("--release", "Checkpoint and release this chat's task ownership")
  .option("--json")
  .action(async (task, options) => output(await saveMemoryTask(await projectFor(options), task, { ...options, ...identity(options) }), options.json));

program.command("attach-source")
  .argument("<task>")
  .requiredOption("--source-mode <mode>", "read-only, isolated, or existing")
  .option("--source-path <path>")
  .option("--source-rules-reviewed")
  .option("--project <path>")
  .option("--chat-id <id>")
  .option("--binding-id <id>")
  .option("--expected-revision <number>")
  .option("--json")
  .action(async (task, options) => output(await attachMemorySource(await projectFor(options), task, { ...options, ...identity(options) }), options.json));

program.command("repair-tasks")
  .option("--project <path>")
  .option("--unlock <token>", "Release a verified abandoned lock")
  .action(async (options) => output(await repairMemoryTasks(await projectFor(options), options.unlock)));

program.parseAsync().catch((error) => {
  if (error instanceof CommanderError) {
    console.error(error.message);
    process.exitCode = error.exitCode;
  } else {
    console.error(error instanceof Error ? error.message : String(error));
    process.exitCode = 1;
  }
});
