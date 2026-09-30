---
id: SHELF-0012
title: Desktop chat entry with separate task and chat memory
status: done
type: enhancement
features:
  - bootstrap
  - tasks
  - routing
  - closure
tokens:
  - desktop
  - chat
  - identity
  - resume
  - skills
consideration: light
source: docs/reports/dc-08-discovery.md
pitch: Keep task identity independent of chat identity so a later desktop chat can resume the same
  work without merging unrelated memory.
status_history:
  - from: implemented-pending-desktop-verification
    to: active
    reason: Shelf-to-Backlog terminology migration
provenance: docs/reports/dc-08-discovery.md
related: []
conflicts: []
milestone: DC-08
verification:
  discovery: complete
  implementation: installed
  automated_tests: 44
  plugin_version: 0.1.0+codex.20260923161435
  evidence: docs/reports/dc-08-implementation.md
  shelf:
    - SHELF-0012
  requirements:
    - REQ-DC-026
    - REQ-DC-027
    - REQ-DC-028
    - REQ-DC-029
    - REQ-DC-030
    - REQ-DC-031
  plan: .local/archives/compact-layout-2026-09-25/original/docs/plan/DC-08-CHAT-TASK-PLAN.md
prior_ledger_state: awaiting-desktop-verification
aliases:
  - DC-08
verification_scope: Historical implementation evidence; does not validate the compact-layout
  migration or new CLI compatibility.
---

# Desktop task entry

Promoted into requirements REQ-DC-026 through REQ-DC-031 and implemented in DC-08. The user's flow is preserved: new desktop Project chat, deep-start plus request, generated name, independent task memory, and deep-resume for later chats. Fixture and packaging gates are separate from pending live desktop acceptance; see docs/reports/dc-08-implementation.md.

Design: docs/decisions/DEC-DC-001-chat-task-binding.md.
Plan: .local/archives/compact-layout-2026-09-25/original/docs/plan/DC-08-CHAT-TASK-PLAN.md.

DC-09 retains separate task/chat memory but supersedes deep-start and deep-resume with the single deep-task entry. Live desktop acceptance remains open.

## Prior milestone evidence (historical)

Scheduling prose here describes the prior checkpoint; current order and lifecycle come from this item’s frontmatter.

- Scope implemented: SHELF-0012, REQ-DC-026 through REQ-DC-031, accepted DEC-DC-001. Source and planning locations remain unchanged. No active implementation workers remain.
- Six skills installed as version 0.1.0+codex.20260923161435. Task UUIDs, per-chat memory, revision ownership, predecessor routing, source modes, explicit recovery, closure archives, root entry and registry resolution are integrated.
- Accepted local gates, 2026-09-23: 44 automated tests, typecheck/build, whitespace checks, official plugin and six skill validators, installed-cache start/save/release/resume/rebuild/validate smoke. Commands, fixture class, failures and limits: docs/reports/dc-08-implementation.md.
- Exact checkpoint: .local/archives/compact-layout-2026-09-25/original/docs/plan/checkpoints/DC-08-2026-09-23.sha256; manifest hash 592e9bfb42e24932d265d1088577a390468a30d8dd37e1c2ae60025fa94ceabe. Source HEAD remains 007cc323fa9b1fd153056c18fb6ddd78474c93cf; pre-existing changes preserved, no commit.
- Remaining: actual desktop fresh/reopened/renamed/forked task and cross-chat recovery acceptance. Synthetic-ID subprocess checks do not prove the desktop adapter. A pre-receipt partial closure archive requires explicit inspection rather than automatic cleanup.
- Self-context provenance refresh, index rebuild and validation passed. Read-only Aftershock validation detected newer source and UI planning files than its shadow inventory; refresh is separate from this implementation and was not performed.
- Exact next safe action: use a fresh desktop task to discover deep-start, select an initialized context root and do a read-only start/save/release/resume acceptance sequence. Record actual IDs, paths and findings before marking DC-08 fully accepted. Do not mutate Aftershock source or migrate existing context homes.

The DC-08 next action above is historical. DC-09 supersedes its storage and skill entry assumptions while retaining task/chat identity and ownership safeguards.
