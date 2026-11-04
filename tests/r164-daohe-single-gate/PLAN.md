# Daohe single gate implementation plan

> Sole inline implementer, independent final reviewer assigned by parent. Base 72f50a05b012fc36ba08ffc3193ae73f71d6c6ad, existing isolated worktree.

Goal: replace only the generic Daohe wall gate with a distinguishable source-backed glazed entrance while retaining existing passage, adjacent gates and all cumulative work.
Architecture: one dedicated staged Three.js builder and one exact ZoneBase dispatch. No generic physics/data changes, no new destination or indoor room.
Sources: official NingShou glazed-gates article and construction study establish identity, west-side location and glazed wall-gate class. Photographer tsihua public preview 20231223151246536201 clearly shows 蹈和門 on the gate; it supports red/yellow pier frames, two green horizontal fascia bands, pale stone foot, and yellow tile canopy. It is non-official and is reference only, never shipped as texture.
Fit: retained (-233.5,304.3), west orientation, 3.6m clear opening, 6.4m wall gap. Simplified low canopy, dimensions, rear, plain fields and fully-open leaves are game fits. No copied carved ornaments, unverified Manchu or reconstructed nameboard. Map retains formal name. Do not claim surveyed/current opening/whole object/GPU acceptance.
Alternatives: recolour generic leaves brick bases and unsupported generic board; full carving/calligraphy lacks authority and is low priority. Chosen bounded body/entrance fits current scope. User explicitly requests autonomous implementation without design pauses.

- [x] Capture 72f non-target raw/physical/map/roof snapshot and frozen exact source, baseline local routes/landing.
- [x] Write and observe identity/stone-body/frieze/unchanged-map/passage tests red against current generic gate.
- [x] Implement DaoheGate.js with pre-owned geometry/material staging, exact item5/wall41 guards, physical surfaces and one dispatch; do not edit Zhenshun or Xiqing.
- [x] Component source drift and failure cleanup; actual local controllers positive/blocked/mutation control, jumps and merged visibility; atlas remaining-name bindings.
- [x] Actual NingShou retained objects/roof + cumulative routes + old/new Daohe landing.
- [x] Bounded prior regressions. No World/browser, no blind micro-adjustments.
- [x] Independent review (29 formal) and documentation/I29 partial-only update.
- [ ] Exact Pages-base clean build/HTTP after committing the reviewed tree.
- [ ] Upload new development branch with full file readback; keep72f/main unchanged, no deployment.

Review focus: west transform vs actual wall plane; neighbouring Xiqing/Lushun wall gap preserved; open leaves not entering 3.6m route; source mutation rejection before commit; third-material/late-contact failures dispose partial objects; UI name/landing retained despite plaque omission.

Ruling: chosen west-wall backing is centred on the existing wall x=-233.2 (local z=-0.3), not copied from the north-wall placement in Zhenshun. Formal maps and old routes are byte/frame checked. Generic Daohe plaque omitted because the actual vertical calligraphy/Manchu panel is not reproduced; remaining6 names retain atlas mapping.
