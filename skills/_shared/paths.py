#!/usr/bin/env python3
"""Safe, bounded ordering and Markdown-link relocation for a context tree.

Usage: paths.py ROOT work-reorder LANE NAME... | work-move SOURCE LANE |
       plan-reorder PARENT NAME... . Names are existing direct children in desired order.
"""
import argparse
import os
import re
import tempfile
from pathlib import Path
from urllib.parse import urlsplit, urlunsplit, unquote, quote

LINK = re.compile(r'\]\((<?)([^\s)>]+)(>?)(\s+"[^"]*")?\)')
WORK = re.compile(r'^\d{6,}-(.+)$')
PLAN = re.compile(r'^\d{6,}-(.+)$')


def record_file(item):
    """A small record is a file; a split subject has a descriptive entry."""
    return item if item.is_file() else item / (re.sub(r'^\d{6,}-', '', item.name) + '.md')


def check_tree(root):
    if root.is_symlink() or not root.is_dir():
        raise ValueError('root must be a real directory')
    for directory, dirs, files in os.walk(root, followlinks=False):
        for name in dirs + files:
            if (Path(directory) / name).is_symlink():
                raise ValueError('symlinks are not supported: ' + str(Path(directory) / name))


def ordered(parent, names, pattern):
    existing = sorted(p.name for p in parent.iterdir() if pattern.fullmatch(p.name))
    if len(names) != len(set(names)) or sorted(names) != existing:
        raise ValueError('order must list every numbered direct child exactly once')
    return names


def plan_map(parent, names):
    """Reassign top ranks and inherit numeric ancestry in nested plan names."""
    mapping = {}
    def visit(base, order, new_stem=None, old_stem=None):
        pattern = PLAN if old_stem is None else re.compile(r'^' + re.escape(old_stem) + r'-(\d{3,})-(.+)$')
        matches = [pattern.fullmatch(name) for name in order]
        if any(match is None for match in matches):
            raise ValueError('invalid plan sibling name')
        widths = [len(name.split('-')[0]) if old_stem is None else len(match.group(1)) for name, match in zip(order, matches)]
        width = max([6 if old_stem is None else 3, len(str(len(order) * (10 if old_stem is None else 1)))] + widths)
        for i, (name, match) in enumerate(zip(order, matches), 1):
            subject = match.group(1 if old_stem is None else 2)
            prefix = f'{i * 10:0{width}d}' if old_stem is None else f'{new_stem}-{i:0{width}d}'
            old = base / name
            mapping[old] = base / (prefix + '-' + subject)
            if old.is_dir() and old_stem is not None:
                entry = record_file(old)
                if entry.exists():
                    mapping[entry] = old / (prefix + '-' + subject + '.md')
            if old.is_dir():
                old_child_stem = subject if old_stem is None else old_stem + '-' + match.group(1)
                new_child_stem = subject if old_stem is None else prefix
                child_pattern = re.compile(r'^' + re.escape(old_child_stem) + r'-\d{3,}-.+$')
                children = sorted(p.name for p in old.iterdir() if child_pattern.fullmatch(p.name))
                visit(old, children, new_child_stem, old_child_stem)
    if parent.name == 'plans':
        visit(parent, ordered(parent, names, PLAN))
    else:
        parent_match = re.fullmatch(r'(.+-\d{3,})-.+', parent.name)
        stem = parent_match.group(1) if parent_match else PLAN.fullmatch(parent.name).group(1)
        pattern = re.compile(r'^' + re.escape(stem) + r'-\d{3,}-.+$')
        visit(parent, ordered(parent, names, pattern), stem, stem)
    return mapping


def work_map(root, lane, names):
    base = root / 'work' / lane
    mapping = {}
    width = max([6, len(str(len(names) * 10))] + [len(n.split('-')[0]) for n in names])
    for i, name in enumerate(ordered(base, names, WORK), 1):
        mapping[base / name] = base / f'{i * 10:0{width}d}-{WORK.fullmatch(name).group(1)}'
    return mapping


def work_move_map(root, source, lane):
    source = Path(os.path.abspath(root / source))
    work = root / 'work'
    if source.parent.parent != work or lane not in ('backlog', 'active', 'completed') or not WORK.fullmatch(source.name) or not (source.is_dir() or (source.is_file() and source.suffix == '.md')):
        raise ValueError('source must be a work item and lane must be backlog, active or completed')
    target = work / lane
    if source.parent == target:
        raise ValueError('item is already in that lane; use work-reorder')
    result = {}
    for base in (source.parent, target):
        entries = sorted(p.name for p in base.iterdir() if WORK.fullmatch(p.name))
        paths = [base / n for n in entries if base / n != source]
        if base == target:
            paths.insert(0, source)
        width = max([6, len(str(len(paths) * 10))] + [len(p.name.split('-')[0]) for p in paths])
        for i, path in enumerate(paths, 1):
            result[path] = base / f'{i * 10:0{width}d}-{WORK.fullmatch(path.name).group(1)}'
    return result


def work_rename_map(root, source, target):
    source = Path(os.path.abspath(root / source))
    target = Path(os.path.abspath(root / target))
    if source.parent.parent != root / 'work' or source.parent.name not in ('backlog', 'active', 'completed') or target.parent != source.parent:
        raise ValueError('rename must stay within one work status lane')
    if source.name.split('-')[0] != target.name.split('-')[0]:
        raise ValueError('rename preserves priority; use work-reorder to change it')
    if source.is_file():
        if not re.fullmatch(r'\d{6,}-[a-z0-9][a-z0-9-]*\.md', source.name):
            raise ValueError('source must be a descriptive work Markdown file')
        if not re.fullmatch(r'\d{6,}-[a-z0-9][a-z0-9-]*\.md', target.name):
            raise ValueError('use a descriptive Markdown filename with the existing rank')
        return {source: target}
    if not source.is_dir() or not re.fullmatch(r'\d{6,}-[a-z0-9][a-z0-9-]*', target.name):
        raise ValueError('source must be a work record and target a descriptive subject name')
    entry = record_file(source)
    if not entry.is_file():
        raise ValueError('split subject has no descriptive entry')
    new_entry = source / (re.sub(r'^\d{6,}-', '', target.name) + '.md')
    return {source: target, entry: new_entry}


