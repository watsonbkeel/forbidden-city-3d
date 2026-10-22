# R54 Changchun east end alcove

Partial bounded reconstruction, not a finished restoration or palace-wide completion.

The official Palace Museum page labels image 1459 “长春宫东梢间”. The saved original was visually inspected. It supports high horizontal frame registers, drawn side curtains with contrasting edging, and a rear vertical display behind the north kang. The photography date, display campaign and total rear-panel count are unknown. Six central fields and partly hidden outside strips do not prove a complete six-leaf screen. Paintings, calligraphy, lanterns, carving and unseen joinery are intentionally withheld.

The original east kang stays exactly unchanged. Only its four generic cover posts and four generic cover heads are replaced, by a dedicated helper called only from the east branch. West kang, central five-screen group, partitions, hall shell, floor, roof, columns, map data, room records, walkables, character data and routes remain unchanged.

All new height, depth, spacing, curtain shapes and folds are reversible fits. The high-frame fields are plain placeholders, not traced ornament. The rear field has seven thin plain stiles outlining the six clear central fields, without guessing the partly hidden outer extension or total leaf count. These attached decorative strips add no collider or walkable.

Review the unchanged `source-original.jpg`, annotated evidence sheet, actual-geometry plan, and same-camera before/white CPU views. CPU z-buffer images use actual production triangles, basic lighting and material colors. They do not validate textures, runtime lighting, shadows, WebGL, GPU performance or mobile rendering.

White checkpoint: 43 new meshes / 1,764 triangles / 4 owned materials / 26 visible-box colliders replacing 8 meshes / 96 triangles / 4 colliders. Net +35 meshes, +1,668 triangles, +22 colliders. No walkables, rooms, map entries or spawn points added. The cloth is non-solid behind the existing blocked kang footprint; no existing obstacle is made passable.

The frozen R53 baseline uses exact old component roles and their exact matching post bounds, not material-color selection. Its retained capture includes geometry attributes, transforms, materials, userData, colliders, all navigation data and hall structure. Separate hashes cover west kang, central screens, partitions and retained east kang. All match exactly after the replacement.

The production FirstPersonControls walks repeated entry, east approach, west crossing and exit at 10/60 Hz forward/backward sprint, from ground feet = 0 with no rescue support. Legal front and oblique eye-height cameras have floor support and actual nearest ray hits on the new backing, curtain and transom. Targeted tests also check physical solid bounds, finite attributes, budget, identity guard, merge metadata and disposal.

Reproduce focused tests: `node --test tests/r54-changchun-east-layers.test.mjs tests/r39-west-domestic-topology.test.mjs`.

Capture current geometry: `node reports/r54-changchun-east/capture.mjs`. Capture before with the frozen R53 worktree supplied as its first argument. Render the `.json.gz` exports using adjacent `raster.py`, then run `overlay.py`.

The unified R54 integrator owns global world/character checks, build identity and any publication. This fragment is not pushed or deployed.

The initial blank-backing white checkpoint is 615209e6a4333f55a9ed800258185fadab3f2fc6. The clarified checkpoint preserves the six visible central divisions while leaving the overall total unknown. No source painting or text is invented. The new seven thin frame strips leave the initial 26 replacement colliders byte-identical.

## Final basic material checkpoint

Final geometry is the clarified white checkpoint `ce4829ac9c47bd10f7bd4c0e135cfc5a796c3f10` with no geometry/transform/per-mesh metadata change. Four broad fitted fields distinguish dark timber, muted cloth, blue-grey edging and a plain rear display background. They are not sampled historic pigments or measured finishes. No textures or ornament have been invented.

The clarified six-central-field geometry stays at 43 meshes / 1,764 triangles / 26 colliders. Only the central visible divisions are asserted; the total screen-leaf count remains null. Current material evidence is `material-geometry-and-collision.json`, `material-front.png`, `material-oblique.png` and `same-camera-before-material.png`.

Read-only integration function: `assertChangchunEastInWorld(W)` from `tests/lib/r54-changchun-world-check.mjs`. Pass an already built world with `scene`, `cm`, `rooms` and `mapItems` (or `zoneManager` accessors). It checks the 26 exact new collider boxes, absence of the four replaced generic-post boxes, actual floor primitives, room/spawn/door clearance, map footprint, merged material triangle count/bounds and complete source-status record. It creates no zone or GLB and alters no world state. Exported route and legal-view constants can be reused by the single unified integrator. Collision/support deltas use world coordinates; support delta is exactly empty.

`targeted-final.tap` and `targeted-final-exit.txt` contain the final focused result. The world-consumer test checks an already constructed merged hall fixture, not the complete city. Full-world characters and final release checks remain with the unified R54 integrator.

R54 unified transport note: the large source-annotated PNG is preserved as lossless binary parts indexed by `../r54-transport/ARCHIVES.json`. The original official source JPEG and ordinary model views remain directly readable. `node scripts/r54-restore-report-archives.mjs /tmp/r54-restored` restores the annotation's exact original path and bytes.
