---
name: deep-init
description: Initialize or refresh a repository's .deep-context project storage, or migrate a legacy external Deep Context home without inventing source authority.
---

# Initialize Deep Context

Run the bundled CLI resolved relative to this `SKILL.md`: `node <plugin-root>/bin/deep-context.cjs`, where the plugin root is two directories above this skill. Do not assume the binary is on `PATH`.

For a repository, use `init --repo <repository-path>`; the CLI resolves its primary Git checkout and creates or refreshes `<primary-repository>/.deep-context/`. Worktree chats share that root. If an external Deep Context home already exists, inspect its tasks, locks, and source identity, then use `migrate-project <old-context-path> --repo <repository-path>`. Migration copies and validates first, leaves a dated backup beside the old home, and replaces the old entry with a redirect only after validation. Do not use `init` to overwrite an existing conflicting destination. For an empty project, use `init --empty --name <name>`.

The repository's own `AGENTS.md`, source ownership rules, and live schedules remain authoritative. Initialization installs a marker-delimited root startup route while preserving unrelated instructions. Durable documents and generated indexes may be Git tracked; `tasks/`, `.local/`, and `repo` are ignored. It does not stage or commit. Read routing files and source inventory before promoting confirmed knowledge. Preserve uncertainty as inferred context or Backlog intent.

Finish by rebuilding indexes and validating the selected project. Do not create a task merely because the user asks a project-level question.
