# R50 female runtime render-budget verification

## Latest result: Kit06 plus near-cap fix passes 23/23

At integrated commit `9489bbe`, with the **same Kit06 SHA-256 below**, the
23 checks all pass. Production selection now retains at most two desktop
LOD0 actors without deleting selected roles; mobile remains near 0. The nearby
essential emperor retains its LOD0 slot. Original red evidence is preserved.
This is a Kit06 result only: the pending Kit07 seated-rig change is **not yet
covered** by this run.

| Verified post-fix scenario | Logical | Submitted | LOD0 / LOD1 / LOD2 | Actual triangle sum | Batch draw estimate |
| --- | ---: | ---: | --- | ---: | ---: |
| Formal 38, synthetic close bindings, desktop | 38 | 38 | 2 / 36 / 0 | 59,473 | 10 |
| Formal 38, synthetic close bindings, mobile | 38 | 32 | 0 / 32 / 0 | 42,874 | 9 |
| Synthetic 96, clustered, desktop | 96 | 64 | 2 / 62 / 0 | 94,599 | 10 |
| Synthetic 96, mixed distance, desktop | 96 | 64 | 2 / 50 / 12 | 79,472 | 15 |
| Synthetic 96, mixed distance, mobile | 96 | 32 | 0 / 23 / 9 | 35,060 | 12 |
| Cached real Taihe interior view, desktop | 38 | 16 | 2 / 1 / 13 | 14,226 | 10 |
| Cached real west-lane view, desktop | 38 | 9 | 2 / 1 / 6 | 11,308 | 7 |

All 22 scenario submissions stay within desktop 64 visible / 180,000 triangles /
60 batch-draw estimates / near 2, or mobile 32 / 90,000 / 30 / near 0. Maximum
sampled draw estimates are 15 desktop and 12 mobile. This certifies the tested
frozen roster, reachable geometry, and synthetic stress cases, not an arbitrary
future registry or a new general-purpose triangle/draw-call scheduler.

## Initial result: budget violation reproduced, then repaired by the owner

Candidate06-06 `CharacterKit.js` SHA-256:
`5128af161cbce30e7da8106b8350ae30455dd16c32e04f00075cb948e85cf15b`.
The initial integrated commit was `4a94872`.

`node --test --test-reporter=tap tests/p3c-female-render-budget.test.mjs`
ran 23 checks: **18 passed, 5 failed**. The five failures are real desktop
near-LOD budget violations; two also exceed the 180,000-triangle ceiling.
This report does not relabel those failures as success or reduce the required
roster to work around them.

| Initial scenario | Logical | Submitted | LOD0 / LOD1 / LOD2 | Triangles | Batch draw estimate | Limit violation |
| --- | ---: | ---: | --- | ---: | ---: | --- |
| Formal 38, synthetic close bindings, desktop | 38 | 38 | 38 / 0 / 0 | 152,481 | 10 | near 38 > 2 |
| Formal 38, synthetic close bindings, mobile | 38 | 32 | 0 / 32 / 0 | 42,874 | 9 | none |
| Synthetic 96, clustered, desktop | 96 | 64 | 64 / 0 / 0 | 346,831 | 10 | near 64 > 2; triangles > 180,000 |
| Synthetic 96, mixed distance, desktop | 96 | 64 | 32 / 20 / 12 | 226,941 | 20 | near 32 > 2; triangles > 180,000 |
| Synthetic 96, mixed distance, mobile | 96 | 32 | 0 / 23 / 9 | 35,060 | 12 | none |
| Cached real Taihe interior view, desktop | 38 | 16 | 3 / 0 / 13 | 16,385 | 9 | near 3 > 2 |
| Cached real west-lane view, desktop | 38 | 9 | 3 / 0 / 6 | 13,443 | 6 | near 3 > 2 |

