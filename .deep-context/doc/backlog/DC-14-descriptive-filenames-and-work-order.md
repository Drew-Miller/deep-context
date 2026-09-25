---
id: BACKLOG-DC-14
title: Descriptive filenames and explicit work ordering
pitch: Give human-facing Deep Context files readable names and let users order
  tasks and Backlog items explicitly, while stable identifiers and links survive
  renames.
status: done
features:
  - bootstrap
  - routing
  - tasks
tokens:
  - filenames
  - ordering
  - priority
  - backlog
  - tasks
provenance: User request, 2026-09-24; scheduled as the next Deep Context milestone
milestone: DC-14
related:
  - BACKLOG-DC-15
  - BACKLOG-A464417C-F116-4217-94D2-F1650510B429
  - BACKLOG-94DC3104-AFE4-4AA5-9181-CAF5A85D742A
conflicts: []
status_history:
  - from: planned
    to: active
    activation: ACTIVE-DCBC4B2B-9374-4528-A81C-C25DDCEF6688
  - from: active
    to: done
    reason: DC-14 local implementation and self-project migration accepted; installed desktop recovery tracked as a separate verification gate
activation: doc/active/descriptive-filenames-and-explicit-work-ordering--ACTIVE-DCBC4B2B-9374-4528-A81C-C25DDCEF6688.md
---

# Descriptive filenames and explicit work ordering

DC-14 implementation and the self-project migration passed coordinator review on 2026-09-24. The implementation ticket is complete. Fresh installed-plugin and Codex desktop recovery remain an explicit verification gate in the live ledger and the cross-runtime evaluation backlog item; that unrun check is not represented as a pass. DC-15 is the next implementation milestone; DC-13 remains behind it.

## Scope

- Inventory UUID-only filenames and paths across canonical Backlog, Active, requirements, decisions, reports, source provenance, task folders, generated indexes, and references. Set a readable naming rule for human-facing files. Retain stable IDs as metadata or binding identity; document any machine-only exception.
- Define safe slug creation, title changes, name collisions, existing-file migration, redirects or compatibility, and link/provenance updates. A rename must not change task identity, chat association, or source ownership.
- Add explicit ordering for Backlog and task work. The source of order must be stored as data, not inferred from filename or UUID sort. Generated indexes and task views should show that order, with stable tie and missing-rank behavior and a way to reorder without rewriting item identity.
- Preserve the one live project schedule and keep historical or completed items distinguishable from next-up work.

## Done when

- New human-facing files have descriptive paths; existing records can migrate without lost IDs, backlinks, activation paths, task bindings, or evidence.
- A user can place two Backlog items and two tasks in a chosen order, change that order, rebuild indexes, and see the same result in a fresh session.
- Validation detects duplicate or invalid ordering and broken references. Tests cover collisions, renamed titles, older GUID paths, generated-index freshness, and task recovery.

Accepted product requirements: `REQ-DC-049` and `REQ-DC-050`. Design decision: `DEC-DC-006`. Local implementation and migration evidence: `doc/reports/DC-14-IMPLEMENTATION.md`. The focused source checkpoint is `docs/plan/checkpoints/DC-14-2026-09-24.sha256`. Installation, commit, publication, and fresh desktop verification have not occurred.
