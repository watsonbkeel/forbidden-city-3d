# Outer 21: reachable-body, actual materials and inscription correction

2026-10-21, module SHA-256 793100dc22cf801751ffd8a8e93be43d58ccfa17c79d49fe4701f225898a6290. This package does not enable the remaining six profiles and does not claim a complete interior reconstruction.

## Actual fixes

- The existing new tapered columns had a 1.05*r bottom but only r-wide collision. Each individual proxy now encloses its real foot. Eleven first18 identities are affected; the original mesh is unchanged. Exact identities, component counts and before/after signatures are in outer-safety-retention-delta.json.
- Baoxiang, Ciyin and both Wenyuan flights receive visible thin, connected low-headroom guard rails with exact component proxies. These are explicitly MODEL_ACCESS_SAFETY_FIT_NOT_HISTORIC_OBJECT, not historical furniture. They do not fill a room or the entire flight with invisible air boxes. Legitimate stair and bypass routes remain.
- Baoxiang's original 21 treads per flight became 47 fitted treads, with only a 0.05 m bottom extension; the top endpoint, upper landing and original small end doors remain. The earlier 0.65 m trial passed stair travel but blocked the end doors, and was rejected. The final dimensions and tread count are access fits, not measurements or historical step counts. The full-height checks still use production STEP_UP=0.6.
- Baoxiang's existing 44 niche-grid bars and Wenyuan's five ground screen rails receive exact proxies. Wenyuan also receives 51 individual inherited component proxies: 28 posts, six beams, four brick walls, nine door/window pieces and four red-wall pieces. Existing geometry is not removed by this safety correction.
- Wuying and Jingsi each receive four exact thin opened-door-leaf proxies and 12 actual post proxies. The shared Wuying I-plan route must move its two lateral-turn points from world Z=-205.5 to -205.15; X remains 219.5 and 224.5. Wenhua is unchanged. Both-hall triangle/body checks cover all eight movement modes.
- Baoyun keeps the original pale stone inscription field. Only its green border is fitted: vertical frames height 1.54, centre Y=11.08, lower horizontal centre Y=10.34, upper centre Y=11.82. The rejected Y=10.08 border was hidden by the inherited gutter; Y=10.24 still hit the existing roof first. The final four edges pass 36 whole-hall FrontSide first-hit samples. Original pale field, gutter, tile roof and windows stay unchanged; text/carving remain unmodelled.

## Real runtime, not fixture names

The real TextureLibrary calls shared materials `*_material`, unlike the old test fixture. Shared selectors now use actual library cache identity, while kit.ridge and owned custom materials retain explicit private ownership. The ceramics ceiling selector still requires exactly one PlaneGeometry with the original width, depth, horizontal centre and height band; a wrong-sized lookalike is rejected. All 21 implemented identities have actual-library versus fixture position/normal/index/matrix/collider/walkable/room/map/metadata parity. UV tiling and material parameters are deliberately not claimed equivalent. The only normalized mesh-name difference is the library-derived `_material` suffix.

The isolated owner-HEAD clone with this module passes 34 of the 36 tests in the requested R36 lifecycle, R37 vessel, R37 bath and R38 tree files. The original real-build/lifecycle exceptions are gone. The two remaining failures are old R38 full-navigation byte-equality snapshots against pre-R48 state, not silently rewritten baselines. Log: /tmp/r48-real-runtime-four-regressions2.tap.

## Evidence boundaries

The immutable first18 snapshot is unchanged. Seven identities retain every recorded field, eight change colliders only, and three have explicitly enumerated mesh/collision changes. Nine reversible source-change groups restore all 18 original signatures; separate tests reject unapproved colour changes and independently lock actual built navigation (the old profile-navigation hash alone was insufficient).

Static 0.4 m samples are diagnostic candidates, not proof of reachability. Final raw candidates remain at five Baoxiang low-floor and 14+16 Wenyuan under-flight points. These are inside guarded under-flight volume or assume a floor height that ordinary movement does not retain on the flight. Actual entrance approaches, low/high-side attacks and legitimate bypasses are replayed with the production controller. The tests do not claim every arbitrary teleport location or every room point is clear.

Player HEIGHT and STEP_UP are imported production constants. The explicit 0.5 m footprint corresponds to Collision's private production default; no fictional PLAYER.RADIUS was added. Wenyuan primary tests retain 1 mm horizontal/bottom tangency inset and only 1 micrometre at the full head, not the earlier 5 cm top trim. No global clearance or arrival threshold was enlarged.

An unrestricted many-process test invocation terminated one test file without an assertion report; the same complete suite uses --test-concurrency=2 to bound runtime resources. This is a runner concurrency limit, not a relaxed physics assertion. Full results are recorded in outer-physical-checks.json and the frozen package manifest.
