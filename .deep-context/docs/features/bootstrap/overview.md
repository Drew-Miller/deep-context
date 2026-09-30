---
name: bootstrap
description: Machine setup, project creation, repository inventory, provenance, and self-describing context trees.
status: active
owns:
  - src/config/**
  - src/importing/**
  - src/projects/**
tokens:
  - setup
  - init
  - import
  - provenance
contracts:
  - docs/features/bootstrap/contracts.md
depends_on: {}
origin: confirmed
---

# Bootstrap

Creates a recoverable project context without inventing facts and imports existing repository evidence without changing the source.
