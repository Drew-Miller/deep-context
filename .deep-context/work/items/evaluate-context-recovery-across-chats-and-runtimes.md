---
id: BACKLOG-B67B98B1-4C75-4891-95C6-571B904E4E1E
title: Evaluate context recovery across chats and runtimes
pitch: Repeat evidence-scored fresh Codex and Claude tests, including bound-task
  handoff and compaction recovery; measure factual accuracy, authority choice,
  selected reads, trace honesty, and available usage without claiming unmeasured
  savings.
status: proposed
features:
  - metrics
tokens: []
provenance: User request 2026-09-24; Aftershock context follow-up and Deep
  Context self-project discussion
related:
  - BACKLOG-62EF8C0D-EB9F-4F85-8B3C-1702D3D94ECD
  - BACKLOG-CFEA23AF-A275-407B-88DE-B497D984D2B7
  - BACKLOG-D1EBBDBD-A494-4764-804B-D4F81718393D
conflicts: []
status_history: []
order: 5
tasks:
  - 5bad7d86-12d5-4191-8acb-752e8277a768
---

# Evaluate context recovery across chats and runtimes

Repeat evidence-scored fresh Codex and Claude tests, including bound-task handoff and compaction recovery; measure factual accuracy, authority choice, selected reads, trace honesty, and available usage without claiming unmeasured savings.

## Baseline

The Aftershock `Hello, world!` Codex task answered five read-only questions and scored 8/10 against an evaluator-held key. Selection and read-trace quality were partial. It did not test Claude, bound task ownership, compaction recovery, repeatability, or measured token savings.

DC-13 has its own fresh-desktop acceptance gate for task-first recovery. This proposal supplies a reusable, scored evaluation across projects and runtimes; DC-13 results can be evidence for it, not a substitute for the broader comparison.

## Proposed work

- Reuse a fixed question set and independent answer key across fresh Codex and Claude chats. Add separate bound-task handoff and post-compaction cases.
- Score factual recovery, authority/supersession, bounded document selection, claimed versus visible reads, and verification honesty. State when traces or usage counters are unavailable.
- Use local metrics and a matched baseline only when the measurement method is available and comparable; do not infer savings from document byte counts alone.

## Done when

- Results can be reproduced from saved prompts, answer keys, source revisions, visible traces, and explicit limitations, with implementation of the application kept outside the evaluation.

Status: proposed. Capturing this item does not authorize implementation.
