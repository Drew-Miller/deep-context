import { parse, stringify } from "yaml";

export interface MarkdownDocument {
  data: Record<string, unknown>;
  body: string;
}

export function parseMarkdown(contents: string): MarkdownDocument {
  if (!contents.startsWith("---\n")) return { data: {}, body: contents };
  const end = contents.indexOf("\n---\n", 4);
  if (end === -1) throw new Error("Unclosed YAML frontmatter");
  const parsed = parse(contents.slice(4, end)) ?? {};
  if (typeof parsed !== "object" || Array.isArray(parsed)) throw new Error("Frontmatter must be a mapping");
  return { data: parsed as Record<string, unknown>, body: contents.slice(end + 5) };
}

export function renderMarkdown(data: Record<string, unknown>, body: string): string {
  return `---\n${stringify(data).trimEnd()}\n---\n\n${body.trim()}\n`;
}
