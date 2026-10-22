# R52 courtyard life: ten additive roles

Baseline: `aa606946fe37c045791fd511cb224007713c5e7c`. No production module, existing actor/binding, zone, architecture, collision, navigation, costume template, credential, remote branch or Pages change.

## Integration

Append the arrays from `data/characters/fragments/r52-court-life.json` to the corresponding registry arrays: 10 actors, 5 anchors, 5 surfaces, 2 paths, and no seats. Seeds are 52040–52049. All ten IDs are required, anonymous Qing-themed interpretations with `daily-daylight`; they remain controlled by the existing character switch. No named residents or single historical day are claimed.

- Changchun, west-six: consort takes a 7 m lateral stroll; maid waits outside the route.
- Chengqian, east-six: consort with diagonally offset maid, clear of the central approach.
- Zhongcui, east-six: standing pair to one side, facing across the courtyard, outside the veranda.
- Jingren, east-six: maid takes a 6.5 m bent service route; eunuch waits on the opposite side. No consort.
- Yonghe, east-six: maid and eunuch stand at different depths beside, not within, the baoxia approach. No consort.

The five anchors resolve real named hall records from current west-six/east-six JSON. No coordinates were inferred from palace names. The fragment contains explicit legal camera coordinates relative to those frames.

## Single-world reuse

`courtLifeScenarios({ registry, adapter })` in `tests/lib/r52-court-life-scenarios.mjs` returns five scenarios with exact camera, lookAt, actor IDs, and route references from the owner's existing real CharacterWorldAdapter. It neither builds a world nor filters the registry.

`productionInstances(system, submitted)` and `triangleRays(instance, objects, camera)` in `tests/lib/r52-court-triangle-rays.mjs` expose the actual renderer-buffer deformation and exact triangle rays. The unified owner can reuse these in the same world as the other 23 additions.

`withCourtLifeFragment(base, fragment)` in `tests/lib/r52-court-registry.mjs` appends only absent IDs and rejects conflicting overlapping records. It retains all other integrated actors and verifies a fixed canonical SHA256 of the original 38. Thus the standalone run is 48 actors, while the owner can run an actual combined 71 without filtering actors or preserving an artificial 48 count.

## Verified results

- Fragment tests: 2 passed.
- Full real-scene standalone run: 48 registered, original 38 unchanged, all 10 required additions bound and rendered.
- 22 scene/lifecycle captures, 44 actor-instance captures, every capture 15/15 exact deformed triangle rays visible inside the viewport and unobstructed by real architecture.
- Actual production ground support at every route sample, max spacing 0.25 m: Changchun 29 samples, Jingren 27 samples. Full body uses at least 0.8 m radial clearance and measured complete-body height plus 0.1 m; endpoints additionally use 0.85 m turn clearance. Radial ground support is checked at 16 edge points at each sample.
- Complete deformed geometry of all three LODs measured at 24 phases. Largest observed radial envelope 0.377 m, largest height 1.771 m; no shrinking or pose substitution.
- Both routes ran two complete out-and-back cycles. Real submissions matched controller positions for all 690 Changchun and 564 Jingren movement frames, including both turn stages.
- Each pair: night fades away, day returns, off clears batches, on returns, real zone unload removes its instances, real zone reentry returns them. East-six is intentionally unloaded by moving to west-six, not the outer axis that keeps east-six resident as a neighbor.
- Five PNGs inspected: actual scene geometry and actual CharacterRenderer instance buffers, with two visible actors in each courtyard. Their labels explicitly identify CPU evidence, not browser screenshots.
- Failed required IDs: none.

## Evidence and limits

`r52-court-life-summary.json` is the small summary and PNG provenance. `r52-court-life-world.json.gz` is the lossless detailed result; its original size and SHA256 are recorded in `r52-court-life-world-manifest.json`. The large intermediate triangle exports remain temporary rather than being committed as raw dumps.

Commands: `node --test tests/r52-court-life-fragment.test.mjs`; `node tests/r52-court-life-world.mjs`; five invocations of the frozen `tests/r51-live-role-raster.py` against exported production geometry. All exited 0. Final standalone evidence is 48, not 71.

Browser/WebGL/GPU, textures, shadows, historical acceptance, real mobile devices, and GPU frame-time acceptance are not verified. Already-established denied browser/socket routes were not retried or bypassed. Optional streamed interior overlays are omitted because all new roles are outdoors. Full combined-71 integration and aggregate regressions remain with the unified owner; no new full-suite claim is made here.

Revert this additive commit or remove precisely these fragment IDs to roll back. The original 38 and all building fixes remain untouched.
