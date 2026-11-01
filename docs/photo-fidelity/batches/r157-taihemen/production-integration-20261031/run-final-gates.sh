#!/usr/bin/env bash
# Sequential processes, no World/test/build overlap. Never overwrite old evidence.
set -u
ROOT=/workspace/scratch/02a8023d1a85/r158-arrow-integrate
E=/workspace/scratch/02a8023d1a85/r157-taihemen-c-integration-evidence-0537
cd "$ROOT"
for p in full-final-main-0611.log full-final-zhaode-0611.log batch-final-0611.log build-final-gugong-0611.log build-final-pages-0611.log build-final-root-0611.log; do
 test ! -e "$E/$p" || { echo "REFUSE_OVERWRITE:$p"; exit 2; }
done
verify_source(){ python3 - "$E/source-final-0610.json" <<'PYTHON'
import sys,json,pathlib,hashlib,subprocess
p=json.load(open(sys.argv[1])); actual=set(subprocess.check_output(['git','ls-files','src','data'],text=True).splitlines()+subprocess.check_output(['git','ls-files','--others','--exclude-standard','src','data'],text=True).splitlines());assert actual==set(p)
for n,h in p.items():assert hashlib.sha256(pathlib.Path(n).read_bytes()).hexdigest()==h,n
print('SOURCE582_EXACT')
PYTHON
}
verify_source || exit 3
mapfile -t FILES < <(find tests/current-state -maxdepth 1 -name '*.test.mjs' ! -name zhaode-gate-routes.test.mjs | sort)
printf '%s\n' "${FILES[@]}" > "$E/full-final-main-files-0611.txt"
NODE_OPTIONS=--max-old-space-size=1536 node --test --test-concurrency=1 "${FILES[@]}" > "$E/full-final-main-0611.log" 2>&1
printf 'FULL_MAIN_EXIT=%s\n' "$?"
verify_source || exit 3
NODE_OPTIONS=--max-old-space-size=768 node --test tests/current-state/zhaode-gate-routes.test.mjs > "$E/full-final-zhaode-0611.log" 2>&1
printf 'FULL_ZHAODE_EXIT=%s\n' "$?"
verify_source || exit 3
mapfile -t BATCH < "$E/batch-0605-files.txt"
NODE_OPTIONS=--max-old-space-size=1536 node --expose-gc --test --test-concurrency=1 "${BATCH[@]}" > "$E/batch-final-0611.log" 2>&1
printf 'BATCH_EXIT=%s\n' "$?"
verify_source || exit 3
mkdir -p "$E/builds-final-0611"
for NAME in gugong pages root; do
 case "$NAME" in gugong) BASE=/gugong/;; pages) BASE=/forbidden-city-3d/;; root) BASE=/;; esac
 VITE_BASE="$BASE" npm run build -- --outDir "$E/builds-final-0611/$NAME" > "$E/build-final-$NAME-0611.log" 2>&1
 printf 'BUILD_%s_EXIT=%s\n' "$NAME" "$?"
done

verify_source || exit 3
