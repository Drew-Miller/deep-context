---
id: REQ-DC-042
title: Preserve a chat's task association independently of ownership
status: implemented-pending-desktop-verification
feature: tasks
origin: confirmed
source: doc/decisions/DEC-DC-004-durable-chat-task-continuation.md
code_patterns: [src/tasks/memory.ts]
---

# Permanent chat association

Each chat remains associated with its original durable task after release, takeover or closure. Resolving that association restores context without granting writer ownership. The same chat cannot silently create or resume a different task. A fresh chat can resume a released task; taking over an owned task requires explicit confirmation and invalidates the former writer. Historical conflicting associations are readable only by explicit task selection and cannot authorize mutation.
