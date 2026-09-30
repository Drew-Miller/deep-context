#!/usr/bin/env node
import { lstat, readdir } from "node:fs/promises";
import path from "node:path";

const schemaVersion = 1;

function compareStrings(left, right) {
  return left < right ? -1 : left > right ? 1 : 0;
}

function relativePath(root, target) {
  const relative = path.relative(root, target);
  return relative === "" ? "." : relative.split(path.sep).join("/");
}

function errorCode(error) {
  return error && typeof error === "object" && "code" in error && typeof error.code === "string"
    ? error.code
    : "UNKNOWN";
}

function roleHint(relative, type) {
  if (relative === ".") return "context-root";
  if (relative === "AGENTS.md") return "routing-instructions";
  if (relative === "CONTEXT_MAP.md") return "context-map";
  if (relative === "PROJECT.md") return "project-identity";
  if (relative === "docs/architecture.md") return "canonical-architecture";
  if (relative === "docs" || relative === "sources" || relative === "work") return "canonical-documents";
  if (/^(docs\/(features|requirements|decisions|reports)|sources|work)\/INDEX\.md$/.test(relative)) return "generated-index";
  if (/^(docs\/(features|requirements|decisions|reports)|sources\/records|work\/items)(?:\/|$)/.test(relative)) return "canonical-record-area";
  if (relative === "START_HERE.md") return "entry-route";
  if (relative === "repo" && type === "symlink") return "source-resolver";
  if (relative === "doc") return "canonical-documents";
  if (relative === "doc/ARCHITECTURE.md") return "canonical-architecture";
  if (relative === "tasks") return "task-memory";
  if (relative === ".local") return "local-state";
  if (/^doc\/(FEATURES|REQUIREMENTS|BACKLOG|ACTIVE|DECISIONS|REPORTS|SOURCES)\.md$/.test(relative)) {
    return "generated-index";
  }
  if (/^doc\/(features|requirements|backlog|active|decisions|reports|sources)(?:\/|$)/.test(relative)) {
    return "canonical-record-area";
  }
  if (/^tasks\/[^/]+(?:\/|$)/.test(relative)) return "task-local";
  if (relative.startsWith(".local/")) return "local-state";
  return "unresolved";
}

function entryType(info) {
  if (info.isSymbolicLink()) return "symlink";
  if (info.isFile()) return "file";
  if (info.isDirectory()) return "directory";
  return "other";
}

function metadata(root, target, info) {
  const type = entryType(info);
  const relative = relativePath(root, target);
  return {
    path: relative,
    type,
    roleHint: roleHint(relative, type),
    sizeBytes: info.size,
    modeOctal: (info.mode & 0o7777).toString(8).padStart(4, "0")
  };
}

function parseArguments(argumentsList) {
  let project;
  for (let index = 0; index < argumentsList.length; index += 1) {
    const argument = argumentsList[index];
    if (argument === "--project") {
      if (project !== undefined || index + 1 >= argumentsList.length) {
        throw new Error("INVALID_ARGUMENTS");
      }
      project = argumentsList[index + 1];
      index += 1;
    } else {
      throw new Error("INVALID_ARGUMENTS");
    }
  }
  if (!project) throw new Error("INVALID_ARGUMENTS");
  return path.resolve(project);
}

async function inventory(projectRoot) {
  const entries = [];
  const errors = [];

  async function inspect(target) {
    const relative = relativePath(projectRoot, target);
    let info;
    try {
      info = await lstat(target);
    } catch (error) {
      errors.push({ path: relative, operation: "lstat", code: errorCode(error) });
      return;
    }

    const item = metadata(projectRoot, target, info);
    entries.push(item);
    if (item.type !== "directory") return;

    let names;
    try {
      names = await readdir(target);
    } catch (error) {
      errors.push({ path: relative, operation: "readdir", code: errorCode(error) });
      return;
    }

    for (const name of names.sort(compareStrings)) {
      await inspect(path.join(target, name));
    }
  }

  let rootInfo;
  try {
    rootInfo = await lstat(projectRoot);
  } catch (error) {
    errors.push({ path: ".", operation: "lstat", code: errorCode(error) });
    return { schemaVersion, projectRoot, entries, errors };
  }
  if (rootInfo.isSymbolicLink()) {
    errors.push({ path: ".", operation: "root", code: "SYMLINK_ROOT" });
    return { schemaVersion, projectRoot, entries, errors };
  }
  if (!rootInfo.isDirectory()) {
    errors.push({ path: ".", operation: "root", code: "NOT_DIRECTORY" });
    return { schemaVersion, projectRoot, entries, errors };
  }

  await inspect(projectRoot);
  entries.sort((left, right) => compareStrings(left.path, right.path));
  errors.sort((left, right) => compareStrings(left.path, right.path) || compareStrings(left.operation, right.operation) || compareStrings(left.code, right.code));
  return { schemaVersion, projectRoot, entries, errors };
}

async function main() {
  let projectRoot;
  try {
    projectRoot = parseArguments(process.argv.slice(2));
  } catch {
    process.stdout.write(`${JSON.stringify({ schemaVersion, projectRoot: null, entries: [], errors: [{ path: ".", operation: "arguments", code: "INVALID_ARGUMENTS" }] })}\n`);
    process.exitCode = 1;
    return;
  }

  const result = await inventory(projectRoot);
  process.stdout.write(`${JSON.stringify(result)}\n`);
  if (result.errors.length > 0) process.exitCode = 1;
}

main().catch((error) => {
  process.stdout.write(`${JSON.stringify({ schemaVersion, projectRoot: null, entries: [], errors: [{ path: ".", operation: "inventory", code: errorCode(error) }] })}\n`);
  process.exitCode = 1;
});
