---
id: SHELF-0005
title: Fail closed on incomplete closure evidence
status: done
type: audit-remediation
features:
  - closure
tokens:
  - git
  - fingerprint
  - authority
consideration: light
source:
  document: doc/reports/ASTRA-AUDIT-2026-09-22.md
  finding: 3
pitch: Git evidence collection must fail on errors. The closure fingerprint must
  include all authoritative project context, including `PROJECT.md`. Promoted to
  `REQ-DC-019` by DC-07.
status_history:
  - from: implemented
    to: done
    reason: Shelf-to-Backlog terminology migration
provenance: '{"document":"doc/reports/ASTRA-AUDIT-2026-09-22.md","finding":3}'
related: []
conflicts: []
---

# Complete closure evidence

Git evidence collection must fail on errors. The closure fingerprint must include all authoritative project context, including `PROJECT.md`. Promoted to `REQ-DC-019` by DC-07.
