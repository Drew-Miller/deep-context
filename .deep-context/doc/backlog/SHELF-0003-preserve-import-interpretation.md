---
id: SHELF-0003
title: Preserve authored provenance during import refresh
status: done
type: audit-remediation
features:
  - bootstrap
tokens:
  - import
  - provenance
  - revision
consideration: light
source:
  document: doc/reports/ASTRA-AUDIT-2026-09-22.md
  finding: 1
pitch: Retain human-written source-record bodies and extra metadata on refresh.
  Changed source content must not silently retain an accepted interpretation
  without a review signal. Promoted to `REQ-DC-017` by DC-07.
status_history:
  - from: implemented
    to: done
    reason: Shelf-to-Backlog terminology migration
provenance: '{"document":"doc/reports/ASTRA-AUDIT-2026-09-22.md","finding":1}'
related: []
conflicts: []
---

# Preserve authored provenance

Retain human-written source-record bodies and extra metadata on refresh. Changed source content must not silently retain an accepted interpretation without a review signal. Promoted to `REQ-DC-017` by DC-07.
