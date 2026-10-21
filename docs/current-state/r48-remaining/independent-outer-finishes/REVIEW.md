# R48 independent review: Wuying / Jingsi / Baoyun details

## Later blocker: production-material runtime is NOT accepted

**This notice supersedes any reading of the earlier green result as a production-runtime release approval.** On 2026-10-21, after the scoped review was delivered, the integration owner reported that the real `TextureLibrary` names materials `key_material`, whereas the test material library used here names them bare `key`. The Outer ceramic-gallery ceiling augmentation selects retained material by the bare name; according to the owner's real-library run, this causes a runtime exception. A separate possible failure to remove Wenyuan's old ceiling was also reported, but is outside this three-building review and has not been independently assessed here.

The **63/63 result applies only to the repository test/stub material library used in these tests**. Its geometric, source-comparison and frozen-predecessor observations remain bounded evidence under that fixture, not proof that production material instances build or render successfully. `npm run build` only confirms successful bundling; it does not execute the production building constructors and did not detect this runtime issue. **Product `509fdf7` is therefore not cleared for production runtime by this review.** The owner is repairing material selection by reference identity and preparing real-library coverage; those repairs and their eventual outcome are pending and not certified here. A separately assigned real-material-library audit is required before release acceptance. No product changes or broader re-review were performed for this addendum.

## Earlier scoped fixture verdict, subject to the blocker above

**PASS only for the specified added-detail tests using the test material library at product commit `509fdf7efb4c1415aa59be709c2f4b1ffe3a2432`; NOT production-runtime acceptance.** Independent tests: **63/63**. Existing owner tests: **36/36**. Bundling: passed, with the existing large-bundle warning; not a production-runtime test. Review date: **2026-10-21 UTC**; Node **v24.19.0**. A fresh independent clone was used, without editing its production files. `RemainingOuterHalls.js` SHA-256: `9665b224254d01c1c305282a903fe25d1875687ef1982976c3df72ba4130dafd`.

This is **partial-detail acceptance only**, not complete reconstruction of three buildings, not a whole-world zero-penetration certificate, and not GPU visual acceptance. Jingsi's exterior is retained; Baoyun's interior remains evidence-blocked and its model access remains closed. A model closure does not establish the real venue's present access or use. Other concurrent R48 batches are outside this review.

Two independently discovered Baoyun defects are closed at this exact commit: the inscription's original pale stone core is preserved, and all four added green border sides are visible by first-hit rays against the **entire retained building**, not merely against the selected frame. The old core, gutter and roof were not moved. See the red/green history below.

## Sources independently inspected

