---
name: deep-context-close-task
description: Run the Deep Context Drift Chamber, promote durable task knowledge, produce an evidence-bound closure review, and finalize cleanup only after the reviewed evidence remains unchanged.
---

# Close a Deep Context Task

Closure has a review stage and a separate destructive finalization stage.

1. Run `deep-context close-task <name>` to capture the current evidence fingerprint and create a pending `CLOSURE_REVIEW.md`.
2. Read `agents/PROJECT_CONTEXT_AGENT.md`, the task state/worklog, the final diff, and only the feature, contract, requirement, decision, and Shelf bodies justified by that evidence.
3. Promote durable architecture, contracts, requirements, decisions, and future intent. Record every promotion path. Preserve uncertain information as an unresolved finding or Shelf item rather than dropping it.
4. Rebuild indexes and validate the project.
5. Run `deep-context close-task <name>` again after all durable edits so the review is tied to final evidence.
6. Complete the generated review: name the reviewer, resolve or explicitly retain findings, list promotion references and verification evidence, set `findings_resolved: true`, and set `status: approved` only when justified.
7. Do not change task notes, source, or canonical context after approval. Run `deep-context close-task <name> --finalize` only when the user requested cleanup.

Finalization rejects changed evidence, unresolved review state, unsafe promotion paths, and dirty worktrees. It archives non-worktree task records outside `tasks/`, removes the worktree without force, preserves the branch, and never commits, merges, pushes, or deploys.
