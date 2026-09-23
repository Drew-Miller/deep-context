# DC-08 Desktop chat and task memory

Status: implementation installed; actual desktop lifecycle verification pending. This document preserves the accepted design baseline; its original future-tense language is not the live ledger. Current evidence and explicit deviations/limits: doc/reports/DC-08-IMPLEMENTATION.md. Discovery: doc/reports/DC-08-DISCOVERY.md. Accepted architecture: doc/decisions/DEC-DC-001-chat-task-binding.md. Requirements: REQ-DC-026 through REQ-DC-031. Backlog origin: SHELF-0012.

## Outcome and user flow

The user opens a chat in a Codex desktop Project, invokes `deep-start`, and describes the work. The skill resolves shared project context, generates a short descriptive title, creates task memory, records the chat association, and reports the selected task and source mode. Work continues in the existing chat. `deep-resume` selects an existing task and loads its exact next action. Starting another unrelated chat does not inherit task memory.

All automatic behavior starts at an explicit skill entry or a project AGENTS startup route resolving an already recorded association. Opening a new unbound chat never invents or selects a task. Project-level questions need no task creation. This milestone changes plugin code and documentation only when subsequently implemented; the present delivery is the plan and durable context update.

## Project entry and storage

- New `deep-init` defaults to `<repo>/deep-context/` and writes a marker-delimited route in the selected repository's AGENTS.md, preserving unrelated content and existing source authority. This storage location is a proposed default pending the user's layout response. Explicit `--context <path>` supports sibling and existing external homes. Existing initialization without this new option retains CLI compatibility; the skill passes the desired path explicitly.
- Keep the existing canonical tree, including PROJECT.md, CONTEXT_MAP.md, doc/, tasks/, and machine state. Do not move current Aftershock or self-context folders automatically. Add canonical `project_id` to PROJECT.md on initialization or explicit migration; machine state only caches it.
- Resolve an explicit `--project` first, then an initialized ancestor, then the nearest repository's recognized local context, then a registry entry matching the canonical repository/common-Git-directory identity. If different implicit candidates exist, require explicit selection. Verify the source/context identity before use. Do not search unrelated Projects, titles, chats, or arbitrary filesystem trees.
- Store machine attachment registry beside the existing Deep Context configuration. It accelerates external-home and desktop-worktree resolution; it is rebuildable from explicitly supplied context roots. Loss of the registry must preserve `--project` and direct-folder recovery.
- For a contained context, exclude the exact context subtree from import inventory and source-change evidence. Do not follow its repo resolver back into the containing source. Keep import read-only; only explicitly requested initialization may create local routing files or a local Git exclude entry. Context remains unversioned by default without replacing existing ignore rules.

## Task identity, chat binding, and persistence

