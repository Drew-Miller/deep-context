---
name: deep-context-init
description: Initialize a self-describing Deep Context project from an empty directory or an existing Git repository, then turn source evidence into selectively readable durable context without inventing authority.
---

# Initialize Deep Context

Use `deep-context init --empty --name <name>` or `deep-context init --repo <path> [--name <name>]` for deterministic scaffolding and provenance inventory.

For repository bootstrap:

1. Read the generated `AGENTS.md`, `CONTEXT_MAP.md`, `doc/SOURCES.md`, and source records first.
2. Respect the repository's own `AGENTS.md` and declared live schedules. Deep Context indexes do not supersede them.
3. Select relevant entry documents by provenance metadata before reading bodies. Do not recursively load the repository.
4. Write confirmed architecture, feature definitions, contracts, and atomic requirements to canonical files. Mark uncertain interpretation as `origin: inferred`; put unresolved future intent on the Shelf.
5. Give every relevant source record one explicit disposition: referenced/imported, excluded with reason, review-required, or missing. Never leave source evidence silently uncovered.
6. Rebuild indexes and run `deep-context validate --project <path>`.

Do not modify the attached source repository during a shadow import. Treat nonignored untracked files as working-tree evidence requiring review, not automatically accepted truth. Never read protected file bodies named by excluded source records.
