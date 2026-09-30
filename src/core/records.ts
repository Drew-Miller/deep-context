import { readdir } from "node:fs/promises";
import path from "node:path";
import { exists, readText } from "./fs.js";
import { parseMarkdown } from "../frontmatter/index.js";

export const recordCollections = ["backlog", "active", "requirements", "decisions", "reports", "sources"] as const;
export type RecordCollection = typeof recordCollections[number];

export function readableSlug(value: string, fallback: string): string {
  const slug = value.normalize("NFKD").replace(/[\u0300-\u036f]/g, "").toLowerCase().replace(/[^a-z0-9]+/g, "-").replace(/^-|-$/g, "").slice(0, 80).replace(/-+$/g, "");
  return slug || fallback;
}

export function recordFilename(id: string, label: string, fallback: string): string {
  if (!/^[A-Za-z0-9-]+$/.test(id)) throw new Error(`Unsafe record ID: ${id}`);
  const suffix = `--${id}.md`;
  const slug = readableSlug(label, fallback).slice(0, Math.min(80, 240 - suffix.length)).replace(/-+$/g, "");
  return `${slug || fallback}${suffix}`;
}

export async function markdownRecords(directory: string): Promise<Array<{ file: string; data: Record<string, unknown>; body: string }>> {
  if (!await exists(directory)) return [];
  const output: Array<{ file: string; data: Record<string, unknown>; body: string }> = [];
  for (const entry of (await readdir(directory, { withFileTypes: true })).sort((a, b) => a.name.localeCompare(b.name))) {
    const file = path.join(directory, entry.name);
    if (entry.isDirectory()) output.push(...await markdownRecords(file));
    else if (entry.isFile() && entry.name.endsWith(".md")) {
      const document = parseMarkdown(await readText(file));
      output.push({ file, data: document.data, body: document.body });
    }
  }
  return output;
}

export async function canonicalRecordById(directory: string, id: string): Promise<string | undefined> {
  const matches = (await markdownRecords(directory)).filter(({ data }) => !isForwarder(data) && (data.id === id || (Array.isArray(data.aliases) && data.aliases.includes(id))));
  if (matches.length > 1) throw new Error(`Duplicate record ID ${id}`);
  return matches[0]?.file;
}

export function isForwarder(data: Record<string, unknown>): boolean {
  return Object.hasOwn(data, "redirect_to");
}

/** Caller serializes allocation and write under the project lock. IDs stay in metadata. */
export async function newRecordPath(directory: string, id: string, label: string, fallback: string): Promise<string> {
  const existing = await canonicalRecordById(directory, id);
  if (existing) return existing;
  const names = new Set((await exists(directory) ? await readdir(directory) : []).map(name => name.toLowerCase()));
  const slug = readableSlug(label, fallback);
  for (let n = 1; ; n++) {
    const name = `${slug}${n === 1 ? "" : `-${n}`}.md`;
    if (!names.has(name.toLowerCase())) return path.join(directory, name);
  }
}
