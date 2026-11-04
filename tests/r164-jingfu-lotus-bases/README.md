# Six Jingfu south-column base collars

Baseline c99f8eff9eb0e4a5f965eb263cf4305345b41ef9. This is a six-surface geometry fit, not completion of Jingfu Palace.

- `node --test --test-concurrency=1 tests/r164-jingfu-lotus-bases/{component,missing,controller,identity-ledger}.test.mjs`
- `JINGFU_LOTUS_EVIDENCE_DIR=<existing-output-dir> node --test tests/r164-jingfu-lotus-bases/production-zone.test.mjs`
- `node tests/r164-jingfu-lotus-bases/preview.mjs <output.png>` gives a CPU flat-shaded projection, not a GPU screenshot.

Official text https://www.dpm.org.cn/explore/building/236571.html names inverted-lotus eave-column bases. Official photo https://img.dpm.org.cn/Uploads/Picture/dc/7411.jpg confirms the gallery/base positions but is too small to establish petal count or exact carving. Twelve shallow downward-tapered lobes are fitted. Only six existing upper collars change; lower drums, all other columns, materials, positions, shadows, collisions, walkables, roofs and map targets remain.

`frozen/JingfuSouthGallery.c99.js` is the exact tracked c99 source. `source.json` pins it and the unchanged RemainingNingshouHalls; fixture imports resolve against current dependencies and use the frozen gallery. `baseline.capture.mjs` requires the exact clean c99 runtime before capturing the real NingShou zone. The snapshot excludes only six identity+role-checked collar meshes. All 6,985 colliders and 223 walkables remain in the snapshot. Only the precise new gallery metadata is normalized when comparing architecture.

24 portal/gallery arrivals and 32 column blockers are run before/after with frame hashes. Removing one original column+shoulder contact makes a negative route arrive. Scripted heading and corner braking are not unrestricted human input acceptance. A source-vs-merged ray tolerance of 0.00004m covers Float32 baking (observed maximum ~0.000012709m), not a changed gameplay tolerance.

A deliberately missing relief test first failed. The initial strict source guard used a literal radius instead of the original arithmetic, and was corrected to the exact original expression; no source tolerance was relaxed. Initial snapshot fixture assumed a non-null plaque material; fixed to include null. All failed runs are distinguished from final passing results. No World, browser, GPU, mobile or Node20 validation.
