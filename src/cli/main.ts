#!/usr/bin/env node
import os from "node:os";
import path from "node:path";
import { Command, CommanderError } from "commander";
import { ensureDir, readText } from "../core/fs.js";
import { loadHome, saveHome, updateAgentsBlock } from "../config/index.js";
import { rebuildIndexes } from "../indexing/index.js";
import { findProjectRoot, initProject, migrateProject, normalizeName, resolveExplicitProject, registerProject } from "../projects/index.js";
import { checkpointTask, createTask } from "../tasks/index.js";
import { finalizeClosure, prepareClosure } from "../closure/index.js";
import { validateProject } from "../validation/index.js";
import { startMemoryTask, listMemoryTasks, resolveMemoryTask, resumeMemoryTask, saveMemoryTask, attachMemorySource, rebuildChatIndex, repairMemoryTasks } from "../tasks/memory.js";
import { activateBacklog, captureBacklog } from "../backlog/index.js";
import { reorderBacklog } from "../backlog/order.js";
import { assertNoPendingContext, repairContextOperations } from "../backlog/transactions.js";
import { reorderMemoryTask } from "../tasks/order.js";
import { migrateFilenames } from "../migration/filenames.js";
import { assertNoPendingFilenameOperations, repairFilenameOperations } from "../migration/transactions.js";
import { compareUsage, metricsHistory, projectStats, recordMetrics } from "../metrics/index.js";
import { CONTEXT_LEVELS, type ContextLevel } from "../core/types.js";

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

program.command("reorder-backlog")
  .argument("<id>")
  .option("--before <id>")
  .option("--after <id>")
  .option("--position <number>")
  .option("--project <path>")
  .option("--json")
  .action(async (id, options) => output(await reorderBacklog(await projectFor(options), id, { before: options.before, after: options.after, position: options.position === undefined ? undefined : Number(options.position) }), options.json));

program.command("reorder-task")
  .argument("<task-uuid>")
  .option("--before <task-uuid>")
  .option("--after <task-uuid>")
  .option("--position <number>")
  .option("--project <path>")
  .option("--json")
  .action(async (id, options) => output(await reorderMemoryTask(await projectFor(options), id, { before: options.before, after: options.after, position: options.position === undefined ? undefined : Number(options.position) }), options.json));

program.command("repair-context")
  .option("--project <path>")
  .action(async (options) => output(await repairContextOperations(await projectFor(options))));

program.command("migrate-filenames")
  .option("--apply", "Apply the previewed canonical file moves")
  .option("--project <path>")
  .option("--json")
  .action(async (options) => output(await migrateFilenames(await projectFor(options), { apply: Boolean(options.apply) }), options.json));

program.command("rename-record")
  .argument("<id>")
  .option("--project <path>")
  .option("--json")
  .action(async (id, options) => output(await migrateFilenames(await projectFor(options), { id, apply: true }), options.json));

program.command("repair-filenames")
  .option("--project <path>")
  .option("--json")
  .action(async (options) => output(await repairFilenameOperations(await projectFor(options)), options.json));

