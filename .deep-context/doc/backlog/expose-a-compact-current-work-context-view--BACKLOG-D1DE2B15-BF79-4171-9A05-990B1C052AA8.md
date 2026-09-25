---
id: BACKLOG-D1DE2B15-BF79-4171-9A05-990B1C052AA8
title: Expose a compact current-work context view
pitch: Provide a deterministic small view of the live task_state revision,
  active work, blockers, and next action so agents need not read the full status
  JSON or infer schedule from historical prose.
status: proposed
features:
  - routing
tokens: []
provenance: User request 2026-09-24; Aftershock context follow-up and Deep
  Context self-project discussion
related:
  - BACKLOG-62EF8C0D-EB9F-4F85-8B3C-1702D3D94ECD
  - BACKLOG-8361BE16-1B83-4A19-801A-B41F5FF02F69
  - BACKLOG-B67B98B1-4C75-4891-95C6-571B904E4E1E
conflicts: []
status_history: []
---

# Expose a compact current-work context view

Provide a deterministic small view of the live task_state revision, active work, blockers, and next action so agents need not read the full status JSON or infer schedule from historical prose.

## Observed gap

Aftershock's live `docs/plan/STATUS.json` is over 800 lines. A fresh task attempted to read it broadly even though only `ledger_revision` and `task_state` govern application scheduling. Deep Context's own self-ledger uses a different top-level status shape, so the view must follow each project's declared schedule rather than assume one JSON schema.

DC-13 already plans compact state for an individual Deep Task. This proposal is for the project's separately declared live work schedule and must not duplicate either task state or the source schedule.

## Proposed work

- Provide a small, deterministic current-work projection with source path and revision, objective, active work, blockers, verification gaps, and exact next safe action.
- Make the projection explicitly derived from the one live schedule; detect disagreement with a generated human ledger where one exists.
- Route startup and current-work questions to this view, then permit focused reads of the underlying state and evidence as needed.

## Done when

- Fresh agents answer current-work questions accurately without defaulting to a full status-file read or obsolete scheduling prose; the view never becomes a second editable schedule.

Status: proposed. Capturing this item does not authorize implementation.
