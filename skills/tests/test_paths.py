import importlib.util
import tempfile
import unittest
from pathlib import Path

spec = importlib.util.spec_from_file_location('paths', Path(__file__).parents[1] / '_shared' / 'paths.py')
p = importlib.util.module_from_spec(spec)
spec.loader.exec_module(p)

class PathsTest(unittest.TestCase):
    def setUp(self):
        self.tmp = tempfile.TemporaryDirectory()
        self.addCleanup(self.tmp.cleanup)
        self.root = Path(self.tmp.name)
        for lane in ('backlog', 'active', 'completed'):
            (self.root / 'work' / lane).mkdir(parents=True)
        (self.root / 'plans').mkdir()

    def item(self, lane, name, text):
        path = self.root / 'work' / lane / (name + '.md')
        path.write_text(text)

    def test_complete_into_populated_lane_updates_links(self):
        self.item('active', '000010-first', '[other](../completed/000010-old.md#proof)')
        self.item('completed', '000010-old', '[first](../active/000010-first.md)')
        (self.root / 'START.md').write_text('[old](work/completed/000010-old.md) [first](work/active/000010-first.md)')
        p.apply(self.root, p.work_move_map(self.root, 'work/active/000010-first.md', 'completed'))
        first = self.root / 'work/completed/000010-first.md'
        old = self.root / 'work/completed/000020-old.md'
        self.assertEqual(first.read_text(), '[other](000020-old.md#proof)')
        self.assertEqual(old.read_text(), '[first](000010-first.md)')
        self.assertEqual((self.root / 'START.md').read_text(), '[old](work/completed/000020-old.md) [first](work/completed/000010-first.md)')

    def test_recursive_plan_order(self):
        plans = self.root / 'plans'
        top = plans / '000020-readable-folders'
        child = top / 'readable-folders-002-scope'
        grand = child / 'readable-folders-002-001-detail'
        child.mkdir(parents=True)
        grand = grand.with_suffix('.md')
        grand.write_text('detail')
        (child / 'readable-folders-002-scope.md').write_text('[detail](readable-folders-002-001-detail.md)')
        (plans / '000010-other.md').write_text('other')
        (self.root / 'START.md').write_text('[detail](plans/000020-readable-folders/readable-folders-002-scope/readable-folders-002-001-detail.md)')
        p.apply(self.root, p.plan_map(plans, ['000020-readable-folders', '000010-other.md']))
        expected = 'plans/000010-readable-folders/readable-folders-001-scope/readable-folders-001-001-detail.md'
        self.assertTrue((self.root / expected).exists())
        entry = self.root / 'plans/000010-readable-folders/readable-folders-001-scope/readable-folders-001-scope.md'
        self.assertEqual(entry.read_text(), '[detail](readable-folders-001-001-detail.md)')
        self.assertEqual((self.root / 'START.md').read_text(), '[detail](' + expected + ')')

    def test_reorder_and_historical_transcript(self):
        self.item('backlog', '000010-one', 'one')
        self.item('backlog', '000020-two', '[one](000010-one.md)')
        history = self.root / 'docs/interviews/old.md'
        history.parent.mkdir(parents=True)
        history.write_text('[literal](../../work/backlog/000010-one.md)')
        p.apply(self.root, p.work_map(self.root, 'backlog', ['000020-two.md', '000010-one.md']))
        self.assertEqual((self.root / 'work/backlog/000010-two.md').read_text(), '[one](000020-one.md)')
        self.assertEqual(history.read_text(), '[literal](../../work/backlog/000010-one.md)')

    def test_nested_parent_reorder_and_image_link(self):
        top = self.root / 'plans/000010-init'
        (top / 'init-001-one').mkdir(parents=True)
        (top / 'init-002-two').mkdir()
        (top / 'init.md').write_text('![image](init-001-one/diagram.png)')
        (top / 'init-001-one/diagram.png').write_bytes(b'image')
        p.apply(self.root, p.plan_map(top, ['init-002-two', 'init-001-one']))
        self.assertEqual((top / 'init.md').read_text(), '![image](init-002-one/diagram.png)')
        self.assertEqual((top / 'init-002-one/diagram.png').read_bytes(), b'image')

    def test_collision_and_symlink_rejected_without_mutation(self):
        self.item('backlog', '000010-one', 'one')
        self.item('backlog', '000020-two', 'two')
        lane = self.root / 'work/backlog'
        with self.assertRaises(ValueError):
            p.apply(self.root, {lane / '000010-one.md': lane / '000020-two.md'})
        (self.root / 'link').symlink_to(lane)
        with self.assertRaises(ValueError):
            p.apply(self.root, p.work_map(self.root, 'backlog', ['000020-two.md', '000010-one.md']))
        self.assertEqual((lane / '000010-one.md').read_text(), 'one')

    def test_split_ticket_move_preserves_supporting_links(self):
        folder = self.root / 'work/active/000010-feature'
        folder.mkdir()
        (folder / 'feature.md').write_text('[evidence](feature-evidence.md)')
        (folder / 'feature-evidence.md').write_text('[entry](feature.md)')
        p.apply(self.root, p.work_move_map(self.root, 'work/active/000010-feature', 'completed'))
        target = self.root / 'work/completed/000010-feature'
        self.assertEqual((target / 'feature.md').read_text(), '[evidence](feature-evidence.md)')
        self.assertEqual((target / 'feature-evidence.md').read_text(), '[entry](feature.md)')

    def test_flat_plan_reorder_preserves_target(self):
        plans = self.root / 'plans'
        (plans / '000010-one.md').write_text('[other](000020-two.md#next)')
        (plans / '000020-two.md').write_text('two')
        p.apply(self.root, p.plan_map(plans, ['000020-two.md', '000010-one.md']))
        self.assertEqual((plans / '000020-one.md').read_text(), '[other](000010-two.md#next)')
        self.assertEqual((plans / '000010-two.md').read_text(), 'two')

if __name__ == '__main__':
    unittest.main()
