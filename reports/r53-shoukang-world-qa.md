# Shoukang checks for the already-built R53 world

QA only. No production changes, new components, zones, GLBs, character supports or second world build.

Import `assertShoukangEastInWorld`, `SHOUKANG_WORLD_ROUTE`, `SHOUKANG_WORLD_COLLIDERS`, `SHOUKANG_MAP_ITEM`, `SHOUKANG_PREFERRED_LANDING` and `SHOUKANG_SUPPORT_POINTS` from `tests/lib/r53-shoukang-world-check.mjs`. Call `assertShoukangEastInWorld(W)` with the already-created W containing scene, cm, zoneManager (or mapItems), and rooms. The helper never calls ensureLoadedAt, build, load, unload or InteriorLoader.

It checks all 12 new physical boxes by world-coordinate bounds (not global collider indices), unique matching, real old floor primitives at three base support points, the retained east doorway/player clearance, viewing point, old room doors/spawns, exact map entry, four merged material fields with 200 triangles, world bounds and durable partial/source metadata. It is suitable for rechecking the same W before/after another operation.

The existing verified ground route is SHOUKANG_WORLD_ROUTE. Use the already-imported replayTerrace(t, {cm: W.cm, THREE: W.THREE}, route, {fps, backward, sprint:true, recordFrames:true}) at 10/60 Hz for W/S sprint. Wrap with traceTerraceGround(W.cm,{flights:[]}) and restore it in finally. Require arrived, startFeet 0, finite feet/ground and no source=rescue. These are actual controller routes, not teleports between waypoints.

Map target: {kind:'hall',name:'寿康宫',x:289.2,z:231,w:28.9,d:19.4}. Preferred original landing is x=289.2,z=214.3, feet=0, facing the hall center (289.2,231). It follows the real 17.4 m building depth and DOOR_DISTANCE=8; the center of the map rectangle is not a landing. In the unified world, call the real Teleport.resolveLanding('寿康宫') and check fallback=false and the preferred coordinates. To test map-to-room movement, prepend that verified resolved landing to the route and append it on return. That extended segment must be accepted by the unified runner; this worker's earlier movement check began at z=219.

Base support points: (276.15,238.4), (278.362589928,238.8), (280.5,239.5), original floor y=.75. The visible base starts at y=.75. These are support checks beneath the furniture, not new player/NPC spawn or standing points. Viewing stays at (278.36,236.8), eye y=2.45.

## B / S and InteriorLoader scope

Actual validation by this worker covers the procedural B hall and its production merged B geometry, collision and movement. No Shoukang S GLB load, B/S transition or InteriorLoader streaming run was performed here.

Read-only source inspection: src/scene/interior/registry.js registers taihe, qianqing, huangji, yangxin and kunning; it has no Shoukang entry. InteriorLoader.load returns false for an unregistered hall, and its update loop iterates only registered halls. Therefore there is no Shoukang S layer to replace this B framework in the current registry. This is a source-level scope statement, not an executed S transition test or proof about future registrations. No source/GLB/registry change was made.

A unified runner may call the same checker before and after loading another registered S interior to verify that Shoukang's B materials, provenance and colliders remain. Such a check demonstrates B retention during that operation, not Shoukang S reconstruction. Browser/GPU lighting, shadows and mobile acceptance remain unverified.

## Helper verification performed

The checker was run against one already-built-and-merged Shoukang hall fixture only, not a full world. It found all 12 collider matches exactly once, four materials, 200 triangles, and bounds min [276.07000732421875,.75,238.17999267578125], max [280.6551818847656,5,239.55999755859375]. A negative probe removing one expected collider from the diagnostic view correctly fails. The common source remains unchanged; the full-world acceptance belongs to the integration owner.
