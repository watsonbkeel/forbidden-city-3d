# Chuanxin main hall implementation plan

Approved spec: POSITION-FINDINGS.txt and parent 2026-11-01 17:22 minimal-single-hall authorization.
Goal: source-backed five-bay south-facing yellow hard-gable hall, visible four folded centre leaves and sill windows, low physical steps, no invented rear buildings/court gates.
Architecture: dedicated ChuanxinHall.js using CourtKit's ordinary triangle ownership/finish; unique integrator owns ZoneBase registration. No global controller, rivers, roads, existing walls or contacts changes.
Tech: existing Three.js, TriangleSupport, native CollisionManager.
- [x] Red component tests: absence, own identity, fit-envelope, four leaves, triangle ownership and atomically guarded registration.
- [x] Build supported shell and photo-derived front, explicit fitted dimensions and interactive opening; keep empty interior.
- [x] Component + actual-World QA before-finish injection: entrance both directions10/60fps walk/run, wall negatives, original adjacent routes; quantify contact not relax thresholds.
- [x] Export/render two native-mesh CPU views and inspect; targeted components/World pass. Production hook and integrated build delegated to unique integrator.
- [ ] Freeze source/evidence, independent Astra review; hand one-module hook to unique integrator.
Risks: low stair running contact; hidden roof broad boxes; hard-gable end alignment; duplicate/foreign registration; accidental route/river overlap. Tests pin these; no GPU acceptance claim.
