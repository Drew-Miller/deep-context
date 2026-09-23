<div align="center">

# Deep Context

### Durable, selectively readable project memory for Codex

Keep the knowledge that matters in a clear filesystem structure, so a project can survive handoffs, task switches, and context compaction without turning every prompt into a data dump.

`TypeScript` · `Codex plugin` · `Git worktrees` · `Evidence-bound closure`

</div>

<br />

> **Deep Context makes project knowledge recoverable.** It creates a human-readable control tree for architecture, requirements, decisions, source provenance, and scoped task state. Agents load only the context relevant to the work at hand.

## Why Deep Context?

Long-running projects have two failure modes: important decisions vanish with a chat, or every new task begins by loading far more context than it needs. Deep Context treats context as a maintained project artifact instead.

| Instead of | Deep Context provides |
| --- | --- |
| Reconstructing project history from chat | Canonical files for architecture, features, requirements, decisions, and source provenance |
| Giving every task the whole codebase | A context map and explicit, bounded dependency manifests |
| Losing task state during a handoff | Checkpointable task records with an exact next safe action |
| Closing work from memory | An evidence-bound closure review before cleanup |

## What it includes

- A deterministic CLI to configure a control home, initialize projects, rebuild indexes, validate context, and manage task lifecycle.
- Four Codex skills: setup, project initialization, scoped task creation, and evidence-bound task closure.
- A Git-worktree workflow that keeps task work isolated while preserving source-repository ownership.
- Generated routing indexes that are cheap to read and safe to rebuild.

## Installation

### Prerequisites

- [Node.js](https://nodejs.org/) 18.18 or later
- [pnpm](https://pnpm.io/)
- Git, for repository-backed projects and task worktrees

### Install from this repository

```bash
git clone <your-fork-or-clone-url> deep-context
cd deep-context
pnpm install
pnpm build
```

The build produces the bundled CLI at `dist/cli.mjs`. Confirm that it is ready:

```bash
node bin/deep-context.cjs --help
```

### Configure a Deep Context home

Choose a directory outside the repositories you will manage. The CLI records the location locally and adds a small, marker-delimited routing block to Codex's global `AGENTS.md`.

```bash
node bin/deep-context.cjs setup --home "$HOME/Developer/Deep Context"
```

For a different global instruction file, pass it explicitly:

```bash
node bin/deep-context.cjs setup \
  --home "$HOME/Developer/Deep Context" \
  --agents /path/to/AGENTS.md
```

## How to use it

### 1. Initialize a project

For an existing Git repository:

```bash
node /path/to/deep-context/bin/deep-context.cjs init --repo /path/to/repository
```

For a new, empty context project:

```bash
node /path/to/deep-context/bin/deep-context.cjs init --empty --name my-project
```

Initialization creates a self-describing project tree. When attached to an existing repository, it inventories source evidence but does not modify that repository.

```text
my-project/
├── AGENTS.md                 # Routing rules for agents
├── CONTEXT_MAP.md            # Lightweight map of available knowledge
├── PROJECT.md                # Product boundary and durable overview
├── doc/
│   ├── ARCHITECTURE.md
│   ├── features/             # Feature definitions and contracts
│   ├── requirements/         # Atomic accepted requirements
│   ├── decisions/            # Durable decisions
│   ├── sources/              # Import provenance
│   └── shelf/                # Non-binding future intent
├── tasks/                    # Scoped, checkpointable task records
└── repo → /path/to/source    # Present for repository-backed projects
```

### 2. Add durable project knowledge

Open the generated `AGENTS.md` and `CONTEXT_MAP.md` first. Then promote confirmed knowledge into the canonical files under `doc/`:

- architecture and feature boundaries
- feature contracts and accepted requirements
- decisions that should outlive a task
- source dispositions and unresolved future intent

Refresh the generated indexes and check the project whenever canonical files change:

```bash
node /path/to/deep-context/bin/deep-context.cjs rebuild-indexes --project /path/to/my-project
node /path/to/deep-context/bin/deep-context.cjs validate --project /path/to/my-project
```

### 3. Create a scoped task

Create a task from the control project. For repository-backed projects, the CLI creates a dedicated Git worktree and branch.

```bash
node /path/to/deep-context/bin/deep-context.cjs create-task add-export \
  --project /path/to/my-project \
  --feature routing \
  --description "Add an export flow with validation."
```

Before beginning implementation, fill in the generated `TASK_CONTEXT.md` and select only the feature context and direct dependencies required by the work. Make code changes only inside the task’s `worktree/` directory.

Checkpoint meaningful progress before a pause, handoff, or context reset:

```bash
node /path/to/deep-context/bin/deep-context.cjs checkpoint-task add-export \
  --project /path/to/my-project \
  --next-action "Run the focused routing tests and review the diff."
```

### 4. Review and close the task

Closure is deliberately a two-step process. First create a closure review tied to the current evidence:

```bash
node /path/to/deep-context/bin/deep-context.cjs close-task add-export \
  --project /path/to/my-project
```

Review the task record, final diff, and only the relevant canonical context. Promote durable findings, rebuild indexes, validate the project, and generate a fresh review after those edits. Once the review is approved and the evidence is unchanged, finalization archives task context and removes its worktree without committing, merging, pushing, or deploying:

```bash
node /path/to/deep-context/bin/deep-context.cjs close-task add-export \
  --project /path/to/my-project \
  --finalize
```

## CLI reference

| Command | Purpose |
| --- | --- |
| `setup --home <path>` | Configure the local control home and global routing instructions |
| `init --repo <path>` | Create a project control tree attached to an existing Git repository |
| `init --empty --name <name>` | Create an empty project control tree |
| `rebuild-indexes` | Regenerate lightweight routing indexes |
| `validate` | Check project structure, schemas, references, and indexes |
| `create-task <name>` | Create a scoped task record and Git worktree |
| `checkpoint-task <name>` | Persist task state and its next safe action |
| `close-task <name>` | Prepare an evidence-bound closure review |
| `close-task <name> --finalize` | Archive an approved, unchanged task and remove its worktree |

Run `node bin/deep-context.cjs <command> --help` for command-specific options.

## Development

```bash
pnpm typecheck
pnpm test
pnpm build
```

The project uses TypeScript, Vitest, and pnpm. The plugin metadata lives in `.codex-plugin/plugin.json`; the skills it exposes live under `skills/`.

## Safety model

Deep Context is designed to preserve repository ownership and make cleanup intentional:

- Project initialization inventories attached repositories without changing them.
- Task creation rejects unsafe or ambiguous worktree and branch states.
- Closure finalization checks that approved evidence has not changed.
