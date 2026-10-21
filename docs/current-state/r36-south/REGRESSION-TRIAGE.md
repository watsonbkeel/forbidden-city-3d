# R36 regression failure triage

## Scope and evidence binding

This is a per-failure CPU test audit, not an all-green result, a waiver, or browser/native/GPU acceptance. No production file, test, old fixture, or source-restoration helper was changed by this triage.

- R35 comparison: clean archive of `0d7bbf23c1d79b36170a36b27a988488554f1b9f`, prepared and commit-verified by the run owner at `/tmp/r36-r35-baseline`.
- Initial southern candidate: HEAD `be5b668b2cddf6ba20fa6027da593d09683f6823`; logs under `/tmp/r36-final`.
- Final candidate: HEAD `88d5db6b81bcc4d6e304b72d1997a6607a04e452`, including the helicopter hotfix and frozen working-tree lint/tests; logs under `/tmp/r36-release`.
- HEAD alone does not describe uncommitted candidate files. Each candidate is additionally bound by its `source-before.sha256` and `source-after.sha256` manifests. Both comparisons are byte-identical. The final inventory is 148 direct files plus 132 historical-or-mixed files, 280 total. The run script's final exit zero came from its manifest comparison; it does not override either test group's recorded exit one.
- [Machine-readable classification](REGRESSION-FAILURE-CLASSIFICATION.json) is a published summary, not the original TAP/stack/diff evidence bundle. It preserves both phases, full commits, original TAP SHA-256 identities and terminal counts, all 217 final historical and ten direct `(relative file, test name)` keys, diagnostic hashes, short reasons, baseline matches and all 22 masked baseline failures. Full local classification and raw logs remain separately preserved; repeated raw evidence is not repackaged here.

## Terminal results, not combined or duplicated

| Run | Reported tests | Passed | Failed | Exit |
|---|---:|---:|---:|---:|
| R35, six files reproducing direct failures | 83 | 75 | 8 | 1 |
| R35, all 132 historical-or-mixed files | 1857 | 1762 | 95 | 1 |
| Initial be5b668 direct | 1744 | 1734 | 10 | 1 |
| Initial be5b668 historical-or-mixed | 1235 | 1035 | 200 | 1 |
| Final 88d5db6 direct | 1769 | 1759 | 10 | 1 |
| Final 88d5db6 historical-or-mixed | 1192 | 975 | 217 | 1 |

The final direct run contains 25 additional passing tests, the 16 helicopter-hotfix tests and nine lint-helper tests already counted in 1769. Do not add these again. The R35 direct row is a targeted six-file reproduction, not a full R35 direct-suite run.

The historical groups have different reported totals because current imports abort before many assertions are registered. Fewer failures or absent names in an aborted file do not demonstrate repairs.

## Direct-current: all ten final failures individually accounted for

The ten final `(file, name)` keys and normalized diagnostics are identical to the initial run. Eight assertions reproduce on R35; seven have identical diagnostics, while the global navigation-hash assertion fails against the same obsolete fixture with a different current input hash. The other two failures are changed-scope expectations.

| File / assertion | Observed failure and classification |
|---|---|
| `r32-fidelity-help.test.mjs:33` | The generic `/5间/` short-note expectation rejects 储秀宫's dedicated `住宅隔断拓扑 · 尺度拟合`. Same R35 failure. `ModelFidelity.js:13` intentionally overrides the generic note; that file is unchanged by R36. |
| `r32-palace-collision.test.mjs:106` | 储秀宫 old front `lattice_doors` panel count expects four and finds zero. Same R35 failure. The dedicated recessed enclosure deliberately removes those generic panels. |
| `r32-palace-collision.test.mjs:150`, left lane | Old straight lane at X 93.4 cannot reach Z 429.9; ends at Z 428.7079506528835. Exact same R35 stop. |
| Same assertion, right lane | Old straight lane at X 96.2 has the identical Z stop. Exact same R35 stop. |
| `r32-palace-collision.test.mjs:175` | Old window probe starts blocked at `(83.96, 428.8)`. Exact same R35 result. `ChuxiuHall.js:8–10,23,42–56,70–85` defines a 1.9 m recessed enclosure and 3.2 m doorway, replacing the generic frontage; these inputs are unchanged by R36. These old probe failures are not evidence that the dedicated central route is newly broken. |
| `r32-qianqing-distance.test.mjs:18` | Near visible geometry/world-transform comparisons complete first. Failure is the hash of **all** `PalaceBuilder` colliders/walkables: old fixture `b9eead…`, R35 `238730…`, R36 `fae920…`. R36 adds southern water supports/colliders. This old global hash already failed, but its current input is not unchanged. |
| `r32-qianqing-lifecycle.test.mjs:11` | Old 6512 triangles / four meshes versus current 5408 / two. Same R35 result; `data/interiors/qianqing.json` selects the R33 floor-only asset. Twelve colliders and fifteen walkables remain. |
| `r32-qianqing-lifecycle.test.mjs:12`, `same-count-geometry` | The mutation looks for removed `merged_red_lacquer` and throws before loader validation. Exact same R35 TypeError, not a newly observed validation bypass. |
| `r32-world-integration.test.mjs:4` | `(80,-280)` is no longer dry. `SouthWaterSystem.js:40` includes west reach `(79,-282) → (94,-278)`, half-width 4.2; `Environment` cuts the connected water polygon. This test passed on R35. |
| `r35-resource-audit-clock.test.mjs:33` | R35's fixed environment count 2300 becomes 3654. Scene clock, actual timestamps and five visible meshes passed before the failed count. A later, unreached assertion also expects 188 source files versus current 197; it must not be represented as having passed. |

