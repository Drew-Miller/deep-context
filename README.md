<p align="center">
  <img src="assets/deep-context-pattern.svg" alt="Deep Context layered line pattern" width="100%" />
</p>

<div align="center">

<img src="assets/deep-context-mark.svg" alt="Deep Context mark: three nested layers around a focused center" width="92" />

# Deep Context

### Durable, selectively readable project memory for Codex

Keep the knowledge that matters in a clear filesystem structure, so a project can survive handoffs, task switches, and context compaction without turning every prompt into a data dump.

<sub>Codex plugin · Git worktrees · Evidence-bound closure</sub>

</div>

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

- A deterministic CLI for repository storage, indexes, validation, migration, and task lifecycle. Maintenance commands are agent tooling.
- Three user-facing Codex skills: `deep-init`, `deep-task`, and `deep-close`.
- A Git-worktree workflow that keeps task work isolated while preserving source-repository ownership.
- Generated routing indexes that are cheap to read and safe to rebuild.

## Installation

### Prerequisites

- [Node.js](https://nodejs.org/) 20 or later
- Git, for repository-backed projects and task worktrees

### Install from the marketplace

```bash
codex plugin marketplace add Drew-Miller/deep-context
codex plugin add deep-context@deep-context-repo
```

The marketplace installs only `plugins/deep-context/`, including its committed, self-contained CLI. Installation requires no pnpm, build, or dependency download. Source, tests, development dependencies, Git metadata, and project memory remain outside the package. Skills are plugin-scoped; no copies are installed into managed projects.

Git pushes do not automatically replace an installed plugin snapshot. After pushing an update, refresh the marketplace and reinstall or refresh the plugin, then start a new Codex task:

```bash
codex plugin marketplace upgrade deep-context-repo
codex plugin add deep-context@deep-context-repo
```

During local development, point a local marketplace at `plugins/deep-context/`; use the plugin cachebuster and reinstall flow to test unpushed changes. Do not maintain duplicate per-project copies of the skills.

### Optional legacy home configuration

New repository projects store context inside the primary checkout. A separate home is only needed for empty projects and legacy external-home compatibility.

```bash
node plugins/deep-context/bin/deep-context.cjs setup --home "$HOME/Developer/Deep Context"
```

For a different global instruction file, pass it explicitly:

```bash
node plugins/deep-context/bin/deep-context.cjs setup \
  --home "$HOME/Developer/Deep Context" \
  --agents /path/to/AGENTS.md
```

## How to use it

### 1. Initialize a project

For an existing Git repository:

```bash
node /path/to/deep-context/plugins/deep-context/bin/deep-context.cjs init --repo /path/to/repository
```

For a new, empty context project:

```bash
node /path/to/deep-context/plugins/deep-context/bin/deep-context.cjs init --empty --name my-project
```

Initialization creates `<primary-checkout>/.deep-context/` and installs a marker-delimited route in the repository root `AGENTS.md`. It preserves existing source instructions and does not stage or commit. Import inventory does not include context storage.

```text
repository/
├── AGENTS.md                 # Source instructions plus managed route
└── .deep-context/
    ├── AGENTS.md             # Context routing
    ├── CONTEXT_MAP.md        # Lightweight knowledge map
    ├── PROJECT.md            # Durable overview
    ├── doc/
    │   ├── ARCHITECTURE.md
    │   ├── features/             # Feature definitions and contracts
    │   ├── requirements/         # Atomic accepted requirements
    │   ├── decisions/            # Durable decisions
    │   ├── sources/              # Import provenance
    │   ├── backlog/              # Proposals with elevator pitches
    │   └── active/               # Accepted work objectives
    ├── tasks/                # Local task and chat memory
    ├── .local/               # Local state, journals, raw archives
    └── repo → /path/to/source
```

### 2. Add durable project knowledge

Open the generated `AGENTS.md` and `CONTEXT_MAP.md` first. Then promote confirmed knowledge into the canonical files under `doc/`:

- architecture and feature boundaries
- feature contracts and accepted requirements
- decisions that should outlive a task
- source dispositions and unresolved future intent

The agent refreshes indexes and validates changed context as part of normal work. These maintenance commands are available for diagnosis:

```bash
node /path/to/deep-context/plugins/deep-context/bin/deep-context.cjs rebuild-indexes --project /path/to/my-project
node /path/to/deep-context/plugins/deep-context/bin/deep-context.cjs validate --project /path/to/my-project
```

### 3. Start or resume task memory

Use `deep-task` in a Codex Project chat. Describe new work or name an existing task to continue. The skill derives a task name, associates the chat when runtime identity is available, and reads only selected context. An unbound chat stays at project scope. The agent captures useful decisions, discoveries, blockers, evidence, and future ideas during work.

```bash
node /path/to/deep-context/plugins/deep-context/bin/deep-context.cjs start-task \
  --project /path/to/repository/.deep-context \
  --description "Add an export flow with validation." \
  --chat-id <runtime-chat-id> \
  --json
```

When runtime chat identity is missing, use the returned task path and binding ID explicitly. A later chat may continue a named task; transferring active ownership requires authorization.

Task memory alone does not authorize source edits. Before source work, explicitly attach the permitted mode and path through `attach-source`; the command records source ownership and checks the saved revision.

The agent checkpoints before a pause, handoff, long operation, or completion. The CLI operation remains available to the agent:

```bash
node /path/to/deep-context/plugins/deep-context/bin/deep-context.cjs save-task <task-id-or-path> \
  --project /path/to/repository/.deep-context \
  --next-action "Run the focused routing tests and review the diff." \
  --note "Export validation is implemented; focused tests remain." \
  --expected-revision <state-revision> \
  --binding-id <binding-id> \
  --chat-id <runtime-chat-id> \
  --json
```

### 4. Review and close the task

Use `deep-close` to review, promote durable knowledge, and finalize eligible cleanup. The agent performs the two CLI stages below; unresolved findings or cleanup blockers are surfaced rather than bypassed.

```bash
node /path/to/deep-context/plugins/deep-context/bin/deep-context.cjs close-task <task-id-or-path> \
  --project /path/to/repository/.deep-context \
  --chat-id <runtime-chat-id> \
  --binding-id <binding-id> \
  --expected-revision <state-revision>
```

Review the task record, final diff, and only the relevant canonical context. Promote durable findings, rebuild indexes, validate the project, and generate a fresh review after those edits. Once the review is approved and the evidence is unchanged, finalization archives task context and removes its worktree without committing, merging, pushing, or deploying:

```bash
node /path/to/deep-context/plugins/deep-context/bin/deep-context.cjs close-task <task-id-or-path> \
  --project /path/to/repository/.deep-context \
  --chat-id <runtime-chat-id> \
  --binding-id <binding-id> \
  --expected-revision <state-revision> \
  --finalize
```

## CLI reference

| Command | Purpose |
| --- | --- |
| `setup --home <path>` | Configure the local control home and global routing instructions |
| `init --repo <path>` | Create a project control tree attached to an existing Git repository |
| `init --empty --name <name>` | Create an empty project control tree |
| `migrate-project <old-path> --repo <path>` | Validate in-repo copy, keep a dated backup, and redirect the old home |
| `capture-backlog --title --pitch --provenance` | Save a non-binding proposal with an elevator pitch |
| `activate-backlog <id> --objective <text>` | Accept an objective after checking related and opposing work |
| `repair-context` | Recover an interrupted Backlog write when no intervening edit conflicts |
| `rebuild-indexes` | Regenerate lightweight routing indexes |
| `validate` | Check project structure, schemas, references, and indexes |
| `start-task --description <text>` | Create explicit task memory and optionally bind the current chat |
| `resolve-task --task <id-or-path>` | Inspect an explicit task selection without changing it |
| `repair-tasks` | Recover interrupted task writes; refuses conflicting notes |
| `register-project <path>` | Rebuild an external-home repository association |
| `resume-task <id-or-path>` | Resume task memory; `--takeover` transfers an active owner explicitly |
| `save-task <id-or-path>` | Save chat notes and a revision-guarded checkpoint |
| `attach-source <id-or-path>` | Explicitly attach an allowed source execution mode and path |
| `create-task <name>` | Create a scoped task record and Git worktree |
| `checkpoint-task <name>` | Persist task state and its next safe action |
| `close-task <name>` | Prepare an evidence-bound closure review |
| `close-task <name> --finalize` | Archive an approved, unchanged task and remove its worktree |

The public skills are only `deep-init`, `deep-task`, and `deep-close`. Setup, save, resume, checkpoint, index, and closure subcommands remain agent tooling and compatibility interfaces. Durable `doc/` files and generated indexes are trackable; `tasks/`, `.local/`, and `repo` stay local. All worktrees resolve the primary checkout's context.

## Development

Development requires [pnpm](https://pnpm.io/). Clone this repository and run `pnpm install` first.

```bash
pnpm typecheck
pnpm test
pnpm build
pnpm check:package
```

The project uses TypeScript, Vitest, and pnpm. The plugin metadata lives in `plugins/deep-context/.codex-plugin/plugin.json`; the skills it exposes live under `plugins/deep-context/skills/`.

## Safety model

Deep Context is designed to preserve repository ownership and make cleanup intentional:

- Import inventory is read-only; explicit initialization may install the requested source startup route.
- Task creation rejects unsafe or ambiguous worktree and branch states.
- Closure finalization checks that approved evidence has not changed.

The legacy `templates/project/PROJECT_CONTEXT_AGENT.md.template` inside the package is retained only for exact-match recognition and removal of older generated agents. It is not installed as reusable project behavior.
