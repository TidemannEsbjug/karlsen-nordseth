#!/usr/bin/env python3
"""
Statisk filserver + xAI voice-token mint-proxy for Karlsen & Nordseth Entreprenør.

Serverer filene i denne mappen på http://localhost:4567 og eksponerer:

    POST /api/voice-token   → returnerer { token: <ephemeral-client-secret> }
    POST /api/brain         → grok-3-mini chat-completion for "tenk"-verktøyet

API-nøkkelen ligger kun på serveren (.env) og når aldri nettleseren.
Browseren får kun korte ephemeral-tokens.
"""
import http.server
import json
import os
import ssl
import sys
import urllib.request
import urllib.error
import socketserver

ROOT = os.path.dirname(os.path.abspath(__file__))
PORT = int(os.environ.get('PORT', '4567'))
XAI_ENDPOINT = 'https://api.x.ai/v1/realtime/client_secrets'
XAI_CHAT_ENDPOINT = 'https://api.x.ai/v1/chat/completions'
TOKEN_TTL_SECONDS = 300
BRAIN_MODEL = 'grok-3-mini'
CHAT_MODEL  = 'grok-3-mini'


def load_env(path):
    """Minimal .env-leser — KEY=VALUE per linje, '#' kommentarer."""
    if not os.path.exists(path):
        return
    with open(path, 'r') as f:
        for line in f:
            line = line.strip()
            if not line or line.startswith('#'):
                continue
            if '=' not in line:
                continue
            k, v = line.split('=', 1)
            k = k.strip()
            v = v.strip().strip('"').strip("'")
            if k and k not in os.environ:
                os.environ[k] = v


def build_ssl_context():
    """macOS python.org-builds har ofte tomt CA-bundle. Fall tilbake gjennom
    certifi → system-CA → Homebrew."""
    candidates = []
    try:
        import certifi
        candidates.append(certifi.where())
    except ImportError:
        pass
    candidates += [
        '/etc/ssl/cert.pem',
        '/usr/local/etc/openssl@3/cert.pem',
        '/opt/homebrew/etc/openssl@3/cert.pem',
        '/usr/local/etc/openssl/cert.pem',
    ]
    for p in candidates:
        if p and os.path.exists(p):
            try:
                return ssl.create_default_context(cafile=p)
            except Exception:
                continue
    return ssl.create_default_context()


SSL_CTX = build_ssl_context()


