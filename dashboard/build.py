#!/usr/bin/env python3
"""Export one project's Deep Context records to its read-only static dashboard."""
import argparse
import fcntl
import time
from contextlib import contextmanager
import hashlib
import html
import json
import os
import re
import shutil
import tempfile
from datetime import datetime, timezone
from pathlib import Path, PurePosixPath
from urllib.parse import quote, unquote, urlsplit

ASSETS = Path(__file__).resolve().parent
MARKER = '.deep-context-dashboard.json'
LINK = re.compile(r'\[([^\]\n]+)\]\(([^)\n]+)\)')
LANES = ('active', 'backlog', 'completed')


REGISTRY = '.dashboard-exports.json'


def dashboard_path(project):
    root = Path(project).absolute()
    context = root if root.name == '.deep-context' else root / '.deep-context'
    return context / 'dashboard'


def generated_path(relative):
    return PurePosixPath(relative).parts[0] == 'dashboard'


def source_only_history(relative):
    return PurePosixPath(relative).parts[:2] in (('docs', 'notes'), ('docs', 'interviews'))


@contextmanager
def viewer_lock(timeout=30):
    """One build/start/stop mutation at a time for this local viewer copy."""
    path = ASSETS / '.dashboard-build.lock'
    descriptor = os.open(path, os.O_CREAT | os.O_RDWR | os.O_NOFOLLOW, 0o600)
    with os.fdopen(descriptor, 'w') as handle:
        deadline = time.monotonic() + timeout
        while True:
            try:
                fcntl.flock(handle, fcntl.LOCK_EX | fcntl.LOCK_NB)
                break
            except BlockingIOError:
                if time.monotonic() >= deadline:
                    raise TimeoutError('Another dashboard operation is still running')
                time.sleep(0.05)
        try:
            yield
        finally:
            fcntl.flock(handle, fcntl.LOCK_UN)


def read_registry():
    path = ASSETS / REGISTRY
    if path.is_symlink():
        raise ValueError('Dashboard registry must not be a symlink')
    return json.loads(path.read_text()) if path.exists() else {'exports': []}


def write_json(path, value):
    if path.is_symlink():
        raise ValueError('Runtime state must not be a symlink')
    descriptor, name = tempfile.mkstemp(prefix='.dashboard-write-', dir=path.parent)
    try:
        with os.fdopen(descriptor, 'w') as handle:
            json.dump(value, handle, indent=2); handle.write('\n')
        os.replace(name, path)
    finally:
        if os.path.exists(name):
            os.unlink(name)


def input_fingerprint(project_paths):
    digest = hashlib.sha256()
    for value in sorted(set(str(Path(p).resolve()) for p in project_paths)):
        path = Path(value)
        context = path if path.name == '.deep-context' else path / '.deep-context'
        if context.is_symlink() or not (context / 'START.md').is_file():
            raise ValueError(f'Context entry is unavailable: {context}')
        digest.update(str(context).encode())
        for source in sorted(context.rglob('*')):
            if generated_path(source.relative_to(context).as_posix()):
                continue
            if any(part.startswith('.') for part in source.relative_to(context).parts):
                continue
            if source.is_symlink():
                raise ValueError(f'Source symlink is not supported: {source}')
            if source.is_dir():
                digest.update((source.relative_to(context).as_posix() + '/').encode())
            if source.is_file() and source.suffix.lower() == '.md':
                digest.update(source.relative_to(context).as_posix().encode())
                digest.update(hashlib.sha256(source.read_bytes()).digest())
    for name in ('build.py', 'app.js', 'styles.css', 'refresh.py', 'serve.py'):
        source = ASSETS / name
        if source.is_file():
            digest.update(name.encode()); digest.update(hashlib.sha256(source.read_bytes()).digest())
    return digest.hexdigest()


def escape(value):
    return html.escape(str(value), quote=True)


def relative_url(target, current):
    return quote(os.path.relpath(target, PurePosixPath(current).parent).replace(os.sep, '/'), safe='/-._~')


def split_document(text):
    metadata = {}
    if text.startswith('---\n'):
        parts = text.split('\n---', 1)
        if len(parts) != 2:
            raise ValueError('Unclosed Markdown frontmatter')
        for line in parts[0][4:].splitlines():
            key, separator, value = line.partition(':')
            if separator:
                metadata[key.strip()] = value.strip().strip('"\'')
        text = parts[1].lstrip('\r\n')
    return metadata, text


def plain_summary(text):
    text = LINK.sub(lambda match: match[1], text)
    return re.sub(r'[`*_]', '', text).strip()[:180]


STATUS_ORDER = {'active': 0, 'backlog': 1, 'completed': 2}
STATUS_LABEL = {'active': 'Active', 'backlog': 'Backlog', 'completed': 'Completed'}
VIEW_FILES = {'home': 'index.html', 'work': 'work.html', 'documents': 'documents.html', 'plans': 'plans.html'}


