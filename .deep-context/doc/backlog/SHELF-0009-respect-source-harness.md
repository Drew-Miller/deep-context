---
id: SHELF-0009
title: Respect attached repository startup and source ownership
status: done
type: audit-remediation
features:
  - tasks
  - bootstrap
tokens:
  - agents
  - worktree
  - authority
consideration: light
source:
  document: doc/reports/ASTRA-AUDIT-2026-09-22.md
  finding: 7
pitch: Read the repository's required instruction and live-state route before
  creating a task. Refuse a worktree when the source harness prohibits another
  editable checkout. Promoted to `REQ-DC-023` by DC-07.
status_history:
  - from: implemented
    to: done
    reason: Shelf-to-Backlog terminology migration
provenance: '{"document":"doc/reports/ASTRA-AUDIT-2026-09-22.md","finding":7}'
related: []
conflicts: []
---

# Respect source harness

Read the repository's required instruction and live-state route before creating a task. Refuse a worktree when the source harness prohibits another editable checkout. Promoted to `REQ-DC-023` by DC-07.
