---
id: REQ-DC-026
title: Start a named task from a desktop project chat
status: superseded
superseded_by: REQ-DC-035
feature: tasks
origin: confirmed
source: doc/reports/DC-08-DISCOVERY.md
---

# Start a named task from a desktop project chat

Invoking deep-start with a work description creates a task memory folder, derives a readable name, records objective and acceptance criteria, and associates the current chat when identity is available. It does not require creating another chat or opening a different workspace.

Implementation: docs/plan/DC-08-CHAT-TASK-PLAN.md. Deterministic fixture and packaging evidence, remaining desktop acceptance gates, and recovery limits: doc/reports/DC-08-IMPLEMENTATION.md. Automated checks do not establish actual desktop restart behavior.

Superseded by REQ-DC-035 for the deep-task entry. The separate task/chat identity behavior remains covered by REQ-DC-027 and REQ-DC-028.
