---
name: deep-context-continue
description: Continue selected Deep Context work or recover the next action after interruption.
---

# Deep Context continue

Start at the context root's `START.md` and follow the relevant map. The hierarchy is plan → phases → work items; definitions are in `docs/requirements/plans-phases-and-work.md`.

Use chat context to select the overview plan or phase. The plan supplies order; open only the selected phase record to recover its ordered work items, implementation, verification, blockers and next action. These belong in one descriptive phase file by default. Resume directly when the match is clear. If several plans or phases fit, offer their names and next actions and ask which to continue. A read-only question does not start work.

If continuing work changes rendered context, follow the selected write skill and refresh the existing local dashboard once after the editing batch. A status question remains read-only.
