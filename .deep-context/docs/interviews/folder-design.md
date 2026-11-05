# Folder design interview

Design history · November 4, 2026. The dialogue below preserves the product discussion, including choices made in question prompts, corrections and final implementation request. Consult the current maps and docs for live guidance. Tool logs and internal instructions are omitted.

## Drew

~~~~~text
Here's what I want:

- I want to determine ways to update deterministically the deep context folder structure easily (tests, etc)
- We don't need backward compatibility ever.
- It should be readable - I look through the folder structure and it's super confusing to read as a human



I want you to identify ways we can speed this up. I have the plus plan and my usage is eaten up for weeks updating deep-context. I don't even think we need a CLI at this point, just a CLAUDE.md directive and a folder structure that is generated agentically. I feel like the CLI generation is not really needed I just want a readable pattern and soething that can get indexed too via an application



The requirements I am looking fro here is a standard folder structure, defined folder types (requirements, docs, tasks, etc.) and just to update it. This project is the source of truth for the structure and will have either just define the rules loosely and maybe have it's own deep-context such that we can track future work and stuff.



Remember, work tracking & backlog (jira), requirements (confluence), and a visual board w/ out interactions that searches through your projects. This just allows uses to view the documents.



The other feature is a way to read an index and easily allow the agent to understand the context from the folder. That's the idea, so any agent can get into a folder for the first time and identify related items and requirements and know what decisions were made before working a related task without needing to load the entire folder. That is something that can be built after the folder strcture is created and survived because I also blieve the models themselves know when to pick context and when to not.



Let's do a 'grilling' session where you interview me one quetions you think need to be clarified.



once grilling is done, we will identify the current items in our folder, determine which survive and which don't, and then migrate our own deep context to the new structure. The CLI tool call is up to you though I think the context would be muddied.



Let's create this as our 'current plan' and work through it. 'Current plan' and 'plans' should be part of the deep-context as well, and maybe even CLAUDE.md or a deep context markdown entry file can flash the state or something.
~~~~~

## Codex

~~~~~text
I’ll record this as the current plan, check what the CLI worker is doing, and start the interview with one question at a time. The first decision is what a person should see when they open `.deep-context/`.
~~~~~

## Codex

~~~~~text
I saved [Readable project folders](</Users/drewmiller/Developer/deep-context/.deep-context/plans/readable-project-folders.md>) as our **current plan** and linked it from the project entry and context map. The CLI worker is idle. Its last repair run was interrupted. The work index rebuilt successfully, but validation still flags 15 source inventory differences from that repair work. Those changes are preserved for triage.

The biggest way to save time is to **test the folder pattern before building tooling around it**. My recommendation is to let agents edit ordinary Markdown and use one example project plus a small deterministic check for placement, ordering and broken links. That lets us change a folder convention without spending another usage window rebuilding and reviewing a CLI. We only need automation where a rule proves worth enforcing.

The sequence is now **interview → inventory what survives → migrate our own folder → build the searchable, read-only board**. After the structure holds up, we can test whether a fresh agent can find related requirements and decisions from a small index. Backward compatibility is out of scope.

**First question:** When you open `.deep-context/` in Finder, would you expect `requirements/` and `decisions/` to be visible immediately alongside `work/` and `plans/`, or would you naturally look inside `docs/` for them? I lean toward putting them at the top level because you named them as distinct things you want to browse.
~~~~~

## Drew

~~~~~text
I'm fine with docs
~~~~~

## Codex

~~~~~text
We’ll keep requirements and decisions under `docs/`. I’ll check how the current plan points to work so the next question is about that boundary.
~~~~~

## Codex · question

~~~~~text
When you say “show me the current plan,” should that open a project-wide plan that links to work items, or the execution plan for the active work item?
- Project plan (Recommended) — For this project it would show folder design → inventory → migration → dashboard. Each work item keeps its own implementation steps.
- Active item's plan — It would open the steps for the work in progress. The ordered backlog tells you what comes afterward.
~~~~~

## Drew · answer

~~~~~text
Project plan (Recommended)
~~~~~

## Codex

~~~~~text
The current plan will be project-wide. It answers “where are we headed, and what comes next?” and links to work items. Each work item owns its implementation steps and status. Requirements and decisions live under `docs/`.

