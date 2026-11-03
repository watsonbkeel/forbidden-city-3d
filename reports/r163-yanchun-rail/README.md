# R163 Yanchun south pale turned railing — local candidate

Base: `d689182a667974cafdd166fbcfc28efe366c638c`. Only two production files changed.

## Result and scope
- Replace the existing south row's 25 square baluster meshes with a simplified, closed turned silhouette contained in each original 0.07 × 0.92 × 0.07 m fitted box. Same transforms, roles and height.
- Pale ivory finish on those 25 and the two existing horizontal rails.
- Approved overlap exception: the two existing side-row first balusters share the south endpoints exactly; recolor only those two square boxes to the same finish. Other side/rear members unchanged.
- No roof-skirt support, global physics, collider, walkable, room, region, map or route modification. 834 other mesh geometry/material/transform rows and the whole-building bounds equal the independent pre-change fixture.
- No main edit, remote write, deploy, credential or permission change.

## Evidence vs fitted dimensions
Official page https://www.dpm.org.cn/explore/building/236524.html labels the exact photograph as 建福宫延春阁 (gallery link 69).
Photo: https://img.dpm.org.cn/Uploads/Picture/2020/04/20/s5e9d41b19d7f7.jpg
SHA-256: `fda0c35ed50b0d23f5b4151702faec1089f74fff3c9e999d170579d159e162f9`.

Actually inspected source pixels support a pale finish, turned vertical silhouette and two pale horizontal members on the visible south upper front. Retained count 25, profile details, dimensions, positions and finish color are model fits, not measured or photograph-counted assertions. Substrate, carving, photography date and rear/side forms remain unknown. Source photo is not redistributed.

## Verification
- `red.tap`: 2 expected feature-missing failures / 1 retention pass before implementation.
- `green.tap`: new 3/3 pass.
- `targeted.tap`: new 3 + archived R66 plaque/withdrawn-marker 2 = 5/5 pass.
- `ground-entry-full-checkout.tap`: all 8 actual ground-entry round trips, 10/60 Hz × walk/sprint × forward/backward = 8/8 pass.
- `normal-world.tap`: 1/1 pass: normal production ZoneManager hook, one merged pale-material mesh / 6648 triangles, complete retained collision/navigation/architecture streams exact, plus normal-world ground-entry round trip at 30 Hz. No source injection or capture mode; CPU-only world.
- `build.txt`: `npm run build` exit 0, existing Vite large-chunk warning retained.
- `INDEPENDENT-REVIEW.md`: fresh independent reviewer, no Critical/Important; independently verified closed manifold topology and 5/5 targeted tests.
- `git diff --check`: clean.

The first attempted `test:current-state` run inherited sparse-checkout without historical docs/assets. It reported 1192 tests, 860 pass, 332 fail. Full log is `baseline-current-state.tap.gz`, and every emitted failing name is in `sparse-baseline-failing-names.txt`. This is an invalid acceptance baseline, not a claim of 332 product defects or a green full suite. Sparse-checkout was then disabled only in this candidate. The initial old entry-test missing-file failure is retained in `ground-entry.tap`; the complete-checkout rerun passed all eight. To respect storage limits and the narrow task, no blanket historical-lock repair or second full repository materialization was pursued.

`normal-world-first.tap` preserves a verification-harness mistake (assuming merged geometry was indexed). The test was corrected to count indexed or non-indexed production triangles; no production change was made for it.

## Visual diagnostic
`views/south-{before,after}.png` and `front-detail-{before,after}.png` use identical real production triangle/albedo cameras. `turned-detail-after.png` is an explicit close diagnostic view, not proof that the player can stand there. Source hashes, camera settings and image hashes are in both proof JSON files. Before images were captured from the actual baseline prior to implementation, then relocated unchanged into this report directory.

These are CPU diagnostics, not WebGL/PBR/contact-shadow acceptance. `visualAcceptance` remains `VERIFY_PENDING`; no complete-building reconstruction or upper-level visitor access is claimed.
