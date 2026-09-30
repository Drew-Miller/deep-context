---
id: REQ-DC-049
title: Keep canonical record paths readable without changing identity
status: implemented
feature: routing
origin: confirmed
source: work/items/dc-14-descriptive-filenames-and-work-order.md
code_patterns: [src/core/records.ts, src/migration/filenames.ts, src/validation/index.ts]
---

# Readable canonical record paths

New human-facing Backlog, Active, source-provenance, and closure records use a bounded descriptive slug with their stable ID. The ID in metadata, not the pathname, determines identity and references. An explicit, previewable and recoverable migration can rename older ID-only canonical records without losing IDs, authored content, structured references, or task and chat bindings. Old paths may remain as validated one-hop forwarding records for compatibility; generated indexes and canonical readers exclude those forwarders. Title edits do not silently rename files.
