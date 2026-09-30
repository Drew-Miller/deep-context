---
id: WORK-BE622AC4-3D41-4E59-B03D-F753F859B086
title: Bootstrap compact Deep Context in Aftershock
status: planned
pitch: Apply the updated plugin to Aftershock, preserve its live schedule and
  existing evidence, then prove fresh-chat context recovery against an
  independent answer key.
provenance: User request 2026-09-30
features:
  - bootstrap
  - routing
tokens: []
related:
  - BACKLOG-A464417C-F116-4217-94D2-F1650510B429
  - BACKLOG-8361BE16-1B83-4A19-801A-B41F5FF02F69
  - BACKLOG-D1DE2B15-BF79-4171-9A05-990B1C052AA8
  - BACKLOG-B67B98B1-4C75-4891-95C6-571B904E4E1E
  - BACKLOG-CFEA23AF-A275-407B-88DE-B497D984D2B7
  - BACKLOG-130A256F-0F6D-4251-A4CB-3C03511B0687
conflicts: []
aliases: []
tasks:
  - 5bad7d86-12d5-4191-8acb-752e8277a768
requirements: []
decisions: []
open_gates: []
status_history:
  - from: proposed
    to: planned
order: 4
---

# Bootstrap compact Deep Context in Aftershock

Apply the updated plugin to Aftershock, preserve its live schedule and existing evidence, then prove fresh-chat context recovery against an independent answer key.

## Scope and sequence

This is the integration milestone, not a replacement for the linked product work items. The compact layout implementation is locally done, with installed desktop discovery still open. The present repo-bundled CLI and plugin are the candidate to test; successful self-project validation does not establish Aftershock compatibility or context retention. The goal is to improve the product where the Aftershock trial exposes gaps, convert Aftershock, and then test fresh-chat recovery.

1. **Product readiness.** Review the plugin's actual schema, generated artifacts, folder structure, source/repository ordering, and work-item ordering against the accepted layout contract and representative clean, legacy, and Aftershock fixtures. Record a concrete mismatch list and update the product before migration; local completion of the compact-layout item is not proof that this output meets the user's intended behavior. Finish deterministic Codex/Claude project entry and a compact current-work projection. Keep the latter derived from Aftershock's sole live application schedule, `docs/plan/STATUS.json.task_state`, with `TASKS.md` generated from it. Do not create a second editable schedule. Use the compact-layout product item and DC-13 task recovery as relevant contracts, without reopening or silently absorbing their independent scope.
2. **Read-only Aftershock baseline.** Inventory the current `.deep-context/` layout, all existing documentation and source-provenance records, task IDs/bindings, links, root entry instructions, application schedule, and working-tree changes. Classify every document as current authority, historical evidence, forwarding entry, or review required. Prepare a withheld answer key for application identity, current work and human gates, saved-search behavior, and expected document selection. Record hashes or equivalent evidence for material content and unchanged app source.
3. **Conversion.** Run the repo-bundled plugin against Aftershock in place, using the accepted compact layout. Reconcile accepted requirements, decisions, architecture, features, sources, and work items without losing unique context. Preserve Aftershock's source ownership restrictions, existing dirty changes, task ordering, historical evidence, and the external live schedule. Repair root and nested entry instructions to use one runtime path and authority route. Keep migration recoverable; do not delete legacy evidence to obtain a tidy tree.
4. **Structural gate.** Rebuild indexes and validate frontmatter, generated views, IDs and aliases, work order, task bindings, links, provenance, authority and schedule consistency. Run the relevant context/documentation tests and check the baseline diff. Product defects found here return to the responsible product item before claiming this gate.
5. **Fresh-chat gate.** Use new read-only Aftershock chats and a fixed question set. Compare answers and observable reads with the withheld key: factual recovery, chosen authority, unnecessary or missing reads, trace honesty, and verification limits. Record available runtime and source revisions. Test Codex first; Claude, bound-task recovery, compaction, and installed desktop discovery are separate gates and must remain open if unavailable.
6. **Follow-through.** Promote durable findings to the Deep Context product and route them from canonical indexes. Only after content preservation and reference checks, perform the separate legacy-planning archive item. Re-run affected gates after product or context fixes.

## Parallel work and dependency boundary

The two product items, deterministic entry and compact current-work view, can be developed in parallel **after the current plugin writer finishes**, with disjoint source and test ownership. Read-only schema/output review, Aftershock baseline, and independent answer-key preparation can run alongside them. A discovered schema or artifact contract conflict is resolved before integration and migration. Integration, migration and structural validation must be serial. Fresh-chat testing follows a stable converted snapshot. Legacy archive follows successful preservation and reference review.

## Acceptance

- The plugin's generated Aftershock structure and authority route match the accepted compact layout, and no second application schedule appears.
- Every unique current contract or historical fact has an identified retained or promoted location, and no pre-existing working-tree or application-source change is lost.
- Structural checks pass on the converted context. Failed or unavailable checks are recorded by name, with their practical impact.
- Fresh-chat results are scored against the held-out key and visible read evidence; any gap is a product or context follow-up, not an assumed pass.

No application implementation/build, installation, commit, push, publication, or legacy-document deletion is part of this milestone.
