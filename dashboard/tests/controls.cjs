const assert = require('node:assert/strict');
const fs = require('node:fs');
const vm = require('node:vm');

// A small DOM boundary lets the real app script exercise its browser controls.
class Element {
  constructor(tag, attrs = {}) {
    this.tagName = tag.toUpperCase();
    this.attrs = {...attrs};
    this.dataset = Object.fromEntries(Object.entries(attrs).filter(([key]) => key.startsWith('data-')).map(([key, value]) => [key.slice(5).replace(/-([a-z])/g, (_, letter) => letter.toUpperCase()), value]));
    this.children = [];
    this.listeners = new Map();
    this.hidden = 'hidden' in attrs;
    this.open = 'open' in attrs;
    this.value = attrs.value || '';
    this.style = {};
    this.scrollTop = 0;
    this.classList = {toggle: (name, enabled) => {
      const values = new Set((this.attrs.class || '').split(/\s+/).filter(Boolean));
      if (enabled) values.add(name); else values.delete(name);
      this.attrs.class = [...values].join(' ');
    }};
    if (attrs.href) this.href = attrs.href;
  }
  append(...children) {
    for (const child of children) { child.parentElement = this; this.children.push(child); }
  }
  replaceChildren(...children) { this.children = []; this.append(...children); }
  addEventListener(name, listener) {
    if (!this.listeners.has(name)) this.listeners.set(name, []);
    this.listeners.get(name).push(listener);
  }
  fire(name, values = {}) {
    const event = {target: this, currentTarget: this, preventDefault() {}, ...values};
    for (const listener of this.listeners.get(name) || []) listener(event);
  }
  getAttribute(name) { return this.attrs[name] ?? null; }
  setAttribute(name, value) { this.attrs[name] = String(value); }
  removeAttribute(name) { delete this.attrs[name]; }
  matches(selector) {
    const attributes = [...selector.matchAll(/\[([^\]=]+)(?:=["']?([^\]"']+)["']?)?\]/g)];
    if (attributes.some(([, key, value]) => !(key in this.attrs) || (value !== undefined && this.attrs[key] !== value))) return false;
    const plain = selector.replace(/\[[^\]]+\]/g, '');
    const tag = plain.match(/^[a-z]+/i)?.[0];
    if (tag && this.tagName !== tag.toUpperCase()) return false;
    const id = plain.match(/#([\w-]+)/)?.[1];
    if (id && this.attrs.id !== id) return false;
    return [...plain.matchAll(/\.([\w-]+)/g)].every(([, name]) => (this.attrs.class || '').split(/\s+/).includes(name));
  }
  querySelectorAll(selector) {
    const selectors = selector.split(',').map(value => value.trim());
    const result = [];
    const visit = node => {
      for (const child of node.children) {
        if (selectors.some(value => child.matches(value))) result.push(child);
        visit(child);
      }
    };
    visit(this);
    return result;
  }
  querySelector(selector) { return this.querySelectorAll(selector)[0] || null; }
  closest(selector) { return this.matches(selector) ? this : this.parentElement?.closest(selector) || null; }
  getClientRects() {
    for (let node = this; node; node = node.parentElement) {
      if (node.hidden) return [];
      const parent = node.parentElement;
      if (parent?.tagName === 'DETAILS' && !parent.open && node !== parent.children.find(child => child.tagName === 'SUMMARY')) return [];
    }
    return [this.rect ? this.rect() : {top: 0, bottom: 0, height: 0}];
  }
  getBoundingClientRect() { return this.getClientRects()[0] || {top: 0, bottom: 0, height: 0}; }
  scrollIntoView() { throw new Error('Selection reveal must not scroll the main document.'); }
  focus() {}
}

function storage() {
  const values = new Map();
  return {getItem: key => values.get(key) ?? null, setItem: (key, value) => values.set(key, String(value)), removeItem: key => values.delete(key), values};
}

