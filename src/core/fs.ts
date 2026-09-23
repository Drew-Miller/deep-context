import { mkdir, open, readFile, rename, rm, stat, writeFile } from "node:fs/promises";
import path from "node:path";

export async function exists(target: string): Promise<boolean> {
  try {
    await stat(target);
    return true;
  } catch {
    return false;
  }
}

export async function ensureDir(target: string): Promise<void> {
  await mkdir(target, { recursive: true });
}

export async function readText(target: string): Promise<string> {
  return readFile(target, "utf8");
}

export async function atomicWrite(target: string, contents: string, mode?: number): Promise<void> {
  await ensureDir(path.dirname(target));
  const temporary = `${target}.tmp-${process.pid}-${Date.now()}`;
  try {
    await writeFile(temporary, contents, { encoding: "utf8", mode });
    await rename(temporary, target);
  } catch (error) {
    await rm(temporary, { force: true }).catch(() => undefined);
    throw error;
  }
}

export async function createExclusive(target: string, contents: string): Promise<boolean> {
  await ensureDir(path.dirname(target));
  try {
    const handle = await open(target, "wx");
    await handle.writeFile(contents, "utf8");
    await handle.close();
    return true;
  } catch (error) {
    if ((error as NodeJS.ErrnoException).code === "EEXIST") return false;
    throw error;
  }
}

export function within(root: string, candidate: string): boolean {
  const relative = path.relative(path.resolve(root), path.resolve(candidate));
  return relative === "" || (!relative.startsWith("..") && !path.isAbsolute(relative));
}
