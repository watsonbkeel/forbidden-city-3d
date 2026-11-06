# Bilingual candidate verification

This is a local, unpublished candidate derived from accepted public commit `e1287435158ee5aa98e0a1a370cae97021a5c385`. Runtime scene/GPU, real browser layout and cumulative CI acceptance are not yet claimed.

## Content and identity

- Original Chinese catalog: 164 cards and 130 sources, byte-identical to e128. All original present fields retain their English project translations. Official English display names are a separate ID-keyed overlay. Optional unsupported people/interior records remain absent.
- Supplemental catalog: 122 records, comprising 28 statically identified existing-map projections and 94 directory-only entries. Total information cards: 286, plus four separately listed map-only bridge facilities.
- Original catalog interface and its 164-button section remain intact. A supplemental section shares search and selection. `allPlaces` declares the combined denominator.
- `reconciliation.json` records exact source IDs, declarations, exclusions and unresolved source-register rows. The 398-row source register is not an attraction count. Runtime correspondence is explicitly pending.
- Four projections have no runtime object ID. They require explicit source evidence, complete projection equality and uniqueness. No runtime ID is fabricated. Directory-only cards cannot offer travel, even when a same-named target exists.
- Supplemental sources contain 197 unique official URLs: six new text/excerpt checks and 191 inherited attributions. `source-review.json` distinguishes method and limits. This is not a new review of all original 130 pages.
- Original two Nansansuo inventory statements have exact-ID bilingual display errata with original text hashes. Only the stale front/rear-only claim is removed; uncertainty about correspondence to surveyed buildings remains.

## Completed lightweight checks

The UI/content freeze completed a serial selection of 109 passing tests: the bilingual tests present at that freeze, existing `tests/map-place*.test.mjs`, and the current catalog, complete-catalog and all-zone catalog contracts. This includes rendering every original English card and every supplemental card in both languages, source metadata, invalid locale/storage, bilingual/pinyin search, exact selection, stale travel rejection, unchanged movement/view state, focus and non-layout scroll contracts, CSS orientation-language coverage, and precise source projection matcher negative controls.

These DOM fixtures do not simulate browser layout, native touch physics, World streaming or GPU rendering.

The extra historical `place-catalog-four-cards.test.mjs` fails in its old R6 inverse catalog hash. A separate 180-file view containing the exact e128 test and its transitive inputs reproduced the same expected/actual hashes. The failure is retained separately; neither assertions nor fixtures were refreshed. Historical r31 fixed-159 assertions also remain unchanged. Neither extra failure is silently represented as a pass or substituted into the selected cumulative suite.

## Source-comparison boundary

An additional ten lightweight checks passed after source integration. They cover the complete 991-file runtime/build input set, exact hashes and modes, ignored files, path aliases, symbolic links, unknown additions, byte drift, the 24 reversible source-test edits and actual candidate imports. That source-boundary freeze had 971 unchanged files, five modified files and 15 additions relative to public e128. The subsequent official-name registry and helper add two explicitly listed runtime files; the new full set is 993 files with 17 additions and the same five modified original paths. The full scope matches all 11 roots in `scripts/build-identity.mjs`, including that script itself.

Only 27 historical comparison reads and 12 historical path enumerations in 24 source tests use `tests/bilingual/source-boundary.mjs`. Exact candidate hashes can be inverted to exact public e128 bytes for comparison. Unknown changes are rejected by a separate complete filesystem readback. Original assertions and expected arrays are recoverable byte for byte, and all behavior imports continue to load the candidate. There is no global filesystem or module-loader hook and no restoration of the runtime tree.

Six existing compatible readers and their eight-module recursive closure remain byte-identical to e128. `read-compatible-disjoint.json` records their processed paths. Those paths do not intersect this feature's five modified paths; this is checked mechanically and is valid only for this exact delta. No candidate bytes or successful checks are cached.

The original 430 bounded, five heavy and nine extra command selections remain required on the candidate. Passing the ten new boundary checks does not establish that cumulative result.

## Browser attempt and remaining acceptance

One local sandbox-enabled component-browser attempt stopped before opening a page: Chromium's process singleton socket failed with `Operation not permitted`. No viewport checks or screenshots were produced. The attempt was not retried with reduced sandbox protection. It establishes no browser-layout result.

1. A bounded browser component window in a suitable validation environment, using the same `TourLocalization` bootstrap and actual UI classes as main, at 1280×900 and emulated 390×844. Capture screenshots, console/page errors, layout overflow, native selector input, nonzero scroll, visible source focus, current card/state, four map-only facilities, settings/ARIA, clock draft/error, help and failure feedback. Browser sandbox must remain enabled. No World is constructed in this window.
2. Actual ZoneBase output for all 28 map projections. Run `tests/bilingual/runtime-map.production.mjs` separately with `BILINGUAL_MAP_ZONE` set to each of `garden`, `outer-east`, `outer-west`, `west-six`. Run serially, with output in a fresh `BILINGUAL_MAP_EVIDENCE_DIR`. This is a heavy CPU production-library check, not a browser/GPU or route test.
3. Run all original 430 bounded, five heavy and nine extra command selections on the actual candidate runtime with the integrated source-comparison boundary. Do not restore the whole worktree or redirect behavior imports to older code. Keep the new bilingual checks separate from the retained command selections.
4. Candidate build, source identity, HTTP/native checks and final independent review in the coordinated CI window. The known resource-heavy build is not repeated locally merely for completeness.

## Official-name increment

The name increment preserves all bytes of the original Chinese catalog, the original English description overlay and the supplemental catalog. It adds a separate 83-card registry containing 97 naming-source records: 73 official display forms, two coordinated-wording search expansions and eight related-wording-only records. The other 203 cards remain explicitly unverified for official naming, and the four bridge groups retain project names.

The independent expected-name fixture is keyed by stable card ID and contains reviewed source names and URLs; it does not ask the runtime translator to produce its own expected answers. Focused tests cover every mapping, official/project status, both-language source visibility, name variants, old-name search, Chinese navigation keys, immutable descriptions, duplicate-URL link focus, visible-source scroll anchoring and complete-word map label wrapping. DOM/canvas fixtures establish text and state contracts only. Actual wide/narrow layout remains part of the pending browser validation.

The combined lightweight selection after this increment passed 133 tests: the prior 109 UI/content cases, ten source-boundary cases, twelve official-name cases and two source-link oracle cases. The original command selections are preserved. One retained map-selection behavior test has an explicit contract extension for the new naming links; it is not a source-byte normalization. Historical links retain their original `www|img.dpm.org.cn` assertion, while naming links require exact card ID, evidence ID, complete URL and link count against the independent name fixture. All links retain the original new-tab/security checks. Negative controls reject forged or other-card IDs, changed URLs, missing fields, missing/extra links and duplicates.

These results do not supersede the pending cumulative, real-map, browser or build checks above.
