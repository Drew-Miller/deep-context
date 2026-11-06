# Project dashboard

Provide a clickable read-only dashboard on localhost for browsing the same project folders agents maintain. Each project owns its own dashboard, built only from its own context. Show the project name in the title bar and browser tab; provide no project selector, cross-project search or awareness of other projects. A user can see the work board and priorities, open tickets, and follow links into plans, features, requirements and decisions. Browsing leaves the underlying project documents unchanged.

Use the main content area to read work items, documentation and features, with links to related records. An active work item presents its evolving scope and links to its plan and durable requirements. Use the actual context hierarchy in the sidebar under each project; no separate folder-structure screen is needed. Show descriptive filenames and make document type/path clear when titles overlap.

## Phase and work items

The project dashboard is a phase: a developed feature idea. Its [execution plan](../../plans/000020-dashboard-plan.md) orders implementation; its [work record](../../work/completed/000010-project-dashboard.md) tracks the requested work items within the phase.

Provide a System/Light/Dark theme picker. System is the default and follows the browser's `prefers-color-scheme` preference, including changes while the page is open. Preserve an explicit test choice across page navigation only for the current project and browser session.

## Data and static pages

Export one project's context folder into a self-contained static snapshot. Reject attempts to combine projects. Derive board status and order from phase/request locations, titles and metadata from source records, and related navigation from Markdown links, feature ownership, prerequisites and references back to documents. Supporting documents within a split phase do not become additional board cards.

Full-text search covers titles, document bodies and source paths from this project's snapshot. Normal document navigation uses real HTML links, including section anchors, rather than overlay readers. Render common Markdown structures including tables and code. Raw HTML is shown as text.

Keep this repository's source tools and assets in its visible root `dashboard/`; copied installations keep their viewer beside the copied skills/templates in `.deep-context-tools/dashboard/`. Generate the snapshot under `.deep-context/dashboard/` and exclude that directory from source loading and refresh fingerprints. It is disposable output, not canonical context. The snapshot works without the source checkout remaining available. Rebuild intentionally after source changes; the viewer does not edit Markdown. JavaScript adds search, workspace expansion/scroll state and the session-local theme choice. Basic document content and navigation remain ordinary HTML, with system appearance as the default. See the [static-snapshot decision](../decisions/static-dashboard.md).

Home at `index.html` is the default entry page and provides an explanation of the dashboard plus starter links. The Work board is a separate page at `work.html`. Back follows the actual prior dashboard page. Direct entry without an earlier same-origin page falls back Home, even with blank or forward history entries. Modern browsers use their Navigation API position; same-project referrer is the fallback when it is unavailable. Preserve the existing standalone Knowledge page and its content.

Notes and Interviews remain available to agents in the source knowledge store but are omitted from generated pages, the search catalog, related-record navigation and the modular tree. Other source documents may refer to them as non-navigable provenance; do not copy their bodies into the dashboard.

## Navigation order and refresh

Plan links determine phase order, phase sections determine work-item order, and direct links from that execution structure rank reference documents. Shared documents use their earliest linked work; unrelated documents and ties are alphabetical. Do not infer order through backlinks or general indexes, and do not rename reference documents simply to rank them.

Skills refresh registered snapshots after settled editing batches, including document additions, deletions, renames and reorders. Include viewer asset changes; ignore generated output and runtime state to prevent loops. A local receipt preserves each snapshot's single source project and output. Start/stop instructions print the actual loopback URL and control only the managed viewer instance.

## Three views and lifecycle presentation

Keep three workspace groups in the sidebar in Work board → Plans → Documents order. Each group contains its own nested tree: work status folders, plan records or the actual `docs/` contents. Workspace groups start expanded; nested sections preserve their own expansion state and reveal the selected record's ancestors. Preserve nested traversal and direct static document links.

Each workspace header has a page link and a distinct expansion control. Use padding and separators to show which nested tree belongs to each header. Keep project/Home controls and the footer fixed around one shared workspace scroller. Groups use their natural height, with no per-tree scrolling, height quotas or automatic 2:1 resizing for the active workspace. Workspace headers may scroll out of view but must never be clipped by zero-height group boxes. Short and narrow windows retain a usable shared scrolling region. A main page must not preselect its first module. Expanding Features or another unselected subheading must not apply a gray selection background; only the actual selected page retains the selected-page highlight. Preserve keyboard focus visibility. Group Documents cards under headers derived from actual docs categories; root-level docs belong under Documentation.

Keep the Workspace term for the main navigation. Use rounded open panels without decorative chevrons; native expand/collapse semantics and keyboard controls remain available through the distinct expansion controls. Preserve open and closed panels plus the shared sidebar scroll position across links for each project and browser session. After restoring state and completing layout, reveal the actual selected link within the shared scroller without scrolling the main document. Opening one record must not collapse other panels. Use colored category and document icons. Keep the loose `knowledge.md` entry labeled Knowledge and visible as a top-level modular item even without children; its content remains on its existing standalone page.

Dashboard collections and status folders use active → backlog → completed. The Work board contains Active, Backlog and Completed columns, with every phase card stacked vertically inside its status column. Keep Backlog immediately right of Active, using horizontal scrolling at narrow widths. Backlog follows ticket order; Completed sorts ISO `completed_at` dates/timestamps most recent first. Remove cross-workspace Plans and Knowledge panels from the board. The Plans workspace has expandable Active, Backlog and Completed panels, with up-next execution order for Backlog and newest completion first for Completed. Undated completions follow in execution order with an explicit missing-date note. Source Markdown and sortable filenames retain their execution order; exporting must not reorder or rename them for presentation.

Rendered Markdown lists keep their source order. Active execution entries and work-item headings are colored and highlighted, backlog/future items are colored without a highlight, and completed/implemented headings are muted while content and links remain readable. Preserve the source's explicit pending-review labels: implemented work can be muted within an active phase without implying user acceptance. Neutral reference documents are not marked completed merely because their decisions or requirements are accepted.

Keep purple for the brand and selected navigation, with neutral page and back panels. Cards may have a light purple tint. Strengthen teal icons in the light theme so they remain clearly distinct from gray completed icons. Execution-list rows use a separate palette with clear borders: teal for active work, blue for future work and muted gray for completed work, in both themes. Lifecycle status or expansion alone does not select a modular navigation item.

Plan lifecycle comes from explicit frontmatter status when supplied, then its plans-index status, then its introductory status; an unspecified plan is backlog. Work record lifecycle comes from its status folder. Work-item headings use their own stated status. Search works from Home and all three workspaces and returns only this project's records.

Knowledge is a curated overview with its own document links. Omit its related-records sidebar and use the full reading width; ordinary feature and work records retain their related navigation.
