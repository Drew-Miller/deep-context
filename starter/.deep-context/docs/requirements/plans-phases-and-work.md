# Plans, phases and work items

The working hierarchy is **plan → phases → work items**.

## Plan: overview and order

A plan states the overall objective, phase order, dependencies and next action. Keep it in one descriptive Markdown file under `plans/`. Link to phase records rather than copying their detailed work items, implementation notes or verification.

Create a subplan only when the overall plan becomes too large to coordinate its phases clearly. A subplan is another overview of linked phases, not a mandatory layer or a reason to create separate execution packets.

## Phase: one feature's execution home

A phase is a developed feature idea. Keep its execution home in one descriptive Markdown file under `work/backlog/`, `work/active/` or `work/completed/`, according to its status. The file contains scope, prerequisites, ordered work-item sections, implementation details, verification with evidence and open gates, related knowledge and the next action.

Do not routinely create separate packet, checklist or verification files for a phase. Split a subject only when its length or independently useful content makes the single file difficult to read. Preserve links and keep a clear descriptive entry when splitting is justified.

## Work item: a concrete requested change

Record work items as ordered sections within the phase by default, with enough detail to execute and review each request. A standalone request can remain a descriptive work file until its phase is clear. A separate file is also appropriate when the request needs independent execution or becomes too large for a section.

Completing a work item does not complete its containing phase. Reorder sections when the requested execution order changes; phase files and top-level plans keep their sortable decimal prefixes. Stable record IDs remain independent of paths.

## Authority and lifecycle

Plans coordinate execution. Phase records and work items are transient working material. Promote implemented, accepted application behavior into durable feature or application requirements before phase closure. Accepted decisions retain their rationale in the knowledge base. Pending requests remain available while needed; dropped or replaced requests do not require permanent history.

A phase moves to completed only after its agreed work and verification gates pass and durable knowledge is promoted. Keep historical evidence tied to its source checkpoint; do not treat earlier checks as proof for changed files. User acceptance and unavailable checks stay explicit.

When completing a plan or whole work record, save its actual completion date/time in ISO `completed_at` frontmatter. Use a date alone when only that historical date is known. Dashboard completion history uses newest recorded completion first; missing dates remain explicit rather than invented. Source overview lists keep execution order.

## Shared tracking and phase names

Work completed while executing a phase stays tracked in that phase, including related workflow or skill work the user chooses to do alongside it. Preserve the implemented item, evidence and pending validation there; a conversational recap is not its durable tracking home. Record completion chronology when known and do not fabricate older timestamps.

The user may rename a phase while it is active or when it completes. Preserve the stable record ID, ordered work and evidence; update the descriptive path, title and live references, then rebuild affected dashboard links. Completion does not require an automatic rename.

## Status and conversational recaps

A status request reads the saved plan/phase/work structure and prints completed, active and upcoming work in the recorded order. If completion chronology is missing, use execution order and say so. Implemented work awaiting user validation is not accepted completion.

A recap follows the user's requested scope in the visible conversation, such as recent work or since the previous recap. Clarify scope or format only when needed. Default to short item headings explaining what changed, resulting behavior and how to validate. Save no recap, batch log or last-reported checkpoint, and do not reconstruct missing chat context from repository history. The generic skill can be refined from user feedback.

## Local dashboard lifecycle

The framework source checkout keeps viewer tools in its visible root `dashboard/` directory. Install copied viewers alongside the copied skills/templates in `.deep-context-tools/dashboard/`. Generate disposable HTML/assets under `.deep-context/dashboard/`, excluding that directory from canonical source loading and refresh fingerprints. Start/open and stop requests use the managed loopback server; starting prints the actual clickable URL for the user's browser. Stop only the instance owned by that viewer.

After a skill-led editing batch changes rendered Markdown or viewer assets, refresh existing registered snapshots once with a deterministic background shell command. Preserve each snapshot's single source project and output, skip unchanged inputs and collect the result before claiming freshness. No persistent watcher or additional AI agent is required. Status and recap requests are read-only. These rules and supporting skills ship with the starter and deliberate updates to installed project copies.

## Dashboard projection

Each project owns a dashboard built only from its own context, with its name in the title bar and browser tab. Do not combine projects or offer project selection. Home at `index.html` is the default page, with an explanation and starter links. The Work board lives at `work.html`; its Active, Backlog and Completed columns stack every phase card vertically within the corresponding status. Backlog follows ticket order and sits immediately right of Active; Completed shows newest recorded completion first. Plans and Knowledge panels remain in their own workspaces. Source plans, phases, work-item sections and their sortable names stay in execution order. The Back control follows browser history and falls back to Home when no previous entry exists.

Work board → Plans → Documents are three workspace groups, each containing its own nested tree and expanded by default. Give each header a page link distinct from its expansion control, with padding and separators around the tree. Keep project/Home controls and the footer fixed around one shared workspace scroller. Groups use their natural height, with no per-tree scrolling, height quotas or automatic 2:1 resizing for the active workspace. Headers may scroll out of view but cannot be clipped by zero-height group boxes. Short and narrow windows retain a usable shared scrolling region. Expansion and shared scroll state survive navigation for the current project and browser session. After restoring state and completing layout, reveal the actual selected link within the sidebar without scrolling the main document. Expanding Features or another unselected subheading does not gray-highlight it; only the actual selected page keeps the selection highlight. Rendered Markdown preserves source list order and uses active highlights, unhighlighted future colors and muted completed headers. Pending user acceptance remains explicit.

The theme picker offers System (default), Light and Dark. System follows the browser's light/dark preference and changes while the page is open. Keep an explicit test choice local to the project and browser session across page navigation. Light-theme teal icons remain clearly distinct from gray completed icons. Plans has expandable Active, Backlog and Completed sections: backlog follows execution order; completed uses most-recent completion first. Notes and Interviews remain source-only. Keep Knowledge's existing standalone page and visible entry, with current records grouped by reader purpose and a separate Retired guidance heading outside the active tables. Retired summaries explain what changed and why without dead links; ordinary abandoned work requests need no permanent history. Adapt knowledge groups to each project's usage.
