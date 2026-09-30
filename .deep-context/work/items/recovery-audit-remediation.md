---
id: DC-07
title: Recovery audit remediation
milestone: DC-07
verification:
  shelf:
    - SHELF-0003
    - SHELF-0004
    - SHELF-0005
    - SHELF-0006
    - SHELF-0007
    - SHELF-0008
    - SHELF-0009
    - SHELF-0010
    - SHELF-0011
status: done
prior_ledger_state: accepted
verification_scope: Historical implementation evidence; does not validate the compact-layout
  migration or new CLI compatibility.
---

# Recovery audit remediation

Migrated from the previous coordinator ledger.

## Prior milestone evidence (historical)

Scheduling prose here describes the prior checkpoint; current order and lifecycle come from this item’s frontmatter.

- Scope: promoted Shelf items `SHELF-0003` through `SHELF-0011` and `docs/reports/astra-audit-2026-09-22.md`.
- Accepted requirements: preserve authored provenance; enforce promotion before cleanup; fail closed on incomplete evidence; validate import coverage; route decisions and reports; preserve project identity; respect attached source instructions; route owned requirements; prove fresh recovery and durable deletion safety.
- Source: `/Users/drewmiller/Developer/deep-context`. Planning: this context project. Source checkpoint: `.local/archives/compact-layout-2026-09-25/original/docs/plan/checkpoints/DC-07-2026-09-22.sha256`.
- Dependency order: import/identity and coverage; routing; task startup; closure; integrated recovery fixture; packaging and reports.
- Evidence: `.local/archives/compact-layout-2026-09-25/original/docs/plan/reports/DC-07-INTEGRATION.md`; all nine Shelf items implemented and linked to `REQ-DC-017` through `REQ-DC-025`. Plugin version `0.1.0+codex.20260923030551` installed locally.
- Final installed-cache self-project and Aftershock validations passed. Aftershock's external `CLAUDE.md` and `HUMAN.md` edits were detected and their provenance refreshed.
- Exact next safe action: start a fresh Codex task to load the updated installed skills. Review Aftershock's 107 review-required source records when its semantic refresh is in scope. The original retired handoff cannot be independently re-audited without the original evidence.
