---
id: SHELF-0008
title: Keep project repository identity consistent
status: done
type: audit-remediation
features:
  - bootstrap
tokens:
  - project
  - repository
  - identity
consideration: light
source:
  document: doc/reports/ASTRA-AUDIT-2026-09-22.md
  finding: 6
pitch: Reruns must preserve the attached repository and refuse conflicting
  attachments or links. Promoted to `REQ-DC-022` by DC-07.
status_history:
  - from: implemented
    to: done
    reason: Shelf-to-Backlog terminology migration
provenance: '{"document":"doc/reports/ASTRA-AUDIT-2026-09-22.md","finding":6}'
related: []
conflicts: []
---

# Stabilize project identity

Reruns must preserve the attached repository and refuse conflicting attachments or links. Promoted to `REQ-DC-022` by DC-07.
