# R82 Fubi true arch and sunken pool Implementation Plan

> Agentic execution: single implementation owner, independent review before upload; user opted out of optional approval gates.

**Goal:** Replace Fubi's solid bridge base with a real source-supported arch and reveal its sunken pool without changing upper architecture or pedestrian routes.

**Architecture:** A dedicated Fubi profile supplies a closed arch solid and one rectangular pool opening to both Environment and GardenBuilder. Only Fubi opts in; Chengrui and all other garden structures remain unchanged. Model water and bed levels are fitted, not surveyed.

**Tech stack:** Existing Three.js geometry, GardenBuilder, Environment, Node CPU integration tests and Vite.

**Spec:** Parent-approved phase4 Fubi-only batch; official236498 photographs inspected as pixels. Arch existence is supported, east-west bore direction and all dimensions remain model assumptions.

## Constraints and review focus
- Preserve main floor0.9, porch0.5, existing rails/columns/roof/seats, north/south ascent and pool exclusion colliders. No underwater pedestrian route.
- Opening3.2m, crown0.6, slab above crown0.3, water−0.45, bed−1.25 are reversible PHOTO/MODEL_FIT, not measurements.
- Remove all occluding ground/grass/path/bed faces within the shared14.5×9.5 pool interior. Preserve original tree sampling and paths/beds metadata.
- Real closed arch, no painted dark patch; low rays pass the bore but strike piers/slab. Meshes positive-area, manifold, owned/disposed correctly.
- Retain body-radius water guard, flight no-landing, rockery trap fix and NPC108/28beds. Flight heights may change only where lower pool surfaces previously contributed, not surrounding structures.
- No own deletion, main/Pages writes or credentials. One cumulative backup,200MB minimum disk headroom.

## Task1: Geometry and shared cutout
- [x] Write red arch rays, closed-solid/top-support and below-zero pool tests against real builder.
- [x] Implement src/scene/garden/FubiArchPool.js: profile, pool clip/path, arch solid and sunken basin.
- [x] Opt in only Fubi in RemainingGardenPavilions; preserve existing collider registration even where low edge visual geometry joins arch.
- [x] Environment shared pool hole; GardenBuilder local rectangle differences for grass/path/bed faces without rerandomizing trees.
- [x] Run unit geometry/manifold, merged consumer rays and disposal/rebuild tests; commit.

## Task2: Retention and release
- [x] Exact successor inventory and baseline geometry/nav comparison; Chengrui upper/lower and all off-target structures unchanged.
- [x] Whole garden north/south offset routes, lowfps, backward/sprint, seated edges/fall escapes, pool guard and flight checks.
- [x] Four complete-world night runs,108actors/28beds, old raw suite failure comparison; retain old tests without rewriting failures.
- [x] Attempt rendering only through currently permitted browser route; do not retry denied Chromium socket route. If unavailable, retain explicit visual acceptance gap.
- [x] Root/subpath build, one backup, README truthful cumulative history, independent review and final-byte evidence index.

## Final verification boundary

Code, CPU verification and cumulative packaging complete. Cloud browser/GPU screenshot remains unavailable under existing permitted tools; no denied Chromium route was retried and visual acceptance remains open. Independent code review passed; final artifact identity gate follows.
