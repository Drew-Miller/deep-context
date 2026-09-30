---
id: DEC-DC-005
title: Task-first context guide with bounded startup recovery
status: accepted
features: [tasks, routing, bootstrap, closure]
source: user-approved DC-13 task-first context plan, 2026-09-24
---

# Task-first context guide with bounded startup recovery

Each project chat remains in its Codex project checkout. `deep-task` binds it to a required local task folder; an optional source checkout is a separate execution choice. The task manifest is a short table of contents, and the compact task state carries pending work and the next action. Detailed task and project files are loaded only when their descriptions make them relevant. Task-specific accepted requirements are saved first in task context and plan, then stable cross-task facts are promoted into canonical project documents.

A plugin-packaged, read-only `SessionStart` hook may restore task identity and pointers at startup and after compaction. Project `AGENTS.md` and `deep-task` instructions remain the fallback. This replaces only the no-lifecycle-hook choice in DEC-DC-004 and DC-12; their one-chat association, single-writer ownership, explicit takeover, and unsaved-work limitations remain authoritative. Hook behavior requires actual installed desktop verification before it is claimed as working.

The detailed file contract, implementation order, and gates are in `tasks/task-first-context-guide/PLAN.md`.
