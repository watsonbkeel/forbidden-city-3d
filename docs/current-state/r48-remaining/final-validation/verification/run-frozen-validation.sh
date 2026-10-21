#!/usr/bin/env bash
# Run from a dedicated frozen clone. Explicit input inventories must be regenerated
# on the final freeze; preview inventories are not the release inventory.
set -u
ROOT="${1:?frozen repository required}"
OUT="${2:?empty output directory required}"
BASE="${3:?verified R47 inventory directory required}"
mkdir -p "$OUT"
if [[ -e "$OUT/head.txt" ]]; then echo 'Refusing to overwrite prior validation' >&2; exit 2; fi
cd "$ROOT" || exit 2
if [[ -n "$(git status --porcelain --untracked-files=no)" ]]; then echo 'Tracked source must be clean' >&2; exit 2; fi
snap(){ git ls-files -z | sort -z | xargs -0 sha256sum; }
snap > "$OUT/source-before.sha256"
git rev-parse HEAD > "$OUT/head.txt"
node --version > "$OUT/node-version.txt"
npm --version > "$OUT/npm-version.txt"
npm ls --depth=0 --json > "$OUT/dependency-inventory.json" 2> "$OUT/dependency-inventory.stderr"
echo $? > "$OUT/dependency-inventory.exit"
python - "$OUT" "$BASE" <<'PY'
import sys,json,pathlib
out,base=map(pathlib.Path,sys.argv[1:])
result={}
for group in ['direct-current','historical-or-mixed']:
 old=(base/(group+'.txt')).read_text().splitlines()
 new=sorted(map(str,pathlib.Path('tests').glob('r48-*.test.mjs'))) if group=='direct-current' else []
 names=list(dict.fromkeys(old+new))
 missing=[p for p in names if not pathlib.Path(p).is_file()]
 if missing:raise SystemExit('Missing explicit tests: '+repr(missing))
 (out/(group+'.txt')).write_text('\n'.join(names)+'\n')
 result[group]={'baselineFiles':len(old),'addedFiles':len([p for p in new if p not in old]),'files':len(names),'duplicatesRemoved':len(old+new)-len(names)}
(out/'test-file-inventory.json').write_text(json.dumps(result,indent=2)+'\n')
PY
if [[ $? != 0 ]]; then exit 2; fi
run(){ name="$1"; shift; date -u +%FT%TZ > "$OUT/$name.started"; "$@" > "$OUT/$name.log" 2>&1; echo $? > "$OUT/$name.exit"; date -u +%FT%TZ > "$OUT/$name.finished"; }
# Deliberately serialize processes. An unexplained earlier SIGKILL is retained,
# not assumed to be memory pressure and not retroactively counted as passed.
for group in direct-current historical-or-mixed; do
 mapfile -t files < "$OUT/$group.txt"
 date -u +%FT%TZ > "$OUT/$group.started"
 node --test --test-concurrency=1 --test-reporter=tap "${files[@]}" > "$OUT/$group.tap" 2>&1
 echo $? > "$OUT/$group.exit"
 date -u +%FT%TZ > "$OUT/$group.finished"
done
run build npm run build
run zone-schema node tests/zone-lint.cjs --no-geo
run zone-geometry node tests/zone-lint.cjs
run anchors node tests/anchor-check.cjs
snap > "$OUT/source-after.sha256"
cmp "$OUT/source-before.sha256" "$OUT/source-after.sha256"; echo $? > "$OUT/stable.exit"
date -u +%FT%TZ > "$OUT/terminal.txt"
