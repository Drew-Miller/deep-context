---
id: REQ-DC-050
title: Preserve explicit Backlog and task order independently of filenames
status: implemented
feature: tasks
origin: confirmed
source: work/items/dc-14-descriptive-filenames-and-work-order.md
code_patterns: [src/backlog/order.ts, src/tasks/order.ts, src/indexing/index.ts]
---

# Explicit work order

Users can place and reorder proposed or planned Backlog items and active Deep Tasks without changing their IDs, task ownership, or chat bindings. The order is stored as data, appears in generated Backlog and task views, and survives index rebuild and a fresh process. Missing positions have a stable tie rule; invalid or duplicate positions fail validation. Completed and historical work remains distinguishable from next-up work. A project's separately declared live schedule remains authoritative until its coordinator changes it; ordering a Backlog or task view does not silently edit that schedule.
