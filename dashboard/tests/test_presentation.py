import unittest
from html.parser import HTMLParser
from pathlib import Path
from urllib.parse import unquote, urlsplit
import test_dashboard as fixtures


class Cards(HTMLParser):
    def __init__(self):
        super().__init__();self.cards=[]
    def handle_starttag(self,tag,attrs):
        values=dict(attrs)
        if tag=='a' and values.get('class')=='browse-card':self.cards.append(values)


class Element:
    def __init__(self, tag, attrs=(), parent=None):
        self.tag = tag
        self.attrs = dict(attrs)
        self.parent = parent
        self.children = []
        self.text = ''

    def find_all(self, predicate):
        matches = []
        for child in self.children:
            if predicate(child):
                matches.append(child)
            matches.extend(child.find_all(predicate))
        return matches

    def has_class(self, name):
        return name in self.attrs.get('class', '').split()

    def content(self):
        return self.text + ''.join(child.content() for child in self.children)


class Page(HTMLParser):
    void_tags = {'area', 'base', 'br', 'col', 'embed', 'hr', 'img', 'input', 'link', 'meta', 'param', 'source', 'track', 'wbr'}

    def __init__(self, html):
        super().__init__()
        self.root = Element('document')
        self.current = self.root
        self.feed(html)

    def handle_starttag(self, tag, attrs):
        node = Element(tag, attrs, self.current)
        self.current.children.append(node)
        if tag not in self.void_tags:
            self.current = node

    def handle_endtag(self, tag):
        node = self.current
        while node.parent and node.tag != tag:
            node = node.parent
        if node.parent:
            self.current = node.parent

    def handle_data(self, text):
        self.current.text += text

    def find_all(self, predicate):
        return self.root.find_all(predicate)

    def by_id(self, value):
        return self.find_all(lambda node: node.attrs.get('id') == value)[0]


