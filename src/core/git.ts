import { execFile } from "node:child_process";
import { promisify } from "node:util";

const execFileAsync = promisify(execFile);

export async function git(cwd: string, args: string[], allowFailure = false): Promise<string> {
  try {
    const result = await execFileAsync("git", ["-C", cwd, ...args], {
      encoding: "utf8",
      maxBuffer: 20 * 1024 * 1024,
    });
    return result.stdout.trimEnd();
  } catch (error) {
    if (allowFailure) return "";
    const stderr = (error as { stderr?: string }).stderr?.trim();
    throw new Error(stderr || `git ${args.join(" ")} failed in ${cwd}`);
  }
}

export async function isGitRepository(cwd: string): Promise<boolean> {
  return (await git(cwd, ["rev-parse", "--is-inside-work-tree"], true)) === "true";
}

export async function currentHead(cwd: string): Promise<string | undefined> {
  return (await git(cwd, ["rev-parse", "HEAD"], true)) || undefined;
}

export async function currentBranch(cwd: string): Promise<string | undefined> {
  return (await git(cwd, ["symbolic-ref", "--quiet", "--short", "HEAD"], true)) || undefined;
}
