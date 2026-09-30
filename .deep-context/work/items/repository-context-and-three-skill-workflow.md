---
id: BACKLOG-A5FE803F-4751-424F-AC18-95E63B15A02D
title: Repository context and three-skill workflow
pitch: Keep durable project knowledge beside its source repository while making task memory local
  and the user workflow as simple as deep-init, deep-task, and deep-close.
status: done
features:
  - bootstrap
  - routing
  - tasks
  - closure
tokens: []
provenance: User-approved DC-09 plan and plugin-scope clarification in current Codex task
related: []
conflicts: []
status_history:
  - from: proposed
    to: active
    activation: ACTIVE-D7B8011F-C16B-4578-B315-4CD38E5982B7
aliases:
  - ACTIVE-D7B8011F-C16B-4578-B315-4CD38E5982B7
  - DC-09
tasks:
  - DC-09
prior_active_status: active
milestone: DC-09
verification:
  automated_tests: 50
  plugin_version: 0.1.0+codex.20260923174315
  decision: DEC-DC-002
  requirements:
    - REQ-DC-032
    - REQ-DC-033
    - REQ-DC-034
    - REQ-DC-035
    - REQ-DC-036
    - REQ-DC-037
    - REQ-DC-038
  evidence: docs/reports/dc-09-implementation.md
prior_ledger_state: awaiting-desktop-verification
verification_scope: Historical implementation evidence; does not validate the compact-layout
  migration or new CLI compatibility.
---

# Repository context and three-skill workflow

Keep durable project knowledge beside its source repository while making task memory local and the user workflow as simple as deep-init, deep-task, and deep-close.

## Planning notes

- Unclassified. Capturing this proposal does not authorize implementation.

## Prior milestone evidence (historical)

Scheduling prose here describes the prior checkpoint; current order and lifecycle come from this item’s frontmatter.

- Accepted design: DEC-DC-002 and REQ-DC-032 through REQ-DC-038. DEC-DC-001, REQ-DC-007, and REQ-DC-031 remain traceable as superseded records.
- Source: `/Users/drewmiller/Developer/deep-context`. Project context: `/Users/drewmiller/Developer/deep-context/.deep-context`. Aftershock context: `/Users/drewmiller/Developer/Aftershock - Sample Browser/.deep-context`.
- Migration: both external homes were copied and validated, then replaced with redirects. Recoverable backups are `/Users/drewmiller/Developer/Deep Context/deep-context.backup-2026-09-23T17-18-03-641Z` and `/Users/drewmiller/Developer/Deep Context/aftershock.backup-2026-09-23T17-14-40-028Z`. No live task or worktree was moved. Aftershock's own ledger and source-worktree prohibition remain authoritative.
- Implemented source: in-repository storage, shared primary-worktree resolution, trackable durable docs with local task/machine state, Backlog and Active indexes and conflict-checked activation, local raw closure archive, three plugin-scoped skills, and a Git-repository plugin marketplace catalog. Legacy CLI operations remain available.
- Accepted local gates: 50 unique tests in 10 files, typecheck/build, official plugin validator, all three skill validators, Git ignore checks, installed-cache CLI smoke, and both migrated-project validations after a final provenance refresh. Plugin version `0.1.0+codex.20260923174315` is installed from the user-scoped personal marketplace. Evidence and limits: `docs/reports/dc-09-implementation.md`.
- Open gates: fresh desktop discovery of the three updated skills and cross-chat task recovery/closure, plus Git-backed marketplace pickup after a separately authorized commit and push. No commit, push, or remote marketplace upgrade has been authorized.
- Exact next safe action: start a fresh desktop task in the Deep Context project, verify deep-init/deep-task/deep-close pickup and read-only task recovery, then record actual IDs and results before marking desktop acceptance. Do not infer remote Git-marketplace pickup from the local install.
