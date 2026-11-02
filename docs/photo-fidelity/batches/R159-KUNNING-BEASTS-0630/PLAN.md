# Kunning seven-beast rows — bounded implementation plan

> Native author, one independent Astra review; no child agents, shared integration, upload or full application build here.

Goal: replace Kunning's generic 5-upper/3-lower animals with a seven-per-corner count profile, preserving all other roof/body/physics.

Spec/approval: integrator 2026-11-02 06:30 UTC accepts the two separately visible target tiers in official photo `s5e997ecca81fc.jpg` (SHA 91c290932497b85a94d0c60f7294c97530992a0c891c273e09f4a5fdf8a88555). The far right upper and lower corners each show seven animals behind a rider; the overlapping other building at upper right is excluded. Zheng Lianzhang, *仙人走兽与大吻*, https://img.dpm.org.cn/Uploads/pdf/1602/T00091_00.pdf, states seven for Kunning. Back corners follow the building-wide text, not individually photographed verification. Species, carving, hidden corners, measurements and GPU remain unverified.

Architecture: add a named Kunning profile selected only by canonical `KunningPalace`; extend the existing exact shape guard; use the unchanged Qianqing full-triangle seating implementation for this explicit profile. Keep old Qianqing/Taihe/Baohe/Zhonghe paths and all generic roofs byte-equivalent. No general roof refactor. Alternative generic count edit rejected because it alters unrelated buildings; adding another roof rejected because it duplicates geometry.

## Steps
- [x] Record unchanged roof/physics baseline and exact source pins. Tests precede implementation.
- [x] RED: missing seven-count selection; profile shape negatives; actual canonical shell hook; source retention.
- [x] Implement only `KunningWalkingBeasts.js`, `HallWalkingBeasts.js` explicit selection and `KunningPalace.js` one roof option. Do not modify seating algorithm.
- [x] GREEN: 56 bodies/heads and 8 retained riders, raw non-animal attributes equal, exact other-profile signatures, outward heads, seated bottom triangles, no overlap, low LOD unchanged and one-owner disposal.
- [x] One necessary normal World retained entry/bypass/gate route pass and complete collision/support hash against parent; no S inventory or broad whole-zone claim.
- [x] Two small actual-model CPU before/after roof diagnostics, pin sources/raw and concise summary; freeze for Astra. Cumulative hook/build/release stays with single integrator.

Review focus: neighbour roof mistaken for Kunning; hidden corner counts overclaimed; altered Qianqing seating; changed non-animal roof stream or physics; low-detail resource leak. All covered by source boundaries or dedicated tests.

All bounded author tasks are terminal; Astra and cumulative build are explicitly external/pending. First incorrect-library World pair retained; corrected factory only, same four paths/unchanged production.
