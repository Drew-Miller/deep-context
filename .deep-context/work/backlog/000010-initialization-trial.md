---
id: WORK-INITIALIZATION-TRIAL
title: Validate initialization with a realistic sample project
feature: initialization
depends_on: [WORK-DASHBOARD-BROWSER]
origin: user
---

# Validate initialization with a realistic sample project

**Backlog.** This is the next required trial in the [dashboard plan](../../plans/000020-dashboard-plan.md), listed after the optional selective-reading trial. It depends on dashboard acceptance, not on running the optional trial.

## Objective and scope

Give a fresh agent a fake project with a supplied plan, an accepted requirement and several ordered work requests. Have it initialize Deep Context using the actual installation guide, then inspect the resulting framework and captured meaning. The test checks the initialization product, rather than judging whether an agent reads documents in a prescribed pattern.

## Ordered work items

### 1. Prepare a synthetic project and input brief — pending

Create a disposable project with no existing `.deep-context/`. Supply a small realistic project identity, one overall plan, an explicit accepted requirement and several requested work items with enough order/dependency information to evaluate the output. Keep the original brief as evidence. Include an unrelated existing `AGENTS.md` instruction so preservation is observable. Use no real Aftershock content and do not prefill the expected Deep Context output.

### 2. Run a fresh-agent initialization — pending

Give a separate agent the fixture root, source initialization guide and original input. Let it initialize the project and organize the supplied information using the portable starter and skills. Withhold the review answer key. Record the actual agent/model and source checkpoint when running; no session is launched merely by scheduling this ticket.

### 3. Inspect the resulting framework — pending

Compare the generated records with the original brief. Confirm that the plan, requirement and requested work survive without invented acceptance or lost scope; priority/dependencies and plan → phase → work-item links remain understandable. Check descriptive names, current Knowledge links, root AGENTS entry, copied local skills/helpers, valid links and a single-project dashboard under `.deep-context/dashboard/`. Ensure source-repository goals/history were not copied and unrelated instructions survived.

### 4. Exercise the initialized project and report — pending

Use a bounded normal operation on the copied kit, such as adding or reordering a supplied work item, then validate its maps and rebuild its dashboard. Inspect the visible result and source preservation. Record findings and distinguish initializer/product defects from ambiguous fixture input. Do not score reading volume or demand a prescribed file-read sequence. Review the generated framework with the user before closing.

## Acceptance and next action

Success means a new project can be initialized from an ordinary brief, preserve its meaning and use the framework independently of this source checkout. Keep the fixture/evidence available for review until acceptance; clean up disposable artifacts afterward. This ticket is scheduled, not started.
