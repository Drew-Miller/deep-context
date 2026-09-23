# Feature Registry

> Generated from canonical frontmatter. Rebuild safely; do not store unique knowledge here.

| Feature | Purpose | Ownership | Dependencies | Context |
|---|---|---|---|---|
| bootstrap | Machine setup, project creation, repository inventory, provenance, and self-describing context trees. | src/config/**, src/importing/**, src/projects/** |  | features/bootstrap/FEATURE.md |
| closure | Diff-driven Project Context review, drift detection, durable promotion, and guarded cleanup. | src/closure/** | routing (contract), tasks (feature) | features/closure/FEATURE.md |
| routing | Canonical context schemas, generated indexes, validation, and bounded progressive disclosure. | src/frontmatter/**, src/indexing/**, src/validation/** | bootstrap (contract) | features/routing/FEATURE.md |
| tasks | Independent task and chat memory, optional source checkouts, manifests, and guarded recovery. | src/tasks/** | routing (contract) | features/tasks/FEATURE.md |
