# E first bounded change: Fengxian front hall

Status: PARTIAL, not browser/whole-building acceptance. Identity FC-D8AEF2E8A9,
existing runtime east-six item 53. No new hall or person is registered.

## Evidence and actual difference

Official [building text](https://www.dpm.org.cn/explore/building/236430.html)
states a nine-bay front hall with a double-eaved hip roof, five middle door bays,
and end windows. The actually viewed [official front photograph](https://img.dpm.org.cn/Uploads/Picture/2021/11/01/s617f4ed051855.jpg)
also shows the two roof tiers, raised end-window sills and plaque between the
roof tiers. The image URL's 2021 date is not asserted as the photography date.
Source hashes/view boundaries are in SOURCES-VIEWED.json. No source image is
redistributed in this repository or production assets.

The frozen R61 builder really produced 15 equal bays, one roof tier and a lower
front door-head plaque. See reports/r62-e-stage/before-02. A diagnostic export
with only nine bays/two tiers is preserved separately from the final runtime.

## Implemented scope

- Front hall now explicitly uses nine equally fitted bays and two roof tiers.
  Footprint, anchor, floor/base height and overall column height are retained.
- Four end panels have real 1.05 m fitted sill bodies. The five middle bays
  remain door fields; only the existing central circulation doorway is open.
  The inherited generic lattice image is NOT a faithful six-wan reconstruction.
- The existing full plaque/frame moves together to the real generated roof
  band. Twelve ray probes check both roof surfaces; original size is never
  enlarged and any allowed reduction is recorded, not called surveyed.
- Original R39 empty/unknown ancestral ritual inventory remains. No living
  emperor throne, Qing bedroom or invented ancestor tablet is added.
- Other 55 zone declarations, including the rear hall, remain byte-equivalent.
  Shared source edits have literal inverse tests against frozen R61 hashes.

## Explicit dependent geometry/physics delta

Nine bays change all front/back facade column positions and their closed-bay
colliders. Generic column radius becomes the existing clamp maximum .34 m.
The existing central stair's width depends on bay width: 3.682 m in R61 becomes
4.6 m. Its visible treads/side stones and ramp support change together. Height,
run, number of steps and floor/base support remain unchanged. An initial QA
claim of wholly unchanged stairs was disproved; its failed log is retained.
This widened small stair is NOT a reconstruction of the full photographed
moon terrace, side flights, imperial ramp or balustrade. Those remain known
engineering/source-fit residuals, not BLOCKED_SOURCE for lack of any evidence.

## Checks and boundaries

17/17 local focused checks include the original two R39 checks and eight real
FirstPersonControls round trips (10/60 Hz, W/S, walk/sprint). Three inverse
shared-source checks pass. Seventeen of eighteen selected historic nameboard
checks pass; the remaining Wenyuan view assertion also fails on untouched R61
(3/4 in that file), so it is retained/classified, not a new pass or hidden.

Final actual CPU views: reports/r62-e-stage/front-profile-03. They use production
geometry and albedo/atlas but omit browser PBR, normal maps, real shadows and
whole-world occlusion. No GPU/mobile acceptance. New complete-world 108-person
bindings, 24 paths and streaming checks remain pending concentrated E validation.

## Required residuals

The rear nine-bay hall, connecting passage, full moon terrace, doors' exact
joinery, plaque size/calligraphy/Manchu/carved surround, ridge ornaments and
ritual interior are not completed by this front-only change. Retained dimensions
are fitted, not a survey of the official 1,225 square metre floor-area figure.
The rest of E61 and its three expansion tasks remain mandatory.