- Use UUIDs for new project/task identities. Create task folders as `tasks/<generated-slug>--<full-task-uuid>/`; folder paths remain stable if titles change. Existing unique task names remain accepted selectors. Ambiguous names require UUID/path. Two tasks may share a display title.
- Keep the existing AGENTS.md, TASK_CONTEXT.md, CONTEXT_MANIFEST.md, TASK_STATE.md and WORKLOG.md layout. TASK_STATE frontmatter adds schema version, task_id, title, lifecycle status, owner_binding_id, state_revision and source_binding. Existing checkpoint body sections remain required. A task without source has an explicit absent binding rather than fabricated Git evidence.
- Add `chats/<binding-uuid>/MEMORY.md` with canonical frontmatter: task_id, binding_id, runtime, runtime_chat_id when available, active/released status, optional observed title, and timestamps. Its body records the chat's discoveries, work and handoff. Multiple successive chat records remain separate; WORKLOG.md is shared task history and TASK_STATE.md is the current handoff.
- The optional Codex adapter reads a valid nonempty CODEX_THREAD_ID. The skill may verify it using the desktop read-thread tool when available, as this discovery did. Missing metadata does not prevent explicit task-path use. Never infer identity from process IDs, timestamps, title similarity, the latest chat or private Codex databases. Record adapter provenance and whether runtime identity was verified.
- Generate a reverse binding index under machine state from canonical chat frontmatter. Scope runtime IDs to project/runtime; permit only one active task association for a given chat in a project. Check candidate canonical records before use. Index loss, duplicate associations, or mismatches must rebuild or return an explicit conflict, never route to guessed memory.
- Start is idempotent for an already-bound active chat: return its existing task without changing scope. A request for a different task checkpoints/releases the old association before starting another. Without runtime identity, return a task path and use it explicitly for every later operation; do not create a shared fallback current-task pointer.
- Resume in a different chat explicitly transfers shared-task ownership. Preserve the old chat record as released history. Require an explicit takeover flag if another binding owns the task; show the previous owner and saved next action. No time-based automatic takeover. Each shared-state mutation checks owner and expected state_revision, under a short project/task lock; concurrent changes fail with reload guidance.
- Use atomic writes plus recoverable operation records for creation, transfer and closure. Publish a binding only after its task files are complete. Recovery must detect interrupted operations and preserve existing files. Read-only resolution never repairs by silently writing. Rebuild and repair commands are explicit mutations.
- Task titles come from the request, with `--name` as an override. Capture the desktop title only as optional metadata. Do not rename the chat by default. An explicit `--sync-title` skill option may use the current-chat title tool once; its failure never changes identity or blocks checkpointing.

## Source execution and closure

- Memory creation never requires Git. `source_binding` records mode (`none`, `read-only`, `isolated`, `existing`), canonical source path when present, repository/common-dir identity if Git, checkpoint evidence, and checkout ownership (`none`, `deep-context`, `external`). Keep current source_worktree_policy for worktree decisions.
- `deep-start` initially captures memory and inspects the source. Before requested source edits, the skill selects an allowed execution mode. Use an already isolated desktop checkout when verified and explicitly attached; otherwise create one Deep Context-owned worktree when the source harness permits it. Never create a nested second worktree merely because task memory exists. A prohibited policy permits read-only tasks and rejects creation of another editable checkout.
- Editing an existing shared source checkout requires explicit `existing` selection and its source harness's permission. Do not downgrade an isolated-write request silently. Aftershock's read-only demonstration uses no source writes or worktrees; no policy relaxation or source migration is part of this milestone.
- CLI commands operate on explicit execution paths; they do not claim to change the desktop chat's cwd, sandbox or permissions. If the authorized checkout is inaccessible, checkpoint and report the access limitation. A memory folder is not a filesystem security boundary.
- Checkpoints preserve per-chat notes and shared state. Git source evidence includes HEAD and relevant working-tree hashes, including untracked files selected as evidence; non-Git evidence uses selected-file hashes. A read-only task must surface intervening source changes rather than claim an unchanged revision. Scope Git diffs to the execution checkout, excluding known context storage.
- Closure classifies every task/chat note and promotes durable knowledge using existing safeguards. Hash all canonical bindings, chat notes, task state, selected project authority and relevant source evidence. No-worktree tasks omit Git cleanup, not knowledge review. External/desktop-owned checkouts are never removed by Deep Context. Owned worktrees retain clean-state and identity guards; source branches are never deleted automatically.
- Finalization archives the complete task memory and binding history, emits an indexed durable report and a closed identity record, then removes eligible transient files. Archived task lookup returns the report, never silently resurrects a task. Continuing closed work creates a new task with a predecessor link. Registry/index rebuild must discover active and archived identities without losing associations.

## Public interfaces and compatibility

| Skill | Behavior |
|---|---|
| deep-setup | Configure optional external home and machine routing |
| deep-init | Initialize or attach project context and root startup route |
| deep-start | Derive title, create memory, bind this chat, select context |
| deep-resume | Resolve a task, transfer ownership explicitly when needed, restore state |
| deep-save | Save chat notes and the shared checkpoint; automatic checkpoint guidance also remains |
| deep-close | Run existing two-stage review/promotion/finalization using source ownership |

