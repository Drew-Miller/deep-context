---
id: DEC-DC-007
title: Keep three core workflow entries while packaging focused utility skills
status: accepted
features: [bootstrap, routing, tasks, metrics]
source: User-authorized DC-15 reusable Deep Audit milestone and DC-11 Deep Stats implementation, 2026-09-24
amends: DEC-DC-002
---

# Core workflow and utility skills

`deep-init`, `deep-task`, and `deep-close` remain the three core workflow entries. The plugin may also package focused utilities such as `deep-stats` and `deep-audit`. Each utility uses the same project authority and source ownership rules. `deep-audit` inventories and diagnoses an initialized project and proposes an ordered cleanup plan; it does not itself authorize repairs, cleanup, installation, or publication.

This decision supersedes only the exact-three-total-skills wording in DEC-DC-002, REQ-DC-035, and REQ-DC-038. Their repository storage, task ownership, automatic memory care, and distribution boundaries remain in force. An installed desktop session must load an updated plugin before discovery of either newer skill is claimed.
