---
name: deep-context-report
description: Recap work from the current conversation in the scope and item format the user asks for, such as what we just did or since the last recap.
---

# Deep Context report

Use the visible conversation to interpret the user's requested scope. “What did we just do?” normally means the recent work; “since I last asked” normally means since the previous recap if that boundary is visible and clear. Honor another stated range, phase or item selection. Do not force every request into a fixed latest-batch report.

Ask one short question when the scope or desired level of detail is materially ambiguous. If the user specifies enough, answer directly. If the relevant conversation is unavailable, say so and offer a narrower recap from what is visible. Do not reconstruct missing conversation from repository history or saved phase records. For durable project status, use the separate status skill instead.

Default to short item headings, with **What changed**, **Resulting behavior** and **How to validate** for each. Honor a user-requested checklist, table, brevity or other format. Include only useful details and meaningful limits; distinguish implemented, attempted, verified and user-accepted work. Do not invent changes or tests.

This is a conversational memory aid: save no report, batch log, recap checkpoint or “last reported” marker, and do not rebuild the dashboard. User feedback may refine the skill while using Deep Context. Keep shared changes generic and place project-specific preferences in the project's instructions when appropriate.
