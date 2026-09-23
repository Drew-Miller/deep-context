# deep-context Context Map

## Read route

`AGENTS.md` → this map → task manifest when applicable → lightweight indexes → selected canonical frontmatter → selected bodies.

## Tree

| Path | Role | Authority |
|---|---|---|
| `PROJECT.md` | Project identity and durable overview | Canonical |
| `doc/ARCHITECTURE.md` | System boundaries and invariants | Canonical |
| `doc/features/*/FEATURE.md` | Feature context and ownership | Canonical |
| `doc/features/*/CONTRACTS.md` | Boundary contracts | Canonical |
| `doc/requirements/*.md` | Atomic accepted requirements | Canonical |
| `doc/backlog/*.md` | Durable proposals, pitches, and status history | Canonical |
| `doc/active/*.md` | Accepted objectives and executing tasks | Canonical |
| `doc/decisions/*.md` | Durable decisions | Canonical |
| `doc/sources/*.md` | Import provenance and dispositions | Canonical |
| `doc/FEATURES.md`, `REQUIREMENTS.md`, `BACKLOG.md`, `ACTIVE.md`, `DECISIONS.md`, `REPORTS.md`, `SOURCES.md` | Cheap routing indexes | Generated |
| `tasks/*` | Active transient execution state | Transient until promoted |
| `.local/state.json` | Resolver and schema state only | Machine-readable, never unique knowledge |
| `docs/plan/DC-08-CHAT-TASK-PLAN.md` | Desktop chat/task implementation plan | Implemented; live desktop gate remains |
| `tasks/*/chats/*/MEMORY.md` | Per-chat notes and canonical binding history | Active task memory |
| `doc/reports/closures/*.md` | Concise durable closure conclusions | Canonical |
| `.local/archives/*` | Raw closed task and chat memory | Local archive |
| `.local/chat-index.json` | Reverse chat association index | Rebuildable from canonical files |
| `.local/context-operations/*.json` | Recoverable Backlog writes | Local journal |

## Context levels

- `none`: do not load.
- `contract`: load only the feature boundary contract and selected requirements.
- `feature`: load the feature definition plus relevant contracts and requirements.
- `deep`: add decisions and reports associated with the selected feature without loading unrelated history.

Dependencies do not recursively inherit context levels.

## Loss prevention

Indexes can be deleted and rebuilt from canonical files. Closure must classify and promote durable task discoveries before finalization. If classification is uncertain, preserve the information as a Backlog item or unresolved closure finding.

## Planning route

For current desktop task work, select DEC-DC-002, REQ-DC-032 through REQ-DC-038, and REPORT-DC-09-IMPLEMENTATION through the lightweight indexes. DEC-DC-001 and DC-08 are historical for superseded layout and skill entry. `docs/plan/TASKS.md` and matching `STATUS.json` remain the live schedule.


## In-repository storage

`tasks/` and `.local/` are local-only. All Git worktrees resolve this primary checkout's context. Raw closed memory is retained in `.local/archives/`; concise closure conclusions belong in `doc/reports/closures/*.md`. Rebuild generated indexes from canonical documents.
