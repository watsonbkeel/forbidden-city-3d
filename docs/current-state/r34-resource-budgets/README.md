# R34 bounded route-material review and resource-budget work

## Status and scope

Base: `1c60d533ee91db20ccde2a9ffb449b8c7b8d0fd8` (R33). This work changes only one runtime file: `src/render/SilhouetteBuilder.js`. It adds exact storage indexing to existing far-zone roofs. It does **not** decimate roofs, delete details, alter near geometry, modify loading distances, change collisions/interactions, recolor materials, or change device quality defaults. No remote push is included.

The baseline was executed independently in a separate copy of the R33 `src/`, `data/`, and `public/` tree. Both JSON reports bind every `src/` and `data/` file by SHA256. Their only product-source difference is the silhouette file. The reporting and decoder helpers are identical between executions.

This is CPU geometry/lifecycle evidence, **not** a visual sign-off, frame-rate measurement, WebGL/GPU-memory measurement, or proof of target-device quality. Local Chromium could not launch under the available sandbox; no screenshots were produced. The public cloud browser also lacked a working WebGL context according to the integration owner.

## Material review: deliberately retained, not claimed finished

Reviewed the actual existing HD `stone_slab.webp`, `wood_column.webp`, and `wall_red.webp` images. These are existing AI-derived assets processed by `assets-src/process_textures.py`, not newly acquired museum photographs or measured material scans. Stone slabs carry visible seams, painted columns show sizable chips, and red plaster has broad mottling. Their current meter-based tiles are 6 m, 1.5 m, and 4 m respectively. TextureLibrary shares images and material instances, uses sRGB colors / linear normals, and all three ordinary defaults are dielectric (`metalness: 0`).

The repeated chips and default normal strength merit rendered review; numeric/source inspection cannot establish a visually better tiling, roughness, or normal amplitude. Therefore no arbitrary global retile, tint, extra geometry, roughness map, or new imagery was introduced. The new courtyard worker was advised to reuse existing shared stone, column, plaster, roof, beam and rafter materials with the original meter UV convention, and never dispose shared library materials from a zone. Route-wide visual calibration remains **deferred/unverified**, not “polished.” Specialized Taihe/Qianqing surfaces and the night worker's lighting are untouched.

## Exact silhouette optimization

Position-only, unlit far roofs previously stored every triangle corner independently. The new code indexes repeated **Float32 bit-identical** triples, preserving the expanded vertex sequence and winding. It does not use tolerance-based welding. Index width is 16 bit through 65,536 distinct vertices and 32 bit thereafter. When indexing would increase bytes, the original expanded representation is retained.

- All seven silhouettes: 2,937,600 → 1,106,976 retained geometry-buffer bytes.
- Savings: **1,830,624 bytes / 62.3%** of silhouette geometry storage.
- Triangles, material, draw range, render order, visibility ownership and shadow behavior are unchanged.
- Silhouettes are `MeshBasicMaterial`, position-only, with no normals generated later. Sharp-edge normal seams are consequently not merged or smoothed.
- Every source zone's geometry stays bit-identical. Silhouettes remain outside BatchedBuilder because their `noMerge` flag is retained.

This reduces retained CPU buffer storage and potential geometry upload size, not draw calls or triangle count. It does not establish an FPS gain. The Map-based indexing creates temporary construction allocations; no startup-speed improvement is claimed.

## Baseline budgets retained by this change

| Permanent builder | Triangle instances, all resident levels | Geometry buffer bytes |
|---|---:|---:|
| PalaceBuilder | 210,859 | 20,474,444 |
| Enclosure | 62,696 | 6,018,816 |
| GardenBuilder | 161,612 | 9,306,048 |
| Environment geometry | 2,300 | 58,888 |
| Total | **437,467** | **35,858,196** |

The garden also retains 4,352 instance-matrix bytes. Permanent totals include hidden LOD levels; “visible” counts in JSON mean ancestor visibility only, not frustum/occlusion/rendered triangles.

