import shutil
import subprocess
import unittest
from pathlib import Path


class ControlsTest(unittest.TestCase):
    @unittest.skipUnless(shutil.which('node'), 'Node is required for browser-control runtime checks')
    def test_workspace_theme_and_history_controls(self):
        tests = Path(__file__).parent
        result = subprocess.run(
            ['node', str(tests/'controls.cjs'), str(tests.parent/'app.js')],
            capture_output=True, text=True, timeout=10,
        )
        self.assertEqual(result.returncode, 0, result.stdout+result.stderr)


if __name__ == '__main__':
    unittest.main()
