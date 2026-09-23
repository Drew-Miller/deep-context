---
id: REQ-DC-032
title: Keep one context home in the primary repository checkout
status: implemented
feature: bootstrap
origin: confirmed
source: doc/decisions/DEC-DC-002-repository-memory-and-plugin-scope.md
---

# Keep one context home in the primary repository checkout

New repository initialization creates `<primary-checkout>/.deep-context/`. Every Git worktree resolves that same project home by repository identity; it must not create a competing context home. Machine state lives in `.local/`, without nested `.deep-context/.deep-context/`.
