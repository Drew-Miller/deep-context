# DC-12-MEMORY

- id: DC-12-MEMORY
- objective: Persistent chat association independent of writer ownership and recoverable structured checkpoints.
- model: gpt-5.6-terra
- reasoning_effort: medium
- base_revision: 9f6acae1f7403fb412691dabaa6f1adb08f31b78 plus existing dirty workspace
- depends_on: approved DC-12 plan
- read_scope: task memory, transactions, existing tests
- write_scope: src/tasks/memory.ts; tests/memory.test.ts
- contract_version: DC-12 v1
- deliverables: core implementation, behavioral regression tests, report
- acceptance_commands: pnpm exec vitest run tests/memory.test.ts
- exclusions: all other files; ledger; commits; publishing; descendants
- escalation_conditions: incompatible storage migration, ownership ambiguity not covered by approved plan, blocked writes
