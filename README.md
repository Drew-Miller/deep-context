# Deep Context

Deep Context gives an AI-assisted project a readable place for plans, work and durable knowledge. Agents follow small maps to find relevant context, and people can browse the same Markdown files.

## Initialize a new project

Give your agent a local path or repository URL for [INITIALIZE.md](INITIALIZE.md), then ask:

> Initialize Deep Context in this project using the guide.

The agent copies the starter and lightweight skills into your project, adds instructions to `AGENTS.md`, and checks the resulting links. Python 3 is needed for the small validation and ordering helpers; the local viewer currently targets macOS and Linux. A fresh agent session may be needed for skill discovery.

Each project owns its copy. See the guide for updating skills from a newer checkout. Existing projects with a `.deep-context` folder require a manual conversion.

## Project structure

```text
.deep-context/
├── START.md                 # small entry map
├── dashboard/               # generated HTML/assets; ignored, not canonical context
├── plans/
│   ├── plans.md            # index of overview plans
│   └── 000010-release.md   # objective and linked phase order
├── work/
│   ├── work-board.md        # ordered board
│   ├── backlog/
│   ├── active/
│   │   └── 000010-feature.md # phase: ordered work items, implementation, checks
│   └── completed/
└── docs/
    ├── knowledge.md
    ├── features/
    ├── requirements/
    └── decisions/
.deep-context-tools/
├── skills/                  # local skills and helpers
├── templates/               # starter record templates
└── dashboard/               # local viewer, refresh and managed server
```

In this source checkout, viewer tools and assets stay in the visible root `dashboard/` directory. Initialization copies them into the target project's `.deep-context-tools/dashboard/`; generated sites stay under `.deep-context/dashboard/` in both layouts.

Plan and ticket filenames use sortable numeric prefixes. Keep a small subject in one descriptive Markdown file with headings; use a subject folder only when splitting it into multiple documents improves readability. Feature requirements live with their feature; cross-feature requirements and decisions live under `docs/`. Each ticket can list its origin and prerequisites.

Try “add this to the backlog,” “move the dashboard ticket next,” “plan this ticket,” or “continue the current plan.” The skills check for overlap and blockers and ask when the next choice is unclear.

Use **plan → phases → work items**. A plan is a short overview and linked phase order. A phase is a developed feature idea whose work file contains scope, ordered requests, implementation, verification and the next action. Create subplans only when the overall plan becomes difficult to follow; separate phase packets and verification files are unnecessary by default. Implemented, accepted behavior becomes application requirements; dropped or replaced requests do not require permanent history.

The starter includes the [canonical terminology and record structure](starter/.deep-context/docs/requirements/plans-phases-and-work.md). Initialization copies these rules with the templates and skills so another agent or project can follow the same model.

## View the dashboard

Generate a read-only snapshot from this repository root:

```sh
python3 dashboard/build.py --project .
```

Open `.deep-context/dashboard/index.html` directly in your browser, or ask “start the dashboard” for its clickable localhost URL. Home is the default page, with an explanation and starter links; the Work board lives at `work.html`. An existing server rooted at the project can serve `/.deep-context/dashboard/`.

Each project owns its own dashboard. The exporter reads only that project's `.deep-context/` Markdown and generates Home, the work board and a static HTML page per published record. Notes and Interviews remain source-only and are omitted from generated pages/search. The project name appears in the title bar and browser tab; there is no project selector or shared cross-project catalog. Document pages link related records, feature requirements, prerequisites and references back to them. Pages and navigation work without JavaScript; JavaScript adds local search, workspace state and a System/Light/Dark theme picker. System is the default and follows the browser's light/dark preference, including changes while the page is open.

This is a snapshot: editing skills refresh registered outputs after settled changes; rerun the command after manual changes. Output defaults to ignored `.deep-context/dashboard/`, which is excluded from canonical reads and refresh fingerprints. Use `--output /path/to/site` for an explicit external export. Only generated files listed by the exporter are replaced on rebuild. Unrecognized output directories and other source-context destinations are refused. The generated site is self-contained and does not need the source folders to remain available. It contains copies of the project's published context documents, so keep it local unless you intend to share those documents.

Previewed Markdown supports headings, links, ordered and unordered lists, tables, block quotes, inline formatting and fenced code. Arbitrary HTML is displayed as text. Browser use keeps expansion, scroll and an explicit test theme choice local to the project for the current browser session, preserving them across page navigation. It does not store project documents. The Back control follows browser history and falls back to Home when there is no previous entry.

Run the dashboard checks with `python3 -m unittest discover -s dashboard/tests`.

## Natural-language workflow

- “Where are we in the plan?” prints saved plan titles, ordered phases and the current phase's implemented, active and up-next work.
- “What did we just do?” or “What changed since I last asked?” recaps the requested range from visible conversation context. Default items explain what changed, resulting behavior and how to validate. No recap document or batch log is saved.
- “Start the dashboard” builds or refreshes and starts the local viewer, then returns a clickable localhost URL for Safari. “Stop the dashboard” controls only that viewer's owned server.
- A user-requested phase rename preserves its stable ID, work and evidence and repairs live links. It can happen during work or at completion.

Skill-led edits refresh registered snapshots once after the editing batch; manual changes are picked up by the next refresh. The ignored local receipt preserves each snapshot's single source project and output. No persistent watcher or additional AI agent is needed. The tree reflects actual context folders, and reference documents follow the order of their earliest directly linked execution work; unrelated documents are alphabetical.

Initialization uses `starter/` for the real empty context and templates, copies all supplied skills dynamically, and installs a local viewer alongside them. Existing project copies receive changes through the deliberate update procedure in [INITIALIZE.md](INITIALIZE.md).

The local viewer uses the standard library only. Its process and export receipts are ignored runtime state. When updating a copied viewer while it is running, stop its managed server before replacing server code, then restart if needed.

The sidebar keeps project/Home controls and its footer fixed around one shared workspace scroller. Work board → Plans → Documents groups use their natural height, each with a nested tree expanded by default, a header link distinct from its expansion control, and padding and separators that make containment clear. Trees have no separate scrollers, height quotas or automatic 2:1 resizing for the active workspace. Workspace headers may scroll out of view but cannot be clipped by zero-height group boxes. Short and narrow windows retain a usable shared scrolling region. Expansion and shared scroll survive document navigation for the current project and browser session; after final layout, reveal the actual selected link within the sidebar without scrolling the main document. Opening a section, including Features, does not highlight it; only the actual selected page retains its navigation highlight. Documents groups Features, Requirements, Decisions and root-level Documentation. Knowledge keeps its existing standalone page and visible entry.

Purple is the brand color, with neutral page/panel backgrounds and lightly tinted cards. Light-theme teal icons remain clearly distinct from gray completed icons. Execution-list rows use teal for active work, blue for upcoming work and muted completed headers. The board contains Active, Backlog and Completed columns, with every phase card stacked vertically inside its status column and Backlog immediately right of Active. It scrolls horizontally when needed. Backlog follows ticket order; Completed shows the most recent ISO `completed_at` first. Plans and Knowledge panels belong in their own workspaces rather than on the board. Plans has expandable status panels with execution order for backlog and newest completion first. Missing completion dates stay explicit. Source Markdown stays in execution order.

Knowledge groups current records by reader purpose; projects may adapt those groups. Retired guidance has a separate heading outside active tables, with short summaries explaining what changed and why and no dead links to removed documents. The starter carries this pattern without copying this project's retired entries.
