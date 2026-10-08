#!/bin/sh
# ─────────────────────────────────────────────────────────────────────────────
# Karlsen & Nordseth — local dev launcher
#
#   ./dev.sh
#
# Starts voice_server.py (static file server) on port 9999 and prints
# the URL. Set PORT env var to override (e.g. `PORT=4567 ./dev.sh`).
# ─────────────────────────────────────────────────────────────────────────────
set -e
cd "$(dirname "$0")"

PORT="${PORT:-9999}"

# Free the port if something is squatting on it (stale dev server, etc.)
existing=$(lsof -ti tcp:"$PORT" -sTCP:LISTEN 2>/dev/null || true)
if [ -n "$existing" ]; then
  echo "→ Port $PORT is taken by PID $existing — stopping it first."
  kill "$existing" 2>/dev/null || true
  sleep 1
fi

URL="http://localhost:$PORT"
echo
echo "  Karlsen & Nordseth — dev server"
echo "  ────────────────────────────────"
echo "  URL:        $URL"
echo "  Folder:     $(pwd)"
echo "  Press Ctrl+C to stop."
echo

PORT="$PORT" exec python3 voice_server.py
