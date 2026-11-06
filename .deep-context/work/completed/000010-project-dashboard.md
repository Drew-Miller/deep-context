---
id: WORK-DASHBOARD-BROWSER
title: Project dashboard
feature: project-dashboard
depends_on: [WORK-FOLDERS-RESET]
origin: user
completed_at: 2026-11-05T17:59:06-08:00
---

# Project dashboard

**Complete; user accepted November 5, 2026.** The dashboard, portable workflow kit and shared-scroller repair are implemented and verified. Workspace groups have natural heights, project/Home controls sit outside the common scroll area, and the selected item is revealed after navigation and resizing. This is the phase's execution home: scope, ordered work items, implementation and verification. The [dashboard plan](../../plans/000020-dashboard-plan.md) supplies overall order; [feature requirements](../../docs/features/project-dashboard.md) describe accepted application behavior.

## Scope and prerequisites

Build a read-only localhost workspace for project work and knowledge. Readable-folder reset is complete. The viewer exports this project's context folder into static HTML, with derived relationships and local full-text search. Each project owns its own dashboard; the single-project choice in work item 18 supersedes the earlier multi-project design. Rebuild snapshots after Markdown changes. Implemented, accepted behavior is promoted to requirements before phase completion. Pending requests are transient; dropped or replaced requests need no permanent record.

## Ordered work items

### 1. Main-page reading — implemented; accepted

Read documentation, features and work in the main content area with related links. Replace ordinary overlay reading and remove the folder-structure screen.

### 2. Sidebar expand/collapse — implemented; accepted

Make expanded content visibly contained within rounded modular panels. Work item 20 supersedes the earlier chevron treatment; native expand/collapse semantics remain without decorative arrows.

### 3. Active work and descriptions — implemented

Show the dashboard in development. This phase record presents requested items, execution order, implementation status, verification and related requirements.

### 4. Saved follow-up and descriptive files — implemented

Preserve requested discussion context. Replace generic repeated names and collapse single-document subject folders. Update starter, skills/helpers and dashboard references to match. This supersedes the earlier always-a-ticket-folder convention.

### 5. Dark mode — implemented; accepted

Provide light/dark appearance with System as the default and session-local Light/Dark testing choices. Work item 25 supersedes the no-picker rule in work item 19. User visual acceptance remains open.

### 6. Consolidated phase and simple plan — implemented; validation below

Keep this phase in one descriptive Markdown file containing its ordered requests, source files and verification. Remove the separate workspace packet and verification files after preserving their evidence here. Keep the overall plan short. Update generic skills, starter templates, requirements and dashboard links to the same model.

### 7. Real project data — implemented; accepted

Replace the manually mapped prototype with project data and search. Verify ticket and document discovery and confirm browsing leaves source documents unchanged. The initial multi-project implementation was superseded by work item 18; two projects now export independently without sharing data.

### 8. Static HTML generation — implemented; accepted

Implement a standard-library Python exporter over the project's context root. Generate a static board and one HTML page per Markdown record, derive related links from source links and metadata, and add browser-side full-text search. Copy shared assets into the generated site so it can be opened directly or served locally. Rebuild intentionally after source changes. Verify two independent disposable project snapshots and unchanged source hashes.

### 9. Formatted Markdown links — implemented; accepted

Fix phase-order links inside bold formatting and preserve their section anchors and labels. Phase work items remain sections, not separate generated pages.

### 10. Actual tree and execution-linked ordering — implemented; accepted

Browse the real context folder hierarchy under each project. Follow plan/phase/work-item order and rank reference documents by earliest directly linked execution work; unrelated documents follow alphabetically. Remove synthetic sidebar groups. Preserve descriptive source filenames.

### 11. Project status skill — implemented; accepted

Print completed, active and upcoming plans as concise titles; expand the selected plan's phases and current phase's work items in their saved order. Distinguish implemented work awaiting review from user-accepted completion. Use actual completion chronology only when recorded; do not invent it.

### 12. Request-driven recap skill — implemented; accepted

Scope the recap to what the user asks: recent work, since the previous recap, or another stated range in the visible conversation. Clarify only when the scope or format is materially unclear. Default to short item headings with what changed, resulting behavior and how to validate. Save no recap or batch log and do not reconstruct lost context from repository history. Refine the portable skill when the user asks to adjust its behavior.

### 13. Skill-led refresh — implemented; accepted

After settled skill-led changes to rendered context or viewer assets, refresh registered dashboards with one deterministic command. Preserve each snapshot's single source project, coalesce changes and serialize builds; no persistent watcher or extra AI agent is required. Status and recap questions remain read-only.

### 14. Portable viewer installation — implemented; accepted

Copy the viewer alongside skills/templates into a new project and build its initial snapshot. Discover all supplied skills dynamically. Keep project instructions and unrelated skills. The project's own viewer can refresh independently of the source checkout.

### 15. Dashboard start/stop skill — implemented; accepted

Natural-language start refreshes and serves the local snapshot, then prints a clickable localhost URL for Safari. Stop controls only the managed server owned by this viewer; never stop an unrelated terminal process. Report the actual port if the preferred one is occupied.

### 16. Preserve accepted choices and generic workflows — implemented; accepted

Save the agreed direct-link-based document ordering, context-only recap behavior and default item format, skill-led background refresh, and local viewer installation in canonical requirements/decisions and portable instructions. Keep these work items in this phase even where they extend beyond the original dashboard feature. User validation remains separate from implementation.
### 17. Sidebar views and lifecycle presentation — implemented; accepted

Split navigation into Work board, Documents (actual docs contents) and Plans, preserving tree traversal. Dedicated plan lists, work status folders and visual collections show active → backlog → completed. Use active color plus highlight, future/backlog color without highlight, and muted completed headers. Rendered Markdown keeps execution order with lifecycle styling; source Markdown and sortable source names remain in execution order. Update the portable viewer and document the projection rules.

