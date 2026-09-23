import { randomUUID } from "node:crypto";
import path from "node:path";
import { readdir } from "node:fs/promises";
import { stringify } from "yaml";
import { exists, readText, within } from "../core/fs.js";
import { parseMarkdown, renderMarkdown } from "../frontmatter/index.js";
import { activeSchema, backlogSchema, decisionSchema } from "../frontmatter/schemas.js";
import { rebuildIndexes } from "../indexing/index.js";
import { withProjectLock } from "../tasks/transactions.js";
import { assertNoPendingContext, writeContextOperation } from "./transactions.js";

export interface CaptureBacklogOptions {
  title: string; pitch: string; provenance: string; features?: string[]; related?: string[]; conflicts?: string[];
}

export async function captureBacklog(root: string, options: CaptureBacklogOptions): Promise<string> {
  if (![options.title, options.pitch, options.provenance].every((value) => value?.trim())) throw new Error("Backlog title, elevator pitch, and provenance are required");
  return withProjectLock(root, async () => {
    await assertNoPendingContext(root);
    const id = `BACKLOG-${randomUUID().toUpperCase()}`;
    const target = path.join(root, "doc", "backlog", `${id}.md`);
    const data = backlogSchema.parse({ id, title: options.title.trim(), pitch: options.pitch.trim(), status: "proposed", features: options.features ?? [], tokens: [], provenance: options.provenance.trim(), related: options.related ?? [], conflicts: options.conflicts ?? [], status_history: [] });
    await writeContextOperation(root, new Map([[target, renderMarkdown(data, `# ${data.title}\n\n${data.pitch}\n\n## Planning notes\n\n- Unclassified. Capturing this proposal does not authorize implementation.\n`)]]));
    await rebuildIndexes(root);
    return target;
  });
}

async function byId(directory: string, id: string): Promise<string | undefined> {
  if (!await exists(directory)) return undefined;
  for (const entry of await readdir(directory)) {
    if (!entry.endsWith(".md")) continue;
    const target = path.join(directory, entry);
    if (parseMarkdown(await readText(target)).data.id === id) return target;
  }
  return undefined;
}

export async function activateBacklog(root: string, id: string, objective: string, options: { tasks?: string[]; decision?: string }): Promise<string> {
  if (!objective.trim()) throw new Error("Accepted objective is required");
  return withProjectLock(root, async () => {
    await assertNoPendingContext(root);
    const backlogPath = await byId(path.join(root, "doc", "backlog"), id);
    if (!backlogPath) throw new Error(`Unknown Backlog ID: ${id}`);
    const item = parseMarkdown(await readText(backlogPath));
    const data = backlogSchema.parse(item.data);
    if (!(["proposed", "planned"] as string[]).includes(data.status)) throw new Error(`Backlog item cannot activate from status ${data.status}`);
    const conflicts: Array<{ id: string; path: string }> = [];
    for (const relatedId of data.conflicts) {
      const activePath = await byId(path.join(root, "doc", "active"), relatedId);
      if (activePath && activeSchema.parse(parseMarkdown(await readText(activePath)).data).status === "active") conflicts.push({ id: relatedId, path: activePath });
      const otherPath = await byId(path.join(root, "doc", "backlog"), relatedId);
      if (otherPath && backlogSchema.parse(parseMarkdown(await readText(otherPath)).data).status === "active") conflicts.push({ id: relatedId, path: otherPath });
    }
    const writes = new Map<string, string>();
    if (conflicts.length) {
      if (!options.decision) throw new Error(`Unresolved opposing intent: ${conflicts.map((item) => item.id).join(", ")}; an accepted decision is required`);
      const decisionPath = path.resolve(root, options.decision);
      if (!within(path.join(root, "doc", "decisions"), decisionPath)) throw new Error("Resolution must be a durable decision");
      const decision = decisionSchema.parse(parseMarkdown(await readText(decisionPath)).data);
      const resolves = Array.isArray(decision.resolves) ? decision.resolves.map(String) : [];
      if (decision.status !== "accepted" || ![id, ...conflicts.map((item) => item.id)].every((work) => resolves.includes(work))) throw new Error("Decision must explicitly resolve the proposed and opposing work IDs");
      for (const conflict of conflicts) {
        const doc = parseMarkdown(await readText(conflict.path));
        const prior = String(doc.data.status);
        doc.data.status = "superseded";
        const history = Array.isArray(doc.data.status_history) ? doc.data.status_history : [];
        doc.data.status_history = [...history, { from: prior, to: "superseded", decision: options.decision }];
        writes.set(conflict.path, `---\n${stringify(doc.data).trimEnd()}\n---\n${doc.body}`);
        if (conflict.path.includes(`${path.sep}active${path.sep}`)) {
          for (const originId of activeSchema.parse(doc.data).backlog) {
            const originPath = await byId(path.join(root, "doc", "backlog"), originId);
            if (!originPath) throw new Error(`Opposing active work has missing Backlog origin ${originId}`);
            const origin = parseMarkdown(await readText(originPath));
            if (origin.data.status !== "active") continue;
            origin.data.status = "superseded";
            const originHistory = Array.isArray(origin.data.status_history) ? origin.data.status_history : [];
            origin.data.status_history = [...originHistory, { from: "active", to: "superseded", decision: options.decision }];
            writes.set(originPath, `---\n${stringify(origin.data).trimEnd()}\n---\n${origin.body}`);
          }
        }
      }
    }
    const activeId = `ACTIVE-${randomUUID().toUpperCase()}`;
    const activePath = path.join(root, "doc", "active", `${activeId}.md`);
    const activation = activeSchema.parse({ id: activeId, title: data.title, objective: objective.trim(), status: "active", features: data.features, backlog: [id], tasks: options.tasks ?? [], decision: options.decision ?? null });
    writes.set(activePath, renderMarkdown(activation, `# ${data.title}\n\n${objective.trim()}\n`));
    item.data.status = "active";
    item.data.activation = `doc/active/${activeId}.md`;
    const history = Array.isArray(item.data.status_history) ? item.data.status_history : [];
    item.data.status_history = [...history, { from: data.status, to: "active", activation: activeId, ...(options.decision ? { decision: options.decision } : {}) }];
    writes.set(backlogPath, `---\n${stringify(item.data).trimEnd()}\n---\n${item.body}`);
    await writeContextOperation(root, writes);
    await rebuildIndexes(root);
    return activePath;
  });
}