**Next question:** When we migrate and find an old goal that no longer fits, should it come off the live board and leave a one-line entry explaining why it was retired, or would you want its full ticket kept in an archive? I recommend the one-line entry after preserving any unique requirements, decisions or unresolved questions. That keeps the tree readable without losing the reason we moved on.
~~~~~

## Drew

~~~~~text
Right now? Just remove it. In the future it should be able to be archived or removed. Default is archived with no trace. Maybe there should be some 'link' between work items and the requirements and decisions it spawns or what it was created by (if spawned from other work). User created or specified is also an option (maybe the default option? You can have no spawning tasks or doc since I do sometimes get and specify ideas outsid of the current work)
~~~~~

## Codex

~~~~~text
I’ll check how tickets already link to requirements and decisions so we can keep those links without adding bookkeeping for every idea.
~~~~~

## Codex

~~~~~text
For this migration, an obsolete ticket can be removed once we’ve identified anything in it that should survive. There’s no need for a retirement stub.

For future tickets, I’d distinguish **where the work came from** from **what it produced**. A menu-bar ticket could say “Requested by Drew” with no parent. If that work later produces a requirement about searchable menu actions, the requirement can link back to the ticket. The board can derive the reverse link, so an agent only has to maintain one reference.
~~~~~

## Codex · question

~~~~~text
When future work is “archived with no trace,” should an existing link from a requirement still open the archived ticket?
- Yes, preserve links (Recommended) — Archive hides the ticket from the board and normal search, but it remains readable by direct link. Remove is a separate choice.
- No, detach links — Archive keeps a copy outside normal browsing, but live documents drop their references to it. Remove discards the copy too.
~~~~~

## Drew · answer

~~~~~text
Let's just remove it. Tickets should be ordered too so visibly I can see the order. So all prefixed with numbers, same ewith plans so 'sequential' documents can be visibly seen. Things like requirements and documentaiton this does not appy to but you can group by feature or other category (maybe this should be nailed down). And of course 'feature' folder to describe specific features and requirements can live in the docs as well.

I think the 'cli' we need at the moment is just 'light skills'. Remove task, work task, add task, re-order tasks, and some are mostly 'sub skills' that are tools other skills will use. use cases: I add a new task and want it worked next we can work it next. But some features have multiple tasks so it will await until those next few work items tasks are done. just standard jira-ish workflows of work. And when starting work documentation, requirements, and features can be read. Let's create a skill suite in this folder that is called 'deep-contenxt-<category>-<action>' or just deep-context-<category> if only one skill is in that category
~~~~~

## Codex

~~~~~text
For this migration, obsolete tickets can be removed. Tickets and plans get sortable decimal prefixes so Finder shows their intended order. Moving a ticket to “next” changes its priority while preserving any prerequisites. Requirements, decisions and feature docs get descriptive names without priority numbers.

I’ll include a lightweight `deep-context-*` skill suite in the plan. Adding, starting, reordering and removing work are the first use cases. Starting a ticket should surface its prerequisites and relevant docs. A user-requested idea can stand on its own without a parent ticket.

**Next question:** If you wanted to understand Aftershock’s menu-bar feature, where would you expect its requirements to live?

- **Inside the feature folder** *(my recommendation)*: `docs/features/menu-bar/` holds the feature overview and its requirements. `docs/requirements/` holds rules that apply across features. Each requirement has one home.
- **Together with all requirements**: `docs/requirements/menu-bar.md` holds those requirements, and `docs/features/menu-bar.md` links to them. This makes browsing requirements across the whole project easier.
~~~~~

## Drew

~~~~~text
Yes
~~~~~

## Codex

~~~~~text
I’ll take that as the feature-folder option. Menu-bar requirements live with the menu-bar overview; cross-feature rules live under `docs/requirements/`. Each requirement has one home.
~~~~~

## Codex · question

~~~~~text
If you move a ticket to the front and it depends on two unfinished tickets lower down, what should “work next” do?
- Start its prerequisites (Recommended) — Keep your chosen ticket first in Finder, show what it’s waiting on, and start the first ready prerequisite in board order.
- Ask before starting — Show what the first ticket is waiting on and let you choose whether to start a prerequisite or switch work.
- Start next ready ticket — Scan the board in visible order and start the first ready ticket, even if it is unrelated to the top ticket.
~~~~~

## Drew · answer

