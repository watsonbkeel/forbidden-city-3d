# R50 independent baseline evidence

Snapshot: 92cf31ec1779d0d6266a2caa6ad1708c379d1500. This commit contains the R49 building fixes, before any R50 character wiring. Sources were extracted without modification to `/tmp/fc-r50-baseline-92cf31ec`; dependencies reuse the existing installed node_modules. The input manifest records source/test SHA-256 values. No production file or existing test was changed by this review.

## Fresh executions

| Command | Result | Evidence |
|---|---|---|
| `npm run test:current-state` | exit 1; 85 files, 1,068 tests, 952 pass, 116 fail, 0 cancelled/skipped; 38,298.103488 ms | baseline-current-state.log and baseline-current-state-command.json |
| `npm run build -- --outDir=/tmp/fc-r50-build` | exit 0; 240 modules; existing >500 kB bundle warning | baseline-build.log |
| `npm run test:zones` | exit 0; 7 files, 0 errors, 20 warnings; 23,253 colliders and 1,075 walkables | baseline-zones.log |
| `npm run test:anchors` | exit 1; 113 compared, Shenwu Gate z difference 11 m exceeds 5 m; Qian Dong Wu Suo not compared due gate/group mismatch | baseline-anchors.log |
| `node --test --test-reporter=tap $(cat reports/r49/final-validation/direct-current.txt)` | exit 1; 5,205 tests / 5,045 pass / 160 fail; 158 R49 failure identities plus 2 file-level SIGKILL interruptions. Sequential retry of those files: 74 / 74 pass | baseline-full.tap and baseline-full-command.json |

Important correction: `npm run test:current-state` is not the suite that produced the R49 report's 5,277 / 5,119 / 158. The package command expands only 85 `tests/current-state/*.test.mjs` files. R49 used a separate 337-file explicit inventory. Both are preserved and reported separately. Neither baseline is presumed green.

## Browser command boundary

The following existing commands require Chromium/Playwright and a local Vite URL. They were NOT executed in this review because of the already-established sandbox socket/EPERM and bwrap boundary. There was no browser retry, escalation, alternative browser bypass, or read of prohibited session files.

- `npm run test:smoke` → `node tests/smoke.cjs`
- `npm run test:regression` → `node tests/regression.cjs`
- `npm run test:walk` → `node tests/stepwalk.cjs 60,10 0,1 all`
- Gate's additional automatic routes: `node tests/stepwalk-auto.cjs 60,10 0,1 all`
- `npm run test:perf` → `node tests/perf.cjs <output>`
- `npm run test:visual` → `node tests/visual.cjs`
- `npm run test:gate -- --keep-going` orchestrates build, zones, anchors and the five browser steps. It was not invoked as a whole because it starts Vite/browser and automatically retries regression. No eight-step gate pass is claimed.

Source references: `tests/gate.cjs:92–170`; `tests/smoke.cjs:7`; `tests/regression.cjs:45`; `tests/perf.cjs:44`; existing limitation records in `docs/current-state/r33-chuxiu-household/README.md:38`, `docs/current-state/r48-remaining/residential-handoff.md:77`, and `reports/r49/README.md`.

The standard perf script uses SwiftShader software rendering. Even a successful run would not be real GPU or real-mobile frame-time evidence. No hardware, browser, viewport, DPR, shadow/postprocessing A/B configuration was actually sampled here. C-A02/C-A10 and browser-only portions of C-A11–C-A14 remain unverified rather than passed.

## Requirements and current interfaces reviewed

Read P3-C characters v2.0 completely, and the current `docs/ARCHITECTURE-1to1.md`, `docs/agent-tasks/P1-COMMON.md`, `docs/agent-tasks/REPORTS/P2-S.md` references. Historical architecture/perf claims are not fresh execution results.

- The world uses metres, Y vertical and X/Z horizontal; +Z points north; camera default forward is -Z. Placement must use real support and anchor identity rather than a sky-down first intersection.
- `ZoneManager.loaded` holds real loaded builders; `prebuilt` and silhouettes exist even for unloaded zones. A silhouette/prebuilt object is not evidence of runtime support readiness. Existing `onLoad` / `onUnload` callbacks already maintain `shadowObjects` and must not be overwritten without preserving behavior.
- `InteriorLoader` is initialized after world colliders. Main update currently calls interiors, then zones, then render. Character seat resolution must distinguish retained fallback from live interior variants and prevent stale async content.
- Existing main loop dt is capped to 0.1 s, but this alone does not prove character simulation pauses on hidden pages or correctly resumes.
- Main existing dispose repeats minimap/teleport cleanup; this is pre-existing, not a new character defect. New lifecycle review will focus on duplicate character instances, shared resources, listeners and stale requests.

## Pending independent final review

After the implementation owner declares code ready, independently check frozen required 38 actors (23 Taihe + 6 gates + 3 patrol + 6 life), mobile 19 Taihe + 13 others, real InstancedMesh batches, support and route validity, twenty load/unload and toggle cycles, async invalidation, night schedules and in-view transitions, hidden-page resume, camera close-up and helicopter LOD, UI event retention, and changed-file scope. Do not treat registered actors as verified/visible actors, or estimated mesh costs as measured complete-frame calls/triangles.

## Full-inventory execution completion

The 337-file command completed at 02:39:34 UTC in 298,287.050173 ms. Its fresh raw result is 5,205 tests, 5,045 pass and 160 fail. Two test workers ended with SIGKILL: `tests/r48-review-runtime-outer-mesh.test.mjs` and `tests/r48-review-second-independent.test.mjs`. The exact cause of SIGKILL is not established; resource pressure is a possibility, not a proved diagnosis. All 158 prior R49 failure identities are present, with no newly named assertion failure. The SIGKILL placeholders prevented 74 underlying tests from running and count as 2 failures themselves.

Reran only those two unchanged original files with `node --test --test-concurrency=1 --test-reporter=tap ...`; 74 tests / 74 pass / 0 fail in 160,386.296856 ms. Raw logs and command records remain beside this report. Combined coverage after replacing the two SIGKILL placeholders is 5,277 tests / 5,119 pass / 158 fail, matching the old R49 identities. This is explicitly a two-run coverage reconciliation, NOT a fresh single-run 5,277 footer and NOT a green result. `baseline-failure-diff.json` preserves both interruptions.

After execution, all 1,136 files in the immutable source/test/input manifest retained their original SHA-256. `baseline-input-verification.json` records zero changes.

## Final single-run serial baseline, 03:09:53 UTC

The immutable 92cf31ec snapshot completed the complete 337-file inventory with `--test-concurrency=1`: **5,277 tests, 5,119 pass, 158 fail**, exit 1, 1,354,463.357 ms. This is a single execution, not combined coverage. Its log is `baseline-full-sequential.tap`; command, timestamps and manifest hash are in `baseline-full-sequential-command.json`. This supersedes the earlier resource-killed parallel run as the primary R49-comparable baseline. The prior logs remain as an honest record.
