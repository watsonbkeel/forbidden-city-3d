#!/usr/bin/env bash
# 用法：PORT=518x tools/run-with-vite.sh <cmd...>
# 当前工作树起 vite；只关闭自己创建的进程。NODE 可覆盖 PATH 上的 node。
set -u
ROOT=$(git rev-parse --show-toplevel) || exit 2
cd "$ROOT" || exit 2
PORT=${PORT:-5180}
NODE=${NODE:-node}
URL="http://127.0.0.1:$PORT"
if curl -sf --noproxy '*' -o /dev/null "$URL/"; then
  echo "Port $PORT is already serving HTTP; choose another PORT." >&2
  exit 2
fi
"$NODE" ./node_modules/vite/bin/vite.js --port "$PORT" --strictPort --host 127.0.0.1 > "/tmp/vite-$PORT.log" 2>&1 &
VPID=$!
cleanup() { kill "$VPID" 2>/dev/null || true; wait "$VPID" 2>/dev/null || true; }
trap cleanup EXIT
trap 'exit 130' INT
trap 'exit 143' TERM
READY=0
for ((i=0; i<80; i++)); do
  kill -0 "$VPID" 2>/dev/null || break
  if curl -sf --noproxy '*' -o /dev/null "$URL/"; then READY=1; break; fi
  sleep 0.5
done
if [[ "$READY" != 1 ]]; then
  echo "Vite did not become ready; see /tmp/vite-$PORT.log" >&2
  exit 2
fi
export PALACE_URL="$URL"
perl -e 'alarm 2400; exec @ARGV' "$@"
exit $?
