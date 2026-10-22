# Final Kit07 + R49B joint render-budget verification

**23/23 checks passed**, with 22 real Manager/Renderer submissions, no budget
violation, and no production source changing during the run.

- Joint input commit: `7c13ef19955dbda6873815a1231a9800a580a4e1`.
- Final Kit SHA-256: `cc311f8fdaa912538fdfffebd66b7fa2c5de7f2c7063ffbc5bf462bc3f5edc6c`.
- Active architecture baseline: R49B `95db2af664ff9cb6ea405d0ba389ef428dfd7d6c`.
- Active 185-file freeze SHA-256: `d0b69e747a557b0ea57068357c26cdb59d9803c7a3fbe2daaaa957ae7e2390d0`.
- Original Kit06 red and green evidence is retained unchanged. This is a new
  final-Kit result, not a retroactive relabeling of the earlier run.

## Exact fresh-world output, replayed by the lightweight budget test

The separate joint-world validator freshly resolved all 38 required actors and
148 route samples. Its output is
`reports/r50-joint/world-bindings-38-148.json.gz`, SHA-256
`16b97ff4b4cfabeb6547db72dff431c18f79eb3dd84ebb770f040805bca95900`.

The budget test reads that exact output, verifies its Kit and active-world
hashes, checks 38 ready required actors, then supplies its full precise bindings
to the actual CharacterManager. Positions agree with the earlier rounded
world-binding report within **4.768371586472142e-8 m**. Both route polylines
also agree; the real PatrolController samples their current actor positions.
The separate validator additionally confirms all 38 semantic bindings and all
148 route samples remain unchanged. This budget test did **not** build or
raycast the full palace; the provenance distinction is explicit in JSON.

## Counts from actual selected geometry and InstancedMesh batches

| Scenario | Logical | Visible | LOD0 / LOD1 / LOD2 | Triangles | Batch draw estimate |
| --- | ---: | ---: | --- | ---: | ---: |
| Formal 38, synthetic near bindings, desktop | 38 | 38 | 2 / 36 / 0 | 59,473 | 10 |
| Formal 38, synthetic near bindings, mobile | 38 | 32 | 0 / 32 / 0 | 42,874 | 9 |
| Synthetic 96, clustered, desktop | 96 | 64 | 2 / 62 / 0 | 94,599 | 10 |
| Synthetic 96, mixed distances, desktop | 96 | 64 | 2 / 50 / 12 | 79,472 | 15 |
| Synthetic 96, mixed distances, mobile | 96 | 32 | 0 / 23 / 9 | 35,060 | 12 |
| Exact joint-world Taihe interior, desktop | 38 | 16 | 2 / 1 / 13 | 14,226 | 10 |
| Exact joint-world west lane, desktop | 38 | 9 | 2 / 1 / 6 | 11,308 | 7 |

Every tested submission meets desktop **64 visible / 180,000 triangles / 60
batch estimates / near 2**, or mobile **32 / 90,000 / 30 / near 0**. Every actor's
real BufferGeometry triangle count is independently summed and reconciled with
the renderer; no single LOD0 template is multiplied by 64 and called a budget.
The official roster remains 38 required actors. The 58 extras exist only in the
synthetic stress test, not production data or new scenes.

The emperor and the fixed symmetric mobile court cohort (1 emperor, 12
officials, 2 attendants, 4 guards) remain selected in the all-visible cases.
The nearby essential emperor retains a desktop LOD0 slot. The fixed-route
consort uses the hanging-arm family both when moving and at the actual endpoint
pause; LOD may change with distance, but the pose family does not change.

All 27 reachable formal-roster geometry keys were inspected. Final Kit07's
maximum triangles at LOD0/1/2 remain **8,148 / 1,490 / 508**. A conservative
current-resource bound is therefore 108,676 desktop triangles with near cap 2,
or 47,680 mobile triangles. This is not a promise about unexamined future
assets or a general-purpose hard triangle/draw scheduler.

## Reproduction and scope

Run:

`R50_WRITE_BUDGET_REPORT=1 R50_BUDGET_REPORT_SUFFIX=green07 R50_FRESH_BINDINGS=reports/r50-joint/world-bindings-38-148.json.gz node --test --test-reporter=tap tests/p3c-female-render-budget.test.mjs`

The paired `.green07.json` records source hashes, camera poses, every selected
actor and LOD, every batch, exact triangle totals, and the external fresh-world
provenance. `.green07.tap` records the 23 passing assertions.

This is **CPU geometry and submission-budget evidence only**: no browser,
WebGL draw, GPU timing, FPS, full-scene occlusion, or mobile-device performance
claim. No heavy world test was rerun here. Production appearance/scene rollout
remains gated; no required flag, registry actor, architecture, or rollout
constant was modified by this verifier.