def tree_icon(name):
    paths = {
        'folder': '<path d="M3 7V5a1 1 0 0 1 1-1h5l2 3h9a1 1 0 0 1 1 1v11a1 1 0 0 1-1 1H4a1 1 0 0 1-1-1V7Z"/>',
        'file': '<path d="M14 3H5v18h14V8l-5-5Z"/><path d="M14 3v5h5M8 12h8M8 16h6"/>',
        'features': '<rect x="4" y="4" width="6" height="6" rx="1"/><rect x="14" y="4" width="6" height="6" rx="1"/><rect x="4" y="14" width="6" height="6" rx="1"/><rect x="14" y="14" width="6" height="6" rx="1"/>',
        'requirements': '<rect x="5" y="5" width="14" height="16" rx="2"/><path d="M9 5V3h6v2M8 11l2 2 5-5M8 17h8"/>',
        'decisions': '<path d="M7 3v12a4 4 0 0 0 4 4h6M7 7h6a4 4 0 0 1 4 4v2"/><circle cx="7" cy="3" r="2"/><circle cx="17" cy="15" r="2"/><circle cx="19" cy="19" r="2"/>',
        'notes': '<path d="M5 3h14v18H5zM9 7h6M9 11h6M9 15h4M3 7h4M3 12h4M3 17h4"/>',
        'interviews': '<path d="M4 4h16v12H9l-5 4V4Z"/><path d="M8 8h8M8 12h5"/>',
        'plans': '<circle cx="6" cy="5" r="2"/><circle cx="18" cy="19" r="2"/><path d="M8 5h7a4 4 0 0 1 0 8H9a3 3 0 0 0 0 6h7"/>',
        'active': '<circle cx="12" cy="12" r="9"/><path d="m10 8 6 4-6 4V8Z"/>',
        'backlog': '<path d="M8 6h13M8 12h13M8 18h13M3 6h1M3 12h1M3 18h1"/>',
        'completed': '<circle cx="12" cy="12" r="9"/><path d="m7 12 3 3 7-7"/>',
        'knowledge': '<path d="M12 5C9 3 6 3 3 4v15c3-1 6-1 9 1 3-2 6-2 9-1V4c-3-1-6-1-9 1Zm0 0v15"/>',
    }
    key = name if name in paths else 'file'
    return '<svg class="tree-icon icon-'+key+'" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.6" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true" focusable="false">'+paths[key]+'</svg>'


def folder_label(name):
    return {'docs': 'Documents', 'work': 'Work', 'documentation': 'Documentation'}.get(name, name.replace('-', ' ').replace('_', ' ').capitalize())


def text_status(value):
    text = plain_summary(value).casefold()
    if re.search(r'\b(active|in progress|in development|current|ready for (?:user )?review|awaiting user (?:review|acceptance|validation))\b', text):
        return 'active'
    if re.search(r'\b(implemented|completed|complete|done|finished)\b', text):
        return 'completed'
    if re.search(r'\b(backlog|planned|pending|future|next|queued|proposed|blocked)\b', text):
        return 'backlog'
    return None


def status_attribute(status):
    return f' data-status="{status}"' if status in STATUS_ORDER else ''


def assign_lifecycle(project):
    records = project['records']
    index_states = {}
    index = records.get('plans/plans.md')
    if index:
        for line in index['body'].splitlines():
            for match in LINK.finditer(line):
                resolved = source_link(index, match[2], records)
                if resolved:
                    state = text_status(line[:match.start()])
                    if state:
                        index_states[resolved[0]['path']] = state
    for record in records.values():
        state = record['lane']
        if record['kind'] == 'Plan' and record['path'] != 'plans/plans.md':
            declared = record['metadata'].get('status')
            if declared:
                state = text_status(declared)
            if not state:
                state = index_states.get(record['path'])
            if not state:
                first = next((line for line in record['body'].splitlines() if line.strip() and not line.startswith('#')), '')
                prefix = re.split(r'[.\n]', plain_summary(first), maxsplit=1)[0]
                state = text_status(prefix) or 'backlog'
        record['status'] = state


def visual_order(record):
    completed_at = record['metadata'].get('completed_at') if record.get('status') == 'completed' else None
    if completed_at:
        try:
            timestamp = datetime.fromisoformat(completed_at.replace('Z', '+00:00'))
        except ValueError as error:
            raise ValueError(f'Invalid completed_at in {record["path"]}: use an ISO date or timestamp') from error
        timestamp = timestamp.replace(tzinfo=timezone.utc) if timestamp.tzinfo is None else timestamp
        return (2, 0, -timestamp.timestamp(), *record_order(record))
    return (STATUS_ORDER.get(record.get('status'), 1), 1, 0, *record_order(record))


def view_for(record):
    if record and record['path'].startswith('docs/'):
        return 'documents'
    if record and record['kind'] == 'Plan':
        return 'plans'
    return 'work'


def list_status(text, record, records, section):
    if section not in ('phase order', 'ordered work items', 'active', 'backlog', 'completed') and record['path'] != 'plans/plans.md':
        return None
    for match in LINK.finditer(text):
        resolved = source_link(record, match[2], records)
        if resolved and resolved[0].get('status'):
            return resolved[0]['status']
    return None


def heading_id(text):
    return re.sub(r'[^\w\s-]', '', text.lower()).strip().replace(' ', '-') or 'section'


def source_link(record, href, records):
    """Only resolve Markdown within this project's context tree."""
    try:
        url = urlsplit(href.strip().strip('<>'))
    except ValueError:
        return None
    if url.scheme or url.netloc:
        return None
    if not url.path:
        return (record, url.fragment)
    if url.path.startswith('/'):
        return None
    path = os.path.normpath(str(PurePosixPath(record['path']).parent / unquote(url.path))).replace(os.sep, '/')
    if path.startswith('../') or path == '..':
        return None
    return (records[path], url.fragment) if path in records else None


