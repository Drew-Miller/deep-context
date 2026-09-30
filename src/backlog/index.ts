import { randomUUID } from "node:crypto";
import path from "node:path";
import { stringify } from "yaml";
import { readText, within } from "../core/fs.js";
import { canonicalRecordById, newRecordPath, recordFilename } from "../core/records.js";
import { layoutPaths } from "../core/layout.js";
import { parseMarkdown, renderMarkdown } from "../frontmatter/index.js";
import { activeSchema, backlogSchema, decisionSchema, workItemSchema } from "../frontmatter/schemas.js";
import { rebuildIndexes } from "../indexing/index.js";
import { assertNoPending, withProjectLock, writeTransaction } from "../tasks/transactions.js";
import { assertNoPendingContext, writeContextOperation } from "./transactions.js";
import { assertNoPendingFilenameOperations } from "../migration/transactions.js";

export interface CaptureBacklogOptions {
  title: string; pitch: string; provenance: string; features?: string[]; related?: string[]; conflicts?: string[];
}

async function assertCompactReady(root: string): Promise<void> {
  await assertNoPending(root);
  await assertNoPendingContext(root);
  await assertNoPendingFilenameOperations(root);
}

/** Compact lifecycle API. Backlog commands retain their names for CLI compatibility. */
export async function captureWorkItem(root: string, options: CaptureBacklogOptions): Promise<string> {
  if (![options.title, options.pitch, options.provenance].every(value => value?.trim())) throw new Error("Work item title, pitch, and provenance are required");
  return withProjectLock(root, async () => {
    await assertCompactReady(root);
    const layout = layoutPaths(root);
    if (!layout.compact) throw new Error("Compact work items require the compact layout");
    const id = `WORK-${randomUUID().toUpperCase()}`;
    const target = await newRecordPath(layout.work, id, options.title, "work-item");
    const item = workItemSchema.parse({ id, title: options.title.trim(), pitch: options.pitch.trim(), provenance: options.provenance.trim(), status: "proposed", features: options.features ?? [], tokens: [], related: options.related ?? [], conflicts: options.conflicts ?? [], aliases: [], tasks: [], requirements: [], decisions: [], open_gates: [] });
    await writeTransaction(root, new Map([[target, renderMarkdown(item, `# ${item.title}\n\n${item.pitch}\n\n## Planning notes\n\n- Captured proposal; implementation is not authorized.\n`)]]));
    await rebuildIndexes(root);
    return target;
  });
}

export async function activateWorkItem(root: string, id: string, objective: string, options: { tasks?: string[]; decision?: string } = {}): Promise<string> {
  if (!objective.trim()) throw new Error("Accepted objective is required");
  return withProjectLock(root, async () => {
    await assertCompactReady(root);
    const layout = layoutPaths(root);
    if (!layout.compact) throw new Error("Compact work items require the compact layout");
    const target = await canonicalRecordById(layout.work, id);
    if (!target) throw new Error(`Unknown work item: ${id}`);
    const document = parseMarkdown(await readText(target));
    const item = workItemSchema.parse(document.data);
    if (!["proposed", "planned", "blocked"].includes(item.status)) throw new Error(`Work item cannot activate from status ${item.status}`);
    if (options.tasks?.length) throw new Error("Attach execution tasks with start-task or resume-task so both work and task records are journaled together");
    const conflicts: Array<{ file: string; data: ReturnType<typeof workItemSchema.parse> }> = [];
    for (const conflictId of item.conflicts) {
      const conflictPath = await canonicalRecordById(layout.work, conflictId);
      if (!conflictPath) throw new Error(`Conflicting work item is missing: ${conflictId}`);
      const conflict = workItemSchema.parse(parseMarkdown(await readText(conflictPath)).data);
      if (conflict.status === "active") conflicts.push({ file: conflictPath, data: conflict });
    }
    const writes = new Map<string, string>();
    if (conflicts.length) {
      if (!options.decision) throw new Error(`Unresolved opposing intent: ${conflicts.map(conflict => conflict.data.id).join(", ")}; an accepted decision is required`);
      const decisionPath = path.resolve(root, options.decision);
      if (!within(layout.decisions, decisionPath)) throw new Error("Resolution must be a durable decision");
      const decision = decisionSchema.parse(parseMarkdown(await readText(decisionPath)).data);
      const resolves = Array.isArray(decision.resolves) ? decision.resolves.map(String) : [];
      if (decision.status !== "accepted" || ![item.id, ...conflicts.map(conflict => conflict.data.id)].every(work => resolves.includes(work))) throw new Error("Decision must explicitly resolve the proposed and opposing work IDs");
      for (const conflict of conflicts) {
        const opposing = parseMarkdown(await readText(conflict.file));
        opposing.data.status = "merged";
        opposing.data.merged_into = item.id;
        delete opposing.data.order;
        opposing.data.status_history = [...(Array.isArray(opposing.data.status_history) ? opposing.data.status_history : []), { from: conflict.data.status, to: "merged", decision: options.decision }];
        writes.set(conflict.file, renderMarkdown(opposing.data, opposing.body));
      }
    }
    document.data.status = "active";
    document.data.objective = objective.trim();
    delete document.data.order;
    document.data.status_history = [...(Array.isArray(document.data.status_history) ? document.data.status_history : []), { from: item.status, to: "active", ...(options.decision ? { decision: options.decision } : {}) }];
    if (options.decision) document.data.decisions = [...new Set([...(item.decisions ?? []), options.decision])];
    writes.set(target, renderMarkdown(document.data, document.body));
    await writeTransaction(root, writes);
    await rebuildIndexes(root);
    return target;
  });
}