1. **Wuying ceiling:** its own official [scene d111 upper face](https://ggzlquanjing.dpm.org.cn/scene/rOQSztMJ62XbrOjIj78rxu2KMZTcvyfg/20210517_wydtcg/panos/d111.tiles/u/l1/01/l1_u_01_01.jpg). All four level-1 tiles were downloaded and joined without modifying their pixels. `tour.xml` identifies scene index 16; `layer.xml` places spot16 at 79.5%, 76.4% on map1, in the front hall. The photograph shows green coffers, circular gold/dark motifs, fine intersections and deeper blue-green beams. The bright rectangle below is an independent case light, not a hall-wide ceiling.
2. **Jingsi ceiling:** its own official [scene 60 upper face](https://ggzlquanjing.dpm.org.cn/scene/rOQSztMJ62XbrOjIj78rxu2KMZTcvyfg/20210517_wydtcg/panos/60.tiles/u/l1/01/l1_u_01_01.jpg), likewise independently downloaded as four tiles. Scene index 83 / spot83 at 49.8%, 13.6% locates the rear hall on the official I-plan map. Its own coffer structure is visible; no Wuying-main image was substituted.
3. **Gallery equipment:** the [official 2020 design article](https://www.dpm.org.cn/Uploads/File/2020/12/29/u5feade223dddd.pdf) describes retention of the architectural ceiling, adjustable case-top lights, and lower-supply/upper-return ventilation. This supports equipment topology, not measured repeat counts, 2021 as-built dimensions or 2026 inventory. The modeled additions are case-local outlines/grilles, not new runtime lights or invented historical furnishings.
4. **Wuying west-platform middle rail:** the [official w02 right-face tile](https://ggzlquanjing.dpm.org.cn/scene/rOQSztMJ62XbrOjIj78rxu2KMZTcvyfg/20210517_wydtcg/panos/w02.tiles/r/l2/02/l2_r_02_03.jpg) and adjacent tile were independently fetched and inspected; the assembled corresponding right face was also viewed. The white rail follows the main hall's west gable platform, set away from the red wall. This does not justify a complete terrace perimeter; front/rear returns and stair gaps remain withheld.
5. **Baoyun front:** the [official photograph](https://img.dpm.org.cn/Uploads/image/2024/12/30/1-yrWtXOlSB260.jpg), attached to the [official unveiling report](https://www.dpm.org.cn/learing_detail/368426.html), directly shows seven circular frieze ornaments, stepped porch mouldings, rectangular wall joints and a **green-border / pale-core** inscription panel. The article's event date is 2024-12-27 and publication date is 2024-12-30; neither is treated as a proven photography date.

The 2021 URL directory is an exhibition-resource version, not a known photography day. Both gallery scene photographs and the Baoyun photograph retain `photographyDate: null`. Exact motif paintings, inscription characters/carving, measured coffer counts, member sizes, colorimetry and present inventories remain unverified. The Wuying 20×12 and Jingsi 20×8 grids are fitted representations, not measured counts. Plain circular motifs do not reproduce exact painted dragons. Public URLs, retrieval dates and byte digests are in [source-manifest.json](source-manifest.json); source images/PDFs are not redistributed.

## Independent physical and retention evidence

- **Previous outer eighteen: 18/18 exact.** The actual predecessor `e0d19a575e0840fd8a52a5b45a02561e48610c1d` was independently checked out and rebuilt through the real `ZoneBase` dispatcher. Comparison covers raw mesh attributes/indexes, world transforms, recorded material properties, collision boxes, walkables, rooms, regions, map items and profile navigation. This does not merely trust an owner-generated new snapshot. Predecessor Outer module SHA-256: `fcb22fe64d01bbcadb39912842c4830af0f21574d0add38094a0efa11ff4a60d`. Fixture: `tests/fixtures/r48-outer-independent-e0d19a5.json`; current data: [final-509fdf7/current-capture.json](final-509fdf7/current-capture.json). This exact-retention conclusion must not be reused for later safety changes to those eighteen.
- **32/32 full-world round trips, 16,088 frames:** both Wuying I-plan side aisles through the connector into Jingsi; Jingsi rear entry turning around the retained central cabinet; Baoyun's open courtyard/main-front approach. Each runs 10/60 Hz, walk/sprint and forward/backward using real `FirstPersonControls` and the complete world's collision manager. Every route completes, returns to its starting floor, and never selects rescue/unverified support. Added-detail triangle/body contacts: zero. All 32 route records and all three runtime safe landings are exactly equal to the independently rebuilt predecessor. Results: [final-509fdf7/independent-results.json](final-509fdf7/independent-results.json); comparison: [parent-route-results.json](parent-route-results.json).
- **20,146 collision-free ground samples:** 0.25-unit grid; Wuying 5,376, Jingsi 3,053, Baoyun 11,717. Added rendered triangles versus the tested standing-body slice produce zero contacts. The body box uses horizontal half-width 0.499 and vertical offsets 0.351–1.649 above support, preserving 0.001-unit numerical insets from the controller envelope. This is sampled local collision-free space, not proof that every sampled point is reachable or that foot/support triangles never meet. Results: [final-509fdf7/static-results.json](final-509fdf7/static-results.json).
- **Existing display retained:** all 249 Wuying, 148 Jingsi and 659 Baoyun original meshes retain geometry and world transforms. Wuying/Jingsi's only original material change is the ceiling plane; Baoyun has zero changed original materials at the final commit. New gallery equipment/ceiling meshes have zero overlap candidates with retained ceramics, independent-case glass and case-light surfaces. Rooms, walkables, regions and map items remain exact for the three buildings.
- **Actual contacts, not bounding-box support alone:** FrontSide rays verify every coffer frame against the original ceiling face, each added case-top lamp base against a retained cabinet-top surface, and all 13 Wuying rail posts against existing platform stone. Baoyun's three frieze parts meet the old porch roof and new cap; the cap has opposing non-DoubleSide top/bottom surfaces. New cross-beams remain above old cases and the tested standing clearance. Every green inscription frame side overlaps the pale core. Each side center is independently first-hit visible in a front-normal ray, starting one model unit in front with a two-unit range, intersecting the whole building rather than only selected frame parts. This is a precise local visibility check, not an entire-image or GPU rendering test.
- **Final scoped delta:** 794 Wuying / 562 Jingsi / 386 Baoyun added meshes. Wuying adds 16 rail collision boxes; Jingsi and Baoyun add zero. The circular motifs are nonstructural decorative overlays: discs are 0.006 below the ceiling, and the torus top is 0.003 below it. These small deliberate gaps are disclosed, not certified as carved or load-bearing joints.

## Inherited limitation: not hidden by green tests

The broad raw-triangle diagnostic records old door-leaf and step-edge contacts while the controller completes the routes. Example: the Wuying aisle's horizontal move around world `(221.9999957, -205.4954940)`, support 1.2, intersects an existing `lattice_doors` triangle. Identical contact records occur on actual predecessor `e0d19a5`; none is a newly added R48 detail. At `509fdf7` this inherited issue is still present and has been reported separately for correction.

Therefore the green result means **no added-detail penetration/regression on the tested paths**, not that every retained doorway, step or decorative surface is flawless. No old door, furniture or case was changed to make this review pass. An initially attempted straight Jingsi rear-hall route met the retained central case; the final route explicitly turns before it, rather than deleting the case or weakening collision. Later repairs to old geometry require their own evidence and cannot inherit this freeze's eighteen-building equality result.

## Red/green history

1. **Initial freeze `5853b0e63db9d20190c39ad389f4e76e5930587b`:** Outer SHA-256 `6ce890a25adc7ee327ae478d9e17e90c7500e6210000c2d41a7089b469d11cd5`. Independent review found the original pale inscription core incorrectly recolored green. The source regression failed as expected; the other 62 checks passed with that freeze's declared-material expectation. See [initial-5853b0e/baoyun-red.txt](initial-5853b0e/baoyun-red.txt). Historical tests/results are not presented as GPU acceptance.
2. **First fix `57474d0228860ed12338fc5558b9b6fed76ca0e1`:** Outer SHA-256 `2ffeaf1fa9be545335ccb5eda0a092845dd750e8935655ab2551dddfaef572a9`. Pale core retained, four green bars added. The lower bar at local `(0, 10.08, 7.7125)`, y 10.05–10.11, remained hidden behind the original gutter y 10.06–10.20. Full-building first-hit rays caught this even though a selected-frame test would pass. See [recheck-57474d0/baoyun-bottom-border-red.txt](recheck-57474d0/baoyun-bottom-border-red.txt). The frame-selection predicate was also corrected to exclude the 47.6-unit existing gutter from the four small border parts.
3. **Final fix `509fdf7efb4c1415aa59be709c2f4b1ffe3a2432`:** only two lines of new-frame dimensions changed relative to its parent: vertical sides height 1.54 / centerY 11.08 (lower edge 10.31), lower horizontal centerY 10.34; upper horizontal remains 11.82. X/Z, pale core, gutter and roof are unchanged. All four full-building first-hit checks now pass. A preliminary 10.24 lower-center suggestion was not accepted: clearing only the gutter would still leave roof occlusion. The final dimensions were independently tested after the exact commit was frozen.

The published static test now expects zero original-material changes in Baoyun, matching the corrected target. To reproduce the initial color defect, run the inscription regression alone on `5853b0e`; do not expect the final corrected-material assertion to pass on that old defect.

## Execution and limits

- Independent 55 main + 3 static + 4 contact + 1 source/visibility checks: **63/63 passed**. [Exact log](final-509fdf7/independent-tests.txt).
- Existing owner gallery/first18 suites: **36/36 passed**, supporting but not replacing independent review. [Exact log](final-509fdf7/owner-focus-tests.txt).
- Vite bundling passed without executing production building construction, 235 transformed modules, JavaScript bundle 2,703.47 kB; retained warning above 500 kB. [Exact log](final-509fdf7/build.txt). No performance claim follows from this.
- Chromium was present but launch failed with process-singleton `socket() failed: Operation not permitted` and crashpad errors. No denial bypass was attempted. **No WebGL screenshot, shader, mobile or live-GPU visual acceptance is claimed.** The reported geometry/ray checks execute on CPU with the repository's test material library.
- This independent task changed only review tests, fixture and report files in its own clone. No product edits, merge, push or deployment were performed. The final product freeze contains other concurrent work, but only the requested outer three and previous outer eighteen's exact retention were evaluated here.

## Reproduce

Use the repository's lockfile and Node supporting `node:module.registerHooks` (this run used v24.19.0). Put the five review test/helper files plus fixture into a checkout of the exact final product commit if they are not yet committed. The tests write no results unless explicitly requested.

```sh
node --test tests/r48-review-outer-finishes.test.mjs \
  tests/r48-review-outer-finishes-static.test.mjs \
  tests/r48-review-outer-finishes-contact.test.mjs \
  tests/r48-review-baoyun-inscription.test.mjs
node --test tests/r48-outer-gallery-details.test.mjs \
  tests/r48-outer-first18-retention.test.mjs
npm run build

mkdir -p /tmp/r48-outer-review-results
R48_OUTER_REVIEW_DIR=/tmp/r48-outer-review-results node --test \
  tests/r48-review-outer-finishes.test.mjs \
  tests/r48-review-outer-finishes-static.test.mjs
node tests/r48-review-outer-finishes-capture.mjs "$PWD" \
  /tmp/r48-outer-review-results/current-capture.json
```

Regenerate the actual predecessor rather than trusting the shipped snapshot:

```sh
git worktree add --detach /tmp/r48-outer-predecessor \
  e0d19a575e0840fd8a52a5b45a02561e48610c1d
# Install the locked dependencies in that checkout as required.
node tests/r48-review-outer-finishes-capture.mjs \
  /tmp/r48-outer-predecessor /tmp/rebuilt-parent.json
cmp /tmp/rebuilt-parent.json tests/fixtures/r48-outer-independent-e0d19a5.json
```

All coordinate/size/results data here are observations of the model or test execution, not survey measurements of the real buildings.
