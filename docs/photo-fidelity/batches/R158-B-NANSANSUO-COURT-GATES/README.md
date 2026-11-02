# R158 — three independent Nansansuo south courtyard gates

Base source `e35789c207621b2b0ea1be4a56052339e5048fc4` equals remote `2cbf123901368438493dab71349c83632258133c` by the retained full-tree readback receipt. This candidate does not repeat the finished common gate or three front halls.

## What remains of the original12
- FC-C640AE8651: group/region, not another building. Still no full three-stage reconstruction.
- FC-B0B56A63EE: actual common gate already installed at(-285,20), retained unchanged.
- FC-172C8CBF68 / FC-C1914091EC / FC-2E6207278C: front halls12/14/16 at z39, now three-bay green xieshan, retained unchanged.
- FC-3F2EBD1B02 / FC-4642F5088E: named rear shells13/17 at z68.9 exist, but middle/rear official-stage mapping remains unresolved.
- FC-1DB501EB23: middle north shell15 exists; its compound repository name does not prove equivalence to FC-5E024932AE. Do not duplicate it.
- FC-D4F3E359DE / FC-B875FF665E / FC-D2A4662D07 / FC-5E024932AE: no independent runtime declarations. These four audit records are **not** authority to build four more halls or infer a third row.

The original outer court rectangle has no interior walls/gates or side halls. Middle/rear main-hall stages, E/W three-bay wings, well pavilions, ear/value/service buildings and black rear-hood roofs remain omitted or unresolved. The named middle well and middle hall have specific official photos, but no defensible binding to the existing two model rows: they are deferred, not declared demolished. The documented1950s removal concerns gate-front ancillary rooms, not the principal groups; no such rooms are rebuilt.

## Evidence / engineering boundary
- [DPM named building page](https://www.dpm.org.cn/explore/building/236452.html): three separate glazed gates south of the individual courts; E/W narrow forecourt north of the common gate. This is distinct from the common three-bay gate.
- [Official aerial](https://img.dpm.org.cn/Uploads/Picture/dc/4647%5B1024%5D.jpg): three small gate heads and the connecting transverse red wall are visibly present. Source SHA256 `aca389dae76c3927951c2cf7462021e14a13609c5a09210c7e7fdba0afd0ae7d`.
- [Official visitor diagram](https://img.dpm.org.cn/static/themes/image/xf/map3.jpg): corroborates three separate entrances; not a measured plan. SHA256 `e3c8a08d63b4f254657b668022cab24eb5eedfce421052f1a73f291163864796`.
- [Official middle-hall photo](https://img.dpm.org.cn/Uploads/Picture/dc/7996.jpg) and [middle well photo](https://img.dpm.org.cn/Uploads/Picture/dc/7997.jpg): distinct subjects; not copied onto the front halls or assigned to the unidentified north row.
- [DPM2020 research](https://www.dpm.org.cn/Uploads/File/2020/11/12/u5facb56c07c8f.pdf), p142, distinguishes retained principal/wing types from demolished gate-front ancillary rooms.

Actual ordinary World pre-scan found only the two existing perimeter walls in z29.3–30.7;21 interior samples were ground0 and unblocked. Therefore the new centerline is **fitted** to z30, on retained front axes x-317.4/-285.4/-251.8. Fitted portals2.6×2.8m, walls3m high/.6m thick, plain cap top3.8m. Ground-level openings add no stair or walkable. Existing common north toe26, transverse route z28.5, front south toes31.26 remain clear. This is a reversible playable fit, not a surveyed gate size/position, precise glazed design, leaf pose, current public-access claim, or whole-group acceptance. Door leaves, studs, reliefs, finials, plaques and hidden back details are withheld.

## Implementation / integration
Only new `NansansuoCourtyardGates.js` runtime module. It validates actual retained declaration/frame source, refuses occupied strip or duplicate installation, stages all additions, and rolls back late failure. Adds3 one-portal small gates and4 connecting wall segments; no longitudinal courtyard partitions or third row. Every new box and closed cap has full actual source-triangle contact, including upward header impacts; no old global AABB ceiling behavior is changed. No new walkables/rooms/maps/plaques. All original geometry/material/transform streams and old collider/support references remain unchanged.

`PROPOSED-SHARED-HOOK.patch` is **not installed here**. The sole integrator adds its import and one terminal call after `finishNansansuoFrontHalls`, before `kit.finish`. Component tests use actual retained item10/11/12..17 dispatch plus the front-tail adapter, then explicitly call the isolated candidate; this is not a normal installed World pass. Final installed ordinary-entry World/routes and clean build belong to cumulative integration.

Raw logs, full controller frames, CPU exports/images and pre-scan are local-only at `r158-nansansuo-doors-evidence-1823/`; no source image pixels or raw reports are committed. Final evidence summary follows after verification.

## Final finite verification

- Genuine missing-feature baseline4/4 RED; later actual jump/header RED caught the new ordinary-box ceiling gap and was fixed only by new-module complete triangle owners. No global contact change.
- Final **76/76** targeted tests: new8 + existing common-gate37 + existing authenticated-front-contact31;0 failed/skipped/cancelled. Real new FirstPerson/Collision28 routes (24 portal W/S×walk/sprint×10/60 plus4 transverse), **4562 frames**, max absolute foot/ground gap **0m**. Airborne header and high-drop cap tests pass at10/60Hz.
-39 new actual triangle owners,456 triangles,2 private materials; no new supports, rooms, region/map or plaque records. Original visible attribute/index/material/transform stream and original collider values/references explicitly preserved.
-4 before/after CPU albedo diagnostics personally viewed; final component-fixture triangle/material/camera streams exactly equal those images. Old null un-atlased text placeholders excluded and disclosed. Not GPU or production-texture acceptance.
- Browser module bundle succeeds (79ms); exact shared-hook patch `git apply --check` passes. No full-site build or installed ordinary World is claimed by author.
- Runtime source SHA256 `bbfee6052becf7b06533b3033600262f7324efb26fc73bdeafeea6000bb9791c`. All ten old source/data pins are byte-identical to e357 (see EVIDENCE-IDENTITIES).
- Local raw final76 TAP SHA256 `50a34b51d020b7ce0a4e97b75a805899b258e1cde8a80a90d0a5e405f5217390`; controller frames `821fd1341b8d52a2d605b4048115fee0d53328d9d5e3edf04de86859eda61e36`; preserved feature RED `1a733ea2283fc0148427284ddd63efa355c4976d5e726ba823b892b2ecc6eb62`; airborne-header RED `a768c950d744cd0c0efc7660f5334d05712c410128571df125c605b45fa072e9`. Full raw remains local-only.

### Sole-integrator normal entry check
Apply exact tail call after successful front adapter, then use the existing12 common-gate→z28.5→each original front-axis z38→return routes, no injected candidate fallback. Each crosses the corresponding new portal at z30. Add z28.5 x-330↔-239 transverse walk if desired. Preserve whole-frame≤.3m assertion and original6 stair grants; normal metadata should contain exactly one `nansansuo-courtyard-south-gates` record and39 `nansansuo-courtyard:` owners. Cumulative clean build still required.
