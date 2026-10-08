#!/usr/bin/env python3
"""
Statisk filserver for Karlsen & Nordseth Entreprenør (lokal utvikling).

Serverer filene i denne mappen på http://localhost:4567 (overstyr med PORT).
Filnavnet er beholdt fordi Procfile og dev.sh peker hit.
"""
import http.server
import os
import socketserver
import sys

ROOT = os.path.dirname(os.path.abspath(__file__))
PORT = int(os.environ.get('PORT', '4567'))


class Handler(http.server.SimpleHTTPRequestHandler):
    def log_message(self, fmt, *args):
        sys.stderr.write(f'[{self.log_date_time_string()}] {fmt % args}\n')

    def end_headers(self):
        # Dev server: tell browsers never to cache, so edits to HTML/CSS/JS
        # always show up on the next request.
        self.send_header('Cache-Control', 'no-cache, no-store, must-revalidate')
        self.send_header('Pragma', 'no-cache')
        self.send_header('Expires', '0')
        super().end_headers()


class ReusableServer(socketserver.ThreadingMixIn, http.server.HTTPServer):
    allow_reuse_address = True
    daemon_threads = True


def main():
    os.chdir(ROOT)
    server = ReusableServer(('', PORT), Handler)
    print(f'Serverer http://localhost:{PORT}', flush=True)
    print(f'  rot:          {ROOT}', flush=True)
    try:
        server.serve_forever()
    except KeyboardInterrupt:
        print('\nAvslutter.')
        server.server_close()


if __name__ == '__main__':
    main()
