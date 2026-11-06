#!/usr/bin/env python3
"""Start or stop this local viewer's owned loopback server."""
import argparse
import errno
import functools
import json
import os
import subprocess
import sys
import threading
import time
import uuid
from http.server import SimpleHTTPRequestHandler, ThreadingHTTPServer
from pathlib import Path
from urllib.error import HTTPError, URLError
from urllib.request import Request, urlopen
import build

STATE = '.dashboard-server.json'
HEALTH = '/.deep-context-dashboard/health'
SHUTDOWN = '/.deep-context-dashboard/stop'


def read_state():
    path = build.ASSETS / STATE
    if path.is_symlink():
        raise ValueError('Server state must not be a symlink')
    return json.loads(path.read_text()) if path.is_file() else None


def probe(state):
    if not state or state.get('host') != '127.0.0.1' or not isinstance(state.get('port'), int):
        return False
    try:
        with urlopen(f'http://127.0.0.1:{state["port"]}{HEALTH}', timeout=0.5) as response:
            value = json.loads(response.read())
            return value.get('instance') == state.get('instance') and value.get('output') == state.get('output')
    except (URLError, OSError, ValueError):
        return False


def ensure_snapshot(output, projects=None):
    entries = build.read_registry()['exports']
    entry = next((e for e in entries if e['output'] == str(output)), None)
    if projects is not None:
        roots = projects
    elif entry:
        roots = entry['projects']
    else:
        roots = [local_project()]
    if not entry or projects is not None or entry['fingerprint'] != build.input_fingerprint(roots) or not (output/'index.html').is_file():
        build._export(roots, output)


def local_project():
    home = build.ASSETS.parent
    return home.parent if home.name == '.deep-context-tools' else home


def start(output=None, projects=None, port=8765):
    if projects is not None and len(projects) != 1:
        raise ValueError('Each dashboard belongs to exactly one project')
    output = (output or build.dashboard_path(projects[0] if projects else local_project())).absolute()
    if output.is_symlink():
        raise ValueError('Output must not be a symlink')
    output = output.resolve()
    if not 1 <= port <= 65535:
        raise ValueError('Port must be between 1 and 65535')
    with build.viewer_lock():
        state = read_state()
        if probe(state):
            if state['output'] != str(output):
                raise ValueError('This viewer is serving another output; stop it before selecting a different output')
            ensure_snapshot(output, projects)
            return state
        ensure_snapshot(output, projects)
        log_path = build.ASSETS / '.dashboard-server.log'
        if log_path.is_symlink():
            raise ValueError('Server log must not be a symlink')
        for candidate in range(port, min(port + 30, 65536)):
            instance = uuid.uuid4().hex
            command = [sys.executable, str(build.ASSETS/'serve.py'), '_run', '--output', str(output), '--port', str(candidate), '--instance', instance]
            with log_path.open('a') as log:
                process = subprocess.Popen(command, stdin=subprocess.DEVNULL, stdout=log, stderr=subprocess.STDOUT, start_new_session=True, close_fds=True)
            deadline = time.monotonic() + 8
            while time.monotonic() < deadline:
                current = read_state()
                if current and current.get('instance') == instance and probe(current):
                    return current
                if process.poll() is not None:
                    if process.returncode == 98:
                        break
                    raise RuntimeError(f'Dashboard server exited with {process.returncode}; see {log_path}')
                time.sleep(0.05)
            else:
                # Only the child created by this call is terminated on a failed start.
                process.terminate(); process.wait(timeout=5)
                raise RuntimeError(f'Dashboard server did not become ready; see {log_path}')
        raise RuntimeError('No available loopback port in the requested range')


def stop():
    with build.viewer_lock():
        state = read_state()
        if state is None:
            return False
        if not probe(state):
            raise ValueError('Saved server is not the owned dashboard instance; no process was stopped')
        request = Request(f'http://127.0.0.1:{state["port"]}{SHUTDOWN}', data=b'', headers={'X-Deep-Context-Instance': state['instance']}, method='POST')
        with urlopen(request, timeout=2) as response:
            response.read()
        deadline = time.monotonic() + 5
        while time.monotonic() < deadline:
            if not probe(state):
                path = build.ASSETS / STATE
                current = read_state()
                if current and current.get('instance') == state['instance']:
                    path.unlink(missing_ok=True)
                return True
            time.sleep(0.05)
        raise RuntimeError('Dashboard shutdown has not completed')


def run_server(output, port, instance):
    state = {'host': '127.0.0.1', 'port': port, 'instance': instance, 'output': str(output.resolve()), 'pid': os.getpid(), 'url': f'http://127.0.0.1:{port}/'}
    class Handler(SimpleHTTPRequestHandler):
        def end_headers(self):
            self.send_header('Cache-Control', 'no-store')
            super().end_headers()
        def json_response(self, code, data):
            body = json.dumps(data).encode()
            self.send_response(code); self.send_header('Content-Type', 'application/json'); self.send_header('Content-Length', str(len(body))); self.end_headers(); self.wfile.write(body)
        def do_GET(self):
            if self.path == HEALTH:
                self.json_response(200, state)
            else:
                super().do_GET()
        def do_POST(self):
            if self.path != SHUTDOWN or self.headers.get('X-Deep-Context-Instance') != instance:
                self.json_response(403, {'error': 'Not this dashboard instance'})
                return
            self.json_response(200, {'stopping': True})
            threading.Thread(target=self.server.shutdown, daemon=True).start()
    try:
        server = ThreadingHTTPServer(('127.0.0.1', port), functools.partial(Handler, directory=str(output)))
    except OSError as error:
        if error.errno == errno.EADDRINUSE:
            return 98
        raise
    build.write_json(build.ASSETS/STATE, state)
    try:
        server.serve_forever(poll_interval=0.1)
    finally:
        server.server_close()
        current = read_state()
        if current and current.get('instance') == instance:
            (build.ASSETS/STATE).unlink(missing_ok=True)
    return 0


def main():
    parser = argparse.ArgumentParser(description=__doc__)
    parser.add_argument('action', choices=['start', 'stop', 'status', '_run'])
    parser.add_argument('--output', type=Path)
    parser.add_argument('--project', action='append', help='The single project root this dashboard belongs to')
    parser.add_argument('--port', type=int, default=8765)
    parser.add_argument('--instance', help=argparse.SUPPRESS)
    args = parser.parse_args()
    try:
        if args.action == '_run':
            if not args.instance or not args.output:
                parser.error('Internal server start needs output and instance')
            return run_server(args.output, args.port, args.instance)
        if args.action == 'start':
            state = start(args.output, args.project, args.port)
            print('Dashboard ready: ' + state['url'])
        elif args.action == 'stop':
            print('Dashboard stopped.' if stop() else 'No managed dashboard is running.')
        else:
            state = read_state()
            print('Dashboard running: ' + state['url'] if probe(state) else 'No managed dashboard is running.')
    except (OSError, ValueError, RuntimeError) as error:
        parser.exit(1, f'Dashboard {args.action} failed: {error}\n')
    return 0


if __name__ == '__main__':
    raise SystemExit(main())
