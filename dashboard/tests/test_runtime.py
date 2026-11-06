import importlib
import json
import os
import shutil
import subprocess
import sys
import unittest
from pathlib import Path
from unittest.mock import patch

import test_dashboard as fixtures

VIEWER = Path(__file__).parents[1]
if str(VIEWER) not in sys.path:
    sys.path.insert(0, str(VIEWER))


class RuntimeTest(unittest.TestCase):
    def setUp(self):
        self.fixture = fixtures.DashboardTest(methodName='runTest')
        self.fixture.setUp()
        self.addCleanup(self.fixture.doCleanups)
        self.build = fixtures.build
        self.output = self.fixture.output
        self.root = self.fixture.project('source', 'Harbor')
        self.refresh = importlib.import_module('refresh')
        replacement = patch.object(self.refresh, 'build', self.build)
        replacement.start(); self.addCleanup(replacement.stop)

    def test_bold_links_labels_and_literal_code(self):
        project = self.build.load_project(self.root)
        record = project['records']['plans/000010-release.md']
        record['body'] = '# Release\n\n## Phase order\n\n1. **Ready — [Phase](../work/active/000010-feature.md).**\n\n[**Styled phase**](../work/active/000010-feature.md)\n\n`[Literal](../work/active/000010-feature.md)`\n'
        page = self.build.render_markdown(record, project['records'], record['url'])
        self.assertIn('<strong>Ready — <a href=', page)
        self.assertIn('><strong>Styled phase</strong></a>', page)
        self.assertIn('<code>[Literal](../work/active/000010-feature.md)</code>', page)
        self.assertEqual(page.count('<a href='), 2)

    def test_actual_tree_and_execution_rank_reference_documents(self):
        context = self.root/'.deep-context'
        (context/'docs/requirements').mkdir()
        for name in ['z-first', 'a-second', 'a-unrelated', 'b-unrelated']:
            (context/f'docs/requirements/{name}.md').write_text('# '+name+'\n')
        phase = context/'work/active/000010-feature.md'
        phase.write_text(phase.read_text()+'\n### 2. Ranked links\n\n[First](../../docs/requirements/z-first.md)\n\n### 3. Next link\n\n[Second](../../docs/requirements/a-second.md)\n')
        (context/'plans/000010-release.md').write_text('# Release\n\n## Phase order\n\n1. [Phase](../work/active/000010-feature.md)\n')
        project = self.build.load_project(self.root)
        records = project['records']
        ordered = sorted([r for r in records.values() if r['path'].startswith('docs/requirements/')], key=self.build.record_order)
        self.assertEqual([Path(r['path']).stem for r in ordered], ['z-first','a-second','a-unrelated','b-unrelated'])
        tree = self.build.knowledge_tree([project], 'index.html')
        for folder in ['docs', 'docs/requirements', 'work', 'docs/decisions']:
            self.assertIn('data-folder="'+folder+'"', tree)
        self.assertIn('No Markdown documents yet',tree)
        self.assertNotIn('Project entry',tree)
        self.assertLess(tree.index('z-first.md'),tree.index('a-second.md'))
        # A general index linking an unrelated document must not confer phase priority.
        (context/'docs/knowledge.md').write_text('# Knowledge\n\n[A](requirements/a-unrelated.md)\n')
        phase.write_text(phase.read_text()+'\n[Knowledge](../../docs/knowledge.md)\n')
        project = self.build.load_project(self.root)
        self.assertEqual(project['records']['docs/requirements/a-unrelated.md']['_rank'], (10**9,)*3)

    def test_plan_order_and_nested_phase_order_override_filenames(self):
        context = self.root/'.deep-context'
        (context/'work/active/000020-second.md').write_text('---\nid: PHASE-SECOND\ndepends_on: []\n---\n# Second\n')
        (context/'plans/000020-subplan.md').write_text('# Subplan\n\n## Phase order\n\n1. [Second](../work/active/000020-second.md)\n')
        (context/'plans/000010-release.md').write_text('# Release\n\n## Phase order\n\n1. [Subplan](000020-subplan.md)\n2. [First](../work/active/000010-feature.md)\n')
        project = self.build.load_project(self.root)
        records = project['records']
        self.assertLess(records['work/active/000020-second.md']['_rank'], records['work/active/000010-feature.md']['_rank'])

    def test_refresh_coalesces_edits_preserves_source_and_skips_output(self):
        self.build.export([self.root],self.output)
        before=self.fixture.digest(self.root)
        self.assertEqual(self.refresh.refresh(), [('unchanged',str(self.output))])
        self.assertEqual(before,self.fixture.digest(self.root))
        for i in range(3):
            (self.root/f'.deep-context/docs/new-{i}.md').write_text('# New '+str(i)+'\n')
        with patch.object(self.build,'_export',wraps=self.build._export) as exporter:
            self.assertEqual(self.refresh.refresh(), [('rebuilt',str(self.output))])
            self.assertEqual(exporter.call_count,1)
        registry=self.build.read_registry()
        self.assertEqual(registry['exports'][0]['projects'], [str(self.root)])
        self.assertEqual(self.refresh.refresh(), [('unchanged',str(self.output))])
        (self.output/'arbitrary-generated-note.md').write_text('not an input')
        self.assertEqual(self.refresh.refresh(), [('unchanged',str(self.output))])
        (self.build.ASSETS/'styles.css').write_text('/* edited asset */')
        self.assertEqual(self.refresh.refresh(), [('rebuilt',str(self.output))])

    def test_refresh_failure_preserves_snapshot_and_receipt(self):
        self.build.export([self.root],self.output)
        previous=(self.output/'index.html').read_bytes()
        receipt=(self.build.ASSETS/self.build.REGISTRY).read_bytes()
        (self.root/'.deep-context/START.md').unlink()
        with self.assertRaises(ValueError):self.refresh.refresh()
        self.assertEqual(previous,(self.output/'index.html').read_bytes())
        self.assertEqual(receipt,(self.build.ASSETS/self.build.REGISTRY).read_bytes())

    def test_default_snapshot_is_inside_context_and_never_reenters_source_loading(self):
        before = self.fixture.digest(self.root)
        fingerprint = self.build.input_fingerprint([self.root])
        self.build.export([self.root])
        output = self.root/'.deep-context/dashboard'
        self.assertTrue((output/'index.html').is_file())
        self.assertEqual(self.build.read_registry()['exports'][0]['output'], str(output))
        (output/'generated-example.md').write_text('# Generated output is not canonical knowledge\n')
        (output/'extra-folder').mkdir()
        self.assertEqual(fingerprint, self.build.input_fingerprint([self.root]))
        self.assertEqual(self.refresh.refresh(), [('unchanged', str(output))])
        records = self.build.load_project(self.root)['records']
        self.assertFalse(any(path.startswith('dashboard/') for path in records))
        after = self.fixture.digest(self.root)
        self.assertTrue(all(after[path] == digest for path, digest in before.items()))
        with self.assertRaises(ValueError):
            self.build.export([self.root], self.root/'.deep-context/docs/generated')

    def test_concurrent_builds_keep_both_registered_outputs(self):
        viewer=self.build.ASSETS
        commands=[[sys.executable,str(viewer/'build.py'),'--project',str(self.root),'--output',str(self.fixture.base/name)] for name in ['one','two']]
        processes=[subprocess.Popen(command,stdout=subprocess.PIPE,stderr=subprocess.PIPE,text=True) for command in commands]
        for process in processes:
            out,error=process.communicate(timeout=10)
            self.assertEqual(process.returncode,0,error)
        self.assertEqual(len(self.build.read_registry()['exports']),2)
        self.assertTrue((self.fixture.base/'one/index.html').is_file())
        self.assertTrue((self.fixture.base/'two/index.html').is_file())


