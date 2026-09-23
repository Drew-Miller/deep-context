# Task Contracts

- Source edits occur only at the explicitly attached isolated or existing execution path, subject to its source harness. Memory creation alone does not authorize source edits.
- `TASK_STATE.md` records evidence, decisions, blockers, questions, and the exact next safe action.
- Checkpoints preserve authored content instead of reconstructing it from chat memory.
- Worktree reuse requires matching recorded task, branch, and path identity.

- Memory tasks use immutable UUIDs and optional source bindings. Legacy create-task retains its worktree behavior; explicit resume migrates old task metadata without replacing bodies or paths.
- Each chat has canonical notes under chats/<binding-uuid>/MEMORY.md. Titles never establish identity. Returned read routes include predecessor notes after ownership transfer.
- Shared-state changes require owner identity, expected revision, and a project lock. Task creation, transfer and save use recoverable write journals; repair refuses intervening changes.
- Explicit handoff saves release ownership. Ordinary checkpoints retain it. A different owner requires explicit takeover; an unbound chat never inherits the latest task.
- Source fingerprints exclude the exact context subtree and retain existing blockers when source-dependent findings need revalidation.
- The agent restores a known chat association on startup and checkpoints useful discoveries, decisions, blockers, evidence, changed objectives, and the next action before long operations or handoff.
- A new unbound chat remains at project scope until deep-task creates or explicitly selects memory. Skills and reusable agent behavior come from the installed plugin, not project copies.
