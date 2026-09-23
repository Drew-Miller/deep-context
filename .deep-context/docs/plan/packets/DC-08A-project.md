id: DC-08A-project
objective: Implement contained context initialization and deterministic project resolution
model: gpt-5.6-terra
reasoning_effort: medium
base_revision: 007cc323fa9b1fd153056c18fb6ddd78474c93cf plus preserved DC-07 changes
depends_on: DC-08 discovery and plan
read_scope: plugin source and DC-08 plan
write_scope: src/projects/**, src/config/**, src/importing/**, tests/projects.test.ts, tests/importing.test.ts, tests/config.test.ts, templates/project/**
contract_version: 1
deliverables: implementation and focused tests; report to coordinator
acceptance_commands: focused tests and typecheck after writers freeze
exclusions: ledger changes, commits, pushes, source repo migration, descendants
escalation_conditions: interface conflicts or destructive migration

Extend initProject(home,{name,repository,contextPath?,register?}) with exact explicit contextPath. export registerProject(projectRoot), resolveExplicitProject(path) from projects/index.ts, enhance findProjectRoot. Registry path configurable via DEEP_CONTEXT_CONFIG_DIR for tests. Exact context subtree excluded in inventory via optional excludedRoots; preserve old signature. Add canonical project UUID. Do not edit CLI, core/types, indexing, validation or tasks. Tell coordinator required validation inventory change.
