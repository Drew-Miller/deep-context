import os from "node:os";
import path from "node:path";
import { parse, stringify } from "yaml";
import { atomicWrite, exists, readText } from "../core/fs.js";

export const CONFIG_PATH = path.join(os.homedir(), ".config", "deep-context", "config.toml");
const START = "<!-- deep-context:start -->";
const END = "<!-- deep-context:end -->";

export function configDirectory(): string {
  return path.resolve(process.env.DEEP_CONTEXT_CONFIG_DIR || path.dirname(CONFIG_PATH));
}

export function configPath(): string {
  return path.join(configDirectory(), path.basename(CONFIG_PATH));
}

export function projectRegistryPath(): string {
  return path.join(configDirectory(), "projects.json");
}

export async function saveHome(home: string): Promise<void> {
  const resolved = path.resolve(home);
  await atomicWrite(configPath(), `home = ${JSON.stringify(resolved)}\n`);
}

export async function loadHome(): Promise<string> {
  const override = process.env.DEEP_CONTEXT_HOME;
  if (override) return path.resolve(override);
  const target = configPath();
  if (!(await exists(target))) throw new Error("Deep Context is not configured. Run deep-context setup --home <path>.");
  const contents = await readText(target);
  const match = contents.match(/^home\s*=\s*"([^"]+)"\s*$/m);
  if (!match) throw new Error(`Invalid Deep Context configuration: ${target}`);
  return match[1];
}

export async function updateAgentsBlock(target: string, contextPath?: string): Promise<void> {
  const original = (await exists(target)) ? await readText(target) : "";
  const startCount = original.split(START).length - 1;
  const endCount = original.split(END).length - 1;
  if (startCount !== endCount || startCount > 1) throw new Error(`Malformed Deep Context markers in ${target}`);
  const route = contextPath ? `\n\nProject context is ".deep-context/" in the primary repository checkout; Git worktrees share it. Read its AGENTS.md and CONTEXT_MAP.md. On startup and recovery after compaction, use the bundled Deep Context CLI to resolve-task --allow-unbound --json with the current CODEX_THREAD_ID when available, then follow requiredReads for an existing binding. An unbound chat stays at project scope until the user invokes deep-task. One chat belongs to one task even after release or closure. Before source edits or shared task writes, refresh ownership and state; a non-owner must explicitly resume, with confirmed takeover if another chat owns the task. Checkpoint meaningful progress before ending work turns. Source repository instructions retain their authority.` : "";
  const block = `${START}\n\n## Deep Context\n\nThis machine uses Deep Context for filesystem-backed project memory. Inside an initialized Deep Context project or task, follow the nearest AGENTS.md and CONTEXT_MAP.md. Load lightweight indexes first and canonical document bodies only when relevant. Record durable conclusions in project files before ending work; never rely on chat history as the only copy.${route}\n\n${END}`;
  let next: string;
  if (startCount === 1) {
    const pattern = new RegExp(`${escapeRegex(START)}[\\s\\S]*?${escapeRegex(END)}`);
    next = original.replace(pattern, block);
  } else {
    next = `${original.trimEnd()}${original.trim() ? "\n\n" : ""}${block}\n`;
  }
  await atomicWrite(target, next);
}

function escapeRegex(value: string): string {
  return value.replace(/[.*+?^${}()|[\]\\]/g, "\\$&");
}

const TASK_START = "<!-- deep-context:task-routing:start -->";
const TASK_END = "<!-- deep-context:task-routing:end -->";
export const taskRoutingBlock = `${TASK_START}

## Task association and recovery

On startup and recovery after compaction, resolve this chat with the installed plugin's bundled CLI: resolve-task --project <this context root> --allow-unbound --json, using CODEX_THREAD_ID when available. Locate the CLI relative to the installed deep-task SKILL.md; do not assume PATH or persist a plugin cache path. If the plugin cannot be located, report the missing capability rather than claiming task restoration.

Follow returned requiredReads, then selected manifest context. A successful unbound result stays at project scope until the user invokes deep-task. Errors are not unbound results. Without runtime identity, use the explicit task path and binding ID and disclose that automatic chat lookup is unavailable. Never select the newest task.

One chat belongs to one task even after release or closure. A released association restores context without acquiring ownership. Before source edits or shared task writes, resolve ownership and current revision. A non-owner must explicitly resume; another owner requires confirmed takeover. Closed tasks remain closed. Task attachment neither changes the source working directory nor grants source edit permission.

Checkpoint meaningful decisions, completed work and evidence, blockers, open questions, and exact next action at milestones and before ending work turns; skip unchanged checkpoints. Use save-task with owner identity and expected revision; optional --checkpoint-file supplies completedWork, decisions, blockers, openQuestions and nextAction as strings. Preserve existing relevant findings when updating sections. Report failed saves. Read work/INDEX.md at scope changes and load only relevant bodies.

For an explicit fresh-chat handoff, checkpoint and release ownership, then give a resume prompt with the task UUID and project path. Desktop archive/delete does not release ownership or close task memory. A replacement chat may take over after confirmation and recover from the last saved checkpoint. Automatic care is agent behavior, not a lifecycle hook; interruption can lose unsaved work.

${TASK_END}`;

export async function updateTaskRouting(target: string): Promise<void> {
  const original = await readText(target);
  const starts = original.split(TASK_START).length - 1;
  const ends = original.split(TASK_END).length - 1;
  if (starts !== ends || starts > 1 || (starts === 1 && original.indexOf(TASK_START) > original.indexOf(TASK_END))) {
    throw new Error(`Malformed Deep Context task routing markers in ${target}`);
  }
  const next = starts === 1
    ? original.replace(new RegExp(`${escapeRegex(TASK_START)}[\\s\\S]*?${escapeRegex(TASK_END)}`), () => taskRoutingBlock)
    : `${original.trimEnd()}\n\n${taskRoutingBlock}\n`;
  if (next !== original) await atomicWrite(target, next);
}