~~~~~text
How are pre-reququisites be tracked? Is this work within the same feature or separate features?
~~~~~

## Codex

~~~~~text
I’d track prerequisites **on the ticket that’s waiting**, using a `depends_on` list of stable ticket IDs. The numeric folder prefix tells you what you want first. The ID stays the same when you reorder the folder, so the dependency still works.

For example, **Search documents from the dashboard** might depend on **Index project documents**. Those tickets belong to different features, but one needs the output of the other. Two tickets in the *same* feature can also depend on each other. Sharing a feature alone doesn’t imply a dependency.

I’d keep three relationships distinct:

- **Feature** tells you which docs and requirements to read.
- **Created from** tells you where the idea came from. It can say “Requested by Drew,” or point to another ticket or document. It doesn’t block work.
- **Depends on** means this ticket must wait for specific work to finish. Only use it when starting now would be premature.

With that model, my recommendation is that **“work next” follows the first ticket’s explicit prerequisites**, while leaving your visible priority order intact. If the dashboard search ticket is first, the agent can tell you, “Search is first. It needs the document index, so I’m starting that ticket.” Does that match what you’d expect?
~~~~~

## Drew

~~~~~text
Yeah I think the skills should notify the user and a decision should be made there. I think the skill suite should evolve with this use case as long as the kernel of the idea of 'deep-context' is in place.
~~~~~

## Codex

~~~~~text
If the first ticket is blocked, the skill will name what it’s waiting on and ask what you want to do. It won’t pick a different ticket or change the order on its own.
~~~~~

## Codex · question

~~~~~text
When a ticket is finished and its lasting requirements and decisions have been saved in `docs/`, what should happen to the ticket itself?
- Keep until cleared (Recommended) — Move it to `work/completed/`, where its links still work. You can explicitly clear it later.
- Remove on completion — Clear it immediately, update dependent tickets, and let the docs carry the lasting outcome.
~~~~~

## Drew · answer

~~~~~text
It can go to work completed but the work completed folder should also be organized by last finished first. So there should be an update pattern described in the complete ticket skill
~~~~~

## Codex

~~~~~text
`work/completed/` will show **most recently finished first**. I’d make that the job of `deep-context-work-complete`: save lasting requirements or decisions in their canonical docs, record the completion time, and move the ticket to the top of `completed/`. Its stable ID stays the same. Backlog numbers express priority; completed numbers express finish order.

If completing the ticket unblocks another one, the skill should tell you which ticket is now ready and leave the decision to start it with you.

**Next question:** When you say “add a task” and a related ticket already exists, should the skill show you the overlap and let you choose **expand the existing ticket** or **create a separate one**? I’d recommend asking only when it finds a concrete overlap, so adding an unrelated idea stays quick.
~~~~~

## Drew

~~~~~text
Yes, I would suggest shuffle through either just active & backlog or also check completed in order to see if something similar was specified already. But this shouldn't be a hefy search either if it gets big, so we should try to have this be a quick minute or less identification and present the highly related skills.
~~~~~

## Codex

~~~~~text
I’ll check how the existing board summarizes tickets so the overlap check can stay quick as the project grows.
~~~~~

## Codex

~~~~~text
I’d include completed tickets in the overlap check. A finished ticket can tell us that a feature already exists, or that the new request extends it. That’s worth knowing before adding work.

`deep-context-work-add` should search **active and backlog first**, then check a compact index of completed tickets. It can match on title, feature and a one-line scope, then open only the strongest candidates. I’d aim for **under a minute** and show at most three matches, each with one sentence explaining the overlap. If the search hits its limit, say what it checked. If there’s no strong match, add the ticket. If there is one, let you decide whether to expand an open ticket, create a follow-up to completed work, or keep the new ticket separate.

**Next question:** For `plans/`, should the visible numbers mean **execution order** or **creation order**? I recommend execution order: the current plan comes first, the next plan follows it, and saying “move this plan up” changes what you see in Finder.
~~~~~

## Drew

~~~~~text
Execution order. The way I see a plan is we can work a specific plan and create a deper sub plan that can be scaffolded off. And that can have subplans. And the 'map' could have a subplan as well etc. And when a plan is completed we can archive it and also update the 'parent' list that the task is completed.
~~~~~

## Codex

~~~~~text
I’ll check how the current plan links to work so we can keep the parent map readable as subplans finish.
~~~~~

