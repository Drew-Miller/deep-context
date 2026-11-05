---
id: WORK-DASHBOARD-BROWSER
title: Project dashboard
feature: project-dashboard
depends_on: [WORK-FOLDERS-RESET]
origin: user
---

# Project dashboard

**In development.** This is the phase's execution home: scope, ordered work items, implementation and verification. The [dashboard plan](../../plans/000020-dashboard-plan.md) supplies overall order; [feature requirements](../../docs/features/project-dashboard.md) describe accepted application behavior.

## Scope and prerequisites

Build a read-only localhost workspace for project work and knowledge. Readable-folder reset is complete. This prototype is manually mapped to this project; automatic indexing, multi-project search and static generation remain open work below. Implemented, accepted behavior is promoted to requirements before phase completion. Pending requests are transient; dropped or replaced requests need no permanent record.

## Ordered work items

### 1. Main-page reading — implemented; user review pending

Read documentation, features and work in the main content area with related links. Replace ordinary overlay reading and remove the folder-structure screen.

### 2. Sidebar chevrons — implemented; user review pending

Align the expanded and collapsed indicators with their labels.

### 3. Active work and descriptions — implemented

Show the dashboard in development. This phase record presents requested items, execution order, implementation status, verification and related requirements.

### 4. Saved follow-up and descriptive files — implemented

Preserve requested discussion context. Replace generic repeated names and collapse single-document subject folders. Update starter, skills/helpers and dashboard references to match. This supersedes the earlier always-a-ticket-folder convention.

### 5. Dark mode — implemented; user review pending

Provide light/dark appearance, an accessible toggle, system default and a browser-local saved explicit choice. Browser switching and persistence across reload were observed; user visual acceptance remains open.

### 6. Consolidated phase and simple plan — implemented; validation below

Keep this phase in one descriptive Markdown file containing its ordered requests, source files and verification. Remove the separate workspace packet and verification files after preserving their evidence here. Keep the overall plan short. Update generic skills, starter templates, requirements and dashboard links to the same model.

### 7. Real project data and multiple projects — pending

Replace the manually mapped prototype with project data and search across projects, showing project ownership. Verify ticket and document discovery across two projects and confirm browsing leaves their source documents unchanged.

### 8. Static HTML generation — pending evaluation

The user prefers static HTML where practical; generation method is undecided. Evaluate it as part of the data work rather than creating another planning layer now.

### 9. Final acceptance and promotion — pending

Review implemented requests with the user and preserve accepted lasting behavior in application requirements. Review generic skill changes. Do not complete this phase until its agreed gates pass. A completed phase may move to completed tracking only after durable knowledge is promoted.

## Implementation

Paths are relative to the repository root:

- `dashboard/index.html`: sidebar, board, main-page record view and appearance toggle.
- `dashboard/styles.css`: layout, responsive styling, chevron alignment and light/dark appearance.
- `dashboard/app.js`: manually mapped records, filtering, Markdown loading, related-record navigation and theme preference.
- `skills/deep-context-*/SKILL.md` and `starter/`: portable planning and work conventions; no installed CLI is needed.

The dashboard record map must follow file moves until automatic indexing is built. The current board displays the phase as one card; its ordered work items are sections in this record.

## Verification and open gates

| Outcome | Evidence | Remaining gate |
| --- | --- | --- |
| Active phase is shown in development | Canonical board and prototype active record | User review |
| Documents and features use the main page | Earlier localhost browser observations showed work and feature records with related links | User review |
| Folder-structure view removed | HTML and earlier browser observation | User review |
| Chevron alignment | CSS changed; earlier screenshot showed expanded Features tree | User visual acceptance |
| Dark/light appearance and saved choice | Earlier browser observation showed saved light mode across reload and visible dark board after switching | User visual acceptance |
| Files, work items and evidence consolidated | This phase and simplified plan; current validation below | Current checks |
| Multi-project discovery and read-only browsing | Not yet implemented or verified | Future work item 7 |

Earlier browser observations have no retained screenshot artifact or trace and are not independent review evidence. Historical checks below remain tied to their original source hashes; later source changes do not inherit their pass status.

## Discussion and durable knowledge

- [Dashboard follow-up](../../docs/notes/2026-11-04-dashboard-follow-up.md): user feedback and rationale, retained as requested history.
- [Work tracking](../../docs/features/work-board.md): plan → phase → work-item terminology and lifecycle.
- [Readable folders](../../docs/requirements/readable-folders.md): descriptive files and when to split a subject.
- [Knowledge history](../../docs/requirements/knowledge-history.md): accepted authority versus discussion history.

## Next action

Review the consolidated phase and implemented UI with the user. Then take work item 7, real project data and multiple projects, when approved. The whole dashboard phase remains in development.

## Verification history

The following evidence was consolidated from the former workspace verification document. It is historical, including the browser observations and unavailable checks.

