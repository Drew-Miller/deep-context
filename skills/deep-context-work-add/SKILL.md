---
name: deep-context-work-add
description: Capture a requested work item within a Deep Context phase or as standalone backlog work.
---

# Deep Context work add

Use the selected project's `.deep-context/` as ROOT. Follow its shared definitions at `docs/requirements/plans-phases-and-work.md`.

Within about one minute, check compact active and backlog summaries, then completed summaries for material overlaps. Open only strong matches and present up to three candidates and relevant options when needed. Preserve tentative intent; report a bounded or incomplete search.

When a phase is selected, add the request as an ordered section in its descriptive work record. Keep scope, work items, implementation, verification and next action together; avoid separate packet or check files by default. Preserve the phase's stable ID and prerequisites. For a new phase or genuinely standalone request, create `work/backlog/<rank>-<slug>.md` with a stable unique id, title, feature, depends_on and origin, appending by ten unless another priority was requested. Use a subject folder only when multiple documents improve readability.

Keep pending requests transient. Promote implemented, accepted behavior to canonical requirements. Dropped or replaced requests need no permanent record. Update the phase's next action and the board summary if material scope changes. Do not start implementation merely because a request was captured.

Run `python3 <skills-root>/_shared/check_maps.py ROOT` after updating maps or links.

After settled edits to rendered context, run `python3 <skills-root>/_shared/refresh_dashboard.py` once for the batch. It refreshes only registered outputs, skips unchanged inputs and preserves each snapshot's single source project. It may run as a background shell command while independent work continues; collect its result before claiming the snapshot is current. Do not launch another AI agent or a persistent watcher. Report refresh failures.
