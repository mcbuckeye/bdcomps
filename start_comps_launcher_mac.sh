#!/usr/bin/env bash
set -euo pipefail

PORT="${COMPS_PORT:-4174}"
PYTHON_BIN="${PYTHON_BIN:-python3}"

if [ -f ".env" ]; then
  set -a
  . "./.env"
  set +a
fi

if ! command -v "$PYTHON_BIN" >/dev/null 2>&1; then
  echo "Python was not found. Install Python 3.10+ or set PYTHON_BIN to your Python executable." >&2
  exit 1
fi

if [ -z "${OPENAI_API_KEY:-}" ]; then
  echo "OPENAI_API_KEY is not set. Run: export OPENAI_API_KEY=\"your_key_here\"" >&2
  exit 1
fi

export COMPS_PORT="$PORT"
export OPENAI_TIMEOUT_SECONDS="${OPENAI_TIMEOUT_SECONDS:-600}"
export OPENAI_MAX_OUTPUT_TOKENS="${OPENAI_MAX_OUTPUT_TOKENS:-30000}"
export OPENAI_RETRIES="${OPENAI_RETRIES:-3}"
export OPENAI_DISABLE_PROXY="${OPENAI_DISABLE_PROXY:-1}"

if command -v lsof >/dev/null 2>&1; then
  EXISTING_PIDS="$(lsof -ti tcp:"$PORT" || true)"
  if [ -n "$EXISTING_PIDS" ]; then
    echo "Stopping existing listener(s) on port $PORT: $EXISTING_PIDS"
    kill $EXISTING_PIDS || true
    sleep 1
  fi
fi

echo "Starting Comps Launcher at http://127.0.0.1:$PORT/index.html"
echo "Press Ctrl+C to stop."
exec "$PYTHON_BIN" server.py
