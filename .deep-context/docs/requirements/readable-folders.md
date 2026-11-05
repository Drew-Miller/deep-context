# Readable folders

The repository defines a project structure that a person can browse in a file manager and an application can index without an installed CLI. Markdown contains the durable records. Lightweight skills keep names, maps and references consistent.

| Folder | Belongs here |
| --- | --- |
| `plans/` | Short overview plans linking phases in execution order; optional subplans only when needed |
| `work/` | Phase execution records and standalone requests in backlog, active and completed lanes |
| `docs/features/` | Descriptive feature documents; split into subject folders only when needed |
| `docs/requirements/` | Rules that apply across features |
| `docs/decisions/` | Accepted choices and rationale |
| `docs/notes/` | Substantive follow-up discussion and unresolved questions, linked from work or plans |
| `docs/interviews/` | Design history, consulted when the original discussion matters |

Use descriptive names. Prefix ordered top-level plans and tickets with decimal ranks of uniform width, initially six digits, with gaps of ten. Grow the width across a sibling group together before overflow. Requirements and other reference documents use names by topic without order numbers. Keep each accepted rule in one canonical record; cross-link when another feature relies on it.

## Descriptive documents first

Use descriptive filenames so editor tabs identify the subject. A small plan, work item or feature is one Markdown file with headings for its topics. Do not wrap a single subject document in a folder or give every subject a generic `MAP.md`, `work.md` or `requirements.md` filename. This supersedes the earlier always-a-ticket-folder convention.

When a document becomes difficult to read or needs independently useful supporting records, split it into a subject folder. Give the entry and supporting files descriptive names and repair all references. Category folders such as status lanes, requirements and decisions remain valid even when they contain one record. Required external entry filenames such as Codex `SKILL.md` are exceptions.

The small navigation records are `plans/plans.md`, `work/work-board.md` and `docs/knowledge.md`. Ordered plan and ticket files or split-subject folders keep sortable decimal prefixes; IDs are independent of paths.

For the canonical hierarchy and contents of each record, follow [plans, phases and work items](plans-phases-and-work.md). Keep phase implementation and verification together by default.