def inline(text, record, records, current, allow_links=True, depth=0):
    if depth > 12:
        return escape(text)
    pattern = re.compile(r'\[([^\]\n]+)\]\(([^)\n]+)\)|`([^`]+)`|\*\*([^*]+)\*\*')
    pieces, cursor = [], 0
    for match in pattern.finditer(text):
        pieces.append(escape(text[cursor:match.start()]))
        label, href, code, bold = match.groups()
        if label is not None and not allow_links:
            pieces.append(escape(match.group(0)))
        elif label is not None:
            rendered_label = inline(label, record, records, current, False, depth + 1)
            resolved = source_link(record, href, records)
            if resolved:
                target, fragment = resolved
                destination = relative_url(target['url'], current)
                if fragment:
                    destination += '#' + quote(fragment, safe='-._~')
                pieces.append(f'<a href="{escape(destination)}">{rendered_label}</a>')
            elif re.match(r'^https?://', href) and not re.search(r'[\s<>]', href):
                pieces.append(f'<a href="{escape(href)}" rel="noreferrer">{rendered_label}</a>')
            else:
                pieces.append(f'<span title="Source reference: {escape(href)}">{rendered_label}</span>')
        elif code is not None:
            pieces.append(f'<code>{escape(code)}</code>')
        else:
            pieces.append('<strong>' + inline(bold, record, records, current, allow_links, depth + 1) + '</strong>')
        cursor = match.end()
    pieces.append(escape(text[cursor:]))
    return ''.join(pieces)


def render_markdown(record, records, current):
    """Render the project's headings, links, lists, tables, quotes and code safely."""
    lines = record['body'].splitlines()
    output, headings, i = [], {}, 0
    section = ''
    while i < len(lines):
        line = lines[i]
        if not line.strip():
            i += 1
            continue
        if line.startswith('```'):
            code = []
            i += 1
            while i < len(lines) and not lines[i].startswith('```'):
                code.append(lines[i]); i += 1
            output.append('<pre><code>' + escape('\n'.join(code)) + '</code></pre>')
            i += 1
            continue
        heading = re.match(r'^(#{1,6})\s+(.+)$', line)
        if heading:
            level, text = len(heading[1]), heading[2]
            if level == 2:
                section = plain_summary(text).casefold()
            state = None
            if level == 3 and section == 'ordered work items':
                suffix = re.split(r'\s+[—–-]\s+', text)[-1]
                state = text_status(suffix) if suffix != text else None
            slug = heading_id(text)
            headings[slug] = headings.get(slug, 0) + 1
            anchor = slug + (f'-{headings[slug]}' if headings[slug] > 1 else '')
            if level > 1:
                output.append(f'<h{level}{status_attribute(state)} id="{escape(anchor)}">{inline(text, record, records, current)}</h{level}>')
            i += 1
            continue
        if i + 1 < len(lines) and '|' in line and re.fullmatch(r'\s*\|?\s*:?-{3,}:?\s*(?:\|\s*:?-{3,}:?\s*)+\|?\s*', lines[i + 1]):
            cells = lambda row: [inline(c.strip(), record, records, current) for c in row.strip().strip('|').split('|')]
            output.append('<div class="table-scroll"><table><thead><tr>' + ''.join('<th>'+c+'</th>' for c in cells(line)) + '</tr></thead><tbody>')
            i += 2
            while i < len(lines) and '|' in lines[i] and lines[i].strip():
                output.append('<tr>' + ''.join('<td>'+c+'</td>' for c in cells(lines[i])) + '</tr>'); i += 1
            output.append('</tbody></table></div>')
            continue
        item = re.match(r'^\s*(?:([-*])|(\d+)\.)\s+(.+)$', line)
        if item:
            tag = 'ol' if item[2] else 'ul'
            start = f' start="{int(item[2])}"' if item[2] else ''
            output.append(f'<{tag}{start}>')
            while i < len(lines):
                match = re.match(r'^\s*(?:([-*])|(\d+)\.)\s+(.+)$', lines[i])
                if not match or bool(match[2]) != bool(item[2]):
                    break
                state = list_status(match[3], record, records, section)
                output.append('<li' + status_attribute(state) + '>' + inline(match[3], record, records, current) + '</li>'); i += 1
            output.append(f'</{tag}>')
            continue
        if line.startswith('>'):
            output.append('<blockquote>'+inline(line.lstrip('> '), record, records, current)+'</blockquote>')
        elif re.fullmatch(r'\s*[-*_]{3,}\s*', line):
            output.append('<hr>')
        else:
            output.append('<p>'+inline(line, record, records, current)+'</p>')
        i += 1
    return '\n'.join(output)