| Streamed zone, each full merged representation | Triangles | Geometry bytes |
|---|---:|---:|
| axis-courts | 132,872 | 12,755,712 |
| east-six | 83,244 | 7,991,424 |
| west-six | 64,556 | 6,197,376 |
| ningshou | 74,876 | 7,188,096 |
| outer-east | 33,456 | 3,211,776 |
| outer-west | 78,750 | 7,560,000 |
| garden | 53,656 | 5,150,976 |
| Total | **521,410** | **50,055,360** |

ZoneManager prebuilds all seven zones for metadata/flight-envelope preparation. Unloaded initial zones are therefore **cached CPU geometry**, not absent memory. Initial retained world geometry including all cached zones and all silhouettes changes from **88,851,156 to 87,020,532 bytes**. The routine route explicitly visits Taihe, Qianqing, Chuxiu and returns to the start; each snapshot records loaded IDs, remaining cached IDs, scene geometry and the complete retained inventory separately.

At Chuxiu, after preceding route visits, the candidate retains 63,061,620 geometry bytes across loaded, cached and permanent roots. This is not simply the visible zone budget, and the unvisited Ningshou cache is still counted. The later all-zone snapshot has no cached zones and retains 87,020,532 bytes.

### Render-copy and texture costs, not hidden from the total

BatchedBuilder retains additional copied geometry even after its temporary scene container is detached. The report explicitly calls `begin()` / `end()` and inventories its buffers separately. These allocations are unchanged by the silhouette optimization:

- Initial before neighbor queue: 43,482,488 batch geometry-capacity bytes and 21,248 matrix-texture bytes.
- After initial neighbor queue: 62,297,204 geometry-capacity bytes and 23,040 matrix-texture bytes.
- Chuxiu: 47,472,728 geometry-capacity bytes and 21,248 matrix-texture bytes.
- All zones: 72,727,316 geometry-capacity bytes and 23,040 matrix-texture bytes.

Do not mistake these source/copy triangle inventories for actual draw calls. Full allocation pressure includes both original and copied buffers. JS objects, driver overhead, decoded artwork/GLB textures, IBL, shadow maps and postprocessing targets are not quantified here.

The shared HD manifest has 43 image files totaling 6,999,118 download bytes. A manifest-dimension RGBA8 base-level estimate is 185,581,436 bytes (not an observed allocation; mipmaps excluded). The corresponding SD files total 1,813,978 download bytes and estimate 47,079,424 base-level bytes. This supports keeping HD/SD tradeoffs visible, **not** selecting a new device default without real hardware tests.

## Optional interiors, actual decoded/installed resources

A test-only adapter runs the exact bundled, SHA-bound Draco decoder in Node for the three compressed legacy models. It uses the same unique-ID attribute/index extraction as Three r162's decoder path. Runtime loader/decoder code is unchanged. All six files are actually parsed and installed by InteriorLoader, not merely read from manifest claims.

| Interior | File bytes | Resident triangles | Visible triangles | Geometry bytes |
|---|---:|---:|---:|---:|
| Taihe | 1,946,960 | 17,938 | 17,938 | 2,363,812 |
| Qianqing | 456,628 | 5,732 | 5,408 | 437,088 |
| Huangji | 173,012 | 24,096 | 24,024 | 1,589,952 |
| Yangxin | 63,044 | 8,852 | 8,720 | 582,192 |
| Kunning | 289,196 | 4,752 | 4,656 | 252,704 |
| Cining | 46,616 | 7,922 | 7,874 | 607,464 |

Resident counts include hidden collision/walkable proxy meshes where retained. Taihe installation also replaces its permanent fallback; these optional rows are incremental asset inventories, not a claim that both alternatives render together. Models were parsed locally; browser network, worker startup and actual texture decode/upload remain untested.

## No hidden loading loss or ownership regression

