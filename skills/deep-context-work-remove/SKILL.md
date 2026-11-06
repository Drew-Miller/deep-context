---
name: deep-context-work-remove
description: Remove a specifically selected Deep Context work item when explicitly requested.
---

# deep-context-work-remove

Use the selected project’s `.deep-context/` as ROOT. After updating a map, check it with `python3 <skills-root>/_shared/check_maps.py ROOT`.

Identify the exact item, its dependents and references; inspect consequences and ask when deletion or its impact is ambiguous. Preserve durable conclusions and evidence and repair references before removal. Do not treat completion as deletion. Update the board and verify remaining dependencies and links.

If the selected work item is a section, remove only that selected request and repair references. Do not remove its containing phase record or preserve a permanent tombstone for dropped or replaced requests.

After settled edits to rendered context, run `python3 <skills-root>/_shared/refresh_dashboard.py` once for the batch. It refreshes only registered outputs, skips unchanged inputs and preserves each snapshot's single source project. It may run as a background shell command while independent work continues; collect its result before claiming the snapshot is current. Do not launch another AI agent or a persistent watcher. Report refresh failures.
