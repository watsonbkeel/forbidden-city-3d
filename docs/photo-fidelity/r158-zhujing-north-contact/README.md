# Zhujing existing north-stair contact only

Base `458cea434b60fa5e9b3a31fa84c2d90ba1ab4c36`, same production src/data as 962b4035. User-facing problem: normal existing north-door routes arrive, but native descent visibly floats up to 1.091111m above ground; 60Hz run ascent also lags below ground by up to 0.406575m. Not a blocked door and not an exhibition obstacle. Existing central open-game doorway stays unchanged despite the source photo's closed pose.

## Minimal implementation
Four production paths only:
- NEW `data/architecture/zhujing-north-stair-contacts.json`: exact captured original platform and NORTH ramp, not approximate newly added geometry.
- NEW `src/scene/palace/special/ZhujingNorthStairHost.js`: private WeakMap authority tied to the normally completed dedicated rear hall, not copied labels, shapes or coordinates.
- `src/scene/palace/special/SouthCourtHalls.js`: private normally-built rear-frame WeakSet; register only old walkables [platform,north ramp]. Original south ramp remains untagged.
- `src/scene/palace/BPrincipalStairContact.js`: only pre-toeRect imports, allowlist, registration, preserve/live authentication. `function toeRect` through EOF is byte-identical. Global Collision/FirstPerson and all 19 previous architecture files are byte-identical.

Captured existing north ramp: x [-188.70000000000002,-184.1], z [-160.2,-158.28], height 1.2→0. Captured shared platform x [-200.20000000000002,-172.6], z [-173.8,-160.2], y1.2. Shared platform does NOT grant the south interface: resolver remains scoped around the one north ramp, requires a prior/current ramp contact, fully supported cross-footprint and swept-body clearance. South interface/connector cases explicitly reject.

No meshes, collision proxies, supports, rooms, maps or source dimensions added/removed/edited. Baseline fixture captures 383 meshes, 34 colliders, 3 supports, 1 room, 1 map. Their full geometry/attribute/index/world-transform/material signatures and collider/support/room/map/region fingerprints compare exactly after removing only the two new authorization labels from support serialization. New private row identities cannot be acquired by copied metadata.

## Evidence
Same production normal World, outer-east loaded plus globally constructed entities, NOT all zones. Production TextureLibrary APIs/manifest sizes with inert image pixels; no GPU/render acceptance. Native FirstPerson controller; only DOM/clock/heading test fixtures. Node resolver selects exact candidate src/data without rewriting source. No injected surfaces/hooks.

Identical route each direction: x=-186.4, north court z=-157 → toe -158.28 → platform edge -160.2 → north doorway -161 → inside -164 → reverse. This stays north of the genuine round exhibition at z=-171, not a path alteration to bypass a blocked door. 10/60Hz × walking/running, 4 full roundtrips, 312 complete recorded movement frames before and after:
- BEFORE: all arrive, max absolute feet/ground gap 1.09111111111111m. Per route 0.49786760963011634, 0.7784442682510954, 0.8410978692548498, 1.09111111111111m. Respectively 3,2,27,26 frames exceed 0.3m. Last 26 includes 20 descent-above and 6 ascent-below frames; not 26 continuous descent frames.
- AFTER: all arrive, max feet/ground gap 0; identical endpoints/frame counts. 552 loaded src/data SHA pins stable over run.
- Seven component tests pass: actual registration; complete before/after fingerprints; jump/high-fall/stale/side departure; no south/connector grant; missing/duplicate/moved/copied owner; forged host; both-endpoints-clear thin ordinary obstacle and registered dynamic actor; old-table/motion-suffix preservation and independent B import. Tests do not weaken thresholds or replace physical objects.

Raw local evidence lives under `/tmp/r158-zhujing-north-0216*` (normal baseline), `/tmp/r158-zhujing-north-0218*` (capture/RED/components/final World); raw bytes are not included for upload, only summary/hashes. Current route JSON reports maxFeetDatumGap=1.2 because it compares ground-level endpoint feet to platform datum1.2; this is NOT floating-height error. Use maxFeetGroundGap.

## Sources and limitations
Existing north facade source: https://www.dpm.org.cn/explore/building/236531.html and https://img.dpm.org.cn/Uploads/Picture/2024/02/21/s65d5b6eae46b8.jpg (cached and viewed; capture date unknown). Source supports a north central doorway/stair, not surveyed model coordinates or present public admission. This is a contact correction on retained fitted geometry, not a new historical reconstruction. No author build or CPU image; normal production route already includes the hook. Unique integrator performs cumulative build after Astra review.

## Commands
```
node --test tests/r158-zhujing-north-contact/component.test.mjs
node --test tests/r158-zhujing-north-contact/world.test.mjs
```
Component baseline fingerprint is local `/tmp/r158-zhujing-north-0218-before.json`. Helpers are borrowed read-only from preserved sibling trees; normal World test explicitly redirects only src/data module URLs to this candidate and records all loaded source hashes. See test paths before replaying in another checkout. No new dependencies.

## Preserved B regression
The original nine `b-principal-stair-contact.test.mjs` checks also pass with module resolution selecting this candidate's unmodified-motion runtime: real 10/60 walk/run old principal stair roundtrips, original 57 plus existing eight side records, jump/fall/stale/teleport, deletion/duplication/changed rows, side departure, thin ordinary and dynamic actors. Actual duration 5.2s. No baseline suite source or assertion was edited. Command and loader SHA are in the summary.