@unittest.skipUnless(os.environ.get('DC_DASHBOARD_SERVER_TESTS')=='1','Explicit loopback integration gate')
class ServerTest(unittest.TestCase):
    def setUp(self):
        self.fixture=fixtures.DashboardTest(methodName='runTest');self.fixture.setUp()
        self.addCleanup(self.fixture.doCleanups)
        self.build=fixtures.build;self.viewer=self.build.ASSETS
        self.root=self.fixture.project('source','Harbor');self.output=self.fixture.output
        self.addCleanup(self.cleanup_server)
    def command(self,*args,check=True):
        result=subprocess.run([sys.executable,str(self.viewer/'serve.py'),*args],capture_output=True,text=True,timeout=15)
        if check:self.assertEqual(result.returncode,0,result.stderr)
        return result
    def cleanup_server(self):
        state=self.viewer/'.dashboard-server.json'
        if state.is_file():
            self.command('stop',check=False)
    def test_start_reuse_refresh_stop_and_unrelated_server_survives(self):
        import threading
        from http.server import ThreadingHTTPServer,SimpleHTTPRequestHandler
        from urllib.request import urlopen
        class Quiet(SimpleHTTPRequestHandler):
            def log_message(self,*args):pass
        unrelated=ThreadingHTTPServer(('127.0.0.1',0),Quiet)
        thread=threading.Thread(target=unrelated.serve_forever,daemon=True);thread.start()
        self.addCleanup(unrelated.server_close);self.addCleanup(unrelated.shutdown)
        port=unrelated.server_address[1]
        result=self.command('start','--project',str(self.root),'--output',str(self.output),'--port',str(port))
        state=json.loads((self.viewer/'.dashboard-server.json').read_text())
        self.assertGreater(state['port'],port)
        self.assertIn(state['url'],result.stdout)
        first_pid=state['pid']
        (self.root/'.deep-context/docs/new.md').write_text('# Fresh content\n')
        self.command('start','--output',str(self.output))
        self.assertEqual(first_pid,json.loads((self.viewer/'.dashboard-server.json').read_text())['pid'])
        self.assertIn('Fresh content',(self.output/'catalog.js').read_text())
        self.command('stop')
        self.assertFalse((self.viewer/'.dashboard-server.json').exists())
        with urlopen(f'http://127.0.0.1:{port}/',timeout=2) as response:self.assertEqual(response.status,200)
    def test_stop_refuses_mismatched_instance(self):
        self.command('start','--project',str(self.root),'--output',str(self.output))
        path=self.viewer/'.dashboard-server.json';original=path.read_text();state=json.loads(original)
        try:
            state['instance']='not-the-owned-instance';path.write_text(json.dumps(state))
            result=self.command('stop',check=False)
            self.assertNotEqual(result.returncode,0)
            self.assertIn('no process was stopped',result.stderr)
        finally:path.write_text(original)
        self.command('status')
        self.command('stop')


if __name__=='__main__':unittest.main()
