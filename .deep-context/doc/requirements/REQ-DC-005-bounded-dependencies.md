---
id: REQ-DC-005
title: Bounded dependency context
status: active
feature: routing
origin: confirmed
source: doc/reports/HANDOFF-COVERAGE.md#architectural-invariants
code_patterns: []
---

# Bounded dependency context

Feature dependencies use explicit `none`, `contract`, `feature`, or `deep` levels and do not recursively inherit context.