def load_project(value):
    raw = Path(value).absolute()
    if raw.is_symlink():
        raise ValueError(f'Project path uses a symlink: {raw}')
    root = raw.resolve(strict=True)
    context = root if root.name == '.deep-context' else root / '.deep-context'
    if context.is_symlink() or (context / 'START.md').is_symlink() or not (context / 'START.md').is_file():
        raise ValueError(f'No Deep Context START.md at {context}')
    text = (context / 'START.md').read_text(encoding='utf-8')
    name = re.search(r'^Project:\s*(.+)$', text, re.M) or re.search(r'^#\s+(.+)$', text, re.M)
    name = name[1].strip() if name else context.parent.name
    if name in ('PROJECT_NAME', 'Project context'):
        name = context.parent.name
    project_id = re.sub(r'[^a-z0-9]+', '-', name.lower()).strip('-') or 'project'
    project_id += '-' + hashlib.sha256(str(context).encode()).hexdigest()[:8]
    project = {'id': project_id, 'name': name, 'context': context, 'root': context.parent, 'records': {}, 'directories': []}
    ids = {}
    for path in sorted(context.rglob('*')):
        relative = path.relative_to(context).as_posix()
        if generated_path(relative) or source_only_history(relative):
            continue
        if any(part.startswith('.') for part in path.relative_to(context).parts):
            continue
        if path.is_symlink():
            raise ValueError(f'Source symlink is not supported: {path}')
        if path.is_dir():
            project['directories'].append(path.relative_to(context).as_posix())
            continue
        if not path.is_file() or path.suffix.lower() != '.md':
            continue
        metadata, body = split_document(path.read_text(encoding='utf-8'))
        relative = path.relative_to(context).as_posix()
        heading = re.search(r'^#\s+(.+)$', body, re.M)
        title = metadata.get('title') or (heading[1] if heading else path.stem.replace('-', ' '))
        parts = path.relative_to(context).parts
        work_entry = len(parts) == 3 or (len(parts) == 4 and parts[3] == re.sub(r'^\d{6,}-', '', parts[2]) + '.md')
        lane = parts[1] if len(parts) > 2 and parts[0] == 'work' and parts[1] in LANES and work_entry else None
        kind = 'Phase' if lane and re.search(r'^## Ordered work items\s*$', body, re.M) else 'Work' if lane else 'Plan' if parts[0] == 'plans' else parts[1].replace('-', ' ').title() if len(parts) > 2 and parts[0] == 'docs' else 'Overview'
        summary = plain_summary(next((line for line in body.splitlines() if line.strip() and not line.startswith(('#', '|', '```'))), ''))
        record = {'path': relative, 'title': title, 'body': body, 'metadata': metadata, 'project': project_id, 'projectName': name, 'lane': lane, 'kind': kind, 'summary': summary, 'url': f'projects/{project_id}/{PurePosixPath(relative).with_suffix(".html")}', 'related': set()}
        if metadata.get('id'):
            if metadata['id'] in ids:
                raise ValueError(f'Duplicate record ID {metadata["id"]} in {context}')
            ids[metadata['id']] = relative
        project['records'][relative] = record
    records = project['records']
    for record in records.values():
        for match in LINK.finditer(record['body']):
            target = source_link(record, match[2], records)
            if target and target[0]['path'] != record['path']:
                record['related'].add(target[0]['path'])
        feature_name = record['metadata'].get('feature', '')
        for feature in (f'docs/features/{feature_name}.md', f'docs/features/{feature_name}/{feature_name}.md'):
            if feature in records and feature != record['path']:
                record['related'].add(feature)
        for dep in record['metadata'].get('depends_on', '').strip('[]').split(','):
            dep = dep.strip().strip('"\'')
            if dep in ids and ids[dep] != record['path']:
                record['related'].add(ids[dep])
    for record in records.values():
        for target in list(record['related']):
            records[target]['related'].add(record['path'])
    assign_execution_order(project)
    assign_lifecycle(project)
    return project


def record_link(record, current, css='tree-leaf', label=None):
    knowledge = record['path'] == 'docs/knowledge.md' and css == 'tree-leaf'
    if knowledge:
        label = 'Knowledge'
    label_html = '<span>' + escape(label or record['title']) + '</span>'
    if css == 'related-link':
        label_html += '<small>' + escape(record['kind'] + ' · ' + record['path']) + '</small>'
    if record.get('status') and css != 'related-link':
        label_html += '<small class="lifecycle-label">' + STATUS_LABEL[record['status']] + '</small>'
    if css == 'tree-leaf':
        parts = PurePosixPath(record['path']).parts
        icon = 'knowledge' if knowledge else 'plans' if record['kind'] == 'Plan' else parts[1] if len(parts) > 2 and parts[0] == 'docs' else 'file'
        label_html = tree_icon(icon)+'<span class="tree-copy">'+label_html+'</span>'
        if knowledge:
            css += ' tree-overview'
    selected = ' aria-current="page"' if current == record['url'] else ''
    return f'<a title="{escape(record["title"])}" class="{css}"{status_attribute(record.get("status"))}{selected} data-project="{escape(record["project"])}" href="{escape(relative_url(record["url"], current))}">{label_html}</a>'


def local_targets(record, records, text=None):
    seen = set()
    for match in LINK.finditer(record['body'] if text is None else text):
        resolved = source_link(record, match[2], records)
        if resolved and resolved[0]['path'] not in seen:
            seen.add(resolved[0]['path'])
            yield resolved[0]


def section_text(body, name):
    match = re.search(r'^## ' + re.escape(name) + r'\s*\n(.*?)(?=^## |\Z)', body, re.M | re.S)
    return match[1] if match else ''


