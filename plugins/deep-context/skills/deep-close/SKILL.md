---
name: deep-close
description: Review, promote, and safely close explicit Deep Context task memory using evidence-bound closure safeguards.
---

# Close Deep Context Task Memory

Run the bundled CLI from the plugin root two directories above this `SKILL.md`: `node <plugin-root>/bin/deep-context.cjs`. Do not assume it is on `PATH`.

Resolve the current chat association first. Use `close-task <id-or-path> --project <path> --chat-id <id> --binding-id <id> --expected-revision <number>` to create or refresh the closure review; derive IDs and revision from the resolver, not from the user. Read task state, chat notes, final source evidence, Backlog and Active pitches, and only canonical bodies justified by that evidence. Classify every task-local note; promote durable architecture, contracts, requirements, decisions, and future intent before approval. Reconcile delivered features and requirements with active records and Backlog statuses. A path under `tasks/` is never a durable promotion.

Rebuild indexes and validate after durable edits, then refresh the review so it matches current evidence. Read the review, complete classification and findings, and approve only after inspection. The deep-close request includes eligible finalization; run the same command with `--finalize` when approved. Surface unresolved findings or cleanup blockers instead of guessing. Raw task and chat memory remains local in `.local/archives/`; a concise closure report is durable. Finalization rejects changed evidence, incomplete classification, unresolved findings, unsafe promotion paths, and dirty Deep Context-owned worktrees. It never commits, merges, pushes, deploys, or deletes an external checkout.
