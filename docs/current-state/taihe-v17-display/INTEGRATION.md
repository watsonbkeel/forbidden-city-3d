# Taihe display-pair integration: isolated CPU candidate

This is a coarse, source-informed implementation, not an exquisite or exact restoration. It is not an accepted release. No browser, server, GPU, render, adapter reseal, publication, Pages update, or remote write was performed. The unresolved V16 `tvc04` page-crash still blocks runtime acceptance.

## Bounded implementation

Base: `f7400fdae91644130b253beab42e3e5fa72d9a08`, retaining the reviewed V17 column surfaces and all fourteen place-information cards.

- Eight translated assemblies: paired elephants/vases/open high stands, luduan/low stands, indoor cranes/rock-and-wood stands, and provisional incense cylinders/supports.
- S additions: exactly 3,798 triangles. Complete decoded S: 12,128 triangles in eight original material batches.
- Fallback additions: exactly 480 triangles, including all 26 explicit reverse-sheet faces. Complete production fallback: 1,558 triangles in eight original material batches. There is no fallback display triangle headroom.
- All 8,330 original S oriented triangle positions, normals, UVs and materials survive exactly. Node transforms, material order/properties, atlas and original semantic inventory also remain exact.
- Original fallback position/normal/UV prefixes remain byte-identical after the real material merger. Original material identities/properties/sides, physics snapshot and permanent architecture are unchanged.
- Existing materials are reused. Fallback gold/darkGold retain DoubleSide; the remaining materials retain FrontSide. No side, shader, color, atlas, lighting, profile, anchor, camera, route or collider change is introduced.
- New fallback geometry is appended before the existing owner-marked merge. Existing atomic S/fallback replacement and cleanup own the entire integrated representation. CPU lifecycle tests assert 1,558 fallback and 12,128 S triangles through transition/cancellation/rollback/unload paths.

## Source and approximation boundaries

The exact R2 source manifest is retained at `assets-src/interiors/taihe_display/approved/artifacts/SOURCE-MANIFEST.json`, SHA256 `d2653431547b13678f2ab278a1067cbff894aec21665307b5584dec6edc007f9`. Final standalone review receipt: `dbb654c3de858629ce7f34289c0bbf0a5f0025cda878dfc01f6658cba12c38b2`.

The three reused pure-Python mesh/flat-attribute modules and approved source notes/exports are unchanged copies. Historical manifest paths are provenance data only. Rebuilding or testing does not require a predecessor workspace. The portable contact guard is derived from the reviewed R2 guard with only its reference-root binding changed to the current repository; source checks retain 1e-8 tolerance. Actual decoded-coordinate checks use a documented 2 micrometre float32 tolerance, and preserve negative detached-limb, neck, beak, winding, reverse-sheet and roof-disk probes.

The museum [Taihe building entry](https://www.dpm.org.cn/explore/building/236465.html), [2014 conservation account](https://www.dpm.org.cn/classify_detail/180964.html), and retained source notes support the furnishing families. The [1995 crane account](https://www.dpm.org.cn/Uploads/pdf/1527/T00040_00.pdf) describes a 1992 restoration and supplies crane dimensions; it is not a present-day survey. The [incense-cylinder paper](https://www.dpm.org.cn/Uploads/File/2019/02/22/u5c6fe8635c254.pdf) supports a general morphology family, not exact identification of the current Taihe pair.

All x/z placements, poses, stand details, non-crane dimensions, decoration and present-day registration remain authoring estimates. Crane light enamel uses inherited muted pearl rather than calibrated white; green fields reuse inherited teal. Incense-cylinder appearance and support details remain especially uncertain. Supports touch the modeled dais at hall-local Y=2.06, not a new museum measurement. No museum imagery or downloaded fonts are runtime assets.

## Normal and coordinate preservation

The source intentionally shares indices between opposite sheet faces. `flat_attributes` expands each face to independent vertices. The fallback module stores compact local little-endian float32 position/normal data, generated from that same source, with no runtime fetch. It never runs indexed normal averaging or welding.

S faces are appended after the original architectural material merge, into each original batch's coordinate frame. This matters for the translated original teal throne batch: naïvely rebaking it would alter twelve original triangle coordinates. The bounded append retains its transform and original raw attributes, and applies the inverse batch transform to the additions. Tests separately reconstruct scene-space positions of all added triangles, so incorrect teal translation cannot hide behind raw-coordinate equality.

The approved source has unused construction vertices. Decoded contact reconstruction drops only vertices not referenced by any triangle, preserves the order of used vertices, and never substitutes source coordinates for missing compiled geometry.

## Regeneration and reproducibility

Run from the repository with its regular dependencies installed:

- `python assets-src/interiors/taihe_display/generate_fallback.py`
- `blender -b -P assets-src/interiors/taihe.py -- /tmp/taihe-display.glb`
- `node --test --test-concurrency=1 tests/taihe-display-integration.test.mjs tests/taihe-column-surface.test.mjs tests/taihe-core-asset.test.mjs tests/taihe-core-atlas.test.mjs tests/taihe-core-loader.test.mjs tests/current-state/taihe*.test.mjs`

Blender was used headlessly for mesh export only. The compact fallback module regenerates byte-for-byte, including from a relocated source tree. A relocated Blender export reproduces the entire glTF JSON, every non-index byte and all 12,128 oriented triangle attributes exactly. **Binary GLB identity is not deterministic:** 2,050 bytes differ solely in the pearl index accessor; 630 triangle sequence positions differ between these two builds. Against frozen V17, seven materials retain original triangle order, while 724 of 824 original pearl triangles occupy different sequence positions. This is disclosed separately from exact geometry/attribute preservation. A proposed global index-sort experiment was removed; no canonicalization, shared exporter change or performance waiver is retained. The checked-in content-addressed asset is the frozen candidate.

Frozen S SHA256: `7c41b735b90f1bb957bdb89b301bd6e8bd8c8f49ac04fa2fb8f624e2cdcce330` (889,364 bytes).
Fallback generated-module SHA256: `9f581400cc6053186d98c1b34353b06853b23fa677fb8d5c8d79a727e22e953c` (46,754 bytes).

## Verification and limits

The 123 focused tests passed before the discarded order experiment. One serialized integration-stage aggregate run passed 1,576/1,576 across 89 files. The order experiment began near that aggregate run's end and its complete input interval was not hash-sealed; that count is integration-stage evidence, not a frozen-input full regression. All affected source and asset inputs were restored, and the affected exporter/geometry/source tests were rerun afterward. Exact final hashes, post-restoration evidence and the final sealed aggregate result are recorded with the external freeze receipt; this document retains the earlier integration-stage evidence separately.

The repository-subpath production build passed. Existing lint outcomes remain unchanged: Shenwu anchor deviation 11 m against 5 m tolerance, and 23 zone warnings with zero zone errors. These are inherited warnings, not new passes.

Source/CPU checks include actual source correspondence, actual bounds and conservative S/fallback architectural clearance, actual limb/neck/beak contacts and negative probes, finite unit per-face normals, all reverse sheets, original attributes and atlas, material/batch ceilings, source identity, navigation snapshots, and loading/disposal ownership. They do not establish rendered appearance, arbitrary mesh-union/manifold correctness, all self-intersections, present-day historical accuracy, mobile UX or ordinary page stability.

The original six points × sixty frames, +10% calls/triangles failure thresholds and existing FPS warning rule are unchanged. No runtime performance evidence is available for this candidate, including the pearl triangle-order delta. No release or browser launch plan is implied.