### 18. Theme, modular navigation and project identity — implemented; accepted

Keep purple as the brand color and allow lightly tinted cards, with neutral page and back panels. Give execution-list entries a separate color scheme and clear row styling. “Main” means the top Work board, Documents and Plans links; “modular” means the lower tree that changes with them. Add icons and inset expandable panels to that tree and keep it inside the shared workspace scroll area (work item 30 supersedes the earlier per-tree scrolling). A main page must not preselect its first module. When a module is open, show its parent view with a neutral contextual highlight and reserve the selected-page treatment for the module itself. Keep Active immediately left of Backlog on the work board, including narrower layouts. Group Documents cards under category headers derived from the actual docs folders, such as Features, Requirements, Notes and Documentation. Each project owns its dashboard: remove all-project/this-project selection and cross-project search, reject combined inputs, and show the project in the title bar and browser tab. Update installation and copied instructions. Verify light/dark appearance, selection, scrolling, local search, project isolation and unchanged source ordering.

### 19. Browser-managed appearance — implemented; accepted

The original no-picker approach is superseded by work item 25: System follows the browser preference automatically, with explicit Light/Dark testing choices available for the session.

### 20. Persistent workspace trees — implemented; accepted

Keep Workspace as the main-navigation term. Preserve the rounded expandable modular panels, remove their decorative chevrons, and retain open/closed sections and tree scroll across link navigation. Expansion is browser-local per project/workspace; scroll position belongs to the shared workspace area. Work item 30 supersedes the earlier independent-scroller arrangement. Project/Home controls stay outside the workspace scroller.

### 21. Document navigation and visibility — implemented; accepted

Apply the same modular interactions to Documents, color category/document icons, and hide Notes and Interviews from dashboard navigation, search and generated document pages while retaining their source files. Style the loose knowledge entry like the other modular entries and label it Knowledge. Requirements, Decisions and Features received positive user review; the new navigation changes remain subject to review.

### 22. Grouped Knowledge and retired guidance — implemented; accepted

Group the actual knowledge index by reader purpose, explain the proposed groups, and keep grouping adaptable by project. Remove the obsolete “Plans, subplans and completion” entry without deleting the correct Planning document. Retired canonical entries keep a short summary of what changed and why in a separate section, without deliberately broken links. Keep current requirements authoritative and distinguish retired accepted guidance from ordinary dropped work requests. Propagate the pattern to the starter and installation guidance.

### 23. Ordered plan panels — implemented; accepted

Provide expandable Active, Backlog and Completed panels in the Plans workspace. Backlog follows up-next execution order. Completed uses recorded completion dates, newest first; explicitly identify missing dates rather than inventing history. Support dozens of completed plans inside the shared workspace scroller; work item 30 supersedes the earlier independent tree scrolling. Update completion instructions so future records carry the needed date.

### 24. Generated dashboard inside context — implemented; accepted

Generate the site's disposable HTML/assets under `.deep-context/dashboard/`. Exclude that directory from canonical source loading and refresh fingerprints, retain safe output ownership checks, update starter/installation and dashboard start/refresh instructions, and relocate this project's generated snapshot. Keep viewer source code separate from generated output. Verify a second refresh is unchanged and generated files cannot become source records.

### 25. System-default theme picker and icon contrast — implemented; accepted

Keep System as the initial appearance, with explicit Light and Dark choices available for color testing. Preserve the chosen testing mode across page navigation within this project/browser session. Make the light-theme teal icons visibly distinct from gray completed icons. This supersedes the no-picker rule in work item 19.

### 26. Self-contained expandable workspaces — implemented; accepted

Keep the existing Knowledge Markdown and its standalone Documents page; the user confirmed it is visible. Put each Work board, Documents and Plans tree directly inside its own expandable workspace group, initially expanded. Use padding and separators between groups. Only the actual selected page gets selection treatment: opening a Features section alone must not give it a gray selected-looking header. Preserve expansion state in natural-height groups inside one shared workspace scroller. Work item 30 supersedes the previous per-tree quotas; workspace headings may scroll out of view while Project/Home controls remain outside the scroller. Workspace headers retain access to their landing pages and clear expansion controls.

### 27. Project Home and focused work board — implemented; accepted

Make a project Home page the initial landing page, explaining what the dashboard is useful for and providing helpful links for a new reader. Keep the three workspace groups in the sidebar and provide an obvious way back Home. Remove the separate Plans/Knowledge panels from the work board. Its phases stack vertically in each status column without a fixed item limit: backlog follows ticket priority, completed follows latest completion first. Preserve Active immediately left of Backlog and source Markdown execution order.

### 28. Browser-history Back control — implemented; accepted

Replace hard-coded “Back to work board” links with Back on non-Home overview and document pages. Follow the browser's real previous route instead of guessing a parent workspace; direct entry without prior history falls back to Home. Keep ordinary route links and native browser forward/back navigation working.

### 29. Knowledge overview and workspace order — implemented; accepted

Remove related-record navigation from the Knowledge overview, whose curated body already links to the relevant documents. Use the available reading width and preserve related navigation on ordinary records. Order workspace groups and Home workspace links as Work board → Plans → Documents. Propagate the behavior through the source kit and installation guidance.

### 30. Repair sidebar responsiveness — implemented; accepted

The user approved the assessment's recommended layout: one shared workspace scroll area, natural-height sections, fixed project/Home controls, no selected-workspace height weighting, and selected-item reveal after final layout. Workspace headings may scroll out of view. Preserve expansion and shared scroll state across links; ignore old per-tree pixel offsets. Verify normal, short and narrow windows, navigation, collapse/expand and selected-link visibility without moving the main document. The earlier assessment below is historical rationale.

### 31. Queue Aftershock migration — captured

