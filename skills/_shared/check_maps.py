"""Check selective entry links, ticket identities and visible board order. Read-only."""
import argparse
import re
from pathlib import Path
from urllib.parse import unquote, urlsplit

LINK = re.compile(r'\[[^\]\n]*\]\((?:<([^>]+)>|([^()\s]+))\)')
LANES = ('backlog', 'active', 'completed')


def links(text):
    for match in LINK.finditer(text):
        url = urlsplit(match[1] or match[2])
        if not url.scheme and not url.netloc and url.path:
            yield unquote(url.path)


def check(root):
    root = root.resolve(strict=True)
    errors = []
    identity = {}
    prerequisites = []
    board = (root / 'work/work-board.md').read_text()
    for path in root.rglob('*'):
        if path.is_symlink():
            errors.append(f'{path.relative_to(root)}: unexpected symlink')
            continue
        if path.suffix != '.md' or path.is_relative_to(root / 'docs/interviews'):
            continue
        for link in links(path.read_text()):
            target = (path.parent / link).resolve()
            if not target.is_relative_to(root) or not target.exists():
                errors.append(f'{path.relative_to(root)}: invalid link {link}')
    plans = root / 'plans'
    def entry(item):
        return item if item.is_file() else item / (re.sub(r'^\d{6,}-', '', item.name) + '.md')
    for parent in [plans] + sorted(p for p in plans.rglob('*') if p.is_dir()):
        index = plans / 'plans.md' if parent == plans else entry(parent)
        if not index.is_file():
            errors.append(f'{parent.relative_to(root)}: missing descriptive plan entry')
            continue
        children = sorted(p.name for p in parent.iterdir() if re.match(r'^(?:\d{6,}-|.+-\d{3,}-)', p.name) and p != index)
        # Supporting documents are linked but are not execution-order children.
        listed = []
        for link in links(index.read_text()):
            parts = Path(link).parts
            if parts and parts[0] in children and parts[0] not in listed:
                listed.append(parts[0])
        if listed != children:
            errors.append(f'{index.relative_to(root)}: plan order differs from child entries')
        if parent != plans and len(list(parent.iterdir())) == 1:
            errors.append(f'{parent.relative_to(root)}: single-document subject should be a Markdown file')
    for folder in (root / 'docs/features').iterdir():
        if folder.is_dir() and len(list(folder.iterdir())) == 1:
            errors.append(f'{folder.relative_to(root)}: single-document feature should be a Markdown file')
    for lane in LANES:
        lane_dir = root / 'work' / lane
        records = sorted(p for p in lane_dir.iterdir() if not p.name.startswith('.'))
        indexed = []
        section = ''
        for line in board.splitlines():
            if line.startswith('## '):
                section = line[3:].strip().lower()
            elif section == lane:
                indexed.extend(links(line))
        expected = [str(entry(item).relative_to(root / 'work')) for item in records]
        if indexed != expected:
            errors.append(f'{lane}: board rows differ from folders or ordering')
        ranks = []
        for item in records:
            match = re.fullmatch(r'(\d{6,})-[a-z0-9][a-z0-9-]*', item.stem if item.is_file() else item.name)
            if not match or not entry(item).is_file():
                errors.append(f'invalid ticket {item.name}')
                continue
            ranks.append(match[1])
            body = entry(item).read_text()
            if item.is_dir() and len(list(item.iterdir())) == 1:
                errors.append(f'{item.name}: single-document ticket should be a Markdown file')
            key = re.search(r'^id: (\S+)$', body, re.M)
            if not key or key[1] in identity:
                errors.append(f'{item.name}: missing or repeated ID')
            else:
                identity[key[1]] = lane
            deps = re.search(r'^depends_on: \[([^\]]*)\]$', body, re.M)
            if not deps:
                errors.append(f'{item.name}: expected depends_on list')
            else:
                prerequisites.extend((item.name, d.strip()) for d in deps[1].split(',') if d.strip())
        if len(set(ranks)) != len(ranks) or len({len(r) for r in ranks}) > 1:
            errors.append(f'{lane}: overlapping ranks or mixed prefix widths')
    for item, dep in prerequisites:
        if dep not in identity:
            errors.append(f'{item}: prerequisite {dep} does not resolve')
    return errors


if __name__ == '__main__':
    parser = argparse.ArgumentParser(description=__doc__)
    parser.add_argument('root', type=Path)
    problems = check(parser.parse_args().root)
    if problems:
        raise SystemExit('\n'.join(problems))
    print('Context links, work IDs, prerequisites and board order verified.')
