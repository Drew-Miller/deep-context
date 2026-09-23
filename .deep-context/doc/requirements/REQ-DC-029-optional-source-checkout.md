---
id: REQ-DC-029
title: Create memory tasks without requiring a Git worktree
status: implemented-pending-desktop-verification
feature: tasks
origin: confirmed
source: doc/reports/DC-08-DISCOVERY.md
---

# Create memory tasks without requiring a Git worktree

Task memory can be created for read-only analysis, planning or a project with no repository. A source resolver identifies evidence separately from task identity. Isolated write worktrees remain supported subject to source policy; owned and borrowed checkouts have distinct cleanup behavior.

Implementation: docs/plan/DC-08-CHAT-TASK-PLAN.md. Deterministic fixture and packaging evidence, remaining desktop acceptance gates, and recovery limits: doc/reports/DC-08-IMPLEMENTATION.md. Automated checks do not establish actual desktop restart behavior.