## Codex

~~~~~text
Plans are numbered in **execution order among siblings**. A step can start as one line in its parent’s `MAP.md`. When it needs more detail, it gets a numbered subplan folder with its own map. The parent keeps the short description and link; the steps live in the child.

For example, our current plan might have `000020-migrate-this-project/` as its second step. Inside that, `000010-inventory-existing-work/` could be its first subplan. When the inventory is finished, the completion skill archives that subplan and updates the migration map in the same operation: `[x] Inventory existing work`, a one-line outcome, and a working link to the archived plan. The migration plan stays open for its remaining steps.

**Next question:** Does every step in a plan need a ticket on the work board? I recommend **no**. “Agree on folder names” can just be a plan step. “Build the searchable dashboard” deserves a ticket because you may want to prioritize it, hand it off, or track what it depends on. The plan can link to that ticket so there’s only one place to update its work status.
~~~~~

## Drew

~~~~~text
maybe plan can have the prefix stub so init and init-001 for the first sub plan and init-001-001 for a subplan subplan
~~~~~

## Codex

~~~~~text
I like `init-001-001`. If I see that folder or link on its own, I can tell it belongs to the first subplan of `init`. I’d pair the prefix with a descriptive name so you can also tell what the plan covers:

```text
init-project-setup/
├── MAP.md
├── init-001-agree-on-structure/
│   ├── MAP.md
│   └── init-001-001-define-folder-types/
└── init-002-migrate-project/
```

**One choice matters when you reorder.** Suppose you move `migrate-project` ahead of `agree-on-structure`. Should `migrate-project` become `init-001`?

I recommend **yes**. Since you want Finder to show execution order, the numbers should describe the current position. The reorder skill would rename the affected branches, including descendant prefixes, and update their map links together. With three digits to start, it would widen all sibling numbers together if a plan ever needed a thousand children.
~~~~~

## Drew

~~~~~text
Stubs should also be heavily used for ordered and related items btw
~~~~~

## Codex

~~~~~text
I’ll check a plan and a ticket name against that idea so the naming rule works for both.
~~~~~

## Codex

~~~~~text
I’d make a **stub** a short, recognizable name for related items. `menu` tells you what belongs together; a number tells you what comes first. Where the number goes depends on what you’re browsing:

- **Nested plans:** `init-001-folder-layout/` and `init-001-001-define-folder-types/` show ancestry and execution order together.
- **Work board:** `000010-menu-search/` and `000020-dashboard-index/` put priority first, so Finder shows what’s next even when adjacent tickets belong to different features.
- **Feature docs:** `docs/features/menu/requirements.md` gets its context from the folder. It needs neither a number nor another `menu-` prefix.

**One naming decision:** Should `init-001` be a **position that can change** or a **permanent reference**? I recommend a position. If you move the second subplan to the front, it becomes `init-001`, and the reorder skill updates its descendants and links. The descriptive stub stays the same. Does that match how you want to use stubs?
~~~~~

## Drew

~~~~~text
Yeah it should update stubs when reordered
~~~~~

## Codex

~~~~~text
Reordering updates the stubs. If `init-002-migrate-project` moves to first place, it becomes `init-001-migrate-project`, its child `init-002-001-inventory` becomes `init-001-001-inventory`, and links update with them. A useful test is to swap two sibling plans and verify that every link still opens the same plan it did before the move.

**Next question:** Can a plan contain a step that never becomes a board ticket? I recommend **yes**. “Agree on folder names” can be a checkbox in the plan. “Migrate this project” deserves a ticket because you want to prioritize it and track its dependencies. When a step has a ticket, the plan links to it and the ticket owns its work status.
~~~~~

## Drew

~~~~~text
Yes for sure. Simple plans can be orders I describe and can be a plan for a ticket even
~~~~~

## Codex

~~~~~text
A ticket can have a simple plan right in its body. If you say “inventory the files, group them by feature, then check the links,” those are three ordered steps. None needs a separate ticket. If “group them by feature” later needs a subplan, we can expand just that step.

**Next question:** When a ticket’s plan grows into folders and subplans, would you expect to find it **inside the ticket folder** or **under `plans/`, linked from the ticket**? I lean toward keeping it inside the ticket folder when it serves only that ticket. I’d use `plans/` for project plans that coordinate multiple tickets, like our current folder migration.
~~~~~

