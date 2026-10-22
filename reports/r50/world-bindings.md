# R50 character world bindings, data and motion verification

## Release status and scope

- Baseline: `92cf31ec1779d0d6266a2caa6ad1708c379d1500`.
- **38/38 required logical actors remain required.** Counts: Taihe 23, Wumen/Shenwu/Qianqing gates 2 each, west lane 3, Chuxiu/Yikun/Yongshou domestic sites 2 each. No missing role was relabelled optional.
- **C1 is not approved by this report.** `sceneEnabledByDefault=false` and `releaseGate=c1-user-visual-approval` remain in data. CPU actual-geometry readiness does not prove visual quality, GPU performance or a natural historical seated posture. The full scene must remain gated until the release owner records the user's concrete C1 approval.
- The Taihe `throne-front-perch` is the current actual-furniture candidate. Its contacts and collision probes pass. Its visual acceptance remains separate. The rejected `raised-footstool` trial remains a diagnostic pose API, not the scene binding. The physically invalid tucked-behind-footstool attempt was not shipped as a scene binding.
- **Specific hairstyle evidence is still incomplete.** H4 supports the mid-Qing/late-Qing era distinction, not the present consort or maid hair geometry. The Kit owner recorded that no selected Qianlong-period image was actually inspected before freezing; see `c1-samples/history-reference/hairstyle-evidence-card.md`. Anonymous interpretation and small hair volume do not satisfy the document’s separate image-evidence requirement.
- No building, furniture, landing site, flight state, water geometry, player collider or player walkable was edited. There is no fallback-to-origin, unbound y=0 or forced model scaling.
- Frozen-source manifest: `data/characters/world-source-freeze.json`, 182 source files with SHA-256 values checked against the baseline and against the working tree. Coverage includes scene architecture, zone/architecture data, Environment, FlightState, constants and `src/utils/Collision.js`. This is a source-file manifest, not a claim to hash every public asset.

## Deliverables and contract

All scene data are legal JSON in `data/characters/`. `index.js` exports the deeply frozen `CHARACTER_REGISTRY` assembled from actors, templates, anchors, surfaces, seats, paths, ceremonies, evidence and scope. `schema.json` is JSON Schema Draft 2020-12 for that combined registry, with separately addressable `$defs`; its syntax and the actual combined registry were independently validated with Python `jsonschema`.

`CharacterSchema.js` adds cross-reference and physical-invariant checks beyond structural JSON Schema. It rejects duplicate global IDs, dangling evidence/anchor/surface/seat/path/ceremony references, malformed data containers, incompatible poses, seat variant mismatch, nonzero unverified seat offsets, invalid metres/forward vectors, cross-zone first-version paths, unverified doorway routes, unsupported timings, missing required coverage, duplicate formation slots and inconsistent shared formation clocks. Validation returns actionable errors; it never silently removes required content.

The seven stable template IDs are `emperor-ceremonial`, `official-ceremonial`, `ritual-attendant`, `consort-daily`, `maid-daily`, `eunuch-daily` and `guard-duty`. Models use +Y up, +Z forward and unscaled 1.70 m body height. World coordinates use the existing Layout convention, +X west and +Z north, in metres.

### World adapter API

```js
new CharacterWorldAdapter({scene, collisionManager, zoneManager, interiors, registry})
adapter.resolve(actor, metrics)
adapter.getRevision(actor)
adapter.resolveAnchor(anchorRef)
adapter.resolvePath(pathOrId) // alias of validatePath
adapter.invalidate()
adapter.dispose()
```

`resolve` synchronously returns `{status:'ready'|'pending'|'error', ...}`. A ready binding has `position:[x,y,z]`, `rotationYRad`, `zoneRef` and `support`; route bindings also have a ready `path`. Pending/error includes a reason and does not fabricate coordinates. Seat metrics must contain the actual acquired Kit geometry's `seatPelvis`, `seatContact` and nonempty `groundContacts` (or `footContacts`). Missing metrics is pending, not pose approval.

