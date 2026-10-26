# R101 independent Xiehe plaque interface review

**PASS, bounded P2 interface change**, runtime `7f26ddf7c57252542fd784f3972c64d0d0b248e9`; documentation checkpoint `90e7c84060f23215c7d48149879da2a9caaa3565` has identical src/data. Baseline: final R100 `fb519a7ad12652ef006bf432a18a74be3922d688`.

## What is actually fixed

Only the Xiehe instance's complete rectangular plaque frame and face move together 0.07 along local −Z (world −X). The original approximately 0.06m rear-frame/painted-beam intersection becomes **0.010000004619357128m separation**. This is an engineering fit, not a measured historical mounting distance. The original face was already visible in the six representative rays; this is **not a lettering-obstruction or blocked-player-path fix**.

## Independent actual geometry evidence

`inspect.mjs` directly constructs each actual gate through ZoneBase and the normal plaque atlas stage, using the two source trees. It uses a separate pre-existing triangle polygon-clipping oracle, not product collision routines or the writer's test fixture.

- Baseline Xiehe: **3 actual beam triangles** have open-interior intersection with the actual solid frame; **6 buffer vertex entries / 2 distinct frame corners** lie strictly in the real eight-corner beam box. Original intersection depth: **0.05999999538063605m**.
- Candidate: **0** positive triangle intersections and **0** embedded frame vertex witnesses across the built gate's other meshes. No newly intersecting beam/header/column/eave is detected.
- The plaque remains the original solid BoxGeometry(.92,1.52,.1), scale1, with its separate face. Frame/face attribute and index hashes, material bindings and relative installation relationship are unchanged. Both local matrices translate by exactly −.07 Z; computed world matrices match the corresponding −.07 X translation in this build.
- **585 other Xiehe meshes**, **559 colliders**, **3 walkables**, the gate item/profile/structure, map and rooms are exact baseline values.
- Xihe, Jingyun, Longzong and Zhaode complete snapshots are exact, including their inherited similar rear interfaces; this does not secretly close those separate residuals.
- Six representative face rays (8/16 view distance × upper/middle/lower face positions) continue to hit the actual plaque face first. These are six rays, not six separate Chinese characters or a GPU text-rendering test.

`comparison.json` binds the result. `baseline-fb519a7.json` and `candidate-7f26ddf7.json` retain detailed witnesses and signatures. An initial QA snapshot retained mutable walkable arrays through fixture disposal, producing an empty walkable list; this was identified before the gate report, fixed by copying arrays before disposal, and both trees were freshly rebuilt. The discarded preliminary comparison is explicitly named `initial-qa-array-disposal-comparison.json` and is not the final evidence.

## Paths and scope preservation

Only `src/scene/palace/special/SideGate.js` changes at runtime; the condition is `g.profile==='xiehe'`. Generic CourtKit.plaque, dimensions, doors, header, ramps, collision, navigation and all control logic remain unchanged. Exact actual collider/walkable/profile preservation proves this change does not alter any gate movement input; no redundant player route matrix was run, and face-ray success is not offered as a navigation proof.

SideGate.js SHA256: **67bf246202009ce2ff8a0a9fd962e17e76e769faf103b13722ff218d800b824e**.

## Photo and fixed-camera CPU comparison

Personally viewed private `r101-reference-private/xiehe-close.jpg`; SHA256 **bf9244ba19f35902848324ea9f85ec2cc23a122432438ae218d0adc107ee461c** matches the source ledger. The image supports a separate thick frame ahead of the red header and a supporting/installation relationship. It does not establish millimetre spacing or a current capture date. The existing rectangular frame, lettering style, curved decorative profile and support-detail simplifications are **not reconstructed in this change**. Original photo bytes remain private and outside release evidence.

Personally viewed `front` and `side` before/after CPU pairs, verified identical per-pair camera exports, and bound all four PNG hashes in `visual-reviewed.json`. The side view shows the formerly buried upper back/edge now outside the unchanged beam; the front view changes only slightly, as expected for a 7cm interface correction. These are intentionally cropped local geometry diagnostics with constant colors: **no atlas letters or textures are drawn**. Lettering preservation is proven by unchanged geometry/UV/material/helper and actual face-ray checks, not by pretending the blank CPU images show text. No GPU/mobile or overall photo-exact visual claim.

## Handoff

Permit this unchanged runtime to proceed through separate cumulative/build/upload gates. No need for another geometric iteration or global plaque pass. Other four gates' similar P2 interfaces and existing historical/visual residuals remain open; this review does not certify their precise mounting or historical accuracy.
