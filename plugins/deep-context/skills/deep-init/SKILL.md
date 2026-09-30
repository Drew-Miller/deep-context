---
name: deep-init
description: Initialize or refresh a repository's .deep-context project storage, or migrate a legacy external Deep Context home without inventing source authority.
---

# Initialize Deep Context

Run the bundled CLI resolved relative to this `SKILL.md`: `node <plugin-root>/bin/deep-context.cjs`, where the plugin root is two directories above this skill. Do not assume the binary is on `PATH`.

For a repository, use `init --repo <repository-path>`; the CLI resolves its primary Git checkout and creates or refreshes `<primary-repository>/.deep-context/`. Worktree chats share that root. If an external Deep Context home already exists, inspect its tasks, locks, and source identity, then use `migrate-project <old-context-path> --repo <repository-path>`. Migration copies and validates first, leaves a dated backup beside the old home, and replaces the old entry with a redirect only after validation. Do not use `init` to overwrite an existing conflicting destination. For an empty project, use `init --empty --name <name>`.

The repository's own `AGENTS.md`, source ownership rules, and live schedules remain authoritative. Initialization installs a marker-delimited root startup route while preserving unrelated instructions. Durable documents and generated indexes may be Git tracked; `tasks/` and `.local/` are ignored; compact contexts have no `repo` symlink. It does not stage or commit. Read routing files and source inventory before promoting confirmed knowledge. Preserve uncertainty as inferred context or a proposed work item.

Finish by rebuilding indexes and validating the selected project. Do not create a task merely because the user asks a project-level question.

For existing ID-only canonical filenames, run `migrate-filenames --project <project-root>` to preview exact moves and exceptions, then `migrate-filenames --apply` when the migration is requested. Compact filenames keep IDs and aliases in frontmatter and repair live references without forwarding files. Case-insensitive collisions use -2, -3 numeric suffixes under the project lock. Use `repair-filenames` for an interrupted migration; it refuses intervening edits. Source record IDs, authored interpretations, and task folders remain stable.

For a legacy in-place context, preview `migrate-layout --project <root>` and apply with `--apply` when migration is requested. Review conflicts first. Original bytes, hashes and a path map are retained under .local/archives; interrupted operations require `repair-layout --project <root>`. Compact and manually migrated contexts are recognized without recreating doc/, docs/plan/, START_HERE.md or a repo symlink. Historical archives are not live routing authority.
