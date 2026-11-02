# 治牲所地图传送正面纠正

Base: `9db2713115c1b2ef6eaaf2f439d9b0df1c2763a9` (integrator-confirmed remote ec54 equivalent).

Only production change: `src/scene/palace/special/ZhishengShell.js` mapItem `rot:0` → `rot:Math.PI`. **This is map navigation orientation, not frame rotation.** The actual frame stays rotation zero, with its sole game doorway on +z/north. No generic Teleport/controls/collision code changes, no new physical surfaces, no roof/facade/identity claim changes. Existing roof conflict/provisional/unknown flags remain verbatim. Normal ZoneBase display name remains `治牲所`.

## Actual RED → GREEN

The normal World RED asserted that Teleport.geometryFor faces the actual north opening. It failed as expected: frontZ -250, normal oz -1, resolved landing z -258 (safe probe walks only 5m, so this incorrect south-side landing was not null). The prior module-only preservation assertion also failed before the change.

After changing only the map direction: frontZ -240, oz +1; actual `Teleport.go('治牲所')` on real FirstPersonControls lands (-236.5, -232), feet 0, fallback false, looks toward z -245. Four 10/60Hz walk/run roundtrips from this actual teleport state through z -239, inside z -242, then back to original landing: **4/4, 430 movement frames, max absolute feet-ground gap 0**. South-wall run from (-236.5,-253) toward (-236.5,-247) remains rejected, 180 frames, terminal z -250.63791507031334. No route moved around an obstacle.

World is `loadAll:false`: initially outer-east plus global entities; actual Teleport.go/ZoneManager.update additionally loads axis-courts and ningshou, as recorded in log. This is not an all-zone suite. Production TextureLibrary with inert pixels, native controls/collisions/Teleport and normal ZoneBase; DOM/clock/heading are controlled for deterministic CPU QA. No GPU claim. No full build or broad regression suite in this limited author task.

## Preservation proof

Component test builds both the frozen 9db Git-blob module and candidate with identical component kits. It compares every mesh attribute/index/material properties/world matrix/userData, every collider including triangle payload, supports, complete metadata, frame position/rotation and map data after allowing only the map rot field. All equal. Exact source text assertion accepts **only** the single substring replacement; no other production path changed. The old module is a component-only data-URL import with absolute dependency locations, **not** a World replacement. World uses only candidate files, ordinary hooks.

`teleport-walk.mjs` is the existing native-controller replay helper with an optional initializer instead of initial setPosition, so real Teleport.go initializes the same controller that actually walks. All movement, jump/step logic and waypoint driver remain production/standard QA logic.

## Commands / evidence

From repository root:
```
PHASE=red node --test tests/r158-zhisheng-map/world.test.mjs # before change: intended north-direction RED
node --test tests/r158-zhisheng-map/component.test.mjs
PHASE=green node --test tests/r158-zhisheng-map/world.test.mjs
```
Final component 1/1; World 1/1. Raw logs and compressed frames remain local in `/tmp/r158-zhisheng-map-0304/`; summary records SHA256. Integration must use a new output PHASE or separate temporary directory, not overwrite author evidence.

Initial setup attempt failed before any geometry test because sparse checkout omitted HD texture manifest. Restored the exact tracked HEAD manifest (no source change), then obtained actual intended RED and GREEN. That setup failure is not counted as the bug RED.

No new official-source research needed: this corrects the pre-existing explicit `meta.front='north'` and its implemented sole north opening, not a claim of historical/current public access. Retain all limitations and fitted dimensions from original source.
