#!/usr/bin/env node
import assert from "node:assert/strict";
import { execFile } from "node:child_process";
import { cp, lstat, mkdir, mkdtemp, readFile, readdir, rm, writeFile } from "node:fs/promises";
import { fileURLToPath } from "node:url";
import os from "node:os";
import path from "node:path";
import { promisify } from "node:util";

const exec = promisify(execFile);
const modulePath = fileURLToPath(import.meta.url);
const moduleDirectory = path.dirname(modulePath);
const packageFiles = new Set([
  ".codex-plugin/plugin.json",
  "bin/deep-context.cjs",
  "dist/cli.mjs",
  "skills/deep-close/SKILL.md",
  "skills/deep-close/agents/openai.yaml",
  "skills/deep-init/SKILL.md",
  "skills/deep-init/agents/openai.yaml",
  "skills/deep-task/SKILL.md",
  "skills/deep-task/agents/openai.yaml",
  "templates/project/AGENTS.md.template",
  "templates/project/ARCHITECTURE.md.template",
  "templates/project/CONTEXT_MAP.md.template",
  "templates/project/PROJECT.md.template",
  "templates/project/PROJECT_CONTEXT_AGENT.md.template",
  "templates/task/AGENTS.md.template",
  "templates/task/CONTEXT_MANIFEST.md.template",
  "templates/task/TASK_CONTEXT.md.template",
  "templates/task/TASK_STATE.md.template"
]);
const packageDirectories = new Set([...packageFiles].flatMap((file) => {
  const parts = file.split("/");
  return parts.slice(0, -1).map((_, index) => parts.slice(0, index + 1).join("/"));
}));

function relative(root, target) {
  return path.relative(root, target).split(path.sep).join("/");
}

/** Verify that a plugin directory contains exactly the distributable package. */
export async function checkPackage(packageRoot = path.resolve(moduleDirectory, "../plugins/deep-context")) {
  const root = path.resolve(packageRoot);
  const rootInfo = await lstat(root).catch(() => { throw new Error(`Package root is missing: ${root}`); });
  if (!rootInfo.isDirectory() || rootInfo.isSymbolicLink()) throw new Error(`Package root must be a regular directory: ${root}`);
  const found = new Set();

  async function visit(directory) {
    for (const entry of await readdir(directory, { withFileTypes: true })) {
      const target = path.join(directory, entry.name);
      const name = relative(root, target);
      const info = await lstat(target);
      if (info.isSymbolicLink()) throw new Error(`Package symlinks are forbidden: ${name}`);
      if (info.isDirectory()) {
        if (!packageDirectories.has(name)) throw new Error(`Unexpected package directory: ${name}`);
        await visit(target);
      } else if (info.isFile()) {
        if (!packageFiles.has(name)) throw new Error(`Unexpected package file: ${name}`);
        found.add(name);
      } else {
        throw new Error(`Package entry must be a regular file or directory: ${name}`);
      }
    }
  }

  await visit(root);
  for (const file of packageFiles) {
    if (!found.has(file)) throw new Error(`Required package file is missing: ${file}`);
  }
  return { packageRoot: root, files: [...found].sort() };
}

export async function checkCatalog(repositoryRoot = path.resolve(moduleDirectory, "..")) {
  const catalogPath = path.join(repositoryRoot, ".agents", "plugins", "marketplace.json");
  const catalog = JSON.parse(await readFile(catalogPath, "utf8"));
  if (catalog.name !== "deep-context-repo") throw new Error(`Marketplace catalog must be named deep-context-repo: ${catalogPath}`);
  const plugin = catalog.plugins?.find((entry) => entry?.name === "deep-context");
  if (plugin?.source?.source !== "local" || plugin.source.path !== "./plugins/deep-context") {
    throw new Error(`Marketplace catalog must source deep-context from ./plugins/deep-context: ${catalogPath}`);
  }
  return { catalogPath, plugin };
}

function packageEnvironment(configDirectory) {
  return {
    PATH: process.env.PATH ?? "",
    HOME: path.join(configDirectory, "home"),
    LANG: process.env.LANG ?? "C",
    DEEP_CONTEXT_CONFIG_DIR: configDirectory
  };
}

