#!/usr/bin/env python3
"""Refresh this viewer's registered snapshots after settled edits; no watcher or model."""
import argparse
import sys
import build


def refresh(output=None):
    results = []
    with build.viewer_lock():
        entries = build.read_registry()['exports']
        if output is not None:
            entries = [e for e in entries if e['output'] == str(output.resolve())]
        for entry in entries:
            fingerprint = build.input_fingerprint(entry['projects'])
            if fingerprint == entry['fingerprint'] and (build.Path(entry['output']) / 'index.html').is_file():
                results.append(('unchanged', entry['output']))
                continue
            build._export(entry['projects'], build.Path(entry['output']))
            results.append(('rebuilt', entry['output']))
    return results


def main():
    parser = argparse.ArgumentParser(description=__doc__)
    parser.add_argument('--if-built', action='store_true', help='Safe no-op when no export is registered (also the default)')
    args = parser.parse_args()
    try:
        results = refresh()
    except (ValueError, OSError, KeyError) as error:
        parser.exit(1, f'Dashboard refresh failed: {error}\n')
    if not results:
        print('No registered dashboard; nothing to refresh.')
    for status, output in results:
        print(f'{status}: {output}')


if __name__ == '__main__':
    main()
