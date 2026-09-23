---
id: REQ-DC-013
title: Rebuildable validated indexes
status: active
feature: routing
origin: confirmed
source: doc/reports/HANDOFF-COVERAGE.md#v1-acceptance-coverage
code_patterns:
  - src/indexing/**
  - src/validation/**
---

# Rebuildable validated indexes

Deleting and rebuilding generated indexes must lose no knowledge; validation detects stale indexes, malformed metadata, duplicate IDs, and escaping references.
