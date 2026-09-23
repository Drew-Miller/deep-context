# Deep Context Architecture

## Durable memory model

Canonical Markdown files are the durable source of truth. Generated indexes are disposable projections used to select canonical bodies. The primary checkout owns `.deep-context/`; its `.local/state.json` stores resolver identity only. Git worktrees share that project context.

The startup route is:

```text
nearest AGENTS.md
  → CONTEXT_MAP.md
  → task context and state when applicable
  → lightweight project indexes
  → selected canonical frontmatter
  → selected complete bodies
```

## Agent and CLI boundary

- Plugin-scoped skills classify architecture, features, contracts, requirements, Backlog intent, active objectives, drift, and promotions. No reusable agent or skill is installed into each project.
- The CLI performs deterministic configuration, atomic writes, source inventory, index regeneration, structural validation, worktree creation, evidence hashing, and guarded cleanup.
- The CLI never presents mechanical validation as semantic proof.

## Context lifetime

- Project architecture, features, contracts, requirements, decisions, source provenance, Backlog proposals, active objectives, and concise closure reports are durable and Git-trackable.
- Task state, worklogs, worktrees, chats, raw archives, and machine state are local and ignored by Git.
- Closure must promote durable discoveries before task cleanup and preserve raw non-worktree records under `.local/archives/` as a recovery backstop.

## Routing

Features use `none`, `contract`, `feature`, or `deep`. Context expands one explicit edge at a time; a dependency never inherits its parent's context level or recursively expands without evidence.

## Safety

Repository imports do not follow source symlinks or read protected file bodies. Task worktrees require a committed source repository. Closure review is bound to hashes of Git evidence, task notes, and canonical context and is invalidated by later changes.

## Desktop workflow, DC-09

The three user entries are deep-init, deep-task, and deep-close. Task UUID, shared state, per-chat notes, runtime association, and source ownership remain separate identities. Read-only and no-source tasks need no worktree. Initialization supplies a root routing block; validated external migrations retain redirects and backups. Canonical binding files survive reverse-index loss, and ownership transfers load predecessor notes. The agent saves useful memory during normal work; no background service can recover thoughts not written before interruption.

Write journals preserve before/after contents for explicit repair, never silent overwrite. Closure archives every note locally and removes only clean owned worktrees. A staged cleanup receipt permits evidence-checked retry; a partial archive created before its receipt requires explicit inspection. Runtime IDs remain an optional adapter rather than a guaranteed desktop API. See doc/reports/DC-08-IMPLEMENTATION.md for prior gates and the live ledger for pending desktop acceptance.

## Marketplace package boundary, DC-10

`plugins/deep-context/` is the single installable runtime: manifest, three skills, launcher, committed self-contained CLI bundle, and templates. The repository catalog points to that directory. Development source, tests, dependencies, assets, Git metadata, and this framework’s context remain outside it. Node.js 20 or later is required at runtime; pnpm is development-only. Template resolution uses module-relative package and development paths, never the caller’s working directory. The legacy project-agent template remains exact-match migration evidence only. An explicit allowlist and an external temporary-copy lifecycle check enforce the boundary independently of desktop acceptance.
