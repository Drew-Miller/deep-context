---
id: REQ-DC-038
title: Distribute reusable behavior through the plugin repository
status: implemented-pending-desktop-verification
feature: bootstrap
origin: confirmed
source: doc/decisions/DEC-DC-002-repository-memory-and-plugin-scope.md
---

# Distribute reusable behavior through the plugin repository

The plugin Git repository carries the three skills and its marketplace catalog. A user can add the repository as a Codex plugin marketplace after the contents are pushed. Local edits and Git pushes alone do not refresh an installed snapshot; the marketplace and plugin must be refreshed, and a new task must load the updated package. Project context contains no installed reusable agent or skill.

DC-10 packaging acceptance: the catalog keeps `deep-context-repo` and points to `./plugins/deep-context`. That directory contains only the manifest, three public skills, launcher, bundled CLI, and templates. The bundle is committed and works with Node.js 20+ without dependency installation or source checkout access. Package checks reject unexpected contents, symlinks, dependencies, environments, Git metadata, context, and machine state. Temporary-copy verification covers help, repeated initialization preserving authored context, task checkpoint recovery, and validation. Desktop installation remains a separate user gate.
