# Tihe west — bounded local checkpoint validation

2026-10-29. Safe parent `0a8f35f075cf1a2a15b598d82a8ab13aa69bc347`; branch `feat/tihe-west-safe-20261029`. No garden WIP, push, deployment, main change or cleanup. This is **not whole-project acceptance**.

## Accepted scope and preserved contracts
Original FC-D5026B6E97: official building236529 and photo8040 support a western tea-room table/chair/rear cabinet-console/paired-vase/scroll-format/carpet composition. All proportions, colours, carving outlines and the west-gable/east-facing registration are explicitly reversible fits. No exact paintings, calligraphy, carving, textile, unlocated lamps, foreground inventory or current museum inventory is asserted. Not the entire palace.

Replace exactly25 original tea meshes and their25 uniquely owned colliders. Every other complete-west-six source mesh, navigation room/spawn/door, roof, platform, floor, and retained collider including R130 source/scope metadata is unchanged in the parent comparison. Private materials avoid accidental R130 collection. No new walkable or movement domain. Physical closure also registers123 exact **existing full-hall** source meshes (both enclosures, partitions,12columns and2ceiling triangles), not merely the western visual group. No invisible wall/ceiling or court-boundary expansion.

## Final frozen-source serial runs
All logs are under `reports/major-pilots/tihe-west/`.

| Full command group | Result | Log |
|---|---:|---|
| All `tests/major-pilots/tihe-west/*.test.mjs` | **36/36**,177.87 s | `rc-specialized.tap` |
| Shared explicit Xishang/Xiqing/roof/controller/terrain/Jingqi/Changyin/Jiyun group | **161/161**,352.08 s | `rc-shared-full.tap` |
| Original R48 outer navigation/stairs/neighbors | **32/32**,37.89 s | `rc-legacy32.tap` |
| All R48 residential test files + central review + west-six passages | **184/195**,11 failures,43.20 s | `rc-residential-full.tap` |
| Actual safe-parent residential full replay | **185/195**,10 failures,40.11 s | `residential-safe-parent.tap` |
| Real-entry Vite three-base in-memory compile | **3/3**,495 modules each | `rc-compile.log`, `compile-memory.json` |

Residential is **not all green**. Ten named failures reproduce in the actual safe parent (old Chonghua/Yangxin contracts, old GLB decoder expectations, forced-zero-feet through-route and historical data snapshot). The sole added failure demands the old removed `r48-tihe-west-tea-table`/chair group names. The new composition, exact old navigation and actual World traversal are tested separately; no old assertion/golden was changed. `residential-parent-delta.json` lists every failure and verifies final RC names identical to the compared candidate. Initial missing sparse fixture, guard red tests, source-oracle mistakes, seam-ray failures and earlier failed suites remain preserved; no single rerun is presented as a full group.

Final source fingerprint:
`0c910f50572cd3cfa1577b91b061a3abf44925b91deb6f51fdbb0baad3e4c2b3`

Bases `/`, `/forbidden-city-3d/`, `/gugong/`; real HTML/JS/build-info identities validated in memory. `write:false`, `publicDir:false`: no deployable package, HTTP smoke or GPU/browser claim.

## Physical evidence and remaining limits
- Actual World: central route, both doors, two ear-room lanes, transverse and west viewing route,10/60Hz walk/run-with-braking/jump, both directions. Generic .3/.5 callers and standing/seated NPC contacts tested.
- Continuous floor-origin and actual **new chair-support preset** launches sampled against retained window/partition/side-wall source at both rates and walking/running; no source penetration in the tested paths. This is not proof of every possible cabinet/vase launch or all trajectories.
- Downward original ceiling is bidirectional body blocking, not a new top floor; foot contact is null and descending controller remains airborne without jump reset.
- Original unbraked sprint residual can now reach the real chair cushion1.09 after crossing the transverse target; this differs from the parent and is retained as evidence. Controlled-route stopping uses the original controller's velocity decay, not teleport/velocity reset. Original central residual reaches the same old .67 threshold in both versions.
- Complete inherited Tihe domain, expanded by body halfwidth for the full-height census, also encounters existing Chuxiu gallery scope. That overlap is retained and explicitly allowed—not removed, invented or declared absent.
- Three surface owners: photo curves1984 source faces/1912 positive triangles/72 zero-area pole omissions; ceiling2/2/0; columns576/576/0. Final rendered triangle multisets and bidirectional source mesh/triangle IDs verified.
- Atomic rejection and disposal cover changed host/source/material/attribute/index/world matrices, foreign old collider metadata, duplicate ownership, late invalid curved source and injected mesh-construction failure; unloading/reloading and final merge resource disposal tested.

## Cost, preservation and rollback
`cost.json` uses actual real-material **isolated hall** for both sides, equally excluding later full-zone R130 owners:
- Raw meshes163→199; final merged meshes/material batches17→23.
- Triangles3054→5300; merged geometry bytes293184→508800.
- Colliders75→209; walkables1 and rooms3 unchanged.
- Exact retained-source contract312435 uncompressed bytes. High-contact pair alone initially took64.66+80.72 seconds for120 simulated seconds. CPU contact cost is material; **GPU and universal smoothness unverified**. No performance-acceptance claim.

All14 old dirty reports rehashed unchanged after the final runs. Total new source/tests/docs/reports remains below10MiB; free space about1549MiB. Old WIP/rollback branches and the0a8 parent are preserved. Reverting the single bounded checkpoint restores its parent; do not reset or overwrite unrelated old worktrees. No local dev dependency symlink is part of the deliverable.
