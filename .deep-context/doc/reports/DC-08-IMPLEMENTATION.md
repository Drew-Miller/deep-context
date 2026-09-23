---
id: REPORT-DC-08-IMPLEMENTATION
title: Desktop task memory implementation and verification
status: implemented-pending-desktop-verification
features: [bootstrap, tasks, routing, closure]
---

# DC-08 implementation, 2026-09-23

The memory-first lifecycle is implemented and installed locally as version 0.1.0+codex.20260923161435. DC-08 remains open for actual desktop lifecycle acceptance. No commits, pushes, source branch deletions, Aftershock source edits, or existing context-home moves were performed.

## Delivered behavior

- Six public skills: deep-setup, deep-init, deep-start, deep-resume, deep-save, deep-close. Legacy CLI commands remain.
- Stable task UUIDs, request-derived display titles, canonical per-chat associations and notes, one revision-guarded shared-state owner, release/takeover, and predecessor memory in the resume read route.
- No-Git memory creation; deterministic source evidence; read-only, owned isolated and borrowed existing execution paths; exact context-subtree exclusion.
- Explicit project selection, initialized ancestor/local repository discovery, and validated external-home/common-Git-directory registration. New explicit initialization installs a bounded root route; legacy external refresh is source-read-only.
- Recoverable before/after task write journals, explicit repair, preserved legacy notes/worktree migration, guarded closure archives and closed-task lookup.

## Verification gates

Environment: local macOS Node subprocesses and temporary filesystem/Git fixtures. Source HEAD is 007cc323fa9b1fd153056c18fb6ddd78474c93cf with preserved DC-07 and DC-08 uncommitted work. Exact source/package checkpoint: docs/plan/checkpoints/DC-08-2026-09-23.sha256, 59 files, manifest SHA-256 592e9bfb42e24932d265d1088577a390468a30d8dd37e1c2ae60025fa94ceabe.

| Gate | Command / evidence | Result |
|---|---|---|
| Type checking and bundled build | pnpm build, including pnpm typecheck | Passed |
| Automated regression and lifecycle | pnpm test | 44 tests, 9 files passed |
| Whitespace errors | git diff --check | Passed |
| Plugin manifest/package | Official plugin-creator validate_plugin.py | Passed |
| Six skills | Official skill-creator quick_validate.py, each of the six skill folders | Passed |
| Installed package | codex plugin add deep-context@personal | Installed 0.1.0+codex.20260923161435 |
| Installed CLI integration | Empty initialization, two independent synthetic chats, save/release, third-chat resume, predecessor notes, index rebuild, validation | Passed |
| Skill forward review | Independent read-only agent, scenario: investigate export reliability, save and resume from another chat | Four findings corrected |
| Durable self-context | Installed CLI provenance refresh, rebuild-indexes, validate | Passed; canonical project UUID added, authored source notes preserved |
| Aftershock shadow context, read-only check | Installed CLI validate against existing Aftershock context | Failed on changed/new source inventory; its source has advanced since the saved inventory |

The installed CLI fixture remains at /var/folders/jw/y2tnsgbx2_zd5dc959j11f880000gn/T/deep-context-installed smoke d5pZKE. It contains only synthetic test context and may expire with temporary storage. Durable tests are in repo/tests/memory.test.ts and repo/tests/memory-closure.test.ts.

The expanded regression covers duplicate titles with distinct IDs, missing-ID explicit recovery, stale writers, literal checkpoint text, prior-chat notes, source edits without status changes, contained context exclusion, an Aftershock-like prohibited-worktree fixture, borrowed checkout retention, clean owned cleanup with branch retention, legacy migration, incomplete writes, all-note classification, stale closure evidence, and receipt-based cleanup retry.

## Failures encountered and resolved

The first legacy-migration fixture omitted its required source-rules acknowledgment; the fixture now supplies it without changing the guard. Both default Python environments lacked PyYAML. Official validators passed using an isolated temporary environment with PyYAML 6.0.2. Packaging initially rejected four empty obsolete skill directories; those empty directories were removed after inspection. The read-only skill review identified missing predecessor loading, undocumented release, missing reapproval after review refresh, and no uninitialized-project route; all four were corrected.

## Remaining gates and limits

- Actual Codex desktop new-chat, same-chat reopen/restart, title rename, later-chat resume and fork behavior have not been verified with this installed version. Synthetic IDs prove deterministic behavior, not app integration. A fresh user task is required to pick up the renamed skills.
- Aftershock validation surfaced stale hashes and new source files, including RowWaveformThumbnail.swift and current UI planning packets/reports. No refresh or source mutation was performed; its shadow provenance needs a separately scoped refresh before relying on it as current evidence.
- CODEX_THREAD_ID is an optional observed adapter, not a documented stable public contract. Explicit task path and binding ID remain the recovery fallback; no title or newest-task inference is used.
- A partial closure archive interrupted before its recovery receipt is written is preserved and rejected for manual inspection. Once a receipt exists, cleanup retry checks source, notes, archive and project evidence. No unsafe automatic deletion is used to resolve ambiguity.
- Locks are deliberately not stolen by elapsed time. Explicit unlock verifies the recorded token and that the process is no longer alive; unresolved identity requires inspection.
- Semantic conclusions and promotion correctness still require agent review. Deterministic checks cannot prove that a note classified as transient contains no overlooked durable insight.
- Legacy direct CLI checkpoint/closure behavior stays compatible; explicit resume performs the schema-2 binding migration. The new skills use the memory-first lifecycle.

## Next safe action

In a fresh Codex desktop task, invoke deep-start with a short read-only request and an explicitly selected initialized project. Confirm its selected task UUID, memory folder and source mode. Save/release, then resume from a later task; verify that the exact next action and previous chat discoveries load. Record the desktop gate here before marking DC-08 fully accepted. Use disposable fixtures for writes and cleanup; keep Aftershock source read-only.
