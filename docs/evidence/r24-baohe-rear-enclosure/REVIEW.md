# Baohe rear enclosure: focused evidence review

Reviewed 2026-10-18. Research-only review of the R23 candidate; no repository edits, tests, browser or publishing.

## Finding

**High-confidence visible mismatch.** Baohe's rear has three central door assemblies flanked by broad, continuous solid red wall wings. R23 instead assigns `lattice_doors` to all six non-central rear bays. This is a supported candidate for a bounded enclosure correction, independently of the R23 front-facade work.

## Sources actually inspected

- Modern museum photograph: `palace-next-stairs-evidence/pano-photo-0.jpg`, [official image](https://file-pano.dpm.org.cn/hotspotImage/2025/08/19/krifGadFEJmnbv2husSTFFmNgVIfts3wHEBVO4r7.jpg). Provenance/hash are in that directory's `pano-photo-downloads.json`. The image shows the rear plus one gable end. Broad red wings flank three central lattice-door assemblies. Its upload-directory date is **not** a verified photography date.
- 1941 plan: `palace-next-stairs-evidence/drawing-48.jpg`, [official plan](https://file-pano.dpm.org.cn/hotspotImage/2026/06/25/b1ced0e6c4924342bf1d7cfb86b47788.jpg). Name/date are in `baohe-drawings.json`; hash in `drawing-downloads.json`.
- 1941 rear elevation: `drawing-42-rear.jpg` beside this review, [official drawing](https://file-pano.dpm.org.cn/hotspotImage/2026/06/25/e4e0d359fb7c461984eda6c6b525e15d.jpg). Sheet title explicitly identifies the rear. It shows only three central door bays and solid wings.
- 1941 coloured rear elevation: `drawing-47-rear-colour.jpg`, [official drawing](https://file-pano.dpm.org.cn/hotspotImage/2026/06/25/5c7a7b96e75b4a0996aea8b7b3cc1e82.jpg). It independently makes the uninterrupted red wall fields clear. Both additional drawings were downloaded from exact URLs already present in the museum source manifest, then viewed. Their sizes/hashes are recorded in `rear-drawing-downloads.json`.
- Cross-check: the existing `pano-photo-1.jpg` and `drawing-49.jpg` show the plaque-bearing front; the saved [museum building page](https://www.dpm.org.cn/explore/building/236434.html) identifies the nine-bay hall and its north-seated, south-facing throne.

## Orientation, independently checked

1. In photo 0, the triangular decorated roof gable belongs to the **short side face** at image left. The long face receding to image right is the enclosure being reviewed. Do not classify the gable face itself as the rear.
2. The long face has no front name plaque and has three central door assemblies rather than the extensively latticed, colonnaded front in photo 1 / elevation 49. These clues alone are suggestive, not a compass bearing.
3. Elevations 42 and 47 explicitly label this solid-wing / three-door composition as the rear. Their long terrace descent also registers to the lower portion of plan 48.
4. In plan 48, the throne/screen is near the **lower** enclosure, and the **upper** side has the recessed front enclosure behind a separate outer column row. Combined with the museum's south-facing-throne description, this establishes lower = rear/north, upper = front/south. Image-up is not north on this sheet.

## Bay identity and current code

`src/scene/palace/BaoheColumnGrid.js` supplies ten frontage stations / nine bays and the inherited central set `openBayIndices: [3,4,5]`.

- Rear solid wings: zero-based bays **0,1,2** and **6,7,8**, i.e. from the two exterior corners to the boundaries of the central three-bay group.
- Rear door assemblies: bays **3,4,5**. The number of assemblies is supported; exact leaf subdivision and pose are outside this finding.
- `BaoheDepthGrid.js` registers rear row 5 at relative `z=+10.8`; front is row 1 at `z=-8.3`, with a separate south eave at `-10.8`. These are retained rounded historical registrations, not newly measured dimensions.
- `PalaceBuilder.js`, approximately lines 734–759, loops both front and rear. Baohe-specific front helpers apply only to `s === -1`. On `s === 1`, the central three bays retain generic folded leaves; every other bay falls through to `libBox(... 'lattice_doors' ...)`. The later red upper strip does not remove this lower-enclosure mismatch.
- Existing rear collision runs already cover the two outer portions and exclude the central span. Nothing in this evidence requires changing those passage bounds.

## Bounded next implementation

Replace only the six non-central rear lattice fields with solid red enclosure, producing two visually continuous wings. A simple material swap on six separate panels may leave prominently exposed intermediate columns/gaps; the sources show continuous wall surfaces, so inspect the result for false panel divisions. Retain the existing rear plane, outer envelope, central three-bay opening bounds, central leaf geometry/pose, floor, roof, columns, side walls, front facade and approaches. Do not describe inherited central openings as a measured current condition.

## Limits

No new exact wall height/thickness, bay dimensions, lower-base profile, door-leaf count, opening angle, restoration date or visitor-access rule is established. The current photograph and historical drawings agree on topology, but are not a current survey. Do not close the playable central openings merely because the reference photograph shows closed doors, and do not extend this correction into a new rear-door reconstruction without separate evidence.