async function cli(command, args, options) {
  const result = await exec(process.execPath, [command, ...args], options);
  return result.stdout.trim();
}

async function cliJson(command, args, options) {
  return JSON.parse(await cli(command, [...args, "--json"], options));
}

/** Exercise the copied package with no source tree or ambient Deep Context state. */
export async function smokePackage(packageRoot) {
  const temporary = await mkdtemp(path.join(os.tmpdir(), "deep-context-package-"));
  try {
    const copiedPackage = path.join(temporary, "package");
    await cp(packageRoot, copiedPackage, { recursive: true, errorOnExist: true, verbatimSymlinks: true });
    await assert.rejects(lstat(path.join(copiedPackage, "src")), /ENOENT/);
    const command = path.join(copiedPackage, "bin", "deep-context.cjs");
    const configDirectory = path.join(temporary, "isolated-config");
    const outsideRepository = path.join(temporary, "outside-repository");
    const repository = path.join(temporary, "source-repository");
    const context = path.join(repository, ".deep-context");
    const options = { cwd: outsideRepository, env: packageEnvironment(configDirectory) };
    await Promise.all([mkdir(outsideRepository, { recursive: true }), mkdir(repository, { recursive: true })]);

    await cli(command, ["--help"], options);
    await exec("git", ["init", repository], options);
    await exec("git", ["-C", repository, "config", "user.email", "package-check@example.test"], options);
    await exec("git", ["-C", repository, "config", "user.name", "Package Check"], options);
    await writeFile(path.join(repository, "README.md"), "# Package fixture\n");
    await cli(command, ["init", "--repo", repository], options);
    const architecturePath = path.join(context, "doc", "ARCHITECTURE.md");
    const authoredArchitecture = "# Authored architecture\n\nKeep this exact authored architecture.\n";
    await writeFile(architecturePath, authoredArchitecture);
    await cli(command, ["init", "--repo", repository], options);
    assert.equal(await readFile(architecturePath, "utf8"), authoredArchitecture, "reinitialization replaced authored architecture");

    const started = await cliJson(command, ["start-task", "--project", context, "--chat-id", "package-a", "--name", "Package smoke", "--description", "Verify copied package lifecycle"], options);
    const saved = await cliJson(command, ["save-task", started.taskId, "--project", context, "--binding-id", started.bindingId, "--expected-revision", String(started.stateRevision), "--next-action", "Preserve this package checkpoint."], options);
    const released = await cliJson(command, ["save-task", started.taskId, "--project", context, "--binding-id", started.bindingId, "--expected-revision", String(saved.stateRevision), "--release"], options);
    const resumed = await cliJson(command, ["resume-task", started.taskId, "--project", context, "--chat-id", "package-b", "--expected-revision", String(released.stateRevision)], options);
    const resolved = await cliJson(command, ["resolve-task", "--project", context, "--chat-id", "package-b"], options);
    assert.equal(resolved.taskId, started.taskId);
    assert.ok(resumed.requiredReads.includes(path.join(started.taskPath, "chats", started.bindingId, "MEMORY.md")), "resumed task omitted predecessor chat memory");
    assert.ok(resolved.requiredReads.includes(path.join(started.taskPath, "chats", started.bindingId, "MEMORY.md")), "resolved task omitted predecessor chat memory");
    assert.match(await readFile(path.join(started.taskPath, "TASK_STATE.md"), "utf8"), /Preserve this package checkpoint\./);
    await cli(command, ["validate", "--project", context], options);
    return { temporary, context, taskId: started.taskId };
  } finally {
    await rm(temporary, { recursive: true, force: true });
  }
}

export async function runPackageCheck() {
  const { packageRoot } = await checkPackage();
  await checkCatalog();
  await smokePackage(packageRoot);
  console.log("Package boundary and isolated smoke passed.");
}

if (process.argv[1] && path.resolve(process.argv[1]) === modulePath) {
  runPackageCheck().catch((error) => {
    console.error(error instanceof Error ? error.message : String(error));
    process.exitCode = 1;
  });
}
