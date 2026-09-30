# Deep Context project instructions

Read CONTEXT_MAP.md, PROJECT.md and work/INDEX.md, then only relevant canonical documents. Follow the repository-root AGENTS.md for source rules; do not reread it via a symlink.

This context was manually migrated to the accepted compact layout. The bundled CLI now detects and operates on this layout. Use `resolve-task --project <this root> --allow-unbound --json` with the runtime chat ID when available, then follow `requiredReads`; never guess the newest task or acquire ownership implicitly. Preserve owner IDs and revisions. An unbound chat stays at project scope. Product adoption evidence is in work/items/adopt-compact-context-layout.md; installed desktop discovery is a separate open gate.

Canonical work state is work/items/*.md; work/INDEX.md is a derived view. A planned objective is not active execution. Accepted requirements and decisions outrank task plans and proposed work. One objective has one work record; task plans, handoffs and progress belong in tasks/. Retain concise outcomes on work items and only substantial lasting reports in docs/reports/.

After changing canonical content, run the bundled CLI's `rebuild-indexes` and `validate` commands, and check frontmatter, IDs/aliases, links, order and task bindings. Historical reports and archives may mention old paths: use .local/archives/compact-layout-2026-09-25/path-map.json and the original snapshot to interpret them. Historical snapshots and journals must not be rewritten. Source code lives in the parent checkout; sources/records/*.md retain authored provenance and source-relative paths.

Local transition utilities are retained under `.local/archives/compact-layout-2026-09-25/` as historical migration evidence. The bundled CLI owns current indexes and validation. Use the original snapshot and its manifest to verify pre-migration evidence.

No task ownership was transferred by this migration. A task’s source/closure hashes captured before migration are historical until its owner performs a new compatible review.

<!-- deep-context:task-routing:start -->

## Task association and recovery

On startup and recovery after compaction, resolve this chat with the installed plugin's bundled CLI: resolve-task --project <this context root> --allow-unbound --json, using CODEX_THREAD_ID when available. Locate the CLI relative to the installed deep-task SKILL.md; do not assume PATH or persist a plugin cache path. If the plugin cannot be located, report the missing capability rather than claiming task restoration.

Follow returned requiredReads, then selected manifest context. A successful unbound result stays at project scope until the user invokes deep-task. Errors are not unbound results. Without runtime identity, use the explicit task path and binding ID and disclose that automatic chat lookup is unavailable. Never select the newest task.

One chat belongs to one task even after release or closure. A released association restores context without acquiring ownership. Before source edits or shared task writes, resolve ownership and current revision. A non-owner must explicitly resume; another owner requires confirmed takeover. Closed tasks remain closed. Task attachment neither changes the source working directory nor grants source edit permission.

Checkpoint meaningful decisions, completed work and evidence, blockers, open questions, and exact next action at milestones and before ending work turns; skip unchanged checkpoints. Use save-task with owner identity and expected revision; optional --checkpoint-file supplies completedWork, decisions, blockers, openQuestions and nextAction as strings. Preserve existing relevant findings when updating sections. Report failed saves. Read work/INDEX.md at scope changes and load only relevant bodies.

For an explicit fresh-chat handoff, checkpoint and release ownership, then give a resume prompt with the task UUID and project path. Desktop archive/delete does not release ownership or close task memory. A replacement chat may take over after confirmation and recover from the last saved checkpoint. Automatic care is agent behavior, not a lifecycle hook; interruption can lose unsaved work.

<!-- deep-context:task-routing:end -->
