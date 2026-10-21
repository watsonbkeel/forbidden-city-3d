# R38 CPU regression triage

## Result and evidence binding

The initial aggregate run exposed **24 new real-controller route failures plus two failed parent summaries**. They were not waived as historical guards. A bounded route-composition correction retained the physical Taihemen flank contacts; every one of those 26 exact test paths executes and passes in the corrected full run. The final failure-key set returns to the R37 baseline: **10 direct and 217 historical failures remain**, not all-green acceptance.

- Production commit: `fb9fe43b916edda8316a7de87e22812adb80f314`.
- Corrected route-driver/test commit: `be371502b9b760da8100f088513298999788016b`.
- Final run HEAD: `be371502b9b760da8100f088513298999788016b`; initial run HEAD: `bd1fb50028d61428ae82fc9566825e9b6d3b2518`.
- Final before/after manifests are byte-identical across 984 files: SHA-256 `39abe3a62f664f1374da76c5eef04da06ec962e4e3faf95369bba69a30dcf8bc`.
- Initial before/after manifests are byte-identical: SHA-256 `403be1af63e76501855f7d781c778be7725f10778d53bd40ece1cefc1b034b00`.
- R37 source manifest: `81d8e56487fc7cc0930e0933ef703c6abdde04ccbc148c269e02ec73d9144154`.

The manifests include uncommitted independent test/fixture inputs, so commit IDs alone are not the complete run identity. No production bytes changed between initial and corrected runs. Relative to R37, production changes comprise two new modules plus four edits: local Taihemen south-approach construction/dispatch, the tree builder/hook, and east/west explicit tree registrations. The only existing test-side edits are the intended stepwalk route and continuous-route composition helper; frozen assertion files, fixtures and historical restoration guards remain unchanged.

[Compact per-failure evidence](REGRESSION-FAILURE-CLASSIFICATION.json) retains the initial failed phase, final keys, normalized diagnostic hashes, exact log lines, input hashes, all 54 import aborts and all 22 known masked baseline failures. Full TAP logs are not republished.

## Terminal counts

| Run | Tests | Pass | Fail | Exit |
|---|---:|---:|---:|---:|
| R37 direct | 1799 | 1789 | 10 | 1 |
| R38 initial direct | 1853 | 1817 | 36 | 1 |
| R38 corrected direct | 1856 | 1846 | 10 | 1 |
| R37 historical | 1192 | 975 | 217 | 1 |
| R38 initial historical | 1192 | 975 | 217 | 1 |
| R38 corrected historical | 1192 | 975 | 217 | 1 |

No run reports cancellation, skip or TODO. The corrected direct inventory has 157 files: all 152 R37 files plus five R38 files. Its 57 added tests include the independent tests and three new composition checks; these are already included in the aggregate, not an extra acceptance total. The historical inventory remains the identical 132 files.

## Initial new behavioral failures and bounded correction

In `tests/r34-continuous-route.test.mjs`, each B/S world had 12 failing all-five-bridges cases: three bridge lanes (-1.5, 0, 1.5), both directions and 60/10 Hz. The two parent summaries each reported 12 failed children; they are not additional physical cases. Forward traversal stopped near z=-231.39 at ground while targeting [0,-194.2]. Reverse traversal stopped around z=-225.40, feet 3.44, while targeting [0,-280]. The real controller’s arrived assertion failed before subsequent floor, support, no-rescue and continuous-crossing assertions; those later checks were blocked in this initial phase.

Root cause is `tests/lib/continuous-visitor-route.mjs`: the allBridges branch replaced the entire first segment with the five-bridge detour and its endpoint, silently dropping the new canonical Taihemen stair contacts. This demanded direct travel across the now non-walkable imperial stone. Ordinary axis/Chuxiu routes retained the contacts and did not fail. The failure was a real invalid composed route, not a raw-source guard and not excused by intentional geometry.

