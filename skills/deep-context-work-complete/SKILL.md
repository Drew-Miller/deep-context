---
name: deep-context-work-complete
description: Complete a Deep Context work item or phase after verifying evidence and promoting accepted outcomes.
---

# Deep Context work complete

Use the selected project's `.deep-context/` as ROOT and follow `docs/requirements/plans-phases-and-work.md`. Determine whether the selected target is a work-item section, a whole phase or standalone work.

For a section, verify its scope and evidence, record the result in the containing phase, and promote implemented, accepted behavior to canonical requirements. Keep commands, checkpoints and open gates in that same phase file. Completing a section does not complete or move the phase. Dropped or replaced requests need no permanent history.

For a whole phase or standalone record, review all agreed work, prerequisites, current evidence and open gates. Promote durable outcomes before closure. Missing gates block completion. After verification, move the record with `python3 <skills-root>/_shared/paths.py ROOT work-move SOURCE completed`, using the actual root-relative file or justified split-subject directory. Record its completion timestamp and place it first in completed tracking. Preserve stable IDs and evidence.

Update the work board and parent overview plan with concise status and links; detailed evidence stays in the phase. Check dependents and tell the user which are ready. The helper repairs relative Markdown links outside historical interviews; review its result. Validate with `python3 <skills-root>/_shared/check_maps.py ROOT`.
