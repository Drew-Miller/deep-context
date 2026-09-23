---
id: REQ-DC-021
title: Discover decisions and reports selectively
status: active
feature: routing
origin: confirmed
source: doc/reports/ASTRA-AUDIT-2026-09-22.md
code_patterns: [src/indexing/**, src/routing/**]
---

# Discover decisions and reports

Generated indexes route agents to durable decisions and reports. Deep feature context includes associated records without loading unrelated project history. Canonical decisions require valid metadata.
