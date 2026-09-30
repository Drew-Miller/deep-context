---
name: metrics
description: Local documentation and context measurements with optional Codex usage comparisons.
status: active
owns:
  - src/metrics/**
  - plugins/deep-context/skills/deep-stats/**
tokens:
  - stats
  - usage
  - benchmark
contracts:
  - docs/features/metrics/contracts.md
requirements:
  - REQ-DC-039
  - REQ-DC-040
  - REQ-DC-041
depends_on:
  routing: contract
  tasks: contract
origin: confirmed
---

# Metrics

Deep Stats reports local documentation structure and suggested route size. Optional Codex JSONL import supplies measured turn usage; paired runs support quality-aware comparisons. Reports distinguish measured counters, rough token estimates, and semantic questions that require an evaluator.
