---
name: deep-context-plan-scaffold
description: Create a concise Deep Context overview plan linking its phases in order.
---

# Deep Context plan scaffold

Use the selected project's `.deep-context/` as ROOT. Read its planning index and the shared definitions at `docs/requirements/plans-phases-and-work.md`.

Create one descriptive Markdown overview under `plans/`: objective, linked phase order, dependencies and next action. Detailed requests, implementation and verification belong together in the selected phase record under `work/backlog/`, `work/active/` or `work/completed/`. Avoid duplicating those details in the plan or creating separate execution packets and verification files by default.

Use top-level ranks of six decimal digits, initially in gaps of ten. Create subplans only when the overview becomes too large to coordinate its phases clearly. If needed, use descriptive inherited stubs such as `release-001-scope`; deeper descendants inherit their ancestry. A subplan is also an overview of phases, not a mandatory layer. Use a subject folder only when multiple documents are justified by readability.

Update `plans/plans.md` and links. Verify with `python3 <skills-root>/_shared/check_maps.py ROOT`.
