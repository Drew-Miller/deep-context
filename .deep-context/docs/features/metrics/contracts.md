# Metrics contracts

- `stats` reads the project and reports counts, validation diagnostics, and router-selected bytes without altering canonical context. `--record` writes only the summary under `.local/metrics/`.
- `stats-history` reads recent local summaries and surfaces context and validation trends without importing raw prompts or answers.
- Route size is a recommendation from the selector. The corpus comparison includes the fixed routing reference set on both sides. A rough bytes/4 token estimate is labeled as such. Neither establishes actual model input, billing, quota use, or savings.
- Codex JSONL import reads `turn.completed.usage` and keeps only aggregate counters in the report. Cached input is part of input; reasoning output is part of output.
- A comparison receives evaluator-provided scores. It reports quality alongside token changes and does not infer controlled conditions or semantic correctness from logs.
- Project validation errors remain visible in stats; a report cannot silently turn failed validation into a pass.
