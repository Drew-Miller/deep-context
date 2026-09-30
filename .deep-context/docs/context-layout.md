---
id: DOC-COMPACT-CONTEXT-LAYOUT
title: Compact context layout
status: accepted
features: [bootstrap, routing, tasks, closure]
---

# Compact context layout

Accepted by the user for the self-project manual migration on 2026-09-25. The local plugin, CLI, and skill source now implement this contract. Installed desktop discovery remains an open verification gate.

## Tree and authority

`AGENTS.md` supplies context instructions; `CLAUDE.md` is a thin runtime adapter; `CONTEXT_MAP.md` is the entry and lightweight document guide; `PROJECT.md` describes identity.

- `docs/architecture.md`, `docs/requirements/`, `docs/decisions/`, and `docs/features/`: durable accepted knowledge. Feature folders use `overview.md` and `contracts.md`.
- `docs/reports/`: lasting audits, evaluations, accepted implementation and closure conclusions. Handoffs and raw output are not canonical reports merely because they exist.
- `work/items/<descriptive-name>.md`: one canonical record per objective. Stable IDs and legacy ID aliases are frontmatter, not UUID filename suffixes. Each record carries status, optional order, task references, acceptance criteria, and a concise outcome with verification gaps.
- `work/INDEX.md`: derived ordered queue, in-progress work, and completed history. Canonical item metadata is authoritative. No separately maintained Backlog/Active records or TASKS/STATUS schedule.
- `tasks/<descriptive-name>/`: optional local execution memory, including implementation plans, task state, chat notes, checkpoints and handoffs. Existing identity, binding, ownership and revision metadata survive relocation. Task-local plans do not override accepted requirements or decisions. Closed execution material is archived locally after promotion.
- `sources/records/`: durable imported source provenance, authored classifications, reasons, review history, hashes and promotion targets. Retain this tracked until authored content is separated from rebuildable bookkeeping. `sources/INDEX.md` is its derived selection view.
- `.local/`: ignored resolver state, recovery journals, raw audit/validation/metrics output, and recoverable archives. Review it by purpose before cleanup. Unique durable knowledge must be promoted before any disposal.

## Work lifecycle and maintenance

Statuses are proposed, planned, active, blocked, done and merged. Planned/proposed items may have an integer order; active requires actual execution, not merely a plan. Implementation completion can be done with explicit open verification gates. Deep Task closure and ownership are separate from work-item completion. A merged record is a small tombstone identifying its target; prior unique scope is preserved in the target or archived evidence.

The agent authors canonical files and invokes the bundled CLI to refresh generated indexes and validate. Users need not browse storage. The original manual migration utility remains in the local archive as historical evidence.

Historical hash manifests and raw operation journals are immutable snapshots. Live paths are repaired using a persisted old-to-new map; old snapshots remain independently verifiable against the retained original tree. Do not recreate legacy folders or forwarding-file clutter for historical references.

## Required product follow-up

Update CLI commands, schemas, templates, packaged skills and their references, audit inventory/role rules, stats, import/provenance, startup instructions, task recovery and evidence-bound closure to use this contract. Detect a manual-layout context before writes, preserve IDs/aliases and ownership, make migration recoverable/idempotent, define collision-safe descriptive filenames, and validate frontmatter, ordering, links, index freshness and historical evidence. Cover a clean initialized project, a legacy migration, this manual self-project, worktrees, installed package discovery and fresh-chat recovery. Do not claim these gates from the manual move.
