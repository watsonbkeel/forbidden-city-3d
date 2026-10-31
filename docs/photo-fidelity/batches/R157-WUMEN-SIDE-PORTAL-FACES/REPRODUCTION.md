# Reproduction scope

Use the exact recorded Node version, source / QA manifest and commands; historic source snapshots are deliberately not replaced with current implementations. These commands are sequential, not concurrent heavy jobs.

```sh
node --test --test-reporter=tap --test-concurrency=1 \
 tests/photo-fidelity/batches/wumen-side-portal-faces.test.mjs \
 tests/photo-fidelity/batches/wumen-side-portal-comparison.test.mjs \
 tests/photo-fidelity/batches/wumen-side-portal-history-guard.test.mjs
node --import ./tests/lib/wumen-side-portal-baseline-loader.mjs --test --test-reporter=tap \
 tests/fixtures/r157-wumen-side-portal/baseline-proof.mjs
node --expose-gc --max-old-space-size=1024 --test --test-reporter=tap --test-concurrency=1 \
 tests/photo-fidelity/batches/wumen-side-portal-world.test.mjs \
 tests/photo-fidelity/batches/wumen-main-width-world.test.mjs
```

The baseline proof uses the immutable db1 LowerBase text; source hashes and source inventory must match the pinned predecessor contract. This is a precise bounded replay, not a claim that every historical Git object is available.

World output JSON can be written to fresh paths using `WUMEN_SIDE_PORTAL_WORLD_OUT` and `WUMEN_WIDTH_WORLD_OUT`. Do not point either at an existing evidence file. Five-portal routes use raw World collision manager; main-width routes include expected blocked cases. The comparison-only managers do not expose physical query methods.

The full main / Qinan / Zhaode command arrays remain the original predecessor command arrays. The cumulative batch is the original 92-file set plus the existing south-strip successor and five new portal test files (98 total). Missing historical refs are not filtered out. Read actual terminal results, not anticipated counts.

CPU exporter: `scripts/photo-fidelity/batches/r157-wumen-side-portals/export-cpu.mjs`; corrected renderer: adjacent `render-cpu.py`. The predecessor export must use the pinned baseline loader and explicitly report no new owners. Every output directory must be new; final diagrams do not replace earlier incorrect-label evidence. All triangle rows are checked by the two actual-export tests, not merely counted in metadata.

No GPU/browser validation or entire original-batch no-history recovery is implied by these commands.
