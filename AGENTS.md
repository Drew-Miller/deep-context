<!-- deep-context:start -->

## Deep Context

This machine uses Deep Context for filesystem-backed project memory. Inside an initialized Deep Context project or task, follow the nearest AGENTS.md and CONTEXT_MAP.md. Load lightweight indexes first and canonical document bodies only when relevant. Record durable conclusions in project files before ending work; never rely on chat history as the only copy.

Project context is ".deep-context/" in the primary repository checkout; Git worktrees share it. Read its AGENTS.md and CONTEXT_MAP.md. On startup and recovery after compaction, use the bundled Deep Context CLI to resolve-task --allow-unbound --json with the current CODEX_THREAD_ID when available, then follow requiredReads for an existing binding. An unbound chat stays at project scope until the user invokes deep-task. One chat belongs to one task even after release or closure. Before source edits or shared task writes, refresh ownership and state; a non-owner must explicitly resume, with confirmed takeover if another chat owns the task. Checkpoint meaningful progress before ending work turns. Source repository instructions retain their authority.

<!-- deep-context:end -->
