// Document pages are generated HTML. JavaScript adds search and workspace navigation state.
const catalog = window.DEEP_CONTEXT_CATALOG;
const search = document.querySelector('#search');
const results = document.querySelector('#search-results');
const resultList = document.querySelector('#result-list');
const pageContent = document.querySelector('#page-content');
const boardURL = new URL(document.querySelector('[data-view-link="work"]').href);
const siteRoot = new URL('.', boardURL);
function renderSearch() {
  const query = search.value.trim().toLowerCase();
  results.hidden = !query;
  pageContent.hidden = !!query;
  if (!query) return;
  resultList.replaceChildren();
  if (!Array.isArray(catalog)) {
    document.querySelector('#search-count').textContent = 'The search index could not be loaded. Document navigation is still available.';
    return;
  }
  const terms = query.split(/\s+/);
  const priority = record => ({active:0, backlog:1, completed:2}[record.status] ?? 1);
  const matches = catalog.filter(record => {
    const text = `${record.title} ${record.kind} ${record.path} ${record.text}`.toLowerCase();
    return terms.every(term => text.includes(term));
  }).sort((a,b) => priority(a)-priority(b));
  document.querySelector('#search-count').textContent = `${matches.length} result${matches.length === 1 ? '' : 's'}.`;
  for (const record of matches) {
    const link = document.createElement('a');
    link.className = 'search-result';
    if (record.status) link.dataset.status = record.status;
    link.href = new URL(record.url.split('/').map(encodeURIComponent).join('/'), siteRoot).href;
    const meta = document.createElement('small'); meta.textContent = `${record.projectName} · ${record.kind}${record.status ? ' · ' + record.status : ''}`;
    const title = document.createElement('h2'); title.textContent = record.title;
    const summary = document.createElement('p'); summary.textContent = record.summary;
    const path = document.createElement('span'); path.className = 'record-path'; path.textContent = record.path;
    link.append(meta, title, summary, path); resultList.append(link);
  }
}
search.addEventListener('input', renderSearch);
document.addEventListener('keydown', event => {
  if (event.key === '/' && !['INPUT', 'TEXTAREA', 'SELECT'].includes(document.activeElement.tagName)) {
    event.preventDefault(); search.focus();
  }
  if (event.key === 'Escape' && search.value) {
    search.value = ''; renderSearch(); search.focus();
  }
});
function readSession(key) {
  try { return JSON.parse(sessionStorage.getItem(key) || 'null'); }
  catch (error) { console.warn('Dashboard preference could not be restored.', error); return null; }
}
function writeSession(key, value) {
  try { sessionStorage.setItem(key, JSON.stringify(value)); }
  catch (error) { console.warn('Dashboard preference could not be saved.', error); }
}
const projectId = document.body.dataset.projectId;
const picker = document.querySelector('#theme-picker');
const appearanceKey = `deep-context-appearance:${projectId}`;
const savedAppearance = readSession(appearanceKey);
picker.value = ['system', 'light', 'dark'].includes(savedAppearance) ? savedAppearance : 'system';
function applyAppearance() {
  document.documentElement.dataset.theme = picker.value;
}
applyAppearance();
picker.addEventListener('change', () => {
  applyAppearance(); writeSession(appearanceKey, picker.value);
});

const workspaceKey = `deep-context-workspaces:${projectId}`;
const workspaceState = readSession(workspaceKey) || {};
const workspaceLabels = {work:'Work board', documents:'Documents', plans:'Plans'};
for (const group of document.querySelectorAll('.workspace-group')) {
  const key = group.dataset.workspace;
  const tree = group.querySelector('[data-workspace-tree]');
  const toggle = group.querySelector('[data-workspace-toggle]');
  const folders = [...tree.querySelectorAll('details[data-folder]')];
  const treeKey = `deep-context-sidebar:${projectId}:${key}`;
  const saved = readSession(treeKey);
  if (saved && saved.folders && typeof saved.folders === 'object') {
    for (const folder of folders) {
      const open = saved.folders[folder.dataset.folder];
      if (typeof open === 'boolean') folder.open = open || !!folder.querySelector('a[aria-current="page"]');
    }
  }
  function saveTree() {
    writeSession(treeKey, {folders:Object.fromEntries(folders.map(folder => [folder.dataset.folder, folder.open]))});
  }
  function setExpanded(expanded) {
    tree.hidden = !expanded;
    group.classList.toggle('is-collapsed', !expanded);
    toggle.setAttribute('aria-expanded', String(expanded));
    toggle.setAttribute('aria-label', `${expanded ? 'Collapse' : 'Expand'} ${workspaceLabels[key]}`);
    toggle.querySelector('span').textContent = expanded ? '−' : '+';
    workspaceState[key] = expanded;
  }
  // A directly opened record reveals its group; unrelated groups keep their state.
  setExpanded(workspaceState[key] !== false || !!tree.querySelector('a[aria-current="page"]'));
  toggle.addEventListener('click', () => {
    setExpanded(tree.hidden); writeSession(workspaceKey, workspaceState);
  });
  group.querySelector('[data-view-link]').addEventListener('click', () => {
    setExpanded(true); writeSession(workspaceKey, workspaceState);
  });
  for (const folder of folders) folder.addEventListener('toggle', saveTree);
  window.addEventListener('pagehide', saveTree);
}
window.addEventListener('pagehide', () => writeSession(workspaceKey, workspaceState));
const workspaceScroller = document.querySelector('#workspace-scroll');
const sidebarScrollKey = `deep-context-sidebar-scroll:${projectId}`;
window.addEventListener('pagehide', () => writeSession(sidebarScrollKey, workspaceScroller.scrollTop));
function revealSidebarSelection() {
  const selected = workspaceScroller.querySelector('a[aria-current="page"]');
  if (!selected || selected.getClientRects().length === 0) return;
  const viewport = workspaceScroller.getBoundingClientRect();
  const item = selected.getBoundingClientRect();
  if (item.top < viewport.top + 8) workspaceScroller.scrollTop -= viewport.top + 8 - item.top;
  else if (item.bottom > viewport.bottom - 8) workspaceScroller.scrollTop += item.bottom - viewport.bottom + 8;
}
// Restore only after disclosure states are applied; reveal locally without scrolling the document.
window.requestAnimationFrame(() => {
  const savedScroll = readSession(sidebarScrollKey);
  if (Number.isFinite(savedScroll)) workspaceScroller.scrollTop = Math.max(0, savedScroll);
  revealSidebarSelection();
});
window.addEventListener('resize', () => window.requestAnimationFrame(revealSidebarSelection));

for (const button of document.querySelectorAll('[data-history-back]')) {
  button.addEventListener('click', () => {
    // History length includes forward/blank entries; use the actual navigation position.
    const referrer = document.referrer ? new URL(document.referrer) : null;
    const localReferrer = !!referrer && referrer.origin === siteRoot.origin && referrer.pathname.startsWith(siteRoot.pathname);
    const canGoBack = typeof window.navigation?.canGoBack === 'boolean' ? window.navigation.canGoBack : localReferrer;
    if (canGoBack && window.history.length > 1) window.history.back();
    else window.location.assign(new URL('index.html', siteRoot).href);
  });
}
