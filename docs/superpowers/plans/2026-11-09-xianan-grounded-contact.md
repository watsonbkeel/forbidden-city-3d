# Xianan grounded contact implementation plan

> Native, sole product author; independent whole-diff review belongs to the coordinator. Execute with test-driven-development and executing-plans.

**Goal:** Give the existing five Xianan low solids source-bound, finished-authoritative grounded player contact without changing their appearance or general movement.
**Architecture:** Private source/finished ownership plus authentic Environment ground coverage, followed by a narrow per-call movement adapter and one-use result consumption. Short validated descents persist in private controller state, but air/jump entries revoke grounded state.
**Tech Stack:** Existing Three.js, Node test runner, Python bounded runner. No installs.
**Spec:** ../../../../../r189-xianan-contact-red-20261109/DECISIONS.md and design REVIEW.md.

## Constraints
- Base commit 5d30c8366c8430f27cb9664b2b64f30e64e87cca, tree 0f75720e7b5e36235105e691fda8e51930c7fa8f; isolated local dev branch only.
- Preserve 58 meshes, 26 ordinary colliders, 1 legacy walkable, opening 24.1, original gateHall5, geometry/materials and all general constants.
- Only grounded .5-radius player, height 1.7 and step .6; finished box strict positive-depth sweep; ordinary proxies retain feet+.35/eye-.05.
- Old fixed RED remains immutable. New source-bound tests identify candidate separately. No all-suite/build/World/GPU/network/deploy.
- Each group: old-space256/semi16 MiB, wall60s/RSS512MiB/incremental output8MiB, one uniquely named run receipt. Unexpected errors stop for diagnosis.

## Review focus
- Source/finished unilateral mutation and lifecycle revocation must not revive capability.
- Ground footprint corners and swept-path holes must fail despite center coverage.
- Lost support must continue validated descent; no stale feet after blocked/slide/cross-domain/reset/jump.
- Thin obstacles and special surface domains must not be silently skipped.
- Three real doorways must remain traversable, not all-blocked false green.

## Task 1: Bind source and ground
Files: new controls/XiananContactIntegrity.js, scene/palace/special/XiananContactSources.js, controls/XiananGroundWitness.js; narrow hooks in ZoneBase.buildGate, CourtKit.finish/dispose, Collision.addWalkable/removeByTag/clear, Environment.setupGround/dispose.
Interfaces: registerXiananSource(kit,frame,item,zoneJson,walkable); finalizeXiananVisible(kit,merged); preserveXiananOwner(cm,clone,original); queryXiananContact(cm,from,to,radius); revokeXiananOwners(cm,tag?); getCreatedEnvironmentGround(scene); xiananGroundCovered(scene,from,to,radius).
- [ ] Write source/ownership/ground tests using actual builder and atlas once; confirm expected RED (missing private binding).
- [ ] Implement complete immutable source/finished verification and mesh-born ground registry. Polygon triangle subtraction proves full footprint/swept convex hull coverage.
- [ ] Run bounded GREEN with mutations, forged identities, holes, release/dispose/rebuild and non-target stream controls.

## Task 2: Solve grounded movement
Files: new controls/XiananContactMotion.js; narrow hooks in Collision.getValidPosition and FirstPerson update/updateGround/setPosition/dispose.
Interfaces: beginXiananMove(cm,motion,from,radius), tryXiananGroundedStep(call,to,stepUp), finishXiananMove(call,actualVector), consumeXiananMove(cm,motion,actualVector), resolveXiananGroundedVertical(cm,controller,state,dt), resetXiananMotion(controller).
- [ ] Write expected RED for real normal entry and invalid historical poses.
- [ ] Implement local lift/horizontal/short descent, exact support, conservative unsupported-surface guard and per-segment legacy/dynamic/water/boundary guards. One-use WeakMap result binds cm/motion/generation/returned Vector3; persistent descent binds controller, owner generation and exact previous accepted pose.
- [ ] Run bounded motion/negative groups: no input, failures/slides, domain crossing, support loss, jump/reset and thin obstacles.

## Task 3: Prove native routes and deliver
Files: tests/xianan-contact/native-routes.test.mjs and test artifacts outside repo.
- [ ] Run serial three-door south/north entry-return at 10/60Hz walk/sprint, real controller one initial seed per case and two-second tails, independent finished triangle/box oracle, bounded frame caps.
- [ ] Verify new poses and every accepted motion segment with independent strict oracle, normal guards and waypoint reachability. Compare domain-outside and other gate controls to frozen source, without rewriting historic snapshots.
- [ ] Save patch, identities, run receipts, untested scope and explicit non-release status. No commit or PASS claim outside actually verified stage.
