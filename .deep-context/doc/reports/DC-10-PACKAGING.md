---
id: REPORT-DC-10-PACKAGING
title: DC-10 marketplace packaging and publication
status: verified-pending-publication
features: [bootstrap, routing, tasks, closure]
source_checkpoint: docs/plan/checkpoints/DC-10-2026-09-23.sha256
fixture_class: local Node CLI and external temporary Git repositories
---

# Marketplace packaging

The catalog keeps `deep-context-repo` and selects only `plugins/deep-context`. That directory is the authoritative home for the manifest, three skills, launcher, bundled CLI and nine templates. Build and binary paths target the package. Module-relative template lookup supports both source development and the installed bundle without using the caller’s working directory. Node.js 20+ is the runtime prerequisite; pnpm is only needed for development. The legacy project-agent template remains unchanged for exact-match migration detection. The public deep-task skill follows general repository ownership rules without naming a particular application.

The user authorized publication of relevant prerequisite changes and trackable context. DC-07 through DC-09 source and tests were reviewed and preserved; no installation, uninstallation, project reinitialization, migration, task-memory deletion, or account change is part of DC-10. The earlier discovery report’s raw desktop identity/title evidence is preserved in ignored `.local/publication-backups/DC-08-DISCOVERY.md`; its public report retains the conclusion without private session details.

## Verification gates, 2026-09-23

- `pnpm build`: typecheck and self-contained bundle passed. Local runtime: Node v24.20.0, pnpm 11.25.0. Node 20 itself has not been exercised on this host.
- Official plugin validator and all three official skill validators passed using the existing `.venv/bin/python` validator environment.
- Official `read_marketplace_name.py --marketplace-path .agents/plugins/marketplace.json` passed and returned deep-context-repo. The automated package check separately validates the source path and exact content boundary.
- `pnpm test`: 62 unique tests passed in 11 files. The root script excludes `.deep-context/` to prevent duplicate discovery through its repo symlink. The worker’s direct focused command initially discovered its 12 cases twice; that 24 count is not used as acceptance evidence.
- `pnpm build && pnpm check:package`: passed after workers froze. The package checker verifies exactly 18 allowed files and exactly three skills, rejects forbidden or unexpected content and all symlinks, validates the catalog path, and exercises the copied package in an external temporary directory with isolated configuration. CLI help, Git-project initialization and reinitialization preserving authored architecture, task start/save/release/resume/resolve with predecessor-memory routing, and validation passed.
- Independent esbuild build with `write:false`, matching production options, compared byte-for-byte with the final bundle. SHA-256: `13b35c288792206b61ba32a6d1ea5525a4ab992373df001d18ab12aeaecaf561`.
- `git diff --cached --check` passed. Explicit stage review includes the catalog and all 18 package files; `git ls-files .deep-context/tasks .deep-context/.local .deep-context/repo` returned nothing. Private environments and raw session backup are ignored. The first stage-guard check incorrectly treated source directory `src/tasks` as private task memory; it stopped before staging and was corrected to check the actual private context prefix.
- Coordinator reviewed the worker’s two changed files and accepted them after full regression. Read-only prerequisite and durable-publication reviews used gpt-5.6-terra, medium; measured usage/cost unavailable. No additional architecture pass was needed for the approved bounded packaging design.
- Source checkpoint: `docs/plan/checkpoints/DC-10-2026-09-23.sha256`, covering final source, tests, package, tooling, catalog and development configuration. These local checks ran with Node v24.20.0 on macOS and temporary Git fixtures, not the desktop installer.

## Context and desktop limits

`node plugins/deep-context/bin/deep-context.cjs validate --project .deep-context` was run without initialization. It reports source-inventory drift from relocated, added and modified source paths. The runtime has no exported narrow provenance-refresh operation; initialization is deliberately left to the user’s requested post-install deep-init refresh. No authored source interpretation, task memory, ID, or provenance history is replaced to make validation pass. Generated indexes were rebuilt separately. Final validation after staging returned 30 source-only diagnostics: 4 changed hashes, 11 changed tracking classifications, 8 newly eligible paths, and 7 retired paths. There were no structural, reference, task-memory, or index diagnostics. Source-inventory errors are a known remaining context refresh, not a passed validation gate.

Desktop installation, fresh skill discovery, and actual cross-chat recovery remain untested. Synthetic subprocess lifecycle evidence cannot establish these gates. The user installs the published marketplace package, removes the old personal copy only after successful installation, opens a fresh task, and refreshes this existing repository context while preserving documents and history.
