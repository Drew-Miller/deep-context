---
name: deep-audit
description: Audit an initialized Deep Context project for authority drift, structural hazards, and stale work with evidence-backed findings and no remediation.
---

# Audit Deep Context

Use this skill when the user asks to assess an initialized Deep Context project, its routing, durable records, task memory, or source-area cleanup candidates. The audit diagnoses and prioritizes. Do not delete, reorganize, rewrite, install, commit, or otherwise remediate unless the user separately asks for that work.

## Establish the audit boundary

Identify the declared context root from the repository and its startup instructions. Do not assume that the project uses `docs/plan/`, a particular ledger filename, or this skill's source repository layout. Read the context root's `AGENTS.md`, `CONTEXT_MAP.md`, `PROJECT.md`, and entry route when present. Follow those documents to the live schedule, task ownership constraints, generated indexes, and selected canonical records.

Run the bundled inventory helper before semantic review:

```sh
node <this-skill>/scripts/inventory.mjs --project <context-root>
```

The helper writes no files and prints one JSON value to stdout. It inventories metadata only: it uses `lstat`, never follows symlinks, rejects a symlink root, and records traversal failures. Treat `errors` and `roleHint: unresolved` entries as incomplete coverage. The helper does not read document bodies, local journal payloads, archive content, or symlink targets.

Turn that enumeration into a file-level coverage ledger before making findings. For each entry record its role, declared authority or `unresolved`, authored/generated/mixed status, reference-review status, currentness or `unverified`, review depth (`metadata-only`, `frontmatter-reviewed`, `body-reviewed`, `excluded`, or `inaccessible`), and retention recommendation. A documented rule may classify a whole area when every entry is accounted for and exceptions are listed. Count files, directories, and symlinks separately; list every helper error and any protected area that could only be inventoried by metadata. Keep local task, journal, archive, and private path details in ignored local audit evidence, while promoting only sanitized conclusions to the durable report. Recheck the enumeration if the tree changes during the audit.

## Review authority and structure

Use declared authority before drawing conclusions. Treat generated indexes as routing aids; distinguish accepted requirements, contracts, architecture, and decisions from active or proposed work items, historical plans, and task-local evidence. Review bodies selectively where an inventory result, link, current schedule, or suspected contradiction calls for it. Preserve uncommitted work, task ownership, and local-only material.

Compare the declared tree with the packaged initializer and project templates when they are available beside the Deep Context plugin. A documented project extension is not a defect. Record missing standard roles, extra declared roles, and unexplained paths separately; never infer that a path is obsolete merely because it is absent from the template.

Check the project for conflicting authority, stale next actions, missing promotion from task memory, broken references, orphan identifiers, unclear generated-versus-authored status, unsafe ownership or recovery guidance, and records that are presented as current despite completion or supersession. State whether each conclusion comes from metadata-only coverage, a selected body, validation output, or another named source.

Run the project's structural validator over the full canonical collection, and record whether it checks frontmatter schemas, duplicate IDs, references, status consistency, and generated-index freshness. Inspect any gap in those checks rather than treating a passing validator as proof of semantic consistency. Distinguish CLI operations that rebuild indexes from direct editor changes that require a separate refresh; an agent instruction to refresh is not an automatic file-change trigger.

Check the normal user-facing maintenance route as well: whether an agent can take a natural-language request, classify its authority, update the appropriate canonical record, refresh derived views with the bundled CLI, validate, and report the result. Direct CLI use may remain available, but a user should not need to browse or hand-edit the context tree for ordinary requests. Record a missing agent workflow as a product finding; do not treat a proposed idea as an accepted requirement without authority.

Reconcile each canonical work item with its optional task bindings, accepted evidence, and generated work/INDEX.md. Validate proposed/planned/active/blocked/done/merged statuses, IDs and aliases, order, and reciprocal task links. A plan alone is not active execution. A completed implementation with an open installed-runtime check is historical work with an open gate, unless the project explicitly defines another lifecycle. Check whether completed records still appear in current-only indexes and whether compatibility forwarders have a documented retirement rule. Treat linked reports and source checkpoints as evidence, not competing instructions, unless their bodies actually assert current authority.

## Bound the source-area review

When the project declaration identifies a source checkout, make a bounded responsibility inventory. State the source paths reviewed, the commands or reference searches used, and excluded areas. Reconcile eligible source paths with source-provenance tracking and disposition; inspect why executable text or package files are marked excluded or unsupported before treating the inventory as complete. Group each area by an observable responsibility such as CLI entrypoint, context model, templates, task lifecycle, validation, packaging, or tests. Search callers, manifests, imports, commands, and generated outputs before flagging an apparently duplicate or unused implementation. A filename, lack of a single import, or a metadata-only inventory is insufficient evidence of dead code. Mark candidates as uncertain when the bounded search cannot establish their status.

## Deliver the audit

Run the project's available structural validation and narrow link or authority checks. Do not weaken checks to obtain a pass or refresh source records merely to clear diagnostics during a read-only audit. Produce a dated report in the project's declared durable report location. If no location is declared, use `docs/reports/` when the context map marks it canonical; otherwise request a location before writing. Use [the report template](references/report-template.md) and include the source checkpoint when available, commands and outcomes, coverage depth, inaccessible areas, each finding's authority and impact, evidence, confidence, and proposed disposition. Keep raw local-path inventories and local payloads out of tracked reports.

Order proposed remediation by authority and dependency. For each cleanup finding, prefer a concrete update, promotion, merge, move, or archive that preserves unique knowledge and stable references. Recommend deletion only when the material is demonstrably redundant or obsolete, inbound references and provenance have been checked, and a recoverable path is described. State what the proposed destination and authority would be; do not merely label a file vestigial. Link existing canonical work items when applicable; identify missing work without creating it unless authorized. Report unavailable checks and any scope limits plainly.
