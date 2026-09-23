---
id: SHELF-0011
title: Prove recovery and durable promotion after task deletion
status: done
type: audit-remediation
features:
  - tasks
  - closure
tokens:
  - checkpoint
  - recovery
  - verification
consideration: light
source:
  document: doc/reports/ASTRA-AUDIT-2026-09-22.md
  finding: 9
pitch: Exercise a resumed task from its saved next action, promote a durable
  discovery, finalize cleanup, and rediscover the result through indexes.
  Reconcile accepted verification claims with actual gates. Promoted to
  `REQ-DC-025` by DC-07.
status_history:
  - from: implemented
    to: done
    reason: Shelf-to-Backlog terminology migration
provenance: '{"document":"doc/reports/ASTRA-AUDIT-2026-09-22.md","finding":9}'
related: []
conflicts: []
---

# Prove fresh recovery

Exercise a resumed task from its saved next action, promote a durable discovery, finalize cleanup, and rediscover the result through indexes. Reconcile accepted verification claims with actual gates. Promoted to `REQ-DC-025` by DC-07.
