---
id: REQ-DC-022
title: Keep repository attachment consistent
status: active
feature: bootstrap
origin: confirmed
source: doc/reports/ASTRA-AUDIT-2026-09-22.md
code_patterns: [src/projects/index.ts]
---

# Stable project identity

Reinitialization preserves the existing repository attachment and rejects conflicting source requests or `repo` links before writing project state.