def assign_execution_order(project):
    """Rank direct execution references; general indexes/backlinks confer no priority."""
    records = project['records']
    infinity = 10**9
    for record in records.values():
        record['_rank'] = (infinity, infinity, infinity)
    roots = []
    index = records.get('plans/plans.md')
    if index:
        roots.extend(r for r in local_targets(index, records) if r['kind'] == 'Plan' and r['path'] != 'plans/plans.md')
    def assign(record, rank):
        record['_rank'] = min(record['_rank'], rank)
    def reference_docs(record, rank, text=None):
        for target in local_targets(record, records, text):
            if target['path'].startswith('docs/') and target['path'] != 'docs/knowledge.md':
                assign(target, rank)
    def phase_work(phase, rank):
        assign(phase, (*rank, 0))
        reference_docs(phase, (*rank, infinity - 1))
        name = phase['metadata'].get('feature', '')
        for path in (f'docs/features/{name}.md', f'docs/features/{name}/{name}.md'):
            if path in records:
                assign(records[path], (*rank, infinity - 1))
        work = section_text(phase['body'], 'Ordered work items')
        for i, text in enumerate(re.split(r'^### ', work, flags=re.M)[1:], 1):
            reference_docs(phase, (*rank, i), text)
    assigned_phases, visited = set(), set()
    def walk(plan, root_order, position):
        if plan['path'] in visited:
            return position
        visited.add(plan['path'])
        assign(plan, (root_order, position, -1))
        reference_docs(plan, (root_order, infinity - 1, 0))
        for target in local_targets(plan, records, section_text(plan['body'], 'Phase order')):
            if target['kind'] == 'Plan':
                position = walk(target, root_order, position)
            elif target['lane']:
                phase_work(target, (root_order, position))
                assigned_phases.add(target['path'])
                position += 1
        return position
    next_root = 0
    for plan in roots + [r for r in records.values() if r['kind'] == 'Plan' and r['path'] != 'plans/plans.md']:
        if plan['path'] not in visited:
            walk(plan, next_root, 0)
            next_root += 1
    board = records.get('work/work-board.md')
    remaining = list(local_targets(board, records)) if board else []
    remaining += [r for r in records.values() if r['lane'] and r not in remaining]
    for j, phase in enumerate(remaining):
        if phase['lane'] and phase['path'] not in assigned_phases:
            phase_work(phase, (next_root, j))


def record_order(record):
    return (record['_rank'], record['path'].casefold())


def knowledge_tree(projects, current, selected_record=None, scope=None):
    output = []
    overviews = {'START.md', 'plans/plans.md', 'work/work-board.md', 'docs/knowledge.md'}
    for project in projects:
        tree = {state: {} for state in LANES} if scope == 'plans' else {}
        for directory in project['directories']:
            parts = PurePosixPath(directory).parts
            if scope:
                if parts[0] != scope:
                    continue
                if scope == 'plans':
                    continue
                parts = parts[1:]
            branch = tree
            for folder in parts:
                branch = branch.setdefault(folder, {})
        for record in project['records'].values():
            parts = PurePosixPath(record['path']).parts
            if scope:
                if parts[0] != scope or record['path'] in ('plans/plans.md', 'work/work-board.md'):
                    continue
                parts = parts[1:]
            branch = tree[record['status']] if scope == 'plans' else tree
            for folder in parts[:-1]:
                branch = branch.setdefault(folder, {})
            branch[PurePosixPath(record['path']).name] = record
        def descendants(node):
            if 'body' in node and isinstance(node['body'], str):
                return [node]
            return [r for child in node.values() for r in descendants(child)]
        def render(branch, prefix=''):
            def key(pair):
                name, node = pair
                entries = descendants(node)
                path = prefix + name
                order = min((visual_order(r) for r in entries), default=(1, 1, 0, (10**9,)*3, ''))
                if scope == 'work' or prefix.startswith('work/'):
                    order = min((work_order(r) for r in entries), default=(1, 0, ''))
                states = [r.get('status') for r in entries if r.get('status')]
                state_order = min((STATUS_ORDER[state] for state in states), default=1)
                if prefix in ('work/', 'plans/') and name in LANES:
                    state_order = STATUS_ORDER[name]
                return (0 if path in overviews else 1, state_order if scope in ('plans', 'work') or prefix == 'work/' else 1, order, name.casefold())
            result = []
            for name, node in sorted(branch.items(), key=key):
                if 'body' in node and isinstance(node['body'], str):
                    result.append(record_link(node, current, label=name))
                else:
                    opened = ' open' if selected_record and selected_record in descendants(node) else ''
                    folder_state = name if prefix in ('work/', 'plans/') and name in LANES else None
                    icon_name = name if name in ('features', 'requirements', 'decisions', 'notes', 'interviews', 'plans', *LANES) else 'folder'
                    count = '<small class="tree-count">'+str(len(descendants(node)))+'</small>' if scope == 'plans' and folder_state else ''
                    missing_dates = scope == 'plans' and folder_state == 'completed' and any(not r['metadata'].get('completed_at') for r in descendants(node))
                    note = '<p class="tree-order-note">Undated plans follow execution order; completion dates were not recorded.</p>' if missing_dates else ''
                    result.append('<details data-folder="'+escape(prefix+name)+'"'+opened+'><summary'+status_attribute(folder_state)+'>'+tree_icon(icon_name)+'<span>'+escape(folder_label(name))+'</span>'+count+'</summary><div class="tree-children">'+(render(node,prefix+name+'/') if node else '<p class="empty-tree">No Markdown documents yet</p>')+note+'</div></details>')
            return ''.join(result)
        name = '<div class="tree-project-name">'+escape(project['name'])+'</div>' if len(projects) > 1 else ''
        output.append(f'<div class="project-tree" data-project="{escape(project["id"])}">'+name+render(tree, scope+'/' if scope else '')+'</div>')
    return ''.join(output)


