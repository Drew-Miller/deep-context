---
id: REQ-DC-041
title: Quality-aware paired usage comparison
status: active
feature: metrics
origin: confirmed
source: work/items/deep-metrics.md
code_patterns:
  - src/metrics/**
---

# Paired usage comparison

An optional benchmark compares baseline and Deep Context Codex JSONL runs and evaluator-provided correctness scores. The report shows both quality and token changes, and states that task, model, reasoning setting, source revision, and documentation maintenance costs require separate control or accounting. It must not call lower usage a successful saving when quality declines.
