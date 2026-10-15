# V6 Kunning entrance and enclosure: bounded architecture checkpoint

Baseline: published V5 `ea35d55ebcdb98b271109b80f38b3acb8da052f7`.
This checkpoint changes only Kunning's permanent B entrance/enclosure and a narrow
`PalaceBuilder.buildHall` dispatch. It is not a claim that the whole palace is
survey-accurate, that V6 is released, or that current museum admission permits
walking these routes.

## Evidence and scope

The [Palace Museum building entry](https://www.dpm.org.cn/explore/building/236487.html)
and [Zhu Jiajin, 1960, p134](https://img.dpm.org.cn/Uploads/pdf/1584/T00134_00.pdf)
support nine total width bays including two end passages and seven interior bays.
[Song Wen, 2017, p36](https://www.dpm.org.cn/Uploads/File/2018/05/31/u5b0fc690afcd6.pdf)
identifies two warm-chamber bays, four ritual bays and one storage bay. The
[official frontal photograph](https://img.dpm.org.cn/Uploads/Picture/2020/04/17/s5e997ee9eb19b.jpg)
shows the east-first-secondary entrance, central sill window, front posts ahead
of the enclosure and outward raised upper window panels. Images remain research
references; no source photograph or PDF is included in runtime assets.

Coordinates remain east = −X, south = −Z. Door outer index 3 corresponds to
interior index 2. Outer index 4 is the central window. The northern center is
closed; both end passages connect the south and north porches, with their outer
side walls retained. There is no invented mirrored rear doorway.

The inherited world anchor `(0, 386.1)`, rotation 0, width 46, depth 20, nominal
height 26 and floor interface 6.9375 remain unchanged. These are existing model
parameters, not measurements. Roof parameters and all 40 inherited provisional
post positions/radii are retained exactly. The post count is explicitly not a
historical column-map claim; reduced-column construction is known but its full
map remains unresolved.

Internal warm/ritual and ritual/storage partitions are closed in this bounded
model because their actual opening positions are unresolved. This is not a
claim that the historical partitions were completely sealed. Warm/storage
furnishing can be inspected by test viewpoints, but these rooms are not included
in playable entry routes. No speculative z=0 partition doorway is added.

## Authoritative contract

`data/architecture/kunning.json` is the one authored numeric profile for B and S.
`KunningProfile.js` deep-freezes it and exposes the furniture compatibility
contract and inherited interior frame. Python loads the same JSON; it must not
construct another `width / 9` grid. All shared bounds are explicit local,
floor-relative min/max boxes. Named bay lookup uses line references and works
with nonuniform intervals. A fully resolved nonuniform test profile also drives
the actual B builder, collision and final merged triangles.

Current schema: 1. Profile ID: `kunning-entrance-enclosure`; revision: `r3-v6-2`.
Profile SHA256 is over recursively key-sorted, compact UTF-8 JSON, omitting only
`profileHash`; the exact value is embedded in the JSON and tested against Node's
SHA256, rather than copied into this document as another editable identity.

Exports:
- `KUNNING_PROFILE`: deep-frozen complete explicit JSON
- `KUNNING_CONTRACT`: profileId, profileRevision, profileHash, furniture-only ownership
- `KUNNING_INTERIOR_FRAME`: inherited x/z/rot/w/d
- `kunningBay(id, profile)`: named interval lookup, no uniform-width assumption
- `bindKunningProfile(data, floorY)`: validates existing frame/envelope/floor and transforms once
- `kunningNavigationPoint(id, data, floorY)`: profile-backed world waypoint

Provisional fit values: enclosure lines z=±7.5, eave lines z=±10, doorway clear
width 2.8, threshold height 0.1, maximum opening height 3.7, window sill height
1.2. These are model fit values requiring further evidence, not survey claims.
The two open plank leaves occupy explicit right-angle poses outside the clear
interval. No stud pattern is presented as evidenced decoration.

B owns walls, partition barriers, window sills and bars, raised upper flaps,
jambs/transom, open leaves, threshold, structural collisions, roof, floor and
ceiling. S owns furniture only. No B hide/remove step or S backing panel is used
to open a route. S placement regions and protected door/porch/end-passage volumes
are shared in the JSON. Existing lower plinth/stairs remain owned by the common
palace builder; the special helper does not call `begin`/`finish` or reset offsets.
The retained `REAL` open=3 value is only the existing stair-width input because
Kunning bypasses the generic opening logic.

## Verification

The first test execution was run against the unchanged V5 implementation after
writing the initial test file and before adding profile/builder files: 4 failed,
1 passed, 4 skipped. Expected failures were missing authoritative profile,
visible/solid center enclosure, a narrow doorway with solid adjacent bounds,
and separated room/passages. A true offset track alone already passed through
the old three-bay void; it is deliberately insufficient acceptance evidence.

At this checkpoint 32 dedicated architecture tests pass, including:
- Final material-merged triangle raycasts, not only metadata: south/north center
  and legacy x4.7 rear closure, real door void, jambs, leaves, sills, vertical bars
  and outward-flap geometry
- Radius 0.5 center and both safely offset door tracks; raised-body window-bar
  blocking; solid outer side containment and room/passages separation
- Actual common terrace/plinth support and fixed-speed movement at 60/10 fps,
  walk/sprint, door entry and reverse exit from lower support, both end passages
  and reverse travel to the unchanged rear stair
- Preserved legacy center-front, center-rear and x4.7 rear paths as expected
  blocked cases in both directions, at the correct enclosure rather than a prop
- Actual nonuniform-profile B geometry and canonical profile identity
- Two regression tests raycast the actual final merged triangles from both sides:
  door jambs meet the transom at y=5.1, and the recessed south/north upper walls
  meet the inherited ceiling at y=7.19375. Both tests failed on candidate F1,
  which had 0.18×1.2 jamb slits and a 0.81925-high upper wall strip. F2 closes
  these unintended modeling gaps without adding triangles, moving the opening,
  or changing any route. These joining heights are model fit, not survey data.

The entry route ends at `doorInside`. An initially proposed diagonal extension
to `ritualInterior` intersected an inherited post; that extension was removed
instead of moving a post. The optional interior observation point remains a
point, not a claimed validated walking segment.

Measured standalone final B geometry: V5 15,652 triangles / 12 merged meshes;
V6 16,864 triangles / 11 meshes, a net 1,212 triangle increase. Roof material
triangle counts remain identical. No new material identity is introduced. This
is a local mesh measurement, not a substitute for the unchanged six-camera
submitted-triangle/draw-call performance gate. Wumen's zero call headroom and
Taihe's 4,770 submitted-triangle headroom still require renderer verification.

The full current-state suite passed 222/222 before the final exact-post-list test
was added; production Vite build also passed. S asset/metadata/loader lifecycle, non-Kunning exact snapshots,
teleport, browser visual inspection and unchanged aggregate/performance gates
are integrated separately. Passing the B tests alone does not complete V6.

## Open evidence debts

Measured width/depth intervals, complete reduced-column map, exact door/window
and threshold dimensions, north façade details, internal partition openings,
present end-passage screening and current visitor admission remain unresolved.
The front window treatment is still schematic: the official photograph shows
lower glazed rectangular grids and raised upper panels, while this checkpoint
retains simplified vertical bars and raised frames. Full present-day window
proportions, glazing and panel detail have not passed visual fidelity acceptance.
The retained furniture/stove accuracy debt is tracked by the S deliverable.
