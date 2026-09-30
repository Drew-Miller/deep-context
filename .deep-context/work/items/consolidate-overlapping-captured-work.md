---
id: BACKLOG-1307E6D5-F01B-4B33-8DC5-4C55B2125BD5
title: Consolidate overlapping captured work
pitch: When new future work is captured, compare it with existing Backlog and
  Active objectives, merge compatible scope into an existing item when
  appropriate without losing either idea or creating duplicate work.
status: proposed
features:
  - routing
  - tasks
tokens: []
provenance: "User request 2026-09-24: review new todo ideas against existing
  work before creating another ticket; button color and size/border example"
related:
  - BACKLOG-94DC3104-AFE4-4AA5-9181-CAF5A85D742A
conflicts: []
status_history: []
order: 8
---

# Consolidate overlapping captured work

When new future work is captured, compare it with existing Backlog and Active objectives and merge compatible scope into an existing item when appropriate.

## Proposed behavior

- Before creating a future-work record, the agent reviews the lightweight Backlog and Active indexes, then reads only plausible matching records. It classifies the new idea as an addition to existing scope, a distinct but related item, a conflict, or a new item. Compare desired outcome, affected feature, dependencies, ownership, and acceptance criteria rather than matching keywords alone.
- For compatible overlap, update the existing canonical item and preserve both ideas' provenance and concrete acceptance details. For example, button color and button size/border changes may become one button-styling item if they share the same outcome and implementation window. Do not merge unrelated work merely because it touches the same component.
- Keep stable IDs and references. If two existing records are consolidated, retain a discoverable forwarding or superseded record and update links and generated indexes safely. Do not silently change an accepted active objective or another chat's task scope; surface material scope changes for approval and honor task ownership.
- The normal path is agent-mediated capture followed by CLI index refresh and validation. Direct CLI use remains available, with clear guidance on its review limits. Coordinate this item with the existing natural-language capture proposal rather than implementing two competing capture flows.

## Done when

- A new overlapping idea is added to the appropriate existing item without losing either idea or creating a duplicate ticket. A genuinely distinct idea remains separate and linked.
- A fresh agent can recover the chosen structure and provenance from generated indexes and canonical records.

Status: proposed. Capturing this proposal does not authorize implementation.
