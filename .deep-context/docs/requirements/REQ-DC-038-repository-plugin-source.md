---
id: REQ-DC-038
title: Distribute reusable behavior through the plugin repository
status: implemented-pending-desktop-verification
feature: bootstrap
origin: confirmed
source: docs/decisions/DEC-DC-002-repository-memory-and-plugin-scope.md
amended_by: DEC-DC-007
---

# Distribute reusable behavior through the plugin repository

The plugin Git repository carries the three core workflow skills, focused utility skills, and its marketplace catalog. A user can add the repository as a Codex plugin marketplace after the contents are pushed. Local edits and Git pushes alone do not refresh an installed snapshot; the marketplace and plugin must be refreshed, and a new task must load the updated package. Project context contains no installed reusable agent or skill.

DC-10 historical packaging acceptance: the catalog kept `deep-context-repo` and pointed to `./plugins/deep-context`. At that milestone the package contained the manifest, three public skills, launcher, bundled CLI, and templates. The bundle worked with Node.js 20+ without dependency installation or source checkout access. Package checks rejected unexpected contents, symlinks, dependencies, environments, Git metadata, context, and machine state. Temporary-copy verification covered help, repeated initialization preserving authored context, task checkpoint recovery, and validation. Desktop installation remains a separate user gate. DC-11 and DC-15 added plugin-scoped utilities under the same exact allowlist boundary.
