---
id: SHELF-0012
title: Desktop chat entry with separate task and chat memory
status: active
type: enhancement
features:
  - bootstrap
  - tasks
  - routing
  - closure
tokens:
  - desktop
  - chat
  - identity
  - resume
  - skills
consideration: light
source: doc/reports/DC-08-DISCOVERY.md
pitch: Keep task identity independent of chat identity so a later desktop chat can resume the same work without merging unrelated memory.
status_history:
  - from: implemented-pending-desktop-verification
    to: active
    reason: Shelf-to-Backlog terminology migration
provenance: doc/reports/DC-08-DISCOVERY.md
related: []
conflicts: []
---

# Desktop task entry

Promoted into requirements REQ-DC-026 through REQ-DC-031 and implemented in DC-08. The user's flow is preserved: new desktop Project chat, deep-start plus request, generated name, independent task memory, and deep-resume for later chats. Fixture and packaging gates are separate from pending live desktop acceptance; see doc/reports/DC-08-IMPLEMENTATION.md.

Design: doc/decisions/DEC-DC-001-chat-task-binding.md.
Plan: docs/plan/DC-08-CHAT-TASK-PLAN.md.

DC-09 retains separate task/chat memory but supersedes deep-start and deep-resume with the single deep-task entry. Live desktop acceptance remains open.
