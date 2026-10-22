# R51 unified production-visible candidate

This successor includes the delivered R49B plaque corrections, R49D Benren 5 cm depth correction, R49E Wenyuan full-plaque pitch, R50 joint characters/female refinement and its DEV successor. Users do not need to assemble branches. The unaccepted Jingyun gate experiment is excluded. Original freezes remain immutable. This is a development-branch and prebuilt-package delivery, **not a Pages deployment or a main merge**.

## What users can now do

- Ordinary production startup enables characters by default, as required in P3-C §2.2. No DEV mode, console command, or approval switch is needed.
- Ordinary Settings off/on removes/restores real render instances. Preparation is progressive and uses the existing 0.35 s fade; counters report registered, loaded, currently visible, pending and failed separately.
- Night schedules still hide court/living-scene actors and retain guards. Actor scale and initial camera/time are unchanged. The distant two Wumen guards are small at the original opening viewpoint; approaching them makes them clearer.
- `contentEnabled` is availability, not acceptance. `acceptance.complete` and formal `contentApproved` remain false. Appearance was confirmed, but GPU/mobile performance and precise historical costume/hair details are not fully validated. DEV-only preview remains a separate, session-only mechanism, absent from production.

## Root cause and production-chain proof

Before the fix, production-compiled **actual main** constructor/init/createUI/animate completed with `enabled=true`, `canRunContent=false` and zero instances after 120 frames. This was not user error.

The integration fixture changes only automatic main bootstrap into a class export. It executes the original main methods, actual Settings, System, WorldAdapter, Manager, Renderer and real THREE InstancedMesh. Explicit seams substitute WebGL and non-character UI/outer setup; the full-world run supplies newly built production architecture/colliders. It is a CPU integration proof, not a browser, GPU, target-device performance or pixel-compositing test. Every seam and source hash is recorded in `../r51/production-visibility-*.json`.

Fresh complete-main/full-world run: 23,253 colliders, 1,075 walkables, 38/38 real required bindings. Original opening camera [0, 1.7, -494] submits six instances including both Wumen guards. Taihe near view submits ten instances with exactly two LOD0. Ordinary Settings off submits zero, on restores instances, night retains guards. A separate reviewer exercised three off/on cycles, one queued RAF, and disposal.

## Actual scene images, not game screenshots

The `../r51/production-visibility-*-cpu*.png` images use exported real main-scene geometry and actual CharacterRenderer instance buffers, perspective projection, and CPU depth testing. They include real palace occlusion, not an isolated person or a calibration chair. They deliberately omit textures, runtime lights, shadows and transparent-material compositing. Therefore architecture appears white. **Production building materials/textures have not been removed. These images are not browser/GPU screenshots.**

The nearest Taihe figures were measured against actual supporting triangles, not just a logical anchor: foot gap is numerical zero. The no-shadow CPU image can visually suggest a gap. The foot audit also found the LOD2 shoe omitted its sole and began 24 mm high; this successor applies only the approved lowest-ring fix, with LOD0/1 bytes and triangle counts preserved. A pre-existing approximately 30 mm difference between the kneeling officials' floor binding and the actual visible brick surface (mesh `三台_taihe_square_brick_floor`) is disclosed separately; no surface, placement, collision or building is altered to hide it.

## Cumulative architecture and character proof

- All 65 R49D→R49E delivered paths retain exact original Git blob bytes.
- Active world manifest contains the exact R49E 185 source blobs. Prior R49D/R49B/R49 manifests remain versioned.
- Fresh 38 required bindings using three adapters, 148 route samples and 796 independent actual-triangle support-owner audits. Exact source identities and any narrowly proven LOD2 successor inheritance are in the world reports.
- Fresh 76 sampled cameras / 684 rays match every old R49B record: 621 visible targets, seven previously blocked cameras, no new obstruction. This is not 684 unobstructed views. LOD0 and architecture stay unchanged by the shoe fix.
- Fresh original body assertions 57/57 and canopy checks 2/2. Original Benren/Wenyuan suites 42/42. No rescue route, collision simplification, required=false escape or fake support fallback.
- Near ≤2, low-quality near=0, fixed female walking geometry, cancellation, stale-world prevention, off/on, night and existing input/UI/flight/map-label regressions remain tested. Static triangle/draw budgets do not prove GPU frame time.

## Evidence limits and red history

No browser/GPU/mobile acceptance is claimed. Prior cold-preparation measurements remain prior-version CPU observations, not new R51 device measurements. Formal complex ceremony and wall patrol retain the original documented deferral.

The original R49 full suite had 5,277 tests: 5,119 pass / 158 fail. Old source-retention and superseded oracle failures are not renamed as current passes. An accidentally broad Node run was explicitly interrupted (exit 130); its compressed log and observed failure list are retained and **not counted as acceptance**. Targeted current release results, exact legacy-reference updates, build proof and the independent review are separately recorded. Old oracle payloads and previously sent images are not regenerated or overwritten.

## Run the prebuilt package

The separately delivered `forbidden-city-r51-production.zip` includes `dist`, a local-only `start.mjs` and integrity hashes. After extracting, run `node start.mjs` with an existing Node.js installation, then open `http://127.0.0.1:4173`. No npm install, source build or DEV opt-in is required. Do not open index.html through file://. The local server binds only 127.0.0.1. Stop it with Ctrl+C.

Alternatively, clone this single branch, run `npm ci`, `npm run build`, then `npm run preview`. No dependency version changed in R51. The previously approved exact dev-only canvas QA dependency is not in the production bundle.

## Final validation totals

- Before the isolated LOD2 correction: current targeted core/UI/input/flight/map suite 221/221. After it: exact 132-case sole comparison plus retained historical/current-contact suite 23/23; final sole/production-HTTP/provenance smoke 7/7; fresh current render budgets 23/23; world-source successor suite 11/11. These groups overlap and are not added as a unique-test total.
- New final complete-main/full-world run passed with current Kit bytes. Source equality is checked in production-build-proof.json. Production build and the standalone HTTP runner pass; no DEV preview/debug markers or native canvas code occur in the production asset.
- Current-state suite completed: 1,023 tests, 906 pass, 117 fail. All 117 failing names exactly match the retained frozen 9b5bc89 baseline; no new failing name. This is not a claim that the repository is fully green. See current-state-comparison.json and lossless raw log.
- Final actual scene audit: eight of ten captured instances have both feet within 0.00001 m of actual triangle support, no positive-gap instance. Two kneeling officials meet a pre-existing visible brick surface approximately 30 mm above their declared floor; that penetration is not hidden or classified as exact contact.
- Both before/after PNGs remain distinct. The user-approved near LOD0/1 model bytes are unchanged; the LOD2 shoe correction is disclosed. Foot reports are losslessly gzipped with original byte hashes in report-transport.json, not regenerated expectations.
