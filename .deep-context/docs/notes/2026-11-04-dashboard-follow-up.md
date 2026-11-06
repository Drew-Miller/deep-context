# Dashboard follow-up — November 4, 2026

**Design history.** Selected user statements and a summary of their disposition, recorded from this conversation. This is not a complete transcript or a second requirements authority. Consult the [current dashboard requirements](../features/project-dashboard.md), [active ticket](../../work/completed/000010-project-dashboard.md) and [consolidated phase](../../work/completed/000010-project-dashboard.md#implementation) for current behavior and work.

## Initial dashboard request

> Create a dashboard html in order to 'view' the setup accepted file structure.

The user asked for a modular Jira-like board, documentation trees, and related-item links on documentation and features. A manually mapped HTML/CSS/JavaScript prototype was created.

## Navigation corrections

> Specficialyl the 'opened' chevron pointing down needs to be moved down.

> I don't really see a point in 'folder structure' side bar.

> The main view should be able to update for the documnetaiton nad features items.

The user preferred main-page reading similar to Confluence or GitHub Pages over overlay panels. These corrections supersede the prototype's folder-structure screen and overlay-based reading. They are reflected in current dashboard requirements and phase scope.

## Work tracking and evolving phases

> the 'build the dashboard' item should be in development since that is the task we are working on.

> I would also prefer static HTML files if possible, but that can be later on.

> So this 'work item' really has multiple phases and I imagine I will define them likely while we are working.

The user wants an in-progress ticket to show the requested changes, its phases, and links to lasting requirements and documentation. The ticket is now active. Static HTML generation remains a preference to evaluate later, not a selected implementation design.

## Final review and portable skills

> At the end, we will review these recommendations and if they were met or not.

> We can save them into further documentation and update our local skills as needed

The user specified that skill changes should remain generic enough to install in other projects. Final review must compare the requested outcomes with evidence before work completion. Generic skill changes and reusable starter propagation have not been performed in this follow-up.

## Questions about saved context

The user asked to see the current work item's files and phase packet. Inspection found a ticket, a high-level plan, feature requirements and three implementation files, but no separate phase packet or durable phase verification record.

> I noticed my more immediate questions aren't written or specified. This is because it's still being held in context?

The assistant confirmed that the detailed follow-up discussion remained mostly in chat, although agreed requests had been summarized in the work item. The user approved saving substantive follow-ups linked from the work item and asked what happens to requirements when they change.

## Current disposition and open questions

- Main-page reading, related records and the active ticket's scope are accepted product behavior; see the linked requirements.
- The phase packet now identifies files, criteria, evidence and gaps. It does not declare the phase complete.
- Automatic indexing, multiple-project browsing, static generation and a user acceptance review remain future phases.
- Later requirement changes update the canonical requirement. This note remains historical evidence; an older preference here cannot override the current requirement. See [knowledge history](../requirements/knowledge-history.md).

## Descriptive filenames and the immediate task

> They should be descriptive of the folder they are in. Or if they are the only file in the folder, they shouldn't be in a folder!

> A single markdown file and add heading sections for the different topics within that same subject.

The user allows splitting a long subject into a directory with descriptive documents when needed. This supersedes the earlier convention that every work item must have a folder. Category directories such as requirements, decisions and status lanes remain organizational containers. Codex skill entry filenames remain required by their discovery format.

> When the folder sturcture is updated I should see the descriptive file and a features logs or descriptions I have given logged and also implements

Apply the naming change immediately, preserve the feedback in history, and show implemented changes and open gates in the work and phase records. Generic starter and helper conventions must match the accepted layout.

Implementation update: single-document work items and features are now files, repeated map names have been replaced, and the dashboard references and portable skills follow the new paths. The [active work item](../../work/completed/000010-project-dashboard.md) keeps the requested-versus-implemented log. Requirements are still canonical; this note preserves the conversation.

## Accepted terminology and appearance

The user defined a phase as a developed feature idea containing concrete requested work items. Keep pending requests transient; promote implemented, accepted behavior into application requirements. Dropped or replaced requests do not need permanent records. This refines earlier discussion-history guidance; the [work-tracking requirements](../features/work-board.md) and [knowledge-history rules](../requirements/knowledge-history.md) are current authority. The dashboard phase now records light/dark appearance as an implemented work item pending user review.

## Consolidation accepted

The user accepted a short overview plan linking feature phases in order. Each phase should keep its work-item sections, implementation and verification in one descriptive Markdown file under its work status lane. Subplans are optional when an overview becomes too large. This supersedes the earlier separate packet and verification layout described above. The dashboard evidence was consolidated into its active phase; old packet links now lead there. Shared definitions are in [plans, phases and work items](../requirements/plans-phases-and-work.md), copied into the starter and linked from entry instructions so the convention survives agent and repository changes.
