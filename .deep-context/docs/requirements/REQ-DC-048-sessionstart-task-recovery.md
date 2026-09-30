---
id: REQ-DC-048
title: Restore task pointers at startup and after compaction
status: active
feature: bootstrap
origin: confirmed
source: docs/decisions/DEC-DC-005-task-first-guide-and-sessionstart.md
---

# Restore task pointers at startup and after compaction

A trusted, packaged `SessionStart` hook resolves a known chat association for startup, resume, clear, and compact events and returns only task identity, ownership/state, and compact reading pointers. It does not choose a task for an unbound chat, read full history, write memory, or acquire ownership. Project instructions and the `deep-task` skill provide the recovery fallback when the hook is unavailable or fails. Real desktop verification is required before claiming hook coverage.