Readiness reads real `ZoneManager.loaded` group identity, with `getLoadedIds()` only as a boolean compatibility fallback. A changed group identity, explicit invalidation, or InteriorLoader state/token/group change creates a new revision. A simple loaded boolean is not sufficient. This implementation conservatively includes all known interior state changes in its generation, so an unrelated interior can revalidate an otherwise unchanged binding; that is safe but potentially extra work. Unrelated zone collider-count changes no longer invalidate frozen static actor bindings.

Caches contain one current result per actor ID and one per path ID, replacing earlier generations instead of accumulating old generations. Negative results are not cached. Visible geometry and transformed world boxes are indexed once per geometry revision in a 32 m XZ grid; very large boxes use a small global list. Collider boxes have a separate readonly candidate index, followed by the original continuous segment/slab check. Mesh boxes only select candidates, never stand in for a seating solid.

Ground support uses actual visible upward-facing triangles in the declared ±0.03 m layer. Registered walkables may satisfy an explicitly walkable surface. Character meshes, hidden interior fallback meshes and collision/walkable helper meshes cannot support an NPC. A short ray cannot hit a roof several metres above the declared floor. Cheapest real mesh candidates are tested first; an exact declared-layer hit can stop further large-mesh raycasts, while a nonexact query retains the nearest valid bounded intersection. Full independent rays agree with the selected geometry on all 148 route samples.

### Motion API

```js
const path = adapter.resolvePath(registry.paths.find(p => p.id === actor.placement.pathRef));
const controller = new PatrolController({
  path, speedMetersPerSecond: actor.behavior.speedMetersPerSecond,
  pauseSeconds: actor.behavior.pauseSeconds,
  followerSpacingMeters: actor.behavior.followerSpacingMeters
});
controller.sample(simulationSeconds, actor.behavior.followerIndex);
```

`sample` returns `status`, `pathRef`, `position`, `rotationYRad`, `distanceMeters`, `direction`, `moving`, `speedMetersPerSecond`/`speed`, `stage`, `walkPhaseRadians` and `simulationSeconds`. It is pure with respect to the caller-owned simulation clock. `path.formationSize` supplies the default formation size. LOD/reload must recreate a controller for a new path revision without resetting the shared simulation clock.

The three guards occupy the **same polyline at fixed arc-length spacing**, not parallel world-axis offsets. Their arc ordering is retained during a shared endpoint pause/turn; leading/trailing roles swap on return. They do not pile up at an endpoint or pass through one another. There is no claim that this short route reconstructs a historical patrol timetable.

`CeremonyController` exposes a shared waiting-only clock. Formal ritual excerpts and the complete three-kneelings-nine-kowtows sequence are explicitly deferred; no repetitive knee motion is labelled a complete ceremony.

## Actual architectural support and seating

### Taihe throne

The binding reads the retained `TaiheCore.js` B-layer geometry and the real S-layer GLB contract. The selected gold slab is the actual seat component, not the armrest: slab width 1.585 m, depth 0.79 m and top at the throne base +0.49 m; armrests sit at x≈±0.75 m and rise to base +0.97 m. The teal waist/backing component is not described as a soft seat cushion. The separate 0.705 × 0.42 × 0.30 m object in front is the footstool.

