# R124: Chuxiu front enclosure and courtyard-facing ensemble — proposal

Base: R123 `0aab5f4cff9dc39b0ee3313cfb181d26f7617bc9`, runtime `3cf969f6115745cde365ddaf72dd7236705f676711a789d1a8a13dca79118d08`.

## Observed difference ledger

Actual ready export: `reports/r124-chuxiu/baseline/export-before-high.json`; 43 actual image requests, 22 library colour maps and 21 normal maps, no error; seven fixed cameras. CPU z-buffer, not GPU/PBR. Transparent material/reflections are not faithfully composited, so dark central mirror/text pixels are not a product defect claim.

| Group | Already present (not new credit) | Verified source / actual residual | Proposed smallest change |
|---|---|---|---|
| A. Main recessed enclosure | Five bays, 1.9 m porch, four brick-sill/lower-glass/upper-lattice windows, 3.2 m central entry, two folded wood leaves | Official group58 photos 8/9 show glazed/wood-skirt central door assembly and nested rectilinear upper windows; model has plain tall brown side infills/leaves and sparse two-vertical/three-horizontal cells | Replace only existing door side infill and leaf volumes with skirt, two glass fields and real timber rails inside the same envelope. Upper windows gain original schematic nested stepped rectangles; lower glass gets vertical mullions. Preserve opening and existing collider coverage; no frame/room movement |
| B. Main front eave and front-wing column-head sequence | Existing generic blue/gold front beam, columns, roofs, 14-post return corridor and roof joint | Main 8/9 and separate Yanghe/Suifu front photos show a continuous pale framed lower fascia and column-head fields; current generic band dominates all three facades | Recompose only front beam surface/within-beam relief into pale/grey-green framed fields and narrow timber/gold edges; retain original beam bounding volume and underside. Do not invent deep floral carving, projecting hanging brackets or extend into the 1.1 m passage |
| C. Two front-wing enclosure faces | Existing three-bay shells, open middle, two full-height generic lattice side panels; original unknown-interior policy | Separate official group62 (Yanghe/east) and group59 (Suifu/west) show brick sill + lower glazing + upper red lattice, glazed wood-skirt door, green front columns | Replace the two generic side panels in each original facade plane with that composition. Refine the two existing folded leaves within the same envelope. Recolour only each wing's front columns green. No facade recess, wall/roof/frame/entry relocation, shop objects or inscription |
| Central fixed screens / four partitions | Four named partitions, five-screen/throne group, native 大圆宝镜/寿, warm alcove/kangs already present | 314×400 source supports broad wooden frame/mirror relationship but not full five-panel mapping or all partition directions; CPU alpha renders text backgrounds opaque | No geometry or inscription change this version. Explicit partial, not “central interior restored” |

Official files remain outside the public project: `../r123-r126-source-preflight/images/chuxiu-official-group58-{8,9}.jpg`, `../r124-independent-review/source-preflight/{yanghe,suifu}-official-front.jpg`. Metadata group62=Yanghe/east, group59=Suifu/west. Names may be carried as source metadata only; unknown inventory stays unknown. Exact photo URL and hashes remain in source manifests. No official bitmap is included in runtime.

## Fixed geometry / authority bounds

- Main remains (94.8,429.3), 27.1×13.8, floor .6, 5 bays; recessed front local Z=-5/world424.3; door free width3.2, leaf X±1.68 and size .13×4.5×1.05, side infill original dimensions.
- Main window sill .9, glass1.55, upper lattice1.5, partition height4.5. Nested pattern is a schematic fit within current cell rectangles, not exact carving/tracing or survey.
- Front wings remain (78.32,417)/west-facing and (111.28,417)/east-facing, 11.2×7.04, floor.45,colH5.44, 3 bays; front localZ=-3.52. Existing full-width side colliders/door opening remain unchanged. No new recess: that residual remains unclosed rather than moving the fit again.
- Beam main underside6.5136/top7.32; wings underside5.2372/top5.89. Surface relief confined to original .45 deep beam volume. Existing return-corridor geometry/colliders/posts unchanged.
- No main rear/side/bed/kang/screen/room/route/data coordinates change. R123 two rear wings, floor/ramp finite-source ownership and current lifecycle guards remain intact. Tight front-wing→main passage remains ~1.1 m for 1 m square body, not generous.
- No global kit defaults, player body, STEP, solver or ready policy change. Exact opt-in target validation before augmentation; no shared material mutation.

## Implementation and acceptance outline

Dedicated `ChuxiuFrontEnsemble.js` owns restrained geometry helpers and target-specific front-wing augmentation; `ChuxiuHall.js` calls the main-enclosure helpers; `ZoneBase.js` applies wing augmentation only after existing inventory policy. Preserve strict declaration/unknown inventory and all unrelated items. No catalogue name edits required.

Proposed ceiling budget: net ≤4,000 triangles, ≤6 newly owned materials, **0 new textures/atlases/requests**, 0 new colliders/walkables/rooms. It is a budget, not a PASS. Existing closed envelope glass/wood subdivision should leave contact coverage unchanged; verify actual bounds and retained collision arrays rather than assume.

1. RED: current plain door/glass count, upper-cell nested geometry, front-wing sill/glass/lattice/green-column source identity and pale fascia absent; wrong item/frame fails; desired retained opening/collider arrays pinned.
2. Implement same-envelope actual closed timber/glass pieces; real TextureLibrary in fresh high/low, no permissive fake material keys.
3. Same seven actual-ready camera exports; independent source/visual review. Compare actual triangle multisets/old role inventory; no hidden camera change.
4. Actual body main entry/side narrow turns/both front-wing entry/return/corridor→rear integration at10/30/60, retained R118 two-actor oracle/source-lifecycle subset. Original inherited contacts classified, not washed to zero.
5. Paired high/low complete west-six build/resource costs, owned disposal/texture holding; full all-ready fresh startup retained. Only claim measured scope; no GPU/mobile or perf benefit.
6. Necessary cumulative target/protected/motion/resources/current-state comparison, build/source identity; release R124 only after source-bound evidence. Frozen R123 untouched.
