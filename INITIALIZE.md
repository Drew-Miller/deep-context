# Initialize Deep Context in a new project

Give an agent this guide's repository URL or local path and ask it to initialize Deep Context. Obtain one local checkout and use its starter, templates, skills and viewer together. `starter/` is the real initialization source, not a test fixture. Existing-project conversion is a separate manual activity. The copied viewer uses Python 3 on macOS/Linux.

## Agent instructions

1. Identify the target root and project name. Stop on any existing `.deep-context` or `.deep-context-tools` path, including symlinks. Inspect `AGENTS.md`, `.agents/skills` and `.gitignore` before writing; preserve unrelated content. Existing Deep Context entry instructions are a collision. Refuse a symlinked discovery directory.
2. Enumerate the source's `skills/deep-context-*/` directories containing `SKILL.md`. Check every corresponding target discovery path for collisions. Use the supplied set rather than a fixed skill count; the status, recap and dashboard lifecycle skills are included.
3. Copy `starter/.deep-context/` to `.deep-context/` and replace only `PROJECT_NAME` in `START.md`. Copy `starter/templates/` to `.deep-context-tools/templates/` and `skills/` to `.deep-context-tools/skills/`, excluding tests, caches and its `.gitignore`. Keep `_shared/` with the skills.
4. Create `.deep-context-tools/dashboard/` and copy `build.py`, `refresh.py`, `serve.py`, `app.js`, `styles.css` and `index.html` from the source's visible root `dashboard/`. Source tools stay in that root directory; generated output belongs in `.deep-context/dashboard/`. Do not copy generated sites, tests, logs, locks or machine-local receipts. The installed viewer and skills must remain siblings inside `.deep-context-tools/` so helper paths resolve locally.
5. Create a relative symlink in `.agents/skills/` for each copied skill, pointing to `../../.deep-context-tools/skills/<skill-name>`. Preserve unrelated skills.
6. Append the section below to `AGENTS.md`, creating the file if missing. Preserve existing bytes and add a separating newline when needed.

   ```markdown
   ## Deep Context

   Start at [.deep-context/START.md](.deep-context/START.md). Follow only the maps and records relevant to the request. Shared definitions cover plan → phases → work items, ordered work, phase renaming and completion. Keep work performed during a phase tracked in that phase, with its implementation and verification.

   Project-local skills are in [.deep-context-tools/skills/](.deep-context-tools/skills), templates in [.deep-context-tools/templates/](.deep-context-tools/templates), and the local viewer in [.deep-context-tools/dashboard/](.deep-context-tools/dashboard). Use the status skill for saved project progress, the report skill for a recap scoped to the user's visible conversation, and the dashboard skill to start or stop the viewer and print its actual clickable URL. Recaps create no saved report. After settled skill-led edits, refresh existing registered dashboards once with the shared helper; collect its result before claiming freshness.
   ```

7. Add these missing patterns to the existing `.gitignore`, preserving its content:

   ```gitignore
   .deep-context/dashboard/
   .deep-context-tools/dashboard/.dashboard-*.json
   .deep-context-tools/dashboard/.dashboard-*.log
   .deep-context-tools/dashboard/.dashboard-build.lock
   **/__pycache__/
   ```

8. From the target root, run `python3 .deep-context-tools/skills/_shared/check_maps.py .deep-context`, then `python3 .deep-context-tools/dashboard/build.py --project .`. This creates the initial local snapshot under `.deep-context/dashboard/` and its ignored refresh receipt beside the viewer. Generated output is excluded from canonical source reads and refresh fingerprints. A second unchanged refresh must not rebuild. Do not start a server unless asked. Verify AGENTS → START → maps/definitions, skill discovery links, the local generated HTML, and the copied helpers without relying on the source checkout. Report paths, checks and collisions; distinguish filesystem verification from fresh-session skill discovery.

## The copied pattern

Keep overview plans under `plans/`. A phase is one descriptive file in `work/backlog/`, `active/` or `completed/`, containing scope, ordered work-item sections, implementation, verification and next action. Use the `plan.md` and `phase.md` templates. Shared framework definitions are seeded from the starter; source-project goals and interview history are not copied.

Each project owns a separate dashboard built only from its own context. Show its name in the title bar and browser tab; provide no project selector or cross-project catalog. Home at `index.html` is the default page, with an explanation and starter links; the Work board lives at `work.html`. The Back control follows browser history, with Home as the fallback when there is no previous entry.

The sidebar keeps project/Home controls and its footer fixed around one shared workspace scroller. Work board → Plans → Documents groups use their natural height, each containing its own nested tree and expanded by default. Separate each header's page link from its expansion control, with padding and separators around the contained tree. Trees have no separate scrollers, height quotas or automatic 2:1 resizing for the active workspace. Headers may scroll out of view but cannot be clipped by zero-height group boxes. Short and narrow windows retain a usable shared scrolling region. Expansion and shared scroll survive page links for the current project and browser session; reveal the actual selected link within the sidebar after final layout without scrolling the main document. Expanding Features or another unselected subheading does not gray-highlight it; only the actual selected page gets the selected treatment. Documents groups its cards by published docs categories and keeps Knowledge as an existing standalone page and visible entry. Notes and Interviews remain source-only.

The theme picker offers System (default), Light and Dark. System follows the browser's preference and live changes. An explicit theme choice for testing persists across navigation only for that project and browser session. Light-theme teal icons must remain clearly distinct from gray completed icons.

Visual collections group active → backlog → completed while source Markdown keeps execution order. The board has Active, Backlog and Completed columns, with all phase cards stacked vertically within their status column. Backlog stays immediately right of Active and follows ticket order; Completed shows newest recorded completion first. Keep Plans and Knowledge panels in their own workspaces, away from the board. Purple is the brand color; neutral surfaces and distinct lifecycle accents separate navigation from execution-list rows. Execution links determine order within groups; direct links and feature ownership rank reference documents, with an alphabetical fallback for unrelated material. Skills refresh existing snapshots after their edits, preserving each snapshot's single source project. There is no persistent watcher; manual edits need an explicit refresh or the next skill-led refresh. Status and recap questions remain read-only.

Plans has expandable Active, Backlog and Completed panels. Backlog follows execution order; Completed shows most-recent ISO `completed_at` dates/timestamps first and identifies undated records. Completion skills record the actual date/time. Knowledge groups current records by reader purpose, adapting groups to the project. Keep Retired guidance outside active tables, with short dated summaries and no dead former-document links. Do not copy this repository's retired entries into a new project.

## Updating an installed copy

Projects own their copied kit. Compare the newer source's skills, shared helpers, templates, viewer and `starter/.deep-context/docs/requirements/plans-phases-and-work.md` with the installed copies. Preserve project-specific edits and amendments, merge the shared rules and intended changes, add discovery links for new supplied skills, and keep entry guidance consistent. Update the kit components together; do not replace a project's plans, phases, requirements or decisions with the empty starter.

Run its context validator and `python3 .deep-context-tools/skills/_shared/refresh_dashboard.py`. Verify the local start/stop helper and printed URL when that workflow was requested. A source-repository update alone does not synchronize other project copies. Never modify system/marketplace/plugin caches to propagate these rules.
