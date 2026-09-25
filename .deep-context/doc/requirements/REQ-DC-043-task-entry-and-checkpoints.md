---
id: REQ-DC-043
title: Enter and recover task work through a project chat
status: implemented-pending-desktop-verification
feature: routing
origin: confirmed
source: doc/decisions/DEC-DC-004-durable-chat-task-continuation.md
code_patterns: [src/cli/main.ts, src/config/index.ts]
---

# Task entry and checkpoints

An explicit `deep-task` invocation in an unbound project chat offers creation or open-task selection. Explicit new work can atomically save a relevant initial conversation summary. Startup routing distinguishes a genuinely unbound chat from an error and loads only the selected task and relevant predecessor notes. The agent saves meaningful progress and a next action at milestones and before ending work turns; repeated unchanged checkpoints do not advance the revision. A prepared handoff saves and releases ownership. Chat deletion or interruption can lose changes made after the last successful checkpoint.
