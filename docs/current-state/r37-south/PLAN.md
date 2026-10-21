# R37 bounded south-detail implementation plan

Baseline: local `c6718de` (remote R36 equivalent `c92f7a9e9ab0ead8e6f00d2a0550503f3b09d193`). Owner branch: `feat/r37-south-detail-20261021`.

User confirmed the preceding southern-detail proposal at 2026-10-21 04:36:55 UTC. Checkpoint: 08:37 UTC. No main, push or Pages changes by this implementation worker.

## Design and limits

Add an opt-in Yude compound builder in the existing outer-west hall dispatch. Preserve the named front hall anchor, front entrance, 159-place / 7-question catalog, water, southern routes and helicopter controls. Keep the three-bay front hall distinct from the rear bath. Official building text establishes a two-bay rear annex, two-bay west-offset north room, bent brick-vault connection from the east secondary bay, square bathing room and a west-side well pavilion. Specific inclusion and topology will be cross-checked against the research review before construction. No generic lemma substitutes for a photograph of the actual well roof.

Front and northern yellow rolled-ridge roofs are local opt-ins rather than a global RoofBuilder change. Bath dome is gray, low-profile, with a small glazed roof lantern. Unverified rear spaces remain closed and unregistered as visitor rooms; no invented tub, furnishings, steam, basement access or current inventory. Only source-supported representative surface details are included.

Official topology, dated photograph fitting, historical drawing context and unknown dimensions must remain separate. Every new length, position and height is an explicit reversible fit, not a measurement or 1:1 claim. The May 1942 drawing reproduced in the 2021 paper is not current surveyed geometry.

## Test-first sequence

1. Add failing tests for opt-in profile validation, source-separated topology and actual generated bath geometry.
2. Implement minimal local builder and registration; verify front approach, solid rear boundaries and bounded geometry.
3. Add failing tests for photographed local roof/surface detail, then implement only verified details.
4. Run bounded current south geometry, collision, route, resource and helicopter checks. Preserve historical failures as failures, with baseline classification.
5. Provide exact changed-file manifest and candidate commit plus results to root for independent review and publication decision.

Real browser rendering, native input, GPU/FPS and physical phone acceptance are separate. No shell browser/Playwright workaround is permitted and CPU geometry checks will not be called visual acceptance.

## Checkpoint outcomes (2026-10-21 04:51 UTC)

- Completed: local opt-in Yude compound, retained front entry/room, separate square bath and bent closed passage, rolled front/north roofs, one local photo-supported wall-cap treatment.
- Partial and explicitly fitted: shallow annex placement interprets an unlabeled historical projection; exact roof junction is unresolved. Complete current bath dimensions and dome profile are not established by the photograph. These are not measured 1:1 assets.
- Withheld: well placement/roof, boiler/service building, underground furnace, rear visitor access, bath interior and working water/steam system.
- Completed: only Wuying `scene_d102` and `scene_60` cavity/silhouette, coarse visible-front bands, paired ears/collars and blank photographed label cards. Other fourteen vessel identities are hash-retained; no cabinet placement or collision changes.
- Owner checks completed: 8 Yude + 5 vessel tests; all 108 existing `r36-*` tests plus those 13 tests pass (121/121), and Vite build succeeds with the existing large-chunk warning. Earlier impacted Yude route/court/resource run passes 41/41. These overlapping groups must not be added into a purported unique test total.
- Independent Yude checks completed: 10/10 current merge/collision/controller/ownership checks; two-vessel review pending at this timestamp. Root owns final comprehensive and historical suites, candidate seal and publication decision.
- Blocked: genuine rendered candidate, native browser/phone and GPU acceptance. No shell browser workaround or blind visual retuning was used.

## Final production freeze (2026-10-21 04:54 UTC)

Production commit: `93789c45ff034d64760be48a265053a32818a6b0`. Independent review found and verified repairs for a stripped vertex-color attribute and the scene60 open inner throat. Coarse color zones now use two small private UV-mapped textures compatible with the unchanged merge path; scene60 has a deep neutral inner floor. No shared merger or noMerge behavior changed. The textures encode original simplified color bands, not downloaded photographs or copied motifs, and the colored-half orientation is an explicit local viewing fit, not a verified compass direction.

Final owner current group: 122/122 (108 existing R36 + 8 Yude + 6 vessel tests), exit 0. Final independent current Yude/vessel group: 16/16, exit 0. Final build exits 0 with the existing large-chunk warning. Earlier 121-test output predates the two review repairs and is superseded, not claimed as the final seal. Root comprehensive/historical checks remain separate. Only documentation may change after this production freeze without reopening verification.