Commit be371502 preserves the complete canonical suffix after the bridge-north handoff and adds an assertion that all continuation contacts lie north of that handoff, plus three lane-specific composition tests. It does not change production, old test assertions, collision/support, controller, speed, reach threshold or step tolerance. Corrected aggregate TAP contains exact PASS records for every initial child and both parents. The 24 original real-controller cases now run their later assertions too. Original failed-run hashes and diagnostics remain in the JSON.

## Final direct-current: ten retained failures

Nine exact keys and normalized diagnostics match R37. They cover the old Chuxiu fidelity/panel/lane/window probes, two optional-Qianqing lifecycle/asset expectations, the old dry-ground probe inside the R36 river continuation, and the resource-audit triangle expectation.

The tenth is the existing pre-LOD global PalaceBuilder navigation-hash assertion in `r32-qianqing-distance.test.mjs`. Its actual hash changes from `fae92076…` to `999fad81…` after Taihemen’s local ramp/barrier changes; the old expected hash and all other error text are unchanged. This is a global ordered-navigation identity check, not a newly failing Qianqing visual comparison. Independent checks of the unrelated complete PalaceBuilder roots and retained Taihemen north geometry are separate evidence, not waivers.

The resource-audit test still stops at environment triangles `3654 != 2300`. Its later source-count expectation and lifecycle/optional-reload checks do not execute in that test and are not credited as passes.

## Final historical: 217 retained failures, 51 changed diagnostics

All 217 exact keys and the same 54 import-abort files remain. Relative to R37, 166 diagnostics are identical; 51 change. Each change was inspected at assertion level:

- 18 actual PalaceBuilder source hashes change for the local Taihemen import/dispatch.
- 5 actual ZoneBase source hashes change for the explicit tree hook, including the underlying Shenwu import exception.
- 2 stepwalk source hashes change for the finite Taihemen route update.
- 5 ordered fixed-route descriptor hashes change.
- 6 complete PalaceBuilder scene-capture hashes change.
- 7 ordered PalaceBuilder navigation hashes change.
- 8 inventory failures include the two added production modules. Shifted Node diff-context lines are not additional source edits.

The first six hash categories total 43 exact actual-hash substitutions, with expected values and the remainder of each normalized error unchanged. Inventory differences are inspected separately. Initial and corrected R38 historical runs match all 217 keys and diagnostics exactly. File wrappers are never substituted for the underlying import exception. No failed source guard implies its later behavioral assertions passed.

## Masked coverage and limits

All 22 R35 failure keys previously hidden by R36/R37 import aborts remain individually recorded and their blocking files are still aborted. These are not repairs, and 22 is not an exhaustive count of every blocked assertion. The 54 imports retain their coverage gaps. No production/test/fixture file was edited and no suite was rerun by this triage worker.

This report establishes CPU regression classification only. It does not establish WebGL appearance, GPU/FPS, native pointer-lock play, physical-phone operation, current museum access, measurement-grade 1:1 fidelity or exhibition inventory. Root validation/publication remains separate.

## Original TAP SHA-256

- R37 direct-current: `155d3bfec26596901221b93b70a621e9a41901698d321088d254f2deac19449d`.
- R37 historical-or-mixed: `6226576da4c8405c21284fef0c7649a6cd0d5ad7b7d3bbd6d7dcc74c7e22ee40`.
- R38 initial direct-current: `acc8b4abd9c11964eeb77f6cada808d24291531954edd587e368180727d1a879`.
- R38 initial historical-or-mixed: `364d7804986d516c4d19bc810b741c2438d59b72f83757fdc7a1d5590d29a91b`.
- R38 corrected direct-current: `edadc51ce448e06a363a3900a59ffdf805e0cbb8351e37a6f2e374b054c05e51`.
- R38 corrected historical-or-mixed: `3dde2f35eb9018ebd4c02a5fea00db96aa59adc354f00da93564aa5743ce72ac`.
