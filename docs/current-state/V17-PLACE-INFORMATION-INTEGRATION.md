# V17 + place-information integration candidate

Prepared 2026-10-16. This is a local CPU-only integration source candidate. It is **not an accepted release**. V16 runtime acceptance remains blocked by its unresolved page crash; V17 visual/runtime acceptance remains pending. Neither the source-data reviews nor the checks here remove those gates.

## Exact lineage and scope

The isolated `experiment/r3-v17-place-information-integration` branch starts at frozen V17 commit `5f8f33e241ae080a53c008ca70c0d0d62662ca96`, tree `17309acc142c7d9295716b208d1a46a32dab4f39`, whose parent is V16 `57db2276404220f2072d182f759f1422871ac371`.

Prepared additions were inspected before applying. Their paths have no overlap with V16/V17 architecture changes from their older shared base:

- V18 `9cd8a8b6837b1838db138d0938b5b2799b8917e1` → local `86cbf87`: ten source-backed cards, nonmodal detail selection, separate explicit travel.
- V18 correction `4959aff5ea75feced080b68cc166c86eef57837c` → local `3250bb3`: cancel an unreleased mouse press when it leaves the travel button, while preserving touch release ordering.
- V19 `dc20b190d9ed2d98059deabc9f4b62488c6fe198` → local `31103fd`: four more reviewed cards and exact pavilion/zone bindings.

All 21 paths from the combined V18/V19 delta match the final prepared V19 tree byte-for-byte. The 525 other V17-tracked files match frozen V17 exactly. The only newly authored files in this integration are this document and one aggregate CPU integration test. Original V17, V18 and V19 worktrees remain clean and unchanged. No merge conflict, whole-tree replacement, fixture refresh, geometry re-export or dependency update was needed.

## Product boundaries retained

There are 14 cards and 21 official Palace Museum source records. Selecting a map label or information button reads the card; travel still requires a distinct “前往” action. The eight quick-travel buttons/targets and the numeric-key handler remain. `main.js` differs from V17 only by the reviewed target-existence callback; the exact reversible source guard preserves the entire remaining entry/input code. Movement, map-tour sessions, controls, Teleport, collisions, zone data, scene code, geometry assets and architecture source cards are unchanged from V17.

The selected Taihe GLB remains `taihe-v17-a8e358509558.glb`, SHA-256 `a8e3585095585b970b211c09666c8f0212659d718e6fb813236bb77b07886a17`: 586,224 bytes, eight batches and 8,330 triangles. V16 glyph UV/atlas ownership, atomic loader transitions, fallback and permanent collision geometry remain intact. The V17 column-only approximation retains its earlier source limits and still needs controlled visual comparison.

## Integration-specific CPU coverage

`tests/map-v17-place-integration.test.mjs` is **one aggregate test**, not fourteen separately counted tests. It uses:

- The unchanged actual static PalaceBuilder/Enclosure/GardenBuilder collision world.
- Production `ZoneManager`, all seven production zones, real ZoneBase/CourtKit construction and normal load/unload registration.
- Actual `getMapItems()` output: 218 map records and 250 region records.
- All 14 unique catalog-to-canvas-label bindings and keyboard-reachable information-button nodes.
- Production target registry, `Teleport.go`, collision-backed landing resolution and `FirstPersonControls`.
- No automatic travel while reading; one distinct explicit action per destination; a finite, collision-free result for every card.
- Qin'an retains its verified ground-level exterior point rather than an interior or platform destination.

DOM, canvas rendering/measurement, image fetching and time are fixtures. The test does not prove native canvas hit testing, browser event ordering, rendering, frame budgets, physical touch, controller traversal beyond the landing, or same-day visitor access. Existing movement, compact-map, pointer cancellation, stale selection, multi-contact, settings, source-guard and Taihe tests are included separately in the focused/full suites. Their fixture coverage must not be reported as real-device acceptance.

## Historical evidence and current access

The integrated catalog is copied exactly from the already-reviewed candidates, including source IDs, canonical official URLs, retrieval methods, dates and per-fact attribution. This integration did not perform a new web retrieval or advance any source-review date. The catalog's historical `baseCommit` remains its V18 authoring baseline, not the integrated scene lineage above.

For the four additions, the existing independent source review cleared 23 brief historical fields. Its retrieval limits remain: Wenhua's canonical request timed out and the same official article was opened through an indexed highlight URL; Wuying/printing material used official indexed bodies; the pavilion paper's printed page 133 used indexed text without a newly opened full PDF. Tiren and Hongyi official pages were opened directly. Named residents, period boundaries and rebuilding-start versus completion are not expanded by integration.

Historical content is not a current opening notice. Current exhibitions, interior admission and on-site opening remain unverified. All four added access records retain `not-verified` and `checkedAt: null`. The inherited Taihe Gate notice remains explicitly dated with unknown reopening, and the UI tells readers to check current official notices. Model teleportation grants no real-world access permission.

## Verification and remaining gate

Verified in this combined source tree:

- Focused POI/Taihe suite: 211/211 passed, none failed or skipped.
- One serialized full CPU sweep: 1,562/1,562 passed across 88 files (85 MJS plus three CPU-only CJS), none failed, skipped or cancelled; 88.93 seconds.
- JSON Schema Draft 2020-12: valid, 14 cards and 21 sources.
- `npm run build -- --base=/forbidden-city-3d/`: passed; 119 modules, JS 1,205.24 kB / gzip 363.97 kB. The existing >500 kB chunk advisory remains.
- Seven-zone lint: zero errors and 23 inherited warnings.
- Anchor probe: inherited failure, with output byte-identical to the unchanged frozen V17 worktree.
- Protected-byte checks: 525 unchanged V17 files and 21 exactly integrated V18/V19 files. Original source worktrees are clean.

The frozen verification receipt and exact command logs live in the local audit packet named `taihe-v17-place-information-integration`. Counts are per run; focused results overlap the full suite and are never added to its total. These are CPU/build checks, not ordinary-browser acceptance.

The inherited Shenwu anchor discrepancy remains **11 m against a 5 m tolerance**. Its source and tolerance are unchanged; it is an acknowledged failing check, not waived or repaired by this candidate. The seven-zone lint's pre-existing warnings and build's large-chunk advisory are retained.

Before any accepted release, separately authorized testing must cover V16 crash resolution, the V17 visual A/B, the final combined production build in a normal browser, all fourteen map labels/information buttons, eight quick controls, explicit travel success/failure, compact/back/close/settings flow, keyboard and physical multi-touch, small/short viewports and zoom, accessibility, source-link opening, console errors and performance. No browser, GPU or server was started here. No remote push, main update, Page/site change, deployment or release ZIP was made.


## Future ordinary-experience check (not run)

1. Open the map and continue walking with an already-held movement key or joystick; the map must not pause or reset that movement.
2. Release movement, select a building label and read its card. Selection alone must not change the player position.
3. Press the card's explicit “前往” once. Confirm one intended trip, then release and deliberately reapply movement input.
4. With movement released, scroll the card without moving or rotating the scene. Return to the map, close it, and check that focus/control ownership returns correctly.
5. On a narrow phone, inspect the card, Back/Close controls and joystick together: no overlap, hidden exits or blocked touch targets. Include short landscape and text zoom.

These remain native-browser and physical-touch checks. No browser harness was created for this handoff.