Created [Migrate Aftershock Deep Context](../../plans/000030-migrate-aftershock-deep-context.md) after the dashboard plan and fresh-context trial, with a dependent backlog phase. Review each record before integration and allow acceptance, combination, revision, deferral or removal. This captures future work only; no Aftershock files were inspected or changed, and the fresh-context trial remains not ready to start.

### 32. Final acceptance and promotion — complete; user accepted

The user accepted the completed dashboard. Current behavior and portable workflow rules are promoted in canonical feature/requirement/decision records and the starter/installation guide. Source checks, independent review, tests and user validation support phase completion. Previously recorded unavailable checks remain limitations, not claimed passes.


## Implementation

Paths are relative to the repository root:

- `dashboard/index.html`: local viewer setup instructions.
- `dashboard/build.py`: reads selected context folders, renders boards and document pages, derives related links and generates the search catalog.
- `.deep-context/dashboard/`: ignored, self-contained generated HTML/assets; excluded from canonical loading and refresh fingerprints. Rebuild rather than edit it.
- `dashboard/tests/`: exporter, project isolation, lifecycle presentation, navigation, source-preservation, refresh and managed-server checks.
- `dashboard/styles.css`: layout, responsive panels, colored icons and browser-managed light/dark appearance.
- `dashboard/app.js`: project-local full-text search and session-scoped workspace expansion/scroll state. Document content and links are generated HTML.
- `skills/deep-context-*/SKILL.md` and `starter/`: portable planning and work conventions; no installed CLI is needed.

No manually maintained record map remains. Exporting reads source paths and metadata, and rebuilds derived links after moves. The board displays a phase as one card; its ordered work items remain readable sections in that record. Static pages contain all document content and navigation before JavaScript runs.

## Verification and open gates

| Outcome | Evidence | Remaining gate |
| --- | --- | --- |
| Active phase is shown in development | Canonical board and prototype active record | User review |
| Documents and features use the main page | Earlier localhost browser observations showed work and feature records with related links | User review |
| Folder-structure view removed | HTML and earlier browser observation | User review |
| Rounded modular panels without chevrons | Browser observed native disclosure controls, colored icons and retained Active/Backlog expansion across navigation | User visual acceptance |
| System/Light/Dark appearance | Browser verified both explicit palettes and session persistence; System follows browser preference | User visual acceptance; actual OS preference switching not exercised |
| Files, work items and evidence consolidated | Phase, plan, generic skills and starter checked | User review |
| Single-project publication and read-only browsing | Isolated project export tests preserve source hashes and reject combined inputs; history bodies stay source-only | User review |
| Static output and derived relationships | Generated real HTML links and pages, section anchors, metadata relationships and backlinks; all exported hrefs checked in two-project fixture | User review |

Earlier browser observations have no retained screenshot artifact or trace and are not independent review evidence. Historical checks below remain tied to their original source hashes; later source changes do not inherit their pass status.

## Discussion and durable knowledge

- [Dashboard follow-up](../../docs/notes/2026-11-04-dashboard-follow-up.md): user feedback and rationale, retained as requested history.
- [Work tracking](../../docs/features/work-board.md): plan → phase → work-item terminology and lifecycle.
- [Readable folders](../../docs/requirements/readable-folders.md): descriptive files and when to split a subject.
- [Knowledge history](../../docs/requirements/knowledge-history.md): accepted authority versus discussion history.

## Next action

Dashboard work is accepted and closed. The same overview plan now schedules an optional selective-reading diagnostic followed by the realistic initialization trial. Initialization is the next required item; neither trial has started. Aftershock migration remains queued after initialization validation. Preserve the recorded historical evidence and limitations.

## Phase acceptance and closure

User acceptance: November 5, 2026. Completion recorded as `2026-11-05T17:59:06-08:00`. The user said the dashboard looks good and requested completing the active item.

An independent read-only closure check confirmed all seven latest shared-scroller checkpoint hashes still match current files and the shared starter/project definitions are identical. Accepted behavior is promoted in the dashboard feature, static-snapshot decision, shared definitions, README and installation guide. The initialization feature's obsolete optional-Claude sentence was reconciled with the accepted Codex-only setup. No source behavior changed during closure.

The latest engineering gate remains 31 passing dashboard tests (including isolated loopback cases), both copied-project initialization smoke checks, browser observations and repaired independent-review findings, tied to the recorded checkpoint. Direct `file://` browsing, actual OS theme-preference switching, official skill validation and fresh-session discovery were not independently verified; those limits remain explicit. This closure does not claim that the future realistic-agent initialization trial already passed.

Current acceptance is recorded here. Earlier pending-review labels, old paths and unavailable checks in historical sections describe their original checkpoints. The fresh-context diagnostic is now optional; its status is not a prerequisite for initialization or Aftershock migration.

## Shared-scroller repair verification

November 5, 2026 (client date). Work item 30 is implemented after explicit user approval. User visual acceptance remains open.

