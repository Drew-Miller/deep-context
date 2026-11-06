---
id: WORK-CONTEXT-READING-TRIAL
title: Check terminology, context lookup and natural skill use
feature: context-entry
depends_on: [WORK-DASHBOARD-BROWSER]
origin: user
---

# Check terminology, context lookup and natural skill use

**Report ready; awaiting user review.** The user reviewed this test and wants to check the framework's terminology, document distinctions and natural-language skill activation. Keep it short, present the results, and let the user decide whether hardening is needed. This is first in the [dashboard plan](../../plans/000020-dashboard-plan.md), followed by the separate [initialization trial](../backlog/000010-initialization-trial.md). The four-prompt diagnostic is finished; no hardening was applied and the initialization trial has not started.

## Purpose

Check whether a fresh agent understands the project's vocabulary, finds supporting context, and uses appropriate skills when an ordinary request calls for them. The user trusts agents to choose necessary context: do not impose a prescribed read sequence, exhaustive reading checklist or file/token quota. Inspect correctness and useful behavior; use observable reads as diagnostic evidence.

## Ordered work items

### 1. Prepare a bounded fresh-agent trial — complete

Use one fresh session and a handful of short prompts. Use an initialized disposable copy for any write exercises so the live project stays unchanged; this test does not ask the subject to initialize it. Preserve the fixture's starting checkpoint. Keep expected answers and scoring notes outside the subject's entry route and do not supply the parent conversation or prime it with the expected skill bodies.

### 2. Test terminology and document distinctions — complete

Ask the agent to explain plans, phases and work items and how they relate here. Include where requirements, decisions, feature documentation and discussion/history belong, and the difference between pending work, accepted lasting behavior and historical evidence. Judge against the current canonical definitions and source records, not obsolete terminology from historical discussions.

### 3. Test a focused context lookup — complete

Ask a small project-specific question involving current/completed work, a related requirement or a decision. Check factual accuracy and whether its cited sources support the answer. Record unnecessary reading or missing context when observed, without turning a preferred reading pattern into a compliance gate.

### 4. Test natural skill activation — complete

Use ordinary language, without explicitly invoking `$deep-context-work-add`: for example, “Create a work item for …” in a clearly selected fixture phase. Include a contextual follow-up such as “Also track …” to see whether the agent infers the same capture workflow without the literal skill name. A short “where are we in the plan?” request may also check status-skill selection. Keep mutations trivial and confined to the fixture; capturing a request must not silently start implementation.

Inspect whether the appropriate skill was actually discovered/read or explicitly invoked, whether its behavior was followed, and whether the resulting record is correct. Distinguish these outcomes: correct artifact with observed skill activation, correct behavior without observable activation, wrong/missing skill choice, or a runtime discovery limitation. A claim that a skill was used is not sufficient evidence. Do not force-feed the skill and then call that an implicit-trigger pass.

### 5. Report before hardening — report produced; user review pending

Give the user a concise results report: what went well, what struggled or failed, and what could not be verified. For each prompt record the expected behavior, actual answer/artifact, available file/tool/skill evidence and a pass/partial/fail/unverified result. Report the tested runtime and skill-discovery surface; name unavailable evidence explicitly. Keep a short evidence summary with this ticket so the result is inspectable.

Suggest only the smallest evidence-backed hardening changes. Stop after presenting the report; do not implement repairs or repeat a lengthy testing loop until the user decides.

## Acceptance and next action

The deliverable is a quick, honest report, not a guarantee that every model will choose identical reads or always trigger a skill. The earlier reset route check and deterministic installation smoke checks are separate evidence. Schedule the fresh-agent test when requested; do not execute it merely because this scope was saved. The initialization trial stays separate and has no dependency on this diagnostic's pass status.

## Trial setup

November 5, 2026 (client date). Disposable initialized project: `/private/tmp/dc-context-trial-i3iy6ohv/harbor-notes`. Coordinator evidence and sealed key are in its parent directory, outside the subject entry route. Baseline hashes cover 42 source/kit files. The fixture has an active Search experience phase, pending local-index/prefix work, blocked Bookmarks, an accepted offline requirement/local-index decision and explicitly historical remote-index discussion. Maps and initial dashboard export passed before the subject started. This is a prepared initialized fixture, not execution of the separate initialization trial.

Subject: fresh collaboration agent `harbor_trial_subject`, forked with no parent conversation. Session-advertised skill metadata may refer to source-checkout skills; copied fixture skills and filesystem discovery links are also present. Distinguish those surfaces in the report rather than claiming a fresh desktop installation was tested. No hardening edits are authorized by this trial.

## Diagnostic results — November 5, 2026

**Four functional checks passed.** No incorrect answer, lost request, unrequested implementation or durable-authority mutation was observed. One fresh subject answered four prompts without being given expected answers or explicit skill invocations. Coordinator tool-trace inspection and artifact checks support the results, rather than relying on the subject's claims.

