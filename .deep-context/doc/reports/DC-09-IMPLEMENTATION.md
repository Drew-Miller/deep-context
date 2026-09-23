---
id: REPORT-DC-09-IMPLEMENTATION
title: DC-09 repository context and three-skill implementation
status: implemented-pending-desktop-verification
features: [bootstrap, routing, tasks, closure]
source_checkpoint: 007cc323fa9b1fd153056c18fb6ddd78474c93cf
fixture_class: local CLI and temporary Git repositories
---

# DC-09 implementation evidence

The primary checkout now owns `.deep-context/`. Both existing external projects were copied and validated before their old paths became redirects. Backups remain beside those paths:

- `/Users/drewmiller/Developer/Deep Context/aftershock.backup-2026-09-23T17-14-40-028Z`
- `/Users/drewmiller/Developer/Deep Context/deep-context.backup-2026-09-23T17-18-03-641Z`

Aftershock's source harness, `docs/plan/TASKS.md`, `docs/plan/STATUS.json`, and prohibition on another editable application copy remain authoritative. The migration added a managed source `AGENTS.md` route and narrow Git ignore entries. It did not create a worktree, commit, merge, push, or edit the Aftershock live schedule.

The plugin source exposes only deep-init, deep-task, and deep-close. It generates no per-project reusable agent. Canonical documents and generated indexes are trackable; task notes, machine state, raw chat archives, the `repo` resolver, and owned checkouts are local. The Backlog capture and activation operations preserve IDs and status history and require an accepted resolving decision for opposing active intent. Closure writes concise reports to durable context while keeping raw task/chat archives local.

## Local verification

- `pnpm test`: 50 tests passed in 10 files on 2026-09-23. The test command excludes `.deep-context/` so the `repo` symlink cannot rediscover the same suite. An earlier unrestricted run discovered 48 tests twice; its 96-pass count is not a distinct acceptance gate. A sandbox-only rerun failed before collecting tests because Vitest could not create temporary directories; the approved rerun passed.
- `pnpm build`: TypeScript check and bundled CLI build passed on 2026-09-23.
- Official plugin validator: passed after removing empty retired skill directories. Official skill validator: passed for all three skills. The system Python lacked PyYAML, so these validators used the existing isolated validator runtime with PyYAML.
- Fixture coverage includes fresh and repeated initialization, legacy migration with a dated backup and preserved SHELF ID, migration rollback on validation failure, shared worktree context with separate task/chat memory, tracked-context exclusion from source inventory, Backlog conflict/supersession, recoverable Backlog write journals, and evidence-bound closure.
- Both migrated projects validated with the bundled CLI after migration. Git ignore checks confirmed `.local/`, `tasks/`, and `repo` are excluded while durable context files are eligible for tracking.

## Separate acceptance gates

The user-scoped personal plugin was reinstalled as `0.1.0+codex.20260923174315`. Its installed cache contains exactly deep-init, deep-task, and deep-close; the installed CLI exposes migration, Backlog, and recovery operations. The installed CLI refreshed self-project provenance after the cachebuster change, and both migrated projects validated. This is an installed CLI gate, not fresh desktop skill pickup.

A fresh desktop task must discover and exercise the three updated skills, chat recovery, and closure flow before desktop acceptance. The repository marketplace file supports a future Git-backed install only after commit and push; no remote marketplace pickup has been tested or claimed. Passing local and installed CLI checks does not establish either desktop gate.
