/**
 * Cloudflare Worker — KNE API proxy
 *
 * Handles three endpoints called by voice-agent.js:
 *   POST /api/voice-token  → mints a short-lived xAI realtime token
 *   POST /api/chat         → proxies text chat completions
 *   POST /api/brain        → proxies reasoning completions
 *
 * Secrets set in Cloudflare dashboard (never in code):
 *   XAI_API_KEY   — for voice tokens
 *   XAI_BRAIN_KEY — for chat/brain (falls back to XAI_API_KEY if not set)
 */

const XAI_REALTIME  = 'https://api.x.ai/v1/realtime/client_secrets';
const XAI_CHAT      = 'https://api.x.ai/v1/chat/completions';
const CHAT_MODEL    = 'grok-3-mini';
const BRAIN_MODEL   = 'grok-3-mini';
const TOKEN_TTL     = 300;

function cors(origin) {
  return {
    'Access-Control-Allow-Origin':  origin || '*',
    'Access-Control-Allow-Methods': 'POST, OPTIONS',
    'Access-Control-Allow-Headers': 'Content-Type',
  };
}

function json(data, status = 200, origin) {
  return new Response(JSON.stringify(data), {
    status,
    headers: { 'Content-Type': 'application/json', ...cors(origin) },
  });
}

export default {
  async fetch(request, env) {
    const url    = new URL(request.url);
    const origin = request.headers.get('Origin') || '*';

    if (request.method === 'OPTIONS') {
      return new Response(null, { status: 204, headers: cors(origin) });
    }
    if (request.method !== 'POST') {
      return new Response('Method not allowed', { status: 405 });
    }

    // ── /api/voice-token ─────────────────────────────────────────────────
    if (url.pathname === '/api/voice-token') {
      const key = env.XAI_API_KEY;
      if (!key) return json({ error: 'XAI_API_KEY not configured' }, 500, origin);

      const res = await fetch(XAI_REALTIME, {
        method:  'POST',
        headers: { Authorization: `Bearer ${key}`, 'Content-Type': 'application/json' },
        body:    JSON.stringify({ expires_after: { seconds: TOKEN_TTL } }),
      });

      if (!res.ok) {
        const err = await res.text();
        return json({ error: `xAI ${res.status}`, detail: err.slice(0, 400) }, 502, origin);
      }

      const data  = await res.json();
      let   token = data.value;
      if (!token && data.client_secret) {
        token = typeof data.client_secret === 'string'
          ? data.client_secret
          : data.client_secret?.value;
      }
      if (!token) return json({ error: 'No token in xAI response' }, 502, origin);

      return json({ token, expires_at: data.expires_at }, 200, origin);
    }

    // ── /api/chat ────────────────────────────────────────────────────────
    if (url.pathname === '/api/chat') {
      const key = env.XAI_BRAIN_KEY || env.XAI_API_KEY;
      if (!key) return json({ error: 'XAI_API_KEY not configured' }, 500, origin);

      let body;
      try { body = await request.json(); }
      catch { return json({ error: 'Invalid JSON' }, 400, origin); }

      const { messages } = body;
      if (!Array.isArray(messages) || !messages.length) {
        return json({ error: 'messages (array) required' }, 400, origin);
      }

      const res = await fetch(XAI_CHAT, {
        method:  'POST',
        headers: { Authorization: `Bearer ${key}`, 'Content-Type': 'application/json' },
        body:    JSON.stringify({ model: CHAT_MODEL, messages, max_tokens: 600, temperature: 0.7 }),
      });

      if (!res.ok) {
        const err = await res.text();
        return json({ error: `xAI ${res.status}`, detail: err.slice(0, 400) }, 502, origin);
      }

      const data   = await res.json();
      const answer = data.choices?.[0]?.message?.content || '';
      return json({ answer: answer.trim(), model: CHAT_MODEL }, 200, origin);
    }

    // ── /api/brain ───────────────────────────────────────────────────────
    if (url.pathname === '/api/brain') {
      const key = env.XAI_BRAIN_KEY || env.XAI_API_KEY;
      if (!key) return json({ error: 'XAI_BRAIN_KEY not configured' }, 500, origin);

      let body;
      try { body = await request.json(); }
      catch { return json({ error: 'Invalid JSON' }, 400, origin); }

      const question = (body.question || '').trim();
      if (!question) return json({ error: 'question required' }, 400, origin);

      const system   = (body.system || '').trim();
      const effort   = ['low', 'high'].includes(body.reasoning_effort) ? body.reasoning_effort : 'low';
      const messages = [];
      if (system) messages.push({ role: 'system', content: system });
      messages.push({ role: 'user', content: question });

      const res = await fetch(XAI_CHAT, {
        method:  'POST',
        headers: { Authorization: `Bearer ${key}`, 'Content-Type': 'application/json' },
        body:    JSON.stringify({ model: BRAIN_MODEL, messages, reasoning_effort: effort, max_tokens: 400 }),
      });

      if (!res.ok) {
        const err = await res.text();
        return json({ error: `xAI ${res.status}`, detail: err.slice(0, 400) }, 502, origin);
      }

      const data   = await res.json();
      const answer = data.choices?.[0]?.message?.content || '';
      return json({ answer: answer.trim(), model: BRAIN_MODEL, usage: data.usage || {} }, 200, origin);
    }

    return new Response('Not found', { status: 404 });
  },
};
