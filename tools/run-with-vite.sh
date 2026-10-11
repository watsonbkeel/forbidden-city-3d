#!/bin/zsh
# 用法：PORT=518x tools/run-with-vite.sh <cmd...>
#   在当前 git 工作树（含 worktree）根目录起 vite，等就绪后跑命令，结束后只关闭本端口的 vite。
#   并行 Agent 各用独立端口（见 docs/agent-tasks/BOARD.md 端口表），避免互相杀进程。
ROOT=$(git rev-parse --show-toplevel) || exit 2
cd "$ROOT"
PORT=${PORT:-5180}
NODE=/Users/watson/.workbuddy/binaries/node/versions/22.22.2-6/bin/node
"$NODE" ./node_modules/vite/bin/vite.js --port $PORT --strictPort --host 127.0.0.1 > /tmp/vite-$PORT.log 2>&1 &
VPID=$!
for i in {1..80}; do
  curl -sf --noproxy '*' -o /dev/null http://127.0.0.1:$PORT/ && break
  sleep 0.5
done
export NODE_PATH=/Users/watson/.workbuddy/binaries/node/workspace/node_modules
export PALACE_URL=http://127.0.0.1:$PORT
perl -e 'alarm 2400; exec @ARGV' "$@"
RC=$?
kill $VPID 2>/dev/null
pkill -f "vite.js --port $PORT " 2>/dev/null
exit $RC