The official Palace Museum throne dossier supports the object dimensions and functions: [太和殿宝座档案](https://img.dpm.org.cn/Uploads/pdf/5063/T00012_00.pdf), printed p012. [A second museum description](https://young.dpm.org.cn/info/305) independently gives seat and footstool heights. These sources do not certify the model's world registration or make a candidate character posture visually natural.

| Feature | Actual world geometry / selected binding |
| --- | --- |
| Hall floor | y = 9.9375 |
| Red seat base top | y = 12.2075; x ±0.92; z 8.13…9.83 |
| Lower plinth | y 12.2075…12.4175; z 8.7625…9.7575 |
| Seat slab | y = 12.6975; x ±0.7925; z 8.865…9.655 |
| Footstool top | y = 12.5075; x ±0.3525; z 8.22…8.64 |
| Current contact / pelvis | contact (0, 12.6975, 9.05); pelvis (0, 12.7775, 9.05) |
| Current root / facing | (0, 12.2075, 9.01); south, rotation π |
| Shoe contacts | (−0.12, 12.5075, 8.43), (+0.12, 12.5075, 8.43) |
| Kit variant | `throne-front-perch`; no model scale change |

The initial footstool variant had an excessively horizontal-looking leg arrangement and was not accepted as a visual pass. A proposed lower red-base landing was also rejected: it put the shoes **inside the lower plinth**, despite a downward ray finding a hidden lower surface. The current front-contact variant is a separate candidate; the report does not silently reclassify either rejected trial as acceptable.

Seat validation requires actual hip contact plus four support corners (half extents 0.185 × 0.175 m), an explicit pelvis target, both actual Kit foot contacts, and five actual support probes per shoe (centre plus four conservative corners, ±0.065 × ±0.139 m). Foot support permits the Kit's nonzero local foot height; it does not hardcode feet at local y=0. Shoe-volume samples 0.04 m above the sole also perform a bounded +Y triangle-crossing test: a nearest upward-facing exit indicates the point lies inside a closed furniture solid and rejects the binding. This is actual readonly triangle math, with no material-side mutation and no merged-mesh AABB used as a volume. It is a targeted seated-shoe test, not a general full-body cloth/furniture intersection solver. Kit geometry and actual-scene visual review remain necessary for sleeves, robe folds and knee shape.

### Chuxiu north kang

The domestic seated role uses the existing west-next-room north kang in `ChuxiuHall.js`, not an invented low chair or a resized actor. Its footprint is world x 98.17…102.27, z 438.0…440.4; top y=1.05, room floor y=0.60. The contact is (100.22,1.05,438.20), pelvis (100.22,1.13,438.20), root (100.22,0.56,438.16), facing south. Feet are (100.10,0.60,437.625) and (100.34,0.60,437.625), using `kang-low` with local feet y=0.04. Contact is set 5 cm behind the early trial point to keep the full hip rectangle within the real north-kang edge. The maid stands on the verified room floor at (100.22,0.60,435.50).

This is explicitly a **current reconstructed display support plus anonymous Qianlong-themed interpretation**, not proof that a named Qianlong consort used this exact piece of furniture. The source describes the 1971 restored display and the north kang in a 1982 account; see evidence D4 below. The selected domestic locations are Chuxiu, Yikun and Yongshou, two actors each. Changchun is not needed for required coverage and was not made to fit by changing architecture.

## Required stable-ID mapping

The table records readonly binding results from the actual CPU world fixture. A path binding's start point is a route origin, not three overlapping rendered guard positions: at simulation t=0, their arc offsets are 2.8, 1.4 and 0 m, respectively. Every row remains `required:true` and behind the scene release gate.

| Stable actor ID | Template | Zone | Bound support / route | World binding position (m) | Physical state |
| --- | --- | --- | --- | --- | --- |
| `taihe-emperor-01` | `emperor-ceremonial` | `static` | `taihe-throne-seat` | (0, 12.2075, 9.01) | ready |
| `taihe-official-east-01-01` | `official-ceremonial` | `static` | `taihe-court-ground` | (-12, 0, -80) | ready |
| `taihe-official-east-01-02` | `official-ceremonial` | `static` | `taihe-court-ground` | (-19, 0, -80) | ready |
| `taihe-official-east-02-01` | `official-ceremonial` | `static` | `taihe-court-ground` | (-12, 0, -87) | ready |
| `taihe-official-east-02-02` | `official-ceremonial` | `static` | `taihe-court-ground` | (-19, 0, -87) | ready |
| `taihe-official-east-03-01` | `official-ceremonial` | `static` | `taihe-court-ground` | (-12, 0, -94) | ready |
| `taihe-official-east-03-02` | `official-ceremonial` | `static` | `taihe-court-ground` | (-19, 0, -94) | ready |
| `taihe-official-east-04-01` | `official-ceremonial` | `static` | `taihe-court-ground` | (-12, 0, -101) | ready |
| `taihe-official-east-04-02` | `official-ceremonial` | `static` | `taihe-court-ground` | (-19, 0, -101) | ready |
| `taihe-official-west-01-01` | `official-ceremonial` | `static` | `taihe-court-ground` | (12, 0, -80) | ready |
| `taihe-official-west-01-02` | `official-ceremonial` | `static` | `taihe-court-ground` | (19, 0, -80) | ready |
| `taihe-official-west-02-01` | `official-ceremonial` | `static` | `taihe-court-ground` | (12, 0, -87) | ready |
| `taihe-official-west-02-02` | `official-ceremonial` | `static` | `taihe-court-ground` | (19, 0, -87) | ready |
| `taihe-official-west-03-01` | `official-ceremonial` | `static` | `taihe-court-ground` | (12, 0, -94) | ready |
| `taihe-official-west-03-02` | `official-ceremonial` | `static` | `taihe-court-ground` | (19, 0, -94) | ready |
| `taihe-official-west-04-01` | `official-ceremonial` | `static` | `taihe-court-ground` | (12, 0, -101) | ready |
| `taihe-official-west-04-02` | `official-ceremonial` | `static` | `taihe-court-ground` | (19, 0, -101) | ready |
| `taihe-attendant-east-01` | `ritual-attendant` | `static` | `taihe-hall-floor` | (-2.2, 9.9375, 2) | ready |
| `taihe-attendant-west-01` | `ritual-attendant` | `static` | `taihe-hall-floor` | (2.2, 9.9375, 2) | ready |
| `taihe-guard-east-01` | `guard-duty` | `static` | `taihe-court-ground` | (-30, 0, -63) | ready |
| `taihe-guard-east-02` | `guard-duty` | `static` | `taihe-court-ground` | (-30, 0, -72) | ready |
| `taihe-guard-west-01` | `guard-duty` | `static` | `taihe-court-ground` | (30, 0, -63) | ready |
| `taihe-guard-west-02` | `guard-duty` | `static` | `taihe-court-ground` | (30, 0, -72) | ready |
| `wumen-guard-east-01` | `guard-duty` | `static` | `wumen-south-ground` | (-5.5, 0, -436.6) | ready |
| `wumen-guard-west-01` | `guard-duty` | `static` | `wumen-south-ground` | (5.5, 0, -436.6) | ready |
| `shenwu-guard-east-01` | `guard-duty` | `static` | `shenwu-south-ground` | (-6, 0, 526) | ready |
| `shenwu-guard-west-01` | `guard-duty` | `static` | `shenwu-south-ground` | (6, 0, 526) | ready |
| `qianqing-guard-east-01` | `guard-duty` | `static` | `qianqing-south-ground` | (-12, 0, 196.3) | ready |
| `qianqing-guard-west-01` | `guard-duty` | `static` | `qianqing-south-ground` | (12, 0, 196.3) | ready |
| `west-lane-guard-01` | `guard-duty` | `west-six` | `west-second-lane-patrol` | route start (122, 0, 322); arc sample determines actor position | ready |
| `west-lane-guard-02` | `guard-duty` | `west-six` | `west-second-lane-patrol` | route start (122, 0, 322); arc sample determines actor position | ready |
| `west-lane-guard-03` | `guard-duty` | `west-six` | `west-second-lane-patrol` | route start (122, 0, 322); arc sample determines actor position | ready |
| `chuxiu-consort-01` | `consort-daily` | `west-six` | `chuxiu-west-north-kang` | (100.22, 0.56, 438.16) | ready |
| `chuxiu-maid-01` | `maid-daily` | `west-six` | `chuxiu-floor` | (100.22, 0.6, 435.5) | ready |
| `yikun-consort-01` | `consort-daily` | `west-six` | `yikun-court-ground` | (91, 0, 369.5) | ready |
| `yikun-eunuch-01` | `eunuch-daily` | `west-six` | `yikun-court-ground` | (89.3, 0, 369.5) | ready |
| `yongshou-consort-01` | `consort-daily` | `west-six` | `yongshou-courtyard-stroll` | route start (90.9, 0, 315.5); arc sample determines actor position | ready |
| `yongshou-maid-01` | `maid-daily` | `west-six` | `yongshou-court-ground` | (88.9, 0, 316) | ready |

Taihe officials use stable `formation:{side:'left'|'right',index:0..7}` metadata; the manager can preserve symmetric low-quality subsets without changing the logical required roster.

## Paths, water and landing exclusions

| Route | World points | Length | Samples | Radius including margin | Turn disc | Two-roundtrip evidence |
| --- | --- | --- | --- | --- | --- | --- |
| `west-second-lane-patrol` | (122,0,322) → (122,0,340) → (125,0,347) | 25.615773 m | 104 | 0.50 m | 0.55 m | 133.684 s, 4,014 actor-position checks |
| `yongshou-courtyard-stroll` | (90.9,0,315.5) → (98.9,0,315.5) → (98.9,0,318.2) | 10.700000 m | 44 | 0.42 m | 0.50 m | 83.333 s, 835 actor-position checks |

Both routes are same-zone, with no doorway crossing. Validation checks actual surface and cardinal footprint edges at **≤0.25 m** intervals, continuous radius-expanded collider sweeps between samples, endpoint turn discs, body-height overlap and step limits. Two full out-and-back cycles were sampled at 0.1 s intervals, with segment sweeps between those motion samples, player collision checks as an independent check, actual ground height comparison and route closure checks. Minimum three-guard centre separation was 1.371409 m, above their 1.00 m combined sweep diameter; maximum ground error was numerical noise (<8e−14 m). NPCs add zero player colliders.

Flight clearance is read from `HELICOPTER_HOME`, `LANDING_CHOICES` and `FLIGHT_RULES` without mutation. The centres are Wumen (18,−494), Taihe (35,−155) and Qianqing (25,245). The exclusion radius is **5.7 m helicopter radius + 1.0 m disembark margin + actor radius**. Static actors and route samples are checked; analytic segment-to-circle distance catches even a shallow incursion between safe sample endpoints. Across all declared standing/route positions, using a conservative 0.50 m actor envelope, the smallest extra clearance beyond the full 7.20 m exclusion was **43.205258 m**. No flight state was changed.

Existing world boundary and water checks are read only. Yanxi's water-palace cutout is independently excluded by its actual source bounds; the 1909 unfinished water palace cannot receive Qianlong living characters. Neither collision-skip tags nor collision removal is used as an escape hatch.

## Actual interior atomic replacement and lifetime

`tests/p3c-world-interior.test.mjs` parses the real GLB, then uses the production InteriorLoader contract validation, `_install`, fallback hide/show, unload and dispose code. Only its network-loading callback is supplied from the parsed local asset; the scene and geometry are not proxy boxes.

- Asset: `public/models/interiors/taihe-display-grid-6012719f9618.glb`.
- SHA-256: `6012719f961816d2e92ec2095d2877c4a93b6988606c7b7876b57224b84893d5`.
- 20 full B→loading→S→B cycles, followed by contract-failure, cancelled-late-callback and dispose-while-loaded cases.
- 64 checked states; 192 independent full-ray unique-support checks across seat and two feet.
- Exactly one visible support owner at each contact: B uses `taihe-core-fallback_taihe_*`; S uses `merged_taihe_*`. Hidden fallback geometry cannot still support the actor.
- Seat height B/S = 12.69749999 m. Foot heights B = 12.50749993 m and S = 12.50750017 m, comfortably within tolerance.
- Revision changes on each real load state/group identity change; warm resolution causes no new support query; actor cache maximum = 1 for the single tested actor.
- All 23,253 player colliders and 1,075 walkables remain byte-for-byte equivalent to the pre-test physics snapshot. Bad contracts preserve B, late callbacks do not ghost-install S, and disposal restores B.

## Verification and reproduction

```sh
node --test tests/p3c-data.test.mjs tests/p3c-world.test.mjs
node --test tests/p3c-world-coverage.test.mjs tests/p3c-world-interior.test.mjs
```

Results at the 03:14:44 UTC source freeze: **31/31 tests pass** (data 6, adapter/controller units 19, actual-world coverage 5, real-interior lifetime 1). The actual-world fixture is exported as `buildCharacterWorld()` from `tests/p3c-world-fixture.mjs` for independent integration. It installs a real `@napi-rs/canvas` canvas, builds the retained world, real ground and the real merged west-six zone. It returns scene, collision manager, adapter, zone manager and building objects. It neither runs a browser nor claims a GPU screenshot.

The coverage test regenerates `/tmp/r50-world-bindings-results.json`; the interior test regenerates `/tmp/r50-world-interior-results.json`. Their substantive values are reproduced above. The expected deliberately bad InteriorLoader contract emits a warning during its successful failure-preservation test; that warning is not a hidden test failure.

Regression cases include: malformed registry containers; missing/downgraded required actors; cross-zone refs; duplicate arc-follow slots; path midpoint wall collisions despite clear endpoints; unbound origins; missing seats; real lower surfaces under roofs; helicopters; foot/hip overhang; a shoe inside a concealed plinth; 20 zone-group identities without cache growth; conservative 0.40 m static body envelope (rather than too-small 0.32 m); and spatial indexes retaining exact collision checks.

## Performance evidence, not a pass claim

Independent production-system CPU profiling is in `reports/r50/baseline-independent-cold-profile-v3.json`, with source hashes in its companion input file. This uses the actual architecture and production CharacterSystem/InstancedMesh submission, **not WebGL rendering or device/GPU timings**.

- First approved update: **286.45 ms**; one zone reload update: **221.12 ms**; unload update: **1.02 ms**.
- A comparable pre-optimization profile was 501.16 ms cold. Collider broad phase reduced the inclusive sweep cost from 132.98 ms to 5.76 ms. Support rays still dominate at 211.83 ms cold; an individual first route binding can take 142.01 ms. Seat contact/occupancy work was 35.40 ms for two seats, including 24.67 ms for actual triangle occupancy checks.
- These remain **cold/reload frame-budget failures**, not excused by a good warm-loop p95. Warm cached measurements from earlier snapshots cannot establish first-frame performance.
- The release gate prevents an unapproved 38-character scene from triggering this work, but a future approved rollout still needs bounded prevalidation or incremental preparation. Do not remove real support checks, reduce radius/sample density, or turn occupied seating green merely to meet a frame budget.

### Frozen-source follow-on experiment (not shipped)

After source commit `c560681` was frozen for the independent full regression, a temporary Adapter-only experiment prioritized **actual flat visible geometry at the declared Y layer** before the triangle-count ordering. It still raycasts the real shaped ground, including river and pool holes; it never substitutes a mathematical infinite plane. No production source file was changed for this experiment.

Eight alternating fresh-Adapter full-roster binding trials on the same actual world measured baseline median **241.79 ms** (226.95–273.09 ms) versus temporary candidate **117.73 ms** (111.66–128.97 ms); first trial 273.09→125.74 ms. Mesh-ray attempts fell from 5,107 to 1,130. All 954 support queries from the baseline run were replayed against the candidate and agreed in status and position within 1e−6 m, with five additional hole/wrong-layer probes agreeing. Physics remained unchanged and all 38 actors were ready in every trial. These are **Adapter-only** measurements, not the production-System update numbers above, and 117.73 ms still is not a frame-budget pass. The unapplied proposal is preserved as `cold-optimization-candidate.patch`, exact measurements as `cold-optimization-candidate-results.json`, and the reproducible experiment as `cold-optimization-candidate.mjs` in this report directory. The script accepts a repository path and `R50_EXPERIMENT_TMP`; its generated Adapter exists only in the temporary directory. None is a replacement production Adapter or an applied source change.

## Evidence cards and historical boundaries

The geometry is self-authored, and the registry labels all actors anonymous interpretive roles. Official sources support role categories and limited costume/site distinctions, not exact rosters, names, facial likenesses, uniform ranks, embroidery copies, historical patrol routes or the complete ritual. Current domestic furniture layers are stated rather than silently backdated. No third-party museum picture is embedded as a runtime texture or bundled asset.

- **H1 [元旦大朝](https://www.dpm.org.cn/court/system/236364.html)**: 元旦大朝的朝服、朝贺、班位与礼仪职掌背景；不支持本场23人的数目、精确官阶、位置或完整礼仪动作。 Reference: Linked official text; no museum image embedded
- **H2 [延禧宫](https://www.dpm.org.cn/explore/building/236535.html)**: 1845年火灾、1909年筹建水殿、1911年未完工；乾隆主题生活人物不得进入水殿。 Reference: Linked official text; no museum image embedded
- **H3 [论明宫服饰对清宫服饰的影响——以明、清宫廷服饰上的“十二章”“补子”为例](https://img.dpm.org.cn/Uploads/File/2020/02/19/u5e4cfeaddb3ec.pdf)**: 皇族服制团龙与文武官方补的类别差异；官员前胸补子依双襟分开、后背完整等纹饰研究背景。模型仅原创类别提示，不指定品级鸟兽或复刻纹样。 Reference: 李理，《故宫学刊》2014；PDF pp13–17 / printed pp178–182；团补与方补见PDF pp14–15。
- **H4 [红旗故宫联合创新实验室举办第四届专题论坛——清代宫廷服饰探讨](https://www.dpm.org.cn/learing_detail/258734.html)**: 中期真发两把头至晚清大拉翅的演变讨论支持保守发式边界；不把夸张晚清大拉翅套用于乾隆主题。 Reference: Linked official text; no museum image embedded
- **H6 [清代皇帝一天的生活](https://www.dpm.org.cn/forum_detail/99719.html)**: 清代皇帝起居概述：换装、饮食和内侍服务背景；非乾隆某一日的逐时复原，不能据此指定后妃居住关系。 Reference: Linked official text; no museum image embedded
- **D1 [长春宫](https://www.dpm.org.cn/explore/building/236436.html)**: Household building identity; furniture remains current model interpretation. Reference: Linked official text; no museum image embedded
- **D2 [翊坤宫](https://www.dpm.org.cn/explore/building/236517.html)**: Household building identity, not a Qianlong occupant claim. Reference: Linked official text; no museum image embedded
- **D3 [永寿宫](https://www.dpm.org.cn/explore/building/236450.html)**: Household building identity, not a Qianlong occupant claim. Reference: Linked official text; no museum image embedded
- **D4 [储秀宫及1971重设陈列中的西次间北炕](https://www.dpm.org.cn/explore/building/236486.html)**: Household site identity; current model north kang follows source-text supported reconstructed display, not Qianlong furnishing inventory. Reference: https://www.dpm.org.cn/Uploads/File/2024/07/22/u669dcd8dc5647.pdf printed p265
- **H7 [宫女制度](https://www.dpm.org.cn/court/system/236418.html)**: 宫女内廷服务职责及制度背景；与秀女选拔不同，不支持某一宫室的精确人数或统一服装。 Reference: Official text; linked image is a research reference, never bundled as a runtime asset.
- **H8 [郎世宁哨鹿图轴](https://www.dpm.org.cn/collection/paint/229441.html)**: 相关领侍卫职责词条支持护卫与列侍扈从的角色区分；狩猎图像不能当作太和殿门卫制服证据。 Reference: Official text; linked image is a research reference, never bundled as a runtime asset.
- **F1 [太和殿宝座档案：髹金漆云龙纹宝座](https://img.dpm.org.cn/Uploads/pdf/5063/T00012_00.pdf)**: 宝座座高0.49m、座宽1.585m、纵0.79m，下层座1.62×.995×.21m，脚踏.705×.42×.30m。支持器物分部尺寸与功能，不证明当前模型的空间注册或人物坐姿自然。 Reference: Single-page official dossier, printed p012; https://young.dpm.org.cn/info/305 independently repeats seat and footstool heights.

## Remaining gates

1. User C1 visual confirmation of the character samples is still required; this report does not grant it.
2. Review the current actual-throne and kang images for natural pose, cloth/armrest clearance and visual hierarchy. Contact readiness alone is not approval.
3. Cold/reload preparation must be kept out of a visible frame or incrementally bounded before calling the integrated runtime performance-ready.
4. Real-device/GPU frame rate, draw-call and memory verification belongs to runtime integration acceptance, not this CPU adapter report.
5. A formal ceremony excerpt, crossing-door routes, cross-zone patrols and named historical individuals remain deferred; none is silently represented as complete.
6. Complete the selected-period hairstyle image evidence and match it to the actual consort/maid geometry; the current H4 forum text alone is not sufficient.
