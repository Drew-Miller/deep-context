---
name: deep-context-work-reorder
description: Change the order of Deep Context work items within a lane.
---

# deep-context-work-reorder

Use the selected project’s `.deep-context/` as ROOT. After updating a map, check it with `python3 <skills-root>/_shared/check_maps.py ROOT`.

Resolve the requested order and preserve dependency constraints. Run `python3 <skills-root>/_shared/paths.py ROOT work-reorder LANE NAME...`, listing every numbered item in the lane in desired order. Update the board summaries to match and check links.

If work items are sections within one phase record, reorder those sections and repair any affected links; do not run a file reorder for a section-only change.

Phase execution records stay in `work/`, while overview plans link their order. Preserve the phase's consolidated implementation and verification when moving its priority.
