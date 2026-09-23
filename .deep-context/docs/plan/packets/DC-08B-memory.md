id: DC-08B-memory
objective: Implement UUID task/chat memory lifecycle, source attachment and ownership
model: gpt-5.6-terra
reasoning_effort: medium
base_revision: 007cc323fa9b1fd153056c18fb6ddd78474c93cf plus preserved DC-07 changes
depends_on: DC-08 discovery and plan
read_scope: plugin source and DC-08 plan
write_scope: src/tasks/memory.ts, src/tasks/source.ts, tests/memory.test.ts
contract_version: 1
deliverables: implementation and focused tests; report to coordinator
acceptance_commands: focused tests and typecheck after writers freeze
exclusions: ledger changes, commits, pushes, source repo migration, descendants
escalation_conditions: interface conflicts or destructive migration

Export startMemoryTask(root, options), resolveMemoryTask(root, selector?, options?), resumeMemoryTask(root,selector,options), saveMemoryTask(root,selector,options), attachMemorySource(root,selector,options), rebuildChatIndex(root), validateMemoryTasks(root), withProjectLock(root,callback). Options chatId?:string|null, bindingId?:string, expectedRevision?:number; start description required/name optional; resume takeover. Result taskId,taskPath,title,bindingId,stateRevision,sourceBinding,requiredReads. TASK_STATE snake_case schema_version:2 task_id title task(folder) owner_binding_id state_revision status source_binding. Source binding {mode:none|read-only|isolated|existing,path?,ownership:none|deep-context|external,head?,common_dir?,evidence?}. chat canonical MEMORY.md task_id/binding_id/runtime/runtime_chat_id/status. Recoverable operation records, ownership/CAS locks. Source attach sourceMode/sourcePath/sourceRulesReviewed. No legacy/index/CLI/closure edits. Expose sourceSnapshot(root,binding) from source.ts for closure. Implement robust scoped recovery; tell coordinator APIs and tests.
