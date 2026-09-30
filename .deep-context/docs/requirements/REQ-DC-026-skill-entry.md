---
id: REQ-DC-026
title: Start a named task from a desktop project chat
status: superseded
superseded_by: REQ-DC-035
feature: tasks
origin: confirmed
source: docs/reports/dc-08-discovery.md
---

# Start a named task from a desktop project chat

Invoking deep-start with a work description creates a task memory folder, derives a readable name, records objective and acceptance criteria, and associates the current chat when identity is available. It does not require creating another chat or opening a different workspace.

Implementation: .local/archives/compact-layout-2026-09-25/original/docs/plan/DC-08-CHAT-TASK-PLAN.md. Deterministic fixture and packaging evidence, remaining desktop acceptance gates, and recovery limits: docs/reports/dc-08-implementation.md. Automated checks do not establish actual desktop restart behavior.

Superseded by REQ-DC-035 for the deep-task entry. The separate task/chat identity behavior remains covered by REQ-DC-027 and REQ-DC-028.
