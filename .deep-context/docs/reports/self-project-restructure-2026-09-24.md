---
id: REPORT-SELF-PROJECT-RESTRUCTURE-2026-09-24
title: Self-project documentation authority and route cleanup
status: review-required
features:
  - bootstrap
  - routing
  - tasks
  - closure
source: .local/archives/compact-layout-2026-09-25/original/docs/plan/SELF-PROJECT-RESTRUCTURE-PLAN.md
---

Historical report: this describes the layout and verification state at its original date. Old literal paths and commands are retained as evidence, not current instructions. Use [the current layout](../context-layout.md) and the migration path map for navigation. Markdown links have been relocated; the original bytes are in the local migration archive.

# Self-project documentation restructure, 2026-09-24

## Decision and scope

The user selected `BACKLOG-A464417C-F116-4217-94D2-F1650510B429` for this chat. Deep Task `b0fed9c1-3c99-4e93-9dd1-3f700f314d75` owns the bounded pass on the existing checkout. Two read-only Terra discovery packets and one read-only Astra planning pass supported an in-place cleanup. `doc/` remains the canonical product knowledge and durable conclusion home; `docs/plan/` remains this repository's coordinator planning, live schedule, intermediate evidence, and checkpoint extension. New initialized projects are not required to have `docs/plan/`.

No file move, archive, alias retirement, report-folder merge, or `repo` symlink removal was warranted. Inbound citations to `docs/plan/PLAN.md`, `REQUIREMENTS.md`, and `CONTRACTS.md` remain valid. Historical SHA manifests, closure reports, local raw archives, and DC-14 forwarding aliases were retained. The original V1 exclusions were promoted from the overlapping requirements summary into an explicitly historical architecture baseline; current requirements and later DC-11 measured usage retain authority.

## Paths changed in this pass

| Path under `.deep-context/` | Result |
| --- | --- |
| `AGENTS.md`, `CONTEXT_MAP.md`, `START_HERE.md` | One conditional source-root read route, full coordinator extension and report-lane taxonomy, and direct live-ledger routing |
| `docs/plan/PLAN.md`, `REQUIREMENTS.md`, `CONTRACTS.md` | Historical plan and requirements pointers; unique V1 baseline promoted; coordinator-only rules retained |
| `doc/ARCHITECTURE.md`, `doc/requirements/REQ-DC-023-respect-source-harness.md` | Historical baseline and current `deep-task` skill source hint |
| `doc/backlog/audit-and-restructure-deep-context-self-project-documentation--BACKLOG-A464417C-F116-4217-94D2-F1650510B429.md`, `doc/active/audit-and-restructure-deep-context-self-project-documentation--ACTIVE-75908F38-6D45-47BE-B92F-3A3AD29606B0.md` | Selected work activated and linked to this task under the existing product schema; bounded scope and deferred product work recorded |
| `docs/plan/SELF-PROJECT-RESTRUCTURE-PLAN.md`, `docs/plan/TASKS.md`, `docs/plan/STATUS.json` | Reference inventory, accepted no-move plan, user-selected schedule exception, and matching live revision; DC-16 then DC-13 retained |
| `doc/BACKLOG.md`, `doc/ACTIVE.md`, `doc/REPORTS.md` | Generated routing views refreshed from canonical frontmatter |
| `doc/reports/SELF-PROJECT-RESTRUCTURE-2026-09-24.md`, `docs/plan/checkpoints/SELF-PROJECT-RESTRUCTURE-2026-09-24.sha256` | This durable conclusion and focused final-context hash evidence |

The working tree already had 81 dirty source entries when this task was bound. This pass did not edit application source, plugin files, another task's memory, or the pre-existing DC-15 report and closure evidence.

## Work-state reconciliation still requiring owner review

The live ledger distinguishes implementation outcomes from open gates, and the context map warns that generated `doc/ACTIVE.md` includes completed history. Canonical state drift remains:

