# R12 rear-palace shared terrace and approaches — candidate receipt

Frozen tested source:69ec2ce069f7ca01dbc167ea0e2be76db2c54376. Subsequent receipt commit changes documentation only. Published Pages remains R9; the separate R10 request is still paused.

## Scope and useful result

- Qianqing Gate: replace the broad central walkable stair/ramp through the imperial stone with two flanking stone-stair strips; retain outside flights and anchors.
- Rear palaces: official nominal shared2m terrace, approximate0.16m door-edge lips, photograph-supported Jiaotai east/west flights, grey-brick and yellow/green openwork low walls; causeway approximately10m wide from the cited museum paper. Kunning visual asset metadata is rebound, with identical BIN geometry/material/navigation bytes.
- Near architecture/collision is retained in full. At240m the tiny glazed modules use a simpler representation; all caps/cheeks remain. No new texture and no global light/exposure change.

## Verified

- 2262/2262 Node tests,0 skipped/cancelled,43.74s. The initial LOD suite found a historical fixture that replaced finish() with an undefined-return stub; the rear fixture now calls the real finish path. Original failure is preserved.
- Real browser controlled routes:132 fixed and236 automatically derived combinations passed on a40. Exact post-LOD geometry/navigation hashes retain these results; they are deterministic controller checks, not normal human playthroughs. Test host requested/favicon.ico404; no model/texture request failed.
- Native east Jiaotai flight: trusted W/S produced ground0→terrace2.16→ground0, with freeMove=false. The150s attempt ended before the final ground screenshot; descent is recorded in actual positions. West flight has CPU coverage only. Gate outer-flight native return was completed on the earlier gate-only checkpoint and retained because its front geometry remains exact.
- Actual corrected near image shows normal green/yellow glaze and closed grey-brick steps. Native LOD observation recorded full near detail and the distant level at the original Taihe viewpoint. The far wall itself is occluded by intervening halls. This does not certify an aerial far-wall view.
- Unchanged original six viewpoints,1280×720 high/DPR1,60 frames each: calls and triangles pass their original+10% limits. Worst triangle margin remains small:961283 versus original874189, +9.96%, limit961607.9. Six FPS-P5 warnings remain, average0.93–1.30FPS/P5 0.52–0.86 on cloud SwiftShader. No physical-device smoothness claim. All six points and cleanup completed2026-10-18T14:18:19Z,494.26s active,0.50s cleanup, owned process group gone and port closed,0 HTTP/application errors.

## Preserved failures and costs

The first glaze material rendered black because the global batcher removes vertex colors. Two explicit existing-style material colors fixed the final merge path; actual image reviewed. The a40 six-point run then exceeded the original Taihe triangle ceiling (964979,+10.39%); retained as failed. Distance LOD corrected this without increasing the ceiling. A subsequent native view attempt dispatched L before the asynchronous welcome layer cleared; the assertion stopped the run. One corrected sequence observed actual welcome clearance before L, kept the assertion, and completed in61.41s with0 errors. No crash or forced overlay hiding was used.

Near rear complex50100 triangles/31 meshes; far46404/31; total resident51972/33. Additional resident LOD storage179712 geometry bytes,1872 triangles,two meshes,shared materials,0textures. Whole near increment versus R11 is4496 triangles; resident increment6368. Rendered savings3696 at far points. Budget is not reset and resident cost is not hidden.

## Remaining boundaries

Photo-fit stair dimensions/count, exact low-wall modules/colors and lip height are provisional. Jiaotai stair-flank low rooms are missing pending reliable footprint registration. Wider rear-palace footprint/roof/body proportions remain inherited estimates. Inherited Taihe imperial-stone/stair pixel issue, R10 rear native lateral route and physical-mobile acceptance remain open. Capture dates of museum photos are unknown; runtime assets contain no museum photographs. Official references and direct image provenance are in SCOPE.md/PHOTO-SOURCES.json.