const source = fs.readFileSync(process.argv[2], 'utf8');
function browser({persistent = storage(), session = storage(), historyLength = 2, canGoBack, referrer = '', project = 'harbor', view = 'documents', selectedGroup = null, selectedHeader = null, selectedOffset = 500, deferLayout = false} = {}) {
  const document = new Element('document');
  const html = new Element('html');
  const body = new Element('body', {'data-project-id': project, 'data-view': view, 'data-page': 'projects/harbor/docs/sample.html'});
  document.append(html); html.append(body);
  document.documentElement = html;
  document.body = body;
  document.scrollingElement = html;
  html.scrollTop = 71;
  body.scrollTop = 19;
  document.referrer = referrer;
  document.activeElement = body;
  document.createElement = tag => new Element(tag);
  document.getElementById = id => document.querySelector('#'+id);
  const sidebar = new Element('aside', {class: 'sidebar'});
  body.append(sidebar);
  const home = new Element('a', {'data-view-link': 'home', 'data-home-link': '', href: 'https://example.test/viewer/index.html'});
  sidebar.append(home);
  const scroller = new Element('nav', {class: 'workspaces', id: 'workspace-scroll', tabindex: '0'});
  sidebar.append(scroller);
  let sidebarScrollTop = 0;
  Object.defineProperties(scroller, {
    clientHeight: {value: 300, writable: true},
    scrollHeight: {get: () => scroller.children.reduce((height, group) => {
      const tree = group.querySelector('[data-workspace-tree]');
      return height + 48 + (tree.hidden ? 0 : tree.querySelector('details').open ? 1000 : 64);
    }, 0)},
    scrollTop: {
      get: () => sidebarScrollTop,
      set: value => { sidebarScrollTop = Math.max(0, Math.min(Number(value), scroller.scrollHeight - scroller.clientHeight)); },
    },
  });
  scroller.rect = () => ({top: 120, bottom: 120 + scroller.clientHeight, height: scroller.clientHeight});
  const selectedRect = () => ({top: 120 + selectedOffset - scroller.scrollTop, bottom: 144 + selectedOffset - scroller.scrollTop, height: 24});
  for (const key of ['work', 'plans', 'documents']) {
    const group = new Element('section', {class: 'workspace-group', 'data-workspace': key});
    const link = new Element('a', {'data-view-link': key, href: `https://example.test/viewer/${key}.html`});
    if (key === selectedHeader) { link.setAttribute('aria-current', 'page'); link.rect = selectedRect; }
    const toggle = new Element('button', {'data-workspace-toggle': key, 'aria-expanded': 'true', 'aria-controls': key+'-tree'});
    toggle.append(new Element('span'));
    const tree = new Element('div', {class: 'tree', id: key+'-tree', 'data-workspace-tree': key});
    const folder = new Element('details', {'data-folder': key+'/example', ...(key === selectedGroup ? {open: ''} : {})});
    if (key === selectedGroup) {
      const selected = new Element('a', {'aria-current': 'page'});
      selected.rect = selectedRect;
      folder.append(selected);
    }
    tree.append(folder); group.append(link, toggle, tree); scroller.append(group);
  }
  for (const id of ['search', 'search-results', 'result-list', 'page-content', 'search-count']) body.append(new Element(id === 'search' ? 'input' : 'div', {id}));
  const picker = new Element('select', {id: 'theme-picker', value: 'system'});
  const back = new Element('button', {'data-history-back': ''});
  body.append(picker, back);
  const location = {href: 'https://example.test/viewer/projects/harbor/docs/sample.html', assign(url) { this.href = String(url); }};
  const history = {length: historyLength, calls: 0, back() { this.calls++; }};
  const window = new Element('window');
  const frames = [];
  const flushLayout = () => { while (frames.length) frames.shift()(); };
  const rejectWindowScroll = () => { throw new Error('Sidebar navigation must not scroll the main window.'); };
  Object.assign(window, {DEEP_CONTEXT_CATALOG: [], location, history, localStorage: persistent, sessionStorage: session, matchMedia: () => ({matches: false, addEventListener() {}}), requestAnimationFrame: callback => frames.push(callback), scrollX: 13, scrollY: 83, scrollTo: rejectWindowScroll, scrollBy: rejectWindowScroll});
  if (typeof canGoBack === 'boolean') window.navigation = {canGoBack};
  const context = {document, window, location, history, localStorage: persistent, sessionStorage: session, URL, console, matchMedia: window.matchMedia};
  vm.runInNewContext(source, context, {filename: process.argv[2]});
  if (!deferLayout) flushLayout();
  return {document, window, picker, back, history, location, persistent, session, scroller, flushLayout};
}

const initial = browser({canGoBack: true});
assert.equal(initial.picker.value, 'system');
for (const workspace of ['work', 'documents', 'plans']) {
  const toggle = initial.document.querySelector(`[data-workspace-toggle="${workspace}"]`);
  const tree = initial.document.querySelector(`[data-workspace-tree="${workspace}"]`);
  assert.equal(toggle.getAttribute('aria-expanded'), 'true');
  assert.equal(tree.hidden, false);
  toggle.fire('click');
  assert.equal(toggle.getAttribute('aria-expanded'), 'false');
  assert.equal(tree.hidden, true);
  toggle.fire('click');
  assert.equal(toggle.getAttribute('aria-expanded'), 'true');
  assert.equal(tree.hidden, false);
}
initial.document.querySelector('[data-workspace-toggle="plans"]').fire('click');
initial.window.fire('pagehide');
const continued = browser({session: initial.session, persistent: initial.persistent, view: 'work'});
assert.equal(continued.document.querySelector('[data-workspace-tree="plans"]').hidden, true);
assert.equal(continued.document.querySelector('[data-workspace-tree="work"]').hidden, false);
const otherProject = browser({session: initial.session, project: 'orchard'});
assert.equal(otherProject.document.querySelector('[data-workspace-tree="plans"]').hidden, false);

