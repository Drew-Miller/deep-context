---
id: BACKLOG-D1EBBDBD-A494-4764-804B-D4F81718393D
title: deep-metrics
pitch: "Measure context and usage efficiency while preserving accurate long-term product
  requirements, features, decisions, and completed-work history. Accepted direction: inexpensive
  local statistics plus optional benchmarks; distinguish measured usage from estimates, unavailable
  counters, and comparative savings. Define desktop token access, realistic baselines, maintenance
  overhead, and documentation recovery accuracy before implementing metrics."
status: done
features:
  - metrics
  - routing
  - tasks
  - closure
tokens: []
provenance: User-approved deep-metrics task setup plan in Codex chat
  01a0cc1b-27a2-7311-8a8c-2b2b403e750f on 2026-09-23; task a40ae7ea-23be-4f14-b439-e267cc807944.
related:
  - BACKLOG-A5FE803F-4751-424F-AC18-95E63B15A02D
conflicts: []
status_history:
  - from: proposed
    to: active
    activation: ACTIVE-94EE748B-ECD7-495E-B757-9D9417A16F88
aliases:
  - ACTIVE-94EE748B-ECD7-495E-B757-9D9417A16F88
  - DC-11
tasks:
  - a40ae7ea-23be-4f14-b439-e267cc807944
prior_active_status: active
milestone: DC-11
verification:
  task_id: a40ae7ea-23be-4f14-b439-e267cc807944
  requirements:
    - REQ-DC-039
    - REQ-DC-040
    - REQ-DC-041
  decision: DEC-DC-003
  automated_tests: 66
  evidence: docs/reports/dc-11-metrics.md
  context_validation: passed
  local_snapshot: recorded
  desktop_verification: not-run
prior_ledger_state: implementation-done
verification_scope: Historical implementation evidence; does not validate the compact-layout
  migration or new CLI compatibility.
---

# deep-metrics

Measure context and usage efficiency while preserving accurate long-term product requirements, features, decisions, and completed-work history. Accepted direction: inexpensive local statistics plus optional benchmarks; distinguish measured usage from estimates, unavailable counters, and comparative savings. Define desktop token access, realistic baselines, maintenance overhead, and documentation recovery accuracy before implementing metrics.

## Planning notes

- Implementation was authorized in the same Codex chat after task setup. Requirements REQ-DC-039 through REQ-DC-041 and decision DEC-DC-003 record the accepted first version.

## Prior milestone evidence (historical)

Scheduling prose here describes the prior checkpoint; current order and lifecycle come from this item’s frontmatter.

- Authorization: implement the previously accepted local statistics and optional benchmark design in the existing `deep-metrics` task. No commit, push, or installation was requested for this milestone.
- Task: `tasks/deep-metrics`; source: `/Users/drewmiller/Developer/deep-context` on an existing checkout. Durable objective: `work/items/deep-metrics.md`.
- Contracts: `docs/features/metrics/contracts.md`; requirements REQ-DC-039 through REQ-DC-041; decision DEC-DC-003.
- Implemented: `deep-stats` skill, local stats and history commands, optional Codex JSONL usage import, paired comparison with evaluator scores, local summary recording under `.local/metrics`, and copied-package smoke.
- Accepted local gates: typecheck/build; 66 tests; official plugin and new skill validators; isolated copied-package smoke; whitespace check. Evidence and source hashes: `docs/reports/dc-11-metrics.md`.
- Live self-project gate passed after source inventory refresh and index rebuild. The first local snapshot reports zero structural errors and a 69.5% route-size reduction by bytes for the metrics feature, with fixed routing references included on both sides. It is not measured token savings.
- Open gates: fresh installed-skill and desktop usage check; controlled paired and semantic recovery benchmarks. There are 52 source records still awaiting human review.
- Exact next safe action: review the locally built plugin and run a matched fresh-session benchmark when a baseline and rubric are available. Installation/publication and DC-10 desktop recovery acceptance remain separate.
