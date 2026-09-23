import { mkdtemp, readFile, rm, writeFile } from "node:fs/promises";
import os from "node:os";
import path from "node:path";
import { describe, expect, it } from "vitest";
import { activateBacklog, captureBacklog } from "../src/backlog/index.js";
import { repairContextOperations } from "../src/backlog/transactions.js";
import { parseMarkdown } from "../src/frontmatter/index.js";
import { initProject } from "../src/projects/index.js";
import { validateProject } from "../src/validation/index.js";

describe("Backlog planning", () => {
  it("captures elevator pitches, blocks opposing intent, and records accepted supersession", async () => {
    const home = await mkdtemp(path.join(os.tmpdir(), "deep-backlog-"));
    try {
      const root = await initProject(home, { name: "example" });
      const stopPath = await captureBacklog(root, { title: "Stop A", pitch: "Remove A because it confuses users.", provenance: "User request" });
      const stopId = String(parseMarkdown(await readFile(stopPath, "utf8")).data.id);
      const stopActive = await activateBacklog(root, stopId, "Remove A from the product", {});
      const stopActiveId = String(parseMarkdown(await readFile(stopActive, "utf8")).data.id);
      const doPath = await captureBacklog(root, { title: "Do A", pitch: "Offer A because users need it.", provenance: "Planning note", conflicts: [stopActiveId] });
      const doId = String(parseMarkdown(await readFile(doPath, "utf8")).data.id);
      await expect(activateBacklog(root, doId, "Offer A", {})).rejects.toThrow("Unresolved opposing intent");
      const decisionPath = path.join(root, "doc", "decisions", "DEC-A.md");
      await writeFile(decisionPath, `---\nid: DEC-A\ntitle: Replace stop-A intent\nstatus: accepted\nfeatures: []\nresolves: [${doId}, ${stopActiveId}]\n---\n\n# Replace stop-A intent\n\nThe user chose to offer A instead.\n`);
      const doActive = await activateBacklog(root, doId, "Offer A", { decision: "doc/decisions/DEC-A.md" });
      expect(parseMarkdown(await readFile(stopActive, "utf8")).data.status).toBe("superseded");
      expect(parseMarkdown(await readFile(stopPath, "utf8")).data.status).toBe("superseded");
      expect(parseMarkdown(await readFile(doPath, "utf8")).data.status).toBe("active");
      expect(await readFile(path.join(root, "doc", "BACKLOG.md"), "utf8")).toContain("Offer A because users need it.");
      expect(await readFile(path.join(root, "doc", "ACTIVE.md"), "utf8")).toContain("Offer A");
      expect(await readFile(doActive, "utf8")).toContain(doId);
      expect(await validateProject(root)).toEqual([]);
    } finally { await rm(home, { recursive: true, force: true }); }
  });

  it("recovers an interrupted multi-file Backlog write without overwriting intervening edits", async () => {
    const home = await mkdtemp(path.join(os.tmpdir(), "deep-backlog-recovery-"));
    try {
      const root = await initProject(home, { name: "example" });
      const item = await captureBacklog(root, { title: "Later work", pitch: "Keep this proposal available for future planning.", provenance: "Fixture request" });
      const before = await readFile(item, "utf8");
      const after = before.replace("status: proposed", "status: planned");
      const journal = path.join(root, ".local", "context-operations", "interrupted.json");
      await writeFile(journal, JSON.stringify({ version: 1, status: "pending", writes: [{ path: path.relative(root, item), before, after }] }));
      await expect(captureBacklog(root, { title: "Blocked", pitch: "Do not write while recovery is pending.", provenance: "Fixture" })).rejects.toThrow("repair-context");
      expect((await validateProject(root)).map((item) => item.code)).toContain("pending-context-operation");
      await writeFile(item, `${before}\nIntervening edit.\n`);
      await expect(repairContextOperations(root)).rejects.toThrow("Recovery refuses changed context");
      await writeFile(item, after);
      expect(await repairContextOperations(root)).toEqual([journal]);
      expect(parseMarkdown(await readFile(item, "utf8")).data.status).toBe("planned");
      expect(await validateProject(root)).toEqual([]);
    } finally { await rm(home, { recursive: true, force: true }); }
  });
});
