# Four-side-bridge triangle support: deferred design only

No physics implementation or new shared type is authorized in this batch. The cap remains unhooked. This note describes the minimum next-topic boundary; it is not acceptance, a new queue, or a missing-photo blocker. Existing commits and red evidence remain unchanged.

## 1. Scope and actual footprint

Only `inner-jinshui:bridge-{1,2,4,5}` and their 88 existing posts may opt in. Bridge 3, other bridges, banks, water guards, deck ramps and all unmarked collision records retain their current paths. No character shrinking, jump changes, relocated posts or invisible apex platforms.

A future marked surface must explicitly define its support footprint. Proposed contract: a circle of radius 0.3 m, retaining the current support radius; this is a controller contact model, not a measured anatomical sole. Today's `supportHeight` actually tests an axis-aligned square of half-width 0.3 m. Do not silently change that legacy behavior. Body collision remains a separate contract: current movement passes radius 0.5 m and uses an AABB, not this foot circle.

For each upward triangle, intersect its XZ projection with the actual support disk. If the intersection is empty, it offers no support. Its plane height is linear over XZ; obtain the maximum on the intersection from contained triangle vertices, edge/circle intersections, and the disk's height-gradient extremum when inside the triangle. Flat triangles need a valid intersection witness; near-vertical/degenerate faces offer no floor but still participate in solid checks. No polygon-to-AABB fallback and no clamping an inaccessible triangle down to `maxTop`.

Return height **and a witness point on that triangle inside the footprint**, instance ID and triangle ID. Only reachable height/swept downward crossing may establish support; never rescue from deck level. A center ray alone is not a finite-footprint contact oracle: a foot may contact a cap away from its center. Thus the earlier center-ray gaps remain preserved diagnostics, not a complete finite-footprint verdict. The additive-cap penetration and the retained-height rail-envelope mismatch still need the actual surface/solid test, rather than a fabricated flat plane.

## 2. Necessary API boundary, not an additive maximum

Current `src/utils/Collision.js` entry points are `addCollider(s)`, `addWalkable(s)`, `queryBox`, `supportHeight(x,z,maxTop,r)`, `getGroundHeight(x,z,feetY,stepUp)`, `checkCollision`, `getValidPosition`, `updateCollider`, `removeByTag` and `clear`. `src/controls/FirstPerson.js` calls support from `updateGround`, horizontal collision from `update` through `getValidPosition`, and ground lookup from spawning/positioning paths.

A future explicit marked-record dispatcher could retain those public number/boolean contracts and expose an internal contact witness for tests. Unmarked records must execute the original branches, including box/ramp rescue and support-square behavior. Marked surfaces need the same non-rescue, reachable-height rule for both stationary support and moving/descending contact. Audit `updateGround`'s `feetY + 0.05` admission and downward crossing before deciding whether a bounded optional sweep context is necessary; do not claim the current number-only API already proves continuous contact.

Critically, merely adding triangle support cannot lower the old rail AABB maximum. The four marked rail/post assemblies must own corresponding precise support and solid geometry, and their old coarse rail boxes must be broad-phase-only for those marked records. This requires explicit stable ownership during bridge construction, not spatially guessing which merged mesh or anonymous AABB belongs to a post. Preserve all unmarked boxes. Any altered rail clearance must be verified as a deliberate local consequence, not hidden as a decorative-only change.

The matching solid path must test actual triangles against the existing body volume and each accepted movement sweep. Support alone does not prevent side-entry penetration. Existing `STEP_CLEARANCE=0.35` cannot be used to excuse an overlap with an enabled cap: low-obstacle stepping must have a reachable, witnessed support result. Whether this needs a marked-body special case is a next-topic decision, not a change made here.

## 3. Minimal reproduction and why earlier options fail

Use the preserved local fixture and real FirstPerson replay at bridge 2, side -1, post 0, world X=-15.94, Z=-320.3. Keep original river guard, height 1.7, move speed 5, jump 7.2 and gravity 14. Existing 10/60 Hz jump and rail-walk traces are in `reports/r58-a-bridge-contact-fix/`; no new replay is performed for this note.

