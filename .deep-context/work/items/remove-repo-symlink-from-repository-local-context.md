---
id: BACKLOG-24772EE1-9D3C-42A0-98FF-6EF28F981242
title: Remove repo symlink from repository-local context
pitch: Resolve source paths from the containing repository instead of a
  .deep-context/repo symlink; update CLI, templates, routing docs, source
  inventory, and worktree compatibility before removing the link.
status: blocked
features:
  - bootstrap
tokens: []
provenance: "User clarification 2026-09-24: repository-local context does not
  need a repo symlink"
related:
  - BACKLOG-A464417C-F116-4217-94D2-F1650510B429
conflicts: []
status_history:
  - from: proposed
    to: active
  - from: active
    to: blocked
objective: Harden legacy compact-layout migration so project-specific documents
  and source routes remain valid when the repo symlink is removed; preserve
  Aftershock until its source startup files are updated.
---

# Remove repo symlink from repository-local context

Resolve source paths from the containing repository instead of a .deep-context/repo symlink; update CLI, templates, routing docs, source inventory, and worktree compatibility before removing the link.

## Proposed work

- Resolve source paths from the containing repository in repository-local projects. The current `.deep-context/repo` link points back to this same checkout.
- Find every use of `repo/` in the CLI, templates, generated source records, project and task entry files, and imported context links. Define a compatible rule for Git worktrees and previously migrated external context homes.
- Remove the symlink only after references and readers use the new rule. Do not silently reinterpret an existing external attachment.

## Done when

- Repository-local projects initialize, resolve source files, create or resume tasks, validate, and close without `.deep-context/repo`.
- Existing project identity, worktree recovery, source ownership rules, and historical provenance remain intact; affected tests and a fresh-session route check pass.

## Migration follow-up, 2026-09-30

The [implementation report](../../docs/reports/legacy-migration-route-hardening-2026-09-30.md) records the product fix and 95 passing tests. The read-only Aftershock preview now maps its top-level product and conversion documents correctly, and it blocks application because source `AGENTS.md` and `START_HERE.md` still point at retired context paths. Aftershock was not changed. Its owner must update those startup files before a new preview or migration apply; the application schedule and source-worktree rules remain authoritative.