for (const theme of ['light', 'dark', 'system']) {
  initial.picker.value = theme;
  initial.picker.fire('change');
  assert.equal(initial.document.documentElement.dataset.theme, theme);
  const next = browser({persistent: initial.persistent, session: initial.session});
  assert.equal(next.picker.value, theme);
  assert.equal(next.document.documentElement.dataset.theme, theme);
}

const selected = browser({session: initial.session, selectedGroup: 'plans'});
assert.equal(selected.document.querySelector('[data-workspace-tree="plans"]').hidden, false);
assert.equal(selected.document.querySelector('[data-folder="plans/example"]').open, true);
initial.document.querySelector('[data-workspace-toggle="plans"]').fire('click');
initial.document.querySelector('[data-workspace-toggle="plans"]').fire('click');
initial.document.querySelector('[data-view-link="plans"]').fire('click');
assert.equal(initial.document.querySelector('[data-workspace-tree="plans"]').hidden, false);

function assertMainScrollUnchanged(page) {
  assert.equal(page.window.scrollX, 13);
  assert.equal(page.window.scrollY, 83);
  assert.equal(page.document.documentElement.scrollTop, 71);
  assert.equal(page.document.body.scrollTop, 19);
}

function openFolders(session) {
  for (const key of ['work', 'plans', 'documents']) {
    session.setItem(`deep-context-sidebar:harbor:${key}`, JSON.stringify({folders:{[key+'/example']:true}}));
  }
  return session;
}

const legacySession = storage();
for (const key of ['work', 'plans', 'documents']) {
  legacySession.setItem(`deep-context-sidebar:harbor:${key}`, JSON.stringify({folders:{[key+'/example']:true}, scrollTop:900}));
}
const legacy = browser({session: legacySession});
assert.equal(legacy.scroller.scrollTop, 0);
for (const tree of legacy.document.querySelectorAll('[data-workspace-tree]')) {
  assert.equal(tree.scrollTop, 0, 'Legacy per-tree offsets must be ignored.');
  assert.equal(tree.querySelector('details').open, true, 'Legacy folder expansion must still restore.');
}
legacy.window.fire('pagehide');
for (const key of ['work', 'plans', 'documents']) {
  const saved = JSON.parse(legacySession.getItem(`deep-context-sidebar:harbor:${key}`));
  assert.deepEqual(saved, {folders:{[key+'/example']:true}});
}
legacy.scroller.scrollTop = 420;
legacy.window.fire('pagehide');
assert.equal(JSON.parse(legacySession.getItem('deep-context-sidebar-scroll:harbor')), 420);
const nextView = browser({session: legacySession, view: 'plans'});
assert.equal(nextView.scroller.scrollTop, 420);
nextView.scroller.scrollTop = 245;
nextView.window.fire('pagehide');
const nextRecord = browser({session: legacySession, view: 'documents', selectedGroup: 'documents'});
assert.equal(nextRecord.scroller.scrollTop, 245, 'A visible selected record keeps the shared offset.');
assert.equal(browser({session: legacySession, project: 'orchard'}).scroller.scrollTop, 0);
assert.equal(browser().scroller.scrollTop, 0, 'A fresh browser session starts at the top.');
for (const page of [legacy, nextView, nextRecord]) assertMainScrollUnchanged(page);

const deferredSession = storage();
deferredSession.setItem('deep-context-workspaces:harbor', JSON.stringify({work:false, plans:true, documents:false}));
deferredSession.setItem('deep-context-sidebar:harbor:plans', JSON.stringify({folders:{'plans/example':true}}));
deferredSession.setItem('deep-context-sidebar-scroll:harbor', '480');
const deferred = browser({session: deferredSession, deferLayout: true});
assert.equal(deferred.scroller.scrollTop, 0, 'Shared restoration waits for the layout frame.');
assert.equal(deferred.document.querySelector('[data-workspace-tree="work"]').hidden, true);
assert.equal(deferred.document.querySelector('[data-workspace-tree="documents"]').hidden, true);
assert.equal(deferred.document.querySelector('[data-folder="plans/example"]').open, true);
deferred.flushLayout();
assert.equal(deferred.scroller.scrollTop, 480, 'Restoration uses the height after expansion state is applied.');
assertMainScrollUnchanged(deferred);

