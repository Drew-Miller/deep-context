// This preview intentionally describes the current project. It does not index files dynamically.
const records = {
  '.deep-context/START.md': { title: 'Deep Context entry', related: ['.deep-context/plans/plans.md', '.deep-context/work/work-board.md', '.deep-context/docs/knowledge.md'] },
  '.deep-context/plans/plans.md': { title: 'Plans map', related: ['.deep-context/plans/000020-dashboard-plan.md', '.deep-context/plans/000010-readable-folders.md'] },
  '.deep-context/plans/000010-readable-folders.md': { title: 'Readable folders plan', related: ['.deep-context/docs/requirements/readable-folders.md', '.deep-context/work/completed/000010-folders-reset.md'] },
  '.deep-context/plans/000020-dashboard-plan.md': { title: 'Project dashboard plan', related: ['.deep-context/work/active/000010-project-dashboard.md', '.deep-context/docs/features/project-dashboard.md'] },
  '.deep-context/work/work-board.md': { title: 'Work board map', related: ['.deep-context/work/active/000010-project-dashboard.md', '.deep-context/work/backlog/000010-context-reading-trial.md'] },
  '.deep-context/work/active/000010-project-dashboard.md': { title: 'Project dashboard', id: 'WORK-DASHBOARD-BROWSER', lane: 'active', summary: 'Browse project work and documentation on localhost.', feature: 'Project dashboard', related: ['.deep-context/docs/notes/2026-11-04-dashboard-follow-up.md', '.deep-context/plans/000020-dashboard-plan.md', '.deep-context/docs/features/project-dashboard.md'] },
  '.deep-context/work/backlog/000010-context-reading-trial.md': { title: 'Try selective reading with a fresh agent', id: 'WORK-CONTEXT-READING-TRIAL', lane: 'backlog', summary: 'See how a fresh agent finds the context it needs.', feature: 'Context entry', related: ['.deep-context/docs/features/context-entry.md', '.deep-context/work/active/000010-project-dashboard.md'] },
  '.deep-context/work/completed/000010-folders-reset.md': { title: 'Reset the project context', id: 'WORK-FOLDERS-RESET', lane: 'completed', summary: 'A fresh, readable home for project knowledge.', feature: 'Readable folders', related: ['.deep-context/docs/requirements/readable-folders.md', '.deep-context/plans/000010-readable-folders.md'] },
  '.deep-context/docs/knowledge.md': { title: 'Knowledge index', related: ['.deep-context/docs/requirements/readable-folders.md', '.deep-context/docs/features/project-dashboard.md'] },
  '.deep-context/docs/requirements/readable-folders.md': { title: 'Readable folders', related: ['.deep-context/work/completed/000010-folders-reset.md', '.deep-context/docs/features/work-board.md'] },
  '.deep-context/docs/features/initialization.md': { title: 'Initialization', related: ['.deep-context/docs/requirements/readable-folders.md'] },
  '.deep-context/docs/features/work-board.md': { title: 'Work board', related: ['.deep-context/work/work-board.md', '.deep-context/docs/features/planning.md'] },
  '.deep-context/docs/features/planning.md': { title: 'Planning', related: ['.deep-context/plans/plans.md', '.deep-context/docs/features/work-board.md'] },
  '.deep-context/docs/features/context-entry.md': { title: 'Context entry', related: ['.deep-context/work/backlog/000010-context-reading-trial.md', '.deep-context/START.md'] },
  '.deep-context/docs/features/project-dashboard.md': { title: 'Project dashboard', related: ['.deep-context/work/active/000010-project-dashboard.md', '.deep-context/plans/000020-dashboard-plan.md'] },
  '.deep-context/docs/decisions/start-fresh.md': { title: 'Start fresh', related: ['.deep-context/docs/requirements/readable-folders.md'] },
  '.deep-context/docs/interviews/folder-design.md': { title: 'Folder design interview', related: ['.deep-context/docs/requirements/readable-folders.md'] },
  '.deep-context/docs/notes/2026-11-04-dashboard-follow-up.md': { title: 'Dashboard follow-up discussion', related: ['.deep-context/work/active/000010-project-dashboard.md', '.deep-context/docs/requirements/knowledge-history.md'] },
  '.deep-context/docs/requirements/knowledge-history.md': { title: 'Knowledge and discussion history', related: ['.deep-context/docs/notes/2026-11-04-dashboard-follow-up.md'] },
};
const groups = [
  ['Features', ['.deep-context/docs/features/initialization.md', '.deep-context/docs/features/work-board.md', '.deep-context/docs/features/planning.md', '.deep-context/docs/features/context-entry.md', '.deep-context/docs/features/project-dashboard.md']],
  ['Requirements', ['.deep-context/docs/requirements/readable-folders.md', '.deep-context/docs/requirements/knowledge-history.md']],
  ['Discussion notes', ['.deep-context/docs/notes/2026-11-04-dashboard-follow-up.md']],
  ['Decisions', ['.deep-context/docs/decisions/start-fresh.md']],
  ['Interviews', ['.deep-context/docs/interviews/folder-design.md']],
  ['Plans', ['.deep-context/plans/plans.md', '.deep-context/plans/000020-dashboard-plan.md', '.deep-context/plans/000010-readable-folders.md']],
];
const tree = document.querySelector('#tree');
for (const [name, paths] of groups) {
  const details = document.createElement('details');
  const summary = document.createElement('summary'); summary.textContent = name; details.append(summary);
  for (const path of paths) { const button = document.createElement('button'); button.className = 'tree-leaf'; button.dataset.open = path; button.textContent = records[path].title; details.append(button); }
  tree.append(details);
}
const board = document.querySelector('#board');
function renderBoard(query = '') {
  board.replaceChildren();
  for (const [lane, title] of [['backlog', 'Backlog'], ['active', 'In progress'], ['completed', 'Completed']]) {
    const entries = Object.entries(records).filter(([, r]) => r.lane === lane && `${r.title} ${r.id} ${r.feature} ${r.summary}`.toLowerCase().includes(query));
    const column = document.createElement('div'); column.className = `column ${lane}`;
    const head = document.createElement('div'); head.className = 'column-head';
    head.innerHTML = `<span class="dot"></span>${title}<span class="count">${entries.length}</span><span class="dots">···</span>`; column.append(head);
    if (!entries.length) { const empty = document.createElement('div'); empty.className = 'empty'; empty.textContent = query ? 'No matching work items' : 'No work items here'; column.append(empty); }
    entries.forEach(([path, record], i) => {
      const card = document.createElement('button'); card.className = 'ticket'; card.dataset.open = path;
      const id = document.createElement('span'); id.className = 'ticket-id'; id.textContent = record.id;
      const heading = document.createElement('h3'); heading.textContent = record.title;
      const description = document.createElement('p'); description.textContent = record.summary;
      const bottom = document.createElement('div'); bottom.className = 'ticket-bottom';
      const tag = document.createElement('span'); tag.className = 'tag'; tag.textContent = record.feature;
      const rank = document.createElement('span'); rank.className = 'rank'; rank.textContent = `#${String(i + 1).padStart(2, '0')}`;
      bottom.append(tag, rank); card.append(id, heading, description, bottom); column.append(card);
    });
    board.append(column);
  }
}
renderBoard();
const recordView = document.querySelector('#record-view');
const boardView = document.querySelector('#board-view');
let requestNumber = 0;
function showBoard() {
  requestNumber++;
  boardView.hidden = false; recordView.hidden = true;
  document.querySelector('#breadcrumb').textContent = 'Work board';
  document.querySelector('.nav-item').classList.add('selected');
  window.scrollTo(0, 0);
}
function inlineText(parent, text, sourcePath) {
  const links = /\[([^\]]+)\]\(([^)]+)\)/g;
  let start = 0, match;
  while ((match = links.exec(text))) {
    parent.append(document.createTextNode(text.slice(start, match.index)));
    let target;
    try { target = decodeURIComponent(new URL(match[2], new URL(`../${sourcePath}`, location.href)).pathname).replace(/^\//, ''); } catch { target = ''; }
    if (records[target]) {
      const button = document.createElement('button'); button.className = 'inline-link'; button.dataset.open = target; button.textContent = match[1]; parent.append(button);
    } else { parent.append(document.createTextNode(match[1])); }
    start = links.lastIndex;
  }
  parent.append(document.createTextNode(text.slice(start)));
}
function renderMarkdown(body, sourcePath) {
  const container = document.querySelector('#record-body'); container.replaceChildren();
  const lines = body.replace(/^---\s*\n[\s\S]*?\n---\s*\n/, '').split('\n');
  let list = null;
  for (const line of lines) {
    const heading = /^(#{1,3})\s+(.+)$/.exec(line);
    const item = /^\s*(?:[-*]|\d+\.)\s+(.+)$/.exec(line);
    if (!line.trim()) { list = null; continue; }
    if (item) {
      if (!list) { list = document.createElement('ul'); container.append(list); }
      const li = document.createElement('li'); inlineText(li, item[1], sourcePath); list.append(li); continue;
    }
    list = null;
    if (heading && heading[1].length === 1) continue;
    const element = document.createElement(heading ? `h${Math.min(heading[1].length + 1, 4)}` : 'p');
    inlineText(element, heading ? heading[2] : line.replace(/\*\*/g, ''), sourcePath); container.append(element);
  }
}
async function openRecord(path) {
  const record = records[path]; if (!record) return;
  const request = ++requestNumber; boardView.hidden = true; recordView.hidden = false;
  document.querySelector('.nav-item').classList.remove('selected');
  document.querySelector('#breadcrumb').textContent = record.title;
  document.querySelector('#record-title').textContent = record.title;
  document.querySelector('#record-path').textContent = path;
  document.querySelector('#record-category').textContent = record.lane ? `${record.lane.toUpperCase()} WORK` : path.includes('/plans/') ? 'PLAN' : 'KNOWLEDGE';
  const body = document.querySelector('#record-body'); body.textContent = 'Loading document…';
  const related = document.querySelector('#related-list'); related.replaceChildren();
  if (!record.related?.length) related.textContent = 'No related records listed.';
  for (const target of record.related || []) {
    const button = document.createElement('button'); button.className = 'related-link'; button.dataset.open = target;
    const name = document.createElement('span'); name.textContent = records[target].title;
    const arrow = document.createElement('span'); arrow.textContent = '↗'; button.append(name, arrow); related.append(button);
  }
  window.scrollTo(0, 0);
  try { const response = await fetch(`../${path}`); if (!response.ok) throw new Error(`HTTP ${response.status}`); const text = await response.text(); if (request === requestNumber) renderMarkdown(text, path); }
  catch { if (request === requestNumber) body.textContent = 'Document could not be loaded. Serve the repository root over localhost to view project files.'; }
}
document.addEventListener('click', event => { const button = event.target.closest('[data-open]'); if (button) openRecord(button.dataset.open); });
document.querySelectorAll('[data-view="board"]').forEach(button => button.addEventListener('click', showBoard));
document.addEventListener('keydown', event => { if (event.key === '/' && !['INPUT', 'TEXTAREA'].includes(document.activeElement.tagName)) { event.preventDefault(); document.querySelector('#search').focus(); } });
document.querySelector('#search').addEventListener('input', event => { const query = event.target.value.trim().toLowerCase(); renderBoard(query); tree.querySelectorAll('details').forEach(group => { let matches = 0; group.querySelectorAll('button').forEach(button => { button.hidden = !!query && !records[button.dataset.open].title.toLowerCase().includes(query); if (!button.hidden) matches++; }); group.hidden = !!query && matches === 0; if (query && matches) group.open = true; }); });

// An explicit choice overrides the OS preference. This changes only browser UI state.
const themeToggle = document.querySelector('#theme-toggle');
const systemTheme = window.matchMedia('(prefers-color-scheme: dark)');
let chosenTheme = null;
try {
  const saved = localStorage.getItem('deep-context-theme');
  if (saved === 'dark' || saved === 'light') chosenTheme = saved;
} catch (error) {
  console.warn('Appearance preference could not be read; using the system setting.', error);
}
function applyTheme(theme) {
  document.documentElement.dataset.theme = theme;
  const dark = theme === 'dark';
  themeToggle.textContent = dark ? 'Light mode' : 'Dark mode';
  themeToggle.setAttribute('aria-label', `Switch to ${dark ? 'light' : 'dark'} mode`);
  themeToggle.setAttribute('aria-pressed', String(dark));
}
applyTheme(chosenTheme || (systemTheme.matches ? 'dark' : 'light'));
themeToggle.addEventListener('click', () => {
  chosenTheme = document.documentElement.dataset.theme === 'dark' ? 'light' : 'dark';
  applyTheme(chosenTheme);
  try { localStorage.setItem('deep-context-theme', chosenTheme); }
  catch (error) {
    themeToggle.title = 'Appearance changed for this visit; browser storage is unavailable.';
    console.warn('Appearance preference could not be saved.', error);
  }
});
systemTheme.addEventListener('change', event => {
  if (!chosenTheme) applyTheme(event.matches ? 'dark' : 'light');
});
