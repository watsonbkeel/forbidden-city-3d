# R124 front ensemble implementation plan

> For agentic workers: REQUIRED SUB-SKILL superpowers:executing-plans. Sole writer inline; independent reviewer remains read-only.

**Goal:** Deliver the approved source-fit main front enclosure and three-facade ensemble without moving R123 circulation.
**Architecture:** A single dedicated module replaces only exact selected pre-merge meshes. Original collider/room/walkable registrations stay unchanged; new materials are per-kit owned, no texture allocation or shared material mutation. Main builder and two exact front-wing finishing calls are the only entry points.
**Tech Stack:** Three.js procedural closed boxes, real TextureLibrary, node:test, existing CPU z-buffer and actual-body drivers.
**Spec:** DESIGN-PROPOSAL.md; root approved A/B/C at08:37 UTC.

## Global constraints
- Retain all frames, openings, collider/walkable/room arrays, beds and actor data exactly.
- At most4000 net triangles and6 owned materials;0 new textures/requests/colliders. Measure, do not treat budgets as PASS.
- Main/window/door and wing facade are original schematic photo-fit, not survey or exact carving. No new inscriptions or inventory.
- Existing transparent glass stays transparent/depthWrite=false/DoubleSide; actual GPU compositing unverified.

## Review focus
- Wrong target or frame must fail closed before replacing any mesh: identity negative test.
- Transparent glass must not become opaque or leak owned materials: material flags/disposal test.
- Main entry and tight side turn must retain contact arrays: old/new exact snapshot plus actual routes.
- Shared bed/current source binding must remain ready and bad-owner cases reject: retained R118 target/oracle.
- New detail must not change shared materials or resource ownership: baseline hashes/maps and high/low lifecycle.

## Task1 — pin RED and baseline
- [x] Capture baseline actual source, collider/walkable/room/render/owned-resource signatures and approved targets before product changes.
- [x] Write tests/r124/front-ensemble.test.mjs: required skirt/glass/nested cells/front-wing sill/pale band and0newtextures; current product must fail those assertions while retained snapshots pass.
- [x] Run node --test tests/r124/front-ensemble.test.mjs; retain RED raw.

## Task2 — smallest target-only geometry
- [x] Create src/scene/palace/special/ChuxiuFrontEnsemble.js: applyChuxiuMainFront(kit,f,item,mats), applyChuxiuFrontWing(kit,zoneId,itemIndex,item,built). Return built unchanged for non-target; strict validated target.
- [x] Main call in ChuxiuHall before budget/structure finalization. Wing call in ZoneBase after existing unknown-inventory finishing, only indices25/26.
- [x] Replace selected door volumes with same-envelope closed wood/glass pieces; nested window bars, sill/glass/upper lattice front-wing panels and green front columns; pale front beam fields confined to original volume. No global kit changes.
- [x] Run RED tests green; test wrong frame/non-target, same envelope/retained contact arrays, disposal.

## Task3 — actual scene and circulation
- [x] Same seven cameras high/low and independent visual/source scope review; actual triangle/cost inventory.
- [x] Native-controller main/front-wing entry/exit/side turns/corridor→rear at10/30/60, source-bound actualtri oracle; retain inherited contacts separately.
- [x] Retained R118 source/lifecycle and complete two-actor routes on frozen runtime; not a global zero-intersection claim.

## Task4 — measured cost and delivery
- [x] Paired full west-six high/low cost/geometry/material/texture/ownership and fresh all-ready startup.
- [x] Necessary current-state/protected/motion/resources gates with missing harness directories prepared; classify expected semantic/source-lock conflicts without editing expected.
- [ ] Final freeze/build tail: R124 metadata/documents/evidence prepared; final clean commit and external exact build identity follow. Parent owns upload.

## Execution ledger
-08:40 baseline RED first found a test serializer mismatch (`undefined` map names omitted on disk); corrected both sides to JSON semantic records, original raw retained. Corrected RED5fails/1retentionpass before product implementation.
-08:43 initial implementation6/6green; actual delta3156tri/6materials/0textures. No visual or physics completion claimed from this.
-08:46 reviewer notes collider bounds/keyset is not full owner proof. Added complete JSON numeric collider payload to snapshots (actual Xiqing sourceFaces/normals/IDs/ramp included); re-read frozen R123 rather than fabricate prior baseline.
-08:53 independent visual scope accepted corrected connected-detail98dbe; release-only to0773 (R124) and runtime frozen.
-08:59 body pilot exposed existing controller approach/phase issues. Ruling: preserve physical code and document same-input R123 counterexample, add explicitly scoped porch/gallery door tests, retain old long integrated route. This does not remove or declare the failed outside approaches repaired.
-09:01 independent final0773 actor10Hz fresh complete1430, complete JSONbyteexact R1233cf;30/60 running. Writer does no competing world/cost work during reviewer CPU window.

-09:20 all source/functional/cost gates terminal, source0773 stable; whole standard gate1076/213 unchanged. Startup clean-source f20feda2 completed. Final source commit/build tail will be external to avoid self-referential commit rewrites.
