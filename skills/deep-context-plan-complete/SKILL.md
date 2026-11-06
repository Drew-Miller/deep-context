---
name: deep-context-plan-complete
description: Record completion of a Deep Context overview plan after its phase gates pass.
---

# Deep Context plan complete

Use the selected project's `.deep-context/` as ROOT. Follow `docs/requirements/plans-phases-and-work.md`.

Review the linked phases' work, current evidence, dependencies, knowledge promotion and open gates before completing the plan. Keep detailed verification in the phase records; the plan records a concise result and links to their evidence. Do not duplicate their work items or create separate execution packets merely to close the plan.

Record completion in the plan and its immediate parent overview (`plans/plans.md` for a top-level plan). Add the actual completion time as ISO `completed_at` frontmatter so the dashboard can show recent completions first. If only a historical completion date is known, record that date without inventing a time. Keep the source overview in execution order. Report unmet gates instead of claiming completion. Preserve completed plans unless removal was requested. Run `python3 <skills-root>/_shared/check_maps.py ROOT` after updating maps and links.

After settled edits to rendered context, run `python3 <skills-root>/_shared/refresh_dashboard.py` once for the batch. It refreshes only registered outputs, skips unchanged inputs and preserves each snapshot's single source project. It may run as a background shell command while independent work continues; collect its result before claiming the snapshot is current. Do not launch another AI agent or a persistent watcher. Report refresh failures.
