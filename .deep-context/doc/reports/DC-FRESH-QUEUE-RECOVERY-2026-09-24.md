---
id: REPORT-DC-FRESH-QUEUE-RECOVERY-2026-09-24
title: Fresh project chat recovery of queued work
status: observed-pass-bounded
features: [routing, tasks]
---

# Fresh project chat recovery of queued work

Date: 2026-09-24. Evaluated Codex task: `Hello, world!`, ID `01a0d5d5-44b5-7bd2-a87b-c4394a992390`, in the Deep Context project at the repository root. Its initial greeting received no file inspection. Five later questions were sent sequentially as a read-only test; the task was not given an answer key. Source HEAD was `9f6acae1f7403fb412691dabaa6f1adb08f31b78` with uncommitted work. The live ledger reported `deep-context-state-14`.

## Observed answers

1. It recovered the near-term order DC-14, DC-15, then DC-13 source implementation, and selected the live `TASKS.md`/`STATUS.json` schedule. It stated the next action as starting DC-14 and correctly described DC-13 as accepted but not implemented.
2. It selected `doc/backlog/DC-14-descriptive-filenames-and-work-order.md` and accurately explained readable filenames, stable IDs, explicit ordering, migration safeguards, acceptance checks, and the not-started implementation state. It identified the present pathname-sorted index and manual queue.
3. It selected `doc/backlog/DC-15-deep-audit.md` plus the related restructure and `repo`-link proposals. It kept the audit's inventory, conflict/drift review, evidence-backed report, and remediation queue separate from later cleanup or plugin changes.
4. For a user-chosen reorder or DC-13 continuation, it distinguished the current manual schedule from the planned product ordering feature. It described explicit task selection, owner confirmation for takeover, revision checks, and DC-13's read-only source binding. It marked installed desktop recovery verification as open.
5. Its read inventory distinguished full reads from searches/excerpts, said it had not opened task-local memory, and identified an ownership statement based on the ledger rather than a direct task-state read. It proposed using the lightweight Backlog index before selecting another item.

The visible task trace shows read-only `cat`, `sed`, `rg`, Git status/HEAD, and `resolve-task` commands. The resolver returned unbound; no file changes appear in the inspected turns. Reads were mostly selected and relevant. It read root `AGENTS.md` again through `.deep-context/repo/AGENTS.md` and read the full `STATUS.json` more than once, so this test does not demonstrate minimal context use. Command traces show access, not internal attention; model usage and exact token cost were unavailable.

## Scope of this result

The five factual answers matched the observed ledger and canonical tickets, and the read-inventory limits were candid. This supports fresh, unbound project-chat orientation at the current checkpoint. It does not prove actual task creation or resume, takeover, a changed work order, compaction recovery, Claude behavior, installation parity, or DC-14/DC-15 implementation. The task remains unbound and read-only.

At report time, SHA-256 values were `5a6bd65b1aee3b0a5d68ddc11f35cb8914a697968461137982881722e4dcb61f` for `docs/plan/TASKS.md`, `c7c988b5a13c7d9c8bcdd17d825f336f962b2199d5afc9b1693023e62f853553` for `docs/plan/STATUS.json`, `5f7ad494429bfd18239b236d35b7c3d03eda94d63934daf82acb40d4ba66af1f` for the DC-14 ticket, and `b5272c9eca18574f45b23776cf3bbbf51eec7ae14daa05be5f9b614d07319464` for the DC-15 ticket. These are post-test file hashes, not proof of the exact bytes delivered by the app during each turn. The evaluated task history is the primary prompt and command trace.