- `DC_DASHBOARD_SERVER_TESTS=1 python3 -m unittest discover -s dashboard/tests`: passed, all 31 cases including isolated loopback servers. Existing source/link/ownership safeguards, Knowledge's omitted related pane, workspace order, theme and Back checks remain intact. Runtime controls cover one shared scroll offset, per-project/session isolation, preserved folder states, ignoring obsolete per-tree offsets, deferred restoration after disclosures, selected leaf/header reveal with an 8px inset, resizing from the user's current offset and no application writes to main-document scroll. Hidden selected links in deliberately collapsed groups/ancestors are skipped.
- `python3 /tmp/dc-install-smoke.py`: both disposable copied projects passed after the final visibility guard. All 12 skill links, copied viewer, `.deep-context/dashboard/` output, unchanged refresh and preservation of unrelated existing instructions/skills passed.
- Browser, 1280×720: Home and Documents retained identical workspace group heights (210px Work board, 210px Plans, 251px Documents before expanding categories). Selection no longer redistributes height. All trees have visible overflow and full content height; only `#workspace-scroll` has vertical scrolling. Project/Home position remained at y=122 while workspace content scrolled.
- Browser, 1280×400: the common scroll region was 150px high while groups retained their natural heights and full 43px headers. Headings can be reached by scrolling rather than clipped inside undersized group boxes. Current selection was visible after resize/load. At 600×720, the shared region was 341px high and Home/current selection remained visible. The default viewport was restored.
- Browser regression: after expanding Documents categories, shared content reached 1166px. From a saved offset of 696, Home → Knowledge revealed the selected entry at y=200 inside y=192–662, with main-document scroll at zero. Knowledge remains a full-width standalone page without its related-records pane.
- Independent read-only source review confirmed the old proportional sizing, group overflow clipping and per-tree scrollers were removed. It identified a hidden-selection resize edge case; a `getClientRects()` visibility guard and regression cases were added before final checks. Deliberate collapse stays intact. Browsers may still adjust scrolling to keep a focused control visible during resize; the app does not reopen or reveal hidden selections.
- Canonical knowledge impact: updated the dashboard feature requirements, shared definitions and byte-identical starter copy, README and installation guide. They explicitly accept workspace headings scrolling out of view in the common region. The approved source/generated folder split and queued Aftershock dependency are unchanged.
- Project/starter context validation, JavaScript syntax and `git diff --check` passed. The snapshot was refreshed; no commit, push, installation, Aftershock migration or fresh-context trial was performed. The dashboard phase remains active for user acceptance.

Source checkpoint (SHA-256):

```text
97bbbca0c5fe554e81a92e231e971f561996833a8cc004480d49813f3acaabe5  dashboard/build.py
8c67f23749e638a2f67df0e207e87f9022cbedecb5ad72856db792d0997d3011  dashboard/app.js
5fa41364caab179ad8ce781d1cfe403fc8ecad80fa0485ce1d8ed383c3e068cf  dashboard/styles.css
fbfc897c925a5b50c45812d93afb283295b9c75d1915501ccfdb570e3f1e4e25  dashboard/tests/controls.cjs
e14e80e42f7ff44d25edb80e0e0ad6a09728031a4ab52262f587913be1c4b24c  dashboard/tests/test_presentation.py
fad4c1c19b4ae708299ebd1cc1f16d6e677994fba1635df0e14bbf9977a4dbfc  .deep-context/docs/features/project-dashboard.md
2b1ed8a7c2354b08862e366f846dd6dfc23a0749cc5548999faaf73b929e9971  .deep-context/docs/requirements/plans-phases-and-work.md
```

## Sidebar assessment and final review adjustments

Historical assessment, November 5, 2026 (client date), before the user approved the shared-scroller repair. These observations explain the implementation now recorded above. They describe the former layout:

- At 1280×720 on Home with all workspace groups open, each tree had only about 90px of visible height. Work/Plans needed 149px for their collapsed root lists, and Documents needed 192px. Thus even the unexpanded navigation required three small independent scroll areas.
- Selecting Documents changed Work/Plans tree heights to 55/54px and Documents to 159px. Plans' heading moved from y=352 to 317; Documents moved from y=512 to 443. Collapsing Work and Plans moved Documents up again to y=334 and increased its tree height to 268px. The allocation depends on the current workspace and expansion state, not content length.
- With Documents categories expanded, its content height was 642px inside the 159px tree. Opening sections required internal scrolling; the other workspace trees remained independently scrollable. No normal-height text overlap was observed.
- At 1280×480, Work/Plans tree areas shrank to 12px and Documents to 39px. At 1280×400, Work/Plans groups were 35px tall while their headers needed 43px; only 24px of those headers was visible because overflow was clipped. The normal viewport was restored after testing.
- After scrolling Documents to offset 268 and opening Knowledge through Home's starter link, the selected Knowledge link was outside its own visible tree (link top y=237, tree top y=503). Opening ancestors does not guarantee that the active item is visible after restoring a pixel scroll offset.

Source inspection independently identified proportional flex allocation, zero minimum group height, hidden overflow and lack of selected-link reveal after final layout as the corresponding mechanisms. Nested scroll containment/mobile concerns from source review were not separately browser-verified and are not reported as observed bugs.

Discussion proposal: prefer content-sized groups in one sidebar scroll region, preserve the fixed project/Home controls, remove automatic selected-workspace height weighting, and reveal the selected item after layout. This reduces competing scroll areas but means not every workspace heading stays permanently pinned. If keeping all three headings visible is required, stable per-group minimum sizes with an outer fallback is the alternative. The user subsequently approved the single-scroller proposal; the verification above records its implementation.

Verification for the implemented adjustments: `python3 -m unittest discover -s dashboard/tests -p test_presentation.py` passed all 13 cases. Coverage checks workspace order and verifies that only Knowledge omits related navigation while its canonical links remain. Project/starter context validation and `git diff --check` passed. Browser confirmed Knowledge has zero related panels, retains its Markdown source path and uses the full reading width. The Aftershock plan and backlog dependency are indexed; migration and fresh-context validation have not started.

Adjustment source checkpoint (SHA-256):

```text
fa18acbda27eda48cf0d98e5b2eeff836efccbe0aba97babb4d7de8ea64409cb  dashboard/build.py
5296acc1529456374cd2a4063917a9a89ea476097ae1e2e9be90ca12709f7e33  dashboard/styles.css
836581b9211d44d1af677d3e1497403401bcf405cd5a5afebe178df80f5acf18  dashboard/tests/test_presentation.py
```

## Home, workspace groups and appearance verification

November 5, 2026 (client date). Work items 25–28 are implemented; user visual acceptance remains open. The visible root `dashboard/` is source/tooling. The ignored `.deep-context/dashboard/` is the generated website.

