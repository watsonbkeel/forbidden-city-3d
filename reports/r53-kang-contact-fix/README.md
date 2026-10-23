# R53 kang-low contact correction: independent targeted QA

## Result

Five targeted checks pass. This is a local single-hall check, not an all-world build or release approval. No production source, architecture, world placement, `main`, remote branch, Pages, account or credential was changed by this QA task.

Run:

    node --max-old-space-size=64 --test --test-isolation=none tests/r53-kang-contact-fix.test.mjs

Reproduce the pre-fix contact failure without changing production source:

    R53_KANG_RED=1 node --max-old-space-size=64 --test --test-isolation=none --test-name-pattern='actual Chuxiu' tests/r53-kang-contact-fix.test.mjs

## Scope and provenance

- The committed portable predecessor source is pinned to SHA-256 `7696c28eaa608bcd726a724746a88a4770064d6b3da677445cad3dcc53a863ab`. In this checkout it was also verified against git blob `01b8a00:src/scene/characters/CharacterKit.js`. Tests do not require that local commit to exist remotely.
- Current production source must equal that predecessor with exactly `seatVariant==='kang-low'?.04:0` replaced by `.06:0`.
- All 111 non-kang template/pose/LOD combinations, including the six female walking variants, retain exact typed geometry attribute and index hashes and metadata.
- All 21 kang-low template/LOD combinations preserve exact raw attribute bytes for torso/seat, head, left arm and right arm, plus locally remapped triangle topology. Seat/pelvis metadata and lower-robe data at/above pelvis height are unchanged.
- Kang-low geometry bytes are NEW CORRECTED BYTES, not user-original C1 bytes. The existing continuous robe construction follows the changed foot height, including its surface-projected decorative ribbons. Ribbon sampling depends on path length: consort L0 changes from 5683 to 5667 vertices and 8148 to 8140 triangles; maid L0 changes from 4229 to 4221 vertices and 7096 to 7092 triangles. Later global indices shift, so global-index equality would be invalid. Anatomical streams and locally remapped protected topology remain exact. No head, face, shoulder, hand, pelvis or other seat-variant alteration is authorized or performed.

## Actual Chuxiu contact

A `ZoneBase` fixture builds only 储秀宫 from current `west-six.json`, then queries its actual merged mesh triangles.

- Actor position remains `[100.22, 0.5599999523162842, 438.16]`, facing π radians.
- The visible floor triangle is Y `0.6200000047683716`, not the lower platform/stone surfaces at approximately .60/.61.
- Old actual sole vertices were Y `0.5999999514222145`, penetrating the visible floor by approximately 20 mm. The frozen source fails the same contact regression, recorded in `red.tap.gz` and `red.json`.
- Corrected sole vertices are approximately Y `.619999951`, contacting visible floor within 0.000001 m. Full sole perimeters and center vertices are ray-tested, not metadata-only contacts.
- All 29 actual seat-bottom vertices remain at approximately Y `1.049999962`, contacting actual `west-six_chuxiu_zitan_fit` triangles at Y `1.0499999523162842`. Seat and pelvis are not raised with the shoes.
- The main robe shell has 366 connected indexed vertices and 56 nondegenerate transition triangles. Every indexed shell edge has incidence 2, proving a closed connected shell with no seam introduced by the correction.
- 897 shoe/lower-robe vertices are stationary through the inclusive 200π-second common idle cycle. The test checks 257 time samples against canonical `deformCharacterVertex` with maximum drift about `5.55e-17` m. The stronger continuous-time invariant also holds: seated parts 4/5/6 have no local motion branch and these vertices have exactly zero torsoWeight, so lean/breath cannot move the repaired contact geometry at any time.

## Hands on knee/lap

Both consort and maid are tested against actual deformed indexed cloth/skin triangles, with 2052 unique hand-triangle samples per frame, at 1257 times spanning 0 through 200π seconds (628.3185307179587 s), amplitude .7 and phase 0. The cached surface kernel is independently checked against canonical CPU deformation.

- Minimum skin-to-lap clearance: 0.5223 mm.
- Lower-palm closest clearance throughout the sampled cycle: 1.7246–1.8238 mm.
- Minimum stacked-hand clearance: 1.4453 mm.
- No sampled skin penetration or suspended lower palm. These are finite temporal/spatial samples, not an exhaustive continuous-time triangle-collision proof. The unchanged protected geometry/rig streams additionally preserve predecessor upper-body and hand animation behavior.

## Real resource cache

At LOD 0/1/2, actual `CharacterResourcePool` tests confirm separate `seatVariant` keys, cancellation before publication, successful re-preparation, exact current corrected geometry hashes, cache release/reacquire identity, and shoe minimum Y approximately .06. No architecture was changed to create contact.

## Evidence caveats

`green.tap`/`green.json` contain final evidence. `red.tap.gz`/`red.json` preserve the expected predecessor contact failure. Earlier QA harness failures are retained separately: an overstrict global index assertion tried to format a large typed-array diff and exhausted resources; subsequent checks correctly account for the already-existing path-length-dependent ribbon sampling. These earlier harness failures are not claimed as production failures or successful verification.
