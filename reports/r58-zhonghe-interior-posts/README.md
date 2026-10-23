# Zhonghe near interior post pair: registration blocked

**FC-5FAA15AE5C: existence DIFFED; placement BLOCKED_SOURCE/registration. No production geometry change, no acceptance.**

## Decision

The near pair is genuinely missing, not an unrecognized existing pair. Both supplied official interior images were actually viewed. However, the selected 400 × 313 R55 photo and the teaching photo do not register that pair to an identified local depth or bay line. The teaching image has different furniture/couplet presentation and cannot silently replace the selected display. The already-cached official article page 6 (printed 55) was also viewed: its schematic concerns hall position changes and shared stair offsets, not an interior-column plan.

Do not turn mere visible existence into an equal-bay fit such as ±iw/6, ±id/6. No near or remote post has been added; no screen, chair, dais, shell grid or roof moved. No internal beam or support was invented.

## Actual component evidence

`current-component.json` was freshly generated from the exact production Zhonghe component at e09fcd58143acd77a9e1f919b0fddb098e3d0821, both before and after actual `PalaceBuilder.finish` merging. Only this isolated hall and its own plinth were constructed, never a full world.

- 12 inner-perimeter columns + 20 veranda columns; zero freestanding interior columns.
- 8 shell beam meshes, all on the inner enclosure boundary (local ±9.5 m) or veranda boundary (local ±12.5 m). Their world vertical band is y = 14.58–15.20 m. No interior cross-beam is currently authored.
- Continuous 25 × 25 m flat ceiling at y = 15.17 m; visible floor y = 8.63 m. A thin ceiling plane is not evidence of a supporting beam.
- Nine deliberately generic interior diagnostic probes (local x,z ∈ {−4,0,4}) see the ceiling but no painted shell beam in that band, before and after actual merge. These probes are NOT candidate post coordinates or a reconstructed grid.
- Actual merge retains 11,276 triangles and the same physical hash: 169 colliders, 8 walkables. Mesh count changes from 200 to 23 as expected from material merging.
- Production `src/` diff against the baseline is empty. Source hashes include SquareHalls, R55 Zhonghe, both Jiaotai owners, RoofBuilder, PalaceBuilder and MergeUtils.

This confirms the second constraint: even a guessed location would lack an existing internal beam connection. Satisfying floor/beam contact would require additional source-supported framing scope, rather than a rescue beam or using the ceiling as a beam.

## Evidence files

- `metadata-proposal.json`: compact owner-adoptable proposal, URL/hash source records and exact unlock conditions. It preserves the broad facets as DIFFED and adds a registration blocker; it does not rewrite the canonical queue.
- `current/front.png`, `current/left-oblique.png`: actually viewed CPU perspective diagnostics of current production geometry and stub-library base colors. Not browser/GPU screenshots, photoreal comparisons or ACCEPTED evidence. The inherited exporter labels the retained display “R55”; the input source is the current R58 branch, as bound by the manifest.
- `current/*.json.gz`: the exact corresponding geometry exports, not original photographs.
- `evidence-manifest.json`: source state, geometry/image export hashes and explicit non-acceptance.
- `verification.log`: fresh source-retention and evidence-consistency checks.

Official photos and PDF remain in the pre-existing private reference cache, not this commit, public assets or runtime textures. Their photography dates are unknown. The teaching resource is restricted to public-interest educational use; it was observed only.

## Unlock

1. An own-building plan or identified oblique/side/reverse view must register this selected near pair relative to identified bay/enclosure lines and the unchanged R55 low platform, constraining X and Z. Undimensioned values may then remain explicitly reversible photo-fit, not survey claims.
2. A defensible beam/post or ceiling-frame relationship is needed. Missing framing must be a separately justified scope; this task does not license inventing it.
3. Only after registration should the bounded pair be implemented and exact solid collision, floor/beam contact, existing geometry retention, actual merge, legal eye paths and 10/60 Hz controls/jumps be tested. Farther pair, full inventory, reverse furniture and whole-hall acceptance remain open.

No feature red/green or new route/jump tests were run because no feature was implemented. Parent explicitly narrowed this result to minimal component/source evidence after the registration blocker. No browser retries, full-world tests, build, upload, main changes or Pages publication occurred.
