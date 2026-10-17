# V16 Taihe core: frozen CPU candidate

Date: 2026-10-16. Base: `f83c74858c90b6d125cabd3cf3c9414f4a5b3ae8` (V15).
Approved geometry card SHA-256: `5262f8646ef109ba476448f94fa2bfe05e2b9b1cb09103d787ed1e5439f66382`.

## Implemented scope

- Taihe-only throne/footstool, seven-part screen, six gold columns, three-tier upward caisson, yellow-ground dark-letter plaque and complete couplets, with basic material separation.
- The shared generator, original Taihe raw GLB, other halls, exterior envelope, entrance, world floor/anchors, and original performance baselines remain preserved. CPU snapshots verify six other halls and 108 protected Taihe meshes.
- Permanent navigation remains independent of S loading. The simple B core is separately owned and is atomically replaced by validated S visuals. Failed, cancelled or rejected loads keep the B core usable. S has no collision or walkable proxies.
- The 1024×1024 browser-drawn text atlas is shared by exact runtime material/texture identity. B owns its final disposal; borrowed S materials cannot dispose it. The exception cannot be enabled through asset metadata.

## Geometry and asset accounting

| Item | Triangles |
| --- | ---: |
| Removed old B central assembly | 1,380 |
| Removed old six central columns | 336 |
| Removed old ceiling plane | 2 |
| New B fallback, including all six replacement columns | 1,078 |
| New permanent red companion columns | 112 |
| New permanent open ceiling | 8 |
| Net permanent/fallback change | −520 |
| Old S visible geometry (plus 108 hidden helper triangles) | 40,576 |
| New S visible geometry; 8 material batches, no helpers | 8,978 |

The new S asset is `public/models/interiors/taihe-v16-bdc5d69b1265.glb`, SHA-256 `bdc5d69b1265a2575376827a0ff49b848fbd3acdeb58584360a0e3bfa16e0486`. It is 648,184 bytes, versus the old compressed GLB's 265,856 bytes; fewer triangles do not establish faster network loading. It embeds no image, font or museum photograph. The runtime atlas is approximately 4 MiB before mipmaps (about 5.33 MiB with a full mip chain), allocated once for B/S sharing.

The actual decoded caisson vertices top out near local y=11.2737503 m; the retained roof underside is near 11.3237495 m, leaving approximately 50 mm of model clearance. The permanent ceiling has a matching aperture. Column clearance includes the 0.53 m published-source allowance and actual 0.58 m base radius; the platform rails remain separated from those bases.

## CPU checks completed

- Full suite: `node --test --test-concurrency=1 tests/*.test.mjs tests/current-state/*.test.mjs`: **1,451 passed, 0 failed, 0 skipped**.
- Production bundle: `npm run build`: passed (Vite's existing large-chunk advisory remains).
- Asset/source hashes; object dimensions, column center placements, actual finite/nondegenerate GLB triangles; roof clearance; material batches; duplicate-core ownership; and unchanged shared/legacy assets are covered.
- Malformed contract, missing/incorrect bounds, NaN/Infinity geometry and triangle counts fail closed. Installation failures before and after attachment, cancellation, second-loader rejection, unload/reload, and final application disposal are covered.
- CPU navigation covers the actual south approach, stair-front approach, both side viewing paths and return routes at 60/20/10 fps and speeds 5/12; throne/platform traversal remains blocked. These focused CPU routes do not substitute for the original browser walk matrix.
- Full plaque/couplet strings, rare characters including 艰/遹/猷, viewer-side assignment, right-to-left plaque order, canvas placement and S UV/face direction are tested. Actual device glyph rendering still needs browser inspection.

## Pending owner browser acceptance

No browser or GPU was launched by this implementation worker. The owner must bind visual captures and browser results to the frozen commit/source manifest, including the unchanged original 33×6=198 route cases and original six-view performance gate. Also inspect the inside-S state and malformed/load/unload fallback behavior.

The original Taihe-front point is z=−74, outside the S preload radius. Its original baseline is 874,189 triangles and the unchanged +10% ceiling is 961,607.9. S reductions cannot be credited at that point. The prior candidate was 959,809 triangles; the CPU −520 delta is accounting evidence, not a browser performance pass. No threshold or baseline was reset.

## Explicit remaining fidelity limits for V17

- This is an evidence-informed model, not an accepted present-day measured interior. The retained dais z=7.06…14.06 and screen z=13.5 are provisional and conflict with the cited historical plan topology. V17 must review placement and vertical registration before decorative polish.
- Local ceiling y=9.47375 and approximately 9.524 m generic model-column datum are retained model quantities. The published 12.705 m structural-column/head value and approximately 13 m guide value do not provide a keyed ceiling-clear-height protocol; no uniform height correction is claimed.
- Nominal gold-column diameter is 1.00 m; published sources vary to 1.06 m. Gold-row identities at S2/S3/S4 are medium-confidence cross-source inference. The 8.466 m bay is a column-center distance, not facade width.
- The approximately 6 m caisson opening does not resolve square side versus diagonal or clear opening versus trim. This model uses provisional nominal span 6 m; the diagonal interpretation would imply a square side near 4.243 m. The approximately 1.8 m is the whole three-tier rise.
- Four paired display-ornament types are intentionally omitted from the new V16 core: elephants (象), luduan (甪端), cranes (仙鹤), and incense pavilions (香亭). Their old generic S models are no longer displayed. They are pending V17 restoration after registration review, not completed V16 fidelity work.
- Fine polychrome, authentic carved dragon relief, detailed modern display lighting, and precise display-object placement remain future work. Current shallow patterns are self-authored approximations. Existing supplemental lights are rendering aids, not a measured museum lighting installation.
- Canvas typography uses installed browser fonts without embedding or downloading any font. Font availability, rare-glyph coverage and calligraphic fidelity remain device-dependent. No research photograph, panorama, museum texture, or traced image is shipped.

See `docs/research/interiors-taihe.md` for source links and detailed registration limits.
