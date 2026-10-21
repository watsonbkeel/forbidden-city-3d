# R36 concentrated regression commands

Run only after the production owner declares the water/hall checkpoint stable.
Use one process per test file (`--test-concurrency=1`) to avoid the previously
observed heavy-scene concurrent file termination. A filename containing
`current-state` is not proof that it executes current unprojected modules.

## 1. Freeze and inventory the exact candidate

```sh
git rev-parse HEAD
git status --short
python docs/current-state/r36-south/classify-regression.py /tmp/r36-final-inventory
```

The inventory covers every `.test.mjs` and `.test.cjs` directly under `tests/`
and `tests/current-state/`. The two lists are disjoint and their union must equal
the all-tests list. Regenerate at the final checkpoint so later R36 additions
cannot be omitted. The JSON records exact test-file hashes and the historical
dependency reason for each file.

## 2. Raw-current functional suite

```sh
mapfile -t DIRECT < /tmp/r36-final-inventory/direct-current.txt
node --test --test-concurrency=1 --test-reporter=tap "${DIRECT[@]}" > /tmp/r36-direct-current.tap 2>&1
echo "direct-current exit=$?"
```

This group includes the direct R36 tests, current 159-place/map/flight behavior,
river-bed integration, controller routes, materials, ownership and streaming
tests without detected historical source-transport dependencies. An old raw
current assertion may still contain an obsolete shape/count expectation.
Diagnose it; do not relabel every failure a harmless historical identity error.

### Explicit baseline-input algorithm tests

Two legacy assertions in `tests/auto-routes.test.mjs` diagnose a generic
algorithm: the original Yude early-turn failure and a renamed, translated,
rotated courtyard detour. Dedicated R36 profiles deliberately reject arbitrary
identity/coordinate changes, and the old wrong-line coordinates no longer
describe the new Wuying gate. These two tests may use a new, clearly labelled
R35 four-building input fixture with the full baseline commit, source path,
selected identities and digest recorded. Their original assertions and
thresholds must remain intact, and all executable geometry, controller and
route algorithms must still be the actual current modules.

Report this input-only migration separately. It is current generic-algorithm
coverage on baseline input, **not current Wuying geometry acceptance**, and is
not a restored historical production module. The current generated Yude route,
all 61 current automatic routes and the independently built southern
ground-start routes must continue to use current scene data. No prior fixture
may be overwritten to manufacture compatibility.

## 3. Historical source/scene and mixed suites, unchanged

```sh
mapfile -t HISTORICAL < /tmp/r36-final-inventory/historical-or-mixed.txt
node --test --test-concurrency=1 --test-reporter=tap "${HISTORICAL[@]}" > /tmp/r36-historical-or-mixed.tap 2>&1
echo "historical-or-mixed exit=$?"
```

These are still executed, not deleted, suppressed or marked passing. The list
contains pure byte/epoch guards and files that mix historical comparisons with
raw-current functional assertions. Report results per assertion:

- PASS: the unchanged assertion actually ran and passed.
- HISTORICAL_IDENTITY_NOT_APPLICABLE: a prior candidate's exact identity or
  inventory rejects an intended R36 change. Record the assertion, changed path,
  old epoch, candidate identity and the corresponding R36 evidence. This is not
  a pass and does not waive other assertions in that file.
- FUNCTIONAL_REGRESSION: actual current behavior violates its contract. Repair
  or block release. A changed filename hash does not excuse a blocked route.
- BASELINE_FAILURE: independently reproduced on `0d7bbf23`, with the baseline
  result available. A historical note alone is not fresh reproduction.
- BLOCKED_OR_TERMINATED: no conclusive assertion result. Never count as a pass.

At R35, `docs/current-state/r35-sprint/ADDITIONAL-DIAGNOSTICS.md` already disclosed
six legacy inventory failures and two scene-file terminations in an exploratory
batch. Preserve that distinction instead of calling all later red results new
regressions or all of them known failures.

## 4. Build, schema, anchors and asset-generator checks

Run separately and preserve every exit status:

```sh
npm run build > /tmp/r36-build.log 2>&1
node tests/zone-lint.cjs --no-geo > /tmp/r36-zone-schema.log 2>&1
node tests/zone-lint.cjs > /tmp/r36-zone-geometry.log 2>&1
node tests/anchor-check.cjs > /tmp/r36-anchor-diagnostic.log 2>&1
python -m unittest discover -s tests -p 'test_*.py' > /tmp/r36-python.log 2>&1
```

The old anchor checker may compare a new actual component center with an old
group envelope centroid. Record those individual applicability differences;
do not change anchors to disguise unsupported measurements. The test suite's
route helper also needs explicit adapters for new profiles before its automatic
route diagnostics can be treated as authoritative.

The four R36 migrated hall anchors preserve `legacyAnchor` and an explicit
fitted/not-surveyed status. A zero discrepancy after that same-source migration
is internal model/map/navigation consistency, not an independent measurement
or 1:1 accuracy result. Inherited confidence labels do not become survey
confidence. Continue reporting every unmigrated anchor's original discrepancy.

## 5. Separate visual/native/GPU gate

`test:smoke`, `test:regression`, `test:walk`, `test:visual`, `test:perf`,
`stepwalk-auto.cjs` and the browser acceptance scripts require an actual working
browser renderer and the intended candidate. Their results are separate from
the Node unit tests above. With WebGL disabled or a candidate URL unreachable,
record the verified blocker and NOT_RUN; do not use public R35 screenshots,
CPU geometry, a fake WebGL context, or high-spawn legacy route replay as visual,
native-walking, device or FPS acceptance.

## Optional exact R36 source-retention layer

Such a layer can bind the complete new production inventory, preserve prior
fixtures and prove that out-of-scope files remain unchanged. It cannot replace
current-module hall/river/wall/collision tests, turn rejected old epochs into
new geometry acceptance, or weaken the immutable R35 fixtures.
