# R87 bridge 2 precise-cap candidate

## Deliverable and scope
Cumulative successor of frozen R86 `3d5b7b8e3a40ed5faab700635f7cd68af2adaf43`. Runtime candidate `b71f228a`, fingerprint `2b691b8adc814e73c3085e8dbc6dde59e42ca46f1b3ed9ee1beb1bf7d0918a35`. This is a development candidate, not a GitHub upload or Pages deployment; latest verified remote evidence available to this batch remains R81.

Exactly bridge `inner-jinshui:bridge-2` gains22 independently owned, source-silhouette-fit caps. Four other bridges, central dragon/phoenix ornament, all old masonry/water render bytes, five bridge profiles and deck walkables stay unchanged. The old88-head experimental helper is not a production consumer.22 is the inherited model count, not a historical claim; .22m height/.125m maximum radius remain reversible model fits.

The44 coarse side rail envelopes on bridge2 are replaced by48 precise records:22cap,22shaft,4rail-band solids. Closed production geometry shares the exact CPU triangles; all27 templates have two oppositely directed uses per edge and positive volume. Cap instances share one128-triangle template. Added rendering is one InstancedMesh,128×22=2816 triangles. Geometry+instance array payload13696B, excluding GPU overhead. No change to generic unmarked box/ramp/overhead semantics is intended or claimed for the new tagged path.

## Contact contract and meaningful fixes
- Circular foot radius .3m: triangle-plane maximum has a witness inside both triangle and disk; unreachable heights are rejected, never clamped or rescued. Body half-width remains .5m. Marked solids use full feet-to-eye volume; no .35m foot-region exemption.
- Continuous triangle/AABB SAT checks every accepted tagged movement segment and provides exact impact time. Numerical contact tolerance is1e-8m, not a penetration allowance or artificial platform.
- An eccentric lower-slope witness is rejected if the full body intersects the cap. Non-foot body contact remains airborne and has a bounded slide response of at most1m/s and .1m/update. Water, neighboring solids and dynamic bodies still gate displacement. It grants neither ground nor another jump.
- Fixed the independent-review60Hz normal walk-off trap by retaining explicit precise-support state until the foot leaves, then taking the existing airborne path rather than immediately lowering the horizontal movement probe to the deck.
- After a slide, ground and support are recomputed at the actual new XZ. Head impacts use the same explicit triangle path. No change to player size, gravity, jump, default routes or NPC identities.

## Reachability boundary
22 direct vertical-position diagnostics validate geometry/contact only.18 middle cap centers are invalid player starts under the existing water guard; map safety rejects them and helicopter safe-ground rejects all cap sites. Those18 are NOT certified playable paths. The four dry end caps0/10/11/21 are checked for actual normal standing walk-off at10/30/60Hz, true airborne transition, no repeated jump grant and return to the existing bridge deck. Old short10Hz jump inputs may now correctly hit the side and return to the deck instead of reaching the old penetration endpoint.

## Final verification
-43 focused tests PASS: triangle/disk known answers, exact TOI, ownership/closed geometry, translated contact (1e-12 arithmetic tolerance), old-masonry byte retention,22cap landings, ground no-rescue, side-entry/strict body conflict, head impacts, bounded slide trajectories, four-end-cap walk-offs, player/.36NPC deck passage, map start rejection,3×unload/reload, source/main/GEO retention.
-1 actual whole-world flight test PASS, including Wuying10/60Hz descent. Water mask is byte-identical; only36 bridge2 height cells become more conservative. No other height-cell change.
-4 actual complete night-world stages PASS:108actors/28unique beds; emperor departure6519frames and return6517frames; civil-time, blocking, hidden/resume, interior/zone reload and quality bounds retained. Each report matches final runtime fingerprint.
-3 production checks PASS: clean root and `/gugong/` HTTP entries/assets/discovery links plus release launcher. No stale initial asset copied.
- Whole-world counts27043→27047colliders;3571walkables/281rooms/223mapItems unchanged. After removing only44old/48new target records, all other collider and all walkable/room/map hashes match R86 exactly.
- Raw complete current-state suite:1129 PASS /161 FAIL. All154 R86 failure labels retained, with7 additional frozen assumptions: four old unhooked-cap penetration reproductions, one old height-preserving replacement gap reproduction, old four-side/88-head fixture count, and fixed old InnerJinshui source hash. All raw logs and historical test side effects retained; frozen originals restored byte-for-byte. This is NOT an all-green suite.
- Expanded legacy shared selection: baseline39 failures/current40; only new failure is strict floating equality after translated bounds (~2e-15m addition-order difference). Independent translation/witness successor proves1e-12 tolerance. No old test modified or old failure hidden.

## CPU cost and limits
88 contact samples including cold work: median0.53ms,p951.25ms,worst6.38ms in this environment. At most4grid queries/96 cumulative grid candidates/2633 indexed triangle visits per probe; these are not unique narrowphase counts or a frame-rate guarantee.48records/27templates/1112unique triangles/3800instance triangles; numeric position payload80064B plus substantial JS object/grid overhead. Exact TOI replaced35 repeated binary probes before final freeze.

Actual official photograph was viewed and source/hash recorded, not embedded. Real WebGL/GPU rendering, mobile controls, visual cap material/silhouette, full game frame-time and subjective smoothness remain unverified. Do not substitute these CPU checks for visual acceptance.

## One formal cumulative package
`r87-clean-cumulative-production-20261024`,139files,41,706,694B. BuildID `R87-af22da689447`; manifest SHA256 `01d3fbf422d27bfbc9fce1218c0004767478368ef3ffe74b1a7bdacf48299fab`. All files and provenance independently rehashed locally. Root and subpath builds used new empty output directories; existing Vite/main deployment configuration unchanged. No main/Pages/credential operations or self-directed cleanup occurred.
