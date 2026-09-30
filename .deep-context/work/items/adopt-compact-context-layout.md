---
id: BACKLOG-A464417C-F116-4217-94D2-F1650510B429
title: Adopt compact context layout in plugin, CLI and skills
pitch: Implement the accepted compact storage layout across CLI, templates,
  skills, audit, indexing and recovery; use the manual self-project migration as
  a compatibility fixture.
status: done
features:
  - bootstrap
  - routing
  - tasks
  - closure
tokens: []
provenance: User request 2026-09-24; Aftershock context follow-up, Deep Context
  self-project discussion, and DC-15 self-project audit findings
related:
  - BACKLOG-DC-15
  - BACKLOG-24772EE1-9D3C-42A0-98FF-6EF28F981242
  - BACKLOG-8ACB4B31-7C35-41B7-A654-278DC72E796C
  - BACKLOG-10F58B56-1C7C-4C7F-9CBD-EE7494DDC6DD
conflicts: []
status_history:
  - from: proposed
    to: active
    activation: ACTIVE-75908F38-6D45-47BE-B92F-3A3AD29606B0
  - from: active
    to: planned
    reason: User re-scoped this item to product adoption after a separately
      authorized manual folder migration.
  - from: planned
    to: active
    reason: Product implementation explicitly delegated to this chat; separate task
      identity established.
  - from: active
    to: done
prior_task: b0fed9c1-3c99-4e93-9dd1-3f700f314d75
aliases:
  - ACTIVE-75908F38-6D45-47BE-B92F-3A3AD29606B0
prior_tasks:
  - b0fed9c1-3c99-4e93-9dd1-3f700f314d75
prior_active_status: active
tasks:
  - 7b93a582-ef1d-419a-9f73-ec55f135ccaf
outcome: Local compact layout implementation and DC-16 lifecycle verified by 94
  tests, build, copied-package smoke, self-project validation and task recovery;
  see REPORT-COMPACT-LAYOUT-PRODUCT-ADOPTION.
open_gates:
  - Installed desktop discovery and fresh-chat recovery/closure not run
---

# Adopt compact context layout in plugin, CLI and skills

Implement the accepted [compact layout contract](../../docs/context-layout.md) throughout the product. The user requested a manual self-project migration first and explicitly excluded plugin code changes from that migration. This work item owns the subsequent product adaptation.

## Acceptance criteria

1. Initialization, imports, task lookup/save/closure, migrations, filename repair, work ordering, indexing, validation, stats, and packaged templates support `docs/`, `work/items/`, `sources/`, `tasks/`, and `.local/`. The retired `doc/`, `docs/plan/`, `START_HERE.md`, and `repo` symlink must not be recreated in repository-local contexts.
2. Deep Init, Deep Task, Deep Close, Deep Audit and Deep Stats skills and resources route to the new structure; root/context instructions resolve a single entry. Deep Audit checks frontmatter, duplicated authority, stale work, local-only knowledge and structural drift, proposing moves/promotions/archives before deletion.
3. One work record replaces paired Backlog/Active records; DC-16 supplies the lifecycle implementation contract. IDs/legacy aliases, ordered queue, outcomes, open gates and task bindings survive migration. Human-facing filenames remain descriptive with documented collision handling.
4. Plans/handoffs/checkpoints belong with execution memory. Closure promotes lasting requirements/decisions and concise outcomes; only substantial durable reports remain in docs/reports. Source classifications and .local recovery evidence are preserved, reviewed and explicitly classified.
5. Legacy and manually migrated contexts are detected safely. Migration is recoverable and idempotent; source/worktree identity, unchanged historical manifests, lock/revision/owner checks, and fresh-chat recovery are verified. Index refresh and validation follow agent-authored canonical edits.
6. Tests cover clean initialization, old layout migration, this manually migrated project, fresh task recovery and an installed package. Record local and desktop gates separately. No acceptance based solely on moving this folder.

## Consolidated scope and history

The prior in-place cleanup is historical evidence in docs/reports/self-project-restructure-2026-09-24.md. The overlapping authority/refresh proposal BACKLOG-10F58B56-1C7C-4C7F-9CBD-EE7494DDC6DD is consolidated here; its original text is retained in the migration archive. DC-15 remains completed audit evidence. DC-16 remains linked lifecycle work; repo-symlink compatibility and natural-language capture remain linked work where implementation exceeds this layout contract.

## Outcome

The local plugin, CLI, templates, and skills implement the accepted compact layout and linked DC-16 lifecycle. [Product adoption evidence](../../docs/reports/compact-layout-product-adoption-2026-09-30.md) records 94 passing tests, TypeScript/build and copied-package smoke, plus successful validation and task recovery in this manually migrated self-project. Installed desktop discovery and fresh-chat recovery/closure remain an explicit open gate. The [manual migration](../../docs/reports/compact-layout-migration.md) remains separate historical evidence.
