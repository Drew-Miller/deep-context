---
id: DEC-DC-001
title: Bind desktop chats to independent task memory
status: superseded
superseded_by: DEC-DC-002
features: [bootstrap, tasks, routing, closure]
source: doc/reports/DC-08-DISCOVERY.md
---

# Bind desktop chats to independent task memory

## Accepted design

A Codex Project provides the workspace. Shared canonical context belongs to a context root. A Deep Context task has an immutable UUID and its own memory folder. A chat has a separate runtime ID and is explicitly associated with a task by deep-start or deep-resume. Several successive chats may belong to one task; unrelated tasks never share working notes.

Use a generated descriptive task title and an immutable folder `<slug>--<uuid>`. Chat titles are optional captured labels, never lookup keys. Do not automatically rename the desktop chat; title synchronization is an explicit option. The stable ID survives either title changing.

Keep task-level state in TASK_STATE.md and per-chat memory in chats/<binding-id>/MEMORY.md. Store canonical association/history in each chat record; a machine reverse index is disposable. Only one chat owns updates to shared task state at a time. A resume from another chat performs an explicit ownership transfer rather than silently allowing concurrent checkpoint writers. Different tasks remain fully concurrent.

The initial execution mode is source inspection without source modification. Task memory can exist without Git or any source. Isolated source edits may attach a Deep Context-owned or existing desktop-owned worktree. Record ownership, source identity, and execution path separately from memory identity. Keep Aftershock's existing worktree prohibition. Never change a source checkout merely to create memory.

## Storage default

For new repository projects, use `<repo>/deep-context/` with the existing canonical tree inside it, plus a marker-delimited route in the repository's AGENTS.md. The subsequent implementation authorization adopted the documented default. An explicit context path also supports a sibling/common-parent workspace and existing external homes. Existing Aftershock and self-bootstrap storage remain unchanged.

A local context root may be unversioned by default using Git's local exclude file when initialization is explicitly requested. Source import excludes the exact attached context subtree to avoid importing generated memory back into itself. Generic directories merely named deep-context elsewhere must not be excluded.

## Compatibility and boundary

The new public skills are deep-setup, deep-init, deep-start, deep-resume, deep-save, and deep-close. Legacy CLI names remain; legacy skill directories are replaced, not kept as nonconforming aliases.

The user authorized implementation of DC-08 after discovery. Existing source ownership and closure preservation gates remain in force. Implementation and verification evidence: doc/reports/DC-08-IMPLEMENTATION.md; live desktop lifecycle acceptance is still distinct from automated tests.

## Consequences

Root-project chats become the primary user entry. Task folders remain directly resumable but do not have to become desktop Projects. A missing or unknown chat ID requires explicit task selection; title matching, choosing the newest task, and a project-global current-task file are prohibited shortcuts. Context remains recoverable if desktop metadata and reverse indexes disappear.

The full interfaces, source modes, migration rules, and acceptance gates are in `docs/plan/DC-08-CHAT-TASK-PLAN.md`.

## Supersession

DEC-DC-002 retains separate task/chat identity and source ownership, but replaces the storage default and six public skills. This record remains historical evidence, not current startup guidance.