## Drew

~~~~~text
Hmm, I was expecting 'plans' to be the folder for the plans. A ticket plan can be scaffolded there. Otherwise link plans across multiple directories can cause a problem.
~~~~~

## Codex

~~~~~text
`plans/` is the single home for plans, including plans created for one ticket. If you ask “plan this ticket,” the skill creates the plan under `plans/` and links it from the ticket. If the plan later covers three tickets, all three can point to it without moving or copying it. A simple plan can be one Markdown file with ordered steps; subplans get scaffolded only when needed.

**Next question:** When a subplan finishes, should it move to an `archive/` **inside its parent plan**? That’s my recommendation. The parent map marks the step complete and links to its archived location. When the parent finishes, the whole branch moves together into `plans/archive/`, preserving its history and keeping finished branches out of the active tree.
~~~~~

## Drew

~~~~~text
No, just complete it. In the plan it was referenced you can mark it as complete and update the item as needed. Should be high level overview. Also a new initial plan or 'phase' can exist alongside another plan.
~~~~~

## Codex

~~~~~text
A completed subplan stays where it is. Its parent map marks the step complete and, when useful, records a one-line outcome. The details stay in the subplan. That keeps the parent readable and its links stable.

Top-level plans can sit side by side under `plans/`. Their numbers show intended execution order; that order alone doesn’t make one a prerequisite for another.

**Next question:** If two top-level plans are underway, what should a fresh chat see when it asks for the “current plan”? I’d recommend a short `plans/MAP.md` that marks **one plan as the default focus** and also lists the other active plans. If you ask to work on a specific plan, the agent goes directly there without changing the project’s default. Does that fit?
~~~~~

## Drew

~~~~~text
Plans map yes. the initial plans can be named what their idea is with their sub-plan stubs tying them to the main plan
~~~~~

## Codex

~~~~~text
`plans/MAP.md` will give the high-level view. Each top-level plan gets a descriptive name like `readable-folders` or `project-dashboard`. Its subplans inherit that stub, so `readable-folders-001-inventory` is recognizable even when you see it as a link from a ticket. The map shows which plans are active or complete and links to their details.

**One remaining question about “current”:** If both plans are active and you say **“continue”** in a fresh chat, should the agent follow one plan marked **current** in the map, or show both and ask you to choose? I recommend one explicit current plan. That gives a fresh chat a clear starting point while still letting you say “work on the dashboard” whenever you want.
~~~~~

## Drew

~~~~~text
That should be a skill to continue. And it should provide an option to select if it is unsure. If the chat has been given context it can determine the plan if it thinks it can
~~~~~

## Codex

~~~~~text
`deep-context-continue` should use the context you’ve already given it. If the chat has been discussing dashboard search and that clearly matches an active plan, it can say “Continuing Project Dashboard at the search-index step” and proceed. If two plans fit, it should show their names and next steps and let you choose. Continuing a plan in one chat shouldn’t silently change another chat’s focus.

<proposed_plan>
# Make Deep Context readable and Markdown-first

## Folder standard

- Keep a short project entry that points to `plans/MAP.md`, the work board and the docs index. Root `AGENTS.md` and `CLAUDE.md` direct agents to that same entry. The map gives a fresh agent enough context to select its next read.
- Keep all plans under `plans/`, including plans for individual tickets. Name top-level plans for their ideas. Number siblings in execution order and carry the parent stub into descendant names. Multiple top-level plans can be active. A simple plan can be a single Markdown file with ordered steps.
- Keep each ticket in its own descriptive, numbered folder under `work/backlog/`, `work/active/` or `work/completed/`. Open-ticket numbers show priority. Completed tickets sort most recently finished first. Stable ticket IDs survive reordering.
- Keep feature overviews and feature-specific requirements together under `docs/features/`. Keep cross-feature requirements and decisions in their respective `docs/` folders. Knowledge documents have descriptive names without priority numbers.

## Lightweight skills

