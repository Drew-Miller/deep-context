# Static dashboard snapshots

Status: accepted implementation choice for the dashboard phase.

Generate the read-only viewer from one project's `.deep-context/` folder with a standard-library Python exporter. Each published Markdown record receives a static HTML page. Notes and Interviews stay source-only. Browser JavaScript supplies full-text search, project/workspace expansion state, browser-history Back and a session-local appearance picker. Appearance defaults to the browser's light/dark preference; explicit Light/Dark choices support color testing. Document content and navigation are already HTML.

This implements the user's preference for static HTML while keeping the Markdown source independent of the viewer. The output is self-contained and can be opened directly or served locally. Regeneration runs after skill-led editing batches or explicit builds; there is no live synchronization or project-document editing in the viewer.

The exporter replaces only its manifest-listed generated files and refuses unrecognized output directories or source-context destinations. Each project owns a separate dashboard with its name in the title bar and tab. Reject combined project inputs; the viewer does not scan or offer other projects. This user-directed single-project scope replaces the earlier multi-project design.

Generated files belong under `.deep-context/dashboard/`, which is ignored by Git, canonical source loading and refresh fingerprints. This is the one allowed generated destination within the context store; other source-context output locations remain refused. The viewer's source scripts and machine-local process receipts remain with the copied tools. This replaces the previous `dashboard/site/` output location.

This repository keeps its editable viewer and tests in the visible root `dashboard/`, alongside its other installation/shared tooling. Its own initialized context is `.deep-context/`. Installed project copies may use the existing `.deep-context-tools/dashboard/` convention. Moving generated output never makes the source tools disposable.

See [dashboard requirements](../features/project-dashboard.md) and the [active phase](../../work/completed/000010-project-dashboard.md) for behavior, work and evidence.

## Review follow-up choices

Browse the actual context tree with reference documents ranked by earliest directly linked execution work. Keep manual source edits on explicit refresh; do not add a persistent watcher. Use a serialized deterministic refresh command rather than another model. Install the local viewer alongside skills/templates so each new project is independent. The status skill reads durable records; recap scope and item format follow the current conversation and produce no saved report.
