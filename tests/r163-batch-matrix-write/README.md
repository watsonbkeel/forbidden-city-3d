# Unchanged batch-matrix write checks

Base: remote `0b746683fcd770a0b3f57e0c3ed9307325651fa9`, exact local tree `75d0634bf55153e4f99b665ecbee5416673b7836` / `de4840fdc566cac11f039fd82aa0676457daf4ae`.

Only `src/render/BatchedBuilder.js` changes runtime behavior. Each generated batch entry retains its last successfully submitted source world matrix. First/rebuilt entries submit; exactly unchanged finite matrices do not dirty the matrix texture again. Full world transforms are compared, including signed zero. Nonfinite values keep the old write path. Collection/signatures, geometry, materials, visibility, shadows, movement and quality defaults remain unchanged. The generated matrix payload has one production writer: this builder. A future external writer would need to participate in cache invalidation.

## Verification

Run serially:

    node --max-old-space-size=512 --test --test-concurrency=1 tests/r163-batch-matrix-write/current.test.mjs tests/current-state/exact-roof-material-batching.test.mjs tests/postprocessing-quality-lifecycle.test.mjs

24 new checks cover first/identity/rebuilt entries; 30 unchanged fractional-transform frames; child/parent translation, rotation, scale and reparenting; 100 animated frames including hidden movement; replacement matrix objects; tiny values, signed zero and nonfinite inputs; actual Three matrix payload, native frustum/shadow callbacks; source visibility; material/geometry/revision/member changes; disposal and failed writes. The 64 existing roof-batching/postprocessing lifecycle tests retain original assertions, including the actual Wumen geometry, plaques and collision/walkable preservation check.

Before implementation the new tests failed because unchanged entries still wrote matrices. Five first-pass fixture assumptions were corrected, not counted as success: reparenting changes traversal order and rebuilds the batch, and Three r162 force-updates world matrices despite `matrixWorldAutoUpdate=false`. Corrected tests failed 24/24 against the exact pre-change module, then passed 24/24 with this change. The combined group passed 88/88. Missing-first-write and stale-transform negative controls failed on actual payload/count assertions.

The broader bounded run passed 149/149 (these 88 plus scheduler/preferences and failure/context recovery), followed by 28/28 native controller/flight checks. These counts are separate groups, not full-repository acceptance. Independent review also passed the 88 tests and compared 80 frames against the original implementation, including transforms, scene changes, visibility, shadows, culling and rebuilds.

For 32 static entries, 30 subsequent frames previously made 960 matrix writes and texture-version increments; the new path makes zero. This is a CPU-side mechanism check, not 960 measured GPU uploads or a measured speed/temperature improvement. One additional 16-number matrix snapshot plus object/array overhead is retained per active batch entry; rebuild/dispose retires it with the entry. No global cache is introduced.

`npm test` remains unavailable because the existing package has no generic test script. Older whole-project baselines are not certified green. Real GPU rendering, browser screenshots, Mac power/temperature, phone and full World were not exercised. A clean Pages-base build and exact-source HTTP asset checks remain release gates; their actual build source identity must be reported separately, never relabeled as a remote commit.
