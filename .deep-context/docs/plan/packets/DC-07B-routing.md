---
id: DC-07B
objective: Make decisions, reports, and owned requirements discoverable with bounded context routing.
model: gpt-5.6-terra
reasoning_effort: medium
base_revision: current uncommitted plugin source; preserve README.md and assets/
depends_on: []
read_scope: [src/indexing, src/routing, src/frontmatter, templates/project, templates/task, tests/routing.test.ts]
write_scope: [src/indexing/index.ts, src/routing/index.ts, src/frontmatter/schemas.ts, templates/project/CONTEXT_MAP.md.template, templates/project/AGENTS.md.template, templates/task/CONTEXT_MANIFEST.md.template, tests/routing.test.ts]
contract_version: 1
deliverables: [code, focused regression tests, report]
acceptance_commands: [pnpm typecheck, pnpm test]
exclusions: [README.md, assets/, docs/plan/TASKS.md, docs/plan/STATUS.json, src/validation/index.ts, commits, plugin reinstall]
escalation_conditions: [decision/report schema requiring validator changes, breaking change to old canonical records]
---

# Routing packet

Implement Shelf items 0007 and 0010. Generated indexes must discover canonical decisions and closure reports, with linkable file paths and enough metadata to select relevant bodies. `deep` must add only decisions/reports associated with the chosen feature; preserve bounded dependency expansion. Feature-level context should include requirements with matching `feature` ownership even when `FEATURE.md` omits an explicit list. Explicit requirement IDs/paths remain supported. Provide real fixtures demonstrating selection; avoid recursive loading. Coordinate required decision/report validation shape with DC-07A; do not edit `src/validation/index.ts` yourself. Update project templates to describe the resulting routes.
