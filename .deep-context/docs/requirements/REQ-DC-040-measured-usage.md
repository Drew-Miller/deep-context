---
id: REQ-DC-040
title: Optional measured Codex token usage
status: active
feature: metrics
origin: confirmed
source: work/items/deep-metrics.md
code_patterns:
  - src/metrics/**
---

# Measured usage

When a compatible Codex JSONL capture is supplied, report input, cached input, output, and reasoning output for completed turns. Do not double count subset counters or persist raw prompts and answers in metrics summaries. When no compatible capture is available, report measured usage as unavailable.
