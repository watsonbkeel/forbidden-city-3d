# C1 procedural character quality samples

## Evidence scope

These images are CPU software rasterizations of the actual indexed `BufferGeometry` produced by `CharacterKit.js`, with actual per-vertex colors and normals. Animation frames are produced by `deformCharacterVertex` from `CharacterAnimation.js`; the production shader exposes the same equations. These are not concept images, browser captures, WebGL captures, GPU frame-time results, or mobile-device results.

The neutral chair and footstool are isolated geometry fixtures. They establish a measurable 0.49 m seat contact and a 0.30 m raised foot support, not proof of placement in the actual palace. For seated rear inspection the fixture backrest is hidden, explicitly labeled on the image, so the back garment is visible.

CPU review lighting and projected mesh shadows are inspection aids only. Production `CharacterRenderer` currently sets `castShadow=false`; the images do not assert that runtime character shadows or Three.js day/night lighting have been validated. Runtime shadow-depth/distance deformation remains a separate prerequisite before enabling character cast shadows.

## Deliverables

- `c1-front-side-back-day.png`: standing guard, seated imperial character, kneeling official; front, side, back.
- `c1-front-side-back-night.png`: identical geometry under a CPU night comparison light setup.
- `c1-actual-geometry-motions.gif`: 24 actual geometry frames over approximately eight seconds, illustrating head turn / walking foot cycle, small seated arm movement, and kneeling upper-body lean. The walking cell is a root-relative cycle preview, not a world-space route traversal or proof of foot locking against scenery. It is an offline low-frame-rate inspection clip, not a real-time FPS demonstration.
- `c1-animation-frame-01.png`, `-09.png`, `-17.png`: selected full-resolution frames.
- `c1-seat-variants-geometry.png`: standard, raised-footstool and kang-low support variants with front, side, oblique views.
- `c1-actual-palace-seat-front-side-oblique.png`: actual Taihe B throne and Chuxiu kang scene triangles with Adapter-resolved candidate characters, three views.
- `c1-actual-throne-rejected-vs-bent-knee.png`: old extended-leg candidate explicitly rejected versus the front-seat, bent-knee candidate, without changing architecture or adult scale.
- `c1-actual-palace-seat-contact-details.png`: higher-angle actual-furniture contact inspection, all visible furniture parts retained.
- `c1-actual-palace-seats-rejected-raised-footstool.png`: preserved real-world evidence that the old raised-footstool pose was visually unsuitable.
- `world-seat-bindings.json`: actual world transforms, contact data, source counts and hashes.
- `c1-initial-three-poses-0241.png`: preserved early evidence, before shoulder/cuff/badge/contact fixes.
- `c1-refined-three-poses-0247.png`: intermediate shoulder and emblem refinement.
- `geometry-metrics.json`: exact vertex/index/triangle/buffer counts plus source hashes.
- `tdd-red.txt`, `tdd-green.txt`: initial missing-module failure and current focused test output. Later defect tests were observed failing before fixes; their specifics are recorded below.

## Geometry and identity

All seven templates have standing, seated and kneeling base meshes at three LODs. Each returned geometry has one indexed mesh, no material groups and vertex colors; no texture images or external model assets are used. This is a template library, not approval to populate every palace. World expansion remains gated by user appearance approval and the parent task's spatial/history checks.

The calibration body is 1.70 m excluding the hat. The robe has flared/folded loft contours, curved tapered sleeves, cuffs, collar, belt, hands with thumbs, shaped head, ears, nose, eyes/brows, lips, hair/cap and shoes. The guard includes an outer vest with front/back studs; the official has front/back authored bird badge motifs; the imperial template has an authored circular coiled-dragon motif, not an official's rank square. Female templates use small dressed/simple hair silhouettes, not late-Qing large winged headgear. Motifs are simplified geometric interpretations; exact historical dress classification and rank are not claimed.

## API

`createCharacterGeometry(templateId, pose='standing', lod=0, options={seatVariant:'standard'})`

Required shader attributes are `position`, `normal`, `color`, `characterPart`, `characterPivot`, `characterWeight`, `characterTorsoWeight`. Local coordinates use metres, Y up and +Z forward. The returned geometry's `userData` contains support contacts, pose, LOD, variant, triangle count, a conservative 0.20 m animation padding, and interpretation status.

`CharacterResourcePool.acquire(templateId, pose, lod, options)` returns `{key, geometry}`. Keys include seat variant. `release(key)` decreases the reference count without disposing resources still shared by another area. Zero-reference cache entries are retained up to 63 entries; unused entries may be evicted when needed. `stats()` reports entries, references, geometryBytes, textureBytes (0). `dispose()` is idempotent.

`deformCharacterVertex(position, normal, attributes, state)` is the CPU reference. `CHARACTER_DEFORM_GLSL` contains the matching shader function `characterDeform(inout vec3 p,inout vec3 n,float time,vec4 anim)`; anim contains phase, environmental amplitude, walk speed and pose index. Local head/arm motion is followed by parent torso motion, and normals are rotated consistently. Straight-line stance foot movement cancels root advancement independently of environmental motion amplitude.

## Seat variants

