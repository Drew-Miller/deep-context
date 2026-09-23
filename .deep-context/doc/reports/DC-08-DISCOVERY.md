---
id: REPORT-DC-08-DISCOVERY
title: Desktop chat to task discovery
status: complete
features: [bootstrap, tasks, routing, closure]
---

# Desktop chat to task discovery

Date: 2026-09-22 America/Los_Angeles. Scope: discovery and documentation only; lifecycle implementation remains pending.

## User intent

The user creates a fresh chat in a Codex desktop Project, invokes `deep-start`, and describes the work. The skill derives a readable task name and creates separate task memory. A later chat may resume that task. All public skill names must contain exactly two hyphen-separated words beginning with `deep-`. Context should be project-contained and discoverable through the project's agent instructions. A task identifier may be associated with the desktop chat identifier; titles are optional display metadata.

The Aftershock source-repository test followed its native harness and did not discover a sibling context home. That result tests a different entry point from the earlier task-folder workflow. No automatic sibling discovery was established.

## Observed desktop capability

A targeted runtime identity probe and a read-only desktop task lookup agreed on the current session identity and project location. Raw session identity and title observations are retained only in the local publication backup. This verified current-session identification on that host; it did not verify future app releases, restart recovery, fork behavior, or another machine.

The available desktop title tool can rename the calling chat without supplying an ID. No title was changed. Titles need not be used as identity, and the generic title of this existing conversation would not be a useful task name.

Official documentation describes project instruction discovery from project root to cwd, with a current-directory fallback when no project root is found. It does not imply discovery of sibling folders. Launching inside a nested Git worktree can therefore omit task instructions above that Git root; the planned root-project entry must load the selected task explicitly. [Instruction discovery](https://learn.chatgpt.com/docs/agent-configuration/agents-md).

Official documentation lists Local and Worktree as distinct desktop execution modes. Creating a memory folder does not itself change the chat's execution environment. [Codex environments](https://learn.chatgpt.com/docs/environments/modes).

The public environment-variable page does not list `CODEX_THREAD_ID`. The plan treats the observed variable as an optional adapter capability, not a guaranteed public API; its absence must retain explicit task-path operation. [Environment variables](https://learn.chatgpt.com/docs/config-file/environment-variables).

## Source findings

Source: `/Users/drewmiller/Developer/deep-context`, HEAD `007cc323fa9b1fd153056c18fb6ddd78474c93cf` plus the pre-existing DC-07 changes. Source snapshot: `docs/plan/checkpoints/DC-07-2026-09-22.sha256`; no source implementation edits made during this discovery.

- `src/projects/index.ts`: initialization targets the configured home; discovery only walks ancestors for state. A repository-root chat cannot resolve an external context home automatically.
- `src/tasks/index.ts`: task name is identity; every task requires a committed Git source and a new worktree. Checkpoints read that worktree's HEAD.
- `src/closure/index.ts`: evidence and cleanup assume an owned worktree. A read-only task needs a separate path through closure.
- `src/cli/main.ts`: create-task prints a folder path. It does not attach the existing chat to task memory.
- Task templates route via relative links from a task directory. Root-project chats need explicit selection and reading of these files.
- Four existing skill names do not meet the requested two-word convention. No deep-resume or deep-save skill exists.
- Aftershock's recorded source policy prohibits another editable worktree. Read-only memory tasks must work without weakening that policy.

## Discovery review

Two bounded read-only discovery packets used `gpt-5.6-terra`, medium reasoning: task/source/closure coupling and project entry/skills/resolution. The coordinator reviewed their source references and prepared the plan. Usage/cost: unavailable.

The plan does not adopt two suggestions from discovery: removing worktree support entirely would exclude the requested isolated-write workflow, and retaining legacy skill wrappers would violate the user's universal naming convention. Existing CLI commands remain compatible; old skill references receive migration guidance.

## Evidence limits

The current-chat ID probe passed; no new Codex chat, worktree, skill installation, or runtime lifecycle was created. The existing 26-test gate is DC-07 historical evidence, not proof of this plan. Fresh desktop start, restart, separate chats, title change, missing-ID fallback, and task resumption remain implementation acceptance gates.

## Durable routes

Design: `doc/decisions/DEC-DC-001-chat-task-binding.md`.
Requirements: `REQ-DC-026` through `REQ-DC-031`.
Implementation: `docs/plan/DC-08-CHAT-TASK-PLAN.md`.
Backlog: `doc/backlog/SHELF-0012-desktop-task-entry.md`.

## Documentation verification

The installed cache CLI `0.1.0+codex.20260923030551` ran `rebuild-indexes --project /Users/drewmiller/Developer/Deep Context/deep-context` and `validate` for the same project: both passed on 2026-09-22. Generated decision/report/Shelf/requirement indexes include all DC-08 artifacts. TASKS.md and STATUS.json both use ledger revision `deep-context-state-7`.

The source implementation aggregate SHA-256 remains `11e01ce2db028fd2adfdaeb28d74ac5b9961f3f7667a5d8d80f15c7d71631552`, matching the DC-07 checkpoint. No build or runtime tests were rerun because this delivery changes only the unversioned context documentation. This structural check does not prove the proposed chat lifecycle works.