- Additive cap: feet settle at 1.445 m while the cap surface under the recorded foot center is about 1.552 m. Adding only a box/flat apex proxy is not a triangle-contact fix: the current square footprint produces corner false positives, and a constant apex height lacks a geometry witness when the real footprint misses that apex. A center-height difference alone is not sufficient to reject a valid off-center disk contact.
- Retained-total-height replacement: all 88 shafts really shorten by 0.22 m, with the unchanged cap lowered equally, but the old support envelope exceeds 80/88 cap tips by >5 mm, up to 0.11250062 m. The reachable jump diagnostic changes penetration to a roughly 0.113 m center gap, not a proved contact. The unchanged upper rail additionally overlaps the lowered cap by 0.09 m. This is neither an acceptable joint nor a source-verified proportion fix.

## 4. Lifecycle and cost ceiling

Use one shared local cap geometry and 88 per-instance broad-phase bounds, not the aggregate InstancedMesh box. At registration, validate finite geometry, transforms, identity/count and ownership; malformed opt-in data must reject registration, not silently fall back to fictitious support. `updateCollider`/transform changes invalidate relevant caches; `removeByTag`, zone unload, `clear` and owner disposal remove contact records and grid entries. Release shared CPU geometry only after its final owner; repeated disposal must be harmless. GPU/instance-buffer disposal is separate and already covered by the visual helper's existing geometry-dispose listener.

Current visual cost remains 128 triangles/head ×88 = **11,264 submitted triangles**, versus the preserved first version's **45,056**; render geometry plus instance attributes remain **8,992 bytes**. This is not an FPS result.

A conservative separate expanded CPU cap representation would use 4,608 bytes for one 128-triangle XYZ buffer, 5,632 bytes for 88 4×4 transforms, and 2,112 bytes for 88 six-float bounds: **12,352 raw typed-array bytes**, excluding JS/grid overhead and any caches. Do not expand all 88 triangle copies (405,504 XYZ bytes) or rebuild triangles per frame.

If the related shaft/rail solids are also opted in, a conservative frozen-topology inventory ceiling is 11,264 cap + 1,056 shaft + 3,392 rail triangles = **15,712**. The rail bound follows 24 deck segments, at most 27 rail points, at most 212 triangles per extruded band, and 16 bands. Actual merged counts must be recorded before implementation. Per-query hard work is at most this inventory, and frame work is Q × candidate triangles, not “one draw call”. Per-instance bounds and triangle bounds must prune before clipping; under current spacing a small foot/body query can meet at most one post/cap, not all 88. Report actual maximum candidates, calls Q, allocated bytes, and timing at 10/60 Hz and maximum-speed substeps. No timing or frame-rate claim is established here.

## 5. Required gates before any future enablement

- Geometry/contact: known-answer tilted, horizontal, steep, degenerate and boundary triangles; edge/corner disk misses; apex outside disk; mirrored/world transforms; witness on both triangle and footprint; no NaN/duplicate registration. Check 88 actual placements, not just a synthetic dome.
- Real controller: retained red traces first, then jump, descending landing, rail-to-cap walking, lateral entry, edge departure and maximum-speed/substep cases at 10/60 Hz. Check actual solid non-penetration and witnessed foot contact, not center rays alone. Ground approach must not rescue upward; central bridge and both deck directions stay unchanged.
- Legacy representative regressions: ordinary box/ramp support and rescue, tapered stairs/terraces, gate passages and rooftops, furniture/rail jump support, all bridge/water guard routes, interior load/unload, zone reload and repeated disposal. Relevant existing families include `input-physics-invariants`, `gate-tower-controller`, `terrace-routes`, `r32-palace-collision`, `inner-jinshui`, `r36-south-independent-water-integration`, `r36-south-resource-lifecycle` and `r57-huangji-streaming`.
- Integration owner: one already-built-world binding/lifecycle check and actual game/WebGL review, with measured query/render cost and exact local navigation deltas. CPU pictures and diagnostic test counts cannot substitute.

These are future gates, not tests run for this note. A geometry/physics topic must approve scope and acceptance first; main A development should proceed without this decoration.
