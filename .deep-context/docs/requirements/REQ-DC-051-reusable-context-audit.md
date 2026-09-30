---
id: REQ-DC-051
title: Audit initialized context with evidence and explicit coverage
status: implemented
feature: routing
origin: confirmed
source: work/items/dc-15-deep-audit.md
code_patterns: [plugins/deep-context/skills/deep-audit/**, tooling/check-package.mjs]
---

# Reusable Deep Audit

The plugin provides a project-agnostic `deep-audit` skill for initialized Deep Context projects. It inventories context entries without following symlinks or reading protected local bodies, discovers each project's declared authority and live schedule, validates structure, compares current and historical claims, and records review depth and inaccessible areas. Its dated report gives evidence, severity, practical impact, confidence, disposition, and an ordered proposed remediation queue. The audit compares documented project extensions with the standard template and can map source areas by responsibility without claiming dead code from filenames alone. Running the audit does not rewrite project knowledge, take task ownership, remove files, or accept unrun runtime gates.
