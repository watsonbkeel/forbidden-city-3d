#!/usr/bin/env bash
# Read-only on repository. All execution/source snapshots/results are private.
set -euo pipefail
HERE=$(cd -- "$(dirname -- "$0")" && pwd)
REPO=$(cd -- "${1:?repository root required}" && pwd)
OUT=${2:?new private output directory required}
BASE=36908b2c07c7050e1de0dffd504e68a67c83f205
[[ ! -e "$OUT" ]] || { echo 'Output must not already exist; evidence is never overwritten' >&2; exit 2; }
[[ $(git -C "$REPO" rev-parse --show-prefix) == '' ]]
[[ $(git -C "$REPO" rev-parse "$BASE") == "$BASE" ]]
DEPS=$(readlink -f "$REPO/node_modules")
[[ -d "$DEPS/three" ]]
mkdir -p "$OUT/baseline" "$OUT/current/tests"
OUT=$(cd "$OUT" && pwd)
git -C "$REPO" archive "$BASE" src data package.json tests/lib | tar -x -C "$OUT/baseline"
# No loader fallback to live files: complete src + data in both isolated roots.
python3 - "$REPO" "$OUT" <<'PY'
import sys,pathlib,hashlib,json,shutil
repo,out=map(pathlib.Path,sys.argv[1:])
def manifest(root):return {str(f.relative_to(root)):{'sha256':hashlib.sha256(f.read_bytes()).hexdigest(),'bytes':f.stat().st_size} for sub in ['src','data'] for f in sorted((root/sub).rglob('*')) if f.is_file()}
before=manifest(repo)
for d in ['src','data']:shutil.copytree(repo/d,out/'current'/d)
shutil.copytree(repo/'tests/lib',out/'current/tests/lib');shutil.copyfile(repo/'package.json',out/'current/package.json')
a=manifest(out/'baseline');b=manifest(out/'current');after=manifest(repo)
assert before==b==after,'Source changed during capture; snapshot is not accepted'
changed=[k for k in sorted(set(a)|set(b)) if a.get(k)!=b.get(k)]
allowed={'src/scene/PalaceBuilder.js','src/scene/palace/special/GateTowerProfiles.js','src/scene/palace/special/GateTowerShell.js','src/scene/palace/special/WumenLowerBase.js','src/scene/palace/special/WumenMainGrid.js','src/scene/palace/special/WumenNorthwestColumns.js','src/scene/palace/special/WumenOuterSideColumns.js','src/scene/palace/special/WumenTransverseLinks.js','src/scene/palace/special/WumenWingPavilionInstances.js','src/ui/SettingsMenu.js'}
assert set(changed)==allowed,('Unexpected changed-source boundary',changed)
(out/'SOURCE-PROVENANCE.json').write_text(json.dumps({'baselineCommit':'36908b2c07c7050e1de0dffd504e68a67c83f205','baselineFiles':len(a),'candidateFiles':len(b),'liveExactlyEqualsSnapshot':True,'changedFiles':changed,'baseline':a,'candidate':b},indent=2)+'\n')
(out/'current-final-source.sha256').write_text(''.join(v['sha256']+'  '+k+'\n' for k,v in b.items()))
PY
ln -s "$DEPS" "$OUT/baseline/node_modules"
ln -s "$DEPS" "$OUT/current/node_modules"
for VERSION in baseline current; do
  node --import "$HERE/capture-hook.mjs" "$HERE/capture-global.mjs" "$OUT/$VERSION" "$OUT/$VERSION-capture.json" >"$OUT/$VERSION-capture.log" 2>&1
  node --import "$HERE/wumen-boundary-hook.mjs" "$HERE/capture-wumen-physics.mjs" "$OUT/$VERSION" "$OUT/$VERSION-wumen-physics.json" >"$OUT/$VERSION-wumen-physics.log" 2>&1
done
R157_WUMEN_ONLY=1 R157_NEGATIVE=hide-retained-roof node --import "$HERE/capture-hook.mjs" "$HERE/capture-global.mjs" "$OUT/current" "$OUT/negative-hidden-roof.json" >"$OUT/negative-hidden-roof.log" 2>&1
node "$HERE/compare-global.mjs" "$OUT" >"$OUT/comparison.log" 2>&1
printf 'PASS: %s/RESULT.json\n' "$OUT"
