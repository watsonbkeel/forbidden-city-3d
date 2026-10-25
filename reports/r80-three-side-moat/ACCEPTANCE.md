# R80 three-side outer moat candidate

## Delivered scope

North, east and west strips now have water at model y=-0.5, a fitted bed at-1.5 and six bank faces ending at ground y=0. A single U contour derived from the same profile removes the opaque ground above the water. The north strip owns both corner squares; the three water surfaces do not overlap. Both southern ends remain open without invented end walls or bridges.

The inherited southern rectangular strip crosses the initial spawn, so it is deliberately NOT rendered. The central road, ground, initial view(0,-494), ordinary start(0,-470), all walking bounds, walls/gates, collisions, supports, NPC routes and conservative four-side flight mask are unchanged. The map renders three filled sides and a faint pending southern outline, with explicit model-fit/pending-south/conservative-flight disclosure. This is not a full four-side moat restoration or a new visitor route.

Source dimensions and levels are model/engineering fitting, not surveyed data. Actual source pixels were viewed. map3.jpg is an official visitor open-area illustration. ditu1.jpg is an official-domain-hosted third-party AMap basemap referenced in a commented tag in the cached official Visit page; it is not described as the current main map or a bank-detail photograph. Source URLs, hashes and classifications are recorded separately. No photo pixels were copied into project assets.

## Frozen runtime and inheritance

Base local R79: ebf9fce616e09d474130069489150978bc9b80be. Read-only remote precheck found R79 945ff1187f34a2f6e67a9ec5d077053c7c2a1319 and main8681116188288aed2db6eeb59cad5dd01cc0fe23.

Final runtime fingerprint: fac67a917583cba6fe9b4d015ec3877c96f5110112b8ef031888d64a56916643. Strict four-path successor: Environment.js, new OuterMoat.js, Minimap.js and release.json. The R79 discovery HTML, metadata, llms, sitemap, main's 17 non-GEO files and all other runtime inputs are retained. README changes only current cumulative release/history status, adding verified R79 and local R80 candidate, without asserting deployment.

Root build R80-b5b47eabffe9; /gugong/ build R80-22ecb6010434. Both built from committed204cc45f7ecdf7f4efdcd1fed20705a37300de26 with clean runtime inputs. Later evidence/test commits do not change those inputs.

## Verification

- 141 focused geometry, lifecycle, map, discovery/UI, source-inventory and clock/eyes/lighting checks PASS.
- Two full-world nav/flight tests PASS. Navigation counts and hashes exactly match R78/R79. Flight heights hash d05598215768aff7672fdc7fe119e91fa5116f1da35beb3304a62f38f821af0f and water hash3754579b9b17cdf5997560b24ff908e48e8d8eeded6de1f8fc3b92758c45e08a exactly match a fresh R79 baseline. All rendered sides/corners and the retained south mask reject descent into water; dry interior remains dry.
- Four complete final-runtime night worlds PASS: base, actual Yangxin, actual Kunning and actual Huangji assets. Each preserves108 logical actors,28 unique occupied beds, emperor movement/blocking, wake/sleep boundaries, visible budgets and unload/reload behavior. Earlier pre-release runs are preserved separately and not substituted for final fingerprints.
- 13 Wumen geometry and28 folded-ascent/landing motion tests PASS. Two initial-entry successor tests PASS, including visible road/ground, body/head clearance and the original54m approach.
- Both production builds PASS with existing large-chunk warning. Three actual HTTP/root/subpath/package-launcher checks PASS. The package starts as R80 and serves the cumulative R79 discovery pages correctly.
- Fresh independent review reran7 targeted tests and independently swept3,213 wet rays and508 dry-edge rays with no failures. Six bank bounding boxes were checked as axis-aligned, top y=0. This is CPU geometry evidence, not GPU imagery.

## Raw failures retained

The unchanged1,290-case current-state suite is1,138 PASS /152 FAIL. All151 R79 failures remain with no removed labels. The one additional old-fixture failure is initial-entry.test.mjs line101: its cleanup assumes every Environment object directly has geometry, but the new owned moat Group does not. The raw finally error alone cannot prove prior assertions passed because cleanup can mask an earlier error. The original test and raw failure are untouched; tests/r80-initial-entry.test.mjs keeps the exact same assertions and only replaces cleanup with production Environment.dispose(). Its passing result, independently rerun, establishes the actual ground/body/head assertions and54m walking behavior. This is not reported as an all-green suite.

An initial new dry-ground ray assertion used exact y>=0 and failed at floating rotation noise(-1.31e-13 at z590). Raw output is preserved; corrected tolerance1e-8 passed. No geometry was shifted to hide the failure.

## Package and remaining limitations

One cumulative root production package:139 files,41,677,886 bytes; manifest SHA256 ccd43e2a847c93d6a94a34bd9f5ea927d456a532fea05c53186d0dbc683ad4fd. The separately checked /gugong/ build is not mislabeled as a root package.

No main write/merge, Pages dispatch, credentials change or deletion was performed by this implementation task. Free disk after build/package is approximately649MiB. Existing R79 rollback, prior tests and raw evidence remain retained.

Remaining: real GPU/mobile water appearance, texture scale, nighttime reflectance and map visual layout are unverified. The existing browser launch restriction was not bypassed or blindly retried. South-water/bridge geometry, exact bank detailing/elevation, current visitor-route access and the older city-scale residual remain unresolved. No screenshot or surveyed restoration is claimed.
