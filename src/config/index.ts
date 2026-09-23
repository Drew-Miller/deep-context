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
  const route = contextPath ? `\n\nProject context is ".deep-context/" in the primary repository checkout; Git worktrees share it. Read its AGENTS.md and CONTEXT_MAP.md. Use the bundled Deep Context CLI to resolve-task with the current CODEX_THREAD_ID when available, then follow requiredReads for an existing binding. An unbound chat stays at project scope until deep-task starts or resumes a task. Persist useful knowledge during work and before handoff. Source repository instructions retain their authority.` : "";
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
