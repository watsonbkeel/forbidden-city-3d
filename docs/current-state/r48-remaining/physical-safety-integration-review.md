# R48 bounded physical-safety corrections

These checks concern model navigation and actual rendered triangles, not a survey or browser/phone visual acceptance. Tests use the production 0.5 m player radius, 1.7 m height and original step/movement rules.

## Open residential door leaves

The inherited shared hall rendered opened lattice leaves without thin collision boxes. A normal front-entry route followed by a lateral turn reproduced penetration at both 10 and 60 Hz. Only the ten R48 residential replacement profiles now add each actual transformed leaf's exact thin box. Meshes, poses, main passages and the shared hall primitive are unchanged.

- Original two-mode reproduction changed from failure to correctly stopping at the visible leaf.
- Eight movement variants verify physical blocking; existing entry and lateral routes remain covered separately.
- A 0.4 m ground grid checked 20,117 positions across eleven profiles. No visible-body penetration remained beyond a stated 1 micrometre Float32 tangency exclusion. Blocked-space samples are not automatically classified as air walls.
- Previous physical signatures are recovered only after separately verifying every new leaf box against its real mesh and reversing those exact additions. No blanket collider omission is permitted.
- Original R34 B/S continuous route suite remains 98/98; all 63 automatic routes pass four movement modes.

## Existing Huangji asset pillars

The unchanged aligned GLB's original four column proxies did not contain parts of their visible carved decoration. The same normal-entry penetration was independently reproduced on R47. The current loader adds 48 pillar-component envelopes, each derived from decoded triangles clipped to a 0.25 m vertical slice. The frame is applied once. A local 5 cm lower margin protects the head above the production body's eye clearance.

The four pillars are treated separately from the throne and other gold material. Original asset bytes and proxies remain; all new boxes share the layer's unload tag. Exact component-bound regeneration, repeated loading, unloading, failure and cancellation checks preserve ownership and remove every tagged proxy. Existing six-door routes remain passable.

These are conservative boxes, not mesh-precise collisions. Four sampled corner positions have approximately 2.5–18.8 cm clearance to the closest decorative surface. The verified adjacent passage remains usable. No claim of precise carved-surface physics is made.

## New NingShou structures

Solid tapered-column proxies now contain the actual visible bottoms. Short segment proxies cover Changyin's real sloping timbers and guards instead of a whole staircase air box. The original unsafe-entry paths now stop at visible obstructions; retreat and nearby legal passages remain usable. New Yangxing upper-room supports are plain fitted beams and two ground-bearing corner posts, not claimed historical column counts. Their floor-to-beam-to-post contact and room-door circulation are separately checked.

These targeted outcomes do not replace the final same-version complete regression. Earlier failed checkpoints remain recorded as failures rather than being re-labelled as successful runs.

## Rear-door circulation after solid-leaf collision correction

The first integrated collision correction exposed a real conflict in Yongshou and Xianfu: the inward-open rear leaves left only about 0.516 m between a leaf end and the retained screen. The earlier rear-passage tests had crossed a visible leaf without a corresponding collision proxy. Neither the leaf proxy nor the retained screen is removed. Only the two existing rear leaves of each hall are reflected outward about the unchanged rear wall, with their actual thin colliders regenerated. This is an explicitly fitted viewing pose, not evidence of a historical opening direction or current visitor access. Original continuous north/south and neighboring rear-hall routes are replayed unchanged, and real TextureLibrary builds are used for additional full-height leaf/screen triangle checks.

## Production material-library compatibility

The lightweight geometry fixtures name library materials with their key, while the production TextureLibrary adds a material suffix. Name-only identification could therefore leave old shell pieces in the production scene even when a fixture correctly removed them. The residential and retained local adapters now use the actual cached material references; the regional replacements are being checked against the same contract before final acceptance. A complete 122-hall physical/material-key/navigation comparison and separate full central-palace and garden builds guard this distinction. This repairs inherited replacement adapters as well as this round's code; it is not a new historical reconstruction claim or a change to texture-library naming. GPU rendering and texture appearance remain unverified.

### Fixed-route consumer closure

The fixed 33-route consumer also used the old early sideways turn through the opened Wuying door leaf. Its original 10 Hz walking replay failed at the preserved route `熙和门→武英门→武英殿内`. Only that route's two turn points moved north by 0.35 m, from world Z −205.5 to −205.15, after clearing the real door leaf. The other 32 route objects and all 33 route names remain exact; the captured pre-change fixture and a dedicated inverse comparison retain this boundary. The separate automatic route set keeps all 63 names, with 50 exact route objects and 13 explicitly revised approaches.

