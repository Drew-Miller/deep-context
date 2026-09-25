---
id: BACKLOG-DC-15
title: Reusable deep-audit skill and self-project hardening
pitch: Build a reusable deep-audit skill that examines an initialized project's context for conflicts, drift, stale work, structural hazards, and volatile guidance; run it against this self-project and use the findings to harden the skill.
status: planned
features: [bootstrap, routing, tasks, closure]
tokens: [audit, drift, conflicts, legacy, structure, authority]
provenance: User request and product-scope clarification, 2026-09-24; queued immediately after DC-14
milestone: DC-15
queue_position: 1
related:
  - BACKLOG-DC-14
  - BACKLOG-A464417C-F116-4217-94D2-F1650510B429
  - BACKLOG-24772EE1-9D3C-42A0-98FF-6EF28F981242
  - BACKLOG-CFEA23AF-A275-407B-88DE-B497D984D2B7
conflicts: []
status_history: []
---

# Reusable deep-audit skill and self-project hardening

This is the next implementation milestone after DC-14's locally accepted source change. Deliver `deep-audit` as a reusable plugin skill for initialized Deep Context projects. This repository is its first full audit and hardening case. The skill diagnoses and prioritizes; individual remediation changes remain separately scoped work. DC-14's fresh desktop gate remains open separately.

## Product scope

- Define a repeatable agent-facing audit workflow for any initialized Deep Context project. Discover the declared context root, project instructions, canonical authority, live schedule, indexes, source inventory, and task state without assuming this repository's extra `docs/plan/` layout or one `STATUS.json` schema.
- Package the `deep-audit` skill with the plugin and make its guidance distinguish authored from generated content, accepted authority from proposals, active work from historical evidence, and product defects from project-specific cleanup.
- Require an evidence-backed coverage inventory, targeted validation, selective full-body review, explicit inaccessible areas, and a dated report with findings, severity, impact, disposition, and an ordered remediation queue. The skill must preserve ownership, source restrictions, uncommitted work, and the project's single live schedule.
- Test the workflow on a representative initialized-project fixture and on this self-project. Feed observed gaps back into the skill and its tests rather than treating one successful self-audit as general proof.

## Self-project audit scope

- Inventory every file under this project's `.deep-context/` by role, authority, generated/authored status, references, currentness, and retention need. Include canonical `doc/`, the self-project `docs/plan/` ledger and evidence, entry instructions, source inventory, task manifests and state, and local archives where permitted. Record any excluded or inaccessible area rather than claiming full coverage.
- Compare accepted requirements, contracts, decisions, plans, task context, live ledger, indexes, and reports for contradictions, stale next actions, duplicated authority, missing promotion, broken links, orphan IDs, outdated runtime paths, and unsound ownership or recovery guidance.
- Identify completed, superseded, abandoned, or legacy tasks and documents still presented as current. Check folder taxonomy, GUID/path migration, the repository-local `repo` symlink, and volatile local-only knowledge or generated files that could be mistaken for durable truth.
- Run structural validators and targeted checks without weakening them. Use selective full-body review for authority conflicts, with an inventory proving coverage. Follow privacy and source-ownership exclusions.

## Output and acceptance

- The bundled skill and its tests work for a project without this repository's custom planning home; plugin packaging and skill validation pass. A fresh session can discover and follow the skill's route.
- Produce a dated, source-checkpointed audit report with evidence for each finding, severity, affected authority, practical impact, and a proposed disposition: fix, promote, archive, retain, or needs decision.
- Provide an ordered remediation queue linked to existing Backlog items where possible; create a new item only for genuinely missing work. Distinguish observations from inferences and note unavailable evidence.
- Preserve existing task ownership, uncommitted work, historical evidence, and the sole live schedule. Running the audit does not delete documents, rewrite source, install plugins, or mark old gates accepted. Skill implementation and packaging are part of this milestone; audit remediation is not.

Skill implementation and audit execution have not started.
