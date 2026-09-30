---
id: REPORT-LEGACY-MIGRATION-ROUTE-HARDENING
title: Legacy migration source-route hardening
status: implemented-with-external-blocker
features: [bootstrap, routing]
source: work/items/remove-repo-symlink-from-repository-local-context.md
---

# Legacy migration source-route hardening

The linked [repo-symlink work item](../../work/items/remove-repo-symlink-from-repository-local-context.md) follows the completed compact-layout adoption. The product migration now routes project-specific top-level documents directly under `docs/`, rewrites context-local `repo/` references to the attached source checkout, and refuses to apply while source startup files still point at retired context paths. Compact validation detects stale context and source startup routes. Original migration snapshots and the source repository remain outside the rewrite.

## Verification

The source checkpoint is base commit `1340687673e748db75fd6c52da96cdada1b36dbf` plus the five-file manifest `.local/verification/legacy-route-hardening.sha256` (manifest SHA-256 `83ed3d6a92b9c40cac49936f8ad14a343bccef8b96598b604c624a544c4c02ac`). On 2026-09-30 in the local macOS checkout, `pnpm test` passed 95 tests in 19 files, `pnpm build` passed TypeScript checking and bundling, `pnpm check:package` passed the copied-package smoke, and `git diff --check` passed. The Aftershock-like fixture proves `doc/PRODUCT.md` maps to `docs/product.md`, `doc/CONVERSION-MAP.md` maps to `docs/conversion-map.md`, source links survive without the `repo` symlink, and both preview and validation flag stale startup routes.

The rebuilt CLI's read-only preview against `/Users/drewmiller/Developer/Aftershock - Sample Browser/.deep-context` reported 292 moves. Its `doc/PRODUCT.md` and `doc/CONVERSION-MAP.md` destinations are `docs/product.md` and `docs/conversion-map.md`. It reported two blocking conflicts: source `AGENTS.md` and `START_HERE.md` still refer to `.deep-context/doc/`. The preview returned `applied: false`; no Aftershock file or context record was changed.

## Remaining action

The Aftershock owner must update those two source startup files while preserving its `docs/plan/STATUS.json` `task_state` as the sole application schedule and its source-worktree restrictions. A fresh read-only preview should then show no conflicts before any separately authorized migration apply. The completed adoption item's installed desktop verification gate remains separate.
