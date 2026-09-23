---
id: REQ-DC-009
title: Worktree-backed task isolation
status: active
feature: tasks
origin: confirmed
source: doc/reports/HANDOFF-COVERAGE.md#v1-acceptance-coverage
code_patterns:
  - src/tasks/**
---

# Worktree-backed task isolation

When the attached source harness permits another editable checkout, a task uses a recorded Git worktree. A source repository that prohibits another editable copy cannot be assigned a Deep Context worktree.

DC-08 supersedes the interpretation that every memory task needs a worktree. REQ-DC-029 permits no-source and read-only memory plus explicitly borrowed checkouts. This requirement's isolation and source-policy safeguards still apply when creating an owned editable worktree; legacy create-task retains its original behavior.
