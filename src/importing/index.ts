import { createHash } from "node:crypto";
import { lstat, readFile, realpath } from "node:fs/promises";
import path from "node:path";
import { git, isGitRepository } from "../core/git.js";
import type { SourceRecord } from "../core/types.js";

const MAX_TEXT_BYTES = 1_000_000;
const excludedSegments = new Set([".git", ".deep-context", "node_modules", ".build", "build", "dist", "coverage", "vendor", ".cache"]);
const privatePatterns = [/(^|\/)\.env(?:\.|$)/i, /\.local\.json$/i, /credentials?/i, /secrets?/i, /private[-_.]?key/i];
const textExtensions = new Set([".md", ".txt", ".json", ".yaml", ".yml", ".toml", ".swift", ".ts", ".tsx", ".js", ".jsx", ".py", ".rb", ".rs", ".go", ".java", ".kt", ".cs", ".sh", ".sql", ".graphql"]);

function sourceId(relative: string): string {
  return `SRC-${createHash("sha256").update(relative).digest("hex").slice(0, 12).toUpperCase()}`;
}

function classify(relative: string): string {
  const lower = relative.toLowerCase();
  if (lower.endsWith("agents.md")) return "agent-instructions";
  if (lower.includes("requirements")) return "requirements";
  if (lower.includes("/decisions/") || /adr[-_]/i.test(relative)) return "decision";
  if (lower.includes("tasks.md") || lower.includes("status.json")) return "live-state";
  if (lower.includes("/packets/")) return "task-packet";
  if (lower.includes("/reports/")) return "report";
  if (lower.endsWith("readme.md") || lower.endsWith("start_here.md")) return "project-entry";
  if (textExtensions.has(path.extname(lower))) return "text";
  return "binary-or-unknown";
}

function exclusionReason(relative: string): string | undefined {
  const segments = relative.split("/");
  if (segments.some((part) => excludedSegments.has(part))) return "generated, dependency, or build path";
  if (privatePatterns.some((pattern) => pattern.test(relative))) return "protected or credential-bearing filename";
  if (!textExtensions.has(path.extname(relative).toLowerCase()) && !["makefile", "package.swift"].includes(path.basename(relative).toLowerCase())) return "non-text or unsupported file type";
  return undefined;
}

export async function inventoryRepository(
  repository: string,
  options: { excludedRoots?: string[] } = {},
): Promise<{ records: SourceRecord[]; head?: string; branch?: string; dirty: boolean }> {
  const root = await realpath(repository);
  if (!(await isGitRepository(root))) throw new Error(`${repository} is not a Git repository`);
  const listed = await git(root, ["ls-files", "--cached", "--others", "--exclude-standard", "-z"]);
  const tracked = new Set((await git(root, ["ls-files", "-z"])).split("\0").filter(Boolean));
  const excludedRoots = await Promise.all((options.excludedRoots ?? []).map(async (candidate) => {
    const resolved = await realpath(candidate).catch(() => path.resolve(candidate));
    return resolved === root || resolved.startsWith(`${root}${path.sep}`) ? path.relative(root, resolved) : undefined;
  }));
  const excludedRelativeRoots = excludedRoots.filter((candidate): candidate is string => candidate !== undefined);
  const candidates = [...new Set(listed.split("\0").filter(Boolean))]
    .filter((relative) => !relative.split("/").includes(".deep-context"))
    .filter((relative) => !excludedRelativeRoots.some((excluded) => relative === excluded || relative.startsWith(`${excluded}/`)))
    .sort();
  const records: SourceRecord[] = [];

  for (const relative of candidates) {
    const absolute = path.join(root, relative);
    const reason = exclusionReason(relative);
    let tracking: SourceRecord["tracking"] = tracked.has(relative) ? "tracked" : "untracked";
    let disposition: SourceRecord["disposition"] = reason ? "excluded" : tracking === "untracked" ? "review" : "referenced";
    let hash: string | undefined;
    let finalReason = reason ?? (tracking === "untracked" ? "nonignored working-tree evidence requires review" : "tracked source evidence");
    try {
      const info = await lstat(absolute);
      if (info.isSymbolicLink()) {
        disposition = "excluded";
        finalReason = "repository symlink not followed";
      } else if (!info.isFile()) {
        disposition = "excluded";
        finalReason = "not a regular file";
      } else if (!reason && info.size > MAX_TEXT_BYTES) {
        disposition = "excluded";
        finalReason = `text candidate exceeds ${MAX_TEXT_BYTES} bytes`;
      } else if (!reason) {
        const bytes = await readFile(absolute);
        if (bytes.includes(0)) {
          disposition = "excluded";
          finalReason = "binary content detected";
        } else {
          hash = createHash("sha256").update(bytes).digest("hex");
        }
      }
    } catch {
      tracking = "missing";
      disposition = "missing";
      finalReason = "indexed path is missing from the working tree";
    }
    records.push({ id: sourceId(relative), path: relative, kind: classify(relative), tracking, disposition, reason: finalReason, sha256: hash, origin: "confirmed", targets: [] });
  }

  const status = await git(root, ["status", "--porcelain=v1", "-z"]);
  return {
    records,
    head: (await git(root, ["rev-parse", "HEAD"], true)) || undefined,
    branch: (await git(root, ["symbolic-ref", "--quiet", "--short", "HEAD"], true)) || undefined,
    dirty: status.length > 0,
  };
}
