# R58-A Baohe dais local partial

**PARTIAL · VERIFY_PENDING · not ACCEPTED.** This is one local A37 item, not completion of the 13-area program. No browser, world build, release or photo redistribution occurred.

- Design, physical contract, source attribution, unknowns, retained scope and test exceptions: [`../../docs/photo-fidelity/DIFFS/baohe-dais-r58.md`](../../docs/photo-fidelity/DIFFS/baohe-dais-r58.md).
- Integrator-only minimal edit: [`HOOKUP.patch`](HOOKUP.patch). This worker branch deliberately does not edit PalaceBuilder.js or RoofBuilder.js.
- Fresh focused result: [`all-focused.log`](all-focused.log), **108 passed, zero failures**. `hall-tests.log`: 49 passed; `routes-tests.log`: 49 passed; `retention-tests.log`: six passed. Full-matrix route data: `hall-routes.json` and `routes.json`.
- Log trailing whitespace is normalized only; failure text/counts are preserved. Genuine before-helper red: `red-tests.log`; first three-test green: `green-tests.log`. `hall-low-fps-red.log` preserves eight 10Hz side-landing failures in the earlier, shorter approach. Current geometry solves these by moving only the new stair toe/landing front 0.4m south, not by moving old columns or altering control/collision tolerances.
- Existing source-retention failures are classified in `baseline-focused.log` and the design note; no old expectation was edited to wash green.
- [`exact-delta.json`](exact-delta.json) is the numeric authority: **241 new visible boxes + 10 retained-furniture solid proxies − 1 old giant air box = +250 colliders; 19 exact no-rescue supports; 178 non-target hall meshes retained**. New geometry: 2,892 triangles, net +2,820; three private materials, zero textures. Six fitted steps are not a measured historical assertion.
- Paired actual-model CPU images: [`before-front.png`](before-front.png) / [`after-front.png`](after-front.png), [`before-oblique.png`](before-oblique.png) / [`after-oblique.png`](after-oblique.png). Each before/after pair uses identical cameras. Exported geometry `.json.gz` and raster sidecars are included. These use stub-library base colors; they are not photographic, texture, lighting, GPU or browser acceptance evidence.
- `evidence-manifest.json` binds camera metadata, source/header hashes and selected-image SHA; `shared-source-retained.sha256` records unchanged shared owners. The official reference remains only in the pre-existing private cache and is not included here.

## Integrator's existing world only

Import `assertBaoheDaisInWorld` and `replayBaoheDaisRoute` from `tests/lib/r58-baohe-dais-world-check.mjs` and provide the world you already constructed. `assertBaoheDaisInWorld(W)` checks metadata, exact visible solids/supports, real ray contacts, removed old giant, rear passage and no rescue. Replay options are `{side:-1|0|1,fps:10|60,sprint:boolean,backward:boolean,diagonal:boolean}`. Replays use actual FirstPersonControls, not a substitute path or movement solver; the DOM/clock shim is restored afterwards. They neither construct a world nor inject floors or assets.

The frozen-baseline tests compile bf7b399 PalaceBuilder bytes plus the four precise hook hunks in memory. They test that isolated change, not whether a later live owner is correctly hooked. The supplied-W gate therefore remains mandatory after integration. Real browser comparison remains pending.

## Regenerate without world/build

1. `node --test tests/r58-baohe-dais*.test.mjs`
2. `node tests/lib/r58-baohe-dais-evidence.mjs`
3. For each before/after and front/oblique pair, run `python tests/lib/r58-baohe-dais-raster.py reports/r58-baohe-dais/<state>-<view>.json.gz reports/r58-baohe-dais/<state>-<view>.png`.

The evidence generator constructs only the actual isolated Baohe hall before/after. It does not instantiate a world or characters. The test library's model materials are diagnostic substitutes, so white columns and flat coloring in the CPU images are not newly authored architectural changes.
