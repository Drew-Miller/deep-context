# Coordinator implementation contracts

Canonical product invariants live in `docs/architecture.md`, feature contracts, and accepted atomic requirements. This file governs this repository's coordinator process:

- The coordinator alone accepts worker results and updates the canonical work-item metadata and derived `work/INDEX.md`.
- Plans, packets and handoffs live with their execution task under `tasks/`. Closed raw execution evidence is archived under `.local/archives/`; accepted product conclusions are promoted to `docs/` and concise completion outcomes to the work item.
- Verification gates retain their commands, results, date, source checkpoint, fixture or environment class, and evidence location. A later source change makes affected gates historical until rerun.