A separate lightweight `Environment.setupGround()` construction, not a modified test, returned R35 three meshes / 188 triangles / one ground ray hit at `(80,-280)`, versus R36 three meshes / 1542 triangles / zero hits. Its exact triangle delta +1354 equals 3654 − 2300, identifying the ground-cutout change rather than a clock regression. The nine new source-tree files are eight JavaScript modules and the Wuying data file.

## Historical-or-mixed: compare causes, not failure totals

### Initial be5b668 versus R35

By exact file and test name: 73 shared failure keys, 127 initial-only keys and 22 baseline-only keys. The 73 shared names are **not** 73 proven same-cause failures:

- 70 have the same normalized diagnostic.
- One, `r16-baohe-retention.test.mjs`'s R17/world-source assertion, already fails on R35 but receives a new actual source hash under R36.
- Two file wrappers abort for different reasons: `r12-glaze-lod.test.mjs` has a baseline deep-equality failure but current anchors-identity rejection; `shenwu-exit-wayfinding.test.mjs` has a baseline `TypeError` reading `push` but current `ZoneBase`-identity rejection. They are classified as current identity blocking, not same-cause baseline failures.

Initial 200-failure cause breakdown:

| Cause | Count |
|---|---:|
| Same-diagnostic reproduced baseline failure | 70 |
| Reproduced old hash assertion with changed current input | 1 |
| Exact historical identity/inventory rejection or import blocking | 128 |
| Changed route-count expectation | 1 |

The 128 identity cases are 80 assertion failures plus 48 import aborts. Three other file aborts reproduce their baseline cause, giving 51 total aborted files. Initial-only keys comprise 46 new file aborts, 80 identity assertions and the route-count assertion. The latter expects 61 automatic routes but observes 62 because 文渊阁 is now explicitly enterable; it is not a traversal failure.

All 22 baseline-only assertion failures occur in files that abort earlier in the current run. They are listed individually in JSON as `BASELINE_FAILURE_MASKED_BY_CURRENT_FILE_ABORT`. Examples include the older Taihe navigation hashes, R25–R30 inventory guards, R29 optional Qianqing 6512/four expectations, and old Qianqing passage probes. None is called fixed or passing.

### Final 88d5db6 versus initial be5b668

All 200 initial failure keys remain. There are 17 additional failures, all caused by the explicitly changed hotfix source identities:

- Fourteen exact byte/hash/source-transport assertions involving `main.js`, `src/controls/FirstPerson.js` or `src/scene/flight/FlightTour.js`.
- Three new file-level `main.js` identity aborts: `loading-welcome-lifecycle`, `place-info-source-delta`, and `v13-entry-source-delta`.
- Two of the 200 shared failures now stop at an earlier guard: the Qinan driver guard rejects `FirstPerson` before reaching its old Collision mismatch; an older R32 source chain rejects `main.js` before its old Environment mismatch.

Final 217-failure cause breakdown is therefore **70 + 1 + 145 + 1**, using the same rows as above. There are 54 file-level aborts. Against R35, the final key sets are 73 shared, 144 final-only, and the same 22 baseline-only assertions still masked. The JSON records every added and changed diagnostic, rather than treating pre-hotfix classification as final automatically.

## Functional red flags explicitly checked against the baseline

The apparently functional failures were not excused by their filenames. The following all reproduce on R35 with the same numeric/error outcomes:

- Taihe beam/plaque intersection.
- The old dais Z origin 7.06 versus 5.06, and all twelve old straight stair approach/return failures.
- Twenty-four preload/setup cases failing because old permanent `COL[35]` is not found.
- Two old plaque-atlas corner probes.
- Old optional-asset, loader-contract, geometry-retention and asset-rebuild expectations.

No newly failing non-identity functional assertion was established by these compared logs. This limited conclusion does **not** establish the correctness of assertions prevented from running, turn historical guards green, or replace the independent helicopter event-chain audit. See [HELICOPTER-HOTFIX-AUDIT.md](HELICOPTER-HOTFIX-AUDIT.md) for that separate repair and evidence.

## Reproduction and classification method

The run owner executed the two unchanged test groups using the inventory and commands in [REGRESSION-PLAN.md](REGRESSION-PLAN.md), with `--test-concurrency=1`. The baseline historical run used exactly the same 132-file list. Direct failures were reproduced with:

```sh
node --test --test-concurrency=1 --test-reporter=tap \
  tests/r32-fidelity-help.test.mjs tests/r32-palace-collision.test.mjs \
  tests/r32-qianqing-distance.test.mjs tests/r32-qianqing-lifecycle.test.mjs \
  tests/r32-world-integration.test.mjs tests/r35-resource-audit-clock.test.mjs
```

TAP failure keys use relative file plus exact test name. For file-level failures, the preceding underlying exception is inspected, not just the generic `test failed` wrapper. Only repository prefixes and random temporary rebuild-directory names are normalized when comparing diagnostics. Log contents remain untouched, and their SHA-256 identities are recorded in JSON. No test was rerun by this triage worker; only existing logs, source comparisons and the small ground-geometry diagnostic were used.
