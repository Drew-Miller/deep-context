# DC-12 Durable task continuation

Accepted user plan, 2026-09-23: explicit deep-task entry; create-or-resume chooser; one durable task per chat; many successive chats per task with one writer; confirmed takeover; relevant initial conversation summary; instruction-only startup/compaction restoration; automatic meaningful checkpoints. Desktop archive/delete never closes durable memory. No hooks, installation, publication, commits or pushes.

## Contracts and packets

Reuse DC-08/DC-09 architecture; no new planning-model pass because the user approved the bounded extension. Coordinator owns CLI, routing, package smoke and integration. Terra medium worker memory owns only src/tasks/memory.ts and tests/memory.test.ts. Worker may not update ledger, publish, commit or spawn.

- Preserve canonical released associations; active association wins historical cross-task conflicts, otherwise explicit historical read only. Mutations never bypass ambiguity.
- Add list-tasks, optional unbound resolution, bindingStatus/isOwner, structured guarded checkpoint input. Keep existing default strict resolution and source authorization.
- Refresh only managed routing, preserving authored instructions. Selective reads and saved checkpoints replace transcript dependence.
- Freeze worker before build. Review all edits; run pnpm test, typecheck, build, check:package, validators. Record source hash manifest and fixture evidence. Real desktop behavior remains a distinct gate.

## Next action

Implement core memory and CLI/routing concurrently with disjoint write scopes, then integrate and verify. Preserve pending metrics source and context changes.
