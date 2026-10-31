# Proposed bounded visible-ground entry — 2026-10-31 19:02 UTC

Status: DESIGN ONLY; not implemented or approved as a runtime installation. Current parent is 3b2d95ae; the separate owner-index optimization has its own 1854 freeze/review. Original complete-route failures and internal traversal/stop rounds remain immutable.

## Goal and non-goals
Close the next physical gap: move a real FirstPerson from the existing visible local test-ground top through each entry ramp's actual zero-height north edge, and back to that ground, with full .5 m footprint and real body/vertical state. This is still the engineering contact rig, not the actual Environment, pavilion entrance, masonry, relocated southern wall or accepted architectural route. Do not install owners in PalaceBuilder/World. Do not alter FirstPerson, shared clocks, radii, damping, old assertions or implicit-floor rules.

## Approaches
1. **Recommended: explicit ground witness plus two limited real-face subregions.** Authenticate the existing closed test-ground box and its real CM collider/flat support, but permit only two north approach subregions to participate in this local contact graph. The two authority patches create no additional mesh or CM rows. The new ground-entry fixture must first instantiate/register the pre-existing test-ground module: relative to the current rig-only internal16 fixture, that is explicitly +1 real visible mesh, +1 ordinary collider, +1 box walkable. This is not a zero-physical-delta comparison. No invisible floor or raised support is created. Small bounded implementation, honest finite test domain.
2. Whole ground face plus general multi-level support-branch selection. Desirable later, but simply adding its rectangle to the existing connected-component union would fill absent elevated necks/receivers from below. Correct arbitrary overlap, partial support, landing and release require a larger state/geometry design. Do not substitute this shortcut for (1).
3. Treat implicit getGroundHeight=0 as ground or add an invisible entry strip. Rejected: no actual visible owner/physical witness and can conceal gaps.

## Proposed immutable fit and coordinate contract
All inputs remain WUMEN_LOCAL_XZ; identity world transform only, as in the current rig. The existing test-ground is 220 x .25 x 80 with top Y=0 and bottom=-.25, spanning X[-110,110], Z[-40,40]. Its size/elevation are engineering experiment values, not surveyed palace ground.

For each existing independently read east/west entry rectangle e, authorize the subset:
`X=[e.minX,e.maxX], Z=[e.maxZ,e.maxZ+2], Y=0`.
The 2 m length is an explicit experiment authority window, not a physical wall, source dimension or inferred historical apron. Its north/side boundaries are not colliders. A route attempting unsupported/partial contact at those boundaries remains a failed/unsupported diagnostic, not a claimed real barrier or release-to-air solution. The original north start at e.maxZ+1 has .5 m body-footprint margin on this witness. No physical registration is created for either subset; both are supported by the single newly instantiated ground witness and its one real collider/one real flat walkable.

The only new graph edge is the actual full-width common segment at Z=e.maxZ and Y=0. Positive-area overlap with any ramp rectangle is forbidden. The two ground subregions do not join each other. They cannot contribute coverage under outward/return/neck/receiver pieces. Validate bounds against the actual ground top and separately against fixed authored fit, not against caller-supplied extents.

## Authentication and lifecycle
Proposed explicit optional ground-owner argument at registration; old calls retain exactly their previous contract. An opted-in registration records the actual ground Mesh, geometry/material identity, effective ancestor membership/matrices, its ordinary collision row and cloned `type:box,rescue:false` support row, and the fixed approach IDs. Ground-free registrations must not acquire approach authority.

Reuse the reviewed ordinary rendering contract, with an independently constructed canonical BoxGeometry reference (including index, all attributes/groups, bounds and full draw range). Preserve actual renderer execution-flag and material-template checks; never authenticate merely via bbox. Lock the complete allowed physical row shape/hidden-field semantics, original record identity and tags. Validate the body/flat top is exactly the actual box, not a replacement hidden ramp.

Removing/hiding/moving/replacing ground after registration must invalidate the opted-in binding; its expected domain cannot shrink and return OUTSIDE to implicit zero. Revocation/rebinding uses the existing distinct opaque generation. No mutation of CM arrays, ground, original ramp rows or source objects by validation.

## Motion/handoff
Use these qualified top-face patches only after full live authentication. The current continuous authored-height branch and exact XZ union/path partition rules remain; zero-height junction is explicit and sweep remains actual piecewise XYZ. Keep .5 m radius and <=.25 m accepted substeps. All raw body/water/boundary/actor constraints still run. Do not add max-height rescue or ground anywhere under high gaps.

Keep the current strict accepted-chain/token lifecycle. A mixed legacy/outside segment still terminates authority for the rest of that getValidPosition call; do not silently resume it. The first experiment starts and stops inside the authenticated approach window, not across its outer arbitrary boundary. Air/jump/true outer-edge release and stationary partial-support semantics remain unimplemented diagnostics, separately disclosed.

## Required TDD/evidence before any success claim
- Old no-ground registration cannot authorize a foot outside entry; first source/contract RED retained.
- Canonical ground witness positive; missing real mesh/collider/support, wrong owner, duplicate row, moved/hidden mesh, draw/renderer/material drift, unsupported world transform, floating or sunk top, altered fit and swapped generation reject.
- Fixed approach bounds/edge match, no area overlap; duplicate-origin or omitted transform reject. Ground-under-neck cannot satisfy missing neck, receiver, raised lane or high stationary contact.
- Exact seam transition in both directions at .5 radius, walk/run and 10/60Hz with real FirstPerson and unchanged Collision inputs; continuous foot/ground height, onSupport true, no air, zero vertical velocity and raw body collisions, full-footprint every frame and terminal stopped 1 second.
- Start e.maxZ+1 on actual ground, use same internal waypoints and receiver test blocks; save this as a new ground-entry successor, not overwrite the old strict 0/16 or internal-only results. No per-frame setPosition, velocity clearing, new clock or test-only physics proxy.
- Ground removal/wrong ID and missing neck/receiver must cause real failed route/diagnostic; not a permissive null fallback. Add near-edge/partial footprint and binding removal during stationary validation.
- Re-run original local tests, 920-record noncandidate A/B and 55 legacy control tests; review all changed inputs and raw traces independently. A successful local entry test still does not authorize whole-world installation or arbitrary ground release.

## Decision gate
Parent/reviewer must confirm this bounded witness approach before implementation. Then write the precise implementation plan and run source-specific RED before adding code. Architecture/source joints and full World/full-suite/build/GPU gates remain open regardless of this result.

## Revision note
This 19:02 successor preserves 18:56 unchanged and corrects fixture counts after independent review: the internal16 fixture contains no test-ground. Reusing its module is not equivalent to already having that entity in the rig. The new visible-ground fixture adds exactly one real entity/collider/flat support; the two authorization windows add none.
