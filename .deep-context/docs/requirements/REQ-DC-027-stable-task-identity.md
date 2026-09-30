---
id: REQ-DC-027
title: Separate task identity from chat identity and titles
status: implemented-pending-desktop-verification
feature: tasks
origin: confirmed
source: docs/reports/dc-08-discovery.md
---

# Separate task identity from chat identity and titles

Each task has a stable identifier independent of folder label and desktop title. Different chats can resume one task. Associations are recoverable from canonical files; neither title matching nor a project-global current task may select memory.

Implementation: .local/archives/compact-layout-2026-09-25/original/docs/plan/DC-08-CHAT-TASK-PLAN.md. Deterministic fixture and packaging evidence, remaining desktop acceptance gates, and recovery limits: docs/reports/dc-08-implementation.md. Automated checks do not establish actual desktop restart behavior.
