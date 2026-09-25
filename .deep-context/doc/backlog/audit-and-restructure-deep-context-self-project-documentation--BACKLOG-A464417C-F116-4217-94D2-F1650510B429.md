---
id: BACKLOG-A464417C-F116-4217-94D2-F1650510B429
title: Audit and restructure Deep Context self-project documentation
pitch: Clarify the distinct roles of .deep-context/doc and
  .deep-context/docs/plan, inventory duplicate or stale guidance and incoming
  links, then adopt a coherent taxonomy while preserving the live ledger,
  evidence, and closure safeguards.
status: proposed
features:
  - bootstrap
tokens: []
provenance: User request 2026-09-24; Aftershock context follow-up and Deep
  Context self-project discussion
related:
  - BACKLOG-24772EE1-9D3C-42A0-98FF-6EF28F981242
conflicts: []
status_history: []
---

# Audit and restructure Deep Context self-project documentation

Clarify the distinct roles of .deep-context/doc and .deep-context/docs/plan, inventory duplicate or stale guidance and incoming links, then adopt a coherent taxonomy while preserving the live ledger, evidence, and closure safeguards.

## Current structure

`.deep-context/doc/` is the plugin's canonical project-knowledge schema. `.deep-context/docs/plan/` is this repository's additional coordinator planning home with the live `STATUS.json` and `TASKS.md`, plans, packets, reports, and checkpoints. New projects create `doc/`; they do not automatically create `docs/plan/`. A simple folder merge would therefore change product and self-project responsibilities.

Current drift includes a `PLAN.md` pointing to DC-08 while later plans exist, a context-map planning route focused on DC-09, duplicated or forwarding planning guidance, and a `TASKS.md` header revision behind `STATUS.json`. Historical plans and reports have inbound references, and closure evidence hashes include the live ledger files.

## Proposed work

- Build a file-by-file authority and incoming-reference inventory; define explicit homes for canonical knowledge, live work, plans, generated views, and historical evidence.
- Remove stale guidance from startup routes, clarify naming, and move or retire files only after updating links, source inventory, tests, and any closure-path logic affected by the chosen layout.
- Coordinate the separate repository-local `repo` symlink removal item as part of the overall path design.

## Done when

- There is one discoverable live schedule and no competing current instruction; historical evidence and uncommitted work are preserved; indexes, links, closure safeguards, and fresh-session recovery pass.

Status: proposed. Capturing this item does not authorize implementation.
