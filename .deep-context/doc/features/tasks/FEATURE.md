---
name: tasks
description: Independent task and chat memory, optional source checkouts, manifests, and guarded recovery.
status: active
owns:
  - src/tasks/**
tokens:
  - task
  - worktree
  - checkpoint
  - manifest
contracts:
  - doc/features/tasks/CONTRACTS.md
depends_on:
  routing: contract
origin: confirmed
---

# Tasks

Creates disposable execution environments whose files are sufficient for a fresh agent to resume safely.

## Desktop entry implementation

DC-08 separates task memory from source checkout ownership and adds explicit chat associations. Requirements REQ-DC-026 through REQ-DC-031 have implementation and fixture coverage; actual desktop lifecycle acceptance remains open. Read doc/reports/DC-08-IMPLEMENTATION.md for evidence and limits. The task contracts distinguish memory-first skills from legacy worktree CLI behavior.