Retain binary name `deep-context`. Add `start-task --description <text> [--name <title>]`, `resume-task <id-or-path>`, and read-only `resolve-task`, with `--project`, `--chat-id`, `--task` where selection applies and `--json` for skills. Add `--takeover` to resume and `--source-mode`/`--source-path` for explicit checkout attachment. Existing `create-task`, `checkpoint-task`, and `close-task` commands remain valid; legacy create-task retains its worktree semantics. New skills use the new memory-first start flow. JSON output includes task ID/path/title, binding ID, state revision, source mode/path, and required-read paths.

Replace four old public skill names with the six new names and update their metadata, descriptions, example prompts, plugin packaging and documentation together. Do not retain public skill aliases that violate the naming requirement. Preserve old CLI commands and publish the old-to-new skill mapping. Read skill-creator and plugin-creator instructions before implementing and reinstall through the supported cachebuster flow.

Read legacy tasks without mutation. First explicit lifecycle mutation performs a versioned, recoverable migration adding UUID and binding metadata while preserving paths, bodies, base revisions and existing worktrees. Unknown schema versions fail with guidance. Migration invalidates old closure approvals. REQ-DC-009's mandatory-worktree interpretation and existing task contracts are marked superseded only when this replacement is implemented and verified; keep their history.

## Implementation sequence and verification

1. **DC-08A, identity and resolver:** canonical task/chat schemas, optional source identity, contained/external project lookup, registry/index rebuild, atomic creation/transfer and legacy migration. Tests cover UUID/title independence, duplicate names, missing ID, explicit recovery, two independent chats, ownership conflicts, interrupted operations, no Git, and paths with spaces.
2. **DC-08B, lifecycle and source modes:** start/resume/save, explicit source attachment, checkpoint evidence and ownership-aware closure. Tests cover read-only source unchanged, source changes detected, worktree prohibited, existing desktop checkout reused without nested creation, borrowed checkout retained, owned cleanup guarded, all chat notes classified, archived identity discoverable and stale closure invalidated.
3. **DC-08C, skill/project entry:** six renamed skills, root routing and init layout, source harness preservation, prompt-derived title and explicit title synchronization. Tests cover idempotent AGENTS markers, source import excluding its own context, external legacy home discovery, registry loss, ambiguous roots, and rejected implicit rebinding after chat forks.
4. **DC-08D, integration and desktop acceptance:** run all prior tests, new integration tests, typecheck/build, official plugin and six skill validators, then install. Verify in actual fresh desktop chats: start from repository root, two chats using different tasks, resume one task from a later chat, same-chat reopen/restart, title rename, missing-ID explicit path, and scope recovery after history is unavailable. Use disposable fixtures for source writes and cleanup. One fixture must match Aftershock's prohibited-worktree policy.

The final desktop gate must record runtime/host, plugin version, source hash checkpoint, observed IDs, selected paths, commands/results and evidence files. Mocked IDs do not prove desktop integration. If a live capability fails, fix the adapter or report that gate incomplete; do not call the entire workflow verified. Full app transcript capture is unnecessary; retain only relevant identity and routing evidence.

Workers should implement independently scoped packets only after the coordinator fixes the interface contracts; identity/resolver work precedes dependent lifecycle work. The coordinator owns cross-cutting contracts, reviews all changed files, freezes writers before integration, and alone updates acceptance status. No implementation is accepted by this planning document.

## Defaults and exclusions

Proposed defaults: repository-contained deep-context/ for new skill initialization, optional runtime ID with explicit-path fallback, request-derived title, no automatic title sync, one shared-state writer per task, shared canonical project knowledge and separate per-chat notes. Existing storage remains in place.

No cloud/remote-host binding, transcript scraping, automatic chat creation, hooks, background title synchronization, task-folder desktop-project registration, migration of Aftershock, commits, pushes or deployment. These are unnecessary for the requested local desktop skill entry. Source access and permissions remain governed by the selected project and runtime.
