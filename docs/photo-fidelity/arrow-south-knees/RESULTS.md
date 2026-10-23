# Arrow south-central knees: local implementation handoff

Entity: FC-AF36D75128 箭亭. Local branch: `r59-arrow-south-knees`. Base: `2b983ae82e50e23fd55bbe0845942a0a3855f8dd`. Diff/source/red-test checkpoint: `eb5d224`.

## Implemented, not visually accepted

Two mirrored gray closed solids now represent the visible broad shoulders and simplified curved underside at the central south bay. Each has 44 triangles; the delta is 2 meshes / 88 triangles / 1 privately owned material before merge, 1 additional draw/material batch after merge. No carved motif, painted decoration, rear/side knee or exhibition object was inferred.

The actual low edge is y=7.909999995 m, approximately 7.01 m above the 0.9 m platform. The standing eye height 1.7 m + jump 7.2²/(2×14) + conservative 0.5 m head-radius margin totals 4.0514 m above the platform, leaving approximately 2.9586 m. Actual repeated jumps at 10 and 60 Hz separately pass. No collision or support was added.

All 310 old meshes / 5332 triangles and their geometry buffer bytes, indices, poses and material properties retain their frozen local-hall signature. The 20 columns, 87 colliders, 3 walkables, 1 room, 1 region and 1 map item remain. Nameboard registration and the existing R49 nameboard/label evidence gap remain. The corrected hall has 312 meshes / 5420 triangles before merge.

## Exact integration hook, owner file only

The shared `EnclosedPavilions.js` is intentionally untouched in this branch.

Add this import:

```js
import {buildArrowSouthKnees} from './ArrowSouthKnees.js';
```

Immediately after the existing `for(const s of[-1,1])` four-frame-beam construction loop, and before `kit._lastFurnish`, add:

```js
if(key==='arrow')buildArrowSouthKnees(kit,f,item);
```

The builder requires those exact two existing central columns and the south beam before allocating. It rejects identity/metric drift, missing hosts and duplicate additions. Do not put the hook before the beams exist. `check-integration.mjs` evaluated this exact hook in memory and verified its result against the frozen original, without writing the shared file.

## Reusable local QA

```js
import {arrowKneeSnapshot,auditArrowSouthKnees} from './tests/lib/r59-arrow-knees-qa.mjs';
const baseline = arrowKneeSnapshot({kit,frame}); // pre-change, already constructed
// caller builds its change, or supplies an earlier same-library baseline
const result = auditArrowSouthKnees({kit,frame,baseline});
```

No helper constructs a world. The frozen test fixture uses the existing plain test library; the CPU comparison separately uses actual production textures/materials. Do not compare one library's material signature to the other library's signature.

## Evidence and commands

- `node --test --test-reporter=tap tests/r59-arrow-south-knees.test.mjs`: 12/12; initial red was 0/12 for the absent builder, recorded before production code.
- `node --test --test-reporter=tap --test-name-pattern='R45 independent' tests/r45-independent-enclosures.test.mjs`: 9/9 inherited local enclosure checks. This invocation validates the unchanged caller; the separate in-memory proposed-hook check validates integration.
- `node scripts/r59-arrow-south-knees/check-integration.mjs`: exact proposed hook, two knees, closed finite outward triangles, exact old local mesh/registration signature. All 430 previously tracked `src`, `data`, `public` files match the base Git blobs in this branch. Only the new production module is added.
- `node scripts/r59-arrow-south-knees/export-cpu.mjs`: 3 identical before/after camera pairs with actual material/albedo/UV data; no browser is invoked. Canvas dependency may be supplied using `R59_CANVAS_MODULE`.
- `node --check src/scene/palace/special/ArrowSouthKnees.js`, both scripts' syntax checks, and `git diff --check`: passed.

Evidence is under `reports/r59-arrow-south-knees/`. `qa.json` and `integration.json` contain geometry, navigation and raw source hashes. `cpu/proof.json` records camera position/target/FOV, output hashes and exact production source hashes at capture. Captures bind to the listed working-tree content, not merely the red-checkpoint HEAD. `cpu/pixel-delta.json` confirms the only changed pixels are inside projected new-knee bounds: 1,158 wide, 14,232 front-detail and 16,248 oblique-detail pixels. This is a containment check, not source-photo resemblance acceptance.

I actually viewed the original photo, the CPU front before/after, wide after and oblique after outputs. The added silhouette is visible, symmetric, joined under the beam and against the columns. Existing roof/beam decorative mismatch and the unverified nameboard are intentionally still visible; this patch does not claim to fix them.

## Retained hashes

- Old local meshes/materials: `381c3396c5050f8ee70df8e28e8b49bde247859be5d69d5de870ff0b91425508`.
- Old local physics: `e6c44f916875f40c7e3b64389ed3b744959613b4a03ee5422ebc4c5f5692643d`.
- Old nameboard registrations: `58c9d88cdd4c227b957846dea3d4451b2ea4b7ee7a1f1b7a57846725a491f8c0`.
- New production module SHA256: `c5fc042d324e34b80f7746bb7f138f37f10681326245d92ff910c428a59298fb`.
- Unchanged `EnclosedPavilions.js` SHA256: `5381da26d16d981cd113e03e0f8cbaa245fee61e2ab24cdedc698377d320bd6a`.

## Still pending

VERIFY_PENDING: real browser same-camera before/after, whole-scene visual review, GPU/mobile behavior. The existing Chromium EPERM and denied bwrap path are not retried. CPU output is not browser evidence, historical acceptance or an accurate-paint/PBR claim. No full world or full repository suite was built/run by this worker; the integration owner owns the single centralized run. No upload, main change, Pages change or credential/permission change was made. R58 frozen documents and all character paths are unchanged.

The image capture date remains unknown, and source framing provides no permission to reconstruct unseen elevations or present-day interior furnishings. Full building exterior and interior acceptance remain open.
