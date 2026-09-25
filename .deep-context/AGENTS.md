# deep-context Deep Context routing

This project stores durable context in human-readable files. Chats and active context windows are disposable.

## Startup

1. Read `CONTEXT_MAP.md`.
2. Read `START_HERE.md` and its live `docs/plan/TASKS.md` and `docs/plan/STATUS.json` route before acting.
3. Read `repo/AGENTS.md` if present and follow the source repository's required reads and ownership constraints.
4. If inside `tasks/<task>/`, read the task's `AGENTS.md`, `TASK_CONTEXT.md`, `CONTEXT_MANIFEST.md`, and `TASK_STATE.md`.
5. Read generated indexes in `doc/` to select canonical files, including decisions and reports for relevant deep context.
6. Read only relevant canonical bodies. Do not recursively load `doc/`.

Project-root chats may resolve an existing association with the installed Deep Context CLI: resolve-task --project <this context root>, using CODEX_THREAD_ID when available. Follow requiredReads, including predecessor chat notes. An unbound chat stays at project scope until deep-task is requested. Explicit task path and binding ID are the fallback, never a newest-task guess.

## Preservation

Write durable architecture, contracts, requirements, decisions, or future intent under `doc/`. Checkpoint active work before ending or handing off. Task folders are disposable only after closure promotes durable knowledge.

## Authority

Architecture, accepted requirements, and contracts outrank active task criteria; active criteria outrank Backlog intent; Backlog intent outranks speculation. Existing repository-specific routing and live schedules retain their declared authority.


## Automatic context care

Resolve known chat bindings on startup. Read BACKLOG.md and ACTIVE.md at planning and scope changes. Save useful decisions, discoveries, blockers, evidence and future ideas as they arise. Refresh indexes and validate affected context. An unbound chat stays at project scope.

<!-- deep-context:task-routing:start -->

## Task association and recovery

On startup and recovery after compaction, resolve this chat with the installed plugin's bundled CLI: resolve-task --project <this context root> --allow-unbound --json, using CODEX_THREAD_ID when available. Locate the CLI relative to the installed deep-task SKILL.md; do not assume PATH or persist a plugin cache path. If the plugin cannot be located, report the missing capability rather than claiming task restoration.

Follow returned requiredReads, then selected manifest context. A successful unbound result stays at project scope until the user invokes deep-task. Errors are not unbound results. Without runtime identity, use the explicit task path and binding ID and disclose that automatic chat lookup is unavailable. Never select the newest task.

One chat belongs to one task even after release or closure. A released association restores context without acquiring ownership. Before source edits or shared task writes, resolve ownership and current revision. A non-owner must explicitly resume; another owner requires confirmed takeover. Closed tasks remain closed. Task attachment neither changes the source working directory nor grants source edit permission.

Checkpoint meaningful decisions, completed work and evidence, blockers, open questions, and exact next action at milestones and before ending work turns; skip unchanged checkpoints. Use save-task with owner identity and expected revision; optional --checkpoint-file supplies completedWork, decisions, blockers, openQuestions and nextAction as strings. Preserve existing relevant findings when updating sections. Report failed saves. Read Backlog and Active indexes at scope changes and load only relevant bodies.

For an explicit fresh-chat handoff, checkpoint and release ownership, then give a resume prompt with the task UUID and project path. Desktop archive/delete does not release ownership or close task memory. A replacement chat may take over after confirmation and recover from the last saved checkpoint. Automatic care is agent behavior, not a lifecycle hook; interruption can lose unsaved work.

<!-- deep-context:task-routing:end -->
