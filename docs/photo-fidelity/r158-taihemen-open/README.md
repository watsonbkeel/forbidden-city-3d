# Taihemen requested central access and dragon-carving repair

Base `c376ef094e0377ecee183a31252d3eadb95c54a2`, tree `c68e58c4a9ffbbb311bac20168d994e00e8ea1b7`, independently read back equal to remote `aac4e3a3949688440ab21bad0877051d1e8242b3`. User screenshot `image(20261102-000350).png`: remove two transverse black fences for gameplay and show dragon carving like Taihe Hall. This does not establish historical/current visitor admission or measured stone design.

## Four production paths
- `src/scene/palace/TaihemenObservedApproach.js`: explicit user game override; omit only head/toe black barrier profiles/owners. Real visitor admission stays UNKNOWN.
- `src/scene/palace/TaihemenObservedSolids.js`: omit those two visible/collision assemblies; full native 0..1 UV instead of metre-scaled clamp smearing. Same existing HD yulu albedo/normal textures. Locally owned cloned material uses polygon offset -1/-1 to avoid coincident stone-body z-fighting; shared material unchanged. All eight retained central exact triangle streams and non-triangle collisions are unchanged, including stone body/cap and white side rails.
- NEW `src/scene/palace/TaihemenImperialFootprint.js`: one native ramp contact envelope for the full 0.5m player footprint. Center x restricted to [-1.01095526,1.01095526]; half-metre head transition remains over actual stone/deck. Conservative rendered center-height difference <=0.141714m, including 0.0001m numerical triangle clearance. No new visible stone, deleted stone collision or global collision bypass.
- `src/scene/palace/TaihemenStairContact.js`: forwards only this private authenticated capability through the existing local preserve/resolve points. Old five stair/deck owner capabilities and global Collision/FirstPerson source are unchanged.

The new resolver only tracks grounded, <=0.1s, <=sprint-speed motion, authentic exact live source signatures and one matching ramp. It checks swept collision, rejects jump/upward velocity, missing/changed stone, duplicate or forged supports, and side-edge positions. Authored support registration requires actual matching visible stone triangles. Ordinary zone-tag unload removes stone and support together. Arbitrarily removing only collision arrays is NOT a supported world lifecycle: this invalidates local tracking but does not magically remove a separately retained native ramp row. No such manual removal occurs in production.

## Evidence and limits
Before/after PNGs are same-camera CPU z-buffer diagnostics from actual geometry and existing yulu albedo, with a small diagnostic depth-bias approximation. They are NOT browser/GPU screenshots or reconstructed own-site carving. Normal map remains unchanged but is not simulated in CPU images. Before 1,220 central triangles, after 476; the removed triangles are only the two black fences.

Normal production World, `loadAll:false`, loaded axis-courts plus globally constructed entities, no QA injection: six roundtrips (central 10/60Hz walk/run, two retained outer flights) = 3,173 frames, all arrive; max feet/native-ground gap 0.24434904644233946m. Central stone-center surface gap max 0.14171325456417172m. Both white side-rail exit attempts reject. Covers toe approach, uphill, head/deck, gate crossing, north stair, and return downhill. Four new components and all nine pre-existing Taihemen stair tests pass; existing jumping/high-fall/stale/teleport, owner deletion/duplication/modification, side-edge and dynamic-obstacle negatives are preserved. New contact jumping/missing/modified/forged/duplicate/side guard cases explicitly reject.

True RED: initial fence/UV tests fail; after simply removing fences, central 4 routes block at stone toe while old outer 2 pass. Full-footprint support resolves ascent, and approved local contact tracking resolves native downhill hover (previous max 0.615425m). No test tolerance was widened; acceptance remains 0.3m. Detailed raw runs stay local `/tmp`; SHA/summary are pinned separately. No author full build; unique integrator performs cumulative build and review. No shared ZoneBase hook needed: current Taihemen path already invokes modified modules.

## Reproduce
From isolated tree:
```
node --test tests/r158-taihemen-open/component.test.mjs tests/r158-taihemen-open/world.test.mjs tests/photo-fidelity/batches/taihemen-stair-contact.test.mjs
node tests/r158-taihemen-open/export-cpu.mjs /tmp/r158-taihemen-open-cpu
python tests/r158-taihemen-open/render-cpu.py /tmp/r158-taihemen-open-cpu/after.json.gz docs/photo-fidelity/r158-taihemen-open/after.png
```
Before comparison now imports `tests/r158-taihemen-open/frozen-parent.mjs`. It authenticates the exact c376ef094e0377ecee183a31252d3eadb95c54a2 nine-file dependency graph using the existing original commit/tree/blob reader and the tracked snapshot. It never reads the old mutable sibling directory. Fresh Git clones need neither that original commit object nor a sibling checkout. Current production modules and every original assertion remain unchanged. Normal World test still uses this candidate's production source; it was not rerun for this test-loading change.

## Independent-review correction
Astra found that raw `checkCollision(to,from)` is continuous for triangle/dynamic actors but only endpoint-checks ordinary boxes. New central thin-Box test, with both endpoints explicitly clear, reproduced a true RED. The helper now reuses the existing `wumenJointBodySweep`, including ordinary continuous body checks, rather than claiming old-route negatives cover the new route. Production change is only this local helper import/call. After correction: five new components plus all nine unchanged old stair tests pass (14/14); four actual complete Taihemen-host central roundtrips pass, 1,969 frames, same max 0.24434904644233946m gap. This lightweight post-review host replay is NOT a new full World run. The six-route normal World evidence above belongs to pre-review f0561d96; cumulative normal World on final source is left to the unique integrator. Review RED/GREEN and host raw SHA are in summary.json. No tolerances widened, geometry/material/CPU unchanged.


## Historical-source portability correction (2026-11-03)

The formerly hard-coded sibling had advanced from c376 to41944818. Two comparisons then failed because the supposed old geometry already lacked the removed barriers/placeholder. This was a drifting test input, not a current game regression.

The tracked c376 manifest covers only the nine static source dependencies of the old approach builder, not all c376 source. It includes authentic original commit/tree objects, exact blob identities, SHA256 and byte lengths. Five blobs are new; four reuse already versioned originals. The reader and production source are unchanged. Historical modules load into a separate test-only namespace; all current source imports remain current.

Run the bounded checks (do not glob in world.test.mjs):

```
node --test --test-concurrency=1 tests/r158-taihemen-open/component.test.mjs tests/r158-taihemen-open/review-contact.test.mjs tests/r158-taihemen-open/portable-parent.test.mjs
```

The10new tests cover an isolated no-original-history repository, all5original assertions without a sibling checkout, missing/changed manifest, missing/changed/symlink source, changed bytes after module caching, and two actual regression injections. Restoring a visible/collidable fence and corrupting dragon UVs in separate in-memory child runs must fail the unchanged original assertions. Neither injection writes game files. The barrier injection also records the fence in its profile so the first small-object assertion fails without formatting the entire Three scene in an assertion diff.

An initial child runner inherited Node's test-worker context and skipped nested runs; the harness now explicitly starts an independent runner. An earlier large-object barrier failure was terminated by SIGKILL and was not accepted as a negative-control pass. Final negative controls require ERR_ASSERTION and exactly one failed original test, not a crash, timeout or import error.

This change repairs test reproducibility only. No game behavior, visuals, physics, deploy settings or original tolerances changed. It does not add World/GPU/mobile evidence or make all historical suites portable. The existing742 clean build remains evidence for its exact runtime bytes, not a newly built source commit.
