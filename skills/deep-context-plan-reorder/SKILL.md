---
name: deep-context-plan-reorder
description: Reorder Deep Context plans and recursively renumber their descendants.
---

# deep-context-plan-reorder

Use the selected project’s `.deep-context/` as ROOT. After updating a map, check it with `python3 <skills-root>/_shared/check_maps.py ROOT`.

Run `python3 <skills-root>/_shared/paths.py ROOT plan-reorder PARENT NAME...`, listing all numbered direct children in desired order; PARENT is `plans` or a root-relative numbered plan directory. It updates descendants and relative Markdown links. Preserve IDs and dependencies, update `plans/plans.md` ordering and verify references.

Reorder overview plans or optional subplans. Their links coordinate phase order; do not move phases between work status lanes or duplicate work-item details merely to reorder a plan. Update linked phase order in the overview when requested.

After settled edits to rendered context, run `python3 <skills-root>/_shared/refresh_dashboard.py` once for the batch. It refreshes only registered outputs, skips unchanged inputs and preserves each snapshot's single source project. It may run as a background shell command while independent work continues; collect its result before claiming the snapshot is current. Do not launch another AI agent or a persistent watcher. Report refresh failures.
