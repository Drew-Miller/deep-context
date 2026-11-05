# Deep Context

Deep Context gives an AI-assisted project a readable place for plans, work and durable knowledge. Agents follow small maps to find relevant context, and people can browse the same Markdown files.

## Initialize a new project

Give your agent a local path or repository URL for [INITIALIZE.md](INITIALIZE.md), then ask:

> Initialize Deep Context in this project using the guide.

The agent copies the starter and lightweight skills into your project, adds instructions to `AGENTS.md`, and checks the resulting links. Python 3 is needed for the small validation and ordering helpers. A fresh agent session may be needed for skill discovery.

Each project owns its copy. See the guide for updating skills from a newer checkout. Existing projects with a `.deep-context` folder require a manual conversion.

## Project structure

```text
.deep-context/
├── START.md                 # small entry map
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
└── templates/               # starter record templates
```

Plan and ticket filenames use sortable numeric prefixes. Keep a small subject in one descriptive Markdown file with headings; use a subject folder only when splitting it into multiple documents improves readability. Feature requirements live with their feature; cross-feature requirements and decisions live under `docs/`. Each ticket can list its origin and prerequisites.

Try “add this to the backlog,” “move the dashboard ticket next,” “plan this ticket,” or “continue the current plan.” The skills check for overlap and blockers and ask when the next choice is unclear.

Use **plan → phases → work items**. A plan is a short overview and linked phase order. A phase is a developed feature idea whose work file contains scope, ordered requests, implementation, verification and the next action. Create subplans only when the overall plan becomes difficult to follow; separate phase packets and verification files are unnecessary by default. Implemented, accepted behavior becomes application requirements; dropped or replaced requests do not require permanent history.

The starter includes the [canonical terminology and record structure](starter/.deep-context/docs/requirements/plans-phases-and-work.md). Initialization copies these rules with the templates and skills so another agent or project can follow the same model.
