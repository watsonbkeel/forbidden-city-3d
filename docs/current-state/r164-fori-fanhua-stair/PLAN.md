# Fori–Fanhua shared stone stair: bounded design and implementation plan

Baseline: remote aba961fc6ec2dc40c25395eac2a24615218fc129. User delegates practical visual/circulation fitting and autonomous implementation; no main/Pages changes. Previous candidate remains the rollback.

## Design

The official Fori page and Museum Journal 1982(2), pp87–88 attest a shared stair between Fori east side and Fanhua, serving both upper floors. The plan establishes the narrow north–south connection, not step count, direction of ascent, exact side doors or dimensions. Existing floor heights3.70/3.85m, hall positions and R99 corner clearance are retained. All proposed dimensions and doorway positions are a game fit, not a measured reconstruction or current visitor permission.

A staged standalone helper, once after all halls: one plain stone stair within the1.33m clear gap, rising southward from courtyard ground atZ518.3 to3.85m atZ512, with a landing toZ508.0. Two fitted1.3/1.4m upper side openings connect the current floors. Register walkable tops only over actual retained upper floor slabs, preserving all six Fanhua voids. No teleport/profile changes. Necessary existing low Fori eastern offering-outline south end shortens0.30m, its visible upper edge follows; no new inventory, figures or decorative claims. Other rooms, roofs, columns, front rails and floors stay byte-for-byte.

Alternatives: a freestanding visual stair that terminates at a wall is rejected; moving either hall or the historical floor voids is rejected; waiting for centimetre survey is unnecessary. Initial Z521 fit failed actual-zone validation against the retained north wall at Z519.5–520.5. The final fit shortens the flight to25×0.252m, retains all walls, and turns in through the ground strip south of that wall. The first three low treads remain unguarded for the turn; the plain west guard follows the retained gable inner face. The isolated physics-only exploration reached both upper rooms and returned at10/60/144Hz, walk/run,24cases; it did not include finished rail geometry, real surrounding zone or acceptance. Old24routes fail, as there is no old upper stair.

## Implementation

- [x] Red tests for exact identities, two retained-wall replacements, source drift rejection, actual slabs/voids, native travel and missing-feature negatives.
- [x] `src/scene/palace/special/ForiFanhuaStair.js`: guarded source detection and standard box payload verification; stage resources, contacts and walkables before commit; two wall apertures, paired source-outline trim, stone steps/landing and exposed-edge guards. The two new lintels and four newly split gable segments use their own visible triangle contacts after actual jump/high-fall negatives; no generic physics edits or overhead shapes.
- [x] One import and call in `ZoneBase.js`; no data, public name, map or teleport change. Frozen original ZoneBase anchors regression.
- [x] Real local controllers incl reverse/diagonal entry, head/jump, blocked sides and source tamper/resource-failure controls. Floors/holes, all non-target geometry/materials and source lifecycles compared.
- [x] One real NingShou production-zone preservation pass plus critical cumulative routes and existing bounded regressions, never full World/browser.
- [ ] Independent review, truthful result/current-I29 appendix, clean Pages-base build/source identity and local HTTP asset checks.
- [ ] Commit new dev branch only after safe gates, upload and complete file/tree/commit/ref readback. Preserve aba/main, no deploy.

## Review focus and stopping condition

Narrow source gap, exact side-entrance geometry and retained altar outline; source property/array mutation and duplicate/shared geometry; partial allocation cleanup; real upper floors versus six true holes; ordinary-box high paths and return to original ground destinations. Any required wider scene/physics rewrite or unsupported inventory change stops inclusion, keeping aba available. GPU/browser/mobile/World/Node20 remain unverified.
