import path from "node:path";
import { createHash } from "node:crypto";
import { readdir } from "node:fs/promises";
import { stringify } from "yaml";
import { exists, readText } from "../core/fs.js";
import { isForwarder, markdownRecords, recordCollections, recordFilename, type RecordCollection } from "../core/records.js";
import { parseMarkdown, renderMarkdown } from "../frontmatter/index.js";
import { rebuildIndexes } from "../indexing/index.js";
import { withProjectLock } from "../tasks/transactions.js";
import { assertNoPendingContext, writeContextOperation } from "../backlog/transactions.js";
import { assertNoPendingFilenameOperations, writeFilenameOperation } from "./transactions.js";

export interface FilenameMove { id: string; collection: RecordCollection; from: string; to: string }
export interface FilenamePreview { moves: FilenameMove[]; referenceUpdates: string[]; exceptions: string[]; conflicts: string[]; fingerprint: string }
export interface FilenameOptions { id?: string; apply?: boolean }

function labelFor(collection: RecordCollection, data: Record<string, unknown>): string | undefined {
  const value = collection === "sources" ? data.path : data.title;
  return typeof value === "string" && value.trim() ? value : undefined;
}

function forwarder(id: string, target: string): string {
  return renderMarkdown({ redirect_id: id, redirect_to: target }, `# Moved\n\nThis record moved to [${path.basename(target)}](./${path.basename(target)}).\n`);
}

function updateReferences(value: unknown, moves: Map<string, string>): unknown {
  if (typeof value === "string") {
    for (const [oldPath, newPath] of moves) {
      if (value === oldPath || value.startsWith(`${oldPath}#`)) return newPath + value.slice(oldPath.length);
    }
    return value;
  }
  if (Array.isArray(value)) return value.map((item) => updateReferences(item, moves));
  if (value && typeof value === "object") return Object.fromEntries(Object.entries(value).map(([key, item]) => [key, updateReferences(item, moves)]));
  return value;
}

async function preview(root: string, options: FilenameOptions): Promise<FilenamePreview> {
  const moves: FilenameMove[] = [];
  const referenceUpdates: string[] = [];
  const exceptions: string[] = [];
  const conflicts: string[] = [];
  let selected = false;
  const inputHash = createHash("sha256");
  for (const collection of recordCollections) {
    const directory = path.join(root, "doc", collection);
    const documents = await markdownRecords(directory);
    for (const { file, data } of documents) {
      if (isForwarder(data)) continue;
      if (collection === "reports" && path.dirname(file) !== directory) {
        exceptions.push(`${path.relative(root, file)}: closure report path is preserved`);
        continue;
      }
      if (typeof data.id !== "string") {
        if (collection === "reports") exceptions.push(path.relative(root, file));
        continue;
      }
      if (options.id && data.id !== options.id) continue;
      selected = true;
      inputHash.update(path.relative(root, file)).update(await readText(file));
      const label = labelFor(collection, data);
      if (!label) { exceptions.push(`${path.relative(root, file)}: no readable title or source path`); continue; }
      const idOnly = path.basename(file).toLowerCase() === `${data.id}.md`.toLowerCase();
      if (!idOnly && !options.id) continue;
      let target: string;
      try { target = path.join(path.dirname(file), recordFilename(data.id, label, collection)); }
      catch (error) { exceptions.push(`${path.relative(root, file)}: ${error instanceof Error ? error.message : String(error)}`); continue; }
      if (target === file) continue;
      const occupiedName = (await readdir(path.dirname(file))).find((name) => name.toLowerCase() === path.basename(target).toLowerCase() && name !== path.basename(file));
      const occupied = occupiedName ? path.join(path.dirname(file), occupiedName) : undefined;
      if (occupied && occupied !== file) {
        const found = documents.find((entry) => entry.file === occupied);
        if (!found || !isForwarder(found.data) || found.data.redirect_id !== data.id) {
          conflicts.push(`${path.relative(root, file)}: destination occupied by ${path.relative(root, occupied)}`);
          continue;
        }
      }
      moves.push({ id: data.id, collection, from: path.relative(root, file), to: path.relative(root, target) });
    }
  }
  if (options.id && !selected) conflicts.push(`Unknown canonical record ID: ${options.id}`);
  moves.sort((a, b) => a.from.localeCompare(b.from));
  const paths = new Map(moves.map((move) => [move.from, move.to]));
  if (paths.size) for (const collection of recordCollections) {
    for (const record of await markdownRecords(path.join(root, "doc", collection))) {
      if (isForwarder(record.data)) continue;
      if (JSON.stringify(updateReferences(record.data, paths)) !== JSON.stringify(record.data)) referenceUpdates.push(path.relative(root, record.file));
    }
  }
  const fingerprint = inputHash.update(JSON.stringify({ moves, referenceUpdates, exceptions, conflicts })).digest("hex");
  return { moves, referenceUpdates, exceptions, conflicts, fingerprint };
}

