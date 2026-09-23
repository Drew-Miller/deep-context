---
id: REPORT-DC-HANDOFF-COVERAGE
title: Bootstrap handoff coverage
status: historical
features: [bootstrap, routing, tasks, closure]
---

# Bootstrap Handoff Coverage

## Architectural invariants

| Handoff invariant | Durable destination |
|---|---|
| A: fresh task chat discovers how to work | `REQ-DC-002`, `REQ-DC-010`, task templates |
| B: normal tasks avoid full project context | `REQ-DC-003`, routing feature |
| C: dependency graphs do not explode | `REQ-DC-005` |
| D: durable knowledge survives task deletion | `REQ-DC-001`, `REQ-DC-004` |
| E: task folders and worktrees are transient | architecture and task contracts |
| F: Project Context is explicitly expensive | `REQ-DC-011` |
| G: closure includes drift and reconciliation | `REQ-DC-012`, closure feature |
| H: feature registry is lightweight | `REQ-DC-013`, routing contracts |
| I: files remain human-readable | `REQ-DC-014` |
| J: plugin is automation, not project truth | `REQ-DC-014`, architecture |
| K: Shelf is visible but non-binding | `REQ-DC-007` |
| L: requirements are atomic with stable IDs | `REQ-DC-006` |

## V1 acceptance coverage

| Acceptance group | Durable destination | Verification |
|---|---|---|
| Setup and initialization | `REQ-DC-002`, `REQ-DC-008`, `REQ-DC-016`; bootstrap contracts | setup/init integration and shadow import |
| Features and bounded dependencies | `REQ-DC-003`, `REQ-DC-005`; routing feature | generated feature index and schema validation |
| Atomic requirements | `REQ-DC-006`, `REQ-DC-013` | requirement files and deterministic index |
| Shelf lifecycle | `REQ-DC-007`; Shelf records | generated Shelf index |
| Task creation and fresh-chat recovery | `REQ-DC-009`, `REQ-DC-010`; task contracts | worktree/checkpoint integration test |
| Project Context | `REQ-DC-011`; Project Context agent template | agent-mediated acceptance remains required |
| Closure and Drift Chamber | `REQ-DC-004`, `REQ-DC-012`; closure contracts | pending-review refusal integration test |
| Durability after deletion | `REQ-DC-001`, `REQ-DC-004`, `REQ-DC-014`, `REQ-DC-025` | DC-07 integration fixture checkpoints a task, promotes a decision, finalizes, and rediscovers it through generated routing |

## Design section routing

- Handoff sections 1–7: architecture, `REQ-DC-001` through `REQ-DC-003`, bootstrap feature.
- Sections 8–14B: routing feature, `REQ-DC-005` through `REQ-DC-007`.
- Sections 15–20: task feature, `REQ-DC-009` and `REQ-DC-010`.
- Sections 21–27: closure feature, `REQ-DC-011` and `REQ-DC-012`.
- Sections 28–37: durable/transient architecture and `REQ-DC-004`, `REQ-DC-014`.
- Sections 38–47: CLI contracts, source provenance, and tests recorded in planning documents.
- Sections 48–51: delivery ledger, acceptance mapping above, and explicit non-goals retained in `docs/plan/REQUIREMENTS.md`.

The original handoff can be removed after indexes and project validation pass because its accepted invariants, v1 acceptance groups, future commands, and architecture are represented by canonical destinations above. Historical prose examples are not authoritative project truth.

This report records the original bootstrap coverage decision. The retired handoff body is no longer available for an independent word-for-word comparison; current acceptance claims concern the canonical requirements and recovery tests, not reconstruction of that deleted body.
