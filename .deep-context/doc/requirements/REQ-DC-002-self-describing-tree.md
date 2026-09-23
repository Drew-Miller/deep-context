---
id: REQ-DC-002
title: Self-describing context tree
status: active
feature: bootstrap
origin: confirmed
source: doc/reports/HANDOFF-COVERAGE.md#architectural-invariants
code_patterns:
  - src/projects/**
---

# Self-describing context tree

A fresh agent entering a project or task must discover the read route, authority, context levels, and durable/transient boundaries from nearby files.
