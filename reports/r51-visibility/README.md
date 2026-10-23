# Preparation progress fix and focused visibility evidence

Base: frozen R51 `fac791cf956d852e32cc9594ce537b22bca82308`. This follow-up is for the next cumulative R52, not a separate user release. The user identified stale cached content as their observed missing-character cause on 2026-10-22; the independently reproduced scheduler defect below is not claimed to have caused that observation.

## Narrow production change

Only `CharacterSystem.js` changes: pending preparation receives at most a 0.25 ms reserved deadline when submission already consumes the nominal total budget. Existing bounded generator steps, cancellation, generation checks, one RAF, visibility gates and validation failures are unchanged. Empty queues and explicit zero budgets receive no reserve. Total preparation CPU remains inside the measured total update; the nominal-budget overrun is explicitly reported, not hidden. A deadline can overrun by the existing bounded step cost. This corrects progress, not a claim that the 1 ms nominal target or GPU/device performance passes.

System SHA-256: `0e5764c8ac4b5417e5c4e2ab2b2d45876323da99b0f59c9a12fe9d7ea9be22a3`.

## Red, then green

- Historical deterministic reproduction: injected 1.25 ms Manager/Renderer work, 600 frames, zero preparation steps, 38 pending. `preparation-starvation-before.*` retains the original red. The probe is a historical reproduction against the base source, not the final regression entry point.
- `preparation-progress-red.tap` preserves the new regression failing before the fix.
- `node --test tests/r51-preparation-progress.test.mjs tests/p3c-system.test.mjs tests/p3c-work-bounds-review.test.mjs tests/p3c-incremental.test.mjs tests/p3c-incremental-world-regression.test.mjs`: **71/71**. Persistent 1.25 and 2 ms submission pressure, all seven template categories, off/hidden/empty queue, explicit zero budget, repeated generations and unique current-generation submissions.
- `node --test tests/r51-default-content.test.mjs tests/r51-character-ui.test.mjs tests/p3c-runtime.test.mjs tests/p3c-renderer.test.mjs tests/p3c-female-runtime.test.mjs tests/p3c-near-budget.test.mjs`: **71/71**.
- `npm run build`: exit 0. Existing large-chunk warning remains.
- No whole-repository all-green claim. Frozen R51 reported 117 inherited current-state failures in its scoped full run; they are not erased by these focused passes.

## Actual role and lifecycle checks

`live-interior-characters.json` and `live-chuxiu-characters.json` were rerun with the final System hash above. The Taihe test uses the real shared terrace, actual InteriorLoader and shipped GLB, B/S/B transitions, actual CharacterRenderer instances and deformed-triangle rays. The emperor has one visible instance and 9/9 clear targets at legal interior viewpoints. Chuxiu's consort has one visible instance, 9/9 clear targets in the west next-room; the outer doorway is correctly occluded by actual partitions. Chuxiu has no S overlay. The Chuxiu focused scene attaches actual palace geometry but is not a full ZoneManager streaming test.

`r51-courtyard-route-summary.md` records real Teleport.go, controller walking, ZoneManager unloading/reentry, two courtyard pairs and the three moving patrol IDs. All have actual submitted instances and visible geometry, not just ready counters. Patrol movement/off/on was checked; patrol unload/reentry itself was not separately sampled. The full route report records final source hashes at both ends.

Six PNGs are CPU perspective z-buffer diagnostics using actual submitted geometry, not browser/GPU screenshots. Untextured architecture is white because this diagnostic does not reproduce runtime image textures; production materials were not removed. No runtime lighting/shadow, GPU/mobile or historical acceptance is implied. The three seated-role PNGs predate the scheduling-only fix; model/renderer geometry is unchanged, but they are not claimed to be exports of the final rerun's exact animation timestamps. The route PNGs use final-source submitted geometry. Pixel totals can include multiple actors and do not replace per-ID evidence.

## Lossless report storage

Two larger JSON reports are stored once as `.json.gz`; these are evidence reports, not automatic-test fixtures. `archived-reports.json` lists original/archive bytes and SHA-256. Run `node tests/r51-restore-visibility-reports.mjs` to verify, or add `--restore` to restore exact original JSON bytes. Restore refuses to overwrite different evidence. Each archive is below 120,000 bytes. No raw /tmp model dump is included.

No architecture, collider, navigation, character position, model, count, dependency, Pages or main branch change is included.
