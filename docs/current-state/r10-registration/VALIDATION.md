# R10 validation record

Product commit: f2c004389785fa939d6529b744bf445a3eb39a36.
The subsequent 29e7a71 commit changes only bounded regression fixtures and assertions.

## Completed checks

- Build succeeded; original bundle-size warning retained.
- First complete CPU run: 2,191 / 2,192 passed in 40.23 seconds. The single failure was an old whole-hall collision hash in the display integration check. R10 intentionally repositions red columns and opening wall extents.
- After preserving the old physics hash via the explicit R9 fixture, the affected display, R10 retention and R10 integration set passed 23 / 23 in 1.68 seconds. This is composite coverage, not a second complete suite result.
- Focused R9/R10 geometry and source-retention set: 41 / 41. The finite mesh restoration verifies all 149 direct meshes, permits precisely 86 changed rows and rejects unscoped changes. Legacy nested roof meshes remain checked separately.
- Same-camera application render: R9 and R10 use position (0, 11.6375, -10), look-at (0, 16.2, 12), FOV 70 and 1180 × 757 viewport. The red posts behind the throne move away from the centre. Existing foreground gold columns, plaque/couplet registration and overall stylized appearance remain unchanged. No default-camera change.
- One screenshot attempt reached ready but was left without a capture during a controller interruption; it ended at its 150-second cap and is retained as incomplete. A separately recorded capture completed in 23.48 seconds with cleanup and no application/resource errors.
- Original performance test: six original points, 60 frames each, 1280 × 720, high quality, DPR 1. Original calls/triangles +10% limits pass. All six views have exactly the same calls and triangles as R9; no budget reset. Taihe-front remains 155 calls / 960,483 rendered triangles.
- Software-renderer smoothness warning remains at all six points: average 0.96–1.44 FPS, P5 0.48–0.81 FPS on cloud SwiftShader. Historical, nonconcurrent R9 comparison; no physical-device smoothness claim. Performance runtime 460.63 seconds; cleanup 0.50 seconds, owned group exited and port closed.

## Route and native checks

- Original 132 fixed and 236 generated routes passed. Their route descriptors are byte-identical to R9. Runtime 58.11 seconds, cleanup 0.504 seconds. Only an unrequested favicon.ico 404 was recorded; no application error.
- Native keyboard front-entry case retained: from controlled start (0,11.6375,-22), real movement climbed the plinth and crossed the front doorway to z approximately -13.289.
- Native gold-side continuation: from controlled start (6.2,11.6375,4), trusted W input with map open reached (6.198529,11.690154,11.002903), clearing the second gold-column row. Collision and loaded interior were active.
- Native rear-centre case remains unverified: at the controlled start (6.2,11.6375,16.5), subsequent D/right-arrow actions did not produce recorded page movement or KeyD events. No inference of a blocked product corridor is made. The original controlled route matrix does cover this exit.
- Prior wrong outdoor exit attempt is preserved: x=6.2 at z around19.5 encounters the inherited stair stringer; crossing outside also encounters a rear column. The valid route crosses inside at z16.5 and exits down the central rear stair. Geometry was not changed to accommodate the wrong line.
- One continuation launch received no input during controller context recovery and expired at150 seconds. The actual continuation was separately preserved, ended by the owner at138.89 seconds, and cleaned up in0.04 seconds, with no application/HTTP errors.
- Each native case explicitly starts from a controlled position; those starts are not counted as walking. This is partial local native coverage, not a complete continuous tour. Physical mobile-device acceptance remains unavailable.

## Release boundary

Publish as an evidence-led structural preview. Known uncertain outer column stations, roof/wall envelope, hanging plaque/couplet registration, stylized materials and software-renderer smoothness remain disclosed. No claim of precise whole-hall restoration or all-device performance. Main is untouched; R9 Pages remains the rollback.
