# DC-14 handoff: descriptive filenames and explicit work ordering

Prepared 2026-09-24 for a fresh Deep Context project chat. The live queue in `TASKS.md` and `STATUS.json` remains authoritative; this handoff does not activate or complete the milestone.

## Objective

Implement the product behavior in `doc/backlog/DC-14-descriptive-filenames-and-work-order.md`: descriptive human-facing file paths, stable record and task identities, and explicit user-controlled ordering for Backlog and task work. Use this self-project as a migration and recovery test, not as the only target. Preserve the single live schedule.

## First reads and task entry

1. Follow the repository `AGENTS.md`, `.deep-context/AGENTS.md`, and `.deep-context/CONTEXT_MAP.md`; resolve the new chat's task association. Read the DC-14 ticket and the top of `docs/plan/TASKS.md` with `STATUS.json`.
2. Inspect Git status and the existing source changes before editing. Current source HEAD when this handoff was prepared: `9f6acae1f7403fb412691dabaa6f1adb08f31b78`; the working tree is already dirty with DC-11/DC-12/DC-13 and context work. Recheck rather than assuming this checkpoint is still current.
3. Use `deep-task` to create or explicitly resume a DC-14 task with this chat as its owner, respecting its source binding and revision checks. Do not attach to another milestone or select a task by recency.

## Scope and boundaries

- Inventory UUID-only names and references; define readable slug, collision, title-change, and machine-only exceptions. Retain stable IDs in metadata and bindings.
- Implement creation, ordering, generated views, validation, and safe migration/compatibility for older paths. Ordering must be stored as data, survive rebuilds and fresh sessions, and not depend on filename sort. Historical/completed items must remain distinguishable from next-up work.
- Preserve task/chat identity, ownership, activation and provenance references, source inventory, evidence, and uncommitted changes. Do not alter DC-13 or DC-15 scope, or rewrite their source implementation as part of DC-14.
- No commit, push, plugin installation, publication, or unrelated cleanup is included. The executing chat records progress in its task memory and reports completion evidence here; this coordinator reviews results and updates the live project ledger after acceptance.

## Proof required before handback

- Demonstrate two Backlog items and two tasks ordered, reordered, rebuilt, and recovered in an isolated fixture. Preserve the ticket's separate fresh-session acceptance gate for coordinator validation; do not present a fixture as desktop proof.
- Cover collisions, title changes, legacy UUID paths, broken references, duplicate/invalid ranks, generated-index freshness, and task recovery with focused tests. Run typecheck/build, plugin/package and skill validation where affected, Deep Context index rebuild and validation, and a whitespace check. Diagnose failures rather than reducing acceptance criteria.
- Report changed files, commands and results, migration coverage and exceptions, remaining risks, exact source checkpoint, and any unrun desktop or installation gate. Leave the source and task state ready for coordinator review.

## Handoff handshake

Before implementation, the new chat should briefly state its resolved project/task identity, the DC-14 product boundary, what it will preserve, and its planned first implementation step. The coordinator will confirm the handoff, then the chat can run to completion under these bounds.