- Every one of seven real ZoneBase builds was unloaded/reloaded. Complete collision, walking-surface, room and map-item serializations and full resource budgets match before/after.
- Each removed zone has zero remaining collision/walking tags; all its geometry emits exactly one dispose event; zero shared library materials are disposed.
- Far silhouettes become visible on unload, hidden on load, and are each disposed exactly once by final ZoneManager cleanup, not by a source-zone builder.
- Each optional model loads, unloads, reparses/reloads and unloads again. The second installed budget matches the first; full navigation serialization returns to its baseline after both unloads. Installed geometries emit exactly one dispose event.
- Seven actual zone silhouette tests independently expand the original transformed roof triangles and compare their byte hashes to the indexed result. Source geometry hashes, all flags, material and draw semantics are checked.
- Existing R33 strict source/scene bindings were not edited or weakened.

## Reproduce

`node tools/r34-resource-budgets.mjs <output.json>`

This is also suitable for the final combined tree: it derives its counts from current builders/assets rather than these frozen R33 values. It throws if any lifecycle invariant fails. Compare the final combined result separately because the courtyard/interior/night work intentionally adds other resources.

`node --test tests/r34-resource-budget.test.mjs tests/r34-silhouette-storage.test.mjs tests/r34-silhouette-zones.test.mjs tests/r34-cpu-draco.test.mjs tests/r34-resource-evidence.test.mjs`

The evidence test checks the frozen, source-bound baseline/candidate receipts for this isolated optimization. The all-zone and decoder tests execute actual current geometry.

## Follow-on priorities, intentionally not expanded here

The larger measured costs are batch geometry copies, initial prebuilt zone geometry, shared HD image dimensions, and garden geometry. Changing them safely requires integrated flight/LOD/loading review and real-device WebGL measurements. This small optimization deliberately does not discard caches needed by flight envelopes, remove near detail, silently lower texture quality, or claim route-material completion without rendered evidence.

## Isolated validation receipt

- Focused new tests: 19/19 passed (resource accounting, exact indexing boundaries, all seven real-zone roof equivalence, three real Draco assets, independent receipts and lifecycle checks).
- Production Vite build passed. Existing large-chunk advisory remains; no new chunk-policy change was made.
- One isolated current-state run completed: 1,150 passed / 4 failed in 307.5 seconds. This is **not a green aggregate**, and no aggregate rerun was started while integration workers were active.
- `qinan-hall` used non-indexed position count as triangle count; a separate tiny test-only correction retains its exact triangle expectation and three roof-intersection checks while reading the index count when present.
- `r33-scene-retention` and `taihe-core-geometry` explicitly reject the newly changed silhouette source SHA through strict old-epoch guards. Final combined regression binding must name this exact source revision; these guards were not weakened here.
- `r32-crest-scene-retention` failed at file level without a specific assertion in the aggregate log. Its cause is unclassified and requires the final owner’s isolated verification; it is not claimed to be a source mismatch or an unrelated pre-existing failure.
- The complete aggregate output, focused output and build output are retained beside this note. Final combined resource capture and authoritative regression run belong after all product changes are integrated.

### Supplemental retained scene objects and final capture scope

The architectural snapshots and architectural batch-copy figures above exclude the helicopter and optional historical sky lamps constructed separately by `main.js`. The runner now inventories these explicitly under `supplementalResident`: helicopter 1,816 triangles / 174,336 geometry bytes; disabled-but-retained sky lamps 1,632 triangles / 85,696 bytes. Together they add **3,448 resident triangles / 260,032 geometry bytes**; their additional render-batch copies are not included. No full-app allocation claim should be inferred.

Environment capture now executes its real `init()` sequence with only the GPU PMREM setup overridden. This captures geometry added by future Environment initialization (including the combined night work), not just the old ground/sky methods. A future fixture created separately by `main.js` still needs explicit reporter integration. These stored JSON reports remain the isolated R33-versus-silhouette candidate receipts, not the final combined R34 tree; the dynamic runner must be rerun on the final combined source/assets.

A separate review found that the existing `Environment.dispose()` directly disposes library-owned ground/road materials before `TextureLibrary.dispose()`, outside the tested zone-unload boundary. This verified ownership issue was handed to the Environment/night owner; it is not silently claimed fixed by this silhouette commit. Zone/shared-material and optional-interior lifecycle receipts remain valid for their stated scope.
