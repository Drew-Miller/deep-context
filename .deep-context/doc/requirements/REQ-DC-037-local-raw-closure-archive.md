---
id: REQ-DC-037
title: Keep raw closure memory local and conclusions durable
status: implemented
feature: closure
origin: confirmed
source: doc/decisions/DEC-DC-002-repository-memory-and-plugin-scope.md
---

# Keep raw closure memory local and conclusions durable

Closure classifies every task note, promotes long-lived knowledge, and reconciles completed active work and Backlog status with delivered features and requirements. Raw task and chat records archive under `.local/archives/`; concise closure conclusions live in trackable reports. Finalization remains evidence-bound and never removes borrowed checkouts or source branches.
