# Subsequent connected-route review (after ddfbd independent oracle)

## Scope correction

The original player endpoint oracle selected actual triangles only in Z421..446, appropriate for the five local rear-court paths, but insufficient for the later Tihe399 → Lijing453.7 connected route. This was found in independent review and reported before full connected-route acceptance. `driver-before-window-fix.mjs` and `window-gap.json` retain the exact gap. The final driver now records `oracleBounds` and expands only this route's relevant West-six region to X74..116, Y0..3, Z398..455. This does not invalidate the original local five-path result or the independent full R118 character oracle, both of which used appropriate separate coverage.

## Limited contact changes: 3cf source

Runtime `3cf969f6115745cde365ddaf72dd7236705f676711a789d1a8a13dca79118d08` adds two closed-ID corridor ramp registrations and one closed-ID main-floor surface:

- Original visible corridor ramp has actual F32 heights .46→.61; old center walkable .45→.60 was not enough for the full square foot at its leading edge.
- The two ramps are validated as the exact four positions/six indices and identity frame. Adjacent original box landings are compared against all 36 canonical non-indexed positions, not just a bounding box/corner set. Temporary canonical geometries are disposed. Scopes are only the original landing X range ±1 and Z419.5..424.
- The existing main floor is the actual two-triangle open sheet at F32(.62), distinct from its .61 slab. Registration compares the exact original PlaneGeometry positions/indices, transforms current world vertices and uses the existing surface solver. No new visible floor, body shrink, STEP tolerance or solver math is added.
- `StairInterfaces` adds only two IDs, and `XiqingRoofSurface` adds only `chuxiu-main-floor` and its specific kind. No general unbounded floor registry was introduced.
- The turn waypoint Z423.65 was geometrically too close to the actual main front-window face around Z424.05 for ±.5 body. It was moved to Z423.50; the wall owner was not relaxed to force passage.

Static review found no new scope blocker. Writer's composite source test covers prebind detach/coordinate mutation/repeated landing faces, bad CM ramp update, unload and re-add. This is the stated CM/source lifecycle contract, not a claim to intercept arbitrary unannounced runtime render-buffer writes.

## Wide route result is not zero penetration

All nine forward/backward/right 10/30/60Hz connected traversals complete. Per route, recorded hit frames are **160 / 474 / 941**, respectively, against inherited Tihe/south-gallery and Lijing surfaces. The actual endpoint oracle is therefore intentionally not all-green; no hit count is discarded.

Independent readback of the two short same-input R120/R123 counterexamples confirms **102 + 61 identical physical poses**, including feet height and airborne state. CollisionManager, FirstPerson, controller clock helper and waypoint driver source files are byte-exact R120. The scenes themselves use their explicit source roots. Old/current hit counts total163/162; the old main-frame intersection disappears in one record without changing the sampled pose. The short route does not constitute an entire old-version connected traversal; it establishes the inherited local defects at the stated sources/positions. See `inherited-readback.py/json/log` and referenced raw hashes.

## Remaining binding

Closed subsequently: fresh final3cf independent 10/30/60 capsule+render oracle runs all completed, source before=after. Each entire routine raw JSON is also byte-exact to ddfbd, but these are new runs, not renamed evidence. The final main-floor owner is consumed by SharedRestNavigation, so the extra dependency was not dismissed as player-only. Independent final render readback confirms all28682triangle rows and15decoded textures exact to ddfbd. See `../r118-support-final-review.json` and `../support-final-geometry/render-readback.json`. No new GPU, mobile, performance or historical dimensional claim follows.
