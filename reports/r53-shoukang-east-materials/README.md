# R53 unit B: bounded material successor

Status: PARTIAL. Source-supported broad material/color fields on the accepted white-model framework, not a completed historic interior, exact replica, or browser/mobile acceptance.

White checkpoint: `8f3f86736fa59dc260eb54cf776882ec15a40a5b`.
R52 ancestor: `2a7c6fd09086e6b73c0745aa7cfca4534bbfd9a6`.

## Visible improvement and limits

The previously white room-scale north-wall niche now separates dark timber-colored framing, a dark recessed field, a muted gold-toned crown field, and a warm neutral visible base. The two upper registers and the real setback remain readable from the front and oblique viewing positions.

The source shows fine ornament, but the available 399 × 381 image does not resolve it sufficiently for a literal reconstruction. No floral pattern, calligraphy, figure, Buddha, offering or ritual-object inventory is added. The plain crown is explicitly a coarse type outline and gold-toned display field, not a claim that the historic crown is an undecorated solid gold panel. The visible base's warm color does not assert its hidden material or invent a textile pattern.

All color, roughness and metalness values are reversible display fits, not colorimetry, material testing, pigment identification or a historic finish recipe. Values are isolated in SHOUKANG_EAST_MATERIAL_FIT; dimensions remain in the unchanged SHOUKANG_EAST_WHITE_FIT. Source date caveats, withheld details and partial stage survive production material merging.

Display fits: timber #5a4a34 / roughness .84; recess #282d27 / .92; crown #b99a4f / .74 / metalness .18; visible base #85754c / .88. Non-crown metalness is zero. No texture, transparency, normal map or bump map is introduced.

## Source

The actual source photograph and annotated original remain unchanged in `../r53-shoukang-east/source-original.jpg` and `source-annotated.png`. The full publication page was also inspected.

Official source: https://img.dpm.org.cn/Uploads/File/2024/09/25/u66f37561e9b76.pdf#page=4

2024 publication, printed p. 142 / PDF p. 4; photograph credited to 文明. Capture date and restoration/display campaign remain unknown. This is not the existing central seat-screen's 2018 source.

## Exact retention

Geometry is byte-for-byte unchanged from the accepted white checkpoint after removing only the material field from the scene capture: all mesh attribute/index hashes, world transforms, names/roles, colliders, walkables, rooms, regions, map entries and hall-structure fields compare exactly. The independently captured white fingerprint is `tests/fixtures/r53-shoukang-white-geometry.json.gz`.

The complete R52 pre-addition fixture still verifies every retained mesh and its material, old collision, navigation and hall metadata exactly. No old framework, partition, seat-screen, western warm room, roof/shell, route or GLB is replaced.

Result remains 13 meshes / 200 triangles / 12 physical boxes / zero new walkables or navigation entries. Only 2 temporary white materials become 4 bounded materials. The previously verified support, new/old collision separation, entry clearance, 10/60 Hz W/S sprint movement and no-rescue-floor checks still pass. The nominal 2.6 m opening and existing approximately 2.48 m clear jamb span are unchanged.

## Review images

- `same-camera-white-to-material.png`: left is the exact captured white checkpoint; right is this live successor, with identical cameras.
- `after-front.png` and `after-oblique.png`: actual current production-builder geometry/material colors.
- The original source annotation and actual-geometry plan remain the unchanged white-checkpoint evidence; no new geometry means no reinterpreted layout overlay is needed.

These are CPU z-buffer diagnostics using material base colors. Runtime textures/lights/shadows, browser/WebGL, GPU performance and mobile rendering remain unverified. Do not describe them as in-app screenshots.

## Verification and reproduction

20 targeted checks pass, zero fail:

`node --test tests/r53-shoukang-east-materials.test.mjs tests/r53-shoukang-east-framework.test.mjs tests/r44-independent-shoukang-review.test.mjs`

The added tests check material-source limits and immutable palette parameters, exact white-checkpoint geometry/navigation retention, and four-material triangle/bounds/metadata survival after production merge. Existing tests cover exact R52 retention, physical support, collision/entry, resource disposal and forward/backward sprint routes. Initial material tests failed on missing partial-material stage and the original 2-material count, while the geometry-only fingerprint already passed.

`npm run build` succeeds (exit 0) with the existing large-bundle advisory. No full-world/all-tests rebind was run; the single integration owner owns that combined gate.

Run `node reports/r53-shoukang-east-materials/capture.mjs`, then for before/after and front/oblique run `python reports/r53-shoukang-east/raster.py <capture.json.gz> <output.png>`. The material capture deliberately reads the immutable white-checkpoint captures for the comparison left side. Reproduce the historical white builder itself at commit 8f3f867, not by running the old white capture script against the successor.

The white evidence directory is preserved as historical evidence. Its manifest's production/test hashes describe the white checkpoint, not the successor working tree. This directory's manifest binds the successor files separately.

## Integration boundary

Do not publish the white milestone as a finished room. This successor also remains partial; global-world freeze rebinding and user-visible release acceptance are pending the single R53 integrator. No new character support surface is introduced. Refining illegible ornament or a fuller interior inventory requires adequate additional source evidence, not invention.
