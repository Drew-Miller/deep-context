import hashlib
import importlib.util
import json
import re
import tempfile
import unittest
import shutil
from unittest.mock import patch
from html.parser import HTMLParser
from pathlib import Path
from urllib.parse import unquote, urlsplit

spec = importlib.util.spec_from_file_location('dashboard_build', Path(__file__).parents[1] / 'build.py')
build = importlib.util.module_from_spec(spec)
spec.loader.exec_module(build)


class Links(HTMLParser):
    def __init__(self):
        super().__init__(); self.values = []
    def handle_starttag(self, tag, attrs):
        self.values.extend(value for key, value in attrs if key in ('href', 'src'))


class DashboardTest(unittest.TestCase):
    def setUp(self):
        self.temporary = tempfile.TemporaryDirectory(prefix='dashboard-test-')
        self.addCleanup(self.temporary.cleanup)
        self.base = Path(self.temporary.name).resolve()
        self.output = self.base / 'site'
        viewer = self.base / 'viewer'
        viewer.mkdir()
        for name in ('build.py', 'app.js', 'styles.css', 'refresh.py', 'serve.py'):
            if (build.ASSETS / name).is_file():
                shutil.copyfile(build.ASSETS / name, viewer / name)
        self.asset_patch = patch.object(build, 'ASSETS', viewer)
        self.asset_patch.start()
        self.addCleanup(self.asset_patch.stop)

    def project(self, folder, name):
        root = self.base / folder
        context = root / '.deep-context'
        for part in ['work/active', 'work/backlog', 'work/completed', 'docs/features', 'docs/decisions', 'plans']:
            (context / part).mkdir(parents=True, exist_ok=True)
        (context / 'START.md').write_text(f'# {name}\n\nProject: {name}\n\n[Board](work/work-board.md)\n')
        (context / 'work/work-board.md').write_text('# Work board\n\n[Feature](active/000010-feature.md)\n')
        (context / 'work/active/000010-feature.md').write_text('---\nid: PHASE-FEATURE\ntitle: Searchable feature\nfeature: sample\ndepends_on: [PHASE-FOUNDATION]\n---\n\n# Searchable feature\n\nA useful phase.\n\n## Ordered work items\n\n### 1. Index records — pending\n\nNeedleFromBodyOnly\n\n[Requirement](../../docs/features/sample.md#accepted-behavior)\n')
        (context / 'work/completed/000010-foundation.md').write_text('---\nid: PHASE-FOUNDATION\ndepends_on: []\n---\n# Foundation\nDone.\n')
        (context / 'docs/features/sample.md').write_text('# Sample requirements\n\n## Accepted behavior\n\nFind records.\n\n| Behavior | Check |\n| --- | --- |\n| Search | Passed |\n\n```text\n<code & data>\n```\n')
        (context / 'plans/plans.md').write_text('# Plans\n\n[Release](000010-release.md)\n')
        (context / 'plans/000010-release.md').write_text('# Release\n\n[Phase](../work/active/000010-feature.md)\n')
        return root

    def digest(self, root):
        return {str(p.relative_to(root)): hashlib.sha256(p.read_bytes()).hexdigest() for p in root.rglob('*') if p.is_file()}

    def test_projects_export_independently_without_source_writes(self):
        first, second = self.project('first', 'Harbor'), self.project('second', 'Orchard')
        before = [self.digest(first), self.digest(second)]
        projects = build.export([first], self.output)
        other_output = self.base / 'other-site'
        other_projects = build.export([second], other_output)
        self.assertEqual(before, [self.digest(first), self.digest(second)])
        self.assertNotEqual(projects[0]['id'], other_projects[0]['id'])
        for site, own_name, other_name in [(self.output, 'Harbor', 'Orchard'), (other_output, 'Orchard', 'Harbor')]:
            for page in site.rglob('*.html'):
                content = page.read_text()
                self.assertIn('<title>'+own_name+' · ', content)
                self.assertIn('<strong class="project-title">'+own_name+'</strong>', content)
                self.assertNotIn(other_name, content)
                self.assertNotIn('project-select', content)
                links = Links();links.feed(content)
                for value in links.values:
                    url = urlsplit(value)
                    if not url.scheme and not url.netloc and url.path:
                        self.assertTrue((page.parent / unquote(url.path)).is_file(), (page, value))
            self.assertNotIn(other_name, (site/'catalog.js').read_text())
        index = (self.output / 'index.html').read_text()
        self.assertIn('Harbor', index)
        self.assertIn('NeedleFromBodyOnly', (self.output / 'catalog.js').read_text())
        record = projects[0]['records']['work/active/000010-feature.md']
        page = (self.output / record['url']).read_text()
        self.assertIn('Ordered work items', page)
        self.assertIn('sample.html#accepted-behavior', page)
        self.assertIn('Foundation', page)
        self.assertIn('work/active/000010-feature.md', projects[0]['records']['docs/features/sample.md']['related'])
        feature = (self.output / projects[0]['records']['docs/features/sample.md']['url']).read_text()
        self.assertIn('<table>',feature);self.assertIn('&lt;code &amp; data&gt;',feature)
        self.assertIn('id="accepted-behavior"',feature)
        # The exported HTML remains available without either source project.
        import shutil
        shutil.rmtree(first);shutil.rmtree(second)
        self.assertTrue((self.output / record['url']).is_file())

    def test_multiple_projects_are_rejected_before_writing_output(self):
        first,second=self.project('first','Shared name'),self.project('second','Shared name')
        before = [self.digest(first), self.digest(second)]
        for sources in ([first, second], [first, first], []):
            with self.assertRaisesRegex(ValueError, 'exactly one project'):
                build.export(sources, self.output)
        self.assertFalse(self.output.exists())
        self.assertEqual(before, [self.digest(first), self.digest(second)])

    def test_rebuild_refreshes_and_removes_only_old_generated_pages(self):
        root=self.project('first','Harbor')
        projects=build.export([root],self.output)
        old=self.output/projects[0]['records']['docs/features/sample.md']['url']
        sentinel=self.output/'my-file.txt';sentinel.write_text('keep')
        (root/'.deep-context/docs/features/sample.md').unlink()
        (root/'.deep-context/docs/features/replacement.md').write_text('# Replacement\nNew content\n')
        build.export([root],self.output)
        self.assertFalse(old.exists());self.assertEqual(sentinel.read_text(),'keep')
        self.assertIn('New content',(self.output/'catalog.js').read_text())

    def test_refuses_source_and_unrecognized_output_without_changes(self):
        root=self.project('first','Harbor');before=self.digest(root)
        for output in [root,root/'.deep-context/export']:
            with self.assertRaises(ValueError):build.export([root],output)
        self.output.mkdir();(self.output/'index.html').write_text('user owned')
        with self.assertRaises(ValueError):build.export([root],self.output)
        self.assertEqual((self.output/'index.html').read_text(),'user owned')
        self.assertEqual(before,self.digest(root))

    def test_refuses_source_symlinks_and_duplicate_ids(self):
        root=self.project('first','Harbor')
        link=root/'.deep-context/docs/linked.md';link.symlink_to(root/'.deep-context/START.md')
        with self.assertRaises(ValueError):build.export([root],self.output)
        link.unlink()
        (root/'.deep-context/docs/duplicate.md').write_text('---\nid: PHASE-FEATURE\n---\n# Duplicate\n')
        with self.assertRaises(ValueError):build.export([root],self.output)

    def test_html_and_unsafe_link_content_is_escaped(self):
        root=self.project('first','Harbor')
        (root/'.deep-context/docs/features/unsafe.md').write_text('# <script>bad</script>\n\n<img src=x onerror=bad()>\n\n[Unsafe](javascript:alert)\n\n[Outside](../../../../private.md)\n')
        projects=build.export([root],self.output)
        record=projects[0]['records']['docs/features/unsafe.md']
        page=(self.output/record['url']).read_text()
        self.assertNotIn('<img src=x',page);self.assertNotIn('<script>bad',page)
        self.assertNotIn('href="javascript:',page);self.assertNotIn('href="../../../../private',page)
        self.assertIn('&lt;img',page)

    def test_context_directory_argument_and_bad_frontmatter(self):
        root=self.project('first','Harbor')
        self.assertEqual(len(build.export([root/'.deep-context'],self.output)),1)
        (root/'.deep-context/docs/bad.md').write_text('---\nid: NEVER CLOSED\n')
        with self.assertRaises(ValueError):build.export([root],self.output)

    def test_split_phase_supporting_notes_are_not_extra_board_cards(self):
        root=self.project('first','Harbor')
        folder=root/'.deep-context/work/backlog/000010-larger-feature'
        folder.mkdir()
        (folder/'larger-feature.md').write_text('---\nid: PHASE-LARGER\nfeature: larger\ndepends_on: []\n---\n# Larger feature\n\n[Notes](larger-feature-notes.md)\n')
        (folder/'larger-feature-notes.md').write_text('# Supporting notes\nDetails only.\n')
        feature=root/'.deep-context/docs/features/larger';feature.mkdir()
        (feature/'larger.md').write_text('# Larger feature requirements\n')
        projects=build.export([root],self.output)
        records=projects[0]['records']
        self.assertEqual(records['work/backlog/000010-larger-feature/larger-feature.md']['lane'],'backlog')
        self.assertIsNone(records['work/backlog/000010-larger-feature/larger-feature-notes.md']['lane'])
        self.assertIn('docs/features/larger/larger.md',records['work/backlog/000010-larger-feature/larger-feature.md']['related'])
        board=(self.output/'work.html').read_text()
        self.assertIn('PHASE-LARGER',board)
        self.assertNotIn('<h3>Supporting notes</h3>',board)


if __name__ == '__main__':
    unittest.main()
