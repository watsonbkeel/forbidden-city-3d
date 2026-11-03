#!/bin/bash
set -u
root=/workspace/scratch/02a8023d1a85/r163-tiren-plaque-0333
cd "$root"
list=reports/r163-baohua/cumulative-b0/checks/execution.tsv
: > "$list"
run_one(){
 local kind="$1" file="$2" key out code
 key=$(printf '%s' "$file" | tr '/.' '__')
 out="reports/r163-baohua/cumulative-b0/checks/${key}.tap"
 node --max-old-space-size=2048 --test-isolation=none --test --test-concurrency=1 --test-reporter=tap "$file" > "$out" 2>&1
 code=$?
 printf '%s\t%s\t%s\t%s\n' "$kind" "$file" "$code" "$out" >> "$list"
 printf 'CHECK %s exit=%s ' "$file" "$code"
 grep -E '^# (tests|pass|fail|duration_ms)' "$out" | tr '\n' ' '; echo
 if [ "$code" -eq 134 ] || [ "$code" -eq 137 ] || grep -qE 'heap out of memory|signal:.*SIGKILL' "$out"; then echo "RESOURCE_STOP $file"; exit "$code"; fi
}
for f in \
 tests/r163-baohua.test.mjs \
 tests/r163-baohua/snapshot-hash.test.mjs \
 tests/r163-baohua/b0-baseline-guard.test.mjs \
 tests/r163-baohua/side-owner-probe.test.mjs \
 tests/r163-yuhua.test.mjs \
 tests/r163-jingyi.test.mjs \
 tests/r163-shufang-stage.test.mjs \
 tests/r163-jicui.test.mjs \
 tests/r163-jianfu-jiyun.test.mjs \
 tests/r163-jingsheng.test.mjs \
 tests/r163-yanchun-south-rail.test.mjs \
 tests/r66-h-yanchun-front.test.mjs \
 tests/r163-yinghua-stele/component.test.mjs \
 tests/r66-h-yinghua-gate.test.mjs \
 tests/r66-h-yinghua-windows.test.mjs; do run_one component "$f"; done
run_one local-controller tests/r163-baohua-local.test.mjs
run_one prior-repair scripts/r163-tiren-plaque/test.mjs
run_one prior-repair tests/r163-central-stones.test.mjs
run_one prior-repair tests/r163-taihe-front-porch/current.test.mjs
run_one prior-repair tests/r163-taihe-front-porch/retention.test.mjs
run_one prior-repair tests/r163/qianqing-sprint-handoff.test.mjs
run_one prior-repair tests/photo-fidelity/batches/b-principal-stair-contact.test.mjs
run_one prior-repair tests/chuxiu-freeze/npc-square-contact.test.mjs
run_one diagnostic tests/chuxiu-freeze/scheduler-diagnostic.test.mjs
