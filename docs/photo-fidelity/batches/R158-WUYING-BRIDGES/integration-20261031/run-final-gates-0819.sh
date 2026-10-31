#!/usr/bin/env bash
set -u
cd /workspace/scratch/02a8023d1a85/r158-arrow-integrate
E=/workspace/scratch/02a8023d1a85/r158-wuying-integration-evidence-0756
verify(){ python3 - "$E" <<'PY'
import json,pathlib,hashlib,sys,subprocess
E=pathlib.Path(sys.argv[1]);src=json.load(open(E/'source-live-0801.json'))['source'];actual=set(subprocess.check_output(['git','ls-files','-z','src','data']).decode().split('\0'))-{''};assert actual==set(src)
files={**src,**json.load(open(E/'qa-freeze-0819.json'))['files']}
for p,h in files.items():assert hashlib.sha256(pathlib.Path(p).read_bytes()).hexdigest()==h,p
print('FROZEN_SOURCE586_QA_EXACT',len(files)-len(src))
PY
}
verify || exit 3
mapfile -t MAIN < "$E/full-main-files-0819.txt"
python "$E/resource-runner.py" "$E/full-main-0819.tap" "$E/full-main-0819.resource.json" node --max-old-space-size=1536 --test --test-reporter=tap --test-concurrency=1 "${MAIN[@]}"; echo FULL_MAIN_EXIT=$?
verify || exit 3
for name in qinan zhaode; do case "$name" in qinan) f=qinan-exterior-stair-safety;;zhaode)f=zhaode-gate-routes;;esac
 python "$E/resource-runner.py" "$E/$name-0819.tap" "$E/$name-0819.resource.json" node --max-old-space-size=768 --test --test-reporter=tap "tests/current-state/$f.test.mjs"; echo "FULL_${name}_EXIT=$?"; verify || exit 3
done
mapfile -t BATCH < "$E/batch-files-0819.txt"
python "$E/resource-runner.py" "$E/batch-0819.tap" "$E/batch-0819.resource.json" node --expose-gc --max-old-space-size=1024 --test --test-reporter=tap --test-concurrency=1 "${BATCH[@]}"; echo BATCH_EXIT=$?
verify || exit 3
mkdir "$E/builds-0819" || exit 2
for name in gugong pages root; do case "$name" in gugong)base=/gugong/;;pages)base=/forbidden-city-3d/;;root)base=/;;esac
 VITE_BASE="$base" python "$E/resource-runner.py" "$E/build-$name-0819.log" "$E/build-$name-0819.resource.json" npm run build -- --outDir "$E/builds-0819/$name"; echo "BUILD_${name}_EXIT=$?"; verify || exit 3
done
