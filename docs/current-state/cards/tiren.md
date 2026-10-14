# 体仁阁 / Tiren Pavilion

## Scope and evidence

This R3 component replaces the previous single tall hall plus two roof bands with two independent structural storeys, an upper veranda and a hip roof. It is a source-backed first playable model, not a measured conservation reconstruction.

- Primary source: [Palace Museum, 体仁阁](https://www.dpm.org.cn/explore/building/236453.html), inspected 2026-10-14.
- Photograph inspected: [Palace Museum exterior photograph](https://img.dpm.org.cn/Uploads/Picture/dc/1534%5B1024%5D.jpg). The image clearly shows a raised grey platform, brick-enclosed lower end/side bays, a central plank door, a lower skirt roof, continuous upper railing, an open upper colonnade, and the upper hip roof. Its capture date is not established; it is not evidence of today's visitor access policy.
- R2 object: `axis-courts/tirenge`, P0. Supplied front and oblique game screenshots 030/031 were inspected to establish the prior failure: one tall facade with two closely stacked eaves, no genuine upper storey or balcony.
- Confirmed by the official text: faces west; lower 9 bays × 3 depth bays; central double plank door, three straight-lattice window bays on either side, brick-enclosed outermost bays, sides and rear; 24 square eave supports around the upper veranda; upper 7 bays, 28 diagonal-lattice front leaves; wooden upper side/rear enclosure; yellow-glazed hip roof. The museum lists an overall height of 25 m.

## Coordinate and integration contract

Export: `buildTirenPavilion(kit, opts)` from `src/scene/palace/special/TirenPavilion.js`. Supply a real `CourtKit`; return shape is `{ f, group, PW, PD, top }`, with `group === f`. Geometry and collision are registered directly on the supplied kit. Structured evidence, storeys and circulation are available at `f.userData.pavilion` before material batching.

Preserve the current `data/zones/axis-courts.json` placement: `x: -98.4`, `z: -109.3`, `rot: 'west'` (resolved rotation `-Math.PI / 2`), `w: 44.1`, `d: 12`, `pad: 1`. In this project's coordinate system west is +X. `data/anchors.json` has x=-100.4, a pre-existing 2 m discrepancy. This component does not silently reconcile it.

Replace the old `colH: 10.4`, `roof: 'xieshan'`, `layers: 2` presentation with the dedicated component. `colH`, `roof` and `layers` are deliberately not used to synthesize another double-eaved hall. Use `ph: 3.2` provisionally, with independent `lowerStoreyH`, `upperStoreyH`, and `roofH` overrides only when better measurements are available. Explicit placement and footprint options are preserved.

The roof is one `wudian` cap over the actual upper storey. The lower four-sided eave skirt is its own open-centred geometry. The upper core is recessed behind the 24 square support columns, leaving an actual four-sided veranda, not a solid red inter-roof band. Lower-window and upper-lattice bars are physical meshes.

## Current-state limits

- Footprint, plinth height, room heights, balcony clearance, roof rise, stair proportions, and ornament profiles are provisional. The 25 m official overall height is a source fact, not a surveyed accuracy claim for every generated vertex.
- A physical name plaque is omitted by default because its presence/design was not verified in the inspected photograph. The map label remains.
- Default central door state is closed, matching the inspected reference photograph. This does not claim that today's door is permanently closed. Explicit `enter: true` opens only this double door for an approved playable route; all blocked end/side/rear bays remain solid. No invented rear doorway or public stair to the upper floor is added.
- When `enter: true`, exactly one playable lower hall and its named location region are registered, with the real central west-facing door. Neither the closed reference state nor the upper gallery is advertised as a playable room.
- Upper walkables have `rescue: false`, preventing the collision engine's platform-rescue feature from transporting ground-floor visitors onto the balcony.
- Upper side/rear walls are wooden; lower side/rear walls are brick construction with a red finish. Color/texture detail remains simplified. Bracket orders and seven roof beasts are recorded in the source but not claimed as conservation-grade geometry in this pass.
- Exact rear attachments and present-day visitor barriers require further dated photographs. This component does not mirror facts from 弘义阁.
- CourtKit material batching now preserves this record in the output group's `userData.architecture`; a structural-contract test guards it.

## Verification contract

Run `node --test tests/current-state/tiren.test.mjs`. The test uses real CourtKit meshes and CollisionManager; only texture acquisition is stubbed, following `tests/lib/world.mjs`.

Assertions cover independent structural floors and columns, 9/7 bays, the 24 unique square veranda supports, four clear veranda sides, solid blocked bays and closed double door, explicit central-door-only entry, 28 upper lattice leaves, west-facing placement, a single hip cap, and non-rescuing elevated walkables. Integrated scene rendering and route review remain the integrated release gate.

## Component verification, 2026-10-14

- Focused tests: 12/12 pass, including a real CollisionManager walk from the court, up the steps, and through the explicit open central door, plus lower-only room/region registration.
- Evaluated geometry: top 24.927 m; 16,644 triangles with the provisional defaults. These are model measurements, not new source measurements.
- Five CPU z-buffer projections of the actual generated triangles were inspected: front, oblique, rear, close veranda, and above. This checks silhouette and visible geometry; it is not a live-runtime, texture, shadow, or performance approval.
- Integrated production build and zone geometry check subsequently passed (0 errors, 23 warnings); the inherited 神武门 11 m anchor discrepancy remains.
- Integrated Chromium front/oblique images were captured and visually inspected on 2026-10-14. Both independent storeys and the recessed upper veranda are visible. The final full-scene test results and limitations are recorded in [the release acceptance record](../ACCEPTANCE.md).
