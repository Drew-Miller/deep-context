---
id: BACKLOG-DC-15
title: Reusable deep-audit skill and self-project hardening
pitch: Build a reusable deep-audit skill that examines an initialized project's context for
  conflicts, drift, stale work, structural hazards, and volatile guidance; run it against this
  self-project and use the findings to harden the skill.
status: done
features:
  - bootstrap
  - routing
  - tasks
  - closure
tokens:
  - audit
  - drift
  - conflicts
  - legacy
  - structure
  - authority
provenance: User request and product-scope clarification, 2026-09-24; queued immediately after DC-14
milestone: DC-15
related:
  - BACKLOG-DC-14
  - BACKLOG-A464417C-F116-4217-94D2-F1650510B429
  - BACKLOG-24772EE1-9D3C-42A0-98FF-6EF28F981242
  - BACKLOG-CFEA23AF-A275-407B-88DE-B497D984D2B7
conflicts: []
status_history:
  - from: planned
    to: active
    activation: ACTIVE-3F5238C5-E3DA-47A0-AB29-41BC98942D5E
  - from: active
    to: done
    reason: DC-15 packaged skill, representative fixture, self-project audit, and local verification
      gates accepted; installed desktop discovery remains a separate unrun gate
aliases:
  - ACTIVE-3F5238C5-E3DA-47A0-AB29-41BC98942D5E
  - DC-15
tasks:
  - a37a4fa0-4072-4856-acd4-c354ba44a47c
prior_active_status: done
verification:
  task_id: a37a4fa0-4072-4856-acd4-c354ba44a47c
  plan: .local/archives/compact-layout-2026-09-25/original/docs/plan/DC-15-AUDIT-PLAN.md
  skill_implementation: done
  audit_execution: done
  task_closure: complete
  closure_report: docs/reports/closure-reusable-deep-audit.md
  desktop_verification: passed-fresh-skill-discovery-and-read-only-execution
  desktop_probe_thread_id: 01a0d697-ef28-73b2-919a-1aecc07e5c09
  automated_tests: 85
  installed_plugin_version: 0.1.0+codex.20260925030651
  installed_copy_audit: passed-current-chat
  installed_copy_evidence: docs/reports/dc-15-installed-self-audit-2026-09-24.md
  requirements:
    - REQ-DC-051
  decision: DEC-DC-007
  evidence: docs/reports/dc-15-deep-audit-2026-09-24.md
  fixture_evidence: .local/archives/compact-layout-2026-09-25/original/docs/plan/reports/DC-15-FIXTURE-EVALUATION.md
  source_checkpoint: .local/archives/compact-layout-2026-09-25/original/docs/plan/checkpoints/DC-15-2026-09-24.sha256
prior_ledger_state: implemented-desktop-discovery-passed
verification_scope: Historical implementation evidence; does not validate the compact-layout
  migration or new CLI compatibility.
---

# Reusable deep-audit skill and self-project hardening

This is the next implementation milestone after DC-14's locally accepted source change. Deliver `deep-audit` as a reusable plugin skill for initialized Deep Context projects. This repository is its first full audit and hardening case. The skill diagnoses and prioritizes; individual remediation changes remain separately scoped work. DC-14's fresh desktop gate remains open separately.

## Product scope

- Define a repeatable agent-facing audit workflow for any initialized Deep Context project. Discover the declared context root, project instructions, canonical authority, live schedule, indexes, source inventory, and task state without assuming this repository's extra `.local/archives/compact-layout-2026-09-25/original/docs/plan/` layout or one `STATUS.json` schema.
- Package the `deep-audit` skill with the plugin and make its guidance distinguish authored from generated content, accepted authority from proposals, active work from historical evidence, and product defects from project-specific cleanup.
- Require an evidence-backed coverage inventory, targeted validation, selective full-body review, explicit inaccessible areas, and a dated report with findings, severity, impact, disposition, and an ordered remediation queue. The skill must preserve ownership, source restrictions, uncommitted work, and the project's single live schedule.
- Test the workflow on a representative initialized-project fixture and on this self-project. Feed observed gaps back into the skill and its tests rather than treating one successful self-audit as general proof.

## Self-project audit scope

- Inventory every file under this project's `.deep-context/` by role, authority, generated/authored status, references, currentness, and retention need. Include canonical `docs/`, the self-project `.local/archives/compact-layout-2026-09-25/original/docs/plan/` ledger and evidence, entry instructions, source inventory, task manifests and state, and local archives where permitted. Record any excluded or inaccessible area rather than claiming full coverage.
- Compare accepted requirements, contracts, decisions, plans, task context, live ledger, indexes, and reports for contradictions, stale next actions, duplicated authority, missing promotion, broken links, orphan IDs, outdated runtime paths, and unsound ownership or recovery guidance.
- Identify completed, superseded, abandoned, or legacy tasks and documents still presented as current. Check folder taxonomy, GUID/path migration, the repository-local `repo` symlink, and volatile local-only knowledge or generated files that could be mistaken for durable truth.
- Run structural validators and targeted checks without weakening them. Use selective full-body review for authority conflicts, with an inventory proving coverage. Follow privacy and source-ownership exclusions.

