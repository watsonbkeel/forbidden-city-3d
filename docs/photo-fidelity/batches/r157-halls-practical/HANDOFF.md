# B group delivery: 11 objects

Baseline `99e3d29c5d29699d9b143e2d8a9316d04d4a1aea`. Branch `feat/r157-halls-20261101`.
Scope is the user's practical visual/passability standard; discrepancies below0.3 m that do not obstruct travel are not polish blockers. No browser/GPU acceptance is claimed.

## What to integrate

1. Prior test-only commit `46ad4c0fe66100bce72cbc3244ffac9782a2eb01` (if not already integrated): make current Taihe tests executable without fabricating absent historical Git objects. The two genuine historical tests still fail.
2. This branch's single subsequent implementation commit: four object modules, focused tests, CPU diagnostic scripts and evidence/patch documentation. No main/shared production files were changed by this worker.
3. Apply `INTEGRATION.patch` to the integration worktree, reconciling concurrent explicit imports if needed. It changes only:
   - `PalaceBuilder.js`: independently extend Baohe west geometry/support/rails; retain north central stairs; install own west wall and Taihemen lions before merge.
   - `axis-courts.json`: item19 inner end40.5 ->64.85, nothing else.
   - `ZoneBase.js`: rear left/right adjoining walls17/19 physical height7 m; dedicated Baohe gallery dispatch only for items31/37.

Do not omit the shared patch: isolated modules by themselves are NOT a production installation. The new integration tests deliberately fail on the old dispatcher.

## Complete original-ID accounting

| Object | Original ID | Result at handoff |
|---|---|---|
| 太和门 | FC-B3B12CF397 | Retained9-bay/2-eave body and6 facilities; new individually identified east ball/west cub bronze lions. |
| 太和殿 | FC-A478209231 | Retain existing11-bay, double-eave main silhouette/central setting and functional visitor routes; no fine-detail churn. |
| 中和殿 | FC-5FAA15AE5C | Retain own3-bay square body,4-side veranda and single pyramidal roof/flat ceiling; do not recenter it on terrace stairs. |
| 保和殿 | FC-58A3300503 | Retain existing9-bay double-eave body, front/rear openings, throne/warm-room setting and column reductions. |
| 体仁阁 | FC-8C6502DA44 | Retain independently profiled two-storey9/7-bay body,24-support veranda and front routes. |
| 弘义阁 | FC-A43B1DAB0B | Retain its own two-storey profile and existing distinct lower-window leaves/routes; no forced mirroring. |
| 三台 | FC-35BF29ABCB | Restore the visibly missing broad Baohe west three-tier court with matching real support; other hall/north/east controls retained. |
| 太和殿两侧阶梯封火墙 | FC-1ABC6622CB | Retain already-installed complete wall pair;13/13 whole-wall component tests passed. |
| 保和殿两侧阶梯封火墙 | FC-526ABE19BB | Retain east; add complete independently registered west wall and folded-open passage; true-height outer joins. |
| 保和殿东联庑 | FC-0D3F161564 | Dedicated six-section game-scale wing, stone-ring arched cross-walls, continuous covered front route. |
| 保和殿西联庑 | FC-86FF7FC2AB | Independently identified corresponding wing/front route; west individual photo and exact wall stations remain unverified, not disguised as surveyed. |

All11 are accounted for;5 get main-form improvements,6 retain already substantial bodies. These are practical main-form candidates, not11 newly proven whole-object/GPU acceptances.

## Evidence and limits

External research/actual diagnostic outputs: `/workspace/scratch/02a8023d1a85/halls-evidence-0132`.
- `SOURCES.json`:7 official static files with SHA-256, viewed in this task; copyrighted photographs not placed in game assets.
- `lions-cpu`:2 actual-geometry views, inspected. Bronze height2.99 m comes from own size sheet; stone base1.10 m and carving are visual fits. Pair26,248 triangles,16 bounded colliders, no synthetic floors.
- `baohe-cpu`:south/north/door candidate views, inspected. Images are explicitly cropped west-region geometry diagnostics, not full-hall screenshots.
- `galleries-cpu`:covered route and overview, inspected; broad source-backed shape, approximate segment stations/count interpretation. No invented room inventory.
- Official west panorama metadata restored, but new cube pixels were not fetched. Recorded older own-source analysis is labelled as such; fresh checks use actual1941 plan and2020 Museum photos.
- Exact carving, pin counts, sub0.3 m positioning, full room inventory and modern access policy are not blockers for the user-authorized game exterior scope.

## Tests and honest failure handling

New object component tests:9/9 passed. Candidate shared-entry tests:5/5 passed; targeted ZoneBase wall/gallery dispatch and merged-identity tests:4/4 passed. They are labelled patch-candidate runs, not claims of an already changed production entry.

Retained component suite:97 tests,93 passed,4 inherited failures (details in `PROGRESS.md`). Taihe historical-source suite:8 tests,6 pass,2 genuinely unavailable history dependencies fail. These are not silently skipped or turned green. No full World/build/browser run was started by this worker.

After applying the patch, run without candidate overrides:

```sh
node --max-old-space-size=768 --test --test-concurrency=1 \
  tests/photo-fidelity/batches/taihemen-bronze-lions.test.mjs \
  tests/photo-fidelity/batches/baohe-west-practical.test.mjs \
  tests/photo-fidelity/batches/baohe-linked-galleries.test.mjs \
  tests/photo-fidelity/batches/halls-practical-integration.test.mjs \
  tests/photo-fidelity/batches/baohe-adjoining-wall-height.test.mjs
```

For the single final integrated World pass, explicitly include:
- Baohe west doorX39,Z119↔127 atY8; flank negativesX34/44,Z123.
- New west supportsX50/56/62 atZ110/150; old interior railX29 absent, outer upper edgeX53.3 guarded.
- Original east doorX−37 and north central three flights; Taihe pair unchanged.
- Gallery front routes eastX−102.37/westX106.6, Z0↔115 (inside existing court end walls); each arch, ordinary foot/head clearances. Isolated galleries also passed their entire local span in both directions.
- Taihemen two lion footprints outside central approach; preserved6 original facilities, own doors/front stairs.

Old strict C promotion equality intentionally compares an entire old six-fixture tree and cannot remain identical after installing real new lions. Retain that historical test and explicitly distinguish the new two-object ownership; do not use current source as an invented historical parent. Likewise old R92 “west remains narrow” and old gallery-hash contracts describe the superseded state, not defects to undo.

Final Astra review, whole-World/NPC/lifecycle checks, build and actual browser evidence belong to the integration owner. No claim is made that those missing checks already passed.
