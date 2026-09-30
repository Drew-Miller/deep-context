---
id: BACKLOG-8ACB4B31-7C35-41B7-A654-278DC72E796C
title: Unify work items and link execution tasks
pitch: Represent each thing to do as one durable work item with a clear
  lifecycle; make Backlog and Active generated views, link optional Deep Tasks
  by stable IDs, and keep task progress and verification snapshots in their own
  evidence homes.
status: merged
milestone: DC-16
features:
  - routing
  - tasks
tokens: []
provenance: "DC-15 self-project audit, 2026-09-24: work/INDEX.md lists completed
  DC-14 beside current objectives and validation checks only one direction of
  Backlog/Active status mismatch. Expanded by user agreement, 2026-09-24, on a
  single work-item model with optional Deep Task links."
related:
  - BACKLOG-A464417C-F116-4217-94D2-F1650510B429
  - BACKLOG-DC-15
  - BACKLOG-10F58B56-1C7C-4C7F-9CBD-EE7494DDC6DD
  - BACKLOG-94DC3104-AFE4-4AA5-9181-CAF5A85D742A
conflicts: []
status_history:
  - from: planned
    to: merged
verification:
  queue_position: 1
  source_implementation: not-started
  desktop_verification: not-run
prior_ledger_state: planned
aliases:
  - DC-16
verification_scope: Historical implementation evidence; does not validate the
  compact-layout migration or new CLI compatibility.
merged_into: BACKLOG-A464417C-F116-4217-94D2-F1650510B429
---

# Unify work items and link execution tasks

Represent each thing to do as one durable work item with a clear lifecycle. Backlog and Active should become generated views of that record, rather than separate canonical descriptions of the same objective. A Deep Task is an optional execution workspace linked by stable ID; its progress checkpoints remain in its task folder.

## Product adoption disposition

The linked [compact layout product item](adopt-compact-context-layout.md) now owns the implemented lifecycle. The [adoption report](../../docs/reports/compact-layout-product-adoption-2026-09-30.md) records tests and the remaining installed desktop gate. This record retains the accepted DC-16 scope and prior milestone evidence for traceability.

## Accepted direction for planning

- Define one canonical work-item record with a stable ID, objective, provenance, lifecycle status, ordering, related/conflicting work, and links to accepted requirements, decisions, tasks, and outcome evidence when those exist. Use understandable statuses for proposed, ready, in progress, done, and superseded work. Decide exact user-facing terms before implementing CLI or file migrations.
- Generate Backlog, current work, and history views from these records. Avoid a second canonical Active record that repeats the objective. A ready item need not own a task, and an open verification gate does not by itself keep completed implementation in progress.
- When an execution chat uses Deep Task, link its task UUID to the work-item ID in both directions. Store milestones and handoff notes in the task folder. Do not require progress updates to a work item when no Deep Task is used; capture durable outcomes and evidence when work completes.
- Distinguish task progress checkpoints from source-hash verification snapshots in names and guidance. Keep source hashes, accepted reports, and closure evidence in their appropriate evidence homes, linked by ID or metadata rather than a shared filename prefix.
- Preserve existing Backlog IDs, Active IDs, task bindings, requirements, decisions, reports, source snapshots, and historical references through a recoverable migration. Define aliases or an explicit mapping for old records, update source inventory and routing, and validate closure/checkpoint integrity. Do not delete historical evidence simply because the new view omits it.
- Make agents and the CLI follow one lifecycle model. Validate IDs, links, status transitions, ordering, generated-view freshness, and completion evidence. Test fresh-chat task recovery and both task-backed and taskless work-item completion on an initialized fixture and this self-project.

## Scope boundary

This is the work-item and task-link product milestone, using the self-project as a migration and validation case. The broader authority and `docs/` versus `.local/archives/compact-layout-2026-09-25/original/docs/plan/` cleanup remains in `BACKLOG-10F58B56-1C7C-4C7F-9CBD-EE7494DDC6DD`. Natural-language capture and overlap detection remain linked future work, not implicit requirements to solve in this migration.

## Done when

- One canonical work item describes each objective; generated views show the correct queue, current work, and history without repeating authoritative content.
- A chat can start or resume its optional Deep Task from a work-item ID, and the task can identify its work item after compaction. Taskless work can be marked done with durable outcome evidence.
- Existing project records and links migrate safely; validators, package checks, source provenance, and fresh-process recovery pass. The self-project retains its one live schedule until an explicit schedule migration is accepted.

## Prior milestone evidence (historical)

Scheduling prose here describes the prior checkpoint; current order and lifecycle come from this item’s frontmatter.

- User-accepted direction, 2026-09-24: each objective is one durable work item with a lifecycle; Backlog, current work, and history are generated views. An optional Deep Task links by stable ID and owns its progress and handoff checkpoints. Source-hash verification snapshots remain separate evidence. Work without a Deep Task needs a durable completion outcome, not periodic ticket updates.
- Canonical scope: `work/items/unify-work-items-and-link-execution-tasks.md`, promoted from the DC-15 Active-lifecycle finding instead of creating a duplicate item. Backlog queue position is 1. Existing Backlog and Active identities, task bindings, accepted knowledge, evidence and links must survive a recoverable migration.
- Exact next safe action: create a new DC-16 Deep Task and accepted migration plan, review current schemas and references, then implement and validate on a representative fixture and this self-project. No source implementation, installation, commit, push, or desktop gate is claimed here. DC-13 remains intact behind this milestone.
