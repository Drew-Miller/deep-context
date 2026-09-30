---
id: DEC-DC-006
title: Separate readable paths and work order from stable identities
status: accepted
features: [bootstrap, routing, tasks]
source: DC-14 implementation and coordinator review, 2026-09-24
---

# Readable paths and explicit work order

Canonical record filenames use a readable slug plus the existing stable ID. A title change leaves the path intact until an explicit rename; migration keeps one-hop forwarding files so old references remain readable. The migration uses bounded recovery journals and refuses intervening edits. Machine-facing task state, chat bindings, archives, and fixed routing filenames retain their existing paths.

Backlog queue positions live in canonical Backlog frontmatter. Deep Task positions live in local `tasks/ORDER.md` keyed by task UUID, outside owned task state. Generated views project these positions, while the project's live schedule remains a separate declared authority. This avoids renaming identities to express priority and avoids changing another chat's task revision when work is reordered. The DC-14 implementation report records the migration, tests, and remaining desktop verification limit.
