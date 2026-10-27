# R120 Qianqing central assembly and same-quality performance Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:executing-plans to implement this plan task-by-task. Single product writer; the existing independent reviewer is read-only.

**Goal:** Deliver a source-bounded three-part Qianqing central-room improvement, then investigate five same-quality performance categories against that complete art baseline.

**Architecture:** Refit only the existing axial plaque/frieze assembly; augment four existing open stair-rail planes with real small-section geometry and four exact finished-surface owners; add shallow near-level ceiling reveals inside the existing continuous coffer envelope. Keep the original atlases, furniture, building datum, flights, far-detail policy and all-ready startup.

**Tech Stack:** Three.js 0.162, existing procedural builders/TextureLibrary, native Canvas CPU diagnostics, Node test runner and Vite 5. No new dependency.

**Spec:** `../../../r116-r126-planning/R116-R120-IMPLEMENTATION-PLAN.md` Tasks 7–11; root approval 2026-10-27 04:28 UTC; source ledger in `SOURCE-DIFFERENCES.md`.

## Global Constraints
- All preparation remains ready before entry; no first-visit wait or permanent loadAll.
- No global body, STEP, solver, character-count, rendering-quality or night-light reduction.
- No new atlas, furniture identity, column/window plan, invented inscription or caisson.
- Cumulative actual R118/R119; R116/R117 performance work remains unaccepted.
- Official photos establish visible form and projected proportions, not surveyed physical measurements.
- No main/Pages or remote write by this writer. Retain all research and failed-test records.

## Review Focus
- Three asynchronous Qianqing paints must genuinely finish with the real library before every visual assertion.
- Narrow frame gaps must remain positive in finished Float32 geometry, not only configuration arithmetic.
- Open stair-rail holes stay real, source-bound and independent of decorative LOD; no filled bounding-box blocker.
- Existing three stair flights, door thresholds, display supports and emperor return path remain usable by the complete body.
- Disposal, hidden far-level resources and all owned source/finished references count in cost; CPU images are not GPU validation.

### Task 1: Source-bounded art assembly
**Files:** Modify `QianqingCentralSetting.js`, `QianqingCentralArt.js`, `QianqingCeiling.js`, `QianqingAssemblySupport.js`; create `QianqingStairRails.js`; tests `tests/r120/qianqing-{assembly,route,lifecycle}.test.mjs`.
**Interfaces:** Existing `buildQianqingCentralLevel(mat,frame,fine)` and `installQianqingCentral(builder,root)` retain signatures. New rail helper emits four near-only row groups and registers exactly their finished merged triangles using IDs `qianqing-stair-rail-0..3`; existing finite dispatch whitelist only.
- [ ] RED: plaque/frieze widths/heights/relative centres and positive crest/backing gaps; four open rails and four finite source owners; 276 shallow coffer reveals and unchanged far resources; real-library lifecycle.
- [ ] Run RED and preserve exact expected failures.
- [ ] Implement A: frieze 6.0×1.14 at relative Y 5.00; plaque 4.5×1.30 at 6.29; original screen/backing/datum retained. Preserve glyph order and artwork assets; consistent plaque aspect fit.
- [ ] Implement B: preserve existing posts/top rails, add restrained continuous lower connections and open gilt scroll/field geometry within the four existing rail planes. Read actual merged Float32 triangles; no large solid collider.
- [ ] Implement C: 23×12 near shallow reveals within y[-.12,0] relative original ceiling; same panel map and far plane.
- [ ] Run green, actual source-bound before/after four cameras + axial close-up, four-ID surface/open-gap tests and complete-body three-flight/return routes at 10/30/60; preserve independent source review.
- [ ] Measure high/low finished geometry, maps, unique owned bytes and fresh construction. Art budget before implementation: <=5000 additional resident triangles, <=500 KiB geometry scalar buffers, zero extra textures/materials/mesh batches. Exceeding budget requires explicit review, not deleting old detail.
- [ ] Commit complete verified art as `R120_PRE_PERF`; record exact fingerprint.

### Task 2: Five-category evidence and bounded experiments
**Files:** `docs/current-state/r120/PERFORMANCE-CANDIDATES.json`, diagnostic scripts/reports; only diagnosed minimal runtime files if accepted.
**Interfaces:** A immutable `R120_PRE_PERF`; every experiment B is same art/output and all-ready semantics.
- [ ] Diagnose repeated construction, immutable material/geometry reuse, character update hotpaths, resource ownership/release, first-screen blocking; include source hashes, counters, hotspot evidence and decision for each.
- [ ] Freeze target/counter metrics and A/A noise before implementing any candidate. Preserve prior R116/R117/R97 rejection evidence.
- [ ] For each credible candidate: RED equivalence/lifecycle, minimal mechanism, exact outputs, 5 fresh paired AB/BA runs. Reject/restore only candidate runtime changes when benefit/tails unsafe or inconclusive.
- [ ] Keep negative evidence; no candidate accepted is a valid result, not a speedup claim.

### Task 3: Major-release current-state closure
**Files:** `release.json`, README, `docs/current-state/r120/{requirements.json,VALIDATION.md,MAJOR-RELEASE.md}`, targeted/full driver and build evidence.
- [ ] Fresh actual high/low startup keys, lifecycle/resources, R118/R119 protected tests and current-state suite with unchanged old expectations; compare failure identities, not unequal suite counts.
- [ ] Read package-production CLI, run clean frozen builds for `/`, `/gugong/`, `/forbidden-city-3d/`; prove sourceDirty false, file hashes, static/HTTP/package launcher paths.
- [ ] Independent review tail; document inherited failures/unknown geometry/backside/GPU/mobile/Node20 as appropriate, never claim all green or measured reconstruction.
- [ ] Freeze commit/tree and exact build identity for root's sole uploader; leave main/Pages unchanged.
