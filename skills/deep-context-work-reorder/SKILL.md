---
name: deep-context-work-reorder
description: Reorder work items or rename a Deep Context phase/work record while preserving references.
---

# deep-context-work-reorder

Use the selected project’s `.deep-context/` as ROOT. After updating a map, check it with `python3 <skills-root>/_shared/check_maps.py ROOT`.

Resolve the requested order and preserve dependency constraints. Run `python3 <skills-root>/_shared/paths.py ROOT work-reorder LANE NAME...`, listing every numbered item in the lane in desired order. Update the board summaries to match and check links.

If work items are sections within one phase record, reorder those sections and repair any affected links; do not run a file reorder for a section-only change.

Phase execution records stay in `work/`, while overview plans link their order. Preserve the phase's consolidated implementation and verification when moving its priority.

After settled edits to rendered context, run `python3 <skills-root>/_shared/refresh_dashboard.py` once for the batch. It refreshes only registered outputs, skips unchanged inputs and preserves each snapshot's single source project. It may run as a background shell command while independent work continues; collect its result before claiming the snapshot is current. Do not launch another AI agent or a persistent watcher. Report refresh failures.

For a user-requested phase rename, run `python3 <skills-root>/_shared/paths.py ROOT work-rename SOURCE TARGET` with root-relative paths in the same lane and the same rank. Update the record title and heading, preserve its stable ID, feature ownership, work items and evidence, and check remaining live references outside the context store. This is allowed during the phase or at completion when requested; completion alone does not require a rename. Rebuild the registered dashboard after the change.