| Case / actual prompt | Result | Actual behavior and evidence |
| --- | --- | --- |
| “In this project, how do plans, phases and work items differ? Where do requirements, decisions, feature documentation and discussion/history belong, and which describe current authority?” | Pass | Correct plan → phase → work-item hierarchy and paths; pending work is transient, accepted behavior/rationale belongs in canonical knowledge, history does not override accepted requirements. Cited the definitions, Knowledge index and knowledge-history rule. Tool trace confirms those bodies were read. |
| “Where are we in the plan, and what comes next? Does search require a network connection? Give the sources for your answer.” | Pass | Correctly identified Search release, active Search experience, pending local index then prefix matching, accepted Import foundation and blocked Bookmarks. Correctly recovered offline-after-import requirement REQ-HARBOR-001 and local-index rationale. Trace call `call_bad069a5e13b4f4e87ad6147ecccedd1` read the copied `deep-context-status/SKILL.md` before answering; no skill name was in the request. |
| “For the Search experience phase, create a work item for a clearer empty-results message.” | Pass | Added pending section 3 in the existing phase, preserving prior order and scope. Trace call `call_39bac201730e4bfaa24d08f3303f3a49` read copied `deep-context-work-add/SKILL.md` before mutation. No explicit `$skill` invocation or expected body was supplied. |
| “Also track keyboard navigation of search results in that phase.” | Pass | Correctly inferred another capture request from context and added pending section 4 in the same phase. Reused the previously loaded work-add context; a redundant second skill read was not required. Both refresh claims have successful command-output evidence and the final generated page contains both requests. |

## Artifact checks and observed skill use

Only `.deep-context/work/active/000010-search-experience.md` changed among the 42 baseline source/kit files. No source files were added or removed, accepted requirements/decisions were unchanged, and no application implementation was created. Both original pending sections and the phase's next action remain intact. Generated output/runtime receipts changed as expected. All six copied viewer source files still match the source checkout byte-for-byte.

The coordinator reran the fixture map validator successfully, checked both new sections in generated HTML and independently compared the stored export fingerprint with current inputs. Two actual copied skill-body read calls are present in the subject's tool trace: status and work-add. Follow-up capture behavior matches the already loaded work-add rules. This establishes implicit skill selection/read and correct behavior in this runtime; it is not proof of every native skill-discovery mechanism.

## What struggled or remains unverified

- **Minor efficiency issue:** initial file enumeration included generated HTML filenames. The subject also opened the rename helper and refresh implementation/registry while capturing a simple section. Those reads were unnecessary for the requested behavior. It did not load all generated document bodies or treat rejected history as accepted authority.
- **Discovery boundary:** this was a fresh collaboration subagent with no parent conversation, not a brand-new desktop project chat. Runtime context advertised source-checkout skill metadata while copied local skill bodies were actually read. Filesystem discovery links existed, but native fresh-session discovery of copied skills was not independently established.
- **Fixture boundary:** this manually prepared initialized fixture tested reading/capture, not initialization. Templates were not needed for these four cases and were omitted from the fixture; no installation/template success is claimed. The separate initialization ticket remains the appropriate test for a complete copied setup.
- **Scope:** one model/session and four requests do not establish reliability for all models, ambiguous requests, large repositories or long-session recovery. No forced reading sequence or file/token quota was scored.

## Runtime, evidence and recommendation

Observed runtime metadata: `gpt-6.1-sol`, high effort. Subject thread `01a1aea4-1d8f-7770-8b7c-9ece4cbd9c54`, agent path `harbor_trial_subject`. The subject itself reported runtime identification unavailable; the coordinator subsequently recovered it from the local session log. Audit extraction retained only tool calls/outputs, final answers and runtime metadata, not private reasoning.

The fixture remains at `/private/tmp/dc-context-trial-i3iy6ohv/harbor-notes` for review. Its parent contains `baseline.json`, the sealed `review-key.json`, `changes.json`, sanitized `tool-evidence.json` and `results.json`, outside the subject's normal context route. These temporary artifacts are retained until the user reviews the report; this ticket preserves the substantive findings if they are later cleared.

**Recommendation:** no correctness hardening is justified by this run. Optional low-cost polish would make generated-output search exclusions and the standard refresh entrypoint clearer, reducing unnecessary exploration. Present the report and let the user choose; do not change product rules or skills automatically. No application/framework code or canonical requirements were changed for hardening. The diagnostic stays active with report ready; initialization has not begun.

Evidence checkpoint (SHA-256):

```text
bddb58ec009752dfa947766b2720b4d6e02e224ae8460293323694a3bef569fa  baseline.json
f64ace11ca1b73aa14f023fc039b4338cdfac92fe8d370549ffe8eae83220c98  review-key.json
6c9c99f5e03a978c4965ef7f062204fd0a5869bb360b4acc9d3e55cffc207102  changes.json
3e4f7a2820a6a867a5bce9e82f6ce695f47a7ea9fbc5da9393907da99b7955aa  tool-evidence.json
c4ad5fd184d67ba898fc321834c4ab226a10e9f2716b28f84560ba896ab8382a  results.json
```
