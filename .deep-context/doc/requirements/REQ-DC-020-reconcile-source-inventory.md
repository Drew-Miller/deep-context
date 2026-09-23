---
id: REQ-DC-020
title: Reconcile source inventory during validation
status: active
feature: bootstrap
origin: confirmed
source: doc/reports/ASTRA-AUDIT-2026-09-22.md
code_patterns: [src/validation/index.ts]
---

# Reconcile source inventory

Validation detects relevant added, changed, removed, or stale source records. Excluded or intentionally retired files do not create false missing-source errors.
