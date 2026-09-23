---
name: closure
description: Diff-driven Project Context review, drift detection, durable promotion, and guarded cleanup.
status: active
owns:
  - src/closure/**
tokens:
  - close
  - drift
  - promote
  - finalize
contracts:
  - doc/features/closure/CONTRACTS.md
depends_on:
  routing: contract
  tasks: feature
origin: confirmed
---

# Closure

Combines drift detection, documentation reconciliation, merge-readiness evidence, and cleanup into one evidence-directed broad-context gate.
