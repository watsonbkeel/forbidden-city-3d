# R38 bounded southern planting and Taihemen approach

Baseline: R37 local `de4b5567` (remote equivalent `c7e990b948acf6c164bf22014b23e6f3db1ad6af`). Production owner works on `feat/r38-south-trees-20261021`. No main, remote or Pages writes belong to this implementation.

## Approved design and evidence boundary

The user approved continuation of the Wumen–Taihemen–Taihedian source-based correction stage and requested actual palace-adjacent trees on 2026-10-21 05:31 UTC. The bounded design retains existing architecture, navigation and material infrastructure, using local source-specific opt-ins rather than random planting, global roof changes or merger changes. Source photographs were visually inspected before source-dependent edits. See TREE-SOURCES.md and AXIS-SOURCE-AUDIT.md for the distinction between official statements, photograph observations, unknowns and reversible fits.

## Six selected trees, not a six-tree inventory

- Wenhua: four visible trunks in a north-facing official front photograph, two on either side of the raised approach. Viewer-left is west (+X), viewer-right east (-X). Authored positions are below the platform in the model side courts, not on the central route, gates or stairs.
- Wuying: one selected tree at either lower front-court side, corroborated by official labelled side-hall photographs. They do not imply the whole court has only two trees.
- The local geometry uses a fitted tapered/leaning trunk and coarse irregular tiered crown masses. It does not claim botanical identification, needle-level reproduction, branch-by-branch correspondence, exact current count or season. Individual species remains UNKNOWN. Low branches are not individually reconstructed; the current simplified crown is above pedestrian height. This limitation is not hidden behind a species label.
- Wuying's individually stone-edged soil pits are represented only by two thin octagonal soil/stone footprint cues. Their extent is fitted; the unknown raised curb height is not invented as a barrier or hidden support. No continuous grass strip is added. Wenhua's full planting-ground perimeter remains unresolved.
- All heights, trunk diameters, leans, crown radii, materials and world positions are reversible model fits. URL resource dates (2023/2025) are not photography dates or an October 2026 census. No downloaded photographs become project textures.
- No trees are added to the paved Wumen–Taihemen–Taihedian central courts. The separately documented 十八槐 and 文华门前海棠 are not substituted for these inner-court trees and remain unimplemented.

SouthCourtTrees.js is enabled only by outer-east / outer-west southTreeProfile. It adds no map identities, named rooms, portals or walkables. One collider per tree is calculated from its actual complete baked leaning trunk geometry, not guessed around an origin point. Merged crowns are included automatically in the unchanged FlightEnvelope and cannot become ground landing sites. Private flat materials survive the unchanged merge path without vertex-color assumptions; existing scene disposal owns them. No garden scatter, garden generator, shared merger, common collision algorithm or helicopter control is changed.

## Taihemen southern approach only

The previous generic stair put full-width treads and a hidden walking ramp under a narrow imperial-stone overlay. The official front photograph shows a broad central stone separating two stair flights. The new local TaihemenSouthApproach.js splits only this south approach into two closed-tread stairs, four sloped rail boundaries and a solid separate central imperial stone. Only the two flank ramps register walking support. Protecting the imperial stone from ordinary walking is a game policy, not a statement of current visitor access.

Retained envelope: width 11.748, rise 3.44, run 5.504, head Z −225.47, toe Z −230.974. These are inherited model dimensions, not newly measured from the photograph. The central stone width 5 and all rail/cheek/step subdivisions are explicit fits. The existing generic yulu surface is a placeholder, not a reproduction of Taihemen carving. Hall body, roofs, north approach, other gates and the shared terrace defaults remain unchanged.

The canonical Wumen → Taihemen route retains its original name/endpoints but derives a detour through the actual west (+X) flank. The return to center occurs 2.5 model units behind the stair head, after the retained facade columns. The first test route turned at +0.7 and physically hit a column; the route, not the columns or collision, was corrected. The former direct center ascent is tested as a negative. Historical straight-center probes are not silently rebaselined.

## Test-first and verification scope

Owner tests first failed because the tree profile and Taihemen split approach were absent, then passed after the minimal implementations. Separate failing tests established missing planting-pit footprints and the canonical route's old centerline before those changes. Main controller checks use unmodified production walkables, ground start, real controller and 10/60 Hz walk/sprint on both flanks. Additional explicitly named no-rescue variants impose a stricter condition; they do not replace production acceptance. Full-world and lifecycle coverage belongs to the independent review and final validation.

Early tree checkpoint `a941877`: 145/145 selected R36/R37/new tree CPU tests passed. Later owner tests comprise eight tree tests and fourteen Taihemen tests. Final command results and commit identity are recorded separately; early results must not be presented as a final seal. Vite build succeeds with the existing large-chunk warning. CPU geometry/controller tests, including actual merged ray hits and flight-envelope sampling, are not rendered same-view, native input, GPU/FPS or physical-phone acceptance. See RENDER-VALIDATION.md.

## Deliberately unimplemented

No additional Wumen wall-join/roof or Taihedian terrace/roof edit was supported beyond prior fixes. Their unresolved dimensions and outline are not declared correct. Taihemen lateral end approaches, exact carving, current physical access controls and surveyed dimensions remain unresolved. All palace vegetation, botanical identification, full crown/needle detail, exact tree inventories, seasonal changes, complete soil beds and raised pit curbs are not reconstructed. No further decoration is added merely to consume the work window.

## Comprehensive-run finding and bounded route-composition repair

The first aggregate run exposed 24 additional real-controller failures, plus their two parent failures, in the B/S all-five-bridge continuous tours. They were not waived: the allBridges branch of continuousVisitorRoute replaced the entire first canonical segment with bridge detours and its final endpoint, discarding the newly required Taihemen flank contacts. The ordinary central-axis route already used those contacts and passed. Forward bridge variants hit the imperial stone near its toe; reverse variants attempted the same invalid central descent.

Commit `be37150` changes only this test route composition and adds three regression cases. All original five-bridge/lane/zigzag points, route endpoints, downstream stages, controller, collision, speed and acceptance assertions remain. The canonical post-bridge suffix now survives intact, guarded against silently omitting future southern contacts. A three-case RED run showed the missing suffix before the fix; the same three cases then passed. The full corrected B/S continuous suite passes 98/98, including all 24 originally failing bridge variants, and the complete R38 focused group passes 57/57. These groups overlap other release checks and must not be added as unique totals. Initial failing logs remain preserved; the corrected root aggregate is a new run, not a relabelled original. Production geometry remains `fb9fe43`; helper/test repair is `be37150`.
