---
id: BACKLOG-DC-14
title: Descriptive filenames and explicit work ordering
pitch: Give human-facing Deep Context files readable names and let users order tasks and Backlog
  items explicitly, while stable identifiers and links survive renames.
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
    reason: DC-14 local implementation and self-project migration accepted; installed desktop recovery
      tracked as a separate verification gate
aliases:
  - ACTIVE-DCBC4B2B-9374-4528-A81C-C25DDCEF6688
  - DC-14
tasks:
  - 8bcf931a-47f7-4bf7-a952-2a26bf16b4cd
prior_active_status: done
verification:
  task_id: 8bcf931a-47f7-4bf7-a952-2a26bf16b4cd
  source_implementation: done
  task_closure: complete
  closure_report: docs/reports/closure-descriptive-filenames.md
  desktop_verification: not-run
  automated_tests: 83
  requirements:
    - REQ-DC-049
    - REQ-DC-050
  decision: DEC-DC-006
  evidence: docs/reports/dc-14-implementation.md
  source_checkpoint: .local/archives/compact-layout-2026-09-25/original/docs/plan/checkpoints/DC-14-2026-09-24.sha256
prior_ledger_state: implemented-awaiting-desktop-verification
verification_scope: Historical implementation evidence; does not validate the compact-layout
  migration or new CLI compatibility.
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

Accepted product requirements: `REQ-DC-049` and `REQ-DC-050`. Design decision: `DEC-DC-006`. Local implementation and migration evidence: `docs/reports/dc-14-implementation.md`. The focused source checkpoint is `.local/archives/compact-layout-2026-09-25/original/docs/plan/checkpoints/DC-14-2026-09-24.sha256`. Installation, commit, publication, and fresh desktop verification have not occurred.

## Prior milestone evidence (historical)

Scheduling prose here describes the prior checkpoint; current order and lifecycle come from this item’s frontmatter.

- The `Descriptive File Names` chat owns task `8bcf931a-47f7-4bf7-a952-2a26bf16b4cd` in the existing checkout. It implemented readable canonical paths, guarded filename migration and repair, and explicit Backlog and task ordering. The coordinator reviewed its code and migration, found a forwarder-counting regression in `deep-stats`, and returned it for repair; the follow-up also hardened ID lookup, routing, and malformed-forwarder validation.
- Self-project migration moved 172 canonical records (11 Backlog, three Active, 158 source records), retained one-hop forwarding paths, preserved IDs and task bindings, and produced a zero-move subsequent preview. The live schedule was unchanged during implementation.
- Accepted local gates, 2026-09-24: `pnpm build`; 83 tests across 16 files; copied-package smoke; official plugin and four skill validators; self-project source refresh and validation; focused checkpoint hash verification; `git diff --check`. The isolated fixture reversed two Backlog items and two tasks, rebuilt indexes, and recovered the stored order in fresh CLI processes. Evidence: `docs/reports/dc-14-implementation.md`; source checkpoint: `.local/archives/compact-layout-2026-09-25/original/docs/plan/checkpoints/DC-14-2026-09-24.sha256` at HEAD `9f6acae1f7403fb412691dabaa6f1adb08f31b78` with prior dirty work preserved.
- Open gate: a fresh Codex desktop session with the updated installed plugin has not verified task and Backlog order recovery. The local install now contains the repository CLI, but no fresh desktop recovery check, commit, push, or publication occurred. Earlier closure reviews require a new source/context fingerprint after migration.
- Durable behavior is promoted to `REQ-DC-049`, `REQ-DC-050`, and `DEC-DC-006`; the Backlog and Active implementation records are marked done. The DC-14 Deep Task closed at revision 9. Its raw notes are archived under `.local/archives/8bcf931a-47f7-4bf7-a952-2a26bf16b4cd/`, and the durable closure report is `docs/reports/closure-descriptive-filenames.md`.
- Closed-task recovery revealed an absent archived `REPORT.md` in `requiredReads`. The repository CLI now selects the actual durable closure report and only includes existing legacy report paths; the closure tests and build pass. The DC-14 source checkpoint predates this focused recovery fix.
- Next verification action: when an updated plugin is installed under a separately authorized workflow, use a fresh project chat to confirm ordered views and task recovery. Track that result in this ledger and the cross-runtime evaluation work; it does not reopen the completed implementation ticket. DC-15 implementation may proceed independently.