def shell(projects, current, content, built_at, record=None, view=None):
    asset = lambda name: escape(relative_url(name, current))
    view = view or view_for(record)
    title = record['title'] if record else {'home':'Home','work':'Work board','documents':'Documents','plans':'Plans'}[view]
    project_name = escape(projects[0]['name'])
    groups = []
    for key, label, icon, scope in [('work','Work board','▦','work'), ('plans','Plans','◇','plans'), ('documents','Documents','▤','docs')]:
        selected_class = (' section-current' if record else ' selected') if view == key else ''
        current_page = ' aria-current="page"' if view == key and not record else ''
        tree = knowledge_tree(projects, current, record, scope)
        groups.append(f'<section class="workspace-group" data-workspace="{key}"><div class="workspace-heading"><a class="nav-item{selected_class}" data-view-link="{key}"{current_page} href="{asset(VIEW_FILES[key])}"><span aria-hidden="true">{icon}</span>{label}</a><button class="workspace-toggle" type="button" data-workspace-toggle="{key}" aria-expanded="true" aria-controls="tree-{key}" aria-label="Collapse {label}"><span aria-hidden="true">−</span></button></div><div class="tree" id="tree-{key}" data-workspace-tree="{key}">{tree}</div></section>')
    home_current = ' aria-current="page"' if view == 'home' else ''
    home_class = ' selected' if view == 'home' else ''
    back = '<button type="button" class="back-button" data-history-back>Back</button>' if view != 'home' else ''
    return f'''<!doctype html>
<html lang="en"><head><meta charset="utf-8"><meta name="color-scheme" content="light dark"><meta name="viewport" content="width=device-width, initial-scale=1"><title>{project_name} · {escape(title)}</title><link rel="icon" href="{asset('icon.svg')}" type="image/svg+xml"><link rel="stylesheet" href="{asset('styles.css')}"><script src="{asset('catalog.js')}" defer></script><script src="{asset('app.js')}" defer></script></head>
<body data-page="{escape(current)}" data-view="{view}" data-project-id="{escape(projects[0]['id'])}"><div class="app">
<aside class="sidebar" aria-label="Project navigation"><a class="brand" href="{asset('index.html')}"><span class="brand-mark">◈</span><span>deep context<small>PROJECT WORKSPACE</small></span></a><div class="sidebar-project">{project_name}</div><a class="project-home{home_class}" data-view-link="home" href="{asset('index.html')}"{home_current}>⌂ <span>Project home</span></a><div class="nav-label">WORKSPACE</div><nav class="workspaces" id="workspace-scroll" tabindex="0" aria-label="Workspace">{''.join(groups)}</nav><div class="sidebar-footer"><span class="status-dot"></span>Read-only snapshot</div></aside>
<main class="main"><header class="topbar"><div class="breadcrumbs">{back}<strong class="project-title">{project_name}</strong><span class="slash">/</span><span>{escape(title)}</span></div><div class="top-actions"><label class="search"><span>⌕</span><input id="search" type="search" placeholder="Search project content" aria-label="Search project content"><kbd>/</kbd></label><label class="theme-control"><span>Appearance</span><select id="theme-picker" aria-label="Appearance"><option value="system" selected>System</option><option value="light">Light</option><option value="dark">Dark</option></select></label></div></header><div class="content"><section id="search-results" hidden aria-label="Search results"><h1>Search results</h1><p id="search-count" role="status"></p><div id="result-list"></div></section><div id="page-content">{content}</div></div><footer>DEEP CONTEXT <span>Read-only project knowledge</span><span class="footer-right">Snapshot {escape(built_at)}</span></footer></main></div></body></html>'''


def work_order(record):
    # The board's visible ticket priority is independent of plan-reference ranking.
    completed = visual_order(record)[1:3] if record.get('status') == 'completed' else (1, 0)
    return (*completed, record['path'].casefold())


def home_page(projects):
    project = projects[0]
    records = project['records']
    links = []
    for key, label, description in [('work', 'Follow the work', 'See active phases, what is up next, and what has been completed.'), ('plans', 'See the direction', 'Follow the plans and their ordered phases.'), ('documents', 'Understand the project', 'Browse features, requirements and the decisions behind them.')]:
        links.append(f'<a class="browse-card home-card" href="{VIEW_FILES[key]}"><small>{escape(label)}</small><h2>{escape({"work":"Work board","documents":"Documents","plans":"Plans"}[key])}</h2><p>{escape(description)}</p></a>')
    knowledge = records.get('docs/knowledge.md')
    start = f'<a class="home-start" href="{escape(relative_url(knowledge["url"], "index.html"))}"><strong>New here? Start with Knowledge</strong><span>A guided map of the project’s current documentation and rationale.</span></a>' if knowledge else '<p class="home-start">Start with Documents to find the project’s current guidance.</p>'
    counts = ''.join(f'<a href="work.html"><strong>{sum(r["lane"] == lane for r in records.values())}</strong><span>{STATUS_LABEL[lane]}</span></a>' for lane in LANES)
    return f'<div class="eyebrow">PROJECT HOME</div><h1>{escape(project["name"])}</h1><p class="home-intro">Your project’s work, plans and knowledge in one place.</p><div class="home-stats">{counts}</div>{start}<div class="home-grid">'+''.join(links)+'<div class="home-help"><h2>How to use this dashboard</h2><p>Choose a workspace in the sidebar and expand its sections, or search for a topic. Open any item to read its details and follow related documents.</p><p>This is a read-only view. Ask your project agent to capture or change work and documentation; refresh the snapshot after updates.</p></div></div>'


