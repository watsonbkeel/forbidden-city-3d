# R49: bounded Qin’an entry and missing name plaques

## Confirmed roots and local changes

- R47/R48 intentionally sealed both Qin’an annex side panels and marked all terrace/interior access unaccepted. This was not a failed stair or enlarged-body collision bug. The user's new request supersedes that exterior-only gameplay restriction.
- Split those two unverified side skins into explicit virtual open side doors aligned with the existing east/west stairs. Keep the actual model's column grid, north wall, main/annex dimensions, floors, steps and railing unchanged. No widened building, phantom ramp, rescue floor, north exit, throne or claimed reconstructed temple furnishing.
- Preserve the original ground teleport landing. UI now explains entering along the side stairs and returning the same way. Door details remain fitted gameplay choices; present museum access is unknown. Historical exterior-only documentation is retained with a supersession note.
- Qianqing Gate's dedicated builder emitted no plaque. [The official page and photographs](https://www.dpm.org.cn/explore/building/236473.html) locate the vertical name plaque over the central **rear-eave** doorway, not the outer open-porch beam. The [close-up](https://img.dpm.org.cn/Uploads/Picture/2020/11/17/s5fb36b5c36cf3.jpg) shows Han at viewer-left and Manchu at viewer-right. Added a local, model-fit plaque with verified Han “乾清門”; no invented Manchu.
- Qin’an's dedicated builder also emitted no plaque, so it was invisible to the generic atlas audit. The [official close-up](https://img.dpm.org.cn/Uploads/Picture/2020/07/03/s5efef832a6177.jpg) establishes the vertical “欽安殿” / Manchu board between the south main-hall eaves. Added only a Han semantic approximation at that band. Frame proportions, font and placement are fitted, not surveyed or traced. From close side angles the retained lower eave can legitimately occlude part of the board; no roof was moved and no board was floated outward to defeat that.

## CPU evidence

- Before repair, production-material tests failed on missing Qianqing plaque and all 16 side-entry routes stopped at the closed side skins. A separate red assertion captured Qin’an's missing nameboard before that addition.
- Production `TextureLibrary` construction uses actual material, cache, ownership and UV code, with inert texture image inputs and a CPU Canvas surface. This is not the old material-name-only stub. It does **not** verify fetched image pixels, browser font rasterization, lighting or GPU output.
- Both stairs, 60/10 Hz, walk/run, forward/backward: 16 isolated real-controller round trips and the same 16 with full-world collisions, all arrive inside the main hall and return to ground.
- The finished garden geometry audit checks 2,504 nearby actual triangles against 5,736 frames of a 1 m wide, 1.7 m high body. Only exact unchanged stair/support triangles within the controller's 0.35 m step clearance and the existing garden's exact 1.2/2.8 cm ground skins are contact exceptions. No wall, door, furniture or tree is exempted by material name.
- Both plaques survive production finish; letter-face ray tests verify the intended south approaches. Qin’an source/merged geometry lifecycle tests pass with retained `noMerge` plaque ownership. Its full local count is 3,616 triangles: 3,252 prior exterior + 144 R48 golden-column/base triangles + 96 split-door triangles + 124 plaque triangles. The old 3,382 threshold was already stale after R48; no claimed triangle saving.
- Browser/GPU validation was unavailable for this run. No browser or sandbox workaround was attempted in this work.

## Gate denominator, separate from halls

`gate-plaque-audit.json` records **74** named gate/city-gate items, not the hall denominator:

- 2 historical demolished sites (储秀门、长春门) intentionally have no physical gate.
- Of 72 modeled gates, 71 emit a plaque. Each has at least one unobstructed tested ground-approach center ray after production merge. The audit samples isolated gate assemblies at 8/20/40/80 m; it is not a guarantee from every angle or through neighboring trees/buildings.
- Dedicated cases: 协和门、熙和门、景运门、隆宗门、昭德门、文华门、武英门、东华门、西华门、午门、太和门、乾清门、神武门 and 皇极门. Other 58 extant generic gates also have a rendered plaque.
- 皇极门 emits no plaque. No reviewed evidence establishes a missing current nameboard there, so none was invented.
- 神武门 retains its visible “故宫博物院” institution board. Its upper full bilingual gate-name board is still an explicitly documented omission, not a claim of complete signage.
- 太和门's initial audit failure was a sampling bug (target placed inside its 0.15 m thick board). Targeting the actual face made the test pass; no Taihe geometry was changed.
- This audit checks presence, material-backed geometry and bounded visibility, not the historical accuracy of all generic labels, script layouts, calligraphy or current visitor opening.

