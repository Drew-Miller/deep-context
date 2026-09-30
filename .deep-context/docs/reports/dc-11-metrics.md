---
id: REPORT-DC-11-METRICS
title: Deep Stats local implementation and verification
status: accepted
features:
  - metrics
---

Historical report: this describes the layout and verification state at its original date. Old literal paths and commands are retained as evidence, not current instructions. Use [the current layout](../context-layout.md) and the migration path map for navigation. Markdown links have been relocated; the original bytes are in the local migration archive.

# Deep Stats implementation

The installable plugin now contains `deep-stats` and CLI commands `stats`, `stats-history`, and `compare-usage`. `stats` reports local documentation counts, source records awaiting review, validation diagnostics, and a feature route's selected bytes. Its corpus comparison includes fixed routing references on both sides. A bytes/4 estimate is labeled as a proxy. A compatible Codex CLI JSONL capture can supply measured input, cached input, output, and reasoning output counters. `--record` writes an aggregate summary beneath `.local/metrics/` without copying prompts or answers; `stats-history` reads these snapshots back as a trend list. `compare-usage` pairs two captures with evaluator-supplied correctness scores; it cannot verify matched benchmark conditions or grade responses.

## Verification, 2026-09-23

- `pnpm test`: 66 tests in 12 files passed, including four metrics tests. Fixture class: local temporary projects and JSONL captures. The metrics tests check bounded selection, broken-index reporting, recorded-history readback, token accounting, score gating, and invalid usage rejection.
- `pnpm build`: typecheck and self-contained CLI bundle passed. `pnpm check:package`: exact package boundary and isolated copied-package lifecycle passed, including stats recording, history readback, and comparison commands. Fixture class: temporary Git repository and copied plugin with isolated configuration.
- Official plugin validator and new skill validator passed using the existing `.venv` Python environment. `git diff --check` passed.
- Live `init --repo`, `rebuild-indexes`, and `validate --project .deep-context` passed after source changes. The first `stats --project .deep-context --feature metrics --level feature --record --json` snapshot reported zero structural errors, 52 source records still marked for human review, seven selected files, 5,608 selected bytes, and a 69.5% byte reduction against the routable corpus with the same routing reference set on both sides. This is a local size proxy, not measured token savings.
- Source checkpoint: Git HEAD `9f6acae1f7403fb412691dabaa6f1adb08f31b78` plus focused SHA-256 evidence: `src/metrics/index.ts` `ef5abab3d5cbe4c77fd4670decbb4b3f12c429b90d5b199a1710f2f53af9087e`; `src/cli/main.ts` `a07fb09a8262189d0c0cc15d4de347c576f4b3ca763dddd41e0a4c1e0b9f8a4d`; `plugins/deep-context/dist/cli.mjs` `8103362d02c76cb675919682bf6c5d28ef2df437e0af06121dcbd0aea507e0df`. These gates become historical if these files change.

## Limits and next evidence

The installed desktop plugin has not been updated or tested in a fresh task for this milestone. Automatic desktop token collection is unavailable in this implementation. No paired production benchmark or independent semantic recovery score has been run; the comparison command accepts measured CLI usage and externally graded quality. Two local snapshots are readable through `stats-history`; the latest reports seven selected files, 5,766 selected bytes, 21,023 routing-reference bytes, and a 69.5% byte reduction. Their exact paths are recorded in task memory.