program.command("rebuild-indexes")
  .option("--project <path>")
  .action(async ({ project }) => {
    const root = await projectFor({ project });
    await assertNoPendingContext(root);
    await assertNoPendingFilenameOperations(root);
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

program.command("stats")
  .description("Report local documentation health and context size; optionally import Codex CLI usage")
  .option("--project <path>")
  .option("--feature <name>", "Feature whose suggested context should be measured")
  .option("--level <level>", "contract, feature, or deep", "feature")
  .option("--usage-jsonl <path>", "Codex exec --json output for measured token usage")
  .option("--record", "Save this summary under .local/metrics")
  .option("--json", "Machine-readable summary")
  .action(async (options) => {
    const root = await projectFor(options);
    if (!CONTEXT_LEVELS.includes(options.level as ContextLevel) || options.level === "none") throw new Error("--level must be contract, feature, or deep");
    if (options.level !== "feature" && !options.feature) throw new Error("--level requires --feature");
    const report = await projectStats(root, options.feature, options.level as ContextLevel, options.usageJsonl ? path.resolve(options.usageJsonl) : undefined);
    const recordedAt = options.record ? await recordMetrics(root, report) : null;
    if (options.json) output({ ...report, recordedAt }, true);
    else {
      console.log(`Documentation: ${report.documents.features} features, ${report.documents.requirements} requirements (${report.documents.requirementsWithFeature} linked), ${report.documents.decisions} decisions, ${report.documents.reports} reports (${report.documents.closureReports} closure reports), ${report.documents.completedObjectives} completed objectives.`);
      console.log(`Review: ${report.health.errorCount} validation errors; ${report.documents.sourcesNeedingReview} source records need review.`);
      if (report.context.feature) console.log(`Context for ${report.context.feature} (${report.context.level}): ${report.context.selectedFiles.length} files, ${report.context.selectedBytes} bytes, about ${report.context.estimatedSelectedTokens} tokens; ${report.context.selectionReductionPercent}% less than the full routable corpus by bytes with routing references included on both sides.`);
      console.log(`Routing reference set: ${report.context.routingBytes} bytes, about ${report.context.estimatedRoutingTokens} tokens.`);
      if (report.usage) console.log(`Codex JSONL usage: ${report.usage.inputTokens} input (${report.usage.cachedInputTokens} cached), ${report.usage.outputTokens} output (${report.usage.reasoningOutputTokens} reasoning), ${report.usage.completedTurns} completed turns.`);
      else console.log("Measured token usage: unavailable without --usage-jsonl.");
      if (recordedAt) console.log(`Saved summary: ${recordedAt}`);
    }
  });

program.command("compare-usage")
  .description("Compare two controlled Codex JSONL runs with evaluator-provided quality scores")
  .requiredOption("--baseline <path>")
  .requiredOption("--deep-context <path>")
  .requiredOption("--baseline-score <number>", "Score from 0 to 1")
  .requiredOption("--deep-score <number>", "Score from 0 to 1")
  .option("--project <path>")
  .option("--record", "Save this summary under .local/metrics")
  .option("--json", "Machine-readable summary")
  .action(async (options) => {
    const report = await compareUsage(path.resolve(options.baseline), path.resolve(options.deepContext), Number(options.baselineScore), Number(options.deepScore));
    const recordedAt = options.record ? await recordMetrics(await projectFor(options), report) : null;
    if (options.json) output({ ...report, recordedAt }, true);
    else {
      console.log(`Quality: baseline ${report.baselineScore}, Deep Context ${report.deepScore}; maintained: ${report.qualityMaintained}.`);
      console.log(`Measured tokens: baseline ${report.baseline.totalTokens}, Deep Context ${report.deepContext.totalTokens}; reduction ${report.totalReductionPercent}%.`);
      console.log(`Input reduction: ${report.inputReductionPercent}%. Cached input is included in input tokens.`);
      if (recordedAt) console.log(`Saved summary: ${recordedAt}`);
      console.log("Comparison requires matched tasks, model, settings, and source revision; those inputs are evaluator-verified.");
    }
  });

program.command("stats-history")
  .description("Show recent locally recorded metrics summaries")
  .option("--project <path>")
  .option("--limit <number>", "Most recent records to show", "20")
  .option("--json", "Machine-readable summary")
  .action(async (options) => {
    const rows = await metricsHistory(await projectFor(options), Number(options.limit));
    if (options.json) output(rows, true);
    else if (!rows.length) console.log("No local metrics snapshots have been recorded.");
    else for (const row of rows) {
      if (row.kind === "deep-context-stats") console.log(`${row.generatedAt} stats ${row.feature ?? "project"}: ${row.contextReductionPercent ?? "n/a"}% context byte reduction; ${row.validationErrors} validation errors; ${row.measuredTokens ?? "unavailable"} measured tokens`);
      else console.log(`${row.generatedAt} comparison: ${row.tokenReductionPercent}% token reduction; quality maintained ${row.qualityMaintained}`);
    }
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
  .option("--context-file <path>", "JSON object with relevant initial task context")
  .option("--predecessor-task-id <id>", "Link a new task to a closed predecessor")
  .option("--project <path>")
  .option("--chat-id <id>")
  .option("--feature <name>")
  .option("--json")
  .action(async (options) => {
    const initialContext = options.contextFile ? JSON.parse(await readText(path.resolve(options.contextFile))) : undefined;
    output(await startMemoryTask(await projectFor(options), { ...options, ...identity(options), initialContext }), options.json);
  });

program.command("list-tasks")
  .option("--project <path>")
  .option("--json")
  .action(async (options) => output(await listMemoryTasks(await projectFor(options)), options.json));

program.command("resolve-task")
  .option("--task <id-or-path>")
  .option("--project <path>")
  .option("--chat-id <id>")
  .option("--json")
  .option("--allow-unbound", "Return structured unbound state when this chat has no task")
  .option("--binding-id <id>")
  .action(async (options) => {
    const root = await projectFor(options);
    const result = options.allowUnbound
      ? await resolveMemoryTask(root, options.task, { ...identity(options), allowUnbound: true })
      : await resolveMemoryTask(root, options.task, identity(options));
    output(result, options.json);
  });

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
  .option("--checkpoint-file <path>", "JSON object with completedWork, decisions, blockers, openQuestions and nextAction strings")
  .option("--release", "Checkpoint and release this chat's task ownership")
  .option("--json")
  .action(async (task, options) => {
    const checkpoint = options.checkpointFile ? JSON.parse(await readText(path.resolve(options.checkpointFile))) : undefined;
    output(await saveMemoryTask(await projectFor(options), task, { ...options, ...identity(options), checkpoint }), options.json);
  });

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
