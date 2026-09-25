---
name: deep-task
description: Explicitly attach this project chat to a new or existing durable task, resume its work, or prepare a fresh-chat handoff.
---

# Deep Context Task

Run the bundled CLI relative to this `SKILL.md`: `node <plugin-root>/bin/deep-context.cjs`, where the plugin root is two directories above this skill. Do not rely on PATH. Keep the repository working directory; the task folder holds memory, and sourceBinding records the execution checkout.

## Enter or restore a task

Resolve the current chat with `resolve-task --project <project-root> --allow-unbound --json`, using CODEX_THREAD_ID when available. A genuine unbound result is distinct from errors. Without runtime identity, retain and report the explicit task path and binding ID, pass them on later calls, and disclose that automatic chat lookup is unavailable. Never invent a chat ID or select the newest task.

- Unbound, no explicit create/resume intent: run `list-tasks --project <project-root> --json` and offer Create from this conversation plus open tasks with title, short objective, and ownership status. If none exist, offer creation without an empty task list.
- Explicit new work: derive a short name and summarize relevant earlier discussion. Put optional `acceptanceCriteria`, `acceptedDecisions`, `constraints`, `findings`, and `openQuestions` strings in a local JSON file, then run `start-task --description <objective> --name <name> --context-file <path> --project <project-root> --json`. This writes the initial task context in the creation transaction. Distinguish proposals from accepted requirements; omit unrelated discussion. No extra summary approval is needed. Extend the manifest only for relevant selected feature context.
- Explicit continuation: resolve the named UUID, path, or title before `resume-task <id-or-path> --project <project-root> --expected-revision <revision> --json`. Disambiguate duplicate titles. A released task resumes immediately; another owner requires confirmation before adding `--takeover`, even if the previous desktop chat was archived or deleted.
- Already associated: reuse and refresh that task without creating another. Released associations load read-only context; explicit continuation reacquires ownership. One chat belongs to one task even after release or closure. For different work, provide a prompt for a new project chat. Closed tasks remain closed; new work uses a new chat and may link the closed task with `--predecessor-task-id`.

Read returned requiredReads immediately, including selected predecessor notes, then follow the manifest to relevant canonical context. Do not load full transcripts or every prior chat. Restoring an association does not grant ownership. Before source edits or shared task writes, resolve ownership and state again; never save as an old owner. Historical ambiguous associations may be explicitly selected for reading, not silently rewritten or used to bypass mutation checks.

Task memory alone does not authorize source edits. Select a read-only, existing, or isolated source binding according to repository instructions. Obey source ownership and worktree restrictions before attaching or creating an editable checkout.

`list-tasks --project <project-root> --json` shows the explicit task queue position when one is set. To change it, use `reorder-task <task-uuid>` with exactly one of `--before <task-uuid>`, `--after <task-uuid>`, or `--position <number>`. Positions live in local `tasks/ORDER.md`; reordering never changes another chat's ownership or task-state revision. Unranked tasks follow ranked tasks by stable ID.

## Preserve work and hand off

At milestones and before ending meaningful work turns, checkpoint completed work and evidence, decisions, blockers, open questions, and the exact next action. Skip redundant saves when nothing durable changed. Use `save-task <task> --expected-revision <revision>` with the current owner identity. For shared structured state, write a local JSON checkpoint file and pass `--checkpoint-file <path>`; supported optional string fields are `completedWork`, `decisions`, `blockers`, `openQuestions`, and `nextAction`. Each supplied field replaces that section, so retain relevant existing findings. Chat history records the checkpoint in the same transaction. `--note` remains available for additional notes. Never put secrets in checkpoints. Report failed saves rather than claiming work is preserved.

For an explicit request to prepare a fresh chat, save the checkpoint with `--release` and provide: “Use deep-task to continue task <UUID> in project <absolute project path>. Load its saved state and selected predecessor notes before working.” The user opens the replacement chat. Desktop archive/delete neither releases ownership nor closes task memory. If the old chat is gone, confirmed takeover restores the last saved checkpoint. Automatic care is agent behavior, not a background service or hook; unsaved work cannot be recovered after interruption.

At planning and material scope changes, inspect doc/BACKLOG.md and doc/ACTIVE.md, then relevant bodies. Record whether related proposals align, depend, conflict, or are superseded; unresolved product conflicts block the affected plan. Capture future proposals with `capture-backlog --title <title> --pitch <outcome-and-reason> --provenance <source>` without treating capture as implementation approval. Use `activate-backlog <id> --objective <accepted-objective>` only after checking related and opposing work; opposing active objectives need an accepted decision resolving both IDs. For interrupted Backlog writes, inspect the journal and use repair-context; changed intervening notes block repair. Promote durable project knowledge, refresh affected indexes, and validate changed context. Project knowledge remains durable without an active task.
