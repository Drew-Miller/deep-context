---
id: REPORT-DC-07-AUDIT
title: Astra recovery audit
status: accepted
features: [bootstrap, routing, tasks, closure]
---

# Astra Recovery Audit

Date: 2026-09-22. Status: accepted as remediation scope. This report records the findings from the read-only review before implementation; it is not a completion claim.

1. Import refresh discarded authored source-record bodies and additional metadata, and retained an imported disposition after source content changed.
2. Closure accepted unclassified durable notes and counted a soon-to-be-deleted task-local path as a promotion.
3. Closure swallowed Git diff failures and omitted `PROJECT.md` from its evidence fingerprint.
4. Validation accepted a source document newly added after the last inventory, so import coverage was not checked.
5. Decisions and closure reports had no generated discovery route; `deep` selected the same context as `feature`.
6. Reinitialization could make the `repo` link and machine state disagree or erase repository identity.
7. Task creation did not require the attached repository's own instruction route before deciding whether a worktree is allowed.
8. Demonstration feature routes omitted their atomic requirements despite requirement ownership metadata.
9. Existing acceptance evidence proved plugin discovery and basic checkpoint writing, not fresh-task recovery and durable promotion after deletion.

The source review used temporary Git fixtures for findings 1–6, then read the shipped self and Aftershock contexts for findings 7–9. The nine Shelf records below retain each proposed improvement independently; `docs/plan/TASKS.md` records active implementation scope and acceptance.
