# 养性殿南入口 · source-bounded local checkpoint

Original object **FC-E32471B7C3**, not a new building or whole-object acceptance. Parent `e7ff5d21a5eb0af561dea3a338571ee9c878b446` and every prior version remain intact.

## Changes
- Present two-leaf glass windows with red rectangular upper grille and restrained gold edges; no return to historic diamond lattice.
- Four glazed central leaves, deliberately folded alongside the retained 2.8 m route. This is a circulation fit, not the closed-door photo state. Framed glass transom clears the annex front beam.
- Fitted 12 × 3 portico coffer fields: green backing/frame, own deep-blue circles and gold borders. No dragons, flowers, narratives or newly invented paintings.
- Closed, outward-wound plain central stone incline and six steps on each side. Retained central support ramp is byte-exact; only two adjacent support ramps added. Raised stone slab borders/top ornaments and carved relief are not reconstructed.
- Rear facade, room plan, roof, plaque and prior furnishings remain inherited; unseen apartments/ear rooms remain unverified.

Recovered unfinished files were preserved and completed. The red tests caught the missing four leaves, inside-out reflected incline, shared turquoise instead of own blue, and missing merged provenance. Existing unrelated dirty bridge reports and untracked earlier previews were not staged or overwritten.

## Verification
- `node --test tests/major-pilots/yangxing/*.test.mjs`: **11/11 passed**, including finite geometry, positive ramp winding, beam clearance, merged provenance, material disposal, non-target hall parity and retained walk rows.
- Actual decoded NingShou zone: **24 controller loops**, 10/60 Hz × walk/run × forward/backward × central/left/right approach. No rescue, teleport or physics modification. Adjacent stair approaches turn centrally before closed glazed bays; the narrow inherited landing is not falsely declared a broad walkway.
- Actual production geometry/decoded textures: five final CPU views inspected (`reports/major-pilots/yangxing/candidate-final`), 30,650 triangles in the extraction. These are **not browser/GPU/FPS acceptance**. Source images were reviewed privately, not copied into public textures.
- Independent read-only review: **8/8 entrance tests passed**, no blocking defect; stone border/ornament omission clarified.
- Production builds for `/`, `/forbidden-city-3d/`, `/gugong/` completed and exact runtime fingerprint verified: `3d31cb98d87ca31f023519b5e8791684b0226a3bdd175fb20c6ca326c4f82b78`. Large-chunk warning retained. Initial concurrent build/render processes were killed; successful retries and base verification are separately recorded.

## Broad-suite disclosure
- Historical NingShou selection: **436/471 passed, 35 failed**. Parent-module replay reproduces 31 failures, mainly older FanHua fixture/profile mismatches, Suichu retained-state assertions, stale archival material hashes, atlas resource budget and compound route setup. One additional Yangxing archival byte-exact golden fails intentionally because this package changes its mesh/material inventory. Two concurrently interrupted Huangji files pass **25/25 serially**. The concurrently interrupted large regression file passes **26/26 serially**. All 35 initial NingShou outcomes are therefore accounted for: 31 parent-reproduced, one intentional Yangxing golden change, and three file-level execution interruptions with green isolated reruns.
- Initial default-concurrency repository aggregate `npm run test:current-state`: **1057/1274 passed, 217 failed**. **Same-condition corrected run (`--test-concurrency=2 --test-reporter=tap`): 1115/1331 passed, 216 failed, exactly the parent failure names; no new failures.** Includes old source-hash, Wumen/gate, Qianqing/frieze and historical-state guards. This aggregate is **not green**, and all failure names/logs are retained; no claim that all 217 were independently baseline-reproduced.
- No unrelated historical fixtures were rewritten merely to turn the aggregate green.

## Rollback and reproduction
Set `kit.yangxingSouthEntrance=false` before build to restore the previous Yangxing entrance independently. Source and fitted dimensions are in `SOURCE-MANIFEST.json` and `COVERAGE-MATRIX.json`. Render: `node scripts/major-pilots/yangxing/export-whole.mjs candidate-final`; baseline uses label `baseline`. Build output directories are adjacent `yangxing-entrance-build-{root,pages,gugong}`.

Local checkpoint only. No main modification, push, deployment, or whole-interior acceptance.

## 217 versus 216 follow-up
The net +1 was not the Yangxing historical golden. Two file-level failures (`qinan-exterior-stair-safety`, `r138-source-bounded-details`) replaced one old R138 assertion. Same-condition parent/child isolated runs give Qinan 48/48 each and R138 10/11 each with identical actual/expected hashes. Full concurrency-2 rerun restores exactly 1331 tests / 216 parent failure names. See `same-condition-current-state-comparison.json`; fixtures were not altered.