All keep `seatPelvis=[0,0.57,-0.04]` and actual garment `seatContact=[0,0.49,-0.04]`, with real planar contact vertices rather than metadata alone.

- standard: shoe support centers `[±0.12,0,0.535]`, seat-to-foot height 0.49 m.
- raised-footstool: shoe support centers `[±0.12,0.30,0.815]`, seat-to-foot height 0.19 m. This was rejected for the actual Taihe throne after the scene-side view exposed nearly horizontal extended legs. It remains only as a reproducible rejected comparison, not the production throne candidate.
- kang-low: shoe support centers `[±0.12,0.04,0.535]`, seat-to-foot height 0.45 m. A dedicated seat-front cloth fold prevents slanted triangle edges from cutting into the kang below its top.
- throne-front-perch: shoe support centers `[±0.12,0.30,0.58]`. The actual Taihe seat-contact point is moved 0.21 m forward within the unchanged chair, from local hall z=9.26 to z=9.05; feet remain fully on the actual footstool at z=8.43. The knee is bent, the adult torso is unchanged, and low cloth remains in front of the chair. This is a visually reviewable candidate, not user approval.

A proposed tucked-foot variant was withdrawn before release: its feet would enter the solid lower throne plinth. Downward support rays alone were not sufficient to detect that volume conflict. No architecture was changed to make a character fit.

## Verified defects fixed

1. Initial loft winding pointed inward. The failing outward-normal regression was reproduced and fixed.
2. Initial shoulders/cuffs had angular joints and overlapping cap artifacts. Curved sleeve centerlines and open cuff trim replaced them; chest motifs were curved to the garment and concave motifs triangulated correctly.
3. A standard seated mesh had no real vertex on the declared seat-contact surface. The new regression initially found zero contact vertices; real flattened pelvis clothing geometry now contacts the seat in all variants.
4. The independent integration reviewer reproduced 0.0675 m of stance drift over 0.3 s with production ambient amplitude 0.7. Physical foot/root cancellation was incorrectly scaled by that amplitude. CPU and GLSL were both corrected and a regression calls the actual production CharacterBehavior function.

5. The cloth center seam used CPU `sign(x || 1)` while GLSL used `sign(x)`. A failing center-seam regression exposed the discrepancy; CPU now matches GLSL at x=0. Motion frames/GIF were regenerated after this correction.
6. A new bounds regression requires at least 0.20 m padding and checks deformed vertices across poses, phases and environmental amplitudes.
7. A kang-front regression initially failed on actual interpolated triangle edges at y=0.489 m. A new fold at seat height fixes the edge-crossing case at LOD 0/1/2 without moving the body, feet or building.

## Actual-furniture evidence

The world export uses `buildCharacterWorld()` and the production `CharacterWorldAdapter`, then extracts the current visible palace mesh triangles in an actor-local region of interest. Triangles crossing the ROI are retained and the camera crops the local context. Material base colors are shown; texture maps are intentionally omitted. No substitute calibration chair is used in the world images. The source world hashes and resolved placements are in `world-seat-bindings.json`.

The final candidate was visually inspected at front/side/oblique angles and closer contact views. This inspection found and rejected the earlier extended-leg pose rather than treating numeric foot support as approval. Independent world checks cover the whole seat footprint, each shoe corner, and raised point-in-volume checks. Those checks establish physical fit for these measured supports, not complete animation/visual certification. The Chuxiu support corresponds to a modern restored display kang, not a claimed Qianlong furniture inventory.

## Remaining limits

**Explicit historical gap, spec 3.2:** No selected Qianlong-period image had been visually checked against the current `consort-daily` / `maid-daily` hair before source freeze. H4 supports a period-boundary discussion, not this specific bun. Avoiding late-Qing large winged headgear and labeling the model an interpretation do not satisfy that requirement. The hairstyle image-to-model evidence gate is **not passed**. See [the hairstyle evidence card](history-reference/hairstyle-evidence-card.md) for the official catalog candidate, image-access result, supported scope and remaining work.

User appearance approval is pending. Browser/GPU shader compilation and full-frame A/B performance remain unverified in this sandbox. These images cannot clear those gates. Full standing-to-kneeling transitions, complete three-kneelings/nine-kowtows, full skinning, exact clothing provenance, contact solving through route turns, and runtime character shadows are not claimed. A low-frame-rate CPU animation clip is not a substitute for real-time device testing.

## Reproduce

Run from the repository root:

    node --test tests/p3c-kit.test.mjs
    node scripts/p3c-render-samples-export.mjs
    python scripts/p3c-render-samples.py first
    python scripts/p3c-render-samples.py sheets
    python scripts/p3c-render-samples.py seats
    python scripts/p3c-render-samples.py animation
    node scripts/p3c-render-world-seats-export.mjs
    python scripts/p3c-render-samples.py world-seats
    python scripts/p3c-render-samples.py world-compare
    python scripts/p3c-render-samples.py world-contact

No browser fallback, denied-path access, external upload or deployment was used by this task.

The 30 MB uncompressed `animation-frames.json` is an obsolete intermediate cache from before the final animation fixes and is excluded from final evidence. Use the freshly exported `animation-frames.json.gz` or regenerate it. Mesh JSON caches are reproducible intermediates, not required runtime assets.