def board_page(projects):
    columns = []
    for lane in LANES:
        title = {'backlog': 'Backlog', 'active': 'In progress', 'completed': 'Completed'}[lane]
        cards = []
        for project in projects:
            for record in sorted(project['records'].values(), key=work_order):
                if record['lane'] != lane:
                    continue
                cards.append(f'<a class="ticket" data-status="{lane}" data-project="{escape(project["id"])}" href="{escape(relative_url(record["url"], "work.html"))}"><span class="ticket-id">{escape(record["metadata"].get("id", "WORK"))}</span><h3>{escape(record["title"])}</h3><p>{escape(record["summary"])}</p><div class="ticket-bottom"><span class="tag">{escape(project["name"])}</span><span class="rank">{escape(record["metadata"].get("feature", ""))}</span></div></a>')
        columns.append(f'<section class="column {lane}"><div class="column-head"><span class="dot"></span>{title}<span class="count">{len(cards)}</span></div>'+''.join(cards)+'<p class="empty"'+(' hidden' if cards else '')+'>No work items here</p></section>')
    return '<div class="eyebrow">PROJECT WORKSPACE</div><div class="heading-row"><div><h1>Work board</h1><p>Active phases, upcoming priorities and completion history.</p></div><span class="badge">Read-only snapshot</span></div><div class="board">'+''.join(columns)+'</div>'


def collection_page(projects, view):
    current = VIEW_FILES[view]
    title = 'Plans' if view == 'plans' else 'Documents'
    description = 'Active first, then upcoming work, with completed plans at the bottom.' if view == 'plans' else 'Features, requirements, decisions and the rest of your project knowledge.'
    heading = f'<div class="eyebrow">PROJECT WORKSPACE</div><h1>{title}</h1><p class="collection-intro">{description}</p>'
    records = [record for project in projects for record in sorted(project['records'].values(), key=visual_order) if (record['kind'] == 'Plan' and record['path'] != 'plans/plans.md') or (view == 'documents' and record['path'].startswith('docs/'))]
    if view == 'documents':
        records = [r for r in records if r['path'].startswith('docs/')]
    def card(record):
        state = record.get('status')
        label = STATUS_LABEL[state] if state else record['kind']
        return f'<a class="browse-card"{status_attribute(state)} data-project="{escape(record["project"])}" href="{escape(relative_url(record["url"], current))}"><small>{escape(record["projectName"])} · {escape(label)}</small><h3>{escape(record["title"])}</h3><p>{escape(record["summary"])}</p><span class="record-path">{escape(record["path"])}</span></a>'
    if view == 'documents':
        categories = {}
        for record in records:
            parts = PurePosixPath(record['path']).parts
            category = parts[1] if len(parts) > 2 else 'documentation'
            categories.setdefault(category, []).append(record)
        sections = []
        for category, entries in categories.items():
            icon = tree_icon(category if category in ('features', 'requirements', 'decisions', 'notes', 'interviews') else 'folder')
            sections.append(f'<section class="collection-group document-category" data-category="{escape(category)}"><h2>{icon}{escape(folder_label(category))}<span class="count">{len(entries)}</span></h2><div class="document-grid">'+''.join(card(r) for r in entries)+'</div></section>')
        return heading+''.join(sections)+'<p class="collection-empty"'+(' hidden' if records else '')+'>No documents in this project.</p>'
    sections = []
    for state in LANES:
        selected = [r for r in records if r.get('status') == state]
        missing_dates = state == 'completed' and any(not r['metadata'].get('completed_at') for r in selected)
        note = '<p class="completion-note">Undated plans follow execution order; completion dates were not recorded.</p>' if missing_dates else ''
        sections.append(f'<section class="collection-group" data-group-status="{state}"><h2>{STATUS_LABEL[state]} <span class="count">{len(selected)}</span></h2>'+note+'<div class="document-grid">'+''.join(card(r) for r in selected)+'<p class="empty"'+(' hidden' if selected else '')+'>No '+STATUS_LABEL[state].lower()+' plans.</p></div></section>')
    return heading+''.join(sections)


def record_page(record, project):
    current, records = record['url'], project['records']
    related = ''.join(record_link(target,current,'related-link') for target in sorted((records[path] for path in record['related']),key=visual_order))
    knowledge = record['path'] == 'docs/knowledge.md'
    layout = 'record-layout knowledge-layout' if knowledge else 'record-layout'
    related_content = related or '<p>No related records yet.</p>'
    sidebar = '' if knowledge else f'<aside class="record-related"><h2>Related records</h2><p>Linked documents, dependencies and references back to this record.</p>{related_content}</aside>'
    return f'<div class="{layout}"><article class="record-main"><div class="eyebrow">{escape(record["projectName"])} / {escape(record["lane"] or record["kind"])}</div><h1{status_attribute(record.get("status"))}>{escape(record["title"])}</h1><div class="record-path">.deep-context/{escape(record["path"])}</div><div class="record-body">{render_markdown(record,records,current)}</div></article>{sidebar}</div>'


