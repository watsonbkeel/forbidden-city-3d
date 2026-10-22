# R50 readiness fade: bounded CPU visual reference

Primary image: `readiness-four-frames.png` (2080 × 858).
SHA-256: `7eb34dc5370a524d47763ac1528b4698a3ef96cc71df4cddc1a6766b1e602a4f`.

The image begins when the emperor's binding is ready. It shows the same actual Taihe throne with the character hidden, then appearing at +0.117 s, +0.233 s and +0.350 s. These are sampled simulation offsets after readiness, not a recording of global loading. The additional GIF is explicitly labelled slowed inspection playback: four stops held for 600 ms each, not real-time footage.

## What was verified

- Current emperor `CharacterKit` position, normal, color, rig attributes and index are byte-identical to the original frozen implementation. Its 3,577 expanded triangles exactly match the original cached male mesh. No model substitute, rescale or appearance change was made.
- Furniture comes from the existing actual Taihe scene cache: 5 meshes, 262 triangles. The full cache hash matches the frozen same-source report. Architecture and seat source hashes are unchanged.
- The original `taihe-emperor-01` actor, adapter-resolved transform and seat/foot contact binding are retained. No world reconstruction or new placement claim is made.
- Rasterization applies the actual current `CharacterRenderer.js` 4 × 4 threshold formula per triangle fragment, using bottom-left `gl_FragCoord` coordinates. A fragment is discarded when visibility is less than or equal to the threshold, before either color or depth is written.
- This is opaque screen-door coverage, not alpha blending. A pixel audit verifies each partial frame is exactly the fully opaque final character where admitted, or the unchanged empty-throne pixel otherwise. No extra cast shadow is generated.
- The 0.35 s linear readiness expression and schedule multiplier are checked against the current `CharacterManager.js`. Schedule visibility stays at one, and idle motion is held still to isolate this effect.
- `CHARACTER_ROLLOUT_APPROVED` remains false. Female appearance and historical approval are not inferred from this reference.

## Separate existing CPU timing evidence

`timing-reference.json` records the exact source files and hashes, and verifies that their source-input hashes still match the current code.

- High setting: emperor first ready at 1047.921408 ms; all 38 ready at 7919.793201 ms.
- Low setting: emperor first ready at 995.343824 ms; all 38 ready at 8445.183161 ms.
- These runs use a nominal 16.667 ms CPU timer. The character then uses a 0.35 s simulation-time fade. Do not present a calculated sum as a measured browser-visible time.

The timing values are not GPU timing or complete application frame time. The visual does not depict a live NPC loading HUD and is not complete scene-loading footage.

## Limits

This is CPU software rasterization, not a browser or GPU screenshot. It shows a cached local palace crop with base colors; textures, GPU material lighting, and idle animation are not reproduced. The visible golden furniture and accessory silhouettes are retained actual cached triangles, not redesigned furniture. This does not pass appearance, seating-style, female-history or full-device performance gates.

## Reproduce

From the readiness worktree, first run `node scripts/p3c-render-readiness-export.mjs`, then run `OPENBLAS_NUM_THREADS=1 OMP_NUM_THREADS=1 MKL_NUM_THREADS=1 python3 scripts/p3c-render-readiness-sample.py`. The exporter requires a sibling frozen r50-character-system checkout for source comparison and provenance; it uses the local C1 cache when present, otherwise that frozen cache. It never builds the palace world.

The two new scripts only write inside this new evidence directory. No production, candidate-05, old C1, browser permission, network, dependency or credential changes are required. Existing candidate and C1 images were not overwritten.

`readiness-provenance.json` contains source and per-attribute hashes and the retained binding. `raster-validation.json` contains the discard matrix, pixel checks, frame statistics and output hashes. `readiness-source.json` is a regenerable expanded mesh/cache intermediate and is intentionally excluded from the packaged tree. Run the exporter first to create it locally before rasterization; do not overwrite already reviewed images. The frozen original SHA and optional exact local Git recovery command are recorded in `../report-packaging-manifest.json`. A new export has a different createdAt, so its file bytes are not claimed identical to the historical export.
