---
id: REQ-DC-047
title: Save bounded task checkpoints across related files
status: active
feature: tasks
origin: confirmed
source: docs/decisions/DEC-DC-005-task-first-guide-and-sessionstart.md
---

# Save bounded task checkpoints across related files

Task state keeps the current phase, pending work, blockers, evidence, and exact next action short. At meaningful milestones, a guarded save can update task context, plan, manifest, worklog, state, and current chat note as one recoverable operation. Ownership and expected revision guard shared writes; stale or interrupted saves fail visibly. Unchanged checkpoints do not create redundant revisions.
