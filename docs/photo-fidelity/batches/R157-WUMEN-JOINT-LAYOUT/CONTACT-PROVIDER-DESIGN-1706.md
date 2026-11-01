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

## Proposed registration/authentication details (17:10, not yet code)
- WeakMap-owned binding to a particular CollisionManager, not a userData truthy flag or borrowed furniture ID.
- Fixed14 contact-rig identities + separately explicit test-ground identity. Descriptor source is a reviewed immutable fit contract; exact geometry triangles/position/matrix and actual registered ramp/body rows must match it. Do not regenerate an expected signature from the object under test.
- Preserve concrete references to registered ordinary collider rows and walkable rows; exact cardinality and live registration membership required. A removed/replaced/hidden/moved source cannot be kept alive by a stale private cached floor.
- Initial version limited to `LOCAL_CONTACT_RIG` identity transform; actual World transform mode must be implemented/validated separately, not inferred from caller-provided arbitrary matrix. This keeps source-world/local confusion out of the first experiment.
- Default/no binding is O(1) return-to-old-behavior; with a binding but outside the fixed candidate region, do not inspect/alter unrelated scene state or original movement results. Inside invalid source state should fail closed with an explicit diagnostic, never create new support.

## Existing-controller interface caveats found17:13
`getValidPosition` already computes exact per-substep ground and checks the ordinary body at that height. `FirstPerson.updateGround` subsequently smooths feet and overwrites cameraY, producing the observed overlaps. A bounded exact-feet handoff therefore must retain the original solver's actual accepted substeps, not infer them from final XZ.

After `onSupport=true`, FirstPerson passes airFeet even when motion.airborne=false; default Collision then keeps bodyFeet=max(ground,airFeet) on descent. The proposed provider must not merely copy returned cameraY. It must verify the real final ground and sweep any required lowering against actual ordinary bodies, dynamic actors, boundary/water contracts. This is a design requirement, NOT permission for an unswept downward snap.

Support footprint coverage is a geometrical union predicate only. A broad ground slab under an elevated missing neck must NOT satisfy elevated support coverage: qualify each witness by the actual affine height/continuous contact branch and live source identity before union coverage. Whole-path height continuity and absence of below-surface rescue require explicit tests.

## Alternative minimum bounded-substep entry (preferred for review)
Instead of observing legacy movement then correcting descent after it, an explicitly registered `tryWumenJointStep` may run inside existing `tryMove` only when this candidate's actual support ownership is involved. It returns null outside/unregistered, or an accepted/rejected result carrying exact feet and ground for that actual substep. It must validate/sweep a grounded move at the true affine height; record a new candidate-specific handoff, not masquerade as `lastFurnitureStepFeet`. Existing `resolveFurnitureVertical` delegation can consume that single-call handoff before falling through to old FurnitureMotion, without changing FirstPerson. Plain segments after leaving the region must clear or explicitly settle the final handoff; never let a prior inside result override a later outside pose. Airborne calls do not get ground adhesion. This requires scoped downward/body sweep and own geometry authentication, but avoids proving a path retrospectively from endpoints.

## Removal negative semantics
Registration must authenticate every submitted allowed owner independently, not fabricate absent pieces. A valid subset of known, fully authenticated real owners may be registered (e.g. a deliberately missing-neck diagnostic); complete-rig acceptance separately requires all14. This lets a missing physical piece produce an actual unsupported-route failure instead of merely counting a registration exception as a traversed negative. Unknown or duplicate owner IDs and partial/mismatched mesh-vs-body-vs-support within one submitted owner are rejected. After registration, removed/changed membership must fail closed or be explicitly unregistered; cached support may never survive actual removal. Foreign ordinary obstacles remain valid CM colliders and must block a neck test, not be rejected just because the full World includes non-candidate objects.
