---
name: deep-context-dashboard
description: Start, stop or check a project's local Deep Context dashboard and return its clickable browser URL.
---

# Deep Context dashboard

Resolve the local viewer beside the selected project's copied skills: `<skills-root>/../dashboard/`. In the source repository, these are sibling `skills/` and `dashboard/` directories; an installation keeps them together under `.deep-context-tools/`. Do not search plugin caches or install a different runtime. Report a missing viewer instead of inventing its path.

For “start/open/show the dashboard,” run `python3 <viewer>/serve.py start`. It builds or refreshes this project's snapshot at `.deep-context/dashboard/` and reuses this viewer's running server. That directory contains disposable generated HTML/assets, not canonical context. Each dashboard belongs to one project; do not combine projects or discover other projects. On first start it infers the local project. Only pass explicit project/output options when the user requested them. The helper binds loopback and selects an available port starting at 8765. Use the actual returned URL; never assume the preferred port was available.

Confirm readiness, then print the URL as a clickable Markdown link so the user can open it in Safari. Do not launch a browser unless asked. A generated snapshot alone does not mean a server is running.

For “stop the dashboard,” run `python3 <viewer>/serve.py stop`; for status, run it with `status`. Only the helper's owned instance may be stopped. Do not kill arbitrary port holders or terminal servers. Report failures and unavailable permissions accurately. No extra model, persistent watcher, deployment or account setup is needed.