export async function migrateFilenames(root: string, options: FilenameOptions = {}): Promise<FilenamePreview> {
  if (!options.apply) return preview(root, options);
  return withProjectLock(root, async () => {
    await assertNoPendingContext(root);
    await assertNoPendingFilenameOperations(root);
    const plan = await preview(root, options);
    if (plan.conflicts.length) throw new Error(`Filename migration has conflicts: ${plan.conflicts.join("; ")}`);
    const contextCanonical = new Map<string, string>();
    const filenameCanonical = new Map<string, string>();
    const contextAliases = new Map<string, string>();
    const filenameAliases = new Map<string, string>();
    const pathMoves = new Map(plan.moves.map((move) => [move.from, move.to]));
    const moved = new Map(plan.moves.map((move) => [move.from, move]));
    for (const move of plan.moves) {
      const writes = move.collection === "backlog" || move.collection === "active" ? contextAliases : filenameAliases;
      const from = path.join(root, move.from);
      const to = path.join(root, move.to);
      const target = await exists(to) ? await readText(to) : null;
      if (target !== null) {
        const data = parseMarkdown(target).data;
        if (!isForwarder(data) || data.redirect_id !== move.id || data.redirect_to !== move.from) throw new Error(`Migration destination changed: ${move.to}`);
      }
      writes.set(from, forwarder(move.id, move.to));
      for (const alias of await markdownRecords(path.dirname(from))) {
        if (alias.file === from || alias.file === to || alias.data.redirect_id !== move.id || alias.data.redirect_to !== move.from) continue;
        writes.set(alias.file, forwarder(move.id, move.to));
      }
    }
    for (const collection of recordCollections) {
      const writes = collection === "backlog" || collection === "active" ? contextCanonical : filenameCanonical;
      for (const record of await markdownRecords(path.join(root, "doc", collection))) {
        if (isForwarder(record.data)) continue;
        const relative = path.relative(root, record.file);
        const destination = path.join(root, moved.get(relative)?.to ?? relative);
        const updated = updateReferences(record.data, pathMoves) as Record<string, unknown>;
        if (!moved.has(relative) && JSON.stringify(updated) === JSON.stringify(record.data)) continue;
        const content = JSON.stringify(updated) === JSON.stringify(record.data)
          ? await readText(record.file)
          : `---\n${stringify(updated).trimEnd()}\n---\n${record.body}`;
        writes.set(destination, content);
      }
    }
    const contextWrites = new Map([...contextCanonical, ...contextAliases]);
    const filenameWrites = new Map([...filenameCanonical, ...filenameAliases]);
    if (contextWrites.size) await writeContextOperation(root, contextWrites);
    if (filenameWrites.size) await writeFilenameOperation(root, filenameWrites);
    if (contextWrites.size || filenameWrites.size) {
      await rebuildIndexes(root);
    }
    return plan;
  });
}