Using the production TextureLibrary material factory and caches with offline texture placeholders, all 33 fixed and 63 automatic routes passed at 10/60 Hz, walking and sprinting (eight replay tests). This checks those actual traversal paths; it does not certify every room point or resolve the separately tracked Ning-shou real/stub geometry discrepancies.

The intermediate aggregate's one SIGKILL file was rerun unchanged in isolation and completed 26/26. The cause of the earlier process signal is unestablished; the interrupted aggregate entry is not rewritten as a pass.

### Production material identity correction

The production TextureLibrary names cached materials with a `_material` suffix. Several replacement adapters had incorrectly matched the lightweight test library's bare display names. This could leave old rendered walls, ceilings or columns in place despite replacement collision geometry, or prevent the selected roof colour and nondegenerate surface processing from executing. Passing the earlier stub-only tests and Vite build did not validate this production path.

The affected adapters now recognize the actual cached material objects. The library's naming, cache, ownership, material parameters and texture-scale APIs are not changed. Offline tests replace only image data with inert textures; they do not certify texture artwork, UV appearance or GPU rendering.

The complete current 122 hall builds plus merged axial palaces and five garden pavilions now pass 124 physical/semantic real-library-versus-stub comparisons. Ning-shou adds 57 checks: all 19 original stub outputs exactly retain the frozen 996d attributes (including UV), material values and navigation; all 19 production-library raw and merged outputs agree physically and semantically, with borrowed materials disposed only by their owning library. Combined: 181/181. The original seven Ning-shou mismatches and earlier six retained-hall cleanup defects remain recorded as real production defects, not historical snapshot exceptions.

### Wenyuan threshold and pond-edge closure

A full-height body check starting on actual courtyard ground exposed a retained R47 entrance threshold: its top is 0.72 m, while the old platform first supports the feet only 0.35 m before the threshold. The 0.5 m-radius player therefore touched the visible threshold before stepping up. Successful arrival alone had missed this contact.

The final local access fit adds one visible 0.09 m-deep stone tread at the actual north bridge end, plus one strictly stone-backed support region. The original threshold's unsurveyed depth is reduced from 0.30 to 0.22 m by retreating its front 0.08 m; width, height and rear edge stay fixed. This provides 0.58 m between the support edge and threshold front. The original platform, door leaves, pond, bridge and route points remain unchanged. These dimensions are reversible model-access fits, not historical measurements.

The initial 0.30 m tread proposal overlapped the actual static bridge and was rejected; the subsequent 0.09 m tread alone had zero radius margin and was not accepted. The final integrated test passes 169 cases: actual stone/cap support rays, no positive-volume bridge/water intersection, and 168 full-world entrance round trips covering seven lateral offsets, three small longitudinal offsets, 10/60 Hz, walking/sprinting, and forward/backward movement. Independent revalidation remains separate.

An independent audit also found that the first Ning-shou material test's purported merged comparison traversed the original root after discarding finish()'s returned group. Those 19 assertions did not establish merged equivalence. The independent replacement comparison explicitly checks the returned finished groups: all 124 hall/central/garden cases pass, and the original Ning-shou stub fixture was regenerated independently from 996d and matches exactly. The test defect is being corrected without changing production geometry.

The Ning-shou test defect is now corrected: all 19 merged checks assert that finish() returns a distinct group, the returned mesh count decreases without triangle loss, compare that actual returned geometry, and dispose the returned group's geometries exactly once. The corrected 57-test suite passes in integration. The earlier purported merged test is retained in commit history as insufficient evidence, not retroactively renamed a valid check. The actual Huangji asset/fallback/column-safety contracts also passed 9/9 on stable source. Their explicit lightweight-library fixtures were not changed by an environment flag, so this rerun alone is not a production-material lifecycle proof. A separate full-zone case now constructs the actual production TextureLibrary explicitly and repeats the same loading, cancellation and unload assertions; its result is recorded separately.

The two explicit whole-zone Huangji lifecycle cases now pass 2/2: one retains the original lightweight fixture, and one directly constructs the production TextureLibrary. Each decodes the real unchanged GLB, repeats three successful load/unload cycles, verifies cancellation, preserves unrelated merged batches, removes all 53 GLB-tagged collision proxies on unload, and releases the four isolated fallback materials once at zone teardown.

### Preserved flight, directory and night checks

Five complete merged zone flight-envelope tests now run explicitly with both lightweight and production material libraries (10/10), checking every transformed vertex including instances. The original flight operations and safe disembarkation tests, all 159 map-card travel records, and functional night-lighting tests also pass in the targeted run. Combined targeted result: 35/36, not all-green. The sole failure is the already-failing R34 Environment.js frozen source-hash assertion, also present in the R47 historical suite; Environment.js and BeijingDayCycle.js are byte-identical to R47. Its later inverse and mutation assertions remain masked by that first hash mismatch and are not claimed passed here.
