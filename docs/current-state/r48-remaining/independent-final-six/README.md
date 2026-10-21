# R48 final-six independent bounded review

Product: `bd94eabf599f2ccd467da5234cef6e62d2e71b61`.
Test/document integration base: `27b1be353b680d385d79674cacc97887f45836ab`, independently checked to have no `src/`, `data/`, or `public/` difference from the product pin.
Previous-scene comparator: independent clone of `d8fdbdae48b7d7f2b6e05e23cf52d06d86714bd9`, immediately before final-six integration. No production changes or push were made by this review.

## Result and scope

- New default checks: **71/71**, zero failures/skips. Two test files, not a whole-repository aggregate.
- Existing bounded consumer/route-contract checks independently rerun: **30/30**. The same current consumer test on the independent old scene is **2/24 pass, 22 fail**, exit 1. Arrival-only success is not used as a body-clearance verdict.
- All 27 outer identities are built with the **real `TextureLibrary` implementation**, then compared as raw geometry and the **actual returned `CourtKit.finish()` Group**. Exactly the six final identities change; the preceding 21 retain identical geometry/material-property signatures, navigation, metadata, and resource outcomes against the previous-scene comparator. This is a pre-final-six retention statement, not a claim that those 21 were unchanged throughout R48.
- No new degenerate triangle was added by the six. Four pre-existing generic gable fan degenerates remain in each of 本仁、集义、凝道、焕章. 主敬 and 恒寿 have zero in this capture. This legacy boundary is not hidden as all-triangle perfection.
- Both paired halls have actual closed, consistently wound FrontSide roof/underboard shells, exposed framing visible from the accessible front aisle, and physical column/beam/post/purlin triangle contacts. This tests geometry, not metadata names alone.
- Dense static scan: 17,174 plateau sample points, 10,674 collision-free candidates, zero collision-free raw/finished body intersections. 恒寿's 1,080 points are all blocked: its unknown interior remains closed, not a successful walk-through.
- Seven selected paths × 10/60 Hz × walk/run × actual forward/backward controls give **56 full-world physical modes**, **44,180 frames**, and **58,648 accepted collision-candidate substeps**. All arrived, no rescue. All actual successful rises are at most **0.50 m**, within production STEP_UP 0.6 m.

The paths are current auto consumers for 文华 and 主敬, current fixed 协和门→文华门→文华殿内, and independent ground-entry / both-end aisle / rear-cabinet-approach / return loops for 本仁、集义、凝道、焕章. They are a bounded route set, not every possible route or all 96 consumers' body sweeps.

## Real-library, finish, and body methodology

`r48-final-six-independent-capture.mjs` constructs the actual production `TextureLibrary`, loads the production manifest into its normal APIs, and preloads inert texture objects with manifest dimensions and normal-map presence. It does not replace `material()`, cache ownership, names, parameters, tile-size or aspect APIs. A fake canvas/event surface permits CPU execution only. Shared materials/textures must not be prematurely disposed during finish or kit disposal, and must be disposed exactly once by the library.

The world-body test obtains the production collision world, including all zones, PalaceBuilder, Enclosure, GardenBuilder, water and boundary checks. It separately builds **actual finished zone Groups**, and verifies their registered colliders/walkables equal the collision world's zone entries. It inspects their triangles plus the actual retained static scene; inherited visibility and InstancedMesh transforms are respected.

The sampled scene has 593 mesh nodes and 749,648 triangles intersecting the `.3–6 m` vertical broadphase. Every candidate/frame is asserted to have its complete tested body in that band. Observed candidate ground is 0–2.62 m, so the maximum body top is 4.32 m. All spatially relevant triangles are enumerated, with **no per-frame hit truncation**. The controller radius is the production 0.5 m; triangle tangency uses a 1 mm horizontal/lower tolerance (`.499`, feet + `.351`) and a full 1.7 m eye top, not the collision manager's shorter top trim.

Physical-ground bodies and every successful candidate's own `feetIn`, selected height, STEP_UP and rise are checked. Smoothed camera feet can lag on stairs and are not silently substituted for the physics body. This does not create a general exemption for low furniture.

## Exact contact attribution, not a low-object exemption

Every contact must be one of the following **exact world-space triangles** (1 mm vertex tolerance), and its top must be no more than that sample's physical ground + 0.6 m:

1. **ORIGINAL_KIT_STEPS_TREAD_NOT_SIDE_BAND**: original 文华门 / 文华殿 tread creation calls only, not side bands.
2. **ORIGINAL_GENERIC_SINGLE_LOW_PLATFORM_BASE / CAP**: the exact original generic single platforms beneath 本仁、集义、凝道、焕章.
3. **SOURCE_BASED_FITTED_LOW_ARCHITECTURAL_THRESHOLD**: the two new source-based thin strips, explicitly **not old geometry**. Each actual raw node is checked against its own w22/w07 entrance source, fit/unknown-photography metadata, 2.5 cm height, 14 cm depth and actual 0.45–0.475 m world height. Each footprint is contained in and physically intersects its retained platform cap; all four inset corners have actual 0.45 m ground support.

The old support fixture was captured from original source creation calls in the independent old clone, without selecting from current contacts, material names, all low geometry, or furniture. It contains 54 nodes / 648 triangles, protected by a frozen SHA and source-file hashes. New thresholds are separately generated and verified at runtime. A negative control rejects a translated low lookalike.

