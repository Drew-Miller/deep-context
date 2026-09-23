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