- Use the `deep-context-<category>-<action>` naming pattern, or `deep-context-<category>` for a single-purpose category. `deep-context-continue` selects from chat context and the plans map, asking only when the choice is unclear.
- Support adding, starting, reordering, completing and removing work. Adding work checks compact summaries of active and backlog tickets first, then completed tickets. Aim for a minute or less; show at most three strong matches and let the user choose how to handle overlap.
- Keep origin, feature and dependency distinct. A user idea needs no parent. If the next ticket is blocked, show the unfinished prerequisites and ask what to do. On completion, save lasting knowledge, move the ticket to the top of completed work, and identify newly ready tickets.
- Support scaffolding, reordering and completing plans. Reordering updates numbered stubs, descendant paths and references together. Completing a subplan leaves it in place and updates the parent map with its status and a short outcome. A plan step can link to a ticket or stand alone.

## Migrate this project

1. Inventory existing goals, tickets, plans and knowledge. Identify what survives, combines, moves or can be removed. Preserve unique content and unresolved goals during triage; obsolete tickets can be removed without creating retirement stubs.
2. Define the pattern with one small example tree. Use direct Markdown edits and small deterministic helpers where needed, particularly for renames and link checks. The existing CLI repair and backward compatibility are not prerequisites.
3. Apply the agreed structure to this repository and update its entry instructions and maps. Keep the searchable, read-only localhost dashboard next. It should browse work and documents across projects using the same files agents maintain.
4. After the structure holds up in use, test selective retrieval with a fresh chat: can it find the relevant work, requirement and prior decision without reading the entire tree?

## Acceptance checks

- In Finder, ticket priority, plan execution order and most recent completions are visible from folder names.
- Swap two sibling plans with descendants. Every link still resolves to the same logical plan. Complete a child and verify its parent shows the outcome without moving the child.
- Add an overlapping ticket, try to start a blocked ticket, and complete a prerequisite. Verify the skills surface the relevant choice and preserve user control.
- Try `continue` once with clear chat context and once with two plausible plans. The first resumes directly; the second offers a choice.
- Compare the migrated tree with the inventory and resolve links before calling migration complete.
</proposed_plan>
~~~~~

## Drew

~~~~~text
The plan looks good. What I want is this convo saved into deep-context now. And I'm going to be bold here: you can delete ALL EXISTING PREVIOUS DEEP CONTEXT ITEMS. Let's start fresh with this project. Create skills, claude.md, and a deep-context folder seeded with requirements, tasks, plans, docs, etc from this interview chat.
~~~~~

## Codex

~~~~~text
<proposed_plan>
# Start Deep Context fresh from this interview

The interview replaces the old Deep Context records as this project’s starting point. This is a clean reset, not a migration. No files have changed in this planning turn.

## Save the interview and reset the context

- Save the product-design exchange from the request for a “grilling session” through this reset instruction as `docs/interviews/folder-design.md`. Preserve the questions, answers and corrections in order. Mark it as design history so an agent can consult it without loading it on every visit.
- Stage the new tree and check it before replacing `.deep-context/`. Remove the old context items, including stale plans, work records, indexes, scratch and local state. Check the exact target and handle symlinks as links. The reset applies to the project’s context store. Plugin source, Git history, other projects and personal skills are outside that boundary.
- Create or update the repository’s `CLAUDE.md` and `AGENTS.md` so both point to the same short `.deep-context/START.md`. Replace old CLI and layout instructions in the project-owned sections; preserve unrelated repository instructions.

## Seed a usable project

```text
.deep-context/
├── START.md
├── plans/
│   ├── MAP.md
│   ├── 000010-readable-folders/
│   │   └── MAP.md
│   └── 000020-project-dashboard/
│       └── MAP.md
├── work/
│   ├── MAP.md
│   ├── backlog/
│   ├── active/
│   └── completed/
└── docs/
    ├── INDEX.md
    ├── features/
    ├── requirements/
    ├── decisions/
    └── interviews/
```

- Seed the maps, requirements, decisions and work tickets with **actual outcomes from this interview**. Cover folder readability, work ordering, dependencies, overlap detection, plan hierarchy, context-aware continuation and the searchable read-only dashboard. Give each accepted rule one canonical home.
- Use `work/` for tracked tasks. Keep all plans under `plans/`, including ticket-specific plans. A simple ordered step need not become a ticket. Give nested plans descriptive inherited stubs, such as `readable-folders-001-define-layout`. Completed subplans stay in place; their parent map records completion.
- Mark work completed only after its deliverable passes its checks. Seed the dashboard as the next product milestone and the fresh-agent selective-reading trial as later work. Do not import outstanding goals from the old store by default.

## Create the lightweight skill suite

