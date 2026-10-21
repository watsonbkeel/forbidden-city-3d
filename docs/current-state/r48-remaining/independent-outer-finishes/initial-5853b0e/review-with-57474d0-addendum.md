# R48 independent review: Wuying / Jingsi / Baoyun details

Review date: 2026-10-21 UTC. Frozen product commit: `5853b0e63db9d20190c39ad389f4e76e5930587b`. The review used an independent clone; no production files were edited. Actual predecessor: `e0d19a5`. Predecessor outer module SHA-256: `fcb22fe64d01bbcadb39912842c4830af0f21574d0add38094a0efa11ff4a60d`; candidate outer module SHA-256: `6ce890a25adc7ee327ae478d9e17e90c7500e6210000c2d41a7089b469d11cd5`.

## Verdict at this freeze

**One source-fidelity correction required:** Baoyun's light inscription core has been incorrectly recolored green. The source photograph shows a light core surrounded by a green frame. This is independently reproduced by `tests/r48-review-baoyun-inscription.test.mjs` (red at the frozen commit). Fix by preserving the existing pale core and adding four fitted green border sides; do not invent lettering or carving.

The added ceiling frames, display-equipment outlines, partial Wuying west rail and Baoyun porch details otherwise pass the scoped physical tests below. This is **partial-detail acceptance only**, not complete reconstruction of three buildings. Jingsi's exterior is retained; Baoyun's interior remains evidence-blocked and its model access remains closed. A model closure does not establish the real venue's current access or use.

## Sources independently inspected

