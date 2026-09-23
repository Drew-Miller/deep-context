---
id: DC-07A
objective: Preserve authored import provenance, stable project identity, and complete inventory validation.
model: gpt-5.6-terra
reasoning_effort: medium
base_revision: current uncommitted plugin source; preserve README.md and assets/
depends_on: []
read_scope: [src/importing, src/projects, src/validation, src/core, src/frontmatter, tests/importing.test.ts, tests/projects.test.ts, tests/validation.test.ts]
write_scope: [src/importing/index.ts, src/projects/index.ts, src/validation/index.ts, tests/importing.test.ts, tests/projects.test.ts, tests/validation.test.ts]
contract_version: 1
deliverables: [code, focused regression tests, report]
acceptance_commands: [pnpm typecheck, pnpm test]
exclusions: [README.md, assets/, docs/plan/TASKS.md, docs/plan/STATUS.json, commits, plugin reinstall]
escalation_conditions: [schema changes crossing worker scopes, any operation that would rewrite a real source repository]
---

# Import and identity packet

Implement Shelf items 0003, 0006, 0008. Preserve source-record bodies and unknown metadata on refresh; when hash/tracking changes, flag previously imported/referenced records for review without losing their human classification history. Reconcile current eligible tracked/untracked source inventory with records during validation, reporting newly added, changed, removed, and stale records without reading protected file bodies. Avoid treating an intentionally retired not-applicable source as a current repository file. Reject conflicting repo attachments and preserve identity on empty reinit. Validate symlink and state consistency. Add fixtures for the three reproduced failures.

Coordinate with DC-07B if new decision/report validation needs changes in `src/validation/index.ts`: Worker B should tell Worker A the expected shape, and Worker A makes those validator changes. Do not edit the live context project. Report remaining uncertainty.