| Work | Current canonical view | Accepted evidence and pending distinction |
| --- | --- | --- |
| DC-09 | Backlog and Active both `active` | Local repository-context implementation accepted in `doc/reports/DC-09-IMPLEMENTATION.md`; fresh desktop lifecycle gate remains open |
| DC-11 | Backlog and Active both `active` | Local Deep Stats implementation accepted in `doc/reports/DC-11-METRICS.md`; desktop usage and controlled benchmarks remain open |
| DC-13 | Active `active` | Accepted plan is queued after DC-16; source implementation has not started; its task is owned by another chat |
| DC-14 | Backlog and Active `done`, still listed in generated Active registry | Implementation done; installed desktop ordering/recovery gate remains open; generated current/history split belongs to DC-16 |
| DC-15 | Backlog and Active `done`; Active body says desktop discovery unrun | A later fresh task passed bounded installed skill discovery and structural validation per live ledger; full semantic repeat and task recovery were not tested |

Automatic approval review rejected a proposed patch to the DC-09, DC-11, DC-13, DC-14, and DC-15 canonical records because they belong to other chats and the patch exceeded this task's ownership scope. No part of that patch was applied. An earlier one-line DC-15 body update was reverted to its original text. Owner review or explicit cross-task authorization is required before correcting those records. This unresolved gate prevents claiming the selected item's full work-state acceptance criterion.

## Verification and limits

Source checkpoint: Git HEAD `1340687673e748db75fd6c52da96cdada1b36dbf` plus focused `docs/plan/checkpoints/SELF-PROJECT-RESTRUCTURE-2026-09-24.sha256` for the dirty context files. The hash manifest is evidence for the final document snapshot, not a replacement for historical DC-13, DC-14, or DC-15 manifests.

| Date | Command or check | Result | Fixture/environment class and evidence |
| --- | --- | --- | --- |
| 2026-09-24 | `node plugins/deep-context/bin/deep-context.cjs rebuild-indexes --project .deep-context` | Passed; generated views rebuilt | Live self-project; generated views listed above |
| 2026-09-24 | `node plugins/deep-context/bin/deep-context.cjs validate --project .deep-context` | Passed; valid project after rebuild | Live dirty self-project; validator checks frontmatter, structured references, provenance, and index bytes |
| 2026-09-24 | `pnpm exec vitest run tests/routing.test.ts tests/validation.test.ts tests/memory-closure.test.ts --exclude '**/.deep-context/**'` | Passed: 13 tests in three files | Local temporary fixtures; routing, validation, and closure evidence |
| 2026-09-24 | Read-only Markdown link scan of 502 project Markdown files excluding local task, archive, and symlink trees | Passed: 176 internal links, three external links, zero broken targets | Live self-project; regex scan does not validate every raw/backtick path or anchor |
| 2026-09-24 | `git diff --check` | Passed after the route and report edits | Dirty checkout; whitespace only |
| 2026-09-24 | Independent read-only chat route and bundled CLI `resolve-task --allow-unbound --json` | Passed twice: unbound with no owner rights; final matching ledger revision 26, selected item in review-required state, and unchanged DC-16 → DC-13 queue found | Separate chat and fresh CLI process; not a new installed desktop skill-discovery or cross-chat takeover test |
| 2026-09-24 | `shasum -a 256 -c .deep-context/docs/plan/checkpoints/SELF-PROJECT-RESTRUCTURE-2026-09-24.sha256` | Passed: all 17 focused document and generated-view hashes matched | Live dirty self-project; this report and matching ledger revision 26 are included |
| 2026-09-24 | Python comparison of `TASKS.md` and `STATUS.json` revision and priority queue | Passed: revision 26 and DC-16 → DC-13 in both | Live self-project; read-only check |

The first link-scan attempt could not create a shell here-document temporary file under the read-only sandbox; the no-temp Python invocation completed successfully. An initial ledger-revision check had a shell quoting error and did not run; its corrected Python check passed. The independent route check found a stale DC-13 scheduling sentence in `TASKS.md`; it was corrected before final validation. No pending closure-review file was found in open task folders, but completed closure reports and historical fingerprints were left untouched. Source code and packaged runtime were unchanged, so a build or package smoke was not used as proof of these document-only changes.

Product-wide lifecycle schema, paired status validation, current/history projections, automatic editor refresh, natural-language classification, and forwarder retirement remain under `BACKLOG-8ACB4B31-7C35-41B7-A654-278DC72E796C` and `BACKLOG-10F58B56-1C7C-4C7F-9CBD-EE7494DDC6DD`. Repository symlink migration remains under `BACKLOG-24772EE1-9D3C-42A0-98FF-6EF28F981242`.
