# DC-10 package verification worker

- id: DC-10-package-checks
- objective: enforce installable content boundary and isolated CLI lifecycle
- model: gpt-5.6-terra
- reasoning_effort: medium
- base_revision: current main plus preserved DC-07 through DC-09 prerequisites and DC-10 relocation
- depends_on: runtime relocation
- read_scope: package.json, plugins/deep-context, CLI and existing tests
- write_scope: tooling/check-package.mjs, tests/package.test.ts
- contract_version: 1
- deliverables: explicit allowlist checker, external temporary-copy smoke, boundary regression tests
- acceptance_commands: pnpm exec vitest run tests/package.test.ts; pnpm check:package
- exclusions: live configuration, user projects, ledger, publication, descendants
- escalation_conditions: missing CLI capability or behavior incompatible with preservation

Coordinator retains integration and acceptance. Independent read-only prerequisite review is assigned to gpt-5.6-terra, medium, with no write scope.
