---
id: WORK-5CC51337-667D-4E85-A4DF-BED289D67571
title: Folder update
status: planned
pitch: Make the self-project tree readable by grouping ordered work bundles,
  separating lifecycle states, closing stale task memory safely, and reducing
  local and source-inventory clutter before product propagation.
provenance: User request 2026-09-30; folder structure discussion
features:
  - bootstrap
  - routing
  - tasks
tokens: []
related:
  - WORK-BE622AC4-3D41-4E59-B03D-F753F859B086
  - BACKLOG-1307E6D5-F01B-4B33-8DC5-4C55B2125BD5
  - BACKLOG-62EF8C0D-EB9F-4F85-8B3C-1702D3D94ECD
  - BACKLOG-130A256F-0F6D-4251-A4CB-3C03511B0687
  - BACKLOG-A464417C-F116-4217-94D2-F1650510B429
conflicts: []
aliases: []
tasks: []
requirements: []
decisions: []
open_gates: []
status_history:
  - from: proposed
    to: planned
order: 1
---

# Folder update

Make the self-project tree readable by grouping ordered work bundles, separating lifecycle states, closing stale task memory safely, and reducing local and source-inventory clutter before product propagation.

## Why this is next

Deep Context has three related surfaces managed by the agent: **Harness** (`AGENTS.md`, `CONTEXT_MAP.md` and selective indexes) decides what a chat reads; **Work board** (`work/` and active execution memory) captures and orders tickets created in chat without requiring Jira setup; **Knowledge base** (`docs/`) holds accepted requirements, decisions, architecture and lasting reports without requiring Confluence. A person browsing the tree should be able to identify each surface and each item's scope. An agent should start from small indexes/frontmatter and load only the bodies needed for the question or task. A work ticket may point to a requirement or decision, but must not become a competing copy of it.

The self-project currently puts proposed, active, done and merged records together in `work/items/`, so the folder does not show the work sequence or lifecycle. `tasks/` contains six task folders with active owner bindings, although several linked objectives are done and no chat is currently executing in those folders. `.local/` is about 14 MB and mixes required machine state with migration snapshots, audit output and validation scratch. `sources/records/` holds 178 per-file provenance records, many with generic machine-generated review reasons. This structure obscures current work and makes closure or cleanup hard to judge.

This item owns the **self-project folder update first**. Product CLI, plugin, templates, skills and migration support follow from the accepted local structure as a separate implementation gate; do not treat a manual move as product adoption. The Aftershock bootstrap waits for a stable, validated structure and reader route.

## Proposed visible tree

```text
.deep-context/
  AGENTS.md  CONTEXT_MAP.md  PROJECT.md
  docs/                      knowledge base: accepted requirements, decisions,
                             architecture, features and lasting reports
  work/
    INDEX.md                 human-readable board, generated from canonical work
    bundles/                 one ordered heading/summary per bundle
    backlog/<bundle>/        proposed, planned and deferred/blocked tickets
    active/<bundle>/         executing tickets
    completed/<bundle>/      accepted outcomes with any open verification gates
    archived/<bundle>/       merged/superseded tickets and historical tombstones
  tasks/                     live/resumable chat execution memory
  sources/
    INDEX.md                 small provenance selection view
    records/                 authored classifications and exceptions
    inventory.*              compact generated file inventory, format to decide
  .local/                    ignored runtime state and recoverable raw evidence
```

The top-level `work/` folders show lifecycle. **The user selected bundle folders with separate ticket files.** A canonical `work/bundles/<ordered-descriptive-name>.md` holds each bundle's heading, intent, order and ticket IDs, without repeating ticket bodies. The corresponding status folders group the canonical ticket files by bundle; each ticket retains its own ID, scope, dependencies, acceptance criteria, outcome and open gates. Merged former ticket files become short archived identity records or recoverable snapshots after unique content is incorporated; the active route must not maintain duplicate current guidance. Bundle order appears in human-readable folder/file names as well as the generated index. A status transition moves the ticket atomically to the matching folder and repairs links while leaving bundle identity stable; only the CLI rebuilds indexes.

## Decisions to settle in the task

- Define the six user-facing bundles from the current queue: plugin readiness; context entry and current work; Aftershock conversion; context recovery and findings; task recovery; cleanup and capture. Keep the immediate Aftershock dependency order visible in bundle metadata and the generated board. Decide which independent items must remain standalone rather than forcing unrelated scope into a bundle.
- Define the precise placement rule: `proposed`/`planned`/deferred `blocked` in `backlog/`; executing `active` in `active/`; `done` in `completed/`; `merged` or superseded in `archived/`. If a blocked item still has an owner, its task state retains the blocker even when its work record is queued.
- Define task retention by objective and ownership, not by whether the desktop chat appears open. Review all six live folders, promote unique decisions/evidence, release or close through the owner workflow, then archive eligible task memory. Retain the Aftershock bootstrap and DC-13 task memory while their objectives remain open. Never remove a task folder merely because a chat is idle.
- Keep `.local/` for machine state: project identity, chat lookup, locks, and recoverable transaction journals. Classify archives, audits, validation answer keys and metrics separately. Promote durable conclusions into `docs/`; retain raw evidence only while a gate, recovery path or historical hash needs it. Remove redundant scratch only after proof, with a manifest of moves and retention decisions.
- Review all 178 source records. Preserve authored dispositions/reasons and source identity, but consolidate generic file-by-file inventory into a compact generated manifest if it can be rebuilt without losing classifications. Keep the ordinary context route at index/frontmatter level.
- Make chat capture classify new input into a work ticket, accepted requirement, decision, evidence, or unresolved proposal. Maintain one canonical home for each conclusion and use links across the board, knowledge base and harness route rather than duplicate bodies. This classification contract may be linked to the existing natural-language capture item rather than fully implemented during the folder move.

## Implementation and acceptance gates

1. Record the original tree, frontmatter, IDs/aliases, order, task ownership, links, source dispositions, `.local` inventory and hashes of retained historical evidence. Mark each proposed move/merge/retention before changing live paths.
2. Prepare a recoverable target-tree preview and mapping. Make the folder view reviewable before switching the live project. Reconcile unique ticket scope into bundles and explicit archived identity records; prove no orphan IDs, lost open gates or duplicate current authority.
3. Adapt product readers/writers, generated indexes, validator, task lifecycle and skills to the chosen paths. Switch the self-project atomically or with a repairable journal; do not leave the live context in an unsupported layout between turns. Product propagation to other projects is a distinct gate.
4. Verify status moves, ordering, captures, task recovery/closure, source provenance, links, indexes and historical evidence. Check that a human can find the next ticket and its scope from the tree, and that an agent answers a targeted question from routing metadata before loading selected bodies. Run the relevant product tests, package check and self-project validator. Fresh-chat selection and Aftershock conversion remain separate gates.

No commit, push, installation, Aftershock mutation, or deletion of unclassified evidence is included. The task is complete when the visible tree is understandable, every retained item has one authority, and the bundled CLI can maintain and validate that tree.
