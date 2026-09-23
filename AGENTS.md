<!-- deep-context:start -->

## Deep Context

This machine uses Deep Context for filesystem-backed project memory. Inside an initialized Deep Context project or task, follow the nearest AGENTS.md and CONTEXT_MAP.md. Load lightweight indexes first and canonical document bodies only when relevant. Record durable conclusions in project files before ending work; never rely on chat history as the only copy.

Project context is ".deep-context/" in the primary repository checkout; Git worktrees share it. Read its AGENTS.md and CONTEXT_MAP.md. Use the bundled Deep Context CLI to resolve-task with the current CODEX_THREAD_ID when available, then follow requiredReads for an existing binding. An unbound chat stays at project scope until deep-task starts or resumes a task. Persist useful knowledge during work and before handoff. Source repository instructions retain their authority.

<!-- deep-context:end -->
