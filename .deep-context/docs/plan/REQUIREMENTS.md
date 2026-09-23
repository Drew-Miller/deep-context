# Deep Context Product Requirements

Canonical atomic requirements live under `doc/requirements/` and are routed by `doc/REQUIREMENTS.md`.

The product objective is durable, selectively readable filesystem context. Chats and working context are disposable; accepted knowledge, source provenance, task checkpoints, and closure promotions are recoverable from files.

V1 excludes a database, embeddings, semantic indexing service, GUI, token metering, automatic dependency inference, automatic commits/merges/pushes, and deletion before closure review succeeds.
