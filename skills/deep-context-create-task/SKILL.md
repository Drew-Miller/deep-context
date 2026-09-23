---
name: deep-context-create-task
description: Create or resume a scoped Deep Context task with a Git worktree, explicit context manifest, checkpointable state, and bounded dependency loading.
---

# Create a Deep Context Task

Run `deep-context create-task <name>` with explicit `--base`, `--branch`, `--feature`, or `--description` only when needed.

After creation:

1. Fill `TASK_CONTEXT.md` with the real outcome, acceptance criteria, constraints, and exclusions.
2. Select primary feature context and only direct dependency contracts in `CONTEXT_MANIFEST.md`. Never recursively inherit context levels.
3. Add selected atomic requirements and relevant Shelf metadata without making Shelf items active scope.
4. Work only in `worktree/`.
5. Before pause, compaction, or handoff, write decisions, discoveries, evidence, blockers, questions, and the exact next action into `TASK_STATE.md`, then run `deep-context checkpoint-task <name>`.

The CLI refuses unborn repositories, ambiguous detached bases, and unowned branch/worktree collisions. Do not bypass those guards.
