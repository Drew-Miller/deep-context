---
id: REQ-DC-039
title: Local documentation and context statistics
status: active
feature: metrics
origin: confirmed
source: work/items/deep-metrics.md
code_patterns:
  - src/metrics/**
---

# Local statistics

An installed plugin can report document coverage, source review burden, validation issues, and selected context size with no additional model call. An invoked report can save a local summary and list recent snapshots for later comparison. Selected size and token estimates must be labeled as proxies, not confirmed usage.
