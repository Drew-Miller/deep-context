---
id: REPORT-DC-12-TASK-CONTINUATION
title: Durable task continuation implementation and local verification
status: accepted-local-awaiting-desktop-verification
features:
  - tasks
  - routing
  - bootstrap
---

Historical report: this describes the layout and verification state at its original date. Old literal paths and commands are retained as evidence, not current instructions. Use [the current layout](../context-layout.md) and the migration path map for navigation. Markdown links have been relocated; the original bytes are in the local migration archive.

# Durable task continuation

The plugin now keeps a chat associated with its original durable task after release, takeover and closure. Restoring the association does not restore writer authority. `deep-task` offers creation or open-task selection in an unbound chat, saves relevant initial context in the creation transaction, and checkpoints progress in shared state and chat memory together. A fresh chat can resume a released task or take over an owned task after confirmation. Project instruction routing recovers selected context without changing the source checkout.

The CLI adds `list-tasks`, `resolve-task --allow-unbound`, `start-task --context-file`, and `save-task --checkpoint-file`. Task results include `bindingStatus` and `isOwner`. Existing schema-version-2 tasks require no migration. The managed project routing block refreshes idempotently and preserves authored instructions. The skill is explicit-only. No lifecycle hook was added.

## Accepted local gates

- 2026-09-24, source checkout at HEAD `9f6acae1f7403fb412691dabaa6f1adb08f31b78` with uncommitted source. `pnpm test`: 70 tests across 12 files passed; fixture repositories and temporary task homes. `tests/memory.test.ts` covers association, release, transfer, initial context, structured checkpoint, unbound lookup, invalid input and historical ambiguity. `tests/projects.test.ts` covers managed routing preservation. `tests/memory-closure.test.ts` covers closed archive reads.
- 2026-09-24, same checkout. `pnpm build`: typecheck and bundle passed. `pnpm check:package`: copied-package boundary and isolated lifecycle smoke passed, including CLI entry, unbound lookup, checkpoint, release, resume and validation.
- 2026-09-24, same checkout. Official `validate_plugin.py`, `quick_validate.py` for deep-task, and `git diff --check`: passed. Evidence is command output in this implementation chat and the focused hash manifest in `docs/plan/checkpoints/DC-12-2026-09-24.sha256`.
- The Terra memory worker produced scoped edits, then hit a usage limit before its final report. The coordinator reviewed the changed memory implementation and tests, repaired integration issues, and ran all gates. No worker claim was accepted without coordinator verification.

- 2026-09-24, same checkout. `deep-context init --repo` refreshed this project’s managed root and project routing, source inventory, and generated indexes while preserving authored context. `deep-context validate --project .deep-context` passed. The hash manifest verified all focused source and test files after the refresh.

## Limits

This checkout does not test a newly installed plugin in a fresh Codex desktop task. Agent instruction routing and automatic checkpoints depend on the agent following the installed skill; sudden interruption can lose unsaved work. Installing or publishing the updated package was not authorized. Desktop discovery, restart, compaction, archive/delete and takeover scenarios remain open gates. The prior DC-11 metrics changes remain pending in the same workspace and were not reverted.
