# Yongshou complete south-face visual revision — bounded checkpoint

2026-10-29. Safe parent `cb455649da623746ed59dc14032e66a0ba794ffb`; branch `feat/yongshou-front-safe-20261029`. **Not whole-palace, whole-project or repaired-physics acceptance.** Garden WIP and blocked Sanyou WIP are excluded. No main change, push, deployment or cleanup in this task.

## Implemented source-supported area
Original FC-62BF56B1F3, official building236450 and three official front/eaves photos listed in DESIGN support the five-bay south-face window/door relationship. Replaced all four south window assemblies coherently: narrow diamond-pattern side fields, wide rectangular glazing center, distinct upper/lower bars, fitted red framing and golden-coloured edge finish. Retained original sill and outer-frame geometry; finished only the two original operationally open south leaves with private simplified lattice/lower-panel patterns. Original open pose/leaf count is NOT asserted to match the photograph's closed doors/curtain.

All dimensions, colour, bar spacing, and fine patterns are reversible fits, not measured survey or exact four-bowl carving. Tree-obscured end details remain fitted. North face, roof, platform, steps, pillars/header/nameboard, interior inventory, rear leaves and adjacent halls are retained. Modern exhibitions/historical imperial furnishings are not conflated or newly reconstructed. Source URL date is not capture date.

## Contracts and physics limits
- Actual safe-parent comparison covers complete west-six: every non-target source mesh/material/metadata record, all colliders (including retained source/scope metadata), walkables, rooms, regions and map items unchanged. Applied-object test also checks collision/nav arrays and record identity, not just serialization.
- New visible window geometry lies within each original final-F32 complete window envelope; original front leaf vertices/UV/matrices unchanged. Private leaf texture repeat/offset adapts old band UVs to sample the whole panel without changing the shared texture or source geometry.
- **No new collider, walkable, strict domain, movement adapter or support.** Original high-window/column physical incompleteness is retained and **not certified repaired**. Same whole-window envelope does not prove all fitted bar/body contacts or universal collision safety.
- Actual World south portal, north portal and front-court routes passed10/60Hz walking/running-with-braking/jumping both directions; kinematic.3/.5 radii passed. No velocity reset or teleport mid-route.
- Separate initial96 actualWorld probes retain every frame hash and outcome of actual cb455649. Only24 arrive;32 side-lane presets are already illegal starts; central full-through probe hits inherited interior obstacles. Those are explicitly NOT successful routes. High-window/column starts are presets, not ground-reachability proof. Final candidate trace rerun retains the same parent results.
- Guard rejection covers canonical source geometry/layout/material/visibility, drawing groups/index interpretation, and required writable metadata/leaf fields. Detached late-allocation failure cleans resources with live graph unchanged. Not arbitrary commit-callback rollback: hostile Object3D event or dispose callback exceptions are outside this verified guarantee.

## Frozen-source serial verification
All logs under `reports/major-pilots/yongshou-front/`. Production fingerprint:
`3333af93cb54eea1abc05b8782c6ac6549cb6ca5f5765e8e316ee8c6d204f5a6`.

| Complete group | Result | Evidence |
|---|---:|---|
| All Yongshou specialized test files | **13/13**,13.21s | rc-specialized.tap |
| Shared40-file Xishang/Xiqing/roof/controller/terrain/Jingqi/Changyin/Jiyun group | **161/161**,350.99s | rc-shared-full.tap |
| Original outer navigation/stairs/neighbors | **32/32**,39.72s | rc-legacy32.tap |
| All R48 residential files + central review + west-six passages | **184/195**,11failures,40.67s | rc-residential-full.tap |
| Actual cb455649 residential replay | **184/195**,same11failures,41.35s | residential-safe-parent.tap |
| Real-entry Vite memory-only compile | **3/3**,496 modules each | rc-compile.log, compile-memory.json |

Residential is NOT all green. `residential-parent-delta.json` lists all11 shared failures (old Chonghua/Yangxin contracts, decoder expectations/file-level central-review failure, old Tihe names, forced-zero-feet through-route and historical data snapshot); zero added/removed failures in final comparison. The195 reported entries do not imply all internal tests of the failing central-review file executed. No legacy assertion/golden was edited.

Initial candidate183/195 had an extra false furniture classification: legacy test counts material names containing `gold`; eight window edge strips were counted as furniture. Material was accurately named `painted-outline-fit` with ONLY its name changed; independent full-zone mesh retention proves old furniture unchanged. Initial failure and parent replay are retained. Other preserved failures include frozen metadata/live-graph mutation, drawing-semantics guard and private door UV clipping. Pre-UV shared161/161 is not substituted for final post-fix fullgroup.

Three compile bases `/`, `/forbidden-city-3d/`, `/gugong/`, actual HTML/JS/build-info identities checked in memory (`write:false`, `publicDir:false`). No package/dist/public copy, HTTP smoke, GPU rendering or pixel-fidelity claim. Procedural drawing callbacks run under CPU fixtures with inert canvas support; tests verify composition/texture ownership/UV coverage, not actual GPU pixels.

## Cost and rollback
Actual real-material isolated hall comparison (`cost.json`), equally excluding later whole-zone source owners:
- raw meshes127→147; triangles2828→3068;
- final merged materials/batches17→22; geometry271488→294528 bytes;
- colliders28,walkables3,rooms1 unchanged;
- three256² RGBA8 private textures786432 base bytes, approximately1MiB including full mip chains. Five new private materials. Shared resources remain unchanged; merged geometry/private material/texture disposal verified once.
This adds renderer/material/texture cost despite no new physical surfaces. No GPU timing, pixel appearance or universal smoothness acceptance; existing project CPU/source-contact costs remain.

All14 old dirty reports rehashed SHA-identical (`preserved-dirty.json`). Total new files remain under1MiB, below10MiB; free space1516MiB. Safe parent, unsafe garden and Sanyou WIP rollback branches remain preserved. Revert only this bounded checkpoint to restore parent; never reset unrelated worktrees. Local node_modules symlink is not part of deliverable.