## Contract handling

Current-state Qin’an/Qianqing tests were updated only where the newly authorized virtual entry or actual plaques change the contract. R48 frozen snapshots and source guards are not regenerated to hide the intentional differences. The former no-interior-route assertion and old fully closed side-panel signatures remain historical facts, not current acceptance criteria.

## Further source-bounded same-class finding: Jiyun Tower

- The [official complete façade](https://img.dpm.org.cn/Uploads/Picture/2024/06/18/s6670e8aa8f637.jpg) and [nameboard close-up](https://img.dpm.org.cn/Uploads/Picture/dc/8001.jpg) show an upper-floor, central outer-colonnade horizontal board. Han at the right reads right-to-left “吉雲樓”; Manchu is at the left. The URL dates are not verified photography dates.
- Added only that missing horizontal nameboard in `RemainingOuterHalls.js`, using a local helper. Han-only centered system-font rendering and a simplified rectangular frame are explicit semantic approximations. No Manchu, exact carving, dimensions or tilt is invented as verified.
- The new test first failed for the missing board. With the board removed, exact pre-addition production geometry and navigation signatures remain unchanged. After production merge, 12 character-position rays from four ground approaches pass. The owned texture disposes once. The addition is 12 triangles, with no collision or room change.
- Baoxiang and Ciyin towers also have textual evidence of horizontal boards in the [official 2016 paper](https://www.dpm.org.cn/Uploads/File/2020/03/30/u5e81bda9e4579.pdf), printed pp250 and258. Page258 documents surviving boards/covered paintwork, but the available partial/back photographs do not resolve the full façade level and letter order. These are known omissions, not evidence that the buildings have no signs. They remain unmodified this round rather than borrowing Jiyun's mounting as fact.

## Final local test receipt

`node --test tests/r49-qinan-entry-qianqing-plaque.test.mjs tests/r49-jiyun-horizontal-name-plaque.test.mjs tests/r49-gate-plaque-audit.test.mjs tests/current-state/qianqing-gate.test.mjs tests/current-state/qianqing-material-batching.test.mjs tests/current-state/qinan-hall.test.mjs tests/current-state/qinan-exterior-navigation.test.mjs tests/current-state/qinan-exterior-stair-safety.test.mjs`

Result: **119 passed, 0 failed**, including the three-cycle existing zone-lifecycle test. The broader legacy route suite separately contains frozen R32 route-descriptor / V7 FirstPerson byte guards; those snapshots were left untouched and compared with the frozen baseline rather than weakened. These are local validation results, not evidence of a GitHub or Pages deployment.

### Persisted logs and SHA-256

- `reports/r49/qinan-local-acceptance.tap`: 119/119; `120cb2aa75b1a510d7dbe1eff807f2ab076228cee689538d2446ba46fd9c171e`.
- `reports/r49/qinan-broader-legacy-check.tap`: 157 tests, 155 pass, the two frozen route/FirstPerson guards described above fail; `219b32985c9dd085257bd5af15896e3d0f08d9c44e74c8f71c0ff385e0cd3354`. This broader run uses the same command except `tests/current-state/qinan-*.test.mjs` replaces the three explicitly named Qin’an files.
- `reports/r49/qinan-entry-qianqing-plaque-red.tap`: original missing-Qianqing-plaque / 16 sealed-side-entry failures; `461bca6d304a72093abfbf9174e46ac85b350818bd5c7d90d33b2ea58f0b108a`.
- `reports/r49/qinan-name-plaque-red.tap`: missing Qin’an board assertion; `f177107e3a704bdf8c2b4b3f39acb746c0532a9549bf09fa22c20c8ad4c43306`.
- `reports/r49/jiyun-name-plaque-red.tap`: missing Jiyun board assertion; `2930888b361f30d1055c6a51f2e177dcf4f17000d12a81bccb4e515419cf35e7`.

`git diff --check` passes after the dedicated navigation test's trailing whitespace cleanup. Production implementation was frozen after the 119-test acceptance run. GPU/browser acceptance remains explicitly absent.
