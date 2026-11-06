---
id: WORK-MIGRATE-AFTERSHOCK-CONTEXT
title: Review and migrate Aftershock context
feature: aftershock-context-migration
depends_on: [WORK-INITIALIZATION-TRIAL]
origin: user
---

# Review and migrate Aftershock context

**Backlog.** Migrate the current Aftershock Deep Context to the accepted structure through item-by-item user review. The [migration plan](../../plans/000030-migrate-aftershock-deep-context.md) comes after dashboard acceptance and the realistic initialization trial. The selective-reading diagnostic is optional and does not block this migration. Initialization and migration have not started.

## Scope and prerequisites

Use Aftershock's actual current context when this work starts, rather than assuming an older layout or importing the previous Deep Context project's discarded goals. Confirm its checkout, instructions and working-tree state then. Target the readable plan → phase → work-item model and durable requirements/decisions/docs defined by the current framework.

Preserve application source, behavior, ownership restrictions, human gates and any application-owned schedule that remains authoritative. This is a manual context migration and cleanup, not application development, plugin installation or support for legacy formats.

## Ordered work items

### 1. Inventory the current context — pending

Read lightweight entries first, then inventory existing context and linked project documentation. Identify current work, requirements, decisions, relevant evidence, duplicates, stale guidance and dead files. Record provenance and existing uncommitted changes. Do not delete or integrate records during inventory.

### 2. Review each item and its destination — pending

Present a bounded review queue to the user. For each item, propose accepting it, combining it with related material, revising it, deferring it or removing it, with a short reason and target home. Record the user's choice before applying it. Uncertainty stays explicit; similarity alone does not authorize merging or deletion.

### 3. Apply approved migration batches — pending

Move approved useful content into the agreed structure, keeping one canonical home per rule and a clear work/plan order. Repair entry instructions and live links. Consolidate only approved duplicates. Trim dead files only after the user has approved their disposition and unique context has been preserved where required. Keep a focused recoverable snapshot/path map for the migration until validation passes.

### 4. Validate context preservation — pending

Check links, identities, ordering, dependencies, authority and the approved disposition list. Rebuild Aftershock's dashboard and inspect relevant records. Use fresh-context questions to check that current work, requirements, decisions and unresolved gates remain recoverable without loading the entire store; report unavailable file-read evidence. Confirm application source and unrelated working-tree changes are preserved.

### 5. User acceptance and durable promotion — pending

Review the migrated structure and representative records with the user. Promote lasting accepted migration decisions/requirements into Aftershock's canonical knowledge. Close only after the review and validation gates pass.

## Verification and next action

No Aftershock inspection or mutation has been performed for this queued plan. Wait for the initialization trial and the user's readiness. Then open this phase at the inventory step.