export async function completeWorkItem(root: string, id: string, outcome: string, openGates: string[] = []): Promise<string> {
  if (!outcome.trim()) throw new Error("Completed work requires a durable outcome");
  return setWorkItemStatus(root, id, "done", { outcome, openGates });
}

export async function setWorkItemStatus(root: string, id: string, status: "planned" | "blocked" | "merged" | "done", options: { outcome?: string; openGates?: string[]; mergedInto?: string } = {}): Promise<string> {
  return withProjectLock(root, async () => {
    await assertCompactReady(root);
    const layout = layoutPaths(root);
    if (!layout.compact) throw new Error("Compact work items require the compact layout");
    const target = await canonicalRecordById(layout.work, id);
    if (!target) throw new Error(`Unknown work item: ${id}`);
    const document = parseMarkdown(await readText(target));
    const item = workItemSchema.parse(document.data);
    if (["merged", "done"].includes(item.status)) throw new Error(`${item.status === "done" ? "Done" : "Merged"} work items are terminal; create a successor work item instead`);
    if (status === "done" && !options.outcome?.trim()) throw new Error("Completed work requires a durable outcome");
    if (status === "merged" && !options.mergedInto?.trim()) throw new Error("Merged work requires its target work item");
    if (status === "merged") {
      const mergedTarget = await canonicalRecordById(layout.work, options.mergedInto!.trim());
      if (!mergedTarget) throw new Error("Merged work must identify another canonical target");
      const targetItem = workItemSchema.parse(parseMarkdown(await readText(mergedTarget)).data);
      if (targetItem.id === item.id) throw new Error("Merged work must identify another canonical target");
    }
    document.data.status = status;
    if (status !== "planned") delete document.data.order;
    if (status === "done") {
      document.data.outcome = options.outcome!.trim();
      document.data.open_gates = [...new Set(options.openGates ?? [])];
    }
    if (status === "merged") document.data.merged_into = options.mergedInto!.trim();
    document.data.status_history = [...(Array.isArray(document.data.status_history) ? document.data.status_history : []), { from: item.status, to: status }];
    await writeTransaction(root, new Map([[target, renderMarkdown(document.data, document.body)]]));
    await rebuildIndexes(root);
    return target;
  });
}

export async function captureBacklog(root: string, options: CaptureBacklogOptions): Promise<string> {
  if (layoutPaths(root).compact) return captureWorkItem(root, options);
  if (![options.title, options.pitch, options.provenance].every((value) => value?.trim())) throw new Error("Backlog title, elevator pitch, and provenance are required");
  return withProjectLock(root, async () => {
    await assertNoPendingContext(root);
    await assertNoPendingFilenameOperations(root);
    const id = `BACKLOG-${randomUUID().toUpperCase()}`;
    const target = path.join(root, "doc", "backlog", recordFilename(id, options.title, "backlog"));
    const data = backlogSchema.parse({ id, title: options.title.trim(), pitch: options.pitch.trim(), status: "proposed", features: options.features ?? [], tokens: [], provenance: options.provenance.trim(), related: options.related ?? [], conflicts: options.conflicts ?? [], status_history: [] });
    await writeContextOperation(root, new Map([[target, renderMarkdown(data, `# ${data.title}\n\n${data.pitch}\n\n## Planning notes\n\n- Unclassified. Capturing this proposal does not authorize implementation.\n`)]]));
    await rebuildIndexes(root);
    return target;
  });
}

async function byId(directory: string, id: string): Promise<string | undefined> {
  return canonicalRecordById(directory, id);
}

export async function activateBacklog(root: string, id: string, objective: string, options: { tasks?: string[]; decision?: string }): Promise<string> {
  if (layoutPaths(root).compact) return activateWorkItem(root, id, objective, options);
  if (!objective.trim()) throw new Error("Accepted objective is required");
  return withProjectLock(root, async () => {
    await assertNoPendingContext(root);
    await assertNoPendingFilenameOperations(root);
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
    const activePath = path.join(root, "doc", "active", recordFilename(activeId, data.title, "active"));
    const activation = activeSchema.parse({ id: activeId, title: data.title, objective: objective.trim(), status: "active", features: data.features, backlog: [id], tasks: options.tasks ?? [], decision: options.decision ?? null });
    writes.set(activePath, renderMarkdown(activation, `# ${data.title}\n\n${objective.trim()}\n`));
    item.data.status = "active";
    item.data.activation = path.relative(root, activePath).split(path.sep).join("/");
    const history = Array.isArray(item.data.status_history) ? item.data.status_history : [];
    item.data.status_history = [...history, { from: data.status, to: "active", activation: activeId, ...(options.decision ? { decision: options.decision } : {}) }];
    writes.set(backlogPath, `---\n${stringify(item.data).trimEnd()}\n---\n${item.body}`);
    await writeContextOperation(root, writes);
    await rebuildIndexes(root);
    return activePath;
  });
}