class PresentationTest(unittest.TestCase):
    def setUp(self):
        self.fixture=fixtures.DashboardTest(methodName='runTest');self.fixture.setUp()
        self.addCleanup(self.fixture.doCleanups)
        self.build=fixtures.build;self.output=self.fixture.output
        self.root=self.fixture.project('source','Harbor');self.context=self.root/'.deep-context'
        (self.context/'plans/000010-release.md').write_text('# Completed plan\n\n**Complete.** Foundation delivered.\n')
        (self.context/'plans/000020-future.md').write_text('# Future plan\n\nStatus: planned\n')
        (self.context/'plans/000030-current.md').write_text('# Current plan\n\n**In progress.** Build the next feature.\n\n## Phase order\n\n1. [Phase](../work/active/000010-feature.md)\n')
        (self.context/'plans/plans.md').write_text('# Plans\n\n1. **Complete** · [Completed plan](000010-release.md)\n2. **Next** · [Future plan](000020-future.md)\n3. **In progress** · [Current plan](000030-current.md)\n')

    def test_plan_view_and_sidebar_are_status_first_without_rewriting_markdown(self):
        before=self.fixture.digest(self.root)
        projects=self.build.export([self.root],self.output)
        self.assertEqual(before,self.fixture.digest(self.root))
        page=(self.output/'plans.html').read_text();parser=Cards();parser.feed(page)
        self.assertEqual([card['data-status'] for card in parser.cards],['active','backlog','completed'])
        tree=self.build.knowledge_tree(projects,'plans.html',scope='plans')
        self.assertLess(tree.index('000030-current.md'),tree.index('000020-future.md'))
        self.assertLess(tree.index('000020-future.md'),tree.index('000010-release.md'))
        board=(self.output/'work.html').read_text()
        self.assertLess(board.index('class="column active"'),board.index('class="column backlog"'))
        self.assertLess(board.index('class="column backlog"'),board.index('class="column completed"'))
        work=self.build.knowledge_tree(projects,'work.html',scope='work')
        self.assertLess(work.index('<summary data-status="active">'),work.index('<summary data-status="backlog">'))
        self.assertLess(work.index('<summary data-status="backlog">'),work.index('<summary data-status="completed">'))

    def test_markdown_execution_order_is_preserved_with_status_annotations(self):
        project=self.build.load_project(self.root);records=project['records']
        index=records['plans/plans.md'];rendered=self.build.render_markdown(index,records,index['url'])
        self.assertLess(rendered.index('data-status="completed"'),rendered.index('data-status="active"'))
        self.assertIn('data-status="backlog"',rendered)
        phase=records['work/active/000010-feature.md']
        phase['body']='# Phase\n\n## Ordered work items\n\n### 1. Done — implemented; user review pending\n\nEvidence is still readable.\n\n### 2. Current — in progress\n\nStill working.\n\n### 3. Future — pending\n\nLater.\n'
        rendered=self.build.render_markdown(phase,records,phase['url'])
        self.assertIn('<h3 data-status="completed"',rendered)
        self.assertIn('<h3 data-status="active"',rendered)
        self.assertIn('<h3 data-status="backlog"',rendered)
        self.assertLess(rendered.index('1. Done'),rendered.index('2. Current'))
        self.assertIn('Evidence is still readable.',rendered)
        self.assertEqual(phase['status'],'active')

    def test_all_workspace_groups_have_real_links_and_visible_trees_on_every_page(self):
        projects=self.build.export([self.root],self.output)
        record=projects[0]['records']['docs/features/sample.md']
        for name in ['index.html','work.html','documents.html','plans.html',record['url']]:
            with self.subTest(page=name):
                path=self.output/name
                page=Page(path.read_text())
                groups=page.find_all(lambda node: node.has_class('workspace-group'))
                self.assertEqual([group.attrs.get('data-workspace') for group in groups], ['work','plans','documents'])
                scrollers=page.find_all(lambda node: node.attrs.get('id') == 'workspace-scroll')
                self.assertEqual(len(scrollers), 1)
                scroller=scrollers[0]
                self.assertEqual(scroller.tag, 'nav')
                self.assertTrue(scroller.has_class('workspaces'))
                self.assertEqual(scroller.attrs.get('tabindex'), '0')
                self.assertEqual(scroller.children, groups)
                sidebar=scroller.parent
                self.assertTrue(sidebar.has_class('sidebar'))
                home=sidebar.find_all(lambda node: node.has_class('project-home'))
                footer=sidebar.find_all(lambda node: node.has_class('sidebar-footer'))
                self.assertEqual(len(home), 1)
                self.assertEqual(len(footer), 1)
                self.assertIs(home[0].parent, sidebar)
                self.assertIs(footer[0].parent, sidebar)
                for group, scope, target in zip(groups, ['work','plans','docs'], ['work.html','plans.html','documents.html']):
                    links=group.find_all(lambda node: 'data-view-link' in node.attrs)
                    self.assertEqual(len(links), 1)
                    self.assertEqual(links[0].tag, 'a')
                    self.assertEqual((path.parent/unquote(urlsplit(links[0].attrs['href']).path)).resolve(), (self.output/target).resolve())
                    toggles=group.find_all(lambda node: 'data-workspace-toggle' in node.attrs)
                    self.assertEqual(len(toggles), 1)
                    self.assertEqual(toggles[0].tag, 'button')
                    self.assertEqual(toggles[0].attrs.get('aria-expanded'), 'true')
                    trees=group.find_all(lambda node: node.has_class('tree') and 'data-workspace-tree' in node.attrs)
                    self.assertEqual(len(trees), 1)
                    self.assertNotIn('hidden', trees[0].attrs)
                    self.assertTrue(trees[0].find_all(lambda node: node.has_class('project-tree')))
                    self.assertTrue(trees[0].find_all(lambda node: node.attrs.get('data-folder', '').startswith(scope+'/')))
        documents=(self.output/'documents.html').read_text();parser=Cards();parser.feed(documents)
        self.assertTrue(parser.cards)
        self.assertTrue(all('/docs/' in c['href'] for c in parser.cards))
        self.assertTrue(all('data-status' not in c for c in parser.cards))
        page=(self.output/record['url']).read_text()
        self.assertIn('data-view="documents"',page)
        # Relative pages/assets are checked by the existing cross-project link test.

    def test_home_explains_the_viewer_and_links_to_workspaces_and_optional_knowledge(self):
        knowledge=self.context/'docs/knowledge.md'
        knowledge.write_text('# Knowledge\n\nCanonical project knowledge.\n')
        projects=self.build.export([self.root],self.output)
        home=Page((self.output/'index.html').read_text())
        content=home.by_id('page-content')
        self.assertIn('read-only',content.content().lower())
        self.assertTrue(content.find_all(lambda node: node.tag == 'h1'))
        self.assertFalse(content.find_all(lambda node: node.has_class('board')))
        links=content.find_all(lambda node: node.tag == 'a')
        targets={unquote(urlsplit(link.attrs['href']).path) for link in links}
        self.assertTrue({'work.html','documents.html','plans.html'}.issubset(targets))
        self.assertIn(projects[0]['records']['docs/knowledge.md']['url'],targets)
        knowledge.unlink()
        self.build.export([self.root],self.output)
        home=Page((self.output/'index.html').read_text())
        self.assertFalse(any('/docs/knowledge.html' in node.attrs.get('href','') for node in home.by_id('page-content').find_all(lambda node: node.tag == 'a')))

    def test_theme_and_history_controls_are_accessible_on_root_and_record_pages(self):
        projects=self.build.export([self.root],self.output)
        record=projects[0]['records']['work/active/000010-feature.md']
        for name in ['index.html','work.html','documents.html','plans.html',record['url']]:
            with self.subTest(page=name):
                page=Page((self.output/name).read_text())
                theme=page.by_id('theme-picker')
                self.assertEqual(theme.tag,'select')
                options=theme.find_all(lambda node: node.tag=='option')
                self.assertEqual([node.attrs.get('value') for node in options],['system','light','dark'])
                selected=[node.attrs.get('value') for node in options if 'selected' in node.attrs]
                self.assertEqual(selected or [options[0].attrs.get('value')],['system'])
                labels=page.find_all(lambda node: node.tag=='label' and node.attrs.get('for')=='theme-picker')
                parent=theme.parent
                while parent and parent.tag!='label':
                    parent=parent.parent
                self.assertTrue(labels or parent or theme.attrs.get('aria-label'))
                back=page.find_all(lambda node: 'data-history-back' in node.attrs)
                if name=='index.html':
                    self.assertFalse(back)
                    continue
                self.assertEqual(len(back),1)
                self.assertEqual(back[0].tag,'button')
                self.assertIn('Back',back[0].content())

    def test_explicit_plan_status_wins_over_index_and_reference_docs_stay_neutral(self):
        plan=self.context/'plans/000030-current.md'
        plan.write_text('---\nstatus: completed\n---\n'+plan.read_text())
        (self.context/'docs/decisions/accepted.md').write_text('---\nstatus: accepted\n---\n# Accepted decision\n')
        records=self.build.load_project(self.root)['records']
        self.assertEqual(records['plans/000030-current.md']['status'],'completed')
        self.assertIsNone(records['docs/decisions/accepted.md']['status'])

    def test_root_views_do_not_preselect_modules_and_record_views_select_only_the_record(self):
        projects = self.build.export([self.root], self.output)
        for name in ['index.html', 'work.html', 'documents.html', 'plans.html']:
            page = (self.output/name).read_text()
            self.assertEqual(page.count('aria-current="page"'), 1)
            selected = Page(page).find_all(lambda node: node.attrs.get('aria-current') == 'page')
            self.assertEqual(selected[0].tag, 'a')
            self.assertEqual(Path(unquote(urlsplit(selected[0].attrs['href']).path)).name, name)
            self.assertNotIn('autofocus', page)
            self.assertNotIn('project-select', page)
            tree = self.build.knowledge_tree(projects, name, scope='work')
            self.assertNotIn('aria-current', tree)
            self.assertNotRegex(tree, r'<details\b[^>]*\bopen(?:\s|>)')
        record = projects[0]['records']['work/active/000010-feature.md']
        page = (self.output/record['url']).read_text()
        self.assertNotIn('class="nav-item selected"', page)
        self.assertEqual(page.count('aria-current="page"'), 1)
        selected = Page(page).find_all(lambda node: node.attrs.get('aria-current') == 'page')
        self.assertEqual(Path(unquote(urlsplit(selected[0].attrs['href']).path)).name, '000010-feature.html')
        self.assertIn('data-folder="work/active" open', page)
        self.assertIn('class="workspace-group', page)
        self.assertIn('class="tree-icon icon-', page)
        self.assertIn('class="tree-children"', page)

    def test_work_cards_stack_in_status_columns_without_plan_panels(self):
        self.build.export([self.root],self.output)
        page=Page((self.output/'work.html').read_text())
        content=page.by_id('page-content')
        columns=content.find_all(lambda node: node.has_class('column'))
        self.assertEqual([next(state for state in ['active','backlog','completed'] if node.has_class(state)) for node in columns],['active','backlog','completed'])
        self.assertFalse(content.find_all(lambda node: node.has_class('bottom-grid')))
        self.assertFalse(content.find_all(lambda node: node.has_class('panel')))
        active=columns[0].find_all(lambda node: node.has_class('ticket'))
        self.assertEqual(len(active),1)
        self.assertEqual(Path(active[0].attrs['href']).name,'000010-feature.html')
        for column in columns:
            tickets=column.find_all(lambda node: node.has_class('ticket'))
            self.assertTrue(all(node.parent is column for node in tickets))

    def test_work_backlog_and_undated_completion_use_ticket_priority_not_plan_rank(self):
        backlog=['000020-priority.md','000030-next.md','000040-later.md']
        for name in backlog:
            (self.context/'work/backlog'/name).write_text('# '+Path(name).stem+'\n')
        completed=['000020-undated-first.md','000030-undated-second.md','000040-old.md','000050-recent.md']
        for name in completed:
            date={'000040-old.md':'2026-11-04','000050-recent.md':'2026-11-05T10:00:00-08:00'}.get(name)
            frontmatter='---\ncompleted_at: '+date+'\n---\n' if date else ''
            (self.context/'work/completed'/name).write_text(frontmatter+'# '+Path(name).stem+'\n')
        # The plan links intentionally disagree with ticket priority in both lanes.
        (self.context/'plans/000030-current.md').write_text('# Current plan\n\n**In progress.**\n\n## Phase order\n\n'+''.join(f'{i}. [Phase](../work/{lane}/{name})\n' for i,(lane,name) in enumerate([('backlog',name) for name in reversed(backlog)]+[('completed',name) for name in reversed(completed)],1)))
        (self.context/'work/work-board.md').write_text('# Work board\n\n'+''.join(f'[Work]({lane}/{name})\n' for lane,names in [('backlog',backlog),('completed',completed)] for name in names))
        before=self.fixture.digest(self.root)
        projects=self.build.export([self.root],self.output)
        self.assertEqual(before,self.fixture.digest(self.root))
        self.assertLess(projects[0]['records']['work/backlog/'+backlog[-1]]['_rank'],projects[0]['records']['work/backlog/'+backlog[0]]['_rank'])
        page=Page((self.output/'work.html').read_text())
        def tickets(state):
            column=page.by_id('page-content').find_all(lambda node: node.has_class('column') and node.has_class(state))[0]
            return [Path(node.attrs['href']).name for node in column.find_all(lambda node: node.has_class('ticket'))]
        self.assertEqual(tickets('backlog'),[name.replace('.md','.html') for name in backlog])
        self.assertEqual(tickets('completed'),['000050-recent.html','000040-old.html','000010-foundation.html','000020-undated-first.html','000030-undated-second.html'])
        tree=self.build.knowledge_tree(projects,'work.html',scope='work')
        self.assertLess(tree.index(backlog[0]),tree.index(backlog[-1]))
        self.assertLess(tree.index('000050-recent.md'),tree.index('000040-old.md'))
        self.assertLess(tree.index('000020-undated-first.md'),tree.index('000030-undated-second.md'))

    def test_documents_group_by_real_category_with_root_files_under_documentation(self):
        (self.context/'docs/notes').mkdir()
        (self.context/'docs/notes/review.md').write_text('# Review note\n\nOnlySourceHistoryNeedle\n')
        (self.context/'docs/interviews').mkdir()
        (self.context/'docs/interviews/origin.md').write_text('# Origin interview\n\nUnpublishedInterviewNeedle\n')
        (self.context/'docs/knowledge.md').write_text('# Knowledge\n')
        (self.context/'docs/decisions/choice.md').write_text('# An accepted choice\n')
        (self.context/'docs/requirements').mkdir()
        (self.context/'docs/requirements/checks.md').write_text('# Required checks\n')
        before = self.fixture.digest(self.root)
        self.build.export([self.root], self.output)
        self.assertEqual(before, self.fixture.digest(self.root))
        page = (self.output/'documents.html').read_text()
        for category, title in [('features', 'Features'), ('decisions', 'Decisions'), ('requirements', 'Requirements'), ('documentation', 'Documentation')]:
            marker = 'data-category="'+category+'"'
            section = page[page.index(marker):].split('</section>', 1)[0]
            self.assertIn(title+'<span class="count">1</span>', section)
            parser = Cards();parser.feed(section)
            self.assertEqual(len(parser.cards), 1)
            expected = '/docs/'+category+'/' if category != 'documentation' else '/docs/knowledge.html'
            self.assertIn(expected, parser.cards[0]['href'])
        self.assertNotIn('data-category="notes"', page)
        self.assertNotIn('data-category="interviews"', page)
        self.assertNotIn('data-folder="docs/notes"', page)
        self.assertNotIn('data-folder="docs/interviews"', page)
        self.assertIn('class="tree-leaf tree-overview"', page)
        self.assertIn('>Knowledge</span>', page)
        catalog = (self.output/'catalog.js').read_text()
        self.assertNotIn('OnlySourceHistoryNeedle', catalog)
        self.assertNotIn('UnpublishedInterviewNeedle', catalog)
        self.assertFalse(list(self.output.glob('projects/*/docs/notes/*.html')))
        self.assertFalse(list(self.output.glob('projects/*/docs/interviews/*.html')))

    def test_knowledge_uses_its_curated_links_without_a_related_records_panel(self):
        (self.context/'docs/knowledge.md').write_text('# Knowledge\n\n[Feature](features/sample.md)\n')
        projects = self.build.export([self.root], self.output)
        record = projects[0]['records']['docs/knowledge.md']
        page = Page((self.output/record['url']).read_text())
        self.assertTrue(page.find_all(lambda node: node.has_class('knowledge-layout')))
        self.assertFalse(page.find_all(lambda node: node.has_class('record-related')))
        body = page.find_all(lambda node: node.has_class('record-body'))[0]
        self.assertTrue(body.find_all(lambda node: node.tag == 'a' and node.attrs.get('href', '').endswith('features/sample.html')))
        feature = projects[0]['records']['docs/features/sample.md']
        page = Page((self.output/feature['url']).read_text())
        self.assertTrue(page.find_all(lambda node: node.has_class('record-related')))

    def test_plan_panels_keep_backlog_order_and_latest_completion_first(self):
        (self.context/'plans/000040-recent.md').write_text('---\ncompleted_at: 2026-11-05T10:00:00-08:00\n---\n# Recent\n\n**Complete.**\n')
        (self.context/'plans/000050-old.md').write_text('---\ncompleted_at: 2026-11-04\n---\n# Older\n\n**Complete.**\n')
        (self.context/'plans/000060-next.md').write_text('# Next backlog plan\n\nStatus: planned\n')
        index = self.context/'plans/plans.md'
        index.write_text(index.read_text()+'\n4. [Next](000060-next.md)\n5. [Older](000050-old.md)\n6. [Recent](000040-recent.md)\n')
        before = self.fixture.digest(self.root)
        projects = self.build.export([self.root], self.output)
        self.assertEqual(before, self.fixture.digest(self.root))
        tree = self.build.knowledge_tree(projects, 'plans.html', scope='plans')
        for state in ('active', 'backlog', 'completed'):
            self.assertIn('data-folder="plans/'+state+'"', tree)
        self.assertLess(tree.index('000020-future.md'), tree.index('000060-next.md'))
        self.assertLess(tree.index('000040-recent.md'), tree.index('000050-old.md'))
        self.assertLess(tree.index('000050-old.md'), tree.index('000010-release.md'))
        self.assertIn('completion dates were not recorded', tree)
        parser = Cards();parser.feed((self.output/'plans.html').read_text())
        completed = [card['href'] for card in parser.cards if card.get('data-status') == 'completed']
        self.assertTrue(completed[0].endswith('000040-recent.html'))
        self.assertTrue(completed[1].endswith('000050-old.html'))
        self.assertTrue(completed[2].endswith('000010-release.html'))

    def test_large_plan_history_keeps_every_item_and_backlog_priority(self):
        index = self.context/'plans/plans.md'
        next_plans = []
        for i in range(12):
            name = f'{100+i*10:06}-future-{i}.md'
            (self.context/'plans'/name).write_text(f'# Future {i}\n\nStatus: planned\n')
            next_plans.append(name)
        index.write_text(index.read_text()+'\n'+'\n'.join(f'[Future]({name})' for name in reversed(next_plans))+'\n')
        for i in range(36):
            (self.context/'plans'/f'{1000+i*10:06}-finished-{i}.md').write_text(f'---\ncompleted_at: 2026-11-05T11:{i:02}:00-08:00\n---\n# Finished {i}\n\n**Complete.**\n')
        projects = self.build.export([self.root], self.output)
        parser = Cards();parser.feed((self.output/'plans.html').read_text())
        completed = [card for card in parser.cards if card.get('data-status') == 'completed']
        backlog = [card for card in parser.cards if card.get('data-status') == 'backlog']
        self.assertEqual(len(completed), 37)
        self.assertEqual(len(backlog), 13)
        self.assertTrue(completed[0]['href'].endswith('001350-finished-35.html'))
        self.assertTrue(completed[35]['href'].endswith('001000-finished-0.html'))
        expected = ['000020-future.html']+[name.replace('.md', '.html') for name in reversed(next_plans)]
        self.assertEqual([Path(card['href']).name for card in backlog], expected)
        tree = self.build.knowledge_tree(projects, 'plans.html', scope='plans')
        self.assertEqual(tree.count('class="tree-leaf"'), len(parser.cards))
        self.assertLess(tree.index('001350-finished-35.md'), tree.index('001000-finished-0.md'))


if __name__=='__main__':unittest.main()
