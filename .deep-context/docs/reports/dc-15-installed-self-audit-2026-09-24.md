---
id: REPORT-DC-15-INSTALLED-SELF-AUDIT
title: Installed Deep Audit self-project follow-up
status: accepted-local
features:
  - bootstrap
  - routing
  - tasks
  - closure
source: docs/reports/dc-15-deep-audit-2026-09-24.md
---

Historical report: this describes the layout and verification state at its original date. Old literal paths and commands are retained as evidence, not current instructions. Use [the current layout](../context-layout.md) and the migration path map for navigation. Markdown links have been relocated; the original bytes are in the local migration archive.

# Installed Deep Audit self-project follow-up, 2026-09-24

## Scope and coverage

The personal local-marketplace source now resolves to this repository's `plugins/deep-context/`. The installed copy is version `0.1.0+codex.20260925030651`. Its bundled `deep-audit` guidance and helper were invoked explicitly from the installed cache in the existing chat. This verifies installed package contents and execution, not fresh-chat skill discovery. The repository marketplace remains available for Git-backed distribution; no push or publication occurred.

The installed helper inventoried `.deep-context/` without following symlinks: 1,103 entries, comprising 1,024 files, 78 directories, and one symlink, with zero traversal errors. Ignored local evidence is `.local/audits/installed-deep-audit-2026-09-24/inventory.json` and its file-level `coverage.json` (SHA-256 `1a2de96142132e7996179fb16ec3359231bdabcc1ec70a388a6947754c4eae51`). Coverage carries forward the reviewed authority classifications from the [full DC-15 audit](dc-15-deep-audit-2026-09-24.md), labels those review depths as historical, and classifies 21 new paths at metadata depth. Nine prior active-task paths moved to the DC-15 local archive. Raw archive, journal, and other local payloads were not read. This is an incremental installed-copy audit, not a second full-body review of every record.

Source HEAD is `1340687673e748db75fd6c52da96cdada1b36dbf` with uncommitted development changes. The sole live schedule is `docs/plan/TASKS.md` with `STATUS.json`; DC-16 is now next. The canonical context tree remains the plugin's `doc/` schema plus this project's declared `docs/plan/` extension.

## Findings and proposed destinations

| Finding | Current evidence | Preferred update or move |
|---|---|---|
| Stale planning route | `docs/plan/PLAN.md` still labels DC-08 next while the live ledger schedules DC-16. | Preserve the historical plan, label its next-action prose historical, and route current work only through the live ledger under the existing authority cleanup proposal. |
| Duplicated work lifecycle | The generated `doc/ACTIVE.md` includes done records, while older Backlog and Active pairs repeat objectives. | DC-16 should migrate to one canonical work item with generated queue, current, and history views. Preserve IDs, task links, accepted evidence, and compatibility references. |
| Repository-local `repo` link | The symlink remains a required source path for current templates and records. | Migrate source resolution and references under the existing symlink proposal before removing the link. |
| Incomplete executable-source provenance | The full DC-15 audit showed `.mjs` and `.cjs` treated as unsupported source text; this follow-up did not change the importer. | Extend text provenance for those scripts, retaining exclusions for generated bundles, then refresh and validate. |
| Ambiguous planning and report homes | `doc/` is canonical product knowledge; `docs/plan/` is the self-project coordinator extension. Unique V1 exclusions and coordinator rules remain in planning files. | Promote unique authority, distinguish durable conclusions from intermediate evidence, and move or archive only after inbound references and closure fingerprints are checked. |

The installed audit skill now asks for a destination or concrete update for each cleanup finding. It recommends deletion only with evidence that content is redundant or obsolete, checked inbound references and provenance, and a recoverable path. No files were removed by this audit.

## Checks and limits

| Check | Result | Limit |
|---|---|---|
| Installed cache manifest and updated skill/template content | Version and guidance matched the repository update | Existing chat, so skill auto-discovery was not tested |
| Installed inventory helper | 1,103 entries; zero traversal errors | Metadata traversal; prior full audit supplies selected semantic review |
| Installed CLI validation before provenance refresh | Four expected stale source hashes: README, manifest, skill, report template | Diagnosed before refresh; not a structural pass |
| Installed CLI `init --repo`, then validation | Source provenance refreshed; project valid | Does not resolve semantic findings above |
| Markdown link scan | 178 links in 500 trackable documents: 175 internal, three external, zero broken or escaping | Markdown links only; not every frontmatter pointer |
| Plugin and skill validators; copied-package smoke; `git diff --check` | Passed | No new full test suite or desktop fresh-chat test in this follow-up |

The full DC-15 audit and its 85-test acceptance remain the broader baseline. The next product work is DC-16. Fresh Codex desktop discovery of this installed `deep-audit` skill remains a separate unrun gate.
