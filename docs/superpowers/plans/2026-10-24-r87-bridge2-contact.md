# R87 bridge 2 triangle contact implementation plan

Goal: enable exactly 22 existing fitted torch caps on bridge 2 with witnessed finite-foot support and matching solid contact, not a flat proxy.
Architecture: explicit owner-tagged triangle records on the existing collider path. Unmarked box/ramp/overhead branches retain legacy behavior. Share immutable local geometry for 22 caps with translations; per-record broadphase and triangle bounds prune queries. Only bridge 2 rail/shaft coarse boxes are replaced at their creation, never by a world-space search.
Tech stack: existing Three.js, Node test runner, FirstPerson/CollisionManager.
Spec: frozen TRIANGLE-SUPPORT-DESIGN.md plus authorized narrower single-bridge scope.

## Constraints and evidence
- Official photograph was actually viewed; supports side-head silhouette, not dimensions or historical post count. All metric values remain model fit.
- Preserve four other bridges, central ornament, all bridge decks/water/river banks, player .5 body/.3 foot radii, gravity/jump, NPC paths.
- Existing experimental helper stays unhooked for 88 heads. Production uses a separate explicit 22-head selector.
- No rescue, top vertex platforms, body shrink, generic OverheadShape misuse or invisible flat support.
- Current old-red reproduction 6/6 confirms penetration and invalid flat proxy; old logs remain unchanged.

## Tasks
1. Write known-answer triangle-disk witness tests (tilted/flat/edge/miss/apex-outside), geometry validation and actual solid box intersection/containment tests; observe RED. Implement TriangleSupport.js with local triangles, cached bounds, translation-only instances and exact witness max; GREEN and commit.
2. Write explicit registration/support/side/descending/controller tests; RED. Add tagged Collision dispatcher and only necessary downward FirstPerson contact. Untagged branches unchanged. Ownership lifecycle/update/remove/clear tests.
3. Write exact bridge 2 count and unchanged other geometry/deck/river tests; RED. Replace only its old side rail boxes at construction with actual bands/shafts, add22caps with shared geometry. Keep source-fitting metadata honest.
4. Reproduce all22 landing/jump/rail-crossing/side-hit/edge-leave at10/60Hz plus highspeed subdivisions; actual deck both ways, NPC and flight, dispose/reload. Request independent review before final world/night verification.
5. Full current-state raw failure comparison (R86 154), strict source successor, main17/GEO retention, root/subpath clean build/one backup/HTTP, four night worlds, performance counters and truthful README/report. Restore full sparse checkout before source inventory. No GPU acceptance without renderer.

## Review focus
Tangential disk/triangle intersection must have witness; vertical/degenerate faces no floor. A full body inside a closed mesh must collide. Airborne horizontal motion must not grant upward rescue. Off-edge descending sweep must not miss between frames. Original coarse bridge envelope must not survive and override true contact. Repeated owner unload/reload must remove all tagged records without disposing shared material.

## Strict contact refinement after independent review
The attempted reuse of the old .35m foot clearance for witnessed marked objects was rejected and removed before delivery. Tagged bridge solids instead use full feet-to-eye AABBs, with 1e-8 numerical coincidence tolerance only. A support witness is rejected if that full body overlaps any precise solid. Legacy unmarked bodies still use their old feet+.35/eye−.05 volume.
At eccentric cap landings the .3 foot disk and .5 body half-width cannot both rest on a lower cap slope. The bounded triangle-only resolver uses continuous SAT to locate the actual body impact, stays airborne (no ground/jump grant), and slides away from compact cap centers or across narrow rail bands at at most1m/s and .1m per update. Every displacement still passes water, static and dynamic guards. No full mesh geometry, no prior NPC path or default motion tuning changes. Head impacts use the same marked narrowphase; old overhead algorithm stays intact.
Normal water guards make middle side caps unreachable from ordinary walking; all22 direct vertical API drops are geometry diagnostics, not claims of22legal routes. Actual bridge-end jump/rail exit is separately tested. Strict trajectory/body sampling is required, not only final feet.
