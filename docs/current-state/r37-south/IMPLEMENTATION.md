# R37 source-bounded implementation checkpoint

## Changed scene scope

The `outer-west` Yude record now opts into `YudeBath.js`. Its named front-hall anchor, retained 12.7 × 8.2 model footprint, front entry, single empty room and floor remain. No new catalog identity, rear visitor room or teleport spawn is introduced.

- The front has a local rounded-crown xieshan approximation; the separate northwest two-bay room has a local rounded hard-gable roof. Generic raised ridges and ridge ornaments are not carried into these two rolled roofs. The global roof builder is unchanged.
- A shallow two-bay rear attached mass represents the documented annex. Its west-biased placement is explicitly a fit interpreting an unlabeled projection in the 1942 plan, not a confirmed current footprint. Its exact roof junction/type is unresolved and represented by a simple labeled cover, not claimed as a reconstructed rolled roof.
- A separate square bath stands behind the east secondary bay, reached in the model's topology by a bent brick-vault connection. Those rear components are solid, exterior-only collision footprints, not a large whole-courtyard barrier. The front retains its existing closed rear wall, with a closed east-bay door representation; no rear visitor access is implied.
- The bath has a fitted gray dome and a small polygonal lantern, plus one local wall treatment using distinct gray masonry, red wall and yellow curved cap/drip geometry. Colors, lengths, heights, counts and roof curves remain fitted. The photograph's partly occluded dome does not establish the true full cap height.
- The west well pavilion, boiler/service room, subterranean furnace, working pipes, bath furnishings and interior access are withheld. Their existence or historical description does not establish a current accessible model.

The two Wuying refinements are exclusively the already mapped 2021 `scene_d102` and `scene_60` objects. The former has a real inner floor and thick flared rim; the latter has fitted collar rings and paired pierced ears. Coarse visible-front color bands do not reproduce the original painted motifs. Reverse sectors remain neutral. Two separate blank label cards have no invented accession number, caption, QR code or current-inventory text. The other fourteen vessel geometry/material/transform identities are covered by an R36-input retention fixture; all sixteen cabinet placements and collision envelopes remain unchanged.

## Evidence hierarchy and correction

See [PHOTO-CONSTRAINTS.md](PHOTO-CONSTRAINTS.md). Official building text establishes building type, bay counts and qualitative relationships; dated official imagery constrains visible silhouette and material bands. No new surveyed dimensions were obtained. Retained model envelopes are not measurements.

The historical drawings reproduced in the 2021 paper are January and May **1942**, not 1932. The original enlarged date captions were inspected in R37. R36's source note misread the date; its original record remains frozen and this is the explicit erratum. The drawings are historical context, not a current 2026 survey.

## Verification scope

Owner tests execute current Three.js geometry, real ZoneBase dispatch, collision and route modules. Independent tests additionally exercise real merge/disposal and controller routes. Test-first logs recorded the expected missing Yude helper and missing vessel detail failures before production implementation, plus physical hard-gable closure and label/upper-pad interference failures before their fixes. The label diagnostic initially used a full-object equality assertion that exhausted the test process while formatting the failing object; it was changed to a boolean identity assertion, which reproduced the intended physical failure clearly, before the geometry fix.

Known verification limits are unchanged: no genuine current-candidate rendered screenshot, native browser interaction, GPU/FPS or physical phone acceptance. Refer to [RENDER-VALIDATION.md](RENDER-VALIDATION.md). CPU geometry is not rendered visual acceptance. No global material tuning, water edits, helicopter changes, catalog changes, main edits or publication occurred in these implementation commits.

## Independent review corrections and final freeze

The first vessel pass used vertex colors, which the actual shared merge intentionally strips; it also inherited an unclosed deep throat for scene60. Neither was accepted as final. The repaired implementation uses two private 64 × 128 RGBA procedural color-zone maps with explicitly generated UVs, which the unchanged merger retains, and a neutral deep inner ceramic floor. Current merged ray/UV samples and texture-disposal events were independently checked. The local negative-Z viewing convention is fitted, not proof of the source camera's compass direction.

Final production is `93789c45ff034d64760be48a265053a32818a6b0`. Final owner 122-test group and independent 16-test group pass. Vite build succeeds; root comprehensive and historical groups are separate. The resource delta in OWNER-CHECKPOINT.json compares against `bccf645`, which already contains Yude: it is a **vessel-only** delta, not the whole R37 versus R36 cost. No GPU claims follow from these CPU counters.
