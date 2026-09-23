id: DC-08C-skills
objective: Replace four skill names with six deep-word skills and update source README
model: gpt-5.6-terra
reasoning_effort: medium
base_revision: 007cc323fa9b1fd153056c18fb6ddd78474c93cf plus preserved DC-07 changes
depends_on: DC-08 discovery and plan
read_scope: plugin source and DC-08 plan
write_scope: skills/**, README.md
contract_version: 1
deliverables: implementation and focused tests; report to coordinator
acceptance_commands: focused tests and typecheck after writers freeze
exclusions: ledger changes, commits, pushes, source repo migration, descendants
escalation_conditions: interface conflicts or destructive migration

Follow plugin/skill creator instructions; read skills yourself. New deep-setup deep-init deep-start deep-resume deep-save deep-close, no legacy skill wrappers. CLI planned start-task --description --name --project --chat-id --json, resolve-task --task --project --chat-id --json; resume-task selector --takeover; save-task selector --next-action --note --expected-revision --binding-id --chat-id; attach-source selector --source-mode --source-path --source-rules-reviewed --expected-revision; close-task selector --finalize --chat-id --binding-id --expected-revision. Deep-init init --repo path --context repo/deep-context. Use bundled bin resolved relative skill root, not assume PATH. No auto task for project question, checkpoints, no ID fallback explicit path+binding; title sync only explicit tool action. Do not edit manifest/caches/global/docs planning.
