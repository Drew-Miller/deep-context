# DC-13 Task-first context guide

Accepted plan, 2026-09-24. Deep Context helps an agent find the right durable information and remember work across compaction. It does not replace the model's normal working context. A project chat starts in its Codex project folder; `deep-task` associates that chat with a local task folder without changing the source working directory.

Canonical objective: `doc/active/ACTIVE-F4647207-358B-4300-862D-6C5813545954.md`. Backlog origin: `BACKLOG-62EF8C0D-EB9F-4F85-8B3C-1702D3D94ECD`. Current Deep Task: `8baf9512-3cf8-459f-84ba-93b2e21a83dd`.

## Objective and boundaries

- Give each substantial task a required, local, ignored memory folder. Keep the optional source checkout separate from task memory. Project documentation remains durable and Git-trackable.
- Let an unbound project chat list open tasks, create a new task, or explicitly continue one. Preserve one task association per chat, one writer per task, and confirmed takeover of another writer's task. `deep-close` closes the selected task only after its durable findings are classified and promoted.
- Make the task folder the first place for accepted task-specific requirements and decisions. Promote stable, cross-task product facts to canonical project documentation after checking related requirements and conflicts. Label proposals and open questions as such.
- Keep the always-read route small. The agent loads detailed task and project files when their short descriptions show that they are relevant.

## Task file contract

| File | Purpose | Normal read |
|---|---|---|
| `AGENTS.md` | Task instructions and safety boundaries | Startup route |
| `CONTEXT_MANIFEST.md` | Table of contents: path, one-line description, authority, and when to read | Startup and compaction |
| `TASK_STATE.md` | Bounded current phase, pending work, blockers, accepted checkpoint evidence, and exact next action | Startup and compaction |
| `TASK_CONTEXT.md` | Accepted task scope, criteria, constraints, decisions, and unresolved questions | When scope or criteria matter |
| `PLAN.md` | Phases, dependencies, acceptance gates, and task-level decisions | During planning and phase changes |
| `WORKLOG.md` | Dated detail and evidence behind checkpoints | When history or evidence matters |
| `chats/<binding>/MEMORY.md` | Chat-specific notes and handoff detail | On explicit continuation or when needed |

`PLAN.md` is required for new tasks. Existing task folders must remain readable and gain a plan through a versioned, non-destructive upgrade or an explicit compatibility route. The manifest points to relevant project indexes and canonical bodies, but neither whole project indexes nor full worklogs are part of the default task read. The CLI's `resolve-task.requiredReads` should return routing instructions, the manifest, and the compact state; it should describe optional paths separately. The task agent then selects details. No transcript scan or newest-task guess is part of recovery.

## Capture and checkpoint behavior

1. On `deep-task` creation, save an agent-authored, concise interpretation of accepted requirements, criteria, constraints, and open questions in the creation transaction. Do not copy the user prompt verbatim or turn speculative ideas into accepted scope.
2. When a new request or material scope change is accepted, update task context and plan promptly. Save useful progress at milestones and before ending meaningful work. Preserve the existing relevant state when changing a section; avoid duplicate checkpoints.
3. Extend guarded task saves so task context, plan, manifest, worklog, short state, and current chat note can be updated as one recoverable, revision-checked operation. A stale revision or non-owner fails visibly. Do not make file writes behind the agent's back.
4. Promote project-wide decisions, requirements, architecture, and reusable findings to canonical `doc/` files with conflict checks, index rebuild, and validation. Keep task-specific detail local. `deep-close` checks for unpromoted durable findings before closure.

## Startup and compaction recovery

Package a small, read-only `SessionStart` hook for startup, resume, clear, and compact events where the Codex runtime supplies those events. It resolves the current chat's binding and returns task identity, ownership/state, and compact file pointers. It does not read full task bodies, write memory, parse transcripts, select a task for an unbound chat, or acquire ownership. Verify the runtime identity used by the hook matches the desktop chat identity before relying on it.

Keep project `AGENTS.md` and the `deep-task` skill as the fallback when hooks are unavailable, untrusted, or fail. A hook cannot recover requirements that were never saved. A released association remains readable but does not grant writer ownership; a different owner's task still needs confirmed takeover.

## Implementation sequence

1. Specify task file schema and compatibility for existing folders. Implement the bounded manifest and `requiredReads` routing with tests for selective loading.
2. Add required task `PLAN.md` and the guarded, recoverable multi-file save path. Test stale revision, non-owner, interrupted write, and old-folder upgrade cases.
3. Update `deep-task` guidance for task-first capture, project promotion, milestone checkpoints, list/create/continue, and `deep-close` classification. Keep prompts short and explicit about accepted versus proposed content.
4. Add the packaged `SessionStart` hook and instruction fallback. Verify hook trust/installation behavior, startup, reopen, and post-compaction identity on a real desktop chat.
5. Run focused tests, typecheck/build, package and skill validation, context index rebuild/validation, and a fresh desktop scenario with two unrelated tasks and a continuation chat. Record exact fixture class and source checkpoint for each gate. Do not count a local simulation as desktop proof.

## Acceptance gates

- Two tasks retain separate accepted scope, state, and chat notes; a project chat only enters a task through `deep-task` or a known binding.
- Startup and compaction restore a bounded table of contents, pending work, and next action without loading full worklogs or all project documents. Detailed files can be selected when needed.
- An accepted requirement survives a new chat after a successful save; proposed or unanswered content remains clearly marked. Project-wide facts are discoverable through rebuilt indexes.
- Ownership, takeover, stale revision, interrupted save, old-folder compatibility, and closure promotion guards remain effective.
- The packaged hook works in a trusted fresh desktop session; the documented fallback works when it does not. Installed-plugin behavior is verified separately from source tests.

DC-12 local implementation and its pending desktop gate remain distinct. This plan authorizes planning and task/context recording now; source implementation, installation, commit, and publication are separate milestones. The exact live schedule is in `docs/plan/TASKS.md` and `STATUS.json`.
