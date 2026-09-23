---
id: REQ-DC-028
title: Keep task state and individual chat memory separate
status: implemented-pending-desktop-verification
feature: tasks
origin: confirmed
source: doc/reports/DC-08-DISCOVERY.md
---

# Keep task state and individual chat memory separate

Each chat records its own working notes under the selected task. Shared TASK_STATE.md carries the current objective, evidence, blockers and exact next safe action. Checkpoints preserve previous chat history and prevent competing writers from silently overwriting task state.

Implementation: docs/plan/DC-08-CHAT-TASK-PLAN.md. Deterministic fixture and packaging evidence, remaining desktop acceptance gates, and recovery limits: doc/reports/DC-08-IMPLEMENTATION.md. Automated checks do not establish actual desktop restart behavior.
