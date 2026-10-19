# R32 延禧宫 / 灵沼轩现状遗址首版

## Scope and status

This replaces the incorrectly complete traditional palace at the existing 延禧宫 anchor with a recognizable, low-detail stone-and-metal ruin. It does not reconstruct the intended completed “crystal palace,” reopen the protected pool, or claim a surveyed present-condition replica.

Owned implementation: `src/scene/palace/special/YanxiRuin.js`. Owned tests: `tests/yanxi-ruin.test.mjs`. No changes to the existing correct historical card are required. This module does not modify the gate, surrounding side/rear buildings, court walls, shared hall generator, or navigation implementation.

The public building article describes both the earlier palace and the proposed water-palace scheme. The model follows surviving geometry visible in the inspected official photographs, with the more specific conservation paper resolving the five pavilion types. In particular, it retains the small surviving central cap. “Unfinished” does not mean every surviving cap should be removed.

## Evidence inspected before geometry

| ID | Official source and inspection | Use / boundary |
|---|---|---|
| S1 | [延禧宫](https://www.dpm.org.cn/explore/building/236535.html), including its [south-facing photograph](https://img.dpm.org.cn/Uploads/Picture/2020/07/03/s5efefedcac36c.jpg) | Distinct stone lower shell, genuine arched openings, dark exposed upper metal, central surviving cap, recessed pool and visitor boundary. The article supplies the four internal cast-iron columns. Photograph date is not independently established. |
| S2 | [探秘灵沼轩](https://www.dpm.org.cn/subject_600/buildingdetails/253798.html), including its [official detail montage](https://img.dpm.org.cn/Uploads/image/2024/08/30/s5f71992a38953-QIDtxodJU6.png) | Confirms metal/stone identity and open framing. Not a dimensioned drawing. |
| S3 | [故宫灵沼轩金属构件的病害分析及其成因研究](https://img.dpm.org.cn/Uploads/File/2018/06/05/u5b1657f3946eb.pdf), museum journal 2013 no. 2, printed pp. 125–126 / PDF pages 1–2 | Printed p. 125 distinguishes south six-sided corner pavilions, north eight-sided corner pavilions, and the central double-eaved octagonal pavilion. It distinguishes the basement and two above-ground levels. Printed p. 126 supplies the 18 exterior cast-iron columns; the south photo and metal detail photographs were visually inspected. Their exact column axes are not supplied here. |
| S4 | [遗址类石质文物三维数字化探索](https://www.dpm.org.cn/ydyl/personnel_training_w/detail/260045.html), 2023-07-05; its [scan illustration](https://img.dpm.org.cn/Uploads/Picture/2023/07/05/s64a56c56442b8.jpeg) and [arch condition photograph](https://img.dpm.org.cn/Uploads/Picture/2023/07/05/s64a56b9db840f.jpeg) | Both images were inspected. The scan corroborates the open, unequal surviving upper outlines and below-grade relationship. The arch photo verifies a real thick masonry intrados. These are reference illustrations, not downloadable survey geometry used by this model. |

Reference photographs/PDF were read as research only and are not bundled, traced into a texture, or re-published as project assets. SHA-256 identifiers for the inspected references:

- S1 south image: `542acafe74c6d0a924f90e6c5d314e633e4dc0b12838879a1c3c06594a9f5a98`
- S2 montage: `42812df3c1069f054c9022c7c9dcb10f1e83b412a71a40d329d17f471584a3f6`
- S3 PDF: `28ece364b521702d2149b00d6049ee6f4683dc04ecfb8898d909b9266a4ab9ae`
- S4 scan illustration: `adcba54461852ea514cb22cfb078e09f5d69ef08bedcc4198ae7218af7e282e2`
- S4 arch photograph: `8c0080f83b14b8e284ea4e082750c13fc2e30b2e413f2d4305798445e720185e`

## What the first geometry actually contains

- Pale, thick lower masonry with extruded arched door/window apertures. Holes and their intrados are real triangles, rather than painted dark patches.
- A bounded below-grade dry basin, physical stone retaining faces/coping, basement openings, and the visible protected front stair.
- A continuous thin modern-style safety railing around the pool. Its collider is the railing boundary, not an invisible filled courtyard box.
- Eighteen exterior and four interior iron column abstractions, with documentary counts but explicitly fitted positions and sizes. Dragon relief detail is unresolved and is not invented.
- Four polygonal corner structures: six-sided south frames with partial crown remnants, and lower eight-sided north remnants. Their heights and surviving-sheet placement are photo-fits.
- The two-tier central octagonal iron structure, projecting balcony ring and small surviving pale metal cap.
- An exposed upper beam grid. No complete broad tiled roof, glass room envelope, aquarium water, imperial throne, generic palace interior, or invented intact upper storeys.
- Exterior polygon wall segments are clipped at their rectangular-core joins. The code does not leave a second full rectangular wall running through the tower windows.

The current view is intentionally not given random “ruin” rubble, jagged fractures, or fabricated missing blocks. Precise cracks, every original fastener, sculptures, decorative metalwork, wall reliefs, tile patterns, and the exact completeness of the upper platform remain unresolved. The central cap uses a faceted low-detail fit rather than a documented ornamental profile. The north/back treatment is less strongly resolved than the photographed southern elevation.

## Coordinate, dimension, and access contract

- Existing anchor remains `x=-148.2, z=324.9`, south orientation.
- Registered core remains `16.3 × 11.7`. It is inherited footprint registration, not asserted as a measured column grid or an old-palace façade width.
- Main wall, member, level, tower radius, basin depth and retaining/guard dimensions are all engineering/photo fits. `dimensionStatus` is `registered-envelope-photo-fit-not-survey` and `currentConditionAccepted` remains false.
- Basin ground opening: `22.7 × 18.1` centered on the anchor. Guard envelope: `23.1 × 18.5`. The local first-version envelope stays inside the existing courtyard; it must still be checked against the integrated neighboring building geometry.
- This module adds zero rooms and zero walkable/rescue surfaces. Its protected stair is visible but is not a public entry invitation. The stock collision ground solver is not being expanded into a below-grade walking system.
- Suggested viewing point is ordinary ground at `(-148.2, 312.45)`, looking toward `(-148.2, 4.7, 324.9)`. It is a local CPU-safe model point; actual-site visitor access and integrated teleport acceptance are separate questions.
- Broad upper framing is not given an invented walkable roof route. Flight/whole-world clearance requires the integrated checks.

## Exact integration contract

1. At the start of `ZoneBase.buildHall`, dispatch explicit `structure==='yanxi-ruin'` or any present `ruinProfile` field to `buildYanxiRuin(this.kit, item)`. The latter condition ensures malformed profiles fail instead of silently falling back to a generic palace.
2. The replacement JSON item is:

   ```json
   {"kind":"hall","name":"延禧宫","structure":"yanxi-ruin","ruinProfile":"lingzhao-current","x":-148.2,"z":324.9,"w":16.3,"d":11.7}
   ```

   Delete its previous `roof`, `pad`, `ph`, `colH`, `enter`, `throne` and `interior` fields. The dedicated builder rejects generic overrides and anchor/size drift before registering geometry or materials. Return value is `{f,g,PW,PD,top}`; `f` is already owned by the kit root, and map/collider registrations are already complete.
3. Import `YANXI_RUIN_GROUND_CUTOUT` into the environment ground builder and add its one rectangular `THREE.Path` hole using the existing ground convention `shapeY=-worldZ`. This is essential: without a real cutout, the global y=0 ground occludes the below-grade basin. Derive the hole from the export rather than a second copied dimension set. Never patch around it with a black floor decal or raised fake pool.
4. Use `YANXI_RUIN_NAVIGATION` only after integrated safety validation. R31 `Teleport.geometryFor` only specially consumes Qinan exterior metadata; merely adding Yanxi map metadata does not reroute its old generic hall approach. Add explicit Yanxi handling or temporarily route the existing action to the verified 延禧门 approach. Preserve the correct historical prose and avoid a new room/entry claim.
5. The map name remains `延禧宫` for the existing place binding. Its registered core and separate protected-pool footprints are exposed in the map item. Architecture evidence/budget records survive `CourtKit.finish()` in `group.userData.architecture`.
6. Five new materials are kit-owned and disposed through the existing kit lifecycle. They intentionally have no `roof_tile` or `kit_roof` material names. The legacy roof-only distant silhouette therefore does not fabricate a yellow palace roof for this object; a dedicated distant ruin silhouette is not included in this bounded module.

The official photo shows present-day buildings on the sides and behind the ruin. Their detailed modern identities are not fixed by this core-only file. Retaining, relabelling, omitting, or rebuilding the old generic side/rear items is an explicit integration decision; the new core must not be described as validation of those other buildings.

## Tests, budget, and acceptance remaining

Test-first record: `node --test tests/yanxi-ruin.test.mjs` initially failed because the dedicated builder did not exist; implementation then made the geometry tests pass. Current local suite: 8/8 pass.

The suite executes the real Three.js builder and material merger, and checks:

- Exact inherited anchor/envelope and six/eight/eight-sided topology
- Invalid inputs and generic overrides fail before registration
- Real arched apertures and intrados from both faces, including after merging
- No broad completed roof across sampled upper sky openings
- Real below-grade floor and banks; continuous pool boundary collision and unobstructed exterior ground samples
- No rooms, invisible pool cover, rescue surface, or new interior walkable
- Finite, nondegenerate actual triangles and tagged-role accounting
- Correct geometry/material ownership on repeated build/merge/disposal

Final local geometry accounting: **11,672 triangle instances, 612 pre-merge mesh instances, 5 merged material buckets**. Explicit hard local caps: 12,000 triangles / 650 pre-merge meshes / 5 material buckets. This is a local replacement budget, not a claim that whole-scene performance is already accepted. Unloaded roof silhouettes and full loaded geometry are alternative states, not additive savings.

Three offline CPU geometry projections (south, southeast, northwest) were inspected to catch shape/normal/join issues. They were not browser captures and do not establish integrated lighting, textures, visual performance, site conditions, or route acceptance.

Integration must still verify the ground cutout, one ground-level gate-to-pool approach, southern and oblique visual capture in the actual scene, protected-pool rejection, navigation landing, neighbor clearance, zone unload/reload, and whole-scene geometry/performance. No browser runs, Git writes, uploads, or deployment were performed by this module task.
