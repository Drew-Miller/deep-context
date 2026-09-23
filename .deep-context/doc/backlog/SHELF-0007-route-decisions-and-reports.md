---
id: SHELF-0007
title: Route durable decisions and closure reports
status: done
type: audit-remediation
features:
  - routing
  - closure
tokens:
  - decision
  - report
  - deep
  - index
consideration: light
source:
  document: doc/reports/ASTRA-AUDIT-2026-09-22.md
  finding: 5
pitch: Generate lightweight indexes from canonical metadata and make `deep`
  select relevant decisions and reports without expanding all history. Promoted
  to `REQ-DC-021` by DC-07.
status_history:
  - from: implemented
    to: done
    reason: Shelf-to-Backlog terminology migration
provenance: '{"document":"doc/reports/ASTRA-AUDIT-2026-09-22.md","finding":5}'
related: []
conflicts: []
---

# Route decisions and reports

Generate lightweight indexes from canonical metadata and make `deep` select relevant decisions and reports without expanding all history. Promoted to `REQ-DC-021` by DC-07.
