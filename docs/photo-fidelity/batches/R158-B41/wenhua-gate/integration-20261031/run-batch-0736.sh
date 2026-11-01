#!/usr/bin/env bash
set -u
cd /workspace/scratch/02a8023d1a85/r158-arrow-integrate
E=/workspace/scratch/02a8023d1a85/r158-wenhua-gate-integration-evidence-0643
for n in batch-main-0736.tap batch-wuying-0736.tap; do test ! -e "$E/$n" || exit 2; done
verify(){ python3 - "$E" <<'PY'
import sys,json,pathlib,hashlib
p=pathlib.Path(sys.argv[1]);files=json.load(open(p/'source-live-0702.json'));files.update(json.load(open(p/'qa-freeze-0736.json'))['files'])
for n,h in files.items():assert hashlib.sha256(pathlib.Path(n).read_bytes()).hexdigest()==h,n
print('SOURCE584_QA4146_EXACT')
PY
}
verify || exit 3
mapfile -t BATCH < <(grep -v '^tests/photo-fidelity/batches/wuying-three-bridge-rails.test.mjs$' "$E/batch-files-0717.txt")
node --expose-gc --max-old-space-size=1536 --test --test-reporter=tap --test-concurrency=1 "${BATCH[@]}" > "$E/batch-main-0736.tap" 2>&1; echo BATCH_MAIN_EXIT=$?
verify || exit 3
R157_COMPACT_STRICT_DIAGNOSTICS=1 node --expose-gc --max-old-space-size=768 --import ./tests/lib/r157-compact-strict-diagnostics.mjs --test --test-reporter=tap tests/photo-fidelity/batches/wuying-three-bridge-rails.test.mjs > "$E/batch-wuying-0736.tap" 2>&1; echo BATCH_OLD_WUYING_EXIT=$?
verify || exit 3
