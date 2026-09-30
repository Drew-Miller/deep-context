---
id: BACKLOG-496F90D3-02E2-440A-AD04-8C43A6D481A0
title: Classify executable Node scripts in source provenance
pitch: Treat .mjs and .cjs source scripts as text when safe so the launcher,
  package checker, and audit helper receive hash-backed provenance instead of
  unsupported-file exclusions; preserve generated bundle exclusions.
status: proposed
features:
  - bootstrap
tokens: []
provenance: "DC-15 self-project audit, 2026-09-24: src/importing/index.ts
  textExtensions omits .mjs and .cjs; current source records exclude executable
  Node scripts."
related:
  - BACKLOG-DC-15
  - SHELF-0006
conflicts: []
status_history: []
order: 10
---

# Classify executable Node scripts in source provenance

Treat .mjs and .cjs source scripts as text when safe so the launcher, package checker, and audit helper receive hash-backed provenance instead of unsupported-file exclusions; preserve generated bundle exclusions.

## Planning notes

- Unclassified. Capturing this proposal does not authorize implementation.
