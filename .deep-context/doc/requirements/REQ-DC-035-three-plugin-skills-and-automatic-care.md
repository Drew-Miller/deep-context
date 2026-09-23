---
id: REQ-DC-035
title: Offer three plugin-scoped skills and automatic memory care
status: implemented-pending-desktop-verification
feature: tasks
origin: confirmed
source: doc/decisions/DEC-DC-002-repository-memory-and-plugin-scope.md
supersedes: REQ-DC-031
---

# Offer three plugin-scoped skills and automatic memory care

The only user-facing skills are deep-init, deep-task, and deep-close. Reusable skills and agent behavior are installed through the plugin, not copied into each project. The agent restores a known chat association, keeps an unbound chat at project scope, and checkpoints useful decisions, discoveries, blockers, evidence, objective changes, future ideas, and the exact next action during normal work. The agent refreshes affected indexes and validates changed context. This is not a background service and cannot recover unwritten thoughts.
