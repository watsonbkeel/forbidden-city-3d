# R35 visual acceptance: explicit blocker and reproducible continuation

## Current result

**BLOCKED, not visually accepted.** On 2026-10-20 at 13:15 UTC, the supported cloud browser reached the existing public application at <https://watsonbkeel.github.io/forbidden-city-3d/>. It visibly reported `加载失败：Error creating WebGL context.（详情见控制台）`. The application's renderer log identified `GL_VENDOR = Disabled`, `GL_RENDERER = Disabled`, and `BindToCurrentSequence failed`.

This checks the current availability of the browser, not R35 visual quality. No new candidate was deployed for the test. The loaded existing bundle was `assets/index-Cj2BI9jC.js`; its release number is not inferred from that filename. A tab-only failure-screen image was inspected in the browser tool response. No screenshot-file export path was returned, so this directory does not pretend to contain an exported image.

A preceding, single normal sandboxed local Chromium launch also failed before page navigation: `process_singleton_posix.cc:297` reported `socket() failed: Operation not permitted (1)` and the process exited with `SIGABRT`. This establishes a local-browser IPC restriction, not a product defect. No permission escalation, file URL, full-desktop capture, security-setting change or further local launch was used. The supported browser check did not change the existing deployment.

See [RENDER-ACCESS.json](RENDER-ACCESS.json) for exact observations. Neither attempt produced a scene screenshot, renderer identity, runtime frame measurement, native walking result, or mobile-device evidence.

## What this bundle provides

- [CAPTURE-MANIFEST.json](CAPTURE-MANIFEST.json) defines source identity, view/time fixture, capture discipline and required result fields.
- [MANUAL-ACCEPTANCE.md](MANUAL-ACCEPTANCE.md) defines the visual and actual-input gate. All rows currently remain `NOT_RUN`.
- `tests/fixtures/r35-lighting-qa.json`, supplied with the companion R35 lighting-validation change, is the single camera/time authority. It supplies exact standing-eye coordinates, targets, high/low quality, native/optional interior tiers, and Beijing noon/twilight/night cases. This document intentionally does not make a second copy of those coordinates.

CPU geometry, lighting-parameter and route tests remain useful independent evidence. They do not satisfy the image or input rows below. A reachable application whose renderer is disabled is not an accepted view, and an unchanged old screenshot is not a screenshot of the candidate.

## Continuing when a supported renderer is available

1. Use an authorized environment with a working supported browser. Do not weaken sandbox/security settings or reinterpret a denied route as permission to use another transport.
2. Freeze the candidate source commit and build, record the exact loaded URL plus asset hashes, and save a copy of `CAPTURE-MANIFEST.json` with the actual candidate identity filled in. A moving development branch alone is insufficient.
3. Start with the 12 affected priority captures in the manifest at the specified times, viewport, FOV and quality. The complete 102-combination matrix is optional diagnostic coverage, not a requirement after every small change. Expand only for affected scope or observed defects. Obtain genuine renderer/version and device details if the supported diagnostic interface exposes them. Otherwise record `UNKNOWN`, not a guessed GPU. An emulated mobile viewport is not a physical phone; SwiftShader is software rendering, not GPU performance evidence.
4. Ensure the targeted zone and optional interior tier have actually finished loading before taking its screenshot. Keep the same asset tier, preview time and camera for A/B. Record failed loads separately, not as passing fallback images.
5. Inspect the images and complete the visual matrix. Then complete the separate native-input checks without programmatic position resets, camera injection, teleporting over failed sections, or restored height.
6. Attach each result to the exact frozen candidate. If code affecting that result changes, rerun the affected rows. Leave blocked or untested rows explicit.

## Scope boundaries

This gate evaluates rendering, visibility, material response, continuity and actual UI/input behavior. It does not turn provisional architectural dimensions into a surveyed reconstruction. Real PC/GPU and physical-phone performance require their own device evidence; CPU resource counts and software-renderer frame rates are not substitutes.
