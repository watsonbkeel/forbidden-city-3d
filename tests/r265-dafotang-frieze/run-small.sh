#!/usr/bin/env bash
set -euo pipefail
base=$(cd "$(dirname "$0")" && pwd)
repo=$(cd "$base/../.." && pwd)
[ "$#" = 1 ] || { echo 'Specify one new absolute evidence directory' >&2; exit 2; }
case "$1" in /*) ;; *) echo 'Evidence path must be absolute' >&2; exit 2;; esac
out=$(realpath -m -- "$1")
case "$out" in "$repo"|"$repo"/*) echo 'Evidence must stay outside checkout' >&2; exit 2;; esac
mkdir -- "$out"
unset NODE_OPTIONS NODE_PATH PYTHONOPTIMIZE PYTHONPATH
for key in ${!R265_@}; do unset "$key"; done
cd "$repo"
run() {
 local name=$1; shift
 set +e
 { time timeout 30s "$@" > "$out/$name.log" 2>&1; } 2> "$out/$name.resource.txt"
 local status=$?
 set -e
 printf '%s\n' "$status" > "$out/$name.exit"
 tail -12 "$out/$name.log"
 if [ "$status" != 0 ]; then echo "Stopped at $name; evidence: $out" >&2; exit "$status"; fi
}
run PREFLIGHT python3 -I "$base/preflight.py"
node_run() {
 local name=$1; shift
 export R265_REPORT="$out/$name.json" R265_REVISION_REPORT="$out/$name.json"
 run "$name" node --max-old-space-size=128 --max-semi-space-size=8 --test --test-concurrency=1 "$@"
}
node_run COMPATIBILITY "$base/compatibility.test.mjs"
node_run COMPONENT "$base/component.test.mjs"
node_run REVISION "$base/revision.test.mjs"
node_run EAST "$repo/tests/current-state/dafotang-east-cabinets.test.mjs"
node_run WEST "$repo/tests/current-state/dafotang-west-cabinet-height.test.mjs"
for subject in shakyamuni amitabha bhaisajyaguru; do
 export R265_SUBJECT="$subject"
 node_run "FIGURE-$subject" "$base/figure-clearance.test.mjs"
done
unset R265_SUBJECT R265_REPORT R265_REVISION_REPORT
run FIGURE-REPLAY python3 -I "$base/check-figure-replay.py" "$out"
run COLUMN-SECTION node --max-old-space-size=128 --max-semi-space-size=8 "$base/column-section.mjs"
printf 'Portable component checks passed; not host/GPU/release acceptance. Evidence: %s\n' "$out"
