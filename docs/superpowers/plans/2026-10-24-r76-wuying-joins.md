# R76 Wuying inner joins plan
> Execute inline using TDD, review before remote upload.
Goal: specialize the two existing hall-to-connector interfaces, not create a connection.
Architecture: private validated CourtKit opt-in for wuying-front north and wuying-rear south only. Default hall consumers and Wenhua remain exact. Dedicated SouthCourtHalls selects it. No coordinates changed.
Evidence: actual 2021 official panorama pixels26f/b/l/r,30f/b,36r viewed; XML title confirms 武英殿陶瓷馆. Flat gallery circulation supports removing generic raised thresholds at these interfaces, not historic measurements or current inventory. Existing model datum1.2 retained.
Baseline: R75 local584117f / remote404e9d68 treeb44aeff6 confirmed. Fullworld probe captures128 hall calls with exact mesh signatures and collision/walkable/room/map records before edit.
- [x] Verify target baseline threshold wood boxes0.22 high and buried stairs; record exact removed entities. RED test requires11meshes and1ramp removed per target, no other entity changes.
- [x] Add private validated opt-in, skip target-side threshold and steps at creation, preserving slab/collider/platform/columns/displays/externaldoor. GREEN128consumer exact comparison and malformed binding checks.
- [x] Actual fullworld diagonal/offset/reverse routes at1.2; lifecycle/lights and existing flight descent regressions. Preserve raw failures.
- [x] Strict successor, current151failure comparison, expanded shared-consumer suite and serial4nightworlds; clean cumulative package, independent review and final evidence.
Limits: photo-guided correction in dated2021 exhibition model. No historic roof/court reconstruction or GPU/mobile acceptance. No deletion/main/Pages.
