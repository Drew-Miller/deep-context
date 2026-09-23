---
id: REQ-DC-023
title: Respect attached source startup and ownership
status: active
feature: tasks
origin: confirmed
source: doc/reports/ASTRA-AUDIT-2026-09-22.md
code_patterns: [src/tasks/index.ts, skills/deep-context-create-task/SKILL.md]
---

# Respect source harness

Task creation requires review of attached repository instructions when applicable and refuses a worktree when the context project records that the source forbids another editable checkout.