1. Wuying ceiling: official [scene d111 upper face](https://ggzlquanjing.dpm.org.cn/scene/rOQSztMJ62XbrOjIj78rxu2KMZTcvyfg/20210517_wydtcg/panos/d111.tiles/u/l1/01/l1_u_01_01.jpg). All four level-1 tiles were downloaded and assembled without image alteration. `tour.xml` identifies scene index 16; `layer.xml` places spot16 at 79.5%, 76.4% on map1, in the front hall. The photo shows green coffers, circular gold/dark motifs, thin lattice intersections and deeper blue-green beams. The low bright rectangle is the independent case light, not a hall-wide ceiling.
2. Jingsi ceiling: its own [scene 60 upper face](https://ggzlquanjing.dpm.org.cn/scene/rOQSztMJ62XbrOjIj78rxu2KMZTcvyfg/20210517_wydtcg/panos/60.tiles/u/l1/01/l1_u_01_01.jpg), independently downloaded as four tiles. Scene index 83 / spot83 at 49.8%, 13.6% locates the rear hall on the official I-plan map. Its own coffer structure is visible; no Wuying-main image was substituted.
3. Gallery equipment: [official 2020 design article](https://www.dpm.org.cn/Uploads/File/2020/12/29/u5feade223dddd.pdf). It directly describes retaining the architectural ceiling, adjustable case-top lights and lower-supply/upper-return ventilation. This supports equipment topology, not measured repeat counts, 2021 as-built dimensions, or 2026 inventory.
4. Wuying west-platform middle rail: [official w02 right-face tile](https://ggzlquanjing.dpm.org.cn/scene/rOQSztMJ62XbrOjIj78rxu2KMZTcvyfg/20210517_wydtcg/panos/w02.tiles/r/l2/02/l2_r_02_03.jpg). The visible white rail follows the main hall's west gable platform, set away from the red wall. The reviewer also inspected the complete corresponding right face. This does not justify a complete terrace perimeter; the candidate correctly withholds the front/rear returns and stair gaps.
5. Baoyun: [official front photograph](https://img.dpm.org.cn/Uploads/image/2024/12/30/1-yrWtXOlSB260.jpg), attached to the [official unveiling report](https://www.dpm.org.cn/learing_detail/368426.html). Seven circular frieze ornaments, stepped porch mouldings, rectangular wall joints and the **green-border / pale-core** inscription panel are directly visible. The report's event date is 2024-12-27 and publication date is 2024-12-30; neither is treated as a proven photography date.

The 2021 directory is an exhibition-resource version, not a known photography day. Both gallery scene photographs and the Baoyun photograph retain `photographyDate: null`. Exact motif paintings, character carving, measured coffer counts, member sizes, colorimetry and current inventories remain unverified. Public source URLs and byte digests are in `source-manifest.json`; source images/PDFs are not redistributed here.

## Independent physical and retention results

- **18/18 exact predecessor records retained.** Rebuilt each building through the real `ZoneBase` dispatcher in both independent checkouts. Compared all raw mesh attributes/indexes, world transforms, recorded material properties, collision boxes, walkables, rooms, regions, map records and profile navigation. This comparison does not merely trust the owner's new snapshot; the predecessor was freshly rebuilt. See `tests/fixtures/r48-outer-independent-e0d19a5.json` and `current-capture.json`.
- **32/32 whole-world round trips:** both Wuying I-plan side aisles through the connector into Jingsi; Jingsi rear entry with a route around its retained central cabinet; and the Baoyun open courtyard/main-front approach. Each runs 10/60 Hz, walk/sprint, forward/backward through real `FirstPersonControls` and the full world's collision manager. Total 16,088 recorded frames; no new-detail triangle intersects the player body. Selected support was never rescue/unverified. Runtime landings and every route record match the actual predecessor exactly.
- **20,146 collision-free ground samples:** 0.25-unit grid, checking actual new rendered triangles against the production body box with a 0.001-unit numerical inset at its horizontal boundary. Wuying 5,376, Jingsi 3,053, Baoyun 11,717 samples. Added-detail body contacts: zero. This is sampled local free-space coverage, not a proof of reachability for every sampled point.
- **Existing display retained:** all 249 Wuying, 148 Jingsi and 659 Baoyun old meshes retain geometry and world transforms. Wuying/Jingsi's only old material change is the ceiling plane. The frozen Baoyun's only old material change is precisely the incorrect inscription core identified above. Both galleries' new equipment/ceiling parts have zero intersection candidates with retained ceramic forms, independent-case glass or case-light surfaces.
- **Actual contacts checked by FrontSide rays:** every coffer frame meets the original ceiling face; every added case-top lamp base meets an actual retained cabinet-top surface; all 13 Wuying rail posts rest on existing platform stone. Baoyun's front frieze and two returns rest on the retained porch roof and contact the new cap; the cap has opposing, non-DoubleSide top/bottom surfaces. New cross-beams remain above the old cases and standing clearance.
- **Scope delta at this freeze:** added meshes 794 / 562 / 382 respectively. Wuying adds 16 rail collision boxes; Jingsi and Baoyun add zero. Rooms, walkables, regions and map items remain exact for all three. The new plain circular motifs are decorative surface overlays (disc 0.006 below ceiling, torus top 0.003 below ceiling), not certified carved/structural members.

## Important inherited limitation, not hidden by green tests

The broad raw-triangle diagnostic records old door-leaf and step-edge contacts even though the controller successfully completes the routes. Example: the established Wuying aisle route's horizontal move around `(221.9999957, -205.4954940)`, floor 1.2, intersects an existing `lattice_doors` triangle. The exact same contacts recur on actual predecessor `e0d19a5`; none are newly added R48 details. `parent-route-results.json` and `independent-results.json` are equal for the route/landing records. Tests record these inherited contacts instead of relabelling them new defects or silently excluding them while claiming universal zero penetration.

Thus this review certifies **no added-detail penetration/regression on the tested paths**, not that every retained doorway, step or decorative surface is geometrically flawless. No earlier furniture or door was changed to make the new tests pass. The initially attempted straight rear-hall route hit the retained central case; the final route explicitly turns before that case, rather than removing it or weakening its collision.

## Execution and limits

- Independent tests: 55 main + 3 static + 4 contact assertions passed on the freeze. Independent Baoyun source regression: 1 failed as expected.
- Existing owner gallery/first18 suites rerun: 36/36 passed. These are supporting checks, not the independent conclusion.
- `npm run build`: passed; retained warning that the main bundle exceeds 500 kB. This is not a performance/GPU pass.
- Chromium exists but could not start: process-singleton `socket() failed: Operation not permitted`; also crashpad startup errors. No WebGL screenshot, shader, mobile or live GPU visual acceptance is claimed. No alternate route was used to bypass the denial.
- Full repository regression and deployment are outside this review; no merge/push/publish occurred here. Other R48 batches were not rereviewed except the exact no-change comparison for the previous outer eighteen.

## Reproduce

Use Node compatible with the repository's `registerHooks` tests and install dependencies using its lockfile. Copy these review tests and fixture into the target checkout if they are not yet committed.

```sh
node --test tests/r48-review-outer-finishes.test.mjs tests/r48-review-outer-finishes-static.test.mjs tests/r48-review-outer-finishes-contact.test.mjs
node --test tests/r48-review-baoyun-inscription.test.mjs
npm run build
```

The inscription regression must be red at `5853b0e`; a corrected candidate must make it green. Optional result writing is explicit, never an automatic tracked-file side effect:

```sh
mkdir -p /tmp/r48-outer-review-results
R48_OUTER_REVIEW_DIR=/tmp/r48-outer-review-results node --test tests/r48-review-outer-finishes.test.mjs tests/r48-review-outer-finishes-static.test.mjs
```

To independently regenerate the predecessor snapshot rather than trusting it:

```sh
git worktree add --detach /tmp/r48-outer-predecessor e0d19a5
# Install the locked dependencies in that checkout as required.
node tests/r48-review-outer-finishes-capture.mjs /tmp/r48-outer-predecessor /tmp/rebuilt-parent.json
cmp /tmp/rebuilt-parent.json tests/fixtures/r48-outer-independent-e0d19a5.json
```

All result data are test observations, not measurements of the real buildings.

## Recheck: `57474d0228860ed12338fc5558b9b6fed76ca0e1`

A second independent clone verifies module SHA-256 `2ffeaf1fa9be545335ccb5eda0a092845dd750e8935655ab2551dddfaef572a9`. The original light inscription panel is now preserved and four actual green bars have been added. All earlier physical/retention checks remain green, the Baoyun added mesh count is now 386, and it now has **zero** changed original mesh materials. Whole-world route/landing results remain exactly equal to `e0d19a5`.

A remaining detail-visibility issue was then independently reproduced: the new lower horizontal green bar is centered at local `(0, 10.08, 7.7125)` and spans y 10.05–10.11, entirely behind the retained continuous gutter spanning y 10.06–10.20. A front ray first hits `baoyun-green-eaves-gutter`, whereas rays to the other three green bars first hit the bars themselves. The inscription regression therefore remains red for a new, precise reason. Correct only the new frame's lower extent above the retained gutter; do not move/remove the old stone core or gutter to satisfy the test. `recheck-57474d0/baoyun-bottom-border-red.txt` records the failure.

The frame-selection predicate was tightened to exclude the 47.6-unit existing gutter from “small frame parts”; this is a test-fixture correction, not a production defect. The separate first-hit check is what demonstrates the real lower-border occlusion. Large cyclic Three.js objects are not dumped in the final assertion; it reports the offending local position and first-hit object's name.
