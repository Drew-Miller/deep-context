---
id: REQ-DC-018
title: Classify each task note before cleanup
status: active
feature: closure
origin: confirmed
source: doc/reports/ASTRA-AUDIT-2026-09-22.md
code_patterns: [src/closure/index.ts]
---

# Classify before cleanup

Closure requires an explicit reviewed disposition for every task-local note. A promoted note names existing durable targets; a task-local path never counts as promotion. Unresolved findings prevent finalization.
