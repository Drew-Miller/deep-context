---
id: BACKLOG-94DC3104-AFE4-4AA5-9181-CAF5A85D742A
title: Classify natural-language add to Deep Context requests
pitch: When a user says add to Deep Context, let the agent capture each idea as
  a proposed requirement, active work, future backlog item, plan, decision, or
  evidence in the right place with explicit authority and no implicit
  implementation.
status: proposed
features:
  - routing
tokens: []
provenance: User request 2026-09-24; Aftershock context follow-up and Deep
  Context self-project discussion
related:
  - SHELF-0002
  - BACKLOG-62EF8C0D-EB9F-4F85-8B3C-1702D3D94ECD
  - BACKLOG-10F58B56-1C7C-4C7F-9CBD-EE7494DDC6DD
conflicts: []
status_history: []
order: 11
---

# Classify natural-language add to Deep Context requests

When a user says add to Deep Context, let the agent capture each idea as a proposed requirement, active work, future backlog item, plan, decision, or evidence in the right place with explicit authority and no implicit implementation.

## User intent

A user may raise several ideas while other agents are working and say `add to Deep Context`. The capture must preserve each distinct thought without forcing the user to know the storage taxonomy or interrupting current implementation.

DC-13 already plans task-first capture of accepted task requirements and later promotion of stable project facts. This proposal covers mixed, free-form ideas that may belong in several project-level categories before any one Deep Task is accepted.

## Proposed classification

- Accepted product behavior or invariant belongs in an atomic requirement or contract; a tentative requirement stays proposed in Backlog until accepted.
- Approved, executing objectives belong in Active and the live task ledger. Future ideas and unresolved choices belong in Backlog. A plan records an approach for accepted work, a decision records a resolved tradeoff, and a report records observed evidence.
- The agent should split mixed input into separate durable items, label each item and its authority, link related items, disclose ambiguity, and avoid silently activating or implementing captured ideas.
- Investigate an agent-facing convention and existing capture tooling first. A new standalone skill is not assumed necessary.
- Make natural-language, agent-mediated maintenance the normal user route: classify the requested change and its authority, update only the appropriate canonical record, invoke the bundled CLI to refresh generated views and validate, then report the changed record, validation outcome, and any unresolved ambiguity. Direct CLI commands remain an optional user path and should be discoverable; ordinary use should not require browsing or hand-editing `.deep-context/`.
- Distinguish this requested workflow from automatic editor-change watching. The agent's refresh step is observable command execution, and proposals must remain proposals until accepted. Coordinate the command/index integrity design with `BACKLOG-10F58B56-1C7C-4C7F-9CBD-EE7494DDC6DD`.

## Done when

- A multi-topic `add to Deep Context` request yields correctly separated, discoverable, validated records that a fresh session can retrieve; accepted requirements and active work are not created from an unapproved idea.
- The agent reports which canonical records changed, which refresh and validation commands ran, and which checks remain open. A direct CLI path is documented for users who choose it.

Status: proposed. Capturing this item does not authorize implementation.
