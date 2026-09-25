---
name: deep-stats
description: Measure a Deep Context project's documentation health, suggested context size, and optional Codex token usage or paired benchmark runs.
---

# Deep Stats

Run the bundled CLI from the plugin root two directories above this `SKILL.md`: `node <plugin-root>/bin/deep-context.cjs`. Resolve the project's `.deep-context` directory and call `stats --project <context-path> --record`. Add `--feature <name> --level contract|feature|deep` when the user wants to measure a specific context route. The report records document counts, validation issues, suggested context size, and a labeled token estimate locally under `.local/metrics/`. Use `stats-history --project <context-path>` to read recent summaries and compare trend points.

For measured Codex CLI usage, pass a user-provided `codex exec --json` capture with `--usage-jsonl <path>`. For a paired benchmark, use `compare-usage --baseline <jsonl> --deep-context <jsonl> --baseline-score <0..1> --deep-score <0..1> --project <context-path> --record`. Use the same task, model, reasoning settings, and source revision in each run. Score answer correctness using the same rubric and cite the evidence; the CLI accepts scores but does not grade. Keep raw JSONL in its original location. Recorded summaries contain counts and scores, not prompts or answers.

For knowledge recovery benchmarks, include cases that require a fresh agent to find an accepted requirement and rationale, identify a superseded decision, distinguish Backlog intent from active scope, recover a conclusion from completed work, and stay selective as unrelated history grows. Record expected canonical sources and a scoring rubric before running either arm. Repeat with fresh sessions and compare correctness before interpreting token differences. Include setup and documentation maintenance time when reporting net efficiency.

Report selected bytes as a router recommendation, not confirmed model reads. The bytes-divided-by-four token estimate is approximate. Measured JSONL usage includes cached input within input and reasoning output within output. Do not call a lower token count a saving when quality falls. Installed desktop tasks do not automatically expose per-task usage to this skill; mark measured usage unavailable when no compatible JSONL is provided. A skill invocation records a snapshot, but there is no background collection.
