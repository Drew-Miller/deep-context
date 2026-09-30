---
id: REQ-DC-030
title: Discover project context from the project entry point
status: superseded
superseded_by: REQ-DC-032
feature: bootstrap
origin: confirmed
source: docs/reports/dc-08-discovery.md
---

# Discover project context from the project entry point

The project's agent instructions provide a route from a fresh root-project chat to shared context and its selected task. New projects support contained context while explicit external context homes remain supported. Import must not recursively ingest its own context, and existing source harness authority must be preserved.

Implementation: .local/archives/compact-layout-2026-09-25/original/docs/plan/DC-08-CHAT-TASK-PLAN.md. Deterministic fixture and packaging evidence, remaining desktop acceptance gates, and recovery limits: docs/reports/dc-08-implementation.md. Automated checks do not establish actual desktop restart behavior.

Superseded by REQ-DC-032 for the primary-checkout `.deep-context/` layout. The earlier external-home default remains historical context.
