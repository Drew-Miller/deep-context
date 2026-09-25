---
id: BACKLOG-8361BE16-1B83-4A19-801A-B41F5FF02F69
title: Make project context entry deterministic across runtimes
pitch: Give Codex and Claude one explicit startup route with the exact
  .deep-context project root, one plugin runtime selection rule, and clear
  canonical authority; test that each fresh chat follows it.
status: proposed
features:
  - routing
tokens: []
provenance: User request 2026-09-24; Aftershock context follow-up and Deep
  Context self-project discussion
related:
  - BACKLOG-62EF8C0D-EB9F-4F85-8B3C-1702D3D94ECD
  - BACKLOG-CFEA23AF-A275-407B-88DE-B497D984D2B7
  - BACKLOG-D1DE2B15-BF79-4171-9A05-990B1C052AA8
  - BACKLOG-B67B98B1-4C75-4891-95C6-571B904E4E1E
conflicts: []
status_history: []
---

# Make project context entry deterministic across runtimes

Give Codex and Claude one explicit startup route with the exact .deep-context project root, one plugin runtime selection rule, and clear canonical authority; test that each fresh chat follows it.

## Observed gap

Aftershock's root `CLAUDE.md` already points to `AGENTS.md` and `.deep-context/`, but no Claude session was tested. The fresh Codex task first passed the repository root rather than the `.deep-context` context root to `resolve-task`. Aftershock's nested routing file also contains a temporary repo-bundled plugin pin alongside managed installed-plugin wording. This repository has only a nested `.deep-context/CLAUDE.md`, with no root Claude entry file.

DC-13 is already an accepted plan for task binding and a bounded `SessionStart` route (`docs/plan/DC-13-TASK-CONTEXT-GUIDE.md`). This proposal covers the project entry path, runtime selection, and Claude/Codex consistency around that task route; it must not recreate DC-13's task plan.

## Proposed work

- State one exact startup and recovery route for each supported runtime: source instructions, context root, task resolution, compact current state, indexes, then selected canonical bodies.
- Select one explicit runtime-bundle rule per project and make failure behavior clear. Preserve source-repository instruction and ownership priority.
- Test fresh Codex and Claude entries, including unbound and bound chats, without treating indirect links or claimed reads as proof of use.

## Done when

- A fresh task in each supported runtime resolves the correct context root on its first attempt, follows the declared authority, and has no contradictory plugin selection instruction.

Status: proposed. Capturing this item does not authorize implementation.
