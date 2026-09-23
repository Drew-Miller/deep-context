---
id: REQ-DC-025
title: Verify recovery and durable knowledge after cleanup
status: active
feature: closure
origin: confirmed
source: doc/reports/ASTRA-AUDIT-2026-09-22.md
code_patterns: [tests/tasks.test.ts]
---

# Prove deletion recovery

An acceptance fixture resumes from task checkpoint files, promotes a discovery, finalizes cleanup, and rediscovers the promoted fact through generated indexes and bounded context routing.
