---
name: deep-context-setup
description: Configure the machine-local Deep Context home and install or refresh its marker-delimited global routing instructions. Use for first-time Deep Context setup or changing its local home.
---

# Deep Context Setup

Use the bundled `deep-context` CLI for deterministic configuration.

1. Confirm the requested home. Default to `/Users/drewmiller/Developer/Deep Context` only for this user's machine; never embed that path into shared project documentation.
2. Run `deep-context setup --home <path>`. Pass `--agents <path>` only when the user selected a non-default global instruction file.
3. Report the configuration and instruction paths. Do not claim plugin discovery until it has been installed and tested in a fresh Codex task.

The command owns only the `<!-- deep-context:start -->` block. Unmatched or duplicate markers are an error requiring human review.
