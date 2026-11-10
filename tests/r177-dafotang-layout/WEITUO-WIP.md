# East Weituo: source-guided WIP, not a completed hall

The production path in `RemainingOuterHalls.js` calls `buildDafotangWeituo` after the triad and before photo registration. It installs one independently authored standing figure: 33 meshes, 3,904 triangles, two neutral non-original grey-brown materials, and matching per-mesh triangle collision owners. It does not reuse triad gold or mirror the heavenly king. Whole-hall inventory remains UNKNOWN; the west heavenly king and individual arhats remain unmodeled. EX-001/002 and overall delivery are not closed.

## Sources and fit boundaries

- Wang Jiapeng (王家鹏), 2015, *慈宁宫大佛堂调查记*, printed p.304, figure14: named Weituo photograph, standing feet, gathered hands, layered armour, pointed helmet and looping ribbons; text gives height2.17m and dry-lacquer/cloth-core technique. Figure15 is the heavenly king, not an interchangeable Weituo reference. [Official publication](https://img.dpm.org.cn/Uploads/File/2020/02/26/u5e56176b64d88.pdf).
- Wang Zilin (王子林), 2014, printed p.78, figure7 and adjacent text establish west heavenly king/east Weituo; positive X is west. [Official publication](https://img.dpm.org.cn/Uploads/File/2018/06/04/u5b153792a88ab.pdf). The 2015 figure9 elevation supports inward orientation but not an exact angle or historical pedestal plan dimensions.

Height2.17m is sourced; position `[-2.83,1.32,5.6]`, -45° yaw, all widths/depths, feet/hands, armour/ribbon profiles, plain closed back and colours are MODEL_FIT. Local -Z front rotates toward +X, the centre. No unverified weapon, intricate fingers, original image texture or exact back reconstruction is supplied.

Only the existing east guardian pedestal's three geometries and corresponding collision owners are explicitly replaced: foot `.62×.75 → .87×.87m`, waist `.52×.65 → .75×.75m`, top `.60×.73 → .85×.85m`. Heights, centre, shared materials and mesh identities remain unchanged. The .77m-wide natural fitted boot pair is not squeezed to the old placeholder. Measured full-sole margin on the new top is at least .0537688m. These are reversible game fits, not surveyed historical dimensions or copied modern pedestal dimensions. The west pedestal, triad and shrine are not resized.

## Actual local results (2026-11-10)

- **RED accepted:** real current single hall constructed; existing guards passed; expected missing visible Weituo group assertion0≠1. Peak sampled RSS185,671,680B. Actual CPU was not recorded by that earlier supervisor.
- **HOST_GREEN FAILED resource gate:** complete functional TAP1/1 passed (actual installation, source height, complete soles, independent materials, precise triangle owners, conservative old-mesh nonoverlap, inward geometry direction, east/west pedestal contracts and duplicate-install rejection). Nevertheless sampled RSS201,543,680B exceeded the192MiB threshold and the process was killed. This is not an accepted GREEN and was not retried.
- **Initial COMPONENT_QA FAILED image limit:** first360×480 RGBA PNG exceeded24KiB and was rejected before writing; no images were produced. The separate six-tube/twelve-cap outward-normal and welded-edge test passed. This failure remains recorded.
- **BOUNDED_QA passed2/2:** unchanged component regression in no-image mode reached geometry-only/idempotent disposal assertions; a new fixed-size diagnostic encoder produced front/side/sole PNGs of22,628/22,628/7,328B. Sampled RSS92,057,600B; CPU user .281270s + system .041612s; wall .245545s; exit0, empty stderr, process-group cleanup confirmed. RGB332 indexed PNG with stored DEFLATE has a proven byte size, not an assumed compression ratio.

- **LOOP_QA passed3/3 on final geometry:** following the visual mismatch, only the high loop's five path-point X signs changed. The lower loop retains its original actual vertices and projected positions as an existing design fit, not a source-certified curve. The unchanged no-image component regression, actual front-camera projection regression and bounded diagnostic test passed together. Sampled RSS91,377,664B; waited child max RSS91,624KiB; CPU user .262586s + system .054017s; wall .243601s; exit0, empty stderr, process-group cleanup confirmed. New PNGs have the same fixed22,628/22,628/7,328B sizes and separate output paths. No host was constructed in this stage. Prior HOST_GREEN functional observations and failure concern the pre-correction geometry and do not validate the final geometry's host integration or resource use.

The author viewed all three final CPU diagnostics. The high rising loop is now on viewer-right, consistent with source figure14; its projected vertices have positive screen X (.2615665 to .7210506). The lower loop remains on the same visible side with exactly preserved original vertices and projections. The earlier assertion that figure14 required a lower loop on the opposite side was withdrawn after source rechecking; this is not a reason to mirror that loop. Only the high loop's direction correction is accepted, not precise curve measurement or full source-shape fidelity. Separated standing feet, gathered forearms, layered shoulder/skirt plates and a pointed helmet remain visible; side view shows depth and forward arms, while the rotated sole outlines remain inside the fitted top. The figure remains coarse and block-like. These120×180 colour-quantized CPU views cannot validate fine carving, original colour, GPU lighting or whole-hall appearance. They preserve the authored camera/frustum; only diagnostic colour and resolution are reduced. All earlier executed inputs, images and failed receipts remain unchanged; the pre-correction runtime and README are separately preserved.

**Still unpassed:** host resource clearance; full production `kit.finish`/merged-triangle and photo-session lifecycle preservation; injected real-host atomic rollback; native movement/route regressions; full suite, build and GPU/World review. Historical R179 validation is not acceptance of this change. The existing `.github/workflows/r179-suian-room.yml` is branch-restricted and has not been updated or run for R255. No formal R179/current-candidate validation or deployment is claimed.

## Portable regression entry points

Run from the repository root in an appropriately admitted environment with installed dependencies. These are reproducible entry points, not authorization to repeat the failed192MiB host attempt. `R255_REPO` is optional; formal test paths resolve the repository root themselves. Standard component tests write no images.

```sh
node --max-old-space-size=128 --max-semi-space-size=8 --test --test-isolation=none --test-concurrency=1 tests/r177-dafotang-layout/weituo-component.test.mjs tests/r177-dafotang-layout/weituo-tube-caps.test.mjs tests/r177-dafotang-layout/weituo-loop-projection.test.mjs
# Host entry point, still requiring a separately reviewed resource plan:
node --max-old-space-size=128 --max-semi-space-size=8 --test --test-isolation=none --test-concurrency=1 tests/r177-dafotang-layout/weituo-host.test.mjs
# Final LOOP_QA test set, with diagnostic output in an explicit fresh directory:
mkdir -p /tmp/weituo-diagnostics
R255_DIAGNOSTIC_DIR=/tmp/weituo-diagnostics node --max-old-space-size=128 --max-semi-space-size=8 --test --test-isolation=none --test-concurrency=1 tests/r177-dafotang-layout/weituo-component.test.mjs tests/r177-dafotang-layout/weituo-loop-projection.test.mjs tests/r177-dafotang-layout/weituo-diagnostic-bounded.test.mjs
```

Leave `R255_WRITE_CPU_VIEWS` and `R255_CPU_VIEW_DIR` unset: those opt into the older RGBA exporter whose capped attempt failed. The new diagnostic test skips output without `R255_DIAGNOSTIC_DIR`; it refuses to overwrite existing files. Exact executed scratch candidates match the corresponding formal test bytes; later readme creation does not alter those tests or the immutable run evidence.