def _export(project_paths, destination=None):
    if len(project_paths) != 1:
        raise ValueError('Each dashboard belongs to exactly one project; build a separate dashboard for each project')
    before = input_fingerprint(project_paths)
    projects = []
    for value in project_paths:
        project = load_project(value)
        if not any(p['context'] == project['context'] for p in projects):
            projects.append(project)
    output = Path(destination or dashboard_path(project_paths[0])).absolute()
    if output.is_symlink():
        raise ValueError('Output must not use symlinks')
    output = output.resolve()
    for project in projects:
        inside_context = output.is_relative_to(project['context'])
        if output == project['root'] or project['root'].is_relative_to(output) or (inside_context and output != project['context']/'dashboard'):
            raise ValueError('Output inside a context store must be its generated dashboard/ directory and must not replace source records')
    marker = output / MARKER
    previous = set()
    if output.exists():
        if not output.is_dir():
            raise ValueError('Output is not a directory')
        if marker.is_symlink() or any(p.is_symlink() for p in output.rglob('*')):
            raise ValueError('Generated output must not contain symlinks')
        if marker.is_file():
            saved = json.loads(marker.read_text())
            if saved.get('generator') != 'deep-context-dashboard':
                raise ValueError('Output belongs to another generator')
            previous = set(saved['files'])
            if any(Path(p).is_absolute() or '..' in Path(p).parts for p in previous):
                raise ValueError('Invalid generated-file manifest')
        elif any(output.iterdir()):
            raise ValueError('Refusing to overwrite a non-generated directory')
    built_at = datetime.now(timezone.utc).strftime('%Y-%m-%d %H:%M UTC')
    files = {'index.html': shell(projects, 'index.html', home_page(projects), built_at, view='home'), 'work.html': shell(projects, 'work.html', board_page(projects), built_at, view='work')}
    for view in ('documents', 'plans'):
        files[VIEW_FILES[view]] = shell(projects, VIEW_FILES[view], collection_page(projects, view), built_at, view=view)
    catalog = []
    for project in projects:
        for record in project['records'].values():
            files[record['url']] = shell(projects,record['url'],record_page(record,project),built_at,record)
            catalog.append({k:record[k] for k in ('title','project','projectName','path','url','kind','lane','summary','status')} | {'text':record['body']})
    files['catalog.js'] = 'window.DEEP_CONTEXT_CATALOG = '+json.dumps(catalog,ensure_ascii=True).replace('<','\\u003c')+';\n'
    files['app.js'] = (ASSETS/'app.js').read_text()
    files['styles.css'] = (ASSETS/'styles.css').read_text()
    files['icon.svg'] = '<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 32 32"><rect width="32" height="32" rx="8" fill="#6755dc"/><path d="m16 6 10 10-10 10L6 16Z" fill="none" stroke="white" stroke-width="2"/></svg>'
    for name in files:
        target = output/name
        if target.exists() and name not in previous:
            raise ValueError(f'Refusing to overwrite an unrecognized file: {target}')
    if input_fingerprint(project_paths) != before:
        raise ValueError('Source changed during export; refresh after edits settle')
    # Build everything before touching generated output. Only listed generated files are replaced.
    with tempfile.TemporaryDirectory(prefix='deep-context-dashboard-') as temporary:
        stage = Path(temporary)
        for name,text in files.items():
            path = stage/name;path.parent.mkdir(parents=True,exist_ok=True);path.write_text(text,encoding='utf-8')
        output.mkdir(parents=True,exist_ok=True)
        for name in files:
            target=output/name;target.parent.mkdir(parents=True,exist_ok=True);shutil.copyfile(stage/name,target)
        for name in previous-set(files):
            (output/name).unlink(missing_ok=True)
        marker.write_text(json.dumps({'generator':'deep-context-dashboard','files':sorted(files)},indent=2)+'\n')
    receipt = {'projects': [str(p['root']) for p in projects], 'output': str(output), 'fingerprint': before}
    registry = read_registry()
    registry['exports'] = [e for e in registry['exports'] if e['output'] != str(output)] + [receipt]
    write_json(ASSETS / REGISTRY, registry)
    return projects


def export(project_paths, destination=None):
    with viewer_lock():
        return _export(project_paths, destination)


def main():
    parser=argparse.ArgumentParser(description=__doc__)
    parser.add_argument('--project',action='append',required=True,help='The single project root this dashboard belongs to')
    parser.add_argument('--output',type=Path,help='Generated site directory (default: PROJECT/.deep-context/dashboard)')
    args=parser.parse_args()
    try:
        projects=export(args.project,args.output)
    except (ValueError,OSError) as error:
        parser.exit(1,f'Dashboard export failed: {error}\n')
    print(f'Exported {projects[0]["name"]}: {len(projects[0]["records"])} records.')
    output = args.output or dashboard_path(args.project[0])
    print(f'Open {(output.resolve()/"index.html")}')


if __name__=='__main__':
    main()
