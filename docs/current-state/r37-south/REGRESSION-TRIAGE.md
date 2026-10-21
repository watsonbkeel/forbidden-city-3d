# R37 final CPU regression triage

## Result and evidence binding

No newly failing assertion key was found versus the exact R36 published-run logs. This is **not all-green acceptance**: all 227 reported failures remain failures, 54 historical files still abort at import, and masked assertions remain unverified.

- Frozen R37 production: `93789c45ff034d64760be48a265053a32818a6b0`.
- R36 source-stable commit: `c6718de20bb13dfebe963d49b797b061634dd995`; published rollback: `c92f7a9e9ab0ead8e6f00d2a0550503f3b09d193`.
- R36 logs were captured with HEAD `88d5db6b81bcc4d6e304b72d1997a6607a04e452` plus frozen working-tree inputs. The source manifest, not HEAD alone, binds that run to its inputs.
- R37's before/after manifests are byte-identical across 975 files: SHA-256 `81d8e56487fc7cc0930e0933ef703c6abdde04ccbc148c269e02ec73d9144154`. R36 manifest: `9dfb88a269431c43a3ca07a5698e784679393f27d21431c9a0e1a8492a6b1df6`.
- Between those manifests: exactly five production deltas, comprising two new modules and three edits; four new test files and one new fixture. No prior test/helper/fixture bytes changed and no files were removed. Production hashes are recorded in JSON. No global merger, water, or input code changed.

[Compact per-failure classification](REGRESSION-FAILURE-CLASSIFICATION.json) preserves all 227 exact `(relative test file, test name)` keys, both normalized diagnostic hashes, log line references, classification and the inherited R36 interpretation. Full TAP logs are not republished.

## Terminal totals

| Run | Tests | Pass | Fail | Exit |
|---|---:|---:|---:|---:|
| R36 direct-current | 1769 | 1759 | 10 | 1 |
| R37 direct-current | 1799 | 1789 | 10 | 1 |
| R36 historical-or-mixed | 1192 | 975 | 217 | 1 |
| R37 historical-or-mixed | 1192 | 975 | 217 | 1 |

R37 runs all 148 original direct files plus four R37 files, 152 total, and the identical 132-file historical list. The 30 additional direct tests pass; they are already included in 1799, not an extra acceptance count. No tests are cancelled, skipped or TODO. The direct TAP top-level plan is 1703; Node's reported 1799 includes nested tests. Historical totals do not change.

## Direct-current: ten unchanged failures, not waived

All ten exact keys and full normalized diagnostics match R36. They cover:

- One old 储秀宫 fidelity-note expectation.
- Four old 储秀宫 panel/straight-lane/window probes.
- One pre-LOD global permanent-navigation hash expectation.
- Two old Qianqing optional-asset/lifecycle expectations, including a mutation targeting removed geometry.
- One dry-ground expectation at `(80,-280)`, already changed by R36's river continuation.
- One old resource-audit environment triangle expectation, still `3654 != 2300`.

The resource-audit test stops at that triangle assertion. Its later source-count expectation of 188 and subsequent lifecycle/optional-reload assertions **do not execute** in this test. New passing tests or unchanged failing diagnostics do not make those later assertions pass. See the inherited [R36 triage](../r36-south/REGRESSION-TRIAGE.md) for the original per-assertion source explanation.

## Historical-or-mixed: all 217 keys retained, 13 changed diagnostics inspected

There are no added or removed failure keys. Of 217 failures, 204 retain the complete normalized diagnostic. The other thirteen are individually classified, not excused by filename:

1. Eight already-failing product-inventory assertions change because `WuyingRepresentativeDetails.js` and `YudeBath.js` are now added. Seven occur in `r32-followthrough-source-retention.test.mjs` (R25, R26, R26 frieze, R27, R28, R29 and R30 inventory assertions); one is R35's complete raw finish-scope assertion in `r35-source-retention.test.mjs`. Additional unchanged paths displayed near the diff's tail are Node's shifted context, not extra production additions.
2. Four already-failing raw `ZoneBase.js` source guards, in the R32, R33, R34 and R35 source-retention tests, receive the new actual hash `32c8b843…` instead of `19334e9d…`. Each old expected hash remains unchanged. The source delta is the Yude import plus its structure dispatch, not an unexplained global source change.
3. The existing `shenwu-exit-wayfinding.test.mjs` import abort receives that same changed actual `ZoneBase.js` hash and retains its expected hash and guard location. It still aborts before its behavioral assertions. Matching its generic `test failed` wrapper alone would have concealed this diagnostic change.

These are existing failed guards with changed inputs, not newly passing tests and not proof that their blocked assertions are correct. The same 54 files abort in R36 and R37. No new aborts account for the count change; only the 30 added direct tests do.

## Preserve masked gaps

All 22 R35 baseline failure keys previously masked by R36 import aborts are carried forward individually in JSON, and each blocking file is confirmed still aborted in R37. None is described as repaired or absent because it passed. This includes earlier Taihe navigation hashes, R25–R30 inventory checks, old optional Qianqing expectations and passage probes. These 22 known masked failures are not an exhaustive census of all assertions prevented from running.

## Method and limits

Failure identity is the exact relative file and test name. Complete error diagnostics are hashed after normalizing only the repository root and randomized Taihe rebuild directories; hashes and substantive values are not normalized away. Import failures use the preceding underlying exception. All thirteen changed diagnostic diffs were inspected and tied to exact added paths or changed source bytes. No production/test edits, suite reruns, waiver changes or acceptance-threshold changes were performed by this triage.

Original log SHA-256 values:

- R36 `direct-current.tap`: `c3edbf98fc09dc23cf24ec9fef3657506de35aa9955e116e47eaaf9195b8ea58`.
- R37 `direct-current.tap`: `155d3bfec26596901221b93b70a621e9a41901698d321088d254f2deac19449d`.
- R36 `historical-or-mixed.tap`: `d7ab40e8aa29f041672c1c46a3533dd9c69ab4a1015783d60fa6892fb1156984`.
- R37 `historical-or-mixed.tap`: `6226576da4c8405c21284fef0c7649a6cd0d5ad7b7d3bbd6d7dcc74c7e22ee40`.

This report only classifies CPU regression output. It does not establish real GPU rendering/FPS, native pointer-lock interaction, physical-phone behavior, measurement-grade 1:1 accuracy or today's exhibition inventory. Root aggregate verification and publication remain separate.
