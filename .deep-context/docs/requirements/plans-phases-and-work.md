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
