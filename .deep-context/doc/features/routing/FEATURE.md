---
name: routing
description: Canonical context schemas, generated indexes, validation, and bounded progressive disclosure.
status: active
owns:
  - src/frontmatter/**
  - src/indexing/**
  - src/validation/**
tokens:
  - index
  - feature
  - requirement
  - backlog
  - active
  - validate
contracts:
  - doc/features/routing/CONTRACTS.md
depends_on:
  bootstrap: contract
origin: confirmed
---

# Routing

Makes the context tree cheap to discover and safe to expand on demand.
