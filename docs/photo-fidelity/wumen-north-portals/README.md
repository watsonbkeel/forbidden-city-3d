# R58-A N2 · 午门三个既有北口券顶

Object: FC-AD4377DF51. Frozen input: 755dd9ac5c6f8a8766c1db3e8e4f8fe17fa142da.
This is a partial, reversible exterior facet. Exterior: VERIFY_PENDING. Whole Wumen, its interior, two lateral routes and the deeper vault are not accepted.

## Source and bounded design

The official north-oblique photo was actually viewed on 2026-10-22:
https://img.dpm.org.cn/Uploads/Picture/2019/12/31/s5e0ad0346e8b3.jpg
Official context: https://www.dpm.org.cn/explore/building/236454.html
The reference visibly shows curved heads at five north mouths. Only the three already existing central openings are in this slice. Neither the apparent two side mouths nor their routes may be inferred into geometry. Photography date is unspecified; the URL's 2019/12/31 path is not a shooting-date claim.

The south photo was also viewed, but its separate N3 canopy facet is not changed in this commit:
https://img.dpm.org.cn/Uploads/Picture/2019/12/31/s5e0aaffe2cc85.jpg
Research image caches remain outside this repository. No source photographs or new textures are in production/public or release packages.

Reference → baseline → change → test:
- Curved masonry north mouths → three rectangular cap/soffit assemblies → two closed masonry meshes per existing opening, not black decals → positive front/rear ray hits, negative aperture rays, actual triangle/body contacts.
- Visible head, deeper tunnel not resolved → old full-depth flat soffit → fit curves only the northern 1.2 m; retain flat section behind local z=17.4 → deeper shoulder ray remains void.
- Existing play aperture → centers [-17.5,0,17.5], widths [5,9,5], cap datums [6.5,8,6.5] → retained exactly; lining crown remains H-0.3, i.e. [6.2,7.7,6.2] → profile guards and real controller crossings.

The semicircular profile, 32 segments and 1.2 m head depth are a discrete low-poly photo fit, not measured vault geometry. Arch spring heights [3.7,3.2,3.7] are derived from those inherited dimensions, not modern survey measurements. All newly occupied shoulder space is above 3 m. The original ground-only body proxies were insufficient for jumping, as the preserved red evidence established. A separate approved repair now adds exactly three north-head broad-phase boxes carrying the actual piecewise-linear underside, with exact narrow phase and upward limiting in owner-controlled shared code. No arch shape is raised, no whole-aperture AABB is treated as solid, no new elevated support or path is introduced. See OVERHEAD-REPAIR.md for the exact boundary and integrated local tests.

## Interfaces and ownership

New production file: src/scene/palace/special/WumenNorthPortal.js.
- wumenNorthPortalProfile(options): pure frozen, identity-guarded fit.
- buildWumenNorthPortal(builder, parent, options): adds exactly two meshes, using shared library materials; does not change colliders, supports, doors or ownership arrays.
- registerWumenNorthPortalOverheads(builder, options): appends exactly three immutable world-space north-head shapes; no walkables or geometry changes. OVERHEAD-HOOKUP-PROPOSAL.patch provides the separate owner-only registration. New src/utils/OverheadShape.js validates/clones and queries these shapes.
- Exact owner-only geometry hookup: HOOKUP-PROPOSAL.patch. It replaces only the two flat cap/soffit calls in buildWumen and adds one import. No shared caller was edited by this worker.

Old child count and six cap/soffit slots are retained. Every other object remains exact, including ascent child 27, central upper tower and plaque, both wings, four pavilions, upper slab/supports and all six existing door leaves. South mouth geometry is retained.

## Verification and evidence

- reports/r58-wumen-north-portals/red-original.txt: unmodified red run, 6 actual-geometry failures / 25 passes before production implementation.
- green-focused.txt: focused geometry, same-W negative controls, retention and real FirstPerson controller tests. 24 traversals cover three passages × 10/60 Hz × north/south direction × forward/backward input. They use the real controller and existing Wumen collision/support registrations, not a whole-world build.
- CPU paired images north-oblique-before/after.png and north-center-before/after.png use the actual mesh triangles, UVs and production HD albedo. The base-only isolation is explicit. Camera/FOV/quality/lighting and source hashes are recorded in cpu-capture.json. Images were actually inspected. They are diagnostic only, not browser screenshots or visual acceptance.
- Same-W QA consumer: tests/lib/r58-wumen-north-portal-qa.mjs exports evaluateWumenNorthPortals(W). It accepts an existing scene and CollisionManager, never constructs a world, and rejects absent/hidden/transparent heads or lining, missing left masonry and phantom opening proxies.
- tests/lib/wumen-north-portal-fixture.mjs provides an exact finite historical view of six known old/new meshes. It fails closed on unrecognized head geometry and explicitly recognizes/removes only the exact three candidate overheads for the historical fixture. Missing shape labels, drift, duplicates and partial registration are not silently accepted as baseline. All legacy collider/walkable and material records remain exact.
- Existing baseline ascent geometry-retention suite passed all 7 tests. The existing ascent source-retention suite failed before production changes because its old R30 PalaceBuilder digest is stale (actual cbb83acc…; expected bfd9e25c…). Full untouched failure output remains in baseline-retention.txt. The old assertion was not updated or hidden.

No browser or whole-world run was performed. Shared PalaceBuilder integration, exact integrated-world consumer checks, aggregate regressions, live same-camera before/after and final browser acceptance remain the integration owner's responsibility. Do not label this complete Wumen acceptance.

## Review and resume

Independent review found two QA weaknesses, not a production walking blocker: right-only probes could miss removed left arches or absent lining; retention assertions compared aliased physics. Fixed with mirrored shoulder checks, five lining front/rear samples, negative controls, cloned test objects and pre-build snapshots. The attempted independent recheck hit the agent-thread limit; final 36/36 verification is local, with independent reapproval pending. See review.txt.

Apply both narrow N2 hookups and the shared collision/controller repair through the integration owner, then run the focused suites and evaluateWumenNorthPortals against the already constructed integrated W. Preserve original red and baseline failure evidence. N3 was completed in its own staged commit; no other Wumen roofs are authorized. The final local integration checks and reusable same-W jump driver are documented in OVERHEAD-REPAIR.md.
