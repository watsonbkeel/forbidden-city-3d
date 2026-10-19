# R16: Baohe north shared-terrace approaches, in progress

Resumed2026-10-18 after R15 native full-circuit and real-five-minute idle validation. Base is frozen R15 local2e9e468 / remote0be3f247, including its day/night and complete helicopter feature. The former R14 work was cherry-picked as f6e2255; R15 packages and public Pages are not changed.

## Evidence and bounded scope

The official panorama photo named“64_全景_保和殿后石雕御路”shows three grouped approaches on each shared-terrace level: two outer flights and narrow flights either side of each central carving. It also shows the separate hall plinth above; that plinth is not yet changed by this module.
https://file-pano.dpm.org.cn/hotspotImage/2026/05/08/7774c04c18414fdc8cd57ef3259f6c8a.jpg
Capture date is not supplied. Its URL directory date is not a capture date.

Yang Naiji,“保和殿后大石雕”,printed p15, distinguishes the published exposed16.57×3.07m from the archival original block17.18×3.2m. The exposed figures themselves derive from Qing-unit conversion and the contemporary information board discussed by the article, not a new2026 survey. The candidate uses16.57m as sloping exposed face length, retains the inherited terrace heights and treats stair widths/counts, offsets and upper stones as provisional.
https://img.dpm.org.cn/Uploads/File/pdf/ab/1a/71/ab1a7121f7d5e0fed2e5bcba4827ec7f.pdf
https://www.dpm.org.cn/building/talk/223480.html

The central carving is a separate solid obstacle, never a walking ramp. Only actual stair strips carry walking support. Modern public access is unknown. Existing simplified carved texture is not a measured copy of this particular stone.

## Actual checks so far

-51focused Node tests pass: all four stair strips ascend/descend three tiers using the real controller at60/10fps, walk/sprint, forward/backward; twelve missing-ramp negatives fail safely; central stone and intervening walls block direct ground crossing; near/far geometry is closed and outward-oriented; visible stone face slopes north; LOD preserves physical support.
-First test draft preserved30pass/21fail. Test-only corrections: sprint turnaround moved fully onto the existing landing instead of reversing inside the helper arrival radius; wall-stop assertion uses the actual wall front, not the longer stair toe; world-space Float32 vertex comparison uses20micrometre tolerance. No product change was made to obtain these passes.
-Actual resident static-palace geometry:186186→188128triangles(+1942),155→157meshes,18115124→18301556geometry bytes(+186432). Only“ 三台 ”group changes. These include BOTH resident LOD variants, not a hidden-budget transfer. Whole-rendered-scene cost is still pending.
-Ordinary walking, fixed-view comparison, affected old route adaptation and final regressions remain pending. This is not a release acceptance.

## 2026-10-18 17:48 UTC validation checkpoint
- Full CPU run: 2401 tests, 2384 passed, 17 failures all from one old unmerged fixture lacking `finish()` architecture metadata. No application failure was inferred. The fixture now preserves the real metadata contract; its 17 tests separately passed. Other tests were not rerun without changes.
- Frozen product has not changed since `f6e2255`. Fixed-camera comparisons use the same viewport, camera and noon preview. First camera attempt was invalid (inside Qianqing Gate/behind its screen) and remains recorded; corrected two-view comparison is usable.
- Original fixed route count remains 33. Only Baohe north descent now follows the actual inner staircase instead of the newly non-walkable central carved stone. Endpoints, controller and acceptance conditions are unchanged. Navigation/source/scene historical normalization requires exact current and old hashes and rejects unrelated differences.
- Remaining: native north ascent/descent, full browser fixed/auto matrix, original six-view render budget. No publication acceptance yet.
