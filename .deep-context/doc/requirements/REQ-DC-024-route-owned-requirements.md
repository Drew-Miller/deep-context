---
id: REQ-DC-024
title: Route requirements owned by selected features
status: active
feature: routing
origin: confirmed
source: doc/reports/ASTRA-AUDIT-2026-09-22.md
code_patterns: [src/routing/index.ts]
---

# Route owned requirements

A selected feature loads its associated atomic requirements, including those assigned through each requirement's `feature` field. Dependency expansion remains bounded.
