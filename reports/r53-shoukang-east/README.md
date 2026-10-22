# R53 unit B: Shoukang east warm-room north-wall framework

Status: PARTIAL / REVERSIBLE WHITE-MODEL CHECKPOINT. Not a finished restoration, not a production visual acceptance, and not a claim that the palace refinement program is complete. Freeze this structure for integration review before any separate source-supported material pass.

## What the source supports

Official Palace Museum journal PDF: https://img.dpm.org.cn/Uploads/File/2024/09/25/u66f37561e9b76.pdf#page=4

Printed page 142 (PDF page 4), 2024 publication, photograph credited to 文明. The caption identifies the east warm room and its north-wall timber niche with 毗卢帽 decoration. The original 399 × 381 photograph and complete caption page were visually inspected. Publication date is not the capture date. Capture date and restoration/display campaign are unknown. This is separate evidence from the existing central seat/screen's 2018 display source.

Only these broad visible forms are represented: room-width timber niche frame and recessed field, two upper horizontal registers, a coarse crown-type outline, and the visible front plinth. No Buddhas, offerings, unreadable carving, inscriptions, or hidden construction have been invented. All depth, height, spacing, and outline parameters are reversible fits, not survey measurements.

## Images to review first

- `source-annotated.png` / `.svg`: unchanged full source photograph with coarse evidence regions and explicit unknowns.
- `same-camera-before-after.png`: actual retained hall triangles before and after, with identical cameras.
- `after-front.png`, `after-oblique.png`: the actual production-builder white geometry, not an artist's mockup.
- `actual-geometry-plan-overlay.png`: horizontal intersection of actual old/new triangles at local y = 2.0 m, plus the full fitted footprint and tested approach.

The perspective images use a CPU z-buffer and material base colors. Textures, runtime lighting, shadows, WebGL, browser, and mobile behavior are not validated by these images. No FPS/GPU performance claim is made.

## Exact bounded change

Base: `2a7c6fd09086e6b73c0745aa7cfca4534bbfd9a6` (frozen R52).

Production files: new `ShoukangEastWarmRoom.js`, plus one import and one call in `ShoukangHall.js` after the existing warm-room partitions. No shell replacement, seat/screen change, west-room change, GLB change, character data change, route change, or global world build is included.

Addition: 13 meshes, 200 triangles, 2 temporary white-model materials, 12 collider boxes; zero added walkables, rooms, map entries, or spawn points. Local bounds: x = [-13.13, -8.54482017], y = [0.75, 5.0], z = [7.18, 8.56]. The coarse overhead crown is visual-only; the 12 rectangular structural parts have matching actual-mesh collider bounds. This is not an overhead flight-collision acceptance.

Collider increments: visible base (1), cap (1), recessed backing (1), side uprights (2), full-width rails (3), horizontal register panels (2), register stiles (2). Their exact local bounds and live-geometry capture are in `geometry-and-collision.json`.

Every structural part is connected to the floor-supported front base. The recess is genuinely behind the front uprights, not a painted flat. The visible base depth is only a fitted support footprint; it is not claimed as a measured historic altar or a new human seating surface.

## Retention and navigation

The frozen baseline fixture is independently captured before adding the helper. After removing only the precisely registered new subtree and its exact collider range, every old mesh/material/transform hash, collider, walkable, room, region, map entry and hall-structure field equals R52. No fuzzy geographic exclusion is used.

The original 2.6 m nominal partition opening is retained. The existing jamb faces leave about 2.48 m actual clear span. No new collider intersects the doorway volume. Production FirstPersonControls traverse the front approach, east opening, and north viewing position, returning via the same opening at 10 and 60 Hz, forward and backward sprint. Feet remain supported with no rescue-height intervention. The old central circulation, west warm room, room-door records, and spawn records remain clear.

## Verification

- Initial five contract tests failed for the missing white framework (`tdd-red.tap`).
- A malformed-bay guard test failed on NaN before the finite-value guard was added (`guard-red.tap`).
- Final targeted suite: `node --test tests/r53-shoukang-east-framework.test.mjs tests/r44-independent-shoukang-review.test.mjs`.
- `targeted-final.tap` and its exit file are the current source of truth for pass count.
- `npm run build` and `build-exit.txt` verify bundling, not runtime rendering.
- Repository-wide/world/character freeze rebinding is intentionally left to the single R53 integrator. No all-tests/global-world pass is claimed.

Reproduce captures from repository root with `node reports/r53-shoukang-east/capture.mjs`; render each `before/after-front/oblique.json.gz` using the adjacent `raster.py`; generate the actual section/contact sheet with `overlay.py`. The source annotation is an SVG document; the PNG is its Inkscape render. The render log records nonfatal sandbox font-cache/profile warnings.

## Next bounded stage

After structure approval, a separate source-supported material pass may distinguish dark timber frame, a gold-toned crown field and the recessed background. Do not add illegible floral carving or unknown ritual inventory. Keep the white-model checkpoint recoverable and clearly mark any still-partial acceptance.
