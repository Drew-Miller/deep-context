---
id: REPORT-COMPACT-LAYOUT-MIGRATION
title: Manual compact-layout migration
status: completed
features: [bootstrap, routing, tasks, closure]
source: docs/context-layout.md
---

# Manual compact-layout migration

The user authorized the physical self-project migration and required that plugin code remain unchanged. The accepted target is [the layout contract](../context-layout.md). The prior restructure item is now [the product adaptation work item](../../work/items/adopt-compact-context-layout.md), ordered first; DC-16 and DC-13 follow it. The overlapping authority/refresh item is a merged tombstone pointing to that item.

## Result

- Canonical knowledge moved from `doc/` to `docs/`. Feature files are `overview.md` and `contracts.md`; substantial reports remain in `docs/reports/`. Generated selection indexes live with their collections.
- Backlog and Active identities now resolve to one work record in `work/items/`; legacy Active IDs and milestone IDs survive as frontmatter aliases. The 38 records also absorb milestones formerly found only in the live ledger. `work/INDEX.md` is a generated ordered view, not an independently authored schedule. Accepted implementation states and separate verification gaps were carried from the prior ledger; planned work is not presented as current execution.
- Source provenance moved to 172 descriptive files in `sources/records/`. Authored dispositions, reasons, hashes, target links and review history remain tracked. Old forwarding files are represented by the migration map and archive rather than live duplicate files.
- Four task directories now have descriptive names. Chat IDs, task UUIDs, owner bindings, source bindings, lifecycle state and state revisions are preserved. Active DC-12/DC-13 plans moved into their task folders. Historical plans, intermediate reports, templates and immutable hash snapshots remain in the original archive.
- The `repo` symlink, `START_HERE.md`, old `doc/` tree and `docs/plan/` home were removed from the live tree. Root and context agent instructions use the new entry route. The repository-root `AGENTS.md` was the only changed file outside `.deep-context`.

## Local-state review

The review inspected local directory roles and journal status metadata. It archived 53 committed operation journals and five one-off DC-15 scratch scripts/checkpoint files, and relocated publication backups into the migration archive. It retained resolver/chat state, locks, raw audit inventories, validation/benchmark output and existing closure archives. Raw private evaluation payloads were not semantically reviewed, and no claim is made that all local-only knowledge has been promoted.

The pre-migration snapshot preserves 1,043 original entries, including original bytes for historical manifests and journals. Staging and replacement copies created during the migration were removed after verifying that the original snapshot and migrated tree retain their contents. The snapshot is deliberate recovery evidence, not another live knowledge route.

## Verification and limits

The manual verifier checks Markdown targets, YAML frontmatter, canonical IDs and aliases, queue uniqueness, original-snapshot hashes, unchanged non-context source files, removal of retired roots, and preservation of all four task owners and revisions. It passed with 333 live files, 307 frontmatter records and 298 distinct IDs/aliases; the six generated indexes also passed their freshness check, and `git diff --check` passed. Final link counts, results and per-file hashes are recorded locally under `.local/archives/compact-layout-2026-09-25/`. The readable path map is `path-map.json`; original files are in `original/`. Historical snapshots must be verified against the original tree, not the migrated files.

No plugin, CLI, skill, template, application source, package or installation was changed. The root entry instructions explicitly prevent legacy context-writing commands against this tree. Existing CLI validation and task/closure mutation are not compatible with this manual layout; passing manual checks is not product or installed-desktop acceptance. The product adaptation item must implement and test those capabilities before they are used here. No task ownership was acquired, released or closed by moving its files. Prior closure fingerprints remain historical.

This report supersedes the previous in-place cleanup report for the current physical layout. Earlier reports remain dated evidence, including their old acceptance and ownership limitations.
