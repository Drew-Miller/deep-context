---
name: deep-task
description: Start or explicitly continue task memory for the current Codex chat; automatically route and checkpoint useful project context during work.
---

# Deep Context Task

Run the bundled CLI relative to this `SKILL.md`: `node <plugin-root>/bin/deep-context.cjs`, where the plugin root is two directories above this skill. Do not rely on PATH.

Resolve the current chat with `resolve-task --project <project-root> --json`, using CODEX_THREAD_ID when available. An existing association in the same chat is reused. For new work, derive a short name from the user's request and run `start-task --description <request> --name <name> --project <project-root> --json`. For an explicit continuation, first resolve the named task, then `resume-task <id-or-path> --project <project-root> --expected-revision <returned-revision> --json`. Clarify ambiguous selection or active ownership conflicts; use takeover only with explicit authorization. If runtime identity is missing, retain and report the explicit task path and binding ID; never guess a chat ID or select the newest task.

Read returned requiredReads. At planning and material scope changes, inspect `doc/BACKLOG.md` pitches and `doc/ACTIVE.md` objectives, then relevant canonical files. Record whether related proposals align, depend, conflict, or are superseded. An unresolved product conflict blocks acceptance of the affected plan; capturing an idea does not authorize its implementation.

During work, save useful decisions, discoveries, blockers, evidence, changed objectives, and future ideas promptly to task or project files. Capture a future proposal with `capture-backlog --title <title> --pitch <outcome-and-reason> --provenance <source>`; this does not authorize implementation. Use `activate-backlog <id> --objective <accepted-objective>` only after checking related and opposing work. An opposing active objective requires an accepted durable decision that explicitly resolves both work IDs. If a Backlog operation was interrupted, inspect its local journal and use `repair-context`; changed intervening notes block repair. Use `save-task` with the current owner binding and state revision for shared task checkpoints, including the exact next safe action. Checkpoint before long operations, handoff, and completion. Refresh affected indexes and validate changed context. Project-level knowledge is durable even without an active task. Automatic care is agent behavior, not a background service, and cannot recover thoughts never written before interruption.

Task memory alone does not authorize source edits. Select a read-only, existing, or isolated source binding in accordance with the repository harness. Obey the project’s source ownership and worktree restrictions before attaching or creating an editable checkout.
