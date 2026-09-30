---
id: BACKLOG-62EF8C0D-EB9F-4F85-8B3C-1702D3D94ECD
title: Task-first context guide and compaction recovery
pitch: Make each Deep Task a small, durable reading guide with accepted task
  scope, a task plan, bounded checkpoints, and selective recovery after
  compaction.
status: planned
features:
  - tasks
  - routing
  - bootstrap
  - closure
tokens: []
provenance: User-approved DC-13 plan, 2026-09-24
related:
  - BACKLOG-A5FE803F-4751-424F-AC18-95E63B15A02D
  - SHELF-0012
conflicts: []
status_history:
  - from: proposed
    to: active
    activation: ACTIVE-F4647207-358B-4300-862D-6C5813545954
    decision: docs/decisions/DEC-DC-005-task-first-guide-and-sessionstart.md
aliases:
  - ACTIVE-F4647207-358B-4300-862D-6C5813545954
  - DC-13
tasks:
  - 8baf9512-3cf8-459f-84ba-93b2e21a83dd
prior_active_status: active
milestone: DC-13
verification:
  queue_position: 2
  task_id: 8baf9512-3cf8-459f-84ba-93b2e21a83dd
  active: ACTIVE-F4647207-358B-4300-862D-6C5813545954
  decision: DEC-DC-005
  requirements:
    - REQ-DC-044
    - REQ-DC-045
    - REQ-DC-046
    - REQ-DC-047
    - REQ-DC-048
  plan: tasks/task-first-context-guide/PLAN.md
  source_implementation: not-started
  desktop_verification: not-run
  context_validation: passed
prior_ledger_state: planned
order: 7
verification_scope: Historical implementation evidence; does not validate the
  compact-layout migration or new CLI compatibility.
---

# Task-first context guide and compaction recovery

Make each Deep Task a small, durable reading guide with accepted task scope, a task plan, bounded checkpoints, and selective recovery after compaction.

## Planning notes

- Unclassified. Capturing this proposal does not authorize implementation.

## Prior milestone evidence (historical)

Scheduling prose here describes the prior checkpoint; current order and lifecycle come from this item’s frontmatter.

- Accepted 2026-09-24: task memory is a required local folder and concise reading guide; task-specific accepted scope is saved first; detailed context is selected on demand; a small read-only `SessionStart` hook restores pointers when available, with instruction fallback. Standard model context remains in use.
- Canonical objective: `work/items/task-first-context-guide-and-compaction-recovery.md`, from Backlog `BACKLOG-62EF8C0D-EB9F-4F85-8B3C-1702D3D94ECD`. Decision: DEC-DC-005. Requirements: REQ-DC-044 through REQ-DC-048. Detailed plan: `tasks/task-first-context-guide/PLAN.md`.
- Deep Task: `tasks/task-first-context-guide`, bound to this project chat with a read-only source binding. The task records accepted criteria and constraints. DC-11 and DC-12 tasks remain independently owned; DC-12's installed desktop gate remains open.
- Accepted context gate, 2026-09-24: `node plugins/deep-context/bin/deep-context.cjs rebuild-indexes --project .deep-context` and `node plugins/deep-context/bin/deep-context.cjs validate --project .deep-context` passed on this live self-project; `git diff --check` passed. The focused context checkpoint is `.local/archives/compact-layout-2026-09-25/original/docs/plan/checkpoints/DC-13-2026-09-24.sha256` at source HEAD `9f6acae1f7403fb412691dabaa6f1adb08f31b78` with existing dirty DC-11/DC-12 work preserved. Evidence is this ledger and the bound task state. No DC-13 source implementation, hook packaging, desktop test, installation, commit, or publication has been performed.
- Exact next safe action: select an editable source binding under repository instructions, then implement the task file schema and bounded manifest route in phase 1 of the plan. Preserve existing DC-11/DC-12 changes and verify the installed desktop behavior separately.
- Scheduling update: DC-14 and DC-15 are complete. DC-13 source implementation remains queued after DC-16 in the current priority queue. Its accepted plan, task binding, and ownership are unchanged.
