# R58-A · FC-06B1BADE77 熙和门 courtyard corbels

Status: **VERIFY_PENDING**, not whole-building or current-2026 acceptance. Baseline: `26f67a6655df110d2b530a10d55ce10e27157b82`; final source SHA-256 values are in `proof.json`. Parent integration owns full-world and browser acceptance.

## Evidence → difference → correction

Actually viewed on 2026-10-22:
- Own detail [熙和门雀替](https://img.dpm.org.cn/Uploads/Picture/dc/13153.jpg), SHA-256 `466956d36e5a567f40ba5fefffef8a0a427cf7801341f49ae8d035a8548fba0f`: flat beam contact, dropped near-column heel, and scalloped rising free edge.
- Own [courtyard elevation](https://img.dpm.org.cn/Uploads/Picture/2020/04/20/s5e9d4bf591346.jpg), SHA-256 `523551c73a7ecc618572013e02d6a628e285433b7ebd46a95765e1ceafcf588b`: one pair at each of three central openings, on east/courtyard local +Z, not outward local -Z.

Capture dates unstated. URL path date is not a capture date. Originals stay in private research storage, not this repository or release. No photo texture was added. Close-up supports the silhouette, not relief carving, painted ornament, surveyed width or extrusion depth.

Previously the real gate had rectangular beam rings but no knees. Added six closed, curved/scalloped extrusions in `SideGateExteriorDetails.js`, called only for `g.profile === 'xihe'`. Fitted width 1.48 m, drop approximately 0.62 m, depth 0.20 m are engineering/photo-fit values, not measurements. Reused the existing caihua material; detailed painting/carving remains unresolved. No other gate receives this contour.

## Retention and checks

- All original attribute/index/transform/material-property streams: SHA-256 `ec269f971abae8dfda2fb4e6b44cb733a25f705180775f4e7c244ee403d69299`, unchanged when excluding the six additions.
- Actual collision/walk/room/map/region stream: `2c2bf458e05992f92c3c51f4513ee0ec5efaa575685a35087110c35989e3d860`, unchanged: 555 colliders, 3 walkables, 0 rooms, 1 map item, 0 regions.
- Source +528 / retained +528 triangles, 6 × 88. Source/candidate triangles finite and nondegenerate. With plaque disabled: 6106→6634 triangles; 12→12 real merged material draws. Xiehe/Jingyun/Longzong hashes unchanged.
- Near-post solid and outer-edge undercut rays distinguish the geometry from a bounding box. All six are actual nearest ray hits from collision-free, ground-supported legal eyes before and after production merge.
- Three passages retain actual geometry head/body clearance in all four cardinal orientations; production FirstPersonControls round trips at 30/60/120 fps retain minimum sampled rendered head distance approximately 3.30 m; focused existing component tests cover both actual ramps and open/closed doors. Shared materials are never disposed; source geometries are fresh and released exactly once.
- Red-first failure is recorded in `red-test.txt`; green commands/results are in `focused-test.txt` and `existing-bounded-test.txt`. Existing pruning count expectations changed only by the proven 528-triangle/six-mesh addition; its 966-triangle covered-face removal stays exact.

Commands:

    node --test tests/current-state/r58-xihe-corbels.test.mjs tests/current-state/side-gate-render-geometry.test.mjs tests/current-state/r58-xihe-corbel-routes.test.mjs
    node --test --test-name-pattern='^(?!full )' tests/current-state/side-gates.test.mjs
    node scripts/r58-court-facade/export-diagnostic.mjs xihe

## CPU evidence and open limits

`xihe-courtyard-wide-{before,after}.png` and `xihe-curved-pair-{before,after}.png` are actual bounded component CPU z-buffer diagnostics with the same recorded cameras, not browser screenshots or visual acceptance. Flat diagnostic colors do not evaluate runtime textures, lighting or fine painting. The before builder is loaded directly from the stated Git baseline and checked against frozen hashes; no before geometry was invented.

Actual browser same-camera/real textures and cumulative-world acceptance remain pending. Full vestibule framing, end-window subdivisions, reverse face, roof brackets and carving are outside this correction and remain open. No roof, gate profile, nameboard, route data or shared navigation file changed.

Process exception disclosed to the integrator: the initial unfiltered existing side-gates suite included a full-scene collision construction test. It ran once before that hidden scope was noticed. Subsequent invocations explicitly exclude full-zone/full-scene tests. No production build, package, browser, push or deployment ran.