Observed frame+candidate triangle-contact occurrences: 300 original stair tread, 772 original platform base, 1,784 original platform cap, and 168 new threshold. There are 51 distinct contacted triangles. All are explicitly classified; no cabinet, glass, leaf, circular display or other furniture is exempted.

Earlier exploratory diagnostics first capped at four hits per frame, then removed that cap. The retained `world-before` / `world-probe` archives enumerate all hits but still use the earlier `.3–4 m` band and assert arrival only. They are **not body acceptance evidence**, and cannot certify the high 协和门 portion. A later coverage assertion detected that gap. The current acceptance expands to `.3–6 m`, validates the entire body range, and supplies the exact source/support rules above. Historical diagnostics are not relabeled green acceptance.

## Own-source / target-period review

Original local source images were independently viewed, not inferred from similar buildings. `source-images-reviewed.json` records SHA-256 values of the actual viewed originals. Official links and original tile manifests are in [outer-evidence-remaining.md](../outer-evidence-remaining.md); precise current side records are in [current-70-status.json](../current-70-status.json).

- **主敬**: own `a075` upward/front panorama shows a dark coffered ceiling, modern suspended tracks/light equipment and a narrow modern hanging label. Darkness does not prove a calibrated ceiling palette. Target is the documented 2026 first-period source, not an unverified later second-period inventory. Exterior retained; interior local change. No ancient plaque is inferred from the modern label.
- **本仁**: own right-face 2022-exhibition-era panorama has substantial tree obstruction. Five bays remain the existing envelope fit, not a photograph-proven count. Exterior local change; interior evidence-blocked.
- **集义**: own left-face panorama supports the central doorway and four flanking window groups, red woodwork and plinth organization. The c.1916 exhibition photograph is historical, not evidence of current modern furnishings. Exterior local change; interior evidence-blocked.
- **恒寿**: own labeled 2007 plan and the cited paper's gable/燕尾枋 discussion support a bounded hard-gable exterior treatment. Modern doors/windows and interior remain unknown; the separate 燕尾枋 detail is not claimed modeled. Exterior local change; interior evidence-blocked and closed.
- **凝道 / 焕章**: each hall's own 2021 ceramic-gallery panorama was checked independently, including exposed blue-green framing and modern cabinet/end-display differences. The entrance source shows modern glazing, blinds/radiator, and a low strip/mat. w04/w13 and w18/w25 end themes are modern exhibition constructions, not historical permanent royal rooms. Absolute end direction and unmeasured counts/dimensions remain fits; artifacts, printed backdrop imagery and exact collection inventory are not fabricated. Both sides locally changed.

The ledger remains **70 identities classified, 63 with at least one actual changed side, seven retained overall**. Exterior 57 actual / 13 retained; interior 50 actual / 8 retained / 12 evidence-blocked. Every full exterior/interior acceptance flag remains false. These numbers are classifications and local changes, **not 70 complete restorations**.

## Navigation retention boundaries

The independently rerun existing contracts verify all 63 R47 route names and exact unaffected objects: **48 unchanged / 15 scoped changed**. Relative to the immediate pre-final-six fixture, **61/63 auto objects** are exact, with only the explicitly specified 12 coordinate replacements in the 文华/主敬 pair. Fixed routes retain **32/33** objects at that immediate boundary (two 文华 turn points); the earlier leaf-turn fixture retains **31/33** (four points across 武英/文华). The 24 body regressions cover actual leaf/display avoidance; route-name retention or arrival alone is insufficient.

## Reproduction and non-writing contract

Default added acceptance:

```sh
node --test tests/r48-final-six-independent.test.mjs tests/r48-final-six-independent-world-body.test.mjs
```

Optional world report (never a default fixture rewrite):

```sh
R48_FINAL_SIX_REPORT=/tmp/r48-world-body.json node --test tests/r48-final-six-independent-world-body.test.mjs
```

Existing bounded contracts:

```sh
node --test tests/r48-final-six-consumer-body.test.mjs tests/r48-final-six-route-retention.test.mjs tests/r48-auto-route-consumer-contract.test.mjs tests/r48-fixed-route-leaf-turn.test.mjs
```

For the executable old-scene red, make a separate clone at `d8fdbdae48b7d7f2b6e05e23cf52d06d86714bd9`, copy `tests/r48-final-six-consumer-body.test.mjs` from the product pin into that clone, and run it there. Do not rewrite the old scene. The captured result is 2 pass / 22 fail, exit 1. Running that test against the product pin is 24/24.

The capture helpers accept explicit output paths; test execution creates temporary captures outside the repository and removes them. The historical world helper writes only when `PROBE_OUTPUT` is explicitly set. Default-readonly receipt and its full hash inventory demonstrate zero changed/added files in the checked input tree during the 71-test default run.

Large diagnostic/result JSON and TAP files are losslessly gzip archived. `archive-index.json` records original and compressed byte counts/hashes and decompression verification. Default tests require only the small immutable `before.json` and `inherited-step-triangles.json`, not any large report archive, external images, private path, network access, or old Git object.

## Not established

No decoded texture-pixel / WebGL / screenshot / GPU / native-phone acceptance is claimed. CPU inert texture data cannot establish final color, lighting, transparency sorting or shader appearance. Asynchronous external GLB payloads are outside this generated-scene body test. No new full-project aggregate, production build, published deployment or all-route free-roaming guarantee was run by this reviewer. Owner's unified frozen aggregate and the separately tracked visual limitations remain authoritative for those scopes.
