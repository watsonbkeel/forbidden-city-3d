# Bounded candidate contact provider — proposal, not implemented

Authority: parent17:05 permits isolated provider plus necessary shared entry, not production installation. Existing FirstPerson and ordinary collision body remain byte-identical. No reused StairInterfaces IDs, fake floor, lower body boxes or changed time/follow constant.

## Proven problem
Same real rig gives382 ordinary-body overlap frames after legacy exponential feet smoothing; offline changing only query feet to the actual authored plane clears382. Tightened foot-plane/absent-surface predicates now16/16 RED, including descent. This is not permission to snap arbitrary actors to nearby surfaces.

## Proposed limited entry
- Registration is explicit and absent by default. Bind a CollisionManager to exactly authenticated candidate mesh/surface/body-owner instances and one coordinate transform. Immutable expected fit/source identity separate from runtime registration.
- At `getValidPosition` entry clear any prior pending handoff. Existing substep solver and raw collision queries run unchanged.
- Only grounded player motion beginning with a real supported pose may create a handoff. Airborne/jump/upward velocity and unrelated/non-player motion cannot opt in.
- After existing solver returns, verify its actual final pose, source support and complete accepted contact path (piecewise affine surface boundary events, not endpoint-only sampling). Reject any absent support interval, discontinuous height, wrong/removed owner, unsupported footprint or invalid transform. Check actual raw body and registered providers, not merely names.
- A valid handoff carries exact final surface feet scalar and source IDs for this single movement call. `resolveFurnitureVertical` may consume it only at the exact returned XZ with the same grounded state; otherwise return to the original FurnitureMotion path. No stale or alternate-position replay.
- Scope absent or path outside authenticated surfaces: original calls/return values remain unchanged, no source mutation, no hidden rescue. Stationary and jump branches need separate positive/negative tests.

## Ground entry/exit
The current rig starts on CollisionManager's implicit zero ground; that is insufficient provenance for a newly authoritative handoff. Add an explicit **visible test-ground slab with top0** outside the ascending solids, or authenticate the real Environment ground in eventual World. It is test ground, not hidden elevated rescue; any slope/neck/landing removal at height must still fail. Do not advertise rig ground as real city integration.

## Unresolved implementation choices to review before hook
1. Validate final straight-segment coverage only as conservative restriction, or record actual accepted substeps? Actual slide path is preferable. Do not infer a curved safe path from final endpoints.
2. Full .5 body-footprint ownership across seams vs point support: union of actual footprints required; no tolerance bridging a missing interval. Height/body clearance still uses raw collision policy, not invented full-feet triangle body semantics.
3. Exact ownership authentication should include source geometry bytes/matrix, live registered ramp record, and all associated internal body boxes; scope labels alone insufficient. Mutation/removal after registration must invalidate rather than use stale cache.
4. Contact provider must not turn downward jumps, leaps across missing pieces or out-of-scope ordinary grounds into magnetic attachment. Test those before route GREEN.

## TDD / review gates
- Preserve untouched baseline tests and all16 strict RED routes; separate interior-waypoint diagnostic exists (also16 RED). Original seam-edge path is retained, not silently replaced.
- Unit RED: wrong/duplicate IDs, shifted geometry, double/missing transform, detached support/body, post-registration deletion/mutation, stale handoff, airborne/jump, route gap, foreign call, no registered scope.
- Only after independent design review implement minimal shared delegation, keeping FirstPerson unchanged and no PalaceBuilder/runtime installation.
- Actual rig routes both sides/directions10/60 walk/run with hard exact-contact tolerance, raw body check, all-frame support/edge coverage; missing-neck/landing/blocked-neck and outside-region trajectory comparisons.
- Full inherited suites and non-target ordinary ground/jump/NPC/water/bridge checks mandatory before any production hookup proposal. Historical missing-source P1 remains independent.
