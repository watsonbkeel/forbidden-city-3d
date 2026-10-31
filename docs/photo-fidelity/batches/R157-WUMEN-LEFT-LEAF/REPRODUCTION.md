# Reproduction boundaries

Run from repository root after installing the locked dependencies. Original execution used Node v24.22.1. Do not run World/build/CPU concurrently. Preserve all existing evidence; choose a fresh output directory for JSON/render output.

## Focused runtime/QA
```sh
node --test --test-reporter=tap --test-concurrency=1 \
 tests/photo-fidelity/batches/wumen-left-leaf-studs.test.mjs \
 tests/photo-fidelity/batches/wumen-left-leaf-comparison.test.mjs \
 tests/photo-fidelity/batches/wumen-left-leaf-history.test.mjs \
 tests/photo-fidelity/batches/wumen-left-leaf-history-guard.test.mjs \
 tests/photo-fidelity/batches/wumen-left-leaf-merged.test.mjs
```
Original lower19 and old wrapper consumers are also retained and covered in the105-file batch. Source/history guards are fail-closed and intentionally reject a different runtime inventory until separately reviewed; do not loosen them to run arbitrary later versions.

## Actual World (one command at a time)
```sh
node --expose-gc --max-old-space-size=1024 --test --test-reporter=tap --test-concurrency=1 tests/photo-fidelity/batches/wumen-left-leaf-world.test.mjs
node --expose-gc --max-old-space-size=1024 --test --test-reporter=tap --test-concurrency=1 tests/photo-fidelity/batches/wumen-main-width-world.test.mjs
```
Optional `WUMEN_LEFT_LEAF_WORLD_OUT` / `WUMEN_WIDTH_WORLD_OUT` must point to fresh paths; scripts refuse overwriting. First command checks40 arrivals, second24 combinations including8 expected blocking outcomes. Neither installs a preview module.

## Original full/batch/build
Exact executed argument arrays and working directories are preserved in each `*.resource.json`; the batch command list is `batch-command-1530.json`. This same original three-command full suite remains213 known-red cases. Batch105 executes581 top-level assertions,571 pass/10 inherited missing-history failures, with38 older titles still unexecuted because of missing refs. Original guard6 child assertions remain in one strict historical wrapper and are not added again to581.

Three base builds use `npm run build -- --outDir <fresh-directory>` with `VITE_BASE=/gugong/`, `/forbidden-city-3d/`, `/`. Existing build metadata truthfully identifies eec6847e+dirty; source fingerprint691f0ea0ea8f132ebded2d5e08930c2e3860bdea59ba1e33ebf0a18b70603a4f. Do not relabel those old outputs as a clean future commit build. Current release metadata remainsR146-fix, not a new accepted release.

## Source/CPU
Private source photo is not packaged. Its URL/SHA and64-visible/8-unknown mask are inSOURCE-REGISTRATION.json. Geometry dimensions and uniform material are engineering fits. Generated CPU A/B exports are complete all-face base-color diagnostics, not GPU/photo-camera validation. The source-oracle for merged World geometry is the independently bounded current component, not an independent measured-building gold.
