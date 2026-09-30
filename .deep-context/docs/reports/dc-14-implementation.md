---
id: REPORT-DC-14-IMPLEMENTATION
title: Descriptive filenames and work ordering implementation
status: implementation-accepted-desktop-gate-open
features:
  - bootstrap
  - routing
  - tasks
  - closure
---

Historical report: this describes the layout and verification state at its original date. Old literal paths and commands are retained as evidence, not current instructions. Use [the current layout](../context-layout.md) and the migration path map for navigation. Markdown links have been relocated; the original bytes are in the local migration archive.

# DC-14 local implementation

Coordinator review, 2026-09-24: local implementation and the self-project migration are accepted after the forwarder/metrics follow-up. The source checkpoint, live context validation, zero-move migration preview, and whitespace check passed independently. `REQ-DC-049`, `REQ-DC-050`, and `DEC-DC-006` preserve the product behavior; the implementation Backlog and Active records are done. The live schedule is revision `deep-context-state-16`. Fresh installed-plugin and Codex desktop recovery remain an unrun, separate verification gate.

The bundled plugin creates Backlog, Active, source provenance, and closure reports with a bounded readable slug followed by their stable ID. Canonical lookup uses metadata IDs. Title edits leave paths alone until `rename-record` is invoked. Requirements and decisions have no general authoring command; the explicit filename migration covers existing ID-only records in those collections. Fixed routing files, task state files, task and chat bindings, local archives, and historical closure report paths retain their existing names.

Backlog queue positions are optional positive safe integers in canonical frontmatter. Task queue positions live in `tasks/ORDER.md` by task UUID, outside owned task state. `reorder-backlog` and `reorder-task` compact their active queues without changing IDs or task ownership. Generated Backlog and task views show ordered work separately from historical work. Validation reports invalid or duplicate positions, broken aliases, bad references, stale indexes, and pending filename operations.

`migrate-filenames` previews or applies canonical moves. It retains each old path as a one-hop Markdown forwarder and updates supported structured frontmatter references. `repair-filenames` uses a dedicated preimage journal scoped to requirements, decisions, reports, and sources; Backlog and Active writes continue through their existing scoped journal. Both refuse intervening edits. An approval review rejected widening the existing Backlog/Active journal, and the user specifically approved this dedicated, recoverable migration operation. Historical report files without explicit IDs remain at their existing paths and are reported as exceptions rather than acquiring a different derived identity. Nested closure reports are preserved during migration.

## Self-project migration and identity

- 2026-09-24 PDT, current repository checkout: preview had 172 moves, six structured reference updates, zero conflicts, and zero exceptions. Apply completed 11 Backlog, three Active, and 158 source provenance moves. The old paths now contain exactly 11, three, and 158 forwarding records respectively. A second preview proposed zero moves.
- `deep-context init --repo /Users/drewmiller/Developer/deep-context` refreshed source provenance and generated indexes. Existing source IDs, authored bodies, and prior classifications remain attached to the new canonical paths. Changed tracked sources were marked for review with prior classifications in review history by the existing source-refresh rule.
- `deep-context validate --project /Users/drewmiller/Developer/deep-context/.deep-context` passed after the final refresh. The DC-14 task kept the same UUID, chat binding, owner, external source binding, and state revision 4 through migration and refresh. The final task checkpoint will increment that revision separately. DC-14 and DC-15 Backlog positions remain 1 and 2. The coordinator's manual `TASKS.md` and `STATUS.json` were not edited by this implementation.

## Observed verification gates

All commands below ran 2026-09-24 PDT against Git HEAD `9f6acae1f7403fb412691dabaa6f1adb08f31b78` plus the dirty source checkpoint in `docs/plan/checkpoints/DC-14-2026-09-24.sha256`. The manifest hashes 25 relevant source, test, documentation, skill, and bundle files; `shasum -a 256 -c` passed. Command results are recorded here and in this implementation task's command output.

| Gate | Result | Fixture or environment |
|---|---|---|
| `pnpm build` | Typecheck and self-contained CLI bundle passed | Local checkout |
| `pnpm test` | 83 unique tests across 16 files passed | Temporary local projects and Git repositories |
| `pnpm vitest run --exclude '**/.deep-context/**' tests/metrics.test.ts` | Five focused tests passed, including migrated and malformed forwarder coverage | Temporary local project |
| `tests/dc14-integration.test.ts` through `pnpm test` | Two Backlog items and two tasks were ordered, reversed, rebuilt after deleting generated indexes, then resolved in fresh CLI processes with unchanged task state and binding | Isolated temporary project and fresh Node processes |
| `pnpm check:package` | Package boundary and copied-package smoke passed | Isolated copied plugin |
| Official `validate_plugin.py` | Passed | Local plugin source |
| Official `quick_validate.py` for `deep-init`, `deep-task`, `deep-close`, and `deep-stats` | All passed | Local skill source |
| `deep-context init --repo` followed by `deep-context validate --project` | Source inventory refreshed and structural validation passed | Live self-project, current checkout |
| `deep-context stats --project ... --feature metrics --level feature --json` | 25 Backlog records, 73 corpus files, 87,659 corpus bytes, zero validation errors | Live migrated self-project |
| `migrate-filenames --json` after apply | Zero moves, references, exceptions, and conflicts | Live self-project |
| `git diff --check` | Passed | Dirty checkout |

Focused tests cover same-title and fallback slugs, long titles, explicit title rename, case-folded destination collision, old-path compatibility, migrated source refresh, duplicate and invalid ranks, stale indexes, recovery journal idempotence, and refusal to overwrite intervening edits. New closure report naming is covered by the lifecycle suite.

## Forwarder reader follow-up

The first stats run after migration counted 36 Backlog Markdown files because it included 11 forwarding files. `projectStats` now excludes forwarders from canonical document counts and routable corpus files and bytes. After source refresh, the live stats result is 25 Backlog records, 73 routable corpus files, 87,659 corpus bytes, 6,208 selected bytes for the metrics feature, and zero validation errors. The corpus values did not change on this project because its migrated forwarders were confined to Backlog, Active, and sources. The isolated regression migrates a requirement, decision, report, and Backlog record; canonical counts, corpus bytes, and selected bytes remain stable, while a legacy report without an ID remains counted.

The same regression adds an `id` to a forwarding file to verify that metrics and routing still exclude it, canonical lookup selects the actual record, and validation reports `invalid-forwarder`. Backlog reordering, source reconciliation, indexing, and filename migration already exclude forwarders. Closure evidence intentionally hashes all document bytes, including aliases, so migration invalidates a prior closure review fingerprint until it is reviewed again. Task memory, task ordering, source binding, and operation journals do not count durable document aliases as records. The fresh installed-plugin and desktop gates remain open.

## Remaining gates and scope

The fresh CLI process fixture proves disk persistence and recovery in a new Node process. A fresh Codex desktop task with an installed updated plugin has not been tested. No plugin installation, commit, push, publication, live task-folder move, or DC-13/DC-15 implementation was performed. Earlier closure reviews would need a fresh fingerprint after the canonical document migration; historical review evidence was retained. The coordinator owns schedule acceptance and the live ledger update.
