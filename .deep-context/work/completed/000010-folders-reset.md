---
id: WORK-FOLDERS-RESET
title: Reset the project context
feature: readable-folders
depends_on: []
origin: user
completed_at: 2026-11-04T11:32:33-08:00
---

# Reset the project context

Replace this project's previous context store with records from the design interview. Seed the [folder standard](../../docs/requirements/readable-folders.md), the [workflows](../../docs/knowledge.md), and the agent skills. [Plan](../../plans/000010-readable-folders.md)

## Verified November 4, 2026

The staged replacement and live project passed the Markdown link, ticket identity, prerequisite and board order checks. Both repository entry files resolve to START.md. All nine repository skill files passed skill validation. Five disposable path tests covered nested renumbering, link targets, movement into a populated completed lane, and rejection of unsafe moves.

A fresh reader found both plans, the dashboard ticket and its feature requirements using six files, starting at AGENTS.md. In a disposable project with two active plans, it offered both on “continue”, reported the unfinished prerequisite on “start”, and found relevant open and finished tickets on “add”. The later fresh-agent retrieval trial remains separate.

Repeat the local checks from the repository root with `python3 -m unittest discover -s skills/tests` and `python3 skills/_shared/check_maps.py .deep-context`.
