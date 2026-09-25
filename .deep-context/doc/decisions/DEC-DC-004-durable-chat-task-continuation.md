---
id: DEC-DC-004
title: Durable task association across desktop chats
status: accepted
features: [tasks, routing]
source: user-approved DC-12 task-continuation plan
---

# Durable task association across desktop chats

An ordinary project chat stays unbound until `deep-task` is invoked. One chat belongs to one durable task, including after its writer binding is released or the task closes. A task can have successive chats, but only one writer. An existing owner's transfer needs explicit takeover confirmation. Archiving or deleting a desktop chat does not close or release the task; a later chat recovers the last saved checkpoint.

Project `AGENTS.md` routing and the plugin skill restore selected context on startup and after compaction. This is agent behavior, not a lifecycle hook or guaranteed save at interruption. Task attachment does not change the working directory or grant source-edit permissions. No plugin installation, commit or publication is part of DC-12.

DEC-DC-005 supersedes only the no-lifecycle-hook choice for future work. DEC-DC-004 remains authoritative for chat association, ownership, takeover, and the fact that unsaved work cannot be recovered.
