# Selected local reproduction
Node v24 environment; `npm ci` from pinned package-lock if needed. Materialize src/data/tests/scripts and `public/textures/hd/manifest.json` (required by inherited controls tests; prior remote sparse omission produced a genuine setup failure, corrected with exact remote blob).

```sh
node --max-old-space-size=768 --test --test-reporter=tap --test-concurrency=1 \
 tests/photo-fidelity/batches/wumen-joint-layout/visible-platform.test.mjs \
 tests/photo-fidelity/batches/wumen-joint-layout/platform-fit.test.mjs \
 tests/photo-fidelity/batches/wumen-joint-layout/platform-cpu.test.mjs \
 tests/photo-fidelity/batches/wumen-lower-five-portals.test.mjs \
 tests/photo-fidelity/batches/wumen-left-leaf-studs.test.mjs \
 tests/photo-fidelity/batches/wumen-side-portal-faces.test.mjs
```
This exact final command returned56/56. No World/fullsuite/build was run. Do not infer full portable QA from this selected set.

CPU: exporter requires a NEW output directory and `before` or `after`; run sequentially, then render each gzip with `python3 scripts/photo-fidelity/batches/wumen-joint-layout/render-platform-cpu.py INPUT.json.gz OUTPUT.png`. `before` captures current retained lower/ascent/canopy roots, not an old-history loader; `after` constructs the reviewed new offline candidate. The original600production sources are unchanged. Material/lighting limitations are in the proof and image footer.

Author scripts under `author/bearing-2018` run from repo cwd with output JSON argument. Their imports intentionally resolve current repo script paths; frozen hashes must match before reuse. They measure actual retained upper geometry, not source-reference upper reconstruction. Immutable original results and independent Fraction arithmetic are archived separately.
