# 文渊阁三层座榻 — source and acceptance ledger

Safe parent:7898b74f1bc409a65f157f11188ec4a0df822a3d. Original object FC-FD3D76E74D; existing outer-east 文渊阁 / remainingProfile wenyuan / retained upperFloor5.5. These are existing fitted coordinates, not surveyed dimensions.

## Personally inspected official evidence
- https://www.dpm.org.cn/explore/building/236513.html opened this pass. Official gallery labels1538 “文渊阁三层内景”;1537 “文渊阁一层明间内景”. Text identifies a third-floor central御榻 but does not establish modern entire inventory.
- https://img.dpm.org.cn/Uploads/Picture/dc/1538%5B1024%5D.jpg directly opened and cached full image personally viewed. Local private reference wenyuan-floor3.jpg SHA2560531b88e942d4cc0e82c9637076313898fd2992412fe819f8db4b7b09cd6977f. Yellow horizontal seat covering, central scalloped yellow back cushion, low timber rectangular railwork above dark lower panels visible.
- https://img.dpm.org.cn/Uploads/Picture/dc/1537%5B1024%5D.jpg separately opened/viewed as negative level-binding control. SHA2562e8b70ff7a95d25d73f75d11b54f307ee9ef1e23ed13e14b8f001155b0a78ad5. Its throne/screen/desk arrangement is NOT transferred upstairs.
- Photography dates and gallery upload dates not specified; do not infer from file names. Dated-current-display inventory is unknown. No official image copied into project assets or committed reports.

## Difference → implementation → verification
1. Photo: yellow horizontal upholstery; parent: plain timber base → split original base volume into dark lower timber and opaque yellow top cushion → union of original Float32 envelope preserved, source collider unchanged.
2. Photo: scalloped central yellow cushion in front of tall timber backing; parent: one plain rectangle → retain opaque rectangular wood backing, add shallow shaped yellow cushion inside original bounds → no corner cut-out/hole, curve-silhouette test and retained bounds.
3. Photo: low geometric side rails over dark panels; parent: two featureless side boxes → two backed dark side fields with physical rectangular low relief, lower panels and edge frames → all relief solids overlap backing; no advertised pass-through aperture or new collision.
4. Existing R143 high posts/horizontal/frieze already represent source-visible upper framework → retain byte-equivalent meshes and metadata, do NOT call it a new four-poster canopy.

Whole four-part low seat ensemble is treated. Original position, overall footprint, all4 original component envelopes, ALL colliders/walkables/rooms/regions/map rows, stairs/floors/cases/ground-floor furnishing and non-seat outer-east meshes remain. Exact carving, embroidered motifs, rug, objects on seat, wall writing, room-wide partition extent and book inventory remain unmodeled/unaccepted. No visitor access claim. Upper automatic destinations remain WITHHELD_PENDING_REAL_CONTROLLER_ACCEPTANCE.

## Cost / engineering boundary
Source hall meshes727→801, triangles11604→12680;4 private opaque MeshStandardMaterials; no textures/no new lights. Seat4 source boxes→78 small meshes, combined by normal material merge. These are CPU source counts, not draw-call/GPU/memory performance measurements. No public image assets, runtime dependencies or shared material tint changes.

Strict source identity/geometry/draw-range/morph/index/metadata and eventful-retirement guards. Geometry ownership includes all Object3D geometry carriers, index/attributes/morph/interleaved data and backing buffers. Staged private allocation failure leaves source scene untouched and disposes allocations once. Finalizer runs after source/physics registration, before normal merge.

## Acceptance boundary
Automated evidence in reports/major-pilots/wenyuan-seat; final result summaries written after runs complete. Browser/GPU before-after matched views, raster lighting/textile appearance and real user movement observation remain VERIFY_PENDING. No whole hall, floor, room, parent region or original MASTER entry is closed by this local ensemble improvement.

## Resumed final validation — 2026-10-29 UTC

- Focused final suite: 29/29 passed (the original 28 reviewed tests plus the World receipt test).
- Actual World/controller retention: 96/96 parent/candidate trajectories equal. Both runs contain 21 arrivals and 24 illegal starts; this preserves existing behavior and is NOT successful route acceptance.
- Outer/Wenyuan regression: candidate and exact safe parent each 768 tests, 732 passed, 36 failed. Failure names and locations match exactly.
- Repository current-state: candidate and exact safe parent each 1331 tests, 1113 passed, 218 failed. Failure names and locations match exactly. The aggregate is NOT green; pre-existing source/golden/route failures remain open.
- Three-base in-memory Vite compile and exact HTML/entry/build-info identity checks passed for `/`, `/forbidden-city-3d/`, `/gugong/`. This used the dirty candidate atop safe parent 7898b74f, as recorded in compile-memory.json; no deployable output or browser verification was produced.
- Production-source hashes still match the reviewed candidate. Unrelated WIP hashes and all six pre-existing dirty shared reports remain unchanged by this resumed validation. No reset, push, deployment or main modification.
- Evidence: focused-final.log, resumed-validation.log, world-{parent,candidate}.json, aggregate-comparison.json, compile-memory.json in reports/major-pilots/wenyuan-seat.
- GPU/raster matched-view acceptance and real continuous three-storey user routes remain VERIFY_PENDING. Upper automatic destinations remain WITHHELD_PENDING_REAL_CONTROLLER_ACCEPTANCE. No whole-hall or region acceptance is claimed.
