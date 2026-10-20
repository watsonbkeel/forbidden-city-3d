# R34 Qianqing / Taihe coordinated interior fit

## Result and status

This is a reversible, **estimated spatial fit**, not a measured reconstruction or a claim of official authenticity. Production checkpoint: `55e00b6`; current navigation correction: `ba8dee8`; focused regression tests: `5bb9a92`. R33 base is `1c60d533ee91db20ccde2a9ffb449b8c7b8d0fd8`.

Qianqing now has one shared nonuniform frontage grid driving facade openings, columns and end passages, plus explicit closed warm-room inner boundaries. Taihe moves its whole display group rather than changing only the plaque. Gold columns, hanging plaque/couplets, ceiling and caisson remain fixed. All existing display dimensions are retained, except a narrowly bounded native fallback rail correction described below.

## Evidence and interpretation

The following official sources were read or visually inspected. They constrain topology and relative arrangement, not the proposed numerical fit:

- [Qianqing official description](https://www.dpm.org.cn/explore/building/236472.html): nine frontage bays, five depth bays, communicating central three bays, reduced front gold columns, side warm rooms and end passages. The HTML was retrieved and read after the browser fetch failed.
- [Official rear-three-palaces plan](https://img.dpm.org.cn/Uploads/pdf/2201/T00008_00.pdf): rendered plan image inspected. It supports the broad arrangement; no precise bay widths were extracted from this unscaled rendering.
- [Taihe official description](https://www.dpm.org.cn/explore/building/236465.html) and [official interior photograph](https://img.dpm.org.cn/Uploads/Picture/dc/14498.jpg): photograph actually viewed. Display, surrounding columns and overhead layers are separate spatial systems.
- [Official Taihe plan](https://www.dpm.org.cn/Uploads/pdf/5063/T00034_00.pdf): retained rendered plan inspected. Its display straddles the middle gold-column row with the screen south of the rear row. This historical plan does not establish the date or exact registration of the current display.
- [Official 2025 research paper](https://img.dpm.org.cn/Uploads/file/2025/12/22/1766400334hKYveGNhs218985.pdf), page 143 figure 17: retained upward-looking photograph inspected, supporting a distinct overhead ceiling/caisson layer. The adjacent architectural rendering is not treated as a photograph. Structural column heights are not substituted for the visible ceiling elevation.

No source photograph is embedded in the application or used as a new runtime texture.

## Qianqing changes

The inherited 46 × 25 m envelope is unchanged. Estimated frontage stations are `[-23,-18,-13,-8,-3.25,3.25,8,13,18,23]` m: central bay 6.5 m, its two adjacent bays 4.75 m, remaining bays 5 m. These rounded values express a wider central frontage without pretending survey precision. `QianqingFrontageGrid` is the single authority used by columns, door/window/facade segments and end-passage geometry.

Warm-room inner boundaries sit at x = ±8 m, z = 307.3–326.3 m. They are closed, full-height timber boundaries, not accessible newly invented private interiors. Existing passage walls move consistently to x = ±18 m; two end passages remain centered at x = ±20.5 m and 5 m wide. Front/rear veranda connections remain open. Central display, five-depth rows and floor-only optional asset are preserved. The optional asset contract now rejects missing or mismatched permanent frontage/warm-room ownership.

## Taihe changes and explicit tradeoff

The dais, throne, screen, display furnishings, front steps, side rails and associated collision proxies translate together by z = −2 m. New dais extent is z = 5.06–12.06 m, straddling the middle gold-column row at 5.6019 m. Screen z = 11.5 m is south of the rear row at 13.0647 m. Throne z = 9.26 m lies near the unchanged caisson z = 9.51 m. Neither gold-column spacing nor ceiling elevation (9.47375 m), caisson geometry, plaque size, couplets or roof is changed.

This improves the joint throne/column/caisson relationship from entrance and bilateral side positions. It does **not** solve every photographic perspective discrepancy, and specifically does not claim the R33 plaque-width or full ceiling perspective is now correct. Front stairs now start at z = 2.12 m. The (0,0) approach remains on clear flat ground; nearer walking tests initialize feet from actual support height rather than assuming a flat floor.

### Native B rail parity correction

Multiview testing exposed an inherited discrepancy: native fallback B had opaque 0.72 m-high side-rail sheets while optional S had open thin rails. Exactly 24 native vertex Y records change from 2/2.72 m to 2.7025/2.7375 m. X/Z coordinates, indices, triangle count and materials are unchanged. Eight triangles still represent the two top rails. This correction is separate from the rigid display translation and restores useful side views without arbitrarily shrinking the throne or screen.

## Asset identity and rollback

- Immutable source: `public/models/interiors/taihe-hanging-fit-b032ccb094e0.glb`, SHA-256 `b032ccb094e04100a7fc989467b1703b7ed58f143ff3a511e1c504ec38d84917`.
- New output: `public/models/interiors/taihe-display-grid-6012719f9618.glb`, SHA-256 `6012719f961816d2e92ec2095d2877c4a93b6988606c7b7876b57224b84893d5`.
- Frozen R33 profile: `assets-src/interiors/taihe_spatial_fit/r33-profile.json`.
- Reproducible generator: `assets-src/interiors/fit_taihe_display_grid.py`.

The generator accepts only the exact frozen source, rejects repeat application and unrelated profile changes, cross-checks semantic inventory against its closed geometry selection, and translates 38,234 display position records (including retained unreferenced positions). One inherited nonidentity throne-waist node is translated at node level; other selected position records change only Z. All non-display position bytes, normals, UVs, indices and materials remain unchanged. Manifest, source marker, inventory, profile and loader contract are updated atomically. Original binary remains available for rollback; restore its paired R33 profile/manifest rather than mixing epochs. See `ASSET-RECEIPT.json`.

## Validation

Focused final run: 19/19 JavaScript tests and 4/4 Python tests passed. Current Taihe navigation: 20/20 passed, retaining FPS/speed, support and body-clearance checks. Retained Qianqing lifecycle/porch routes: 14/14 passed. Independent reviewer also passed the combined 53-test set before the final two lifecycle tests were added, and found no remaining code blocker. Production build passed with the existing Vite large-chunk warning.

Commands:

```sh
node --test tests/r34-*.test.mjs
python3 -m unittest discover -s tests -p test_r34_taihe_display_grid.py
node --test tests/current-state/taihe-core-navigation.test.mjs
node --test tests/r33-qianqing-lifecycle.test.mjs tests/r33-qianqing-porch-routes.test.mjs
npm run build
```

Tests cover actual built columns/openings/boundaries, bidirectional wall rays, end-passage/veranda openings, translated stairs and proxies, exact native rail changes, decoded S geometry, missing/wrong registration rejection, old-asset mismatch, duplicate guards, failed/cancelled/re-entered loads, B/S ownership and exactly-once disposal. Native B remains 1,600 triangles; S remains 17,924 triangles in eight batches, or 17,998 with existing plaque installation and beam complement, below the 18,000 budget.

`SIGHTLINES.json` records 32 CPU built-geometry cases (16 eye positions in each B/S mode). Rays must first hit owned target geometry within the bounded endpoint window, not merely traverse empty space; an empty-core negative test must fail all target samples. Entrance plaque samples pass 9/9, and screen/throne side checks require actual hits but do not claim complete unobstructed visibility. At side x = ±6.2 m, throne/caisson bearing discrepancy falls from 9.243° to 1.540° at z = 5 m and 16.006° to 2.288° at z = 10 m. Some samples remain occluded, as expected.

`CPU-BUDGET.json` compares this scope alone against R33, not the final multi-owner R34 integration. Full resident scene changes: +384 triangles, +2 merged meshes, +36,864 geometry bytes, +2 materials, +2 colliders; textures and walkables unchanged. No night, courtyard or unrelated Chuxiu changes are included here.

### Limitations and integration gate

No real-browser screenshot acceptance was performed. Browser QA was blocked; no denied file URL or desktop workaround was used. CPU ray tests do not establish photographic appearance, WebGL rendering performance or final visual approval.

An early unbound full current-state run reported 957 passes / 64 failures: historical epoch/source bindings plus 18 now-corrected current navigation cases. This is not represented as a full-suite pass. Final combined historical retention bindings, route integration and full-suite acceptance belong to the integration checkout and must be rerun there. Existing historical assertions must remain strict and separately bound to immutable R33 data rather than weakened for the new layout.
