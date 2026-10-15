# V5 three-hall waist stairs: bounded engineering evidence

Date: 2026-10-14. Isolated V5 work from published V4 `c602b1d88d4d4edc96b740202ff76fe0eb53e75c`. This card covers the new common-terrace side access and its Node preflight. Browser, visual, keyboard and original six-camera performance acceptance remain separate release gates.

## What the sources establish

- 于倬云,《故宫三大殿》,1960, 插图一“三大殿平面图”: [official scaled plan](https://img.dpm.org.cn/Uploads/File/pdf/c7/92/ed/c792eddcdca8356377637b90520bce08.pdf).
- 孙大章,《清代的紫禁城：清代帝王对皇城的复建与改造》,《紫禁城》2020年第10期, printed p.55: [official publication](https://img.dpm.org.cn/Uploads/File/2020/10/23/u5f9255173a228.pdf).

These support east/west waist stair connections south of Zhonghe, approximately8m from its drawn outer-envelope centre. Independent registration from Taihe is approximately60m; registration from Zhonghe is approximately57m. Their roughly3m disagreement is retained. The drawn outer ink envelope is approximately5–6m wide.

The implementation adopts **z58m and outside width5m provisionally**, with non-statistical engineering envelopes of±3m coordinate and±1m outside width. Neither is a surveyed coordinate or a measured clear stair width. Tier elevations, run, riser count and cheeks remain inherited engineering approximations. Current visitor permission is unknown. Source images/PDFs/crops are research-only and are not runtime assets.

## Single physical contract

`ThreeHallTerrace.js` derives all six flights from the current waist rectangle, existing layer height/run/setback, and unchanged Zhonghe anchor. `PalaceBuilder.buildComplex` passes this only to the common three-hall terrace. The inner-palace terrace retains its existing behavior.

Bottom-to-top heights remain0,8/3,16/3,8m. Runs remain64/15m. Absolute heads remain27.433333…,21.966666…,16.5m; toes31.7,26.233333…,20.766666…m. Each of the two intervening landings remains1.2m. East is−X; west is+X. The shared opening is z55.5…60.5m;0.45m cheeks leave ramp width4.1m and a radius0.5m player-centre interval z56.45…59.55m.

Mesh, matching wall/rail splits, ramp bounds, metadata and QA route points consume that same contract. Six existing wall colliders and six rails are split only at the waist openings. All existing terrace body faces, positions, normals and UVs are retained. There is no optional46-face terrace-body optimization.

Each flight is one closed17-tread mesh, plus two solid cheeks. The staircase cross-section is triangulated on an exact integer grid before scaling to metres; direct floating-point Earcut produced collinear cap slivers and was rejected by the manifold test. The final mesh has72 welded vertices,210 edges and140 nondegenerate triangles, Euler characteristic2, opposite paired edge winding, outward normals and metric UVs.

The existing stair convention puts the highest of17 tread tops one inherited rise/18 below the tier (approximately0.148m). **The retained solid terrace masonry supplies the last head riser up to y1.** The stair rear closure is at the same xEdge, and the masonry continues from y0 through y1. It is not an open head hidden by the walking ramp. Dedicated front-face rays hit this final masonry riser for every flight, before and after material batching. The existing slab interface remains unchanged.

## Exact constructor counts

- Closed tread surfaces:6×140=840 base triangles
- Solid cheeks:6×24=144 base triangles
- Split rails: net+72 base triangles
- Total addition:+1,056 base triangles; no terrace body credits
- Collision delta:+60 boxes; walking delta:+6 x-axis ramps
- All-zone constructed collision world:11,276 colliders,346 walkables,132 ramps

The separately reviewed four-side-gate optimization saves3,174 base triangles. Combined change is−2,118 base triangles, projecting−4,236 submissions if those materials remain in both main/shadow passes. This projection is not browser acceptance. Original cameras, shadows and P2+10% budgets, including Wumen206 calls, remain binding.

## Routes and controller verification

Two new automatic round trips begin at actual ground outside the toe (x±36,z58), cross every physical toe/head and both landings, reach the upper waist, turn at x±15.5,z65, reach the unchanged Zhonghe veranda (x±10.8,z65), then return to ground. No high-platform spawn is used.

All56 old automatic identities and point sequences retain SHA-256 `0ea621a5ac5a2fb7529096c458adf20181c12f1990a58be23136e9ca66dd6bf3`. All33 fixed identities and points retain `8335e67a893a37142a7aee558f90dee879b955ccd431970c0f1575c4be33ab30`. Total automatic routes are58. The old controller driver is unchanged for those old routes.

The original0.8m early-arrival driver failed the new narrow-turn/short-contact routes in60fps walk and10fps sprint. Those failures remain diagnostic evidence. New routes explicitly opt into `physical-crossing-v1`; no Chinese-name matching selects behavior. It steers continuously through collinear contacts, observes ordered swept crossings within0.6m of each waypoint, and requires crossing its directional plane (0.01m numerical tolerance). A distant infinite-plane crossing cannot pass. Fast mode releases sprint within2m of actual corners/endpoints, and movement is released for2s at the ground endpoint. **This is sprint with corner braking, not constant-speed sprint.** No production controller, speed constant, collision or rescue rule changes.

Node actual-controller coverage:32 no-rescue round trips (two contexts×two sides×60/10Hz×walk/sprint×real W/S movement). Every route starts feet0, gets real support from all three intended ramps in both directions, reaches the8.6m veranda and returns to feet0. Observed maximum substep lift0.1562500000000009m; no unsafe/rescue support. Peak walk speed5m/s and peak sprint speed approximately12m/s; crossing error at most0.475m, below0.6m. Sprint cases recorded18…97 corner-braking frames depending on frame rate/direction. Per-frame actual speeds, foot heights, every support query and crossing error are saved in the implementation evidence.

The support recorder enumerates the actual live walkables using the production bounds, tapered-cross-section, height-limit, strictly-higher maximum and first-equal-height tie rules. It separately handles rescue precedence, verifies its selected height against the unchanged real query, and labels a flight only when the selected actual ramp matches the entire profile contract. Each sample records the selected walkable index/type. Red-first adversarial tests reject coincidental box/other-ramp heights, shifted bounds, changed taper and misleading equal-height ties. This correction supersedes the earlier expected-height-only attribution, without changing production geometry or movement.

All12 single-flight missing/shifted-ramp mutations fail acceptance with box rescue disabled. With the final physical driver, removing all six ramp records while leaving inherited box rescue enabled reproduces a naive arrival-only false positive; the support trace rejects it. Earlier failed experiments are retained and not substituted for the final result.

Negative probes retain wall blocking at z52/64/72, both cheek sides, just-outside body clearance, diagonal and cross-flight approaches. Closed geometry, all tread/riser/side/head/toe/underside rays, visible cheeks, post-batch front-face rays/UVs, ownership/disposal and rebuild checks pass. Existing square-hall, plinth, tapered-ramp, river/cross-court and route tests are retained.

## Verification status

At implementation freeze, focused new suites:71/71. Full shared-tree Node command `node --test tests/*.test.mjs tests/*.test.cjs tests/current-state/*.test.mjs`:316/316. Vite build passes with the existing large-chunk warning. These are historical implementation-stage counts. Final F de9d29fd contains329 passing Node tests and completed browser verification; see V5-ACCEPTANCE.md for the final counts, diagnostic protocol, transient airborne descent and original failed Shenwu anchor gate. Do not infer browser FPS, current visitor access or final publication from the implementation-stage Node results.

The inherited Shenwu542-versus531 mismatch remains11m; neither its position nor the5m anchor tolerance changes. R2-04 is not complete or surveyed by this narrow topology increment.
