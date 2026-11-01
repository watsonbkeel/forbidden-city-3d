#!/usr/bin/env bash
# Complete partitioned suite, no overlapping processes; original tests untouched.
set -u
ROOT=/workspace/scratch/02a8023d1a85/r158-arrow-integrate
E=/workspace/scratch/02a8023d1a85/r158-wenhua-gate-integration-evidence-0643
cd "$ROOT"
for p in full-main-0717.tap qinan-0717 zhaode-0717 batch-main-0717.tap batch-wuying-0717.tap builds-0717; do test ! -e "$E/$p" || exit 2; done
verify(){ python3 - "$E" <<'PY'
import sys,json,pathlib,hashlib,subprocess
p=pathlib.Path(sys.argv[1]);src=json.load(open(p/'source-live-0702.json'));actual=set(subprocess.check_output(['git','ls-files','src','data'],text=True).splitlines());assert actual==set(src)
for n,h in src.items():assert hashlib.sha256(pathlib.Path(n).read_bytes()).hexdigest()==h,n
qa=json.load(open(p/'qa-freeze-0717.json'))
for n,h in qa['files'].items():assert hashlib.sha256(pathlib.Path(n).read_bytes()).hexdigest()==h,n
print('SOURCE584_AND_MATERIALIZED_QA_EXACT')
PY
}
verify || exit 3
mapfile -t MAIN < <(find tests/current-state -maxdepth 1 -name '*.test.mjs' ! -name qinan-exterior-stair-safety.test.mjs ! -name zhaode-gate-routes.test.mjs | sort)
printf '%s\n' "${MAIN[@]}" > "$E/full-main-files-0717.txt"
node --max-old-space-size=1536 --test --test-reporter=tap --test-concurrency=1 "${MAIN[@]}" > "$E/full-main-0717.tap" 2>&1; echo FULL_MAIN_EXIT=$?
verify || exit 3
for name in qinan zhaode; do case "$name" in qinan) f=qinan-exterior-stair-safety;;zhaode) f=zhaode-gate-routes;;esac
 python3 "$E/run-observed-process.py" "$E/$name-0717" node --max-old-space-size=768 --test --test-reporter=tap "tests/current-state/$f.test.mjs"; echo "FULL_${name}_EXIT=$?"; verify || exit 3
done
mapfile -t BATCH < <(grep -v '^tests/photo-fidelity/batches/wuying-three-bridge-rails.test.mjs$' "$E/batch-files-0717.txt")
node --expose-gc --max-old-space-size=1536 --test --test-reporter=tap --test-concurrency=1 "${BATCH[@]}" > "$E/batch-main-0717.tap" 2>&1; echo BATCH_MAIN_EXIT=$?
verify || exit 3
R157_COMPACT_STRICT_DIAGNOSTICS=1 node --expose-gc --max-old-space-size=768 --import ./tests/lib/r157-compact-strict-diagnostics.mjs --test --test-reporter=tap tests/photo-fidelity/batches/wuying-three-bridge-rails.test.mjs > "$E/batch-wuying-0717.tap" 2>&1; echo BATCH_OLD_WUYING_EXIT=$?
verify || exit 3
mkdir "$E/builds-0717"
for name in gugong pages root; do case "$name" in gugong) base=/gugong/;;pages)base=/forbidden-city-3d/;;root)base=/;;esac
 VITE_BASE="$base" npm run build -- --outDir "$E/builds-0717/$name" > "$E/build-$name-0717.log" 2>&1; echo "BUILD_${name}_EXIT=$?"; verify || exit 3
done
