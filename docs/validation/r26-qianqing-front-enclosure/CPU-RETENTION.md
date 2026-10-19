# R26 Qianqing south intereave tests-only retention

Frozen combined runtime: `da853e5f95603beb3cfda11c79f48eed16286b28`.
Portable prior runtime: windows-only R26 `bad4ee29b12b2d079d6504de42516ac34d0e8868`.
Prior fixtures checkpoint: `01c52519804bc35d090a080bdf4b0c0eaf8a84a4`.

CPU testing stopped at 2026-10-19 00:20:03 UTC for owner performance. No runtime, owner feature test, browser, build, commit, upload, branch or packaging work was performed. The preexisting untracked node_modules remains untouched. No new Python caches were produced.

## Files to integrate

Added:
- tests/fixtures/r26-qianqing-frieze-source-delta.json
- tests/fixtures/r26-qianqing-frieze-scene-delta.json
- tests/lib/historical-r26-windows-fixture.mjs
- tests/lib/r26-qianqing-frieze-capture.mjs
- tests/lib/r26-qianqing-frieze-retention.mjs
- tests/r26-qianqing-frieze-retention.test.mjs

Minimal adapters:
- tests/lib/historical-r25-nameboard-fixture.mjs
- tests/lib/r26-qianqing-retention.mjs
- tests/r25-nameboard-retention.test.mjs
- tests/r26-qianqing-retention.test.mjs

No existing fixture bytes changed. All 106 fixture files, including both windows-only R26 fixtures, were checked against the frozen prior tests checkpoint. Existing fixture hashes and expected old identities were not relaxed.

## Bound scope and portable historical restoration

The only runtime source deltas are the PalaceBuilder import and call plus the new QianqingUpperEnclosure module. RoofBuilder, the previous QianqingFrontEnclosure module, every other source/asset and retained route dependency remain byte-bound. The source fixture binds 276 retained dependencies and 106 prior fixtures.

Historical restoration first binds the entire current builder SHA, inverses exactly two unique nonempty source hunks, then checks the entire windows-only builder SHA. The portable prior builder runs from in-memory restored source with repository-relative imports and exact dependency checks. Test execution requires no Git objects, sibling checkout, network or permanent workspace path. Older R26/R25/R24 adapters now receive this strict layer before their original reversals. Old windows-only tests use the independently restored windows-only builder; live feature tests and the new current-retention tests still use the current builder.

Current-source SHA: 1f4d36c802ed845c070f9ec52b9efc7b6da259aa1f5d004250ffcbbf99684ac2
Restored windows-only source SHA: 5a436a8c4c0a773797033d1048305bec1df99861de68a35ec38f608db561271b

## Fresh complete scene evidence

- Merged meshes: 164 before and after.
- Resident triangles: 188075 before and after; zero added.
- Geometry bytes: 18296468 before and after.
- Unique material objects in CPU fixture: 85 before and after.
- Complete material records: identical in original order.
- Exactly two merged mesh records change, at traversal indices 136 and 142. Their only changed field is complete geometry identity; all other 162 mesh records remain exact.
- Complete oriented position/normal triangle multiset retains every triangle, vertex order and multiplicity. Its SHA-256 is 24e58892e9810fc663dac6f0f44864e4782470c2bb6e0f8677da3e088f06e908.
- Comparing all complete triangle attribute/material identities removes exactly two old identities and adds exactly two new identities. No triangle is excluded. Sorting only accounts for moving triangles between material batches; independent complete raw scene/mesh fixtures bind original traversal order.
- Navigation remains exactly ordered and unchanged: 2487 colliders, 120 walkables; SHA-256 a1668d4eaf2b4ea21b0ea5a45fb421ef299ff48888d4d23bb1f60396be825853.

Unmerged Qianqing has 115 -> 116 meshes: old body at index 113 retains 18 of its 24 vertices, and appended index 115 reuses the original six south-face vertices and the already-existing caihua material. Every position and normal is retained, east/north/west attributes remain exact, and only south-face UV/material reassignment is permitted. Both south triangles are checked for their exact south plane/normal and expected UV mapping from visible body height. No new material is created. All 14 previous window/base/folded-leaf elements remain exactly unchanged. All other Qianqing mesh records and four complete control halls remain identical.

## Verification chronology

1. initial-expected-failure.log: before adding the adapter, existing R26 retention correctly rejected the full new source hash at fixture bootstrap. Node reported 1 file-level test, 0 pass / 1 fail. This log is intentionally preserved.
2. scene-generation.log: successful fresh combined/windows-only capture, with all positions/normals, counts, material reuse and exact two-triangle identity delta checked before fixture output.
3. frieze-first.log: 13 / 13 passed, 15.428 seconds. Covers provenance/source/module locks, exact reversal and negative mutation guards, portable history, full scene identities, complete triangle identity accounting, exact south split, earlier windows, four controls and navigation.
4. focused-chain.log: 73 / 73 passed, 13.449 seconds with concurrency 2. Entry points: old R26 retention, R25 retention, R12 glaze LOD, R12 terrace/controller checks, R10 deep source chain, current R25 nameboards, current R26 windows, current R26 upper enclosure. The current three feature files contribute 17 / 17 of these tests.
5. git diff --check passed. git diff --name-only for src, data, public and the three owner feature tests was empty. No test or generation process remained running when CPU-stopped was reported.

Total fresh final selected coverage: 86 / 86 passed across nine entrypoints. No remaining failures. The initial pre-adaptation rejection remains documented as a failure, not counted as a final pass.

`affected-selection.json` is a static local-import dependency analysis: 110 transitive test entrypoints, narrowed to nine relevant entrypoints. It does not run tests. Complete strict restoration proves identical windows-only inputs for older unchanged consumers; current scene counts/LOD/controller behavior and direct changed consumers received fresh focused tests. The prior 1797-test broad graph was intentionally not rerun, and this report does not claim a fresh full-suite pass.

`final-scene-metrics.json` contains the current scene metrics, exact runtime identity and test counts. Generator scripts and logs stay outside the repository and are not required by tests.

Fixture SHA-256:
- Source: 637240a7d81477329bd212b6e3fe19c462da785f196830faa736539629563c2e
- Scene: 8d59d6ba8bd4327e6aefd2adda4240dadc0c15e4ebca08a9f92d4765b3ce0daf

Owner alone integrates/commits/uploads. No more CPU work is pending.