## Output and acceptance

- The bundled skill and its tests work for a project without this repository's custom planning home; plugin packaging and skill validation pass. A fresh session can discover and follow the skill's route.
- Produce a dated, source-checkpointed audit report with evidence for each finding, severity, affected authority, practical impact, and a proposed disposition: fix, promote, archive, retain, or needs decision.
- Provide an ordered remediation queue linked to existing Backlog items where possible; create a new item only for genuinely missing work. Distinguish observations from inferences and note unavailable evidence.
- Preserve existing task ownership, uncommitted work, historical evidence, and the sole live schedule. Running the audit does not delete documents, rewrite source, install plugins, or mark old gates accepted. Skill implementation and packaging are part of this milestone; audit remediation is not.

The packaged skill, representative fixture evaluation, and self-project audit passed local coordinator review on 2026-09-24. Durable behavior is `REQ-DC-051` and `DEC-DC-007`; evidence is `docs/reports/dc-15-deep-audit-2026-09-24.md` and `.local/archives/compact-layout-2026-09-25/original/docs/plan/reports/DC-15-FIXTURE-EVALUATION.md`. The focused source checkpoint is `.local/archives/compact-layout-2026-09-25/original/docs/plan/checkpoints/DC-15-2026-09-24.sha256`. Installed desktop discovery remains unrun and separate from this completed implementation ticket. No audit remediation, plugin installation, commit, push, or publication was performed.

## Prior milestone evidence (historical)

Scheduling prose here describes the prior checkpoint; current order and lifecycle come from this item’s frontmatter.

- Task `a37a4fa0-4072-4856-acd4-c354ba44a47c` closed at state revision 4 after an evidence-bound review; raw notes are archived locally. The accepted plan is `.local/archives/compact-layout-2026-09-25/original/docs/plan/DC-15-AUDIT-PLAN.md`; skill packet: `.local/archives/compact-layout-2026-09-25/original/docs/plan/packets/DC-15-SKILL.md`.
- Delivered: packaged `deep-audit` skill and no-write inventory helper; representative initialized-project fixture; dated self-project audit of authority, Active lifecycle, frontmatter/index maintenance, natural-language route, taxonomy, and bounded product source. Durable behavior is `REQ-DC-051` and `DEC-DC-007`. Audit remediation remains proposed in Backlog, with a combined product/self-project milestone at `BACKLOG-10F58B56-1C7C-4C7F-9CBD-EE7494DDC6DD`.
- Accepted local gates, 2026-09-24: focused fixture (two tests), `pnpm build`, 85 tests across 17 files, copied-package smoke, official plugin and five skill validators, source provenance refresh, index rebuild/live validation, Markdown link/authority checks, and `git diff --check`. Evidence: `docs/reports/dc-15-deep-audit-2026-09-24.md` and `.local/archives/compact-layout-2026-09-25/original/docs/plan/reports/DC-15-FIXTURE-EVALUATION.md`; focused source/test checkpoint: `.local/archives/compact-layout-2026-09-25/original/docs/plan/checkpoints/DC-15-2026-09-24.sha256`. Baseline validation had 12 stale source records; final validation passed after refresh.
- Closure gate, 2026-09-24: all six task-local Markdown notes were classified; durable discoveries were promoted; the reviewed closure finalized at state revision 4. Evidence: `docs/reports/closure-reusable-deep-audit.md`; archive: `.local/archives/a37a4fa0-4072-4856-acd4-c354ba44a47c/`. The report's 1,091-entry inventory is the pre-closure audit snapshot, not a current post-closure directory count.
- Local install follow-up, 2026-09-24: the personal marketplace source was corrected to the repository plugin directory, then version `0.1.0+codex.20260925030651` was installed. The installed `deep-audit` helper re-inventoried this self-project (1,103 entries, zero traversal errors); its installed CLI refreshed provenance and validated the project. The skill now proposes recoverable updates, moves, merges, promotions, and archives before evidence-backed deletion. Evidence: `docs/reports/dc-15-installed-self-audit-2026-09-24.md`. The repository marketplace remains for Git-backed distribution; no commit, push, publication, Aftershock edit, symlink removal, or broad document migration occurred.
- Fresh desktop gate, 2026-09-24: task `01a0d697-ef28-73b2-919a-1aecc07e5c09` independently discovered installed `deep-context:deep-audit` version `0.1.0+codex.20260925030651`, followed project routing, resolved as unbound, ran the installed inventory helper (1,106 entries: 1,027 files, 78 directories, one symlink; zero traversal errors; 43 unresolved role hints), and passed the installed structural validator. Its local Codex session JSONL records the commands, outputs, and exit codes. `read_thread` and `wait_threads` omitted this evidence, so desktop discovery and helper execution are accepted from the local trace; task recovery and a full semantic audit were not tested. DC-11/DC-12/DC-14 desktop gates remain separate.
- The next implementation milestone in the live queue is DC-16.
