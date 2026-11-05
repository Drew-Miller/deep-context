# Initialize Deep Context in a new project

Give your agent a local path to this guide or the URL for this repository's `INITIALIZE.md`, and say: “Initialize Deep Context in this project.” The agent needs a local checkout of this repository. If given only a URL, clone that repository into a temporary directory using the user's chosen network permissions. Use the same checkout for the starter, templates and skills.

## Agent instructions

1. Identify the target project root and its name. If `.deep-context` or `.deep-context-tools` already exists (including a symlink), stop and report the collision. Existing-project conversion is a separate manual task.
2. Check each target entry before writing. Preserve an existing `AGENTS.md`. If it contains Deep Context instructions, stop and report the collision. Preserve the existing `.agents/skills` directory and unrelated skills. Stop if the directory is a symlink or any of the nine `deep-context-*` skill names already exists there. Never overwrite an existing path.
3. Copy `starter/.deep-context/` to the target as `.deep-context/`. Replace only `PROJECT_NAME` in `.deep-context/START.md` with the project name. Copy `starter/templates/` to `.deep-context-tools/templates/`. Copy `skills/` to `.deep-context-tools/skills/`, omitting `tests/`, `__pycache__/` and `.gitignore`. The copied `_shared/` helpers are required.
4. Create `.agents/skills/` if missing. For each of the nine copied skill directories, create a relative symlink in that discovery directory to `../../.deep-context-tools/skills/<skill-name>`. Keep the copied suite together so `<skills-root>` in its instructions means `.deep-context-tools/skills`.
5. Append the following section to `AGENTS.md`, creating the file if missing. Preserve the existing bytes and add a separating newline when needed.

   ```markdown
   ## Deep Context

   Start at [.deep-context/START.md](.deep-context/START.md). Follow the map relevant to the task and open only the selected records. Project-local skills are in [.deep-context-tools/skills/](.deep-context-tools/skills), with templates in [.deep-context-tools/templates/](.deep-context-tools/templates). Use their shared helpers from that skills directory. Plans link phases in order; each phase keeps its work items, implementation and verification in one descriptive file. Follow the shared definitions linked from START.md.
   ```

6. From the target root, run `python3 .deep-context-tools/skills/_shared/check_maps.py .deep-context`. Check that AGENTS.md leads to START.md and that each discovery link resolves to its copied skill. Report the project path, the result and any collisions. Start a fresh agent session to confirm skill discovery.

The starter contains the generic planning/work structure rules, but no source-project goals or feature requirements. Use descriptive subject filenames, such as `plans/000010-first-release.md` and `work/backlog/000010-first-feature.md`; split into subject folders only when several documents are needed. Use `plan.md` for a short ordered overview and `phase.md` for a feature execution home containing its ordered work items and checks. Do not scaffold separate packet or verification files by default. Add those records when the user supplies work; record accepted requirements and decisions in the appropriate docs and index them.

## Updating a project's copy

Compare the project's `.deep-context-tools/skills/` with the newer checkout's `skills/`. Review and preserve project-specific edits, then replace the intended skill and helper files together. Keep the discovery links pointed at the local copies. Run the map check. To test helpers in a disposable copy, copy the newer checkout’s `skills/tests/` alongside that copy’s `_shared/`, then run `python3 -m unittest discover -s <disposable-skills>/tests`. Updates to this repository do not automatically update projects.
