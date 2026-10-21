# Independent bridge-interface correction verification

Scope: first integration `7ed729b48ef9981d12af2e206f0cacb719c85404`, plus **only** the two-file bridge correction from `c92b928786b1cf0274f996aeb0b6e5dcc735f6d9`. This separate clone does not contain the other residential/outer/Ningshou batches or the correction commit's other parent changes. The original frozen review clone and failing test remain unchanged.

## Result: 82/82 selected checks pass

- 35 supplied first-integration tests, plus 47 independent checks, all pass.
- The original merged-marble/real-controller support failure now passes unchanged at the same 60Hz sprint condition. All four FPS/sprint combinations pass across both bridges, forward/backward travel and lateral offsets -0.65/0/+0.65m.
- Four new 0.32m box supports (two crossing stones and two exact intersections with the retained edging) were independently sampled at 484 XZ points against the final merged visible marble. Every support has an actual same-height visible surface, and every new box has exactly the 2.4m bridge-mouth width. The old stone edging remains unchanged; no unsupported surface was added over empty space.
- All original roof-winding, underside, 16-cap-per-pavilion contact, platform-top, water-exclusion and full-zone gate/hall route checks still pass.
- All 117 non-target halls retain exact raw geometry/material/navigation signatures against the separately frozen parent commit. Original beds, paths, 34 tree instances, ornaments, rockery, summit pavilion and the two R47 cross pavilions are unchanged. These checks cover the recorded zone-hall and garden scope; the dedicated axial-palace negative scope has separate R48 tests.
- The 159-place catalog and prior fidelity ledger remain byte-identical.
- `npm run build` passes. The existing bundle size warning remains.

## Durable focused reproduction

The 82-check total above belongs to the frozen first slice, not the later full R48 tree. Its original retention scope must not be applied blindly after additional authorized building changes.

The 44 independent physical checks are included in the current repository:

`node --test tests/r48-review-first-integration.test.mjs`

Current whole-scope retention has a separate expanding authorized-change set:

`node --test tests/r48-current-scope-retention.test.mjs tests/r48-axis-retention.test.mjs`

These current commands are not a claim to reproduce the original historical 82-check total.

## Corrected source identity

- `src/scene/garden/RemainingGardenPavilions.js` SHA-256: `cb4bec3845ffa445feaa58db1f587bdecb78df5dbed131554787f407838b985b`
- `tests/r48-garden-remaining.test.mjs` SHA-256: `9e186612c8aca53c48d1477a8293b225d5b515cd1dac350fc11f2bc9486bac88`

Both match the corresponding complete file blobs at c92b928. The physical test additions were subsequently included in R48. This report describes only the frozen first-slice verification, not a release or deployment acceptance.

## Boundaries

The correction is a model-fit bridge-mouth treatment, not measured historical stair geometry. The 2cm Yujing door seams are modeled seams, not omitted facades; no summit reachability is asserted. Broader pre-existing raised flowerbed grass outside these bridge-mouth routes still has no general walk support and is not silently accepted as physically exact. This review does not certify native browser visuals, phone/GPU performance, public opening, full furnishing inventory, or later R48 batches.
