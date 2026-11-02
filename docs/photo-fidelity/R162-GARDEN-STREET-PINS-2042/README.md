# R162 — four existing garden-street gates: source-front pins only

This is a small, reversible, partial exterior change. **Neither R162 nor any
whole gate is accepted.** The four existing generic gate bodies, roofs, plaques,
identities, coordinates, routes and physics remain untouched. There is no
production hook in this component commit.

## Own source evidence

The implementer actually viewed all four local own-image files with `view_image`
before implementation on 2026-11-02. The catalog mapping at
<https://arch.seu.edu.cn/hcsj/33036/list.htm> (cached lines 244–247) identifies each
image separately. The site is the Palace Museum / Southeast University joint
exhibition; its about page is <https://arch.seu.edu.cn/hcsj/gy/list.htm>.

| Item | Formal name / sourceObjectId | Own page | Local image SHA-256 |
|---|---|---|---|
| garden/30 | 长康左门 / FC-D2B1DB1C8C | <https://arch.seu.edu.cn/hcsj/2021/0325/c33106a365950/page.htm> | `628bd912829c79465d9359737c13c208e54276c7a9b6ee9b94468c570ba0bac4` |
| garden/31 | 长康右门 / FC-E18D4B34CA | <https://arch.seu.edu.cn/hcsj/2021/0325/c33106a365954/page.htm> | `0236a9165484d61d1453a9c448c3868595c4cbb6d3f908ff52444f834612b824` |
| garden/26 | 琼苑东门 / FC-4BC6AD858B | <https://arch.seu.edu.cn/hcsj/2021/0325/c33106a365951/page.htm> | `d407be0cf0e7ccbfa68d388d5a2ad68d7aad3a7a7d16b4d91e29ed1caa31b02e` |
| garden/27 | 琼苑西门 / FC-75C4A83F02 | <https://arch.seu.edu.cn/hcsj/2021/0325/c33106a365952/page.htm> | `303226cd3c4b17e6cc900421fde076895cd5a9c64a0973aefd0a418a021cef3e` |

Each architecture record also carries its exact own-image URL. Official images
are local research only: **no source-image bytes are in the repository/runtime**.

Positive observations: four projecting pins in one horizontal row, red body/face
and gold-colored polygonal edge. 琼苑 images support six-sided outlines. 长康
exact corner count is not asserted; earlier eight-corner research wording is
superseded. The common six-sided coarse geometry is an engineering simplification,
not an exact reproduction of glazed carving.

## Face ruling and uncertainty

- **长康左门 / 长康右门:** source camera cardinal face remains **UNKNOWN**.
  Transfer only the source-positive pins to retained plaque/front **local -Z**.
  This is an **engineering transfer**, not a claim of north/south identity.
- **琼苑东门 / 琼苑西门:** own-photo adjacent buildings and opposite street red
  wall support the garden-inside face, **local +Z**. This is an explicit
  contextual inference, **not surveyed compass metadata**.
- No back-face copying. No invented flowers, corner ornaments, figures, roof
  repair, stone seats, walls, inscriptions or borrowing from neighboring gates.

## Engineering dimensions

All dimensions and color/roughness settings are `ENGINEERING_FIT_NOT_SURVEY`.
Default retained gate: opening width 3.6m, height 4.4m, depth parameter 1m,
actual wall faces local Z ±1.4m. Pin centers Y=4.70m. Nominal X centers were
`[-1.5,-0.5,0.5,1.5]`; actual centers are **`[-1.5,-0.57,0.57,1.5]`**.
The ±0.07m inner shift is the explicitly permitted low-risk plaque clearance
fit: actual old plaque-frame X extent is ±0.42m, so a 0.14m outer radius leaves
**0.01m physical X clearance**. Existing plaque meshes/transforms are unchanged.

Each pin has a closed six-sided red prism (radius 0.118m, projection 0.20m) and
closed gold annular prism (outer radius 0.14m, inner radius 0.118m, depth 0.03m,
from 0.18m to 0.21m outward). No new geometry exceeds 0.21m projection or
0.14m radial envelope. This is high decoration, not a low-body collider, and
makes no promise to repair legacy high-wall collision behavior.

## Interface, ownership and checks

`applyGardenStreetGatePins(kit,frame,{zoneId,itemIndex,item})` admits only those
four exact tuples. Unrelated tuples return false without mutation. Matching
identities require a mutable intact default CourtKit gate and reject duplicates,
tampered geometry/UV/normal/index/material/local transforms/matrices, frozen
arrays, frozen frame/root and incompatible item dimensions before commit.

Validation replays a disposable production default gate using an independent
TextureLibrary material cache with the same texture handles and manifest. It
never updates retained matrices, requests materials from the real cache, or
disposes shared textures/materials. It does not generate a neighboring-gate
artistic template. Staged validation resources are disposed before attaching pins.

Every gate owns two private materials and eight private geometries (32 new mesh
instances / 1,088 triangles across all four). Material names use the stable prefix
`r162_garden_street_pins_` for merged-scene delta identification. They are normal
merge buckets, not `noMerge` exceptions. Normal finish preserves one pins-only
architecture record per gate. Private geometry/material disposal is verified once
both before and after finish; library resource disposal stays with the library.

```sh
node --test tests/r162-garden-street-pins/component.test.mjs
node tests/r162-garden-street-pins/export-cpu.mjs /tmp/garden-front-pins-2042/cpu
for p in /tmp/garden-front-pins-2042/cpu/*.json.gz; do
  python tests/r162-garden-street-pins/render-cpu.py "$p" "${p%.json.gz}.png"
done
git diff --check
```

The CPU exporter/rasterizer shows actual default CourtKit geometry before/after
for every exact identity, from its specified source-facing local side, with flat
library fallback swatches (no texture sampling). The depth buffer reports visible
pixels separately for all four actual pins. Own-source images never enter export.
This verifies diagnostic geometry visibility only: **GPU/textures/runtime lighting,
mobile appearance, full World integration, and whole-gate fidelity remain outside
component acceptance**. Historical project-wide failures remain preserved; only
focused tests are claimed here.
