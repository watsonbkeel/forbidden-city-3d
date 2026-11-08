# Sui'an Room: basic topology and southern frame

This change identifies FC-8E4E75BF02 inside Yangxin Hall's northeastern room. It adds the west divider, the room's southern fixed frame and a short eastern closure, using the existing B-layer eastern and northern walls. It does not add a separate building, teleport target, complete furnishings or photographic pixels.

The Palace Museum's printed plan (Fang Xiaoji, page258, figure1) and the two opposing views in Forbidden City magazine (August2022, pages110–111) establish the room adjacency and distinction between the southern fixed frame and northern bed enclosure. All game dimensions, partition height, plain frame profiles and doorway offset are MODEL_FIT, not surveyed dimensions or exact carving.

The original R88 panel and collision proxy are split across the whole frame replacement strip, including the jambs and lintel, with retained front/back UVs continuous in the original coordinate field. The old 1.8m north opening remains. Rear east-west crossing is intentionally replaced by separate access through the southern anteroom. Existing furniture, floors, GLB asset and B shell remain unchanged.

Allocation and publication failures restore the source tree and release new resources. A post-commit retirement-listener fault does not reattach retired geometry or strand the load promise; it is recorded as incomplete retirement. This is not a claim that a throwing graphics callback released GPU resources. When prerequisite optional 2D finishes are unavailable, the original S layer remains available without claiming the new room was installed.

## Checks

- Actual single-hall CourtKit B plus actual decoded S GLB and production InteriorLoader.
- Sixteen complete native-controller routes at10/30/60/144Hz, walking/sprinting in both directions, including stopping updates; actual collision and visible-triangle torso checks.
- Forty-eight retained R164 cases preserve every update against public R177. Four original R53 exterior-stair/west-room routes retain their original points, outcomes and traces.
- An additional centered approach keeps the original main-route endpoints. A continuous1m-body sweep has a36cm center band from localx=-15.42 to-15.06 overz=-.6 to1.5. This is not a claim that every point at the extreme curtain edge is a valid stopping point.
- Full frame-strip volume removal, retained-volume containment, continuous UVs, actual B wall joins and new-solid overlap checks. Only three exact original floor-owner footings within the declared vertical band are allowed. Surface crossings are supplemented by closed-shell center-containment checks and synthetic containment negatives. Tolerance1e-6m is for floating-point joins, not arbitrary interpenetration.
- Stable bilingual information card, original164 identities and all older supplemental records retained, Chinese/English/pinyin search, unchanged missing-translation alert and no new teleport.
- Exact runtime/mode inverse to public R177, followed by the unchanged historical source contracts. Behavioral imports always use current production code.

Run serially:

    node --max-old-space-size=256 --test --test-concurrency=1 tests/r179-suian-room/*.test.mjs

The source comparisons require the public R177 baseline eb142e674f980f97727090c07afa97f3f05a7d37 plus the existing public ancestry anchors listed in the R177 workflow. They do not require private development commits.

These are CPU/component/DOM checks. Full west-six, World, browser/GPU appearance and the final production build are not claimed by these tests. A CI run must use the exact candidate tree and retain the existing checks.
