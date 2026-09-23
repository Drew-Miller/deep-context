---
id: REQ-DC-033
title: Track durable documents while keeping execution memory local
status: implemented
feature: bootstrap
origin: confirmed
source: doc/decisions/DEC-DC-002-repository-memory-and-plugin-scope.md
---

# Track durable documents while keeping execution memory local

Canonical project documents and generated indexes are eligible for Git tracking. Ignore `tasks/`, `.local/`, the generated `repo` symlink, and owned checkouts. Initialization installs routing but never stages or commits. Source inventory and source fingerprints exclude context storage; context validation checks it separately.
