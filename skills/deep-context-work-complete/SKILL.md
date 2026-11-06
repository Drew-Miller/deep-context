---
name: deep-context-work-complete
description: Complete a Deep Context work item or phase after verifying evidence and promoting accepted outcomes.
---

# Deep Context work complete

Use the selected project's `.deep-context/` as ROOT and follow `docs/requirements/plans-phases-and-work.md`. Determine whether the selected target is a work-item section, a whole phase or standalone work.

For a section, verify its scope and evidence, record the result in the containing phase, and promote implemented, accepted behavior to canonical requirements. Keep commands, checkpoints and open gates in that same phase file. Completing a section does not complete or move the phase. Dropped or replaced requests need no permanent history.

For a whole phase or standalone record, review all agreed work, prerequisites, current evidence and open gates. Promote durable outcomes before closure. Missing gates block completion. After verification, move the record with `python3 <skills-root>/_shared/paths.py ROOT work-move SOURCE completed`, using the actual root-relative file or justified split-subject directory. Record its actual completion timestamp in ISO `completed_at` frontmatter and place it first in completed tracking. Do not invent missing historical dates. Preserve stable IDs and evidence.

Update the work board and parent overview plan with concise status and links; detailed evidence stays in the phase. Check dependents and tell the user which are ready. The helper repairs relative Markdown links outside historical interviews; review its result. Validate with `python3 <skills-root>/_shared/check_maps.py ROOT`.

After settled edits to rendered context, run `python3 <skills-root>/_shared/refresh_dashboard.py` once for the batch. It refreshes only registered outputs, skips unchanged inputs and preserves each snapshot's single source project. It may run as a background shell command while independent work continues; collect its result before claiming the snapshot is current. Do not launch another AI agent or a persistent watcher. Report refresh failures.

Work performed alongside a phase stays tracked in that phase even if it extends beyond the original feature, when that is the user's chosen working scope. Record a section's actual completion date/order when completing it, rather than backfilling unknown history. A user may rename the phase before or at completion; use the work-reorder skill's rename operation, preserve its ID and repair links. Do not rename automatically.
