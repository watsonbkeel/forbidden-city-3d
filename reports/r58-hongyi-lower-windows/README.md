# R58-A · FC-A43B1DAB0B 弘义阁 lower paired frames

Status: **VERIFY_PENDING**. This is a bounded exterior correction, not whole-building acceptance, current-2026 condition acceptance, or interior verification. True baseline: `c85e770daa0d952bb9a5614b0d8fa920c44650b2`. Content SHA-256 values and actual merged output hashes are in `proof.json`.

## Own source and exact difference

Read the MASTER-PROMPT global rules and all 37 A rows; cross-checked canonical FC-A43B1DAB0B against `CROSSWALK.json`, runtime `data/zones/axis-courts.json#/items/25`, and the independently transcribed Hongyi profile. Actually viewed the original 1024×792 [official Hongyi front photograph](https://img.dpm.org.cn/Uploads/Picture/dc/1980%5B1024%5D.jpg) on 2026-10-22 at 18:37 UTC. The source image SHA-256 is `73a695882b0bfed222cb8893459a5218fccf1c2c26ee1d19e04228e2ff169205`; the [own building page](https://www.dpm.org.cn/explore/building/236491.html) was read from its verified local copy, SHA-256 `fd0f0641a8fa4a75d0eaca466c75b26e8b50d87d4391adaf3f93ea939c2ed011`. Photography date is unstated. The source image remains private outside this worktree; only URLs/hashes are included here.

Reference → baseline → correction → verification:

- In the lower front strip, approximately image pixels x=250–467 and x=563–778, y=315–367, three pairs flank each side of the unchanged central doorway. Each group has two independently bounded rectangular leaves and a wider paired central meeting than a single lattice bar.
- The baseline already had one thin 0.045 m central bar in each large outer frame. It did not have two leaf frames. This is not a claim that its center line was absent.
- `HongyiLowerWindowLeaves.js` replaces just those six frame/grid groups with twelve paired rectangular frames. A minimal two-line import/dispatch addition in `SurveyedPavilion.js` binds it to Hongyi only. No shared helper, other production file, survey dimension, door, roof, terrace, upper gallery or inscription is edited.
- The 0.13 m stiles, 0.14 m rails and 0.03 m central seam are low-poly photo-fit choices, not survey measurements. They preserve each old external window envelope. The twelve noncentral old straight-bar X coordinates are exact. Six inherited crossbar rows per group are clipped at the leaf frames, not layered behind new members. Their detailed motif/spacing remains **INHERITED_SIMPLIFICATION_NOT_NEWLY_VERIFIED**. No hinge, fine lattice pattern, glazing, shutter backing, or hidden construction is invented.

The official source’s historical treasury use does not authorize modern room contents. No interior or staircase is added. The old front-waist 40.573/41.587 source conflict, official height datum uncertainty and unresolved rear remain untouched.

## Exact retained geometry and physical records

The tests hash actual Float32 positions, normals, UVs, indices, world transforms, material properties, texture configuration, shadow and visibility flags, excluding only meshes within the six lower-window groups. They are not counts/role-label-only retention checks.

- No-plaque non-target stream: `7eda138c1e7929d4a00eccc5573ebdfe250186146df182a4fcfe13ac9c6e47dd`.
- Including the original plaque and atlas: `2f07a7a6e849f66f614062b137ecd196f36858111133a2fa1d2891db8c2004fa`.
- Navigation/registration: `c34f90eaf2dfba367cf95b6b7aed2431eb541d660849489f61eba3eaa7f55c35`.
- Collider delta **0**, walk/support delta **0**, room delta **0**, map delta **0**, region delta **0**. All 915 colliders, 14 walkables, one room, one map item and one region remain byte-exact. The six existing blocking window volumes are not weakened. The playable central entrance is not widened or moved.
- Hongyi’s 43.680×16.704 lower grid is unchanged; Tiren’s entire geometry/material/physical snapshot is unchanged, including its independently measured 43.712×16.736 grid and existing paired windows. `PavilionLowerWindowLeaves.js` is unchanged.
- All 192 new source boxes are finite/nondegenerate before face pruning; resulting raw and merged geometry is also finite/nondegenerate. Old large frames/bars are not generated behind the new pair. Targeted front surfaces have separate depths, no coincident duplicate triangles, and edge-joined stile/rail framing. Each source geometry is private and released exactly once; caller materials are not disposed.
- Actual production merged component, including the original inscription: **16,388→17,456 triangles (+1,068; 6.52%)**, **13→13 draws**. No new material or texture. The added triangles are localized to the six windows; no whole-scene performance claim is made.

## Real component routes and already-built-W consumer

`tests/lib/r58-hongyi-window-world-check.mjs` exports `assertHongyiLeavesInWorld(W, item?)`. Parent supplies an already-built, matrix-updated scene and collision manager. The consumer creates no world, geometry or collision registration and never edits source or persistent scene records. An optional item supports a verified alternate placement.

It inspects the actual merged triangle first hits at all twelve meeting stiles, from collision-free feet supported by the original terrace, verifies all six window collisions remain blocking, and checks three rendered and physical doorway apertures remain open. Negative tests remove a stile, remove collisions/support, or substitute Tiren; they must fail rather than trust metadata alone.

Both actual `FirstPersonControls` stair-entry round trips use 666 frames at 60 fps. Each supplies 167 head/collision samples, minimum overhead clearance 2.984999656677246 m. No shared controls, collision code, body radius, threshold, landing or stair changes are made.

## Evidence and commands

- `red-test.txt` and `consumer-red-test.txt`: real absence failures before the two new functions existed.
- `focused-test.txt` / `focused-test.exit`: final 14/14 new Hongyi structural, ownership, negative and route tests passed, exit 0. This includes the final exact crossbar-row, front-face nonoverlap and removed-collision/support checks.
- `baseline-test.txt`: original six Tiren tests passed before the change.
- `surveyed-bounded-tests.txt`: all 15 existing pavilion/survey/component-seam checks passed. The legacy negative-lookahead option did not filter out the named seam test under this Node runner; it also ran and passed. That test constructs only local components, not a full world.
- `legacy-bounded-tests.txt`: 39 passed, three intentionally superseded legacy assertions failed; see below. This is **not** a green legacy-suite claim.
- `proof.json`, `cpu-export.txt`, `cpu-render.txt`: actual baseline/candidate output, strict retained-stream proof, cameras and merged measurements.
- `hongyi-{whole-front,paired-leaves,paired-oblique}-{before,after}.png`: same-camera CPU z-buffer output of actual production-merged geometry. Corresponding JSON/GZIP binds camera and submitted triangle data. These are flat diagnostic colors, not browser screenshots, textures, shadows, or final visual acceptance. All six before/after front, detailed and oblique outputs were actually inspected.

Text logs preserve output content, with trailing line whitespace removed for repository hygiene.

Commands:

    node --test tests/current-state/r58-hongyi-lower-windows.test.mjs tests/current-state/r58-hongyi-window-routes.test.mjs
    node --test tests/current-state/r58-tiren-lower-leaves.test.mjs tests/current-state/r58-tiren-leaf-routes.test.mjs tests/current-state/pavilion-render-geometry.test.mjs tests/r49-sourced-missing-inscriptions.test.mjs
    node --test --test-name-pattern='^(?!wall replacements)' tests/current-state/surveyed-pavilions.test.mjs
    node scripts/r58-hongyi-lower-windows/export-merged-cpu.mjs
    python scripts/r58-court-facade/raster-diagnostic.py <export.json.gz> <image.png>

## Old assertions deliberately preserved, not silently weakened

No old test or fixture was edited. Three old assertions necessarily assume Hongyi’s targeted windows are still the baseline large frames and must be explicitly migrated by the integration owner:

1. `r58-tiren-lower-leaves.test.mjs`, “Hongyi, including its six original windows and upper gallery, is byte-identical”: valid for the earlier Tiren-only change, now superseded only within the six Hongyi target windows. The new test instead proves every non-target stream exact and Tiren entirely exact.
2. `pavilion-render-geometry.test.mjs`, Hongyi hidden-face reduction: the previous absolute ≥2,600 removed-triangle threshold assumes old overlapping full-width window boxes. Edge-joined leaf framing produces fewer hidden source triangles. The same test also expects 114 old `lower-window-bar` meshes, now replaced by 72 inherited straight bars and 72 split crossbars. Its original upper-leaf, gallery, material, culling and >4,500 first-surface ray protections remain relevant and are independently checked by the surrounding passing tests; no shared culler is edited.
3. `r49-sourced-missing-inscriptions.test.mjs`, Hongyi all-retained stream: its historical inscription-only snapshot includes the now-targeted lower-window geometry. Its navigation hash remains exact, and the original plaque-presence/visibility test still passes. The new explicit plaque-inclusive non-target hash proves its inscription and everything outside the six windows unchanged.

Do not update old expected hashes to the candidate blindly or remove these tests. Scope exclusions should only cover the now-approved lower-window groups and preserve their other assertions.

## Remaining gate

Browser/GPU before/after validation remains pending. Inherited browser blockers were not retried or bypassed. No complete-world test, build, release/package, queue edit, main change, remote upload or Pages deployment was run. Parent owns one cumulative integration world and any later release decision. Full rear, all actual rooms/interior stairs, date-specific current condition, fine lattice motifs, paint and upper rail details remain unverified.
