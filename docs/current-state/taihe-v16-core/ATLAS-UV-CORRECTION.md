# V16 S-tier atlas UV correction

This addendum supersedes the old S asset selection in `ACCEPTANCE.md`. The original CPU candidate `db52ab837291deede9df1f9bd40e6618efa4f1e8` failed actual-browser lettering review: vertical couplet fragments appeared on the horizontal plaque, while the couplets sampled enlarged plaque fragments. Its source commit, GLB and external review receipts remain preserved.

## Root cause

The native B fallback owns one CanvasTexture with `flipY=true`. Its plaque uses decoded V=.625…1, mapping to canvas rows 0…384. The Blender source supplied those same numeric UVs before glTF export, whose V conversion produced V=0….375. The loaded S plaque consequently sampled rows 640…1024. S couplets similarly sampled rows 0…640 instead of 384…1024. Previous tests checked bounded UV values and face direction, but did not bind decoded corners to the correct canvas regions.

## Correction

The Taihe generator's glyph helper now supplies `1 − desiredV` before export. Decoded S UVs therefore match native B planes while using the exact same texture object. Runtime atlas creation, flip state, ownership, disposal, scene geometry, registration, cameras, collisions and lights are unchanged.

New selected asset: `public/models/interiors/taihe-v16-ba59e7321fda.glb`.

- SHA-256: `ba59e7321fdac5ee9e97ed74847dd8c05d909bd400cfbc1fbe648657e9207a12`
- Generator/source contract SHA-256: `18cb58f97cf8da6e006aa6af46bb6107b3daa59f69458205618ff392fc8b4489`
- Unchanged size and cost: 648,184 bytes, 8,978 triangles, eight material batches
- The old `taihe-v16-bdc5d69b1265.glb` is retained byte-exact as a regression control

## Verification

The new decoded-corner tests failed on the previous asset and pass on the corrected one. They independently assert these canvas pixel-edge rectangles, including top/bottom and viewer-left/right corner assignments:

| Surface | Canvas X | Canvas Y |
| --- | --- | --- |
| Plaque | 0…1024 | 0…384 |
| Viewer-right couplet | 0…80 | 384…1024 |
| Viewer-left couplet | 80…160 | 384…1024 |

Every S corner samples the same pixel coordinates as its B counterpart with shared texture identity. Winding faces the south viewer, and U increases toward viewer-right (world −X), preventing horizontal mirroring. Decoded vertex attributes remain byte-equivalent except glyph V; oriented triangles remain identical. Blender reordered some emitted pearl triangles without changing their surface or winding.

Complete CPU command: `node --test --test-concurrency=1 tests/*.test.mjs tests/current-state/*.test.mjs tests/*.test.cjs`: **1,465 passed, 0 failed, 0 skipped**. Production build passed with the existing large-chunk advisory. The original source guards, fallback lifecycle tests and geometry/navigation tests are included.

Corrected actual-browser pixels remain an owner acceptance gate. This coordinate fix does not resolve the previously documented provisional registration, typography availability or omitted ornament details. No browser, GPU or server was launched by the implementation worker.
