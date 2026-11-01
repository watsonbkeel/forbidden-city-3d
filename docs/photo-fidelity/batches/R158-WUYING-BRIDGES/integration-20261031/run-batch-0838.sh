#!/usr/bin/env bash
set -u
cd /workspace/scratch/02a8023d1a85/r158-arrow-integrate
E=/workspace/scratch/02a8023d1a85/r158-wuying-integration-evidence-0756
verify(){ python - "$E" <<'PY'
import pathlib,json,sys,hashlib
E=pathlib.Path(sys.argv[1]);source=json.load(open(E/'source-live-0801.json'))['source'];qa=json.load(open(E/'qa-freeze-0838.json'))['files']
for p,h in {**source,**qa}.items():assert hashlib.sha256(pathlib.Path(p).read_bytes()).hexdigest()==h,p
print('SOURCE586_QA4231_EXACT')
PY
}
verify || exit 3
mapfile -t BATCH < "$E/batch-files-0838.txt"
python "$E/resource-runner.py" "$E/batch-0838.tap" "$E/batch-0838.resource.json" node --expose-gc --max-old-space-size=1024 --test --test-reporter=tap --test-concurrency=1 "${BATCH[@]}"; echo BATCH_EXIT=$?
verify || exit 3