- Add repository-owned skills for **continue**, **work add/start/reorder/complete/remove**, and **plan scaffold/reorder/complete**. Use names such as `deep-context-continue` and `deep-context-work-add`. Share small local helpers for deterministic operations such as updating paths and checking links. Routine use should require no installed CLI.
- `continue` uses the chat’s context and the plans map. It resumes directly when the match is clear and offers choices when uncertain. Starting blocked work names the prerequisites and asks the user what to do.
- Adding work checks compact summaries across active, backlog and completed tickets. Aim for under a minute and present at most three strong matches. Reordering updates visible prefixes, descendant stubs and links. Completing work promotes lasting knowledge and puts the ticket first in `completed/`.

## Verify the reset

Use a small fixture to exercise nested reordering, completion ordering, overlap detection, blocked work and ambiguous continuation. Check that links still reach their intended items after renames. Then follow the repository entry into the **actual seeded tree** and verify that a new reader can find the current plans, next ticket and relevant requirements without opening the interview or scanning every document. The read-only dashboard remains the next build.
</proposed_plan>
~~~~~

## Drew

~~~~~text
PLEASE IMPLEMENT THIS PLAN:
# Start Deep Context fresh from this interview

The interview replaces the old Deep Context records as this project’s starting point. This is a clean reset, not a migration. No files have changed in this planning turn.

## Save the interview and reset the context

- Save the product-design exchange from the request for a “grilling session” through this reset instruction as `docs/interviews/folder-design.md`. Preserve the questions, answers and corrections in order. Mark it as design history so an agent can consult it without loading it on every visit.
- Stage the new tree and check it before replacing `.deep-context/`. Remove the old context items, including stale plans, work records, indexes, scratch and local state. Check the exact target and handle symlinks as links. The reset applies to the project’s context store. Plugin source, Git history, other projects and personal skills are outside that boundary.
- Create or update the repository’s `CLAUDE.md` and `AGENTS.md` so both point to the same short `.deep-context/START.md`. Replace old CLI and layout instructions in the project-owned sections; preserve unrelated repository instructions.

## Seed a usable project

```text
.deep-context/
├── START.md
├── plans/
│   ├── MAP.md
│   ├── 000010-readable-folders/
│   │   └── MAP.md
│   └── 000020-project-dashboard/
│       └── MAP.md
├── work/
│   ├── MAP.md
│   ├── backlog/
│   ├── active/
│   └── completed/
└── docs/
    ├── INDEX.md
    ├── features/
    ├── requirements/
    ├── decisions/
    └── interviews/
```

- Seed the maps, requirements, decisions and work tickets with **actual outcomes from this interview**. Cover folder readability, work ordering, dependencies, overlap detection, plan hierarchy, context-aware continuation and the searchable read-only dashboard. Give each accepted rule one canonical home.
- Use `work/` for tracked tasks. Keep all plans under `plans/`, including ticket-specific plans. A simple ordered step need not become a ticket. Give nested plans descriptive inherited stubs, such as `readable-folders-001-define-layout`. Completed subplans stay in place; their parent map records completion.
- Mark work completed only after its deliverable passes its checks. Seed the dashboard as the next product milestone and the fresh-agent selective-reading trial as later work. Do not import outstanding goals from the old store by default.

## Create the lightweight skill suite

- Add repository-owned skills for **continue**, **work add/start/reorder/complete/remove**, and **plan scaffold/reorder/complete**. Use names such as `deep-context-continue` and `deep-context-work-add`. Share small local helpers for deterministic operations such as updating paths and checking links. Routine use should require no installed CLI.
- `continue` uses the chat’s context and the plans map. It resumes directly when the match is clear and offers choices when uncertain. Starting blocked work names the prerequisites and asks the user what to do.
- Adding work checks compact summaries across active, backlog and completed tickets. Aim for under a minute and present at most three strong matches. Reordering updates visible prefixes, descendant stubs and links. Completing work promotes lasting knowledge and puts the ticket first in `completed/`.

## Verify the reset

Use a small fixture to exercise nested reordering, completion ordering, overlap detection, blocked work and ambiguous continuation. Check that links still reach their intended items after renames. Then follow the repository entry into the **actual seeded tree** and verify that a new reader can find the current plans, next ticket and relevant requirements without opening the interview or scanning every document. The read-only dashboard remains the next build.
~~~~~
