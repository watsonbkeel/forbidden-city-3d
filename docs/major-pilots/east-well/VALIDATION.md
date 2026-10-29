# East-well source-bounded whole-assembly validation
Parent `8ad8c90`; local candidate, not a whole-object historical or GPU acceptance. No push/deploy/main changes.

## What is implemented
One original east-well assembly, four red columns (official span1.94m/height2.43m/diameter.28m), column-bearing diagonal beams plus four outside hanging beams, real open-center eight-sector yellow roof with separate red soffits, eight hips/four pairs of deliberately coarse uncarved ornaments, neutral covered-well stone, fitted low platform and four-side white vase-profile rail. Roof, platform, cover outline and hidden rail closure/entrance remain fits. Color-field beam decoration is not an exact floral painting.
The original x=-48 north-south lane detours on BOTH sides. Visible solid paving provides its own exact physical floor; no invisible rescue surfaces. Four source-dimensioned corner columns are not widened for player access. The .5m-radius player cannot fit the small octagonal opening; a roof landing on its actual rim is intentional, while geometric rays prove sky visibility through the hole.

## Red/fix evidence retained
- Missing original runtime assembly: `missing-object-red.tap`.
- Ground rectangle helper and material registration red tests retained.
- Independent early review found an unsupported inner beam diamond and floating roof/ornaments. `load-path-red.tap` reproduced them; column-centered diagonal plus outside hanging octagon and actual roof contacts pass. Reviewer re-read corrected source and cleared these three blockers.
- `retention-first.tap` initially compared triangulation identities across a deliberately clipped ground polygon (invalid equivalence criterion). Replaced only that ground comparison with complete non-ground exact hashes plus ground height/material/UV ray samples outside the declared cut.
- Those independent samples exposed a REAL UV phase regression on 63 retained bed-edge samples (`retention-uv-red.tap`, `retention-uv-diagnostic.tap`). Local split-box UV coordinates now preserve their pre-cut origin; sampled phase, height and materials pass, not merely ignored.
- First vertical fixtures started inside a column base/shaft and were invalid. Their raw failures remain; final head-impact test starts on an actual unobstructed rail-top support and collides with a real hanging beam.
- `.3` kinematic handoff reproduced legacy early ground lift outside the initial strict domain (`handoff-diagnostic.tap`). A .6m source-ground handoff around the visible paving fixes it WITHOUT changing shared motion math. Full-height census including another1.25m contains no foreign collider/overhead/triangle-support owner; full actual-world routes pass. Not an unverified tiny-domain workaround.

## Verified so far
- Every visible physical box uses final merged F32 bounds. All3,504 curved source faces match final merged visible vertices in BOTH directions;320 exact zero-area provenance faces remain recorded,3,184 retained positive-area faces.60 authored shells are closed with balanced edge winding after F32 welding; split roof exterior/soffit tested together.
- Source/final geometry/private beam material lifecycle exactly once; shared library never disposed or mutated.
- All34 old trees, their instance matrices/geometry/materials, all2,034 GardenBuilder collisions and all old walkables exact parent matches. All other garden zone geometry/physics/map/rooms/architecture match parent. Static non-ground geometry exact; ground outside the explicit cut preserves sampled height/material/UV.
- Both bypasses: actual-world10/60Hz walk/run/jump, both directions, every tick checked against an independent open-triangle body oracle. Actual roof/rim landings and rail-to-beam head impacts10/60Hz. NPC standing/seated/moving cannot become false floors or jump resets. Generic.3/.5 bodies cross all four domain boundaries at ULP offsets and visible paving edges.
- Exact ownership rejects duplicates, mutation/downgrade, injected ground, wrong IDs/domains. Tagged unload/reload and live Environment witness mutation/detach/unbind checked.

## Cost and limits
`cost.json`: new object98 source meshes ->6 merged CPU mesh submissions;3,864 triangles,370,944 final attribute bytes;98 colliders (68 exact triangle-source owners),6 walkables. CPU build~40ms/merge~13ms single local sample, NOT representative performance measurement. Existing GardenBuilder49 merged CPU meshes remain49;266,222→266,240 triangles (18 added from local bed clipping), tree count34 unchanged. Physics exactness has nonzero CPU/memory cost; GPU frame time, visual appearance, draw-call performance and device budgets remain UNMEASURED.
Source panorama itself failed WebGL; only the official roof hotspot-video frame and official exterior/photo/plan were viewed. No historical entrance/cover-shape, fine carving, complete interior panorama, present-day access policy or underground well reconstruction accepted.

## Final terminal evidence
- `target-final.tap`:25/25,0 skipped,23.23s.
- `shared-final-161.tap`:161/161,0 skipped,323.82s, after the fail-closed adapter hardening. Prior full161/161 is also retained; no single-file run substituted for the group.
- `legacy-32.tap`:32/32 navigation/stairs/neighbors,33.60s.
- Three supported bases `/`, `/forbidden-city-3d/`, `/gugong/`: real Vite491-module compilation with `write:false`, public copying disabled; in-memory HTML/entry JS/build-info IDs and source hashes verified. All final runtime input fingerprints rechecked after all tests. NOT an HTTP/GPU/package/deployment test. No bundles written.
- `zones.log`:exit2, NOT green. `zones-comparison.json` verifies all old warnings/errors and Unsupported furniture-domain shape are unchanged from parent evidence; whole world29,487→29,585 colliders and1,339→1,345 walkables match exactly the98/6 added here. Existing Wuying/Shouan clearances and unsupported old shape remain open.
- Old14 dirty report SHA256s unchanged before/after. No old untracked report/assets removed. `git diff --check` passes on source/tests/scripts/docs/data.
- Read-only final reviewer found no remaining implementation blocker after three geometry repairs, then approved the bounded handoff and fail-closed hardening; private whole-object/GPU limitations remain.

### Whole-zone cost, not just isolated-object counts
The complete actual garden ZoneBase with the profile disabled vs enabled:24→26 merged CPU meshes,72,328→76,192 triangles,6,944,976→7,315,920 attribute bytes;795→893 colliders,79→85 walkables. Thus the isolated object's6 meshes are NOT claimed as six extra real zone submissions: shared materials merge, actual zone increment is2. Combined unchanged-category GardenBuilder plus ZoneBase CPU mesh total73→75, triangles338,550→342,432; GPU cost remains unmeasured.

## Rollback
Revert the whole local commit to parent `8ad8c90`; removing only the JSON profile is NOT a full rollback because the ground cut is also part of this atomic change. Do not modify/reset old dirty reports or main. Earlier unrelated failures and unverified regions remain open.

### Scope handoff evidence
Final domain `x[-53,-43.8], z[455.2,464.4]`, .6m beyond actual 8×8m paving. Full-height +1.25m region `x[-54.25,-42.55], z[453.95,465.65]` was measured against the complete world; all98 hits are this new well. Additional candidates+.25/+.5/+.6 were explicitly censused before selecting+.6; none contained foreign bodies. `handoff-fixed-world.tap`5/5 includes both generic.3/.5 edge crossings and original32 actual-world bypass combinations. This is a ground-witness envelope, not an added walk plane.

### Additional source-guard hardening
A dedicated red test found that an ambiguous rebind could throw yet retain its previous ground binding. Only the new EastWell adapter now deletes that binding before throwing; no existing adapter or shared physics math changed. Final target rerun includes this fail-closed path, actual new-boundary outer witness points and strictly zero feet on unpaved dispatch edges. The first shared161 run passed before this one-line local hardening; a final shared run is recorded separately.
