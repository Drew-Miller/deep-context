---
id: REQ-DC-034
title: Migrate external context without losing recoverability
status: implemented
feature: bootstrap
origin: confirmed
source: doc/decisions/DEC-DC-002-repository-memory-and-plugin-scope.md
---

# Migrate external context without losing recoverability

Preflight tasks, locks, and worktrees. Copy and validate before changing routing, retain canonical IDs and provenance, rewrite moved operational references, then keep a dated backup and redirect at the old entry path. Refuse a conflicting destination. Never move a live checkout with an ordinary directory move or erase a source branch.
