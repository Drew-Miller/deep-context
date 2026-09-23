---
id: REQ-DC-031
title: Use the deep-word public skill naming convention
status: superseded
superseded_by: REQ-DC-035
feature: tasks
origin: confirmed
source: doc/reports/DC-08-DISCOVERY.md
---

# Use the deep-word public skill naming convention

Expose deep-setup, deep-init, deep-start, deep-resume, deep-save and deep-close. Every public skill name has exactly two hyphen-separated words beginning with deep. Update installed discovery and references together; CLI command compatibility is independent of skill names.

Implementation: docs/plan/DC-08-CHAT-TASK-PLAN.md. Deterministic fixture and packaging evidence, remaining desktop acceptance gates, and recovery limits: doc/reports/DC-08-IMPLEMENTATION.md. Automated checks do not establish actual desktop restart behavior.

Superseded by REQ-DC-035. The two-word naming convention remains; the public set is now deep-init, deep-task, and deep-close.
