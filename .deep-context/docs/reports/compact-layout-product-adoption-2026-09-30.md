---
id: REPORT-COMPACT-LAYOUT-PRODUCT-ADOPTION
title: Compact layout product adoption
status: completed
features: [bootstrap, routing, tasks, closure]
source: work/items/adopt-compact-context-layout.md
---

# Compact layout product adoption

The local plugin, CLI, templates, and skills now use the accepted compact layout. New projects initialize `docs/`, `work/items/`, and `sources/records/`. Legacy projects retain their old route until an explicit, previewable, recoverable migration. The migration archives original bytes and path mappings, preserves authored provenance and task identity, merges linked Backlog and Active records into one work item, and removes retired live roots and forwarding files.

Work items now have proposed, planned, active, blocked, done, and merged states. Ordered proposals and plans, explicit outcomes, open verification gates, legacy aliases, and reciprocal task UUID links use one canonical record per objective. The bundled CLI supports capture, activation, ordering, status changes, task binding, index rebuild, validation, and read-only task recovery. Deep Init, Deep Task, Deep Close, Deep Audit, and Deep Stats instructions route through the compact structure.

## Verification

The source checkpoint is base commit `1340687673e748db75fd6c52da96cdada1b36dbf` plus the 81-file SHA-256 manifest in the active task's `reports/PRODUCT-CHECKPOINT.sha256` (manifest SHA-256 `46d90806ebe1718f666c55558ab63f8a53a04cfe4756763d94bb66d450d3f0ed`). On 2026-09-30 in the local macOS primary checkout, `pnpm test` passed 94 tests in 19 files, `pnpm build` passed TypeScript checking and bundling, `pnpm check:package` passed the copied-package smoke check, and `git diff --check` passed. The task report records commands, fixture classes, and limits.

The rebuilt bundled CLI refreshed this manually migrated project's source inventory and indexes, then `validate --project .deep-context` passed with one warning for historical milestone label `DC-09`, which is not a live task UUID. Validation checked the retained original migration snapshot hashes. A fresh CLI process resolved this chat to the existing task UUID and owner binding at revision 1 before the final checkpoint. No other task owner was changed.

## Open gate

Installed desktop discovery and fresh-chat recovery/closure have not been run. The copied-package smoke verifies the packaged files in isolation; it does not establish desktop pickup. No plugin installation, commit, push, or publication occurred.