The initial code selected by priority/distance and then sliced to 64 on desktop.
It did not bound LOD0 count. Mobile forced every candidate to LOD1 or LOD2,
then retained the fixed symmetric 19-person court cohort and up to 13 other
visible roles. The 19 remain emperor 1, officials 12, ritual attendants 2,
and guards 4. No required flag, formal registry member, rollout switch,
architecture, or old fixture is changed by these tests.

## What is measured

- The unchanged formal registry contains 38 required logical actors. Pressure
  cases add 58 explicitly synthetic test-only copies, never a scene or registry
  expansion. Production `CharacterManager`, `selectCharacterBudget`,
  `CharacterResourcePool`, and `CharacterRenderer` perform selection, actual
  geometry acquisition, instanced batching, and statistics.
- Each selected actor's actual geometry index count is divided by three, then
  summed individually. Each real nonempty InstancedMesh batch is counted.
  Those independent totals must exactly equal renderer statistics. This is
  not an LOD0 single-template triangle count multiplied by 64.
- All 27 geometry cache keys reachable from the formal registry are inspected:
  folded/resting females, fixed-route hanging-arm females, the seated kang
  variant, the emperor seat, and all other formal role families at three LODs.
  Maximum triangles per reachable LOD0/1/2 key are 8,148 / 1,490 / 508.
- With a valid desktop near cap, a conservative bound across those current
  assets is 2 × 8,148 + 62 × 1,490 = 108,676 triangles. Mobile's corresponding
  bound is 32 × 1,490 = 47,680. These are conservative LOD-aware bounds, not
  measured full-frame performance or a proof for future unexamined assets.
- Cached world coordinates and both world-space route polylines are read from
  `reports/r50/world-bindings.md`. Their source hash is recorded in JSON.
  The existing 182-file frozen-world source manifest is checked; no source
  differs. The cached actor-file SHA matches the current registry, and both
  cached paths have identical relative vectors to the current authored paths. Actual patrol positions are sampled by `PatrolController`, rather
  than stacking three guards at their shared route origin.
- Camera poses cover a high aerial cull, Taihe interior/court, Chuxiu room,
  Yikun/Yongshou courtyards, and the west lane, on desktop and mobile. The high
  aerial view correctly culls all actors below the minimum projected size;
  it is not forced to display 38. JSON lists camera settings, every selected
  actor, its distance/LOD/resource key/triangles, and every submitted batch.
- The route consort uses the hanging-arm `femalePose=walking` cache family
  during real movement and the actual endpoint pause. Distance-driven LOD may
  change between samples, but the pose family must not switch to folded hands.

## Evidence boundary

This is lightweight **CPU submission and geometry-budget evidence only**.
The cached world positions are rounded historical CPU-adapter results and
are replayed, not freshly raycast. No full palace geometry or browser is
created; no WebGL render, GPU timing, FPS, scene occlusion, mobile hardware,
or new female seat/support certification is claimed. `contentApproved:true`
is injected only into isolated test managers. The actual rollout constant and
`sceneEnabledByDefault` remain false.

## Files and reproduction

- `tests/p3c-female-render-budget.test.mjs`: independent executable assertions.
- `female-runtime-budget.red.tap`: smallest initial 38-role red reproduction.
- `female-runtime-budget.full-red.tap` and `.red.json`: preserved complete
  pre-fix evidence (23 checks, five genuine failures).
- `female-runtime-budget.green06.tap` and `.green06.json`: post-fix Kit06 run,
  23/23 passing, with exact production source hashes.
- `female-runtime-budget.tap` and `.json`: latest-run copies.

Run `R50_WRITE_BUDGET_REPORT=1 node --test --test-reporter=tap tests/p3c-female-render-budget.test.mjs`
to refresh the JSON. Tests do not write reports unless explicitly requested by
that environment variable. The owning integrator repaired the near cap.
The final female Kit07 still requires a new run; this verifier does not alter
production policy or silently drop actors. No full-world-heavy test command
was run as part of this narrow, explicitly lightweight verification.
