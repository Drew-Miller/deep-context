#!/usr/bin/env python3
"""Refresh registered local dashboards after an editing batch; no-op without a viewer."""
from pathlib import Path
import subprocess
import sys


def main():
    viewer = Path(__file__).resolve().parents[2] / 'dashboard'
    helper = viewer / 'refresh.py'
    if not helper.is_file():
        print('No local viewer; no dashboard refresh performed.')
        return 0
    return subprocess.run([sys.executable, str(helper), '--if-built']).returncode


if __name__ == '__main__':
    raise SystemExit(main())
