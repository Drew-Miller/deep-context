import os from "node:os";
import path from "node:path";
import { parse, stringify } from "yaml";
import { atomicWrite, exists, readText } from "../core/fs.js";

export const CONFIG_PATH = path.join(os.homedir(), ".config", "deep-context", "config.toml");
const START = "<!-- deep-context:start -->";
const END = "<!-- deep-context:end -->";

export async function saveHome(home: string): Promise<void> {
  const resolved = path.resolve(home);
  await atomicWrite(CONFIG_PATH, `home = ${JSON.stringify(resolved)}\n`);
}

export async function loadHome(): Promise<string> {
  const override = process.env.DEEP_CONTEXT_HOME;
  if (override) return path.resolve(override);
  if (!(await exists(CONFIG_PATH))) throw new Error("Deep Context is not configured. Run deep-context setup --home <path>.");
  const contents = await readText(CONFIG_PATH);
  const match = contents.match(/^home\s*=\s*"([^"]+)"\s*$/m);
  if (!match) throw new Error(`Invalid Deep Context configuration: ${CONFIG_PATH}`);
  return match[1];
}

export async function updateAgentsBlock(target: string): Promise<void> {
  const original = (await exists(target)) ? await readText(target) : "";
  const startCount = original.split(START).length - 1;
  const endCount = original.split(END).length - 1;
  if (startCount !== endCount || startCount > 1) throw new Error(`Malformed Deep Context markers in ${target}`);
  const block = `${START}\n\n## Deep Context\n\nThis machine uses Deep Context for filesystem-backed project memory. Inside an initialized Deep Context project or task, follow the nearest AGENTS.md and CONTEXT_MAP.md. Load lightweight indexes first and canonical document bodies only when relevant. Record durable conclusions in project files before ending work; never rely on chat history as the only copy.\n\n${END}`;
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
