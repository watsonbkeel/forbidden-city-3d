# R74 Zhaoren exterior and partial court Implementation Plan
> Execute with superpowers:executing-plans; single owner, parent independent review.
Goal: add a three-bay south-facing Zhaoren shell/porch and a bounded visible wall segment without inventing a complete courtyard or raised connection.
Architecture: explicit garden opt-in builds one dedicated CourtKit component. All existing PalaceBuilder/terrace bytes retained. Reversible profile controls local geometry and uncertainty.
Tech: Three.js, Node, Vite.
Spec: official236581 facts, actual s5e9d4cf1e26a9.jpg and T00008_00.pdf pixels viewed2026-10-24. South-facing three bays, front three-bay porch, rear three-room extent and independent walled court. Photo supports columns, sill windows, low stone lip and right wall. PDF supports relative topology but no elevations.
Constraints: no main/Pages/deletion, no books/furniture/NPC, no mirrored Hongde, no invented2mstairs or full enclosure. Old18.2x14.5 estimate notsurvey. New16m fit atx-37,z326 stays westward-coordinate outside existing terrace x>=-28 (geographical east). Ground stays0m; .16m stone lip. Relative historical datum and terrace joining remain UNRESOLVED. Front319..322, main322..330, rear330..333; shortwallx-46.4,z318..324; leave south open. Interior is bare navigable shell, not reconstructed collection.
Review focus: no intersecting existing terrace; Longguang315 ground route unchanged; porch/window solids clear center; no enclosed trapped interior; garden unload/reload and cumulative source strict.
- [x] Task1 red missing opt-in and dedicated module; profile/three bays/windows/low floor/clear return/lifecycle tests; build dedicated src/scene/palace/special/ZhaorenCourt.js and data/architecture/zhaoren-court.json; narrow ZoneBase opt-in; commit passing.
- [x] Task2 real merged world routes Longguang→porch→bare shell→return plus existing Qianqing passages; frozen current-state baseline failure comparison; R72 focused and four night worlds serial; strict R73 successor inventory with negative tests, build and backup; report exact evidence for review before upload.

Review correction: bare enterable shell registers one virtual-tour lighting room with empty NPC spawns and no historical inventory; low/high bounded lamps and actual prebuilt lifecycle tested.