- Recovery: Finder Put Back restored the deleted root viewer directory. Before edits, SHA-256 matched the saved checkpoint for build.py, app.js, styles.css, serve.py and the two presentation/runtime test files. The Knowledge Markdown hash is unchanged.
- `DC_DASHBOARD_SERVER_TESTS=1 python3 -m unittest discover -s dashboard/tests`: passed, all 30 tests including the two isolated loopback server tests. The new controls harness executes the real app script for theme/session/project isolation, workspace toggles, reveal/reopen behavior, Back position/referrer cases and Home fallback. Existing source/link/symlink/ownership checks remain intact. Board tests intentionally disagree with plan rank to verify ticket priority; date-backed completions remain newest first.
- `python3 /tmp/dc-install-smoke.py`: both disposable copied-project checks passed after the final Back repair. All 12 skill links, copied viewer, generated destination and refresh behavior worked independently of the source checkout, preserving existing instructions/unrelated skills.
- Browser environment: local in-app browser, 1280×720. Home loaded with explanatory starter links, all three workspace groups expanded and System selected. Dark and Light changed actual backgrounds to RGB 23/25/27 and 245/246/247 respectively; explicit choices survived page navigation. Light active icons used RGB 0/143/112 with a solid play icon, distinct from gray completed icons.
- Browser: expanding Features computed a transparent heading background. Each tree had its own auto overflow. Collapsing Work board/Plans kept all workspace headers within the viewport; following the Work board header reopened its group. Work board had Active/Backlog/Completed columns and no cross-workspace bottom panels. Knowledge remained visible and opened its unchanged standalone page.
- Browser: Knowledge → Initialization → UI Back returned to Knowledge. A direct Work board → Documents → native Back → UI Back returned Home, covering forward history without an earlier dashboard page. The initial history-length implementation failed this edge case and was replaced before acceptance.
- Independent read-only review found the Back edge case and two stale current checklist lines. Both were repaired, source reviewed again, and runtime/browser cases passed. No source-safety regression or other blocking issue was reported. The Back API exposes same-origin history; external previous pages fall Home. Browsers lacking it use a same-project referrer heuristic. Native browser back/forward controls remain unchanged. See the [HTML Navigation API standard](https://html.spec.whatwg.org/multipage/nav-history-apis.html#the-navigation-api).
- Canonical knowledge impact: dashboard feature requirements, static-snapshot decision, shared definitions and identical starter copy, README and installation guide cover the accepted source/generated layout, Home, workspace containment, ticket/completion order, appearance picker and Back behavior. Source tools remain visible at root here; copied installations retain their existing tool placement. No Knowledge content, source-only history or unrelated repository was removed.
- Project/starter context checks, JavaScript syntax and `git diff --check` passed. No commit, push or installation was performed. The phase stays active pending the user's review, and the selective-reading trial has not started.

Source checkpoint (SHA-256):

```text
f5fbf2bfe971f5987c8f7d377c29cc87d19fd684bbfe7eaa93b1d22bef77a481  dashboard/build.py
5999897e312fa8c8ad5abf1ce5c1717f012000f0ba78a74cb92bfbc310960539  dashboard/app.js
89527a3d5d035c89f73c43cc6780571c4fb27159b36852d6bcb9d053aa7806ab  dashboard/styles.css
e8c077bfccb3fe4d08e3d7c897e7e10e4073c03eedbcb53744fb0e3e975d5011  dashboard/tests/test_presentation.py
d8cdb5858eadaf5018c82b4dff28f8e6642a294a1508826f98367082b0af3f8e  dashboard/tests/test_controls.py
954943b5c96b327f9137c128607c10f77d204e7aeae543b984cf91eacb7f2afd  dashboard/tests/controls.cjs
493271573ab144f7f69dd601412ea6a2c5ddf73290008e4a97032183b0c2e876  .deep-context/docs/features/project-dashboard.md
7a10ca1554fa85016ba259c8b041e8d2a3df57375d05f833fe91693cd5b2b5f2  .deep-context/docs/requirements/plans-phases-and-work.md
```

## Workspace navigation and generated-location verification

November 5, 2026 (client date). Work items 19–24 are implemented. User acceptance remains open; the earlier manual-theme, history-publication and output-path evidence below is historical.

- `DC_DASHBOARD_SERVER_TESTS=1 python3 -m unittest discover -s dashboard/tests`: passed, all 25 tests including both loopback server tests. New coverage includes source-only Notes/Interviews, Knowledge's standalone modular entry, dated completion order with explicit undated fallback, a large plan list (37 completed and 13 backlog), and default generation inside context without refresh loops or generated Markdown entering source records.
- `python3 /tmp/dc-install-smoke.py`: empty and existing-instruction disposable projects passed. Both used the copied viewer to generate `.deep-context/dashboard/`, refresh unchanged input without rebuilding, publish a new requirement on refresh, resolve all 12 skill links and preserve existing instructions/unrelated skills.
- Project and starter `check_maps.py`, `node --check dashboard/app.js`, and `git diff --check`: passed. The project/starter shared definitions remain identical. Completion instructions now record actual ISO `completed_at` metadata; the known reset-plan date is November 4 without an invented time. Official skill validation remains unavailable due to the previously recorded missing PyYAML dependency.
- Live snapshot relocation: built 19 published records under `.deep-context/dashboard/`; stopped only the owned viewer; verified the old `dashboard/site/` contained exactly 29 exporter-owned files and no unrecognized files; removed only that generated snapshot and its old receipt; restarted the owned viewer at `http://127.0.0.1:8765/`. Source-only Notes and Interviews were retained.
- Browser: expanded Work board Active and Backlog, selected the Active phase and observed both panels still open. Repeated with Documents Requirements/Features and Plans Backlog/Completed; both sets stayed open after record navigation. Plans main page had no selected module and presented all three status panels. The modular tree uses `overflow-y: auto`, while its sidebar container uses `overflow: hidden` so main controls remain outside the scrolling area.
- Browser: current appearance matched the browser's light preference (background RGB 245/246/247); no manual toggle remained and disclosure chevrons computed to none. Colored requirement/feature icons were observed. CSS media queries handle live preference changes, but an actual OS/browser preference switch was not triggered by automation.
- Browser: Documents exposed Requirements, Decisions, Features and root Documentation, with no Notes/Interviews modules. The styled loose entry was labeled Knowledge. Knowledge rendered four current tables grouped by reader purpose, followed by a separate Retired guidance heading and plain retirement summary; the obsolete planning label appeared in none of the active tables. The valid Planning feature remained navigable.
- Canonical knowledge impact: dashboard behavior is recorded in `docs/features/project-dashboard.md` and `docs/decisions/static-dashboard.md`; Knowledge grouping/retirement is recorded in `docs/knowledge.md` and `docs/requirements/knowledge-history.md`. Shared definitions, starter Knowledge, completion/dashboard skills, README and initialization instructions carry the portable behavior. Existing project copies still update deliberately; no other repository or plugin cache was modified.

These are direct local checks and browser observations, not an independent review or user acceptance. Source checkpoint is recorded below before the historical evidence.

Source checkpoint (SHA-256):

```text
786366f464251a6159088a5c369792c461534005fbe0957c8fe001b1814854b6  dashboard/build.py
a1c99710cfbf142dbf66ea926a84f1753ce0a40b271f0b8ea4c76945d0891923  dashboard/app.js
11fb8bb87095b7331ecfd9ee4e567f71f8746c6735ded664bc7bc1a2c1da7ecb  dashboard/styles.css
06cf6c19a4010b7f7780bae276cc51c68640c0f8b4caeea8e91a923394be1200  dashboard/serve.py
650fe2d696bd3efaac129040a4468eeb614af9ee5a0d28a59ed2a997fb7513b9  dashboard/tests/test_presentation.py
b7509d261ae97fed997102bd6a165a0ad77c455b4fca12644148be8875e2811f  dashboard/tests/test_runtime.py
828b54f998ec973a992e8ab9159b3e0e4ec4b89a56d97722eed457059ed58f44  .deep-context/docs/knowledge.md
ea6403d32641b9a83c655e0ecf26e7ed90ea9fb77577237315f05ce1d802f06d  .deep-context/docs/features/project-dashboard.md
17b76e635d45f61502490385fae983328658210c13991597449436d58d8ca91f  .deep-context/docs/requirements/knowledge-history.md
f5d9b138928270f4225318c2e3b4844328d73dca3072babd52310fdcf8599c45  .deep-context/docs/requirements/plans-phases-and-work.md
```

## Theme, navigation and project-isolation verification

November 5, 2026 (client date). Work item 18 is implemented; user visual acceptance remains open. The single-project requirement supersedes earlier multi-project behavior and its review checklist. Historical verification below retains its original scope and checkpoint.

- Dashboard tests: 22 passed, including both loopback server tests. Two project fixtures export separately; every HTML title/header and search catalog belongs only to its source project. Combined or empty inputs are rejected before writing output. Link and source-hash checks passed. Main pages select only the main navigation; record pages select only their module, with a neutral parent context. Category tests cover Features, Requirements, Decisions, Notes and root-level Documentation.
- `python3 skills/_shared/check_maps.py .deep-context` and the starter equivalent, `node --check dashboard/app.js`, and `git diff --check`: passed.
- `python3 /tmp/dc-install-smoke.py`: two disposable copied projects passed (empty and existing instructions). All 12 skill links, local viewer build/refresh, preserved existing instructions and identical shared rules were verified without relying on the source checkout at runtime. This is a local installation smoke check, not fresh-session discovery.
- Browser: dark board showed neutral page/panels, lightly tinted cards and Active immediately left of Backlog. Documents displayed category headers and icon-led expandable panels. Scrolling the modular tree from position 395 to 0 left the document scroll position at 337.5 and the main navigation top at 143.5. Main pages had zero selected modules. Opening the dashboard feature used a neutral Documents parent highlight and a purple selected module. Light/dark colors were inspected; project-local search returned five matches for “selective reading” with no console warnings/errors. Title bar and browser tab displayed Deep Context. These are direct browser observations; no independent visual review is claimed.
- Canonical behavior is in the dashboard feature requirements and static-snapshot decision; the shared definitions, starter, installation guide and copied skill instructions match single-project ownership. Manual name/description checks passed for all 12 skills. The official skill validator was attempted and remains unavailable because Python lacks PyYAML; no official pass is claimed.

Source checkpoint (SHA-256):

```text
33b9a8da65b4013251d12534e73b492fae4f8f56d39a539ddbf24b65e9ca9bc2  dashboard/build.py
8550c2cf1774e938b902a49bb2ac5a62ac5564492cedd3eae1a8973914e24c43  dashboard/app.js
8b7839d35568e0aaa0407bc453e2306080e1f8b8253a28701c0c1cc033576b62  dashboard/styles.css
2ec5eb9f2d631381c9e1a3e25fe32a7fda5498d4646276f6b1b3fbba00a4229d  dashboard/serve.py
eb0a2c436db7bbeb1fab95499f68c1db0f4d067edfe9c205aecc8d7ca971cb02  dashboard/tests/test_dashboard.py
d04a80d707c3b1a082f494ed06683d496b598801b8a1a45495472fe82efd1185  dashboard/tests/test_presentation.py
8193eba08e54c708e5dcb32e946b99a7cb809b067f57c6994c5845ca27f1d40e  dashboard/tests/test_runtime.py
```

## Sidebar presentation verification

November 4, 2026 (client date). Work item 17 is implemented; user acceptance stays open.

- `DC_DASHBOARD_SERVER_TESTS=1 python3 -m unittest discover -s dashboard/tests`: passed, all 20 tests, including four presentation tests and both loopback server cases.
- `python3 -m unittest discover -s skills/tests`: passed, nine tests.
- Context validation for this project and the starter, JavaScript syntax and `git diff --check`: passed.
- Two copied-project initialization checks passed with the updated viewer and shared presentation rules.
- Browser on the user's managed dashboard: Plans showed active first and completed last, with the three main navigation links always available. Documents opened its own view and scoped folder tree; changing project scope stayed in Documents and updated navigation URLs. Work board showed active/backlog/completed columns and status folders in that order.
- Browser computed-style check in dark mode: an implemented work-item heading was muted with no background, the in-progress item used active color plus a highlight, and the pending item used future color with no background. Source execution order was retained. The same distinction was verified in light mode: muted completed heading, colored/highlighted active acceptance item, and colored/unhighlighted backlog folder. Dark appearance was restored afterward.
- Export tests verified source bytes were unchanged, accepted reference documents stayed neutral, explicit plan status and plan-index/introductory status inference worked, and the active phase remained active despite containing implemented work items.

Source checkpoint (SHA-256):

```text
d7ca1cadf5654a99edfc017a1c0f23faf5cabef2593d36278606c8a06d8e8064  dashboard/build.py
73357aefcdd24761899aed1bea3c31bd2a949800b50e3f01f07bf5be841aefea  dashboard/app.js
648d612b0ebcddecd6547b31d1f03f3a2084cda67e332eb750c1d89faafb3783  dashboard/styles.css
d4b2f1dd84be0210ffd4b41f4f32fc793d04d3d5fe86544a8bbf11f3052dc8fb  dashboard/tests/test_presentation.py
```

## Review follow-up verification

November 4, 2026 (client date). The accepted review follow-ups are implemented. The phase remains active pending user validation. Earlier checkpoints below are historical.

- `DC_DASHBOARD_SERVER_TESTS=1 python3 -m unittest discover -s dashboard/tests`: passed, all 16 tests including the two loopback server tests. Coverage includes the bold-link reproduction, formatted labels, literal code, actual/empty folder traversal, execution-linked document order, nested plan order, direct references versus general indexes, unchanged-input refresh, preserved multi-project selection, source failure without replacing the snapshot, concurrent registrations, owned-server reuse/refresh/shutdown, occupied ports and refusal to stop a mismatched instance.
- `python3 -m unittest discover -s skills/tests`: passed, nine tests including file and split-subject phase renames that preserve IDs, evidence, links and fragments.
- Two disposable initialization checks (empty project and existing instructions/unrelated skill): all 12 relative skill links, copied standards/templates/viewer, local build and refresh passed independently of the source checkout. Existing instructions and unrelated skills survived.
- `python3 skills/_shared/check_maps.py .deep-context` and the same check for `starter/.deep-context`: passed. `node --check dashboard/app.js` and `git diff --check`: passed.
- Managed source-viewer smoke check: start printed its live URL; the browser showed the actual context tree and followed the formerly broken bold phase-order link into the phase page. Related records showed type and path. The helper is stopped after verification; a future start request returns its actual current URL.
- New skills were checked for valid name/description frontmatter and reviewed against the requested workflows. Runtime model-trigger behavior and fresh-session discovery were not independently tested. Official skill validation remains unavailable because its Python environment lacks PyYAML; no replacement validator or fabricated pass is claimed.
- No persistent watcher, automatic background AI worker, saved recap, batch log or last-reported marker was created. Server/export receipts are ignored local runtime state. The phase work and requirements remain durable; conversation-only recaps do not.

Current implementation checkpoint (SHA-256):

```text
3fa01fea2f26f2407cde6ae541d5bfaa19d64c9c99fb6861759f77b5c6bb338a  dashboard/build.py
92f8644cab0004041ead2e4d4acf938d90279614e14fbd40884a20f54d2cd9af  dashboard/refresh.py
9e4f6e4cbe594be31d84159a5318a2b32fa6103798ed6850767997437b12a8f2  dashboard/serve.py
6f24dfb29fce9fab4c5f092b827ad78030500fe600a0799e4f2ce79c765b54e2  dashboard/styles.css
10bf7e98a895e97d0a4f553b8943ae9d6e74a04fe6d342f4f41d7c358955972b  skills/_shared/paths.py
791977e8a552ef4e271b548674620bb5ae2f901a5cff3f00556be0c1b81ef9ef  skills/_shared/refresh_dashboard.py
46afa70e2d2c71457daf6bf0535d7b02c1dcadfdadbd44c49600429f32f17f6d  skills/deep-context-status/SKILL.md
387012243d45e9235e3a57463a45cadeeede72d8bb3572519ce429da2157205b  skills/deep-context-report/SKILL.md
d46c0b841733c5ad6c18cc840963ca0b75dbdc6d6f2e9fdf8daba58b01ea4420  skills/deep-context-dashboard/SKILL.md
```

## Earlier static-export implementation checks

November 4, 2026 (client date). Static-export and multi-project work is implemented, tested and ready for user review. Base commit: `287d502` plus the source checkpoint below.

- `python3 -m unittest discover -s dashboard/tests`: passed, eight tests covering multi-project output, full-text corpus, HTML destinations and anchors, metadata relationships, source hash preservation, rebuild/removal behavior, same-name projects, split phase documents, output boundaries, symlinks, duplicate IDs, malformed frontmatter and escaped HTML.
- `python3 -m unittest discover -s skills/tests`: passed, seven existing ordering/movement tests.
- `python3 skills/_shared/check_maps.py .deep-context` and the same command for `starter/.deep-context`: passed.
- `node --check dashboard/app.js`: passed.
- `python3 dashboard/build.py --project .`: passed; 21 real context records exported.
- Localhost browser: searched for a body-only phrase across projects, opened its Harbor fixture work record, followed its requirement and section anchor, observed rendered table/code, switched to Deep Context, verified the phrase was excluded by that scope, and switched to All projects to recover the result. Both light and dark were inspected; light selection survived reload and navigation. The real dashboard phase rendered its ordered work items and user review checklist. Fixture source was removed before browser checks; exported pages remained usable.
- `git diff --check`: passed.

Limits: the browser tool blocks `file://` URLs, so direct disk opening was not browser-verified. No workaround was attempted; localhost serves the same generated files. Multi-project tests used controlled fixtures, and browser testing paired the real Deep Context tree with a clearly labeled Harbor fixture, not Aftershock. Desktop discovery and the official skill validator's previously recorded missing PyYAML dependency remain separate from these dashboard checks. User acceptance stays open.

Source checkpoint (SHA-256):

```text
1db6db41843f006b62592e3b5172050899165285e803c7878cd80a4d5b1eff56  dashboard/build.py
c94080bdabd879c792c7c415ddb2fc73a1d12a5c8a553f973a7014f02d6096c6  dashboard/index.html
3a1020df2db8e6359b6f4634a1fe5918ef411b42aeaa0a793b0e18b3c027e1eb  dashboard/app.js
affd06abdc6b5eb3cf4eee11a5db7b01ac743580190aa69bb5e2855288d3c962  dashboard/styles.css
7f67d602bd8ed4b60b1246d3cd3def4b324ad0dff989f298474d05e8fa92c3de  dashboard/tests/test_dashboard.py
```

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


## Historical consolidation checks

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


## User review checklist

All engineering work is implemented. Review these outcomes before phase acceptance:

1. Home and board: Home explains the dashboard and links to useful starting points. The work board has only vertically stacked phase cards: backlog uses ticket order; completed uses newest recorded completion first. Active stays left of Backlog. Opening this phase shows its ordered work items, implementation and verification.
2. Reading: documentation and features open in the main page. Related documents, feature requirements, prerequisites, backlinks and section anchors navigate normally. No folder-structure screen or overlay reader remains.
3. Sidebar: rounded modular panels expand/collapse without chevrons; colored icons identify document types. Open Active and Backlog, follow an Active item and confirm both remain open. Repeat across Documents and Plans. Main workspace controls stay visible while the lower tree scrolls.
4. Appearance: System is the initial picker choice and follows the browser/OS preference. Select Light or Dark to inspect colors and confirm the choice survives page navigation for this session. Teal icons should be clearly distinct from gray completed icons in light mode.
5. Real data: export again after editing a source record and confirm the new snapshot reflects it, including moved/removed documents.
6. Project identity: the title bar and browser tab name this project. No project selector or cross-project search remains. Search covers only this project's exported records.
7. Static output: open `.deep-context/dashboard/index.html` directly, or use the managed server's printed URL. Document navigation is real HTML; the generated site does not fetch Markdown from the checkout. Generated output is ignored and does not become canonical context.
8. Knowledge and portability: accepted behavior is in the dashboard feature requirements and static-snapshot decision. Shared plan/phase/work-item definitions and the generic skills/starter are retained.

To refresh this project's review snapshot, run `python3 dashboard/build.py --project .` from the repository root. Each project owns its own dashboard; combined project inputs are refused. Output is a snapshot, not a live watcher, and editing/dragging cards is outside the read-only scope. Automated project-isolation coverage uses separate Harbor/Orchard snapshots. No Aftershock conversion or validation was performed in this phase.


## Review follow-up checklist

- Open Dashboard plan and click its phase-order links, including the bold entries. They should navigate normally. Work-item sections remain within their phase page.
- Use Work board, Documents and Plans in the sidebar, with the actual tree scoped to the selected view. Reference documents follow earliest directly linked execution work; unrelated items follow alphabetically. Empty folders are represented. Related links include type and path when titles overlap.
- Ask “where are we in the plan?” for completed/current/upcoming plans, ordered phases and current phase work. Missing completion chronology must be identified rather than invented.
- Ask “what did we just do?”, “since I last asked?” or specify a subset/format. The recap uses visible conversation only and creates no saved report or batch log. Default items have short headings, what changed, resulting behavior and how to validate.
- Ask “start the dashboard” and use the actual printed URL in Safari. Ask “stop the dashboard” to stop only this viewer's server. An occupied preferred port should not require stopping another process.
- After a skill-led context editing batch, the registered snapshot refreshes once and preserves its single source project. Manual edits need an explicit refresh or the next editing batch; no persistent watcher runs.
- Project/Home controls remain outside the shared workspace scroll area. Work board, Plans and Documents have natural-height groups; their headings may scroll out of view. Main pages do not preselect modules; document selection gives the main parent a neutral highlight and the actual module a purple highlight. Rounded panels retain expansion across links without decorative chevrons.
- Neutral page and panel backgrounds support lightly purple-tinted cards. Execution-list rows use teal for active work, blue for upcoming work and gray for completed work. Backlog remains immediately right of Active, with horizontal scrolling on narrow boards. Documents cards have category headers matching the actual docs folders.
- Notes and Interviews stay in source files but are not published in the dashboard. Knowledge has adaptable reader-purpose groups; retired guidance is outside the current tables with a dated summary and no dead former-document link. The valid Planning feature remains available.
- Plans has expandable Active, Backlog and Completed panels. Backlog follows up-next order, Completed follows most-recent recorded completion first, and missing completion dates are identified rather than invented.
- `starter/` is the real initialization source. New projects receive the shared rules, all supplied skills, templates and local viewer. Phase work, completion evidence and user-requested renames follow the same conventions. Renames preserve IDs and repair links.

These follow-ups were worked alongside the dashboard in this same phase by user direction. No other current-layout `.deep-context-tools/skills/deep-context-continue/SKILL.md` installations were found under `~/Developer` in the read-only search (including ignored files). The source kit, starter and installation/update instructions were updated; no plugin/system caches or unrelated repositories were changed.
