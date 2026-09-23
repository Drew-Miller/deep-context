#!/usr/bin/env node
import os from "node:os";
import path from "node:path";
import { Command, CommanderError } from "commander";
import { ensureDir } from "../core/fs.js";
import { loadHome, saveHome, updateAgentsBlock } from "../config/index.js";
import { rebuildIndexes } from "../indexing/index.js";
import { findProjectRoot, initProject, normalizeName } from "../projects/index.js";
import { checkpointTask, createTask } from "../tasks/index.js";
import { finalizeClosure, prepareClosure } from "../closure/index.js";
import { validateProject } from "../validation/index.js";

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
  .action(async ({ empty, repo, name }) => {
    if (Boolean(empty) === Boolean(repo)) throw new CommanderError(2, "usage", "Choose exactly one of --empty or --repo <path>");
    const repository = repo ? path.resolve(repo) : undefined;
    const inferred = name ?? (repository ? path.basename(repository) : undefined);
    if (!inferred) throw new CommanderError(2, "usage", "--name is required for --empty");
    const root = await initProject(await loadHome(), { name: normalizeName(inferred), repository });
    console.log(`Initialized Deep Context project: ${root}`);
    if (repository) console.log("Repository evidence was inventoried. Agent interpretation remains required for architecture, features, and atomic requirements.");
  });

program.command("rebuild-indexes")
  .option("--project <path>")
  .action(async ({ project }) => {
    const root = project ? path.resolve(project) : await findProjectRoot();
    await rebuildIndexes(root);
    console.log(`Rebuilt indexes: ${root}`);
  });

program.command("validate")
  .option("--project <path>")
  .action(async ({ project }) => {
    const root = project ? path.resolve(project) : await findProjectRoot();
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
  .action(async (name, options) => {
    const root = options.project ? path.resolve(options.project) : await findProjectRoot();
    console.log(`Created task: ${await createTask(root, name, options)}`);
  });

program.command("checkpoint-task")
  .argument("<name>")
  .option("--project <path>")
  .option("--next-action <text>")
  .action(async (name, options) => {
    const root = options.project ? path.resolve(options.project) : await findProjectRoot();
    console.log(`Checkpointed task state: ${await checkpointTask(root, name, options.nextAction)}`);
  });

program.command("close-task")
  .argument("<name>")
  .option("--project <path>")
  .option("--finalize", "Finalize an approved, unchanged closure review")
  .action(async (name, options) => {
    const root = options.project ? path.resolve(options.project) : await findProjectRoot();
    if (options.finalize) console.log(`Finalized and archived task context: ${await finalizeClosure(root, name)}`);
    else console.log(`Prepared closure review: ${await prepareClosure(root, name)}`);
  });

program.parseAsync().catch((error) => {
  if (error instanceof CommanderError) {
    console.error(error.message);
    process.exitCode = error.exitCode;
  } else {
    console.error(error instanceof Error ? error.message : String(error));
    process.exitCode = 1;
  }
});
