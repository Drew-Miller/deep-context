# DC-14 implementation plan

Source checkpoint before DC-14 edits: `9f6acae1f7403fb412691dabaa6f1adb08f31b78`, with existing DC-11 through DC-13 changes. Task `8bcf931a-47f7-4bf7-a952-2a26bf16b4cd` owns this work in the existing checkout. The coordinator owns `TASKS.md` and `STATUS.json`.

## Contracts

- Keep canonical record IDs, task UUIDs, chat bindings, source ownership, and evidence independent of display names and paths. Modern task folders already have readable slugs and stable UUIDs; leave them in place.
- New Backlog, Active, and source records use a bounded readable slug plus the full stable ID. Existing descriptive authored files keep their names. Fixed routing and task filenames, binding folders, journals, and archives are machine-facing exceptions.
- Existing ID-only canonical paths migrate only through an explicit preview and recoverable apply operation. Old paths become one-hop forwarding Markdown files. Indexing ignores forwarders; validation checks target identity and references. A title change may be followed by another explicit migration without changing identity.
- Backlog `queue_position` is an optional positive safe integer. Proposed and planned work is ordered before other status groups. Legacy unranked records follow ranked records with stable ID ties. Reordering writes contiguous positions under the project lock and the context journal.
- Task order lives in `tasks/ORDER.md` keyed by task UUID, separate from owned task state. Reordering does not change task revisions, bindings, or source evidence. The ordered `list-tasks` view shows positions; unranked active tasks follow ranked tasks by ID.
- The live self-project schedule remains authoritative. Product-level ordering does not update its milestone ledger.

## Sequence

1. Implement naming, ID lookup, and descriptive creation for Backlog, Active, and source records. Preserve source refresh classification and authored bodies.
2. Implement Backlog ordering, generated views, and validation. A bounded worker implements task ordering in `src/tasks/order.ts`, `src/tasks/memory.ts`, and focused tests; the owner reviews it before integration.
3. Add guarded path migration, forwarding files, recovery, and reference checks. Keep existing task directories and historical report files without stable metadata unchanged and report exceptions.
4. Add CLI commands and concise usage documentation, then run focused and full verification. Preview and apply migration on this self-project after fixture proof, refresh indexes and source inventory, and validate.
5. Record exact commands, results, source hashes, limits, and desktop/installed-plugin gates for coordinator review. No installation, commit, push, or publication.

## Acceptance gates

- In an isolated fixture, create and reorder two Backlog items and two tasks, rebuild views, and verify order in a fresh CLI process.
- Test slug collisions, title changes, legacy ID-only files, aliases, source refresh, broken references, invalid and duplicate positions, stale indexes, and task binding recovery.
- Run relevant focused tests, full tests, typecheck/build, package and skill validation, copied-package smoke, live index rebuild/validation, and `git diff --check` after writers are frozen.
