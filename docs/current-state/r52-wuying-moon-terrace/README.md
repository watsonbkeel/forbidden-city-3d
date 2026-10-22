# R52 B: Wuying south moon terrace

## Scope and evidence

This unit adds only the previously omitted raised south moon terrace, two side stair openings, returns, and the central raised causeway to the existing Wuying gate. It leaves the R48 west-gable middle, north end, all rooms, all sixteen cases and vessels, and plaques unchanged. It does **not** claim present visitor access or full-building historical accuracy.

The actual local official panorama faces were visually inspected, not inferred from captions: `scene_01/l`, `scene_02/l`, `scene_w02/r`, `scene_01/b`, and the independently supporting east-side `scene_w15/f`. Source package: [Palace Museum 2021 ceramics panorama](https://ggzlquanjing.dpm.org.cn/scene/rOQSztMJ62XbrOjIj78rxu2KMZTcvyfg/20210517_wydtcg/). The directory date is not a known photography date.

Exact original tiles are recorded in `sources.json`, copied from the existing R48 railing manifest. West: a clear stair opening with sloping rails and flat flanking panels; the north flank returns outward toward the hall platform and west gable. East: a separate stair opening is visible in w15/f. South: the lateral wings turn into the central raised causeway; no cross rail closes that route. Rail geometry retains a solid lower panel, a genuinely open upper field and coarse bud finials. Carved patterns are intentionally not fabricated.

All widths, offsets, heights, spacing and eight risers are **reversible model fits, not survey measurements**. The retained hall platform is 1.2 m, the gate platform 0.8 m. The causeway joins those incompatible model datums over 19.55 m with a 0.4 m drop (2.05% grade). This grade is **model compatibility geometry, not photographic evidence of an actual slope**. No north-end railing enclosure was invented.

## Actual geometry and navigation delta

- Two flat supports at 1.2 m: broad moon deck and narrow north shoulder.
- Two independently sourced side stair openings, each fitted as 8 × 0.15 m risers with 0.4 m treads, total run 3.2 m and width 3.8 m.
- One tapered central causeway support, 8.6 m wide, slightly offset to the retained gate centre.
- Added 19 walkable primitives, all boxes explicitly `rescue:false`; removed exactly the now-buried hall-front centre ramp and gate-north centre ramp. Net +17 supports. The two gate lateral stairs, hall rear approach and all foreign supports remain unchanged.
- Added 516 local colliders: actual rail components/posts/treads/slabs and short below-surface causeway strips. There is no enclosing courtyard collider or room-wide rail proxy.
- The production CollisionManager and Teleport code are unchanged. The old map destination still has valid XZ; real `Teleport.isSafe` resolves it to 1.2 m on the visible deck. Starting at its obsolete ground height is blocked rather than being accepted below the slab.

Exact added bounds and removed old supports are in `surface-collision-delta.json`. Canonical side access is exported by `wuyingMoonTerraceAccess(item, side)`; each point carries world `x,z,y,feetY`. West starts (234.65, -215.0), east (204.35, -214.8), feet 0. Both reach the door boundary (219.5, -206.2), feet 1.2. The built hall metadata now uses the west side entry. Consumers of the old pure SouthCourt profile ground-entry hint must instead consume this export. The final integrator owns those legacy auto-route/stepwalk updates and the original spawn → Xihe → Wuying continuous route.

## Verification

- `node --test tests/r52-wuying-moon-terrace.test.mjs tests/r37-wuying-representative-details.test.mjs`: 30/30 pass.
- `R52_WUYING_FULL_WORLD=1 node --test tests/r52-wuying-moon-terrace.test.mjs`: the suite was additionally exercised against actual full-world collision data, 23,769 colliders, 24/24 pass. The saved full-world run preceded the final tiny rendered-body assertion tightening from ground height to actual feet height; that tightened assertion passes locally and remains enabled for the integrator's final world run.
- Actual FirstPersonControls: west/east, normal/sprint, forward/backward, 10/60 fps; ground approach → eight risers → front door boundary → opposite stair → ground; no rescue or oversized step-up. Centre route also reaches retained gate platform. Near-edge routes check accepted player bodies against actual rendered triangles, not only collision boxes.
- Surface down-rays meet actual opaque meshes at the declared height. Railing upper holes are actual absent geometry; lower panels and all solid added rail/stair pieces have collision coverage.
- A legacy consumer check remains intentionally unresolved in this component: `tests/r48-audit-real-world-gallery-details.test.mjs` starts Wuying at old (219.5, -212.2, feet 0), now inside the deck, and fails at the first leg. It must be rebound to the canonical side route by the single integrator, not made pass by permitting an underground spawn. The simultaneous retained-geometry test passes.
- `npm run build`: pass. `git diff --check`: pass.
- All 2,664 pre-existing hall/precinct meshes exported for the comparison retain identical geometry, material names and world transforms. SHA-256: `42b9f08fc29fdac03f7935421459ca5c3d596d8536c8e5837c030148309049f1`. The independent R37 tests additionally preserve d102/scene60 and the other fourteen vessel geometries.

## CPU visual evidence, not GPU acceptance

`before-after-contact-sheet.png` contains paired views from identical cameras: west stairs, east stairs, south causeway, and high plan. Baseline is frozen R51 `fac791cf956d852e32cc9594ce537b22bca82308`. The images are perspective CPU z-buffers of **actual production-builder triangles**, including the existing neighboring halls and trees. They are not drawings, proxy blocks, browser screenshots or GPU output. Base/vertex colors only: textures, runtime lights, shadows and postprocessing are not reproduced, so large white material regions cannot be used to judge final material appearance. The plain grey ground plane is capture context, not a production geometry change.

Reproduce from a checkout with dependencies: `node docs/current-state/r52-wuying-moon-terrace/capture.mjs LABEL OUTPUT_DIR`; then `python docs/current-state/r52-wuying-moon-terrace/raster.py OUTPUT_DIR/LABEL-west.json.gz OUTPUT_DIR/LABEL-west.png` (likewise east/south/plan). The capture tool exports actual triangles and metadata without changing production code. Uncompressed/gzipped triangle payloads are not committed.