### Earlier workspace verification

Recorded 2026-11-04T21:46:50-08:00. Local checkout; static source and context-link checks only.

#### Historical source checkpoint

SHA-256 of the implementation files:

```text
473bbe2a5dcaf1f48c431a0550fa2918d25a6f81172e987cd98e1e3bfa351023  dashboard/index.html
8674d0202c516643518849738aa60cd0eeca4d49111ccfbb303b25961a7fe98e  dashboard/styles.css
186a9a8a9684b6292ee35395d6966d7643eef873c665d3c6c623eb191103cc91  dashboard/app.js
```

#### Historical results

A Python file-existence check also verified all 21 mapped dashboard record paths and all three implementation paths.

- `node --check dashboard/app.js`: passed.
- `python3 skills/_shared/check_maps.py .deep-context`: initial check failed because source-file links escaped the context store. Replaced those links with repository-relative code paths; rerun passed.
- `git diff --check`: passed.

Browser checks were not rerun for this documentation follow-up. Earlier browser observations and remaining user gates are described in the phase scope above. Multi-project behavior and automatic indexing are not verified and remain future work. Changes to the implementation after this checkpoint make affected evidence historical.

#### Descriptive files, terminology and appearance follow-up

Recorded 2026-11-04T21:57:34-08:00. Earlier checkpoints above are historical after these source changes.

Historical SHA-256 checkpoint (before consolidation):

```text
d89802d72458684b04eafbe1ffec10bb394f4af56bf59e675b535f293320fb89  dashboard/index.html
43a76fe39959e69e32e073f8da9837b8bed1c06a45a4b482a4f5e074b086f6e2  dashboard/styles.css
68e648dd4c4196df1058aba29c5f1c9712e0f3fc7a8564f416d84c9cd28cecd3  dashboard/app.js
0a63a02719a4b8ce228923be88adb275b9c4a3cdc4bb363a75eba83146d611a6  skills/_shared/paths.py
8bda8d39e07ffedae2a05b12096815f00e775fcab3be71e7bbdbb636ea43a867  skills/_shared/check_maps.py
```

- `python3 -m unittest discover -s skills/tests`: passed, seven tests. Covers file-based work moves/reorder, nested directory-and-file plan reorder, split-ticket movement, link targets/fragments, collisions and symlink refusal.
- `python3 skills/_shared/check_maps.py .deep-context`: passed.
- `python3 skills/_shared/check_maps.py starter/.deep-context`: passed.
- Copied starter/helpers in a disposable project: work-file and plan-file reorder plus map validation passed using only local copied helpers.
- `node --check dashboard/app.js`: passed.
- `git diff --check`: passed.
- Browser on localhost: active record loaded from its new descriptive file; its work-item sections and related links were visible. Renamed feature record loaded with current requirements and terminology. Light-mode selection survived reload; switching back produced the visible dark board. A stale stylesheet was detected and fixed with a versioned stylesheet URL.
- Official skill validator: unavailable because its Python environment lacks `yaml` (PyYAML). No dependency installation was attempted. Skill edits were inspected; discovery in a fresh Codex session remains unverified.

User visual acceptance, multi-project indexing/search and final feature review remain open. Theme preference writes only browser local storage; project browsing makes no document writes.


## Current consolidation checks

November 4, 2026 (client date). Local consolidation gate passed; the dashboard phase remains in development.

- `python3 -m unittest discover -s skills/tests`: passed, seven tests.
- `python3 skills/_shared/check_maps.py .deep-context`: passed after consolidation.
- `python3 skills/_shared/check_maps.py starter/.deep-context`: passed.
- Disposable initialization checks: both an empty project and one with existing AGENTS instructions passed using copied starter, definitions, templates and helpers. Existing instructions survived, all nine relative discovery links resolved, and the overview plan linked a self-contained phase without separate verification files. This is filesystem-level verification, not proof of desktop skill discovery.
- `node --check dashboard/app.js`: passed.
- Node record-route check: all 19 mapped records, related links and HTML entry buttons resolve after removing packet routes.
- Skill frontmatter names and descriptions checked for all nine skills. The official skill validator was not rerun; its missing PyYAML dependency remains a recorded limitation.
- `git diff --check`: passed.

Browser interactions were not rerun for this document/route consolidation; earlier theme and reading observations remain historical. Desktop skill discovery, user acceptance and multi-project behavior are separate open gates.

Current dashboard source checkpoint (SHA-256):

```text
0e2282d1911911d042fc8b4e85eca70a2a1b9520b99cd353f30bb7e98b341a34  dashboard/index.html
43a76fe39959e69e32e073f8da9837b8bed1c06a45a4b482a4f5e074b086f6e2  dashboard/styles.css
7b8f1b8c761803b8bd71c44be798fa316c5d630bf3ff972ec78b16ce74870eb9  dashboard/app.js
```
