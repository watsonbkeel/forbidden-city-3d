# V19 four-place-card preparation (CPU-only)

Prepared 2026-10-16. This is an additive integration candidate, not a release or a new accepted scene baseline.

## Lineage and scope

- Parent: `4959aff5ea75feced080b68cc166c86eef57837c`, the clean V18 place-information branch on the V15 scene base.
- Isolated branch: `experiment/r3-four-place-cards`.
- Worktree: `/workspace/shared/forbidden-city-3d-r3-four-place-cards`.
- Adds 文华殿 (`wenhua`), 武英殿 (`wuying`), 体仁阁 (`tiren`), 弘义阁 (`hongyi`) and six official sources. There are now 14 cards and 21 sources.
- All ten existing card objects, all fifteen existing source objects, their order, schema, and metadata remain byte-reconstructible to the frozen V18 catalog SHA-256 `6fdc0077c52a0198531fe6ed96f72568c5aae2ab03b2b183a8dd7cd3cd66a164`.
- The catalog's inherited `reviewed-local-candidate` status and base metadata remain unchanged; they do not mean runtime or release acceptance.
- No changes to UI components, movement, shortcuts, travel behavior, scene geometry, collision, zones, assets, dependencies, or schema. No browser, GPU, server, public Page, publishing, or deployment was used.

## Binding changes

`PlaceCatalog` now imports exactly the three additional required zones (`outer-east`, `outer-west`, `axis-courts`) alongside `garden`. Constructor resolution retains the `hall` / `gate` / `cityGate` filter and its exactly-one-target rule.

Map lookup also rejects non-building kinds before matching. The real seven-zone `ZoneBase`/`CourtKit` output contains one 武英殿 hall and no region records; the same-name region stays in the original source and never enters `ZoneManager.getMapItems()`.

The two surveyed pavilions require profile-aware matching: their rendered map rectangles use asymmetric platform centers rather than the building origins. `PlaceCatalog` derives their exact center and dimensions from the existing `pavilionGeometry` function and requires matching profile IDs. No offset is guessed, no tolerance is relaxed, and no profile/geometry source is edited. Duplicate names, displaced rectangles, missing/wrong profiles, and changed dimensions fail closed.

The actual generated map list is exercised in CPU tests, including all five zone cards (the four additions plus 钦安殿). All four added canvas labels resolve. Selecting a card still requires a separate explicit travel action.

## Source review

Source material is the unchanged additive research packet at:
`/workspace/shared/palace-r3-overall-audit/place-information-v19-four-cards/`

- `minimal-delta.json`: `71a917678102273758d67e62380ebf4debe12a83f43a0b0d1c84cf39d72a0713`
- `draft-zh-CN.json`: `46af05d598956f5dda03c2d033a7ab5f1fa3c0d4cc33e347a89909db8a2a5738`
- `source-audit.json`: `39ba91b310397460167e1470d18ab9eb628b78b8a2d38279ff3d7736efa46971`
- `OWNER-INDEPENDENT-SOURCE-REVIEW.json`: `65827a765c5566d44f155bae46e6ae5ef5aa9c9dbd19b01d3ee4f8516068193a`

The independent review cleared all 23 brief historical fields without wording changes. Retrieval limits remain: Wenhua canonical request timed out but the same official article was retrieved through an indexed highlight URL; Wuying and printing material used official indexed bodies; the pavilion paper's printed page 133 used indexed text, not a newly opened full PDF. Tiren and Hongyi official articles were opened directly.

This source clearance is not present-day access or model-navigation approval. All four `siteAccess` objects remain `not-verified` with `checkedAt: null`. No current exhibition or interior-opening claim has been added. The integration copies the reviewed additions exactly; fixture hashes lock their full object content and source records.

## Verified CPU checks

Run from the isolated worktree with Node 24 and the repository dependencies available:

```sh
node --test --test-concurrency=1 tests/place-catalog*.test.mjs tests/map*place*.test.mjs tests/place-info-source-delta.test.mjs
node --test --test-concurrency=1 $(find tests -name '*.test.mjs' | sort) tests/browser-path.test.cjs tests/gate-probes.test.cjs tests/physical-route-wiring.test.cjs
npm run build
npm run test:zones
npm run test:anchors
git diff --check
```

- Focused: 88/88 passed.
- Full CPU suite: 1,452/1,452 passed across 80 files, no failed/skipped/cancelled tests; 83.44 seconds. The CJS files listed above are CPU-only, despite the name `browser-path`.
- JSON Schema Draft 2020-12: schema and 14-card/21-source catalog validated.
- Production build: passed, 115 modules, JS 1,192.79 kB / gzip 359.11 kB. Existing >500 kB bundle warning remains.
- Zone checks: passed, seven files, zero errors, 23 existing warnings.
- Anchor checks: **inherited failure**, 神武门 Layout.js differs from anchor by 11 m against 5 m tolerance. A rerun on untouched parent V18 produces byte-identical output; no anchor was changed or tolerance relaxed.
- Protected boundary check: 169 schema/UI/navigation/scene/zone/asset/dependency files are byte-identical to V18.
- `git diff --check`: passed.

Evidence, including the before-fix failures, is under:
`/workspace/shared/palace-r3-overall-audit/place-information-v19-integration/`

The new tests cover exact fourteen bindings, byte-exact restoration of the old catalog, unchanged reviewed additions, same-name region rejection, missing/duplicate/wrong-zone failures, non-building rejection, real generated map records, wrong pavilion profiles/centers/dimensions, separate travel action on desktop/mobile CPU fixtures, and unchanged eight quick-key targets/labels/actions.

## Changed-file allowlist

1. `data/places/zh-CN.json`
2. `src/ui/PlaceCatalog.js`
3. `tests/place-catalog.test.mjs`
4. `tests/map-place-selection.test.mjs`
5. `tests/fixtures/v19-four-place-cards.json`
6. `tests/place-catalog-four-cards.test.mjs`
7. `tests/map-four-place-cards.test.mjs`
8. `docs/current-state/V19-FOUR-PLACE-CARDS-PREPARATION.md`

## Later integration and acceptance

Do not merge this branch as a divergent release or replace accepted V16/V17 scene files with this worktree. After the chosen accepted V16/V17 baseline contains the accepted V18 place-information feature, cherry-pick only this branch's single additive commit (its exact ID is in the final integration receipt). If using the local shared repository, the candidate can be resolved with `git rev-parse experiment/r3-four-place-cards`; verify its parent is the V18 commit above before picking.

Resolve any later content changes explicitly rather than refreshing baseline fixtures or dropping the preservation test. Rerun the CPU/schema/build checks on the final combined tree. Run the separately authorized ordinary-browser acceptance there: four actual canvas labels and keyboard-reachable information buttons, no automatic travel, explicit valid travel and failure fallback, all eight old quick controls, compact/expanded map lifecycle, keyboard and real touch behavior, accessibility, console errors, and performance. Retest all original ten cards too.

Browser/device/runtime/navigation acceptance remains pending. Source-content clearance alone cannot remove that gate.
