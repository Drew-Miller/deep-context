---
id: REQ-DC-010
title: Checkpointed fresh-chat recovery
status: active
feature: tasks
origin: confirmed
source: doc/reports/HANDOFF-COVERAGE.md#v1-acceptance-coverage
code_patterns:
  - src/tasks/**
---

# Checkpointed fresh-chat recovery

An interrupted or compacted task resumes from its state file at an exact next safe action without reconstructing state from conversation history.