def mapped(path, mapping):
    """Apply nested renames against original paths, from root toward leaf."""
    candidates = [old for old in mapping if path == old or path.is_relative_to(old)]
    if not candidates:
        return path
    old = max(candidates, key=lambda p: len(p.parts))
    replacement = mapping[old]
    return mapped(replacement.parent, mapping) / replacement.name / path.relative_to(old)


def apply(root, mapping):
    root = root.absolute()
    check_tree(root)
    mapping = {a.absolute(): b.absolute() for a, b in mapping.items() if a != b}
    for a, b in mapping.items():
        if not a.is_relative_to(root) or not b.is_relative_to(root) or not a.exists() or not b.parent.is_dir():
            raise ValueError('invalid mapping')
    destinations = [mapped(a, mapping) for a in mapping]
    if len(destinations) != len(set(destinations)):
        raise ValueError('destination collision')
    for a in mapping:
        dest = mapping[a]
        if dest.exists() and dest not in mapping:
            raise ValueError('destination occupied: ' + str(dest))
    # All content is checked before mutation. Historical interview transcripts are literal.
    edits = {}
    for path in root.rglob('*.md'):
        if path.is_relative_to(root / 'docs' / 'interviews'):
            continue
        old_text = path.read_text(encoding='utf-8')
        new_path = mapped(path, mapping)
        def rewrite(match):
            raw = match.group(2)
            url = urlsplit(raw)
            if url.scheme or url.netloc or not url.path or url.path.startswith('/'):
                return match.group(0)
            target = Path(os.path.normpath(path.parent / unquote(url.path)))
            if not target.is_relative_to(root):
                return match.group(0)
            dest = mapped(target, mapping)
            relative = os.path.relpath(dest, new_path.parent).replace(os.sep, '/')
            result = urlunsplit(('', '', quote(relative, safe='/-._~'), url.query, url.fragment))
            return '](' + match.group(1) + result + match.group(3) + (match.group(4) or '') + ')'
        new_text = LINK.sub(rewrite, old_text)
        if new_text != old_text:
            edits[path] = (old_text, new_text)
    # Stage each sibling cohort independently, deepest first; rollback all steps on failure.
    steps = []
    tempdirs = []
    written = []
    try:
        for parent in sorted({a.parent for a in mapping}, key=lambda p: (-len(p.parts), any(a.parent == p and b.parent != p for a, b in mapping.items()))):
            group = [(a, mapping[a]) for a in mapping if a.parent == parent]
            staging = Path(tempfile.mkdtemp(prefix='.dc-move-', dir=parent))
            tempdirs.append(staging)
            for n, (a, b) in enumerate(group):
                tmp = staging / str(n)
                a.rename(tmp); steps.append((tmp, a))
            for n, (a, b) in enumerate(group):
                tmp = staging / str(n)
                if b.exists():
                    raise ValueError('destination became occupied: ' + str(b))
                tmp.rename(b); steps.append((b, tmp))
        for old, (_, new) in edits.items():
            dest = mapped(old, mapping)
            fd, temporary = tempfile.mkstemp(prefix='.dc-write-', dir=dest.parent)
            try:
                with os.fdopen(fd, 'w', encoding='utf-8') as handle:
                    handle.write(new)
                os.chmod(temporary, dest.stat().st_mode)
                os.replace(temporary, dest)
                written.append(old)
            finally:
                if os.path.exists(temporary):
                    os.unlink(temporary)
    except BaseException:
        for old in reversed(written):
            mapped(old, mapping).write_text(edits[old][0], encoding='utf-8')
        for current, prior in reversed(steps):
            current.rename(prior)
        raise
    finally:
        for path in reversed(tempdirs):
            # Parent renames can relocate the staging folder.
            relocated = mapped(path, mapping)
            if relocated.exists():
                try:
                    relocated.rmdir()
                except OSError:
                    pass  # Retain recovery evidence if rollback could not empty staging.


def main():
    parser = argparse.ArgumentParser(description=__doc__)
    parser.add_argument('root', type=Path)
    parser.add_argument('operation', choices=['work-reorder', 'work-move', 'work-rename', 'plan-reorder'])
    parser.add_argument('args', nargs='+')
    opts = parser.parse_args()
    root = opts.root.absolute()
    check_tree(root)
    if opts.operation == 'work-reorder':
        lane, *names = opts.args
        if lane not in ('backlog', 'active'):
            parser.error('only open lanes have editable priority')
        mapping = work_map(root, lane, names)
    elif opts.operation == 'work-move':
        if len(opts.args) != 2:
            parser.error('work-move needs SOURCE LANE')
        mapping = work_move_map(root, *opts.args)
    elif opts.operation == 'work-rename':
        if len(opts.args) != 2:
            parser.error('work-rename needs SOURCE TARGET')
        mapping = work_rename_map(root, *opts.args)
    else:
        parent, *names = opts.args
        directory = Path(os.path.abspath(root / parent))
        if not directory.absolute().is_relative_to(root / 'plans'):
            parser.error('plan parent must be under plans')
        mapping = plan_map(directory, names)
    apply(root, mapping)

if __name__ == '__main__':
    main()
