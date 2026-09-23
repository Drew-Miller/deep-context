---
id: SHELF-0004
title: Enforce durable classification before task cleanup
status: done
type: audit-remediation
features:
  - closure
  - tasks
tokens:
  - closure
  - promotion
  - classification
consideration: light
source:
  document: doc/reports/ASTRA-AUDIT-2026-09-22.md
  finding: 2
pitch: Finalization must refuse unclassified or unresolved durable notes and
  task-local promotion references. Promoted to `REQ-DC-018` by DC-07.
status_history:
  - from: implemented
    to: done
    reason: Shelf-to-Backlog terminology migration
provenance: '{"document":"doc/reports/ASTRA-AUDIT-2026-09-22.md","finding":2}'
related: []
conflicts: []
---

# Enforce closure promotion

Finalization must refuse unclassified or unresolved durable notes and task-local promotion references. Promoted to `REQ-DC-018` by DC-07.
