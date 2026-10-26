# R100 independent stone-rail review

## Final limited gate

**PASS for candidate `87f90480bd69f0d342356f58092abecda321cca0`**, subject to separate cumulative/build/upload gates. The earlier raised-post candidate **`ce7bdffa` is rejected**, not a passing baseline.

This corrects the two existing side spans from open thin bars to **solid stone-panel form**. It is not a detailed bamboo-carving reconstruction, restoration of the photo's projecting post heads, surveyed dimensions, a new front/rear enclosure, full pavilion/water-system completion or a 27m channel reconstruction. No product source was edited by this reviewer.

## Actual source images and visual result

Independently viewed the two private official-image-cache files and verified their hashes against the existing source ledger:
- `xishang.jpg`: `ad62394d8ea66a38bd0352f922a70355de29dab70c72de74d2b4da09ba187b58`.
- `channel.jpg`: `8b73bb5f4f3a050f87d302a6e40c74def5ec3194f9dfddbc4cc3e0e31f89712a`.

They support solid low stone panels, posts/coping and visible shallow plant/bamboo decoration, not the previous open two-horizontal-bar fence. They do not supply survey dimensions, a current photograph date, exact hidden carvings or the model's complete railing layout. Original image bytes remain outside the release tree.

Personally inspected the final `entry` and `rail` CPU before/after images; corresponding camera exports are exactly equal. The open lattice is visibly replaced by filled stone panels and thicker framing; the existing entrance, columns, screen and channel remain. **This is a meaningful but deliberately limited form correction.** The final safe design retains a continuous level top, so the source photographs' projecting stone post heads and detailed shallow carvings are **not reproduced**. Do not call this an exact photo match. These are local CPU base/vertex-color diagnostics, not production textured GPU/mobile screenshots. Four image hashes are in `visual-final.json`.

## Independent geometry and support checks

`snapshot.mjs` independently invokes actual production CourtKit / RemainingNingshouHalls using the real zone item, without the historical sparse fixture.
- All **164 non-rail meshes** retain exact attribute/index hashes, matrices and material-name bindings.
- All **13 non-rail colliders**, the full walkable list, item/profile/map and R83 channel metadata remain exact.
- Old rail meshes/boxes: **22**. Final new rail meshes/boxes: **28**; every new actual mesh world bounding box equals its physical box **value for value**, using Float32-derived geometry, not unrelated invisible blockers.
- Same intended railing footprint/top. Small new component Float32 quantization changes outer endpoint extent by about 1.49e−10m and bottom extent by about 1.06e−8m; top and cross-span thickness extrema are unchanged. This is disclosed rather than called bitwise-identical total bounds.
- No new walkable, controller modification or player-size change.
- R83 channel sampled centerline remains **14.42403760324699m**, with unchanged true channel/stone/water mesh and support. It is not asserted to match official 27m wording.

Evidence: `baseline-r99.json`, `candidate-87f90480.json`, `comparison-87f90480.json`, `compare-final.mjs`.

## Actual ground movement: exact retained behavior

Complete production collision world, actual unmodified FirstPersonControls; only DOM/clock are deterministic fixtures. Body half-width **0.5**, height **1.7**, checks use actual `feetY`, not a forced support height.

At **10 / 30 / 60 Hz**, two ground routes each: entrance → all four stone-field edges with lawful passages around the existing front columns → retreat; and entrance → both inner side aisles → retreat. **6 routes / 1,131 frames**, all arrive and return to ground, **zero positive full-body/static-box overlap**, candidate pose sequences exactly match R99.

An initial proposed straight chord at local Z−2.7 would walk through existing front columns and properly stopped in the unchanged R99 baseline. That rejected route/log is retained; the accepted front transverse segment uses real clear Z−3.2. No column was moved or excluded to make the route pass.

Evidence: `routes-r99-clear.json`, `routes-87f90480.json`; the original invalid-route diagnostic is `routes-r99.json`.

## True airborne → landed → eight directions

Six **initially collision-clear airborne poses** above the actual two side spans (three Z positions each), actual gravity for three seconds, then each of eight ordinary walking directions for two seconds plus one second settling. No forced landing pose or jump-rescue. 10 / 30 / 60 Hz gives **144 paired runs** in each real complete world.

Final candidate:
- All initial poses clear; all drops settle.
- Every sampled landing point retains six usable escape directions. The other directions encounter the same lawful tall structural columns; not claimed to be walk-through.
- **Zero newly penetrating runs; zero added positive-overlap frames; zero increase in the per-frame maximum overlap depth.** This is checked from the complete uncapped records, not a capped list or only total pass counts.

### Important inherited limitation

The old general-controller support query uses a smaller footprint than the true body on a narrow rail edge. Walking down from the existing rail therefore already has short body/edge intersections in R99: **96 of 144 runs**, **228 positive frames**, at most **4 frames per run**, maximum depth **0.04666666666666708m**. The accepted R100 candidate retains, but does not enlarge or prolong, these records. **This is not an absolute zero-penetration claim.** It is a bounded geometry-change nonregression with an explicitly inherited old-controller limitation, not a fix to all garden landing behavior.

Evidence: `landing-r99-full.json`, `landing-87f90480-full.json`, `landing-comparison.json`, `landing-frame-depth-comparison.json`.

## Rejected raised-post trial and actual fix

`ce7bdffa` added 12 previously clean directions with real, persistent body penetration. Example: local [−4.092,−1.5], 10 Hz, real drop to feet1.4125000119 then walk along world−X. At tick31, support radius0.3 returned the lower cap1.3000000007 while the real radius0.5 body still overlapped a higher rear post. Feet fell to1.3145 then1.3; the body penetrated the real post by **0.0669698606m** while an existing front column correctly prevented further movement. Baseline continuous rail had no such penetration on this path.

The writer fixed geometry only: restored the original continuous actual upper-rail dimensions/top, retained the solid panels, lowered posts below that real top. No invisible support, extra walkable, epsilon, radius change or global physics rewrite. The complete paired matrix was freshly rerun on the new hash.

Rejected source bytes/hash, all failed observations and precise support03/support05 trace are retained in `rejected-ce7-XishangStoneRails.source.mjs`, `landing-ce7bdffa.json`, `new-post-transition-fail.json`, `post-trace-ce7bdffa.json`.

## Binding and remaining gates

- RemainingNingshouHalls.js: `5cbeaea871656f7a0b8c7c2a93c8666931d0eb04c6ed5ca72a2cef963bdd65dd`.
- Final XishangStoneRails.js: `3d0f381c3b3df1cfe110db940b5035ef540186f2710a61761e76db2859527214`.
- XishangChannel.js unchanged: `b2e397ce8d2ca92b7abdea004ee121a9f4c7b7f7c8ce495cbded66be281b21d4`.
- NingShou JSON retains R99 placement: `2c29e1a809e19d28e9ef62d0d78b92afc786508212ab02c5d898138d044902a6`.

Separate writer/audit checks cover all other NingShou halls, lifecycle, cost, cumulative tests and packages. This reviewer does not claim independent GPU/mobile/performance or remote-upload verification.
