---
name: deep-context-work-start
description: Start an existing Deep Context work item.
---

# deep-context-work-start

Use the selected project’s `.deep-context/` as ROOT. After updating a map, check it with `python3 <skills-root>/_shared/check_maps.py ROOT`.

Resolve the selected item and check dependencies and blockers. If named prerequisites remain unfinished, ask the user how to proceed and report the blocker. Move it to active only when authorized and ready. Preserve identity and update status and board summaries. Use the shared helper described below for paths and links.

For path moves use `python3 <skills-root>/_shared/paths.py ROOT work-move SOURCE LANE`, where SOURCE is root-relative and LANE is `backlog`, `active` or `completed`. The helper refuses symlinks and collisions, stages renames, and updates relative inline Markdown links outside historical `docs/interviews/`. Review its result and update semantic status and maps yourself. Preserve any recovery staging directory if rollback fails.

If the selected work item is a section within a phase work record, mark that section in progress and check its prerequisites. Do not move the entire phase record merely to start one section.

The execution home is the phase record: keep scope, ordered requests, implementation, verification and next action together. Start at the selected phase rather than scaffolding separate plan packets or check files. Follow `docs/requirements/plans-phases-and-work.md`.
