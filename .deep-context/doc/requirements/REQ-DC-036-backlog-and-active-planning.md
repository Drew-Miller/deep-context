---
id: REQ-DC-036
title: Plan with Backlog pitches and accepted Active objectives
status: implemented
feature: routing
origin: confirmed
source: doc/decisions/DEC-DC-002-repository-memory-and-plugin-scope.md
supersedes: REQ-DC-007
---

# Plan with Backlog pitches and accepted Active objectives

Each Backlog record has a stable ID, title, elevator pitch, status, affected features, provenance, and related or conflicting work. Generated BACKLOG.md exposes pitches and statuses. Active records identify accepted objectives, affected features, originating Backlog items, and executing tasks; ACTIVE.md is generated from them. Activation preserves proposal and status history. At planning and material scope changes, compare relevant Backlog and Active intent. Opposing active intent blocks activation until an accepted decision explicitly resolves both work IDs. Capturing a proposal never authorizes implementation.

Multi-file activation changes use a local recovery journal. Recovery verifies before/after contents and refuses to overwrite intervening edits; validation reports unfinished operations.
