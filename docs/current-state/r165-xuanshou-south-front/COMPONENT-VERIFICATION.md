# K19 Xuanshou south-front component evidence

## Scope and sources

This is one independent, additive K19 exterior based on public commit `ad0f3086e32d8f101bb29c1a7a7b04fc441861ab`. It does not rename either central Shouan hall, reconstruct the whole historic compound, establish current public admission, or complete the original 397-object register.

- Original object: K19, ordinal384, `FC-73284DA281`, 萱寿堂.
- [Official captioned exterior](https://img.dpm.org.cn/Uploads/Picture/dc/4669%5B1024%5D.jpg): shaded three-bay south front, timber/window zones, grey terrace, short central steps and sloping stone sides, painted beam, local yellow eave. Trees obscure most of the roof crown.
- [Palace Museum 2025 paper](https://www.dpm.org.cn/Uploads/file/2025/03/12/1741766129CHfuBqmGf260.pdf), printed page55, figure10: rear north-west location and south-facing veranda. It does not support an east/west-facing pair.
- Every world position, metric dimension, porch depth, lattice division, step count, roof curve/thickness, grey roof field and hidden closure is a reversible model fit. Full roof taxonomy and exact full-roof palette remain unknown.
- `wholeObjectAccepted=false`, `surveyed=false`, `currentAdmissionVerified=false`, `fullRoofPhotoVerified=false`.

## Implemented boundary

One private builder plus an exact import and hook143 after the existing Xuhui hook142. No CourtKit, RoofBuilder, player, physics, source data, existing item or library material changes. The new exterior has no room, map target, interior teleport, fabricated architectural plaque, furniture or historic paving.

The body fit is8.4×5.4m at(290.4,444.3). The entire new assembly and its contacts are restricted to x284.8–296.0/z439.8–448.2. Actual final world bounds are x285.70000019073484–295.0999998092651/z439.8001–447.55, maxY6.224999904632568. The south stair end is inset0.1mm to keep Float32 collider triangles inside the reserve; the boundary was not relaxed.

Actual final new cost:110 meshes,5,936 triangles,9 private materials,110 colliders,4 non-rescue stone-top walkables. Zero new rooms/maps/regions/plaques. These are component counts, not a claim that region or device performance improved.

The retained real five-record compound fixture contains6 root children,554 meshes/60,214 triangles,197 colliders,14 walkables,2 rooms,3 map items,2 regions and2 plaques. Full original typed geometry attributes, transforms, material name/color/side values and associated records are frozen from public ad0; new work preserves their identity and exact snapshot. Real old-vertex/contact mutation negatives prove this check still detects unrelated drift. New and retained component AABBs are disjoint.

## Executed checks

```sh
node --test --test-concurrency=1 tests/r165-xuanshou-south-front/*.test.mjs tests/r165-xuhui-gallery/source.test.mjs tests/r165-chongjing-allocation/source.test.mjs
```

Final local result:24 tests,24 passed,0 failed/skip,15.906s. This comprises18 new cases in7 unique test files plus6 inherited source-guard cases; repeated diagnostic runs are not extra coverage or formal cumulative totals.

Checks include:

- Exact host records, wrong-zone behavior, missing/duplicated/drifted/transformed host and duplicate build rejection.
- Every actual mesh/collider within the reserve; closed positive-volume solids with opposed edge incidences; actual yellow-edge first hits, continuously visible fitted tile rows and roof/bearing intersections. Real dropped-row, uncovered-edge and bearing-gap mutations fail the same ray checks.
- Three physical stone risers, terrace and true sloping cheek triangles, with no invisible ramp. Full painted-beam vertical UV band.
- One real controller through stairs, porch turn and return at10/60Hz in walk/sprint-flag/backward modes, plus retained compound bypass and actual closed-front stopping. The shared route runner slows to walking within2m of turns/endpoints, so this does not prove full-speed running across the short staircase. Individual tread support and the removed-first-tread negative use static ground-height queries; the negative does not replay a controller.
- Every actual geometry-attribute/copy failure point, material failures and publication failures clean up privately owned resources once, preserve the old host and allow retry. Borrowed textures/normal textures remain external.
- Actual material merge preserves every vertex multiplicity/triangle; construction reference release and repeated unload preserve ownership. Component flight envelope covers every actual merged vertex.
- Public runtime/data source bytes remain identical except the two exact declared K19 runtime files. The new source normalizer accepts only byte-hashed before/after versions; historical Xuhui/Chongjing checks retain unknown-drift negatives and original fixture/hash assertions.

RED evidence preceded implementation. Detected defects included out-of-reserve Float32 cheek coordinates, ownership before failed geometry/material copies, insufficient real-controller porch clearance, collapsed painted-beam UV and tile-row end-cap winding. Each was corrected without changing the retained host or expanding the reserve. The fitted closed façade moved0.4m north, to443.3, while the front columns remain441.6; this is an explicit unmeasured porch-depth fit.

## Complete outer-west follow-up

Independent component review reran24/24 with no runtime blocker. The wording above distinguishes the component material snapshot's name/color/side fields, sprint-flag route behavior, and static missing-tread query.

Two serial actual outer-west runs compared the exact public-ad0 ZoneBase source fixture with the unmodified current production hook, using production TextureLibrary names/manifest dimensions with inert CPU pixels. Only the baseline loader substitutes the byte-verified public-ad0 ZoneBase; all other old runtime/data bytes are proven unchanged by the source guards. The current run uses no source loader. A finish wrapper observes raw state then invokes the original material merge.

Both actual runs passed1/1. All24,088 old raw meshes/757,145 triangles and409 old merged meshes preserve exact geometry hashes. All8,257 old colliders retain the complete120,086,878-byte canonical JSON token-sequence digest; the largest token is1,922,116bytes. The existing reviewed test-only streaming helper is used without dropping fields. This run does not separately repeat its optional absolute-index native oracle. All336 old walkables,32 rooms,36 map items and50 architecture records remain exact. Only the110 new colliders,4 stone walkables and1 architecture record are added. Current final merged cost is418meshes/763,081triangles.

Every new actual collider/render AABB is disjoint from every retained outer-west collider/render AABB.10/60Hz retained outside-observation return routes retain identical complete-frame hashes; new same-controller stair/porch/return routes arrive on the .6m terrace and return to ground. These are sprint-flag routes with the same turn/endpoint slowdown noted above, not a full-speed stair test or World-wide route claim.

Actual-run flags: `--expose-gc --max-old-space-size=1024 --max-semi-space-size=16 --test --test-concurrency=1`. Baseline/current test durations are6.567s/6.625s; maxRSS754,648/778,596KiB. These record test-execution boundaries, not browser performance or a production memory fix.

The two existing `tests/r48-zone-flight-envelope.test.mjs` outer-west cases were selected and run separately,1/1 each: mock library6.237s and production TextureLibrary5.739s. They cover finite complete merged geometry and every actual vertex within the flight envelope. This is not the ten-case full R48 suite.

All21 inherited `source.test.mjs` files from the public338-file bounded list pass44/44 in35.710s. An earlier43/44 run failed only because the sparse workspace lacked the unchanged tracked STEP-MAP.json dependency; it is retained as an incomplete-fixture result. Restoring those exact HEAD bytes resolves it without source/fixture/constant/assertion changes. This selected source subset is not a complete cumulative test result and overlaps6 earlier focused cases.

Schema `node tests/zone-lint.cjs --no-geo`:0errors/9known warnings. `node tests/anchor-check.cjs`:114 comparisons, the unchanged known Shenwumen11m deviation, exit1. No tolerances were relaxed; the anchor tool does not inspect this newly added runtime-only K19 fit.

## Visual and delivery limits

Final flat depth-tested CPU views cover the south front, underside/steps and actual retained central rear hall/walls. They use the compound fixture's mock library, so they do not establish live texture, GPU, browser, mobile or full photographic acceptance. The final render-row digest is `e54d236ee2b16ef3a6f60a63d1b96c3cb40becb420f533bed03cc1f6ae0c51df`.

Cumulative integration (including the separate Guhua candidate), full formal test list, production build, all-file HTTP and remote readback remain outstanding. Independent component review, actual complete outer-west and the selected inherited/schema/anchor checks above are completed. This local component evidence is not a main-mergeable or deployed release claim. No main/Pages/account/credential changes or upload occurred.