def mint_ephemeral_token(api_key):
    """Be xAI om et kortvarig ephemeral client-secret som nettleseren kan bruke.
    POST https://api.x.ai/v1/realtime/client_secrets → {"value": "...", "expires_at": ...}"""
    payload = {'expires_after': {'seconds': TOKEN_TTL_SECONDS}}
    req = urllib.request.Request(
        XAI_ENDPOINT,
        data=json.dumps(payload).encode('utf-8'),
        headers={
            'Authorization': f'Bearer {api_key}',
            'Content-Type': 'application/json',
        },
        method='POST',
    )
    with urllib.request.urlopen(req, timeout=10, context=SSL_CTX) as resp:
        body = resp.read().decode('utf-8')
    data = json.loads(body)
    token = data.get('value')
    if not token:
        cs = data.get('client_secret')
        if isinstance(cs, dict):
            token = cs.get('value')
        elif isinstance(cs, str):
            token = cs
    if not token:
        raise RuntimeError(f'Ingen token i respons: {body[:200]}')
    return token, data.get('expires_at')


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

    def do_POST(self):
        if self.path == '/api/voice-token':
            return self._handle_token()
        if self.path == '/api/brain':
            return self._handle_brain()
        if self.path == '/api/chat':
            return self._handle_chat()
        self.send_error(404)

    def _handle_chat(self):
        """Frittstående tekst-chat. Klienten sender hele meldings-historikken
        (inkl. system-prompt) som `messages: [...]`. Serveren legger til ingenting
        — den proxy-er bare videre til xAI chat-completions."""
        key = os.environ.get('XAI_BRAIN_KEY') or os.environ.get('XAI_API_KEY')
        if not key:
            self._json(500, {'error': 'XAI_API_KEY ikke satt på serveren'})
            return
        try:
            length = int(self.headers.get('Content-Length') or 0)
            body = self.rfile.read(length) if length > 0 else b'{}'
            req = json.loads(body.decode('utf-8'))
        except Exception as e:
            self._json(400, {'error': f'ugyldig json: {e}'})
            return

        messages = req.get('messages')
        if not isinstance(messages, list) or not messages:
            self._json(400, {'error': 'messages (array) kreves'})
            return

        payload = {
            'model': CHAT_MODEL,
            'messages': messages,
            'max_tokens': 600,
            'temperature': 0.7,
        }

        try:
            chat_req = urllib.request.Request(
                XAI_CHAT_ENDPOINT,
                data=json.dumps(payload).encode('utf-8'),
                headers={
                    'Authorization': f'Bearer {key}',
                    'Content-Type': 'application/json',
                },
                method='POST',
            )
            with urllib.request.urlopen(chat_req, timeout=30, context=SSL_CTX) as resp:
                raw = resp.read().decode('utf-8')
            data = json.loads(raw)
            answer = (
                data.get('choices', [{}])[0]
                    .get('message', {})
                    .get('content', '')
            ) or ''
            self._json(200, {'answer': answer.strip(), 'model': CHAT_MODEL})
        except urllib.error.HTTPError as e:
            body = e.read().decode('utf-8', errors='ignore')
            sys.stderr.write(f'[chat] xAI HTTP {e.code}: {body}\n')
            self._json(502, {'error': f'xAI {e.code}', 'detail': body[:400]})
        except Exception as e:
            sys.stderr.write(f'[chat] error: {e}\n')
            self._json(500, {'error': str(e)})

    def _handle_brain(self):
        key = os.environ.get('XAI_BRAIN_KEY') or os.environ.get('XAI_API_KEY')
        if not key:
            self._json(500, {'error': 'XAI_BRAIN_KEY ikke satt på serveren'})
            return
        try:
            length = int(self.headers.get('Content-Length') or 0)
            body = self.rfile.read(length) if length > 0 else b'{}'
            req = json.loads(body.decode('utf-8'))
        except Exception as e:
            self._json(400, {'error': f'ugyldig json: {e}'})
            return

        question = (req.get('question') or '').strip()
        if not question:
            self._json(400, {'error': 'spørsmål kreves'})
            return
        system = (req.get('system') or '').strip()
        effort = req.get('reasoning_effort') or 'low'
        if effort not in ('low', 'high'):
            effort = 'low'

        messages = []
        if system:
            messages.append({'role': 'system', 'content': system})
        messages.append({'role': 'user', 'content': question})

        payload = {
            'model': BRAIN_MODEL,
            'messages': messages,
            'reasoning_effort': effort,
            'max_tokens': 400,
        }

        try:
            chat_req = urllib.request.Request(
                XAI_CHAT_ENDPOINT,
                data=json.dumps(payload).encode('utf-8'),
                headers={
                    'Authorization': f'Bearer {key}',
                    'Content-Type': 'application/json',
                },
                method='POST',
            )
            with urllib.request.urlopen(chat_req, timeout=20, context=SSL_CTX) as resp:
                raw = resp.read().decode('utf-8')
            data = json.loads(raw)
            answer = (
                data.get('choices', [{}])[0]
                    .get('message', {})
                    .get('content', '')
            ) or ''
            usage = data.get('usage') or {}
            self._json(200, {'answer': answer.strip(), 'model': BRAIN_MODEL, 'usage': usage})
        except urllib.error.HTTPError as e:
            body = e.read().decode('utf-8', errors='ignore')
            sys.stderr.write(f'[brain] xAI HTTP {e.code}: {body}\n')
            self._json(502, {'error': f'xAI {e.code}', 'detail': body[:400]})
        except Exception as e:
            sys.stderr.write(f'[brain] error: {e}\n')
            self._json(500, {'error': str(e)})

    def _handle_token(self):
        api_key = os.environ.get('XAI_API_KEY')
        if not api_key:
            self._json(500, {'error': 'XAI_API_KEY ikke satt på serveren'})
            return
        try:
            token, expires_at = mint_ephemeral_token(api_key)
            self._json(200, {'token': token, 'expires_at': expires_at})
        except urllib.error.HTTPError as e:
            body = e.read().decode('utf-8', errors='ignore')
            sys.stderr.write(f'[token] xAI HTTP {e.code}: {body}\n')
            self._json(502, {'error': f'xAI {e.code}', 'detail': body[:300]})
        except Exception as e:
            sys.stderr.write(f'[token] error: {e}\n')
            self._json(500, {'error': str(e)})

    def _json(self, status, obj):
        body = json.dumps(obj).encode('utf-8')
        self.send_response(status)
        self.send_header('Content-Type', 'application/json')
        self.send_header('Content-Length', str(len(body)))
        self.send_header('Cache-Control', 'no-store')
        self.end_headers()
        self.wfile.write(body)


class ReusableServer(socketserver.ThreadingMixIn, http.server.HTTPServer):
    allow_reuse_address = True
    daemon_threads = True


def main():
    load_env(os.path.join(ROOT, '.env'))
    os.chdir(ROOT)

    if not os.environ.get('XAI_API_KEY'):
        sys.stderr.write('\n  ADVARSEL: XAI_API_KEY er ikke satt. Voice-\n'
                         '  agenten vil feile på /api/voice-token.\n'
                         '  Legg den i .env ved siden av dette skriptet.\n\n')

    if not os.environ.get('XAI_BRAIN_KEY'):
        sys.stderr.write('  MERK: XAI_BRAIN_KEY ikke satt — /api/brain vil\n'
                         '  bruke voice-nøkkelen som fallback. Anbefalt: sett\n'
                         '  XAI_BRAIN_KEY i .env for separat fakturering.\n')

    server = ReusableServer(('', PORT), Handler)
    print(f'Serverer http://localhost:{PORT}', flush=True)
    print(f'  rot:          {ROOT}', flush=True)
    print(f'  token-rute:   POST /api/voice-token', flush=True)
    print(f'  brain-rute:   POST /api/brain (modell {BRAIN_MODEL})', flush=True)
    try:
        server.serve_forever()
    except KeyboardInterrupt:
        print('\nAvslutter.')
        server.server_close()


if __name__ == '__main__':
    main()
