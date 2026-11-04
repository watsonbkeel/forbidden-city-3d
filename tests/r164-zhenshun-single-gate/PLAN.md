# 贞顺门单座琉璃门楼一期

Base: 2a1dda7a284bf3a9b2947c771bc8766134104405. Existing isolated worktree; no main or prior branch changes.

## Design and boundaries
- Replace only the generic single wall-gate generated for exact item 9 at (-272.3,518.9). Retain 3.6m clear opening, 6.4m north-wall gap, original map name/extent and ground passage. Keep all other buildings and prior fixes.
- Official old photograph explicitly captioned 珍寶館出口貞順門 supports one entrance, profiled pale stone bases and framed glazed piers. Official glazed-gate article supports a single gate tower below the wall. No invented historical nameboard, date, relief carving or current access claim.
- Fit the low hipped canopy, simplified colour fields, dimensions, back wall and fully-open door pose to the existing spatial envelope. Do not shrink the player passage or alter shared physics. No new stairs, rooms or teleport target.
- Alternatives: merely recolour generic gate leaves its generic brick bases and unsupported nameboard; detailed historical reconstruction lacks colour/hidden-side evidence. Chosen bounded own-body fit is reversible and explicitly partial.

## Implementation and checks
- [x] Freeze exact 2a1 ZoneBase, snapshot all non-target source/merged roof/physical/map objects and central routes before implementation. Check real gate/wall geometry and adjacent reserve.
- [x] Red tests: dedicated identity/stone profile and no invented plaque; original clear aperture, exact map/wall output, source/frozen guards and failure cleanup.
- [x] Implement isolated builder with preregistered geometry filling and one dispatch call. No edits to generic builder/data/physics.
- [x] Real-controller local axial/diagonal/edge, blocked-pier controls, jump and roof-drop checks; remove one real pier contact for a failing negative control.
- [x] Actual NingShou single-zone old-object/roof hashes plus cumulative routes/strict landings, actual north wall/neighbor passage, atlas text-to-UV mapping and resource lifecycle. No World/browser.
- [x] Independent read-only review (26 formal checks) and bounded regressions; no new blocker found.
- [ ] Exact Pages base clean build and HTTP source identity after committing this tree.
- [ ] New development branch upload only after checks, all changed file bytes/blobs read back, preserve 2a1/main.

## Review focus
Unique object/zone identity; frozen/read-only arrays before mutation; late geometry attribute/contact failure; nearby well and Qianqin courtyard retained; generic nameboard removal must not remap other names.

Rulings: actual source item index is9, north wall42; old runtime is one generic wall gate, not five bays. Paving UV and partial material allocation failures were reproduced and corrected before release. No current source from the rejected Jingqi overhead experiment is present.