for (const {saved, offset, expected} of [
  {saved:600, offset:100, expected:92},
  {saved:100, offset:900, expected:632},
  {saved:400, offset:500, expected:400},
]) {
  const session = openFolders(storage());
  session.setItem('deep-context-sidebar-scroll:harbor', JSON.stringify(saved));
  const page = browser({session, selectedGroup:'plans', selectedOffset:offset});
  assert.equal(page.scroller.scrollTop, expected);
  const item = page.scroller.querySelector('a[aria-current="page"]').getBoundingClientRect();
  const viewport = page.scroller.getBoundingClientRect();
  assert.ok(item.top >= viewport.top + 8 && item.bottom <= viewport.bottom - 8, 'The selected leaf is visible inside the shared scroller.');
  assertMainScrollUnchanged(page);
}
const selectedHeader = browser({session:openFolders(storage()), view:'documents', selectedHeader:'documents', selectedOffset:900});
assert.equal(selectedHeader.scroller.scrollTop, 632, 'Workspace landing links are revealed like record links.');
assertMainScrollUnchanged(selectedHeader);

const resizeSession = openFolders(storage());
resizeSession.setItem('deep-context-sidebar-scroll:harbor', '400');
const resized = browser({session:resizeSession, view:'documents', selectedHeader:'documents', selectedOffset:500});
assert.equal(resized.scroller.scrollTop, 400);
resized.scroller.scrollTop = 350;
resized.scroller.clientHeight = 150;
resized.window.fire('resize');
assert.equal(resized.scroller.scrollTop, 350, 'Resize reveal waits for the updated layout frame.');
resized.flushLayout();
assert.equal(resized.scroller.scrollTop, 382, 'Resize reveals from the current user offset instead of restoring the old saved offset.');
const resizedItem = resized.scroller.querySelector('a[aria-current="page"]').getBoundingClientRect();
const resizedViewport = resized.scroller.getBoundingClientRect();
assert.ok(resizedItem.top >= resizedViewport.top + 8 && resizedItem.bottom <= resizedViewport.bottom - 8);
assertMainScrollUnchanged(resized);

for (const collapsed of ['workspace', 'folder']) {
  const session = openFolders(storage());
  session.setItem('deep-context-sidebar-scroll:harbor', '400');
  const page = browser({session, selectedGroup:'plans', selectedOffset:500});
  page.document.querySelector('[data-workspace-toggle="work"]').fire('click');
  if (collapsed === 'workspace') page.document.querySelector('[data-workspace-toggle="plans"]').fire('click');
  else {
    const folder = page.document.querySelector('[data-folder="plans/example"]');
    folder.open = false;
    folder.fire('toggle');
  }
  const selected = page.scroller.querySelector('a[aria-current="page"]');
  assert.equal(selected.getClientRects().length, 0);
  assert.equal(selected.getBoundingClientRect().top, 0);
  page.scroller.scrollTop = 650;
  page.scroller.clientHeight = 240;
  const disclosureState = () => page.document.querySelectorAll('.workspace-group').map(group => ({
    hidden: group.querySelector('[data-workspace-tree]').hidden,
    open: group.querySelector('details').open,
    expanded: group.querySelector('[data-workspace-toggle]').getAttribute('aria-expanded'),
  }));
  const beforeResize = disclosureState();
  page.window.fire('resize');
  page.flushLayout();
  assert.equal(page.scroller.scrollTop, 650, `A selected link hidden by a collapsed ${collapsed} does not shift unrelated sidebar content.`);
  assert.deepEqual(disclosureState(), beforeResize, 'Resize keeps selected and unrelated disclosure states unchanged.');
  assertMainScrollUnchanged(page);
}

initial.back.fire('click');
assert.equal(initial.history.calls, 1);
for (const options of [
  {canGoBack: false, historyLength: 3, referrer: 'https://example.test/viewer/work.html'},
  {canGoBack: true, historyLength: 1},
  {historyLength: 3},
  {historyLength: 3, referrer: 'https://elsewhere.test/viewer/work.html'},
  {historyLength: 3, referrer: 'https://example.test/another-viewer/work.html'},
]) {
  const isolated = browser(options);
  isolated.back.fire('click');
  assert.equal(isolated.history.calls, 0, JSON.stringify(options));
  assert.equal(isolated.location.href, 'https://example.test/viewer/index.html', JSON.stringify(options));
}
const localHistory = browser({historyLength: 3, referrer: 'https://example.test/viewer/work.html'});
localHistory.back.fire('click');
assert.equal(localHistory.history.calls, 1);
assert.equal(localHistory.location.href, 'https://example.test/viewer/projects/harbor/docs/sample.html');
console.log('Workspace, shared sidebar scroll, theme persistence and history controls passed.');
