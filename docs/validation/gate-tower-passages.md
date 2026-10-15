# Gate tower CPU validation

Base: `3d196a60ead843fcc029a7fcd406374f9b699fc8`. This is CPU architectural/collision evidence; browser appearance, current public access and GPU release acceptance remain pending.

## Retained contracts

- Wumen geometry fingerprint locks every roof/platform/wing/ramp mesh outside the upper shell, every outer-column mesh, and all three existing walkable primitives. The historical golden fixture records its originating commit.
- The actual 1×1m square body, radius .5m, 1.7m eye height, .6m step-up, anchors, ground tunnels, supports and movement source are unchanged. Original route descriptors and drivers are unchanged.
- New profiles separate measured/raw endpoints, adopted axis geometry and provisional wall/leaf/rail thicknesses. Wumen tests cover 2.6 / 2.9 / 3.2m setback variants.
- Every new body-height obstacle proxy equals its actual rendered mesh bounds, including veneers and opened leaves. No full-hall collider or hidden bridge is introduced. Merged ray tests confirm visual openings and closed bays; material identities and architecture metadata survive production merging.
- The qinan and sun protected-source tests retain historical hashes. Their only new constants exception is `v9-gate-constants-delta.mjs`, which asserts the historical constants hash, exactly one old Shenwu block, and one finite approved replacement. Twelve tests reject missing/duplicate anchors, omitted dimensions/provenance and unrelated constants/physics/anchor edits.

## Actual controller coverage

`node --test --test-concurrency=1 tests/gate-tower-controller.test.mjs`: 96 runs, 12 routes × 60/10Hz × walk/sprint × forward/backward. Includes both gate ramps ground→top→ground, verandas/corners, all modeled door groups, outer Shenwu loop, reversals and settled endpoints. Rescue is disabled. Routes reuse the existing physical-crossing driver: sprint is released within 2m of turns/endpoints, explicitly not a full-speed corner claim. No physics/source/tolerance change is used to obtain passage.

Each run records actual support identities, feet/ground, speed and body collisions. Logical collision follows production `max(feet, ground)` during ascent. Inherited camera-feet easing can visually overlap ramp slice boxes on ascent; it is separately counted instead of being mislabeled collision-free visual motion. All 96 runs pass with zero logical-body collision frames; plateau camera-body overlap is zero. The inherited easing produces 720 visual-feet overlap samples across ramp runs (maximum feet/ground lag 0.380515m), explicitly retained as a separate diagnostic. Original frozen input fixes remain a separate component.

Commands for final serial verification:

```
node --test --test-concurrency=1 tests/*.test.mjs tests/current-state/*.test.mjs
npm run build
node tests/stepwalk-auto.cjs --check
node tests/anchor-check.cjs
```

The auto-route precheck remains 59/59. Anchor check intentionally still reports exactly the inherited Shenwu 11m deviation. The original parallel baseline file-level failure is retained as undiagnosed (no signal detail), with the serial baseline passing; it is not asserted to be an OOM. Initial red tests and pre-migration protected-source failures were preserved externally. One new numerical assertion was corrected from exact `10.05` equality to 1e-9 after IEEE result `10.049999999999999`; route tolerances were untouched.

## CPU geometry cost

Same unchanged generator/detail policy and shared material variant keys, without frustum culling or WebGL. Counted after actual material merging:

| Assembly | Base triangles | Candidate triangles | Meshes | Shadow-eligible triangle delta |
|---|---:|---:|---|---:|
| Wumen | 31,740 | 31,812 | 25 → 25 | +252 |
| Shenwu | 15,900 | 16,942 | 14 → 15 | +1,078 |
| All merged architectural groups, all zones loaded | 904,214 | 905,328 | 345 → 346 | +1,330 |

World material instances remain 163; colliders 12,362→12,424; walkables remain 368. The world scope includes PalaceBuilder, Enclosure, GardenBuilder and ZoneBase, but excludes sky/environment/terrain/UI, streaming and camera visibility. It is not a rendered-frame budget or draw-call claim.

Legacy veneer/floor/threshold noncasting flags are retained. Newly modeled lattice leaves can enable shadows for their shared merged bucket; the separate inner balustrade adds one Shenwu mesh. Total triangles rise 1,114 despite the wider Shenwu roof itself decreasing 208. The larger roof bounds and derived height can change visible/shadow submissions. No shared LOD, threshold or rendering policy was changed. The original six-camera/60-frame performance gate must still run on the final integrated commit; its prior Taihe margin was only about 2,809 triangles.

## Browser gate still required

The owner must freeze identical baseline/candidate global cameras before inspection, then review both upper faces, Wumen inner galleries/corner, Shenwu four faces, distinct rails, ramps and tunnels. Unsupported-height baseline diagnostic poses must be labeled. This visual comparison is separate from the unchanged original performance cameras. Any performance fix requires separately approved scope; CPU success alone does not authorize publication.
