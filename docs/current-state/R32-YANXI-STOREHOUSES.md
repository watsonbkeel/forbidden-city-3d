# R32 Yanxi: bounded 1931 storehouse facade correction

## Accepted scope and explicit limits

The three retained side/rear entities receive a two-storey red-masonry storehouse exterior, replacing the generic timber-column/lattice-screen palace facade. Yellow glazed roofs remain: the museum explicitly documents them. This is a **building-type correction within inherited envelopes**, not acceptance of the whole modern courtyard layout.

The central Lingzhao ruin module and its historical place card are unchanged. No global materials, UI, `main.js`, Qianqing, PalaceBuilder, flight code, or historical source guards are changed by this patch.

| `east-six.json` row | Profile / physical identity | Retained anchor | Retained local body / orientation |
|---|---|---|---|
| 31 | North 1931 storehouse | x=-148.2, z=341.6 | 24×9.6, south |
| 32 | East 1931 storehouse | x=-164.68, z=313.7 | 11.2×7.04, west |
| 33 | West 1931 storehouse | x=-131.72, z=313.7 | 11.2×7.04, east |

Project east is −X; north is +Z. Original `pad`, `ph`, `colH`, roof profile and rotation remain exact. Full actual mesh bounds also remain equal to the pre-change buildings, including the retained roof and plinth.

**Unclosed:** both inherited side bodies end at z=319.3, south of the ruin centre z=324.9. Official photographs and the functional diagram show longer wings extending north alongside the ruin. This patch does not extend, relocate or delete them. Exact wing lengths, north-building footprint, corner connectors, roof subtype, window count, sill/floor heights and present entrance locations remain unmeasured. The three/seven facade divisions follow inherited game bays, not a documented count. `currentConditionAccepted` remains false.

## Official evidence, visually inspected before implementation

| Source | Finding and limitation |
|---|---|
| [Palace Museum, 延禧宫文物库房](https://www.dpm.org.cn/lemmas/240806.html) | 1931 construction, two-storey reinforced-concrete structure, traditional palace-like exterior, yellow glazed tiles. Establishes type, not these model dimensions. |
| [Palace Museum publication, January 2006, printed p97](https://www.dpm.org.cn/Uploads/pdf/4881/T00097_00.pdf) | Text places the new storehouses north/east/west. Lower-right diagram places research premises north, ancient painting/calligraphy exhibition east and ceramics exhibition west. It is a functional schematic, **not a measured plan**. The colour photograph shows two rows of rectangular windows in red masonry. Historical functions are not claimed as current 2026 occupancy. |
| [故宫博物院全面排比淳化阁帖记述, fig3](https://www.dpm.org.cn/research_talk/256929.html), [image](https://img.dpm.org.cn/Uploads/Picture/2021/11/19/s619709ebebab5.jpg) | Caption explicitly identifies the east building. The image looks along its courtyard-facing west facade toward the north building's south facade. Both show two window rows, pale surrounds and security grilles. It is an archival photograph, not a present-condition survey. |
| [延禧宫 building page](https://www.dpm.org.cn/explore/building/236535.html), [official colour photograph](https://img.dpm.org.cn/Uploads/Picture/2020/07/03/s5efefedcac36c.jpg) | View from south toward north: east wing on image right, west on image left. Red solid walls, yellow roofs, barred upper openings and pale closed lower panels are visible. Lower panels are therefore not copied as exposed grilles from the archival photograph. The photo date is unmarked; its URL upload directory is 2020, not proof of a 2026 site inspection. |

The previously used 2013 Lingzhao metal-conservation paper does not contain a storehouse measured plan. No dimensions are derived from it. Research images are not redistributed or embedded as project textures.

Inspected-reference SHA-256:

- Printed p97 PDF: `6a9dbec82a532ceeba00a333baf236b8bd7b3746f9776457aa6cb4669fb00d1c`
- Archival fig3 image: `c48cf591bec23fdf534234d07c6d8b58056a2d6f6800e514626864768d260e79`
- Official colour image: `542acafe74c6d0a924f90e6c5d314e633e4dc0b12838879a1c3c06594a9f5a98`

## Geometry and navigation contract

`YanxiStorehouses.js` validates one of three explicit frozen profiles before mutating the kit. `ZoneBase.buildHall` dispatches `structure: 'yanxi-storehouse'` or a present `storehouseProfile`; malformed profiles cannot fall through to an ordinary palace.

The module is a deliberately bounded compatibility adapter. It constructs the retained hall once, then removes all direct generic wood-column, lattice-door, painted-beam and old wall meshes. Shared removed geometry is disposed once. It builds continuous red masonry, pale window surrounds, upper iron bars and lower closed panels, plus a plain soffit. The retained roof is not duplicated. Three kit-owned materials are shared across these three buildings; the shared red-wall texture uses the library's four-metre tile scale.

The old central doorway remains a true visible opening. Its location and opening are **gameplay compatibility**, not evidence of current museum access. Existing roof, plinth, interior furniture, floor support, room records and all pedestrian collision boxes remain. Internal furniture/room arrangement is not source-validated; no upper floor route or historic storehouse collection display is invented. No generic throne was added. Configuration names and `enter` fields remain absent exactly as before.

Flight extraction needs no new exception: `createPalaceFlightEnvelope` reads the actual merged zone triangles, including when the zone is only in the prebuilt collection. The new visible walls and bars are therefore included independently of the unchanged low pedestrian COL boxes.

## Actual cost and checks

| Scope | Before | After | Difference |
|---|---:|---:|---:|
| Three buildings: triangles | 4,848 | 5,934 | +1,086 |
| Three buildings: pre-merge meshes | 121 | 305 | +184 |
| Three buildings: distinct used materials | 15 | 16 | +1 |
| Three buildings: COL / WALK / rooms | 71 / 3 / 3 | 71 / 3 / 3 | 0 |
| Entire east-six zone: triangles | 78,936 | 80,022 | +1,086 |
| Entire east-six zone: merged material buckets | 24 | 27 | +3 |
| Entire east-six zone: COL / WALK / rooms | 1,441 / 38 / 30 | 1,441 / 38 / 30 | 0 |

The whole-zone material increment is three because the other east-six buildings still use the generic materials removed from these three facades. Hard focused caps: **6,100 total triangles, at most 1,200 added triangles, at most three added materials**.

Test-first: eight tests failed before the module/dispatch existed. A review then identified the red-wall UV scale mismatch; the added four-metre UV test failed before its correction. Final dedicated suite: 9/9. Combined with the ruin, ruin integration and existing flight-envelope tests: 33/33.

Real-geometry coverage includes two distinct window rows, barred versus closed panels, true central door rays, post-merge rays specifically hitting iron rather than the backing wall, complete old/new COL/WALK/room equality, sampled real collision equivalence, exact visible bounds, actual flight triangle extraction, finite geometry, cost caps, pre-removal geometry disposal, shared-resource lifetime, and UV scale. Vite production build passed; the existing large-chunk warning remains.

Two separately built collision worlds generated byte-identical `buildAutoRoutes` output before/after this patch: **61 descriptors, 24,377 bytes**, SHA-256 `afb505e786d348be8800d62099ef360bfb29c6a1603dd56f91490d1e57505e7f`. This was descriptor comparison, not another browser route run.

One current-state suite run during parallel integration reported **1,021 passed / 14 failed**. Failures included frozen source identities (`ZoneBase`, `main.js`, `QianqingDisplay`), historical route descriptors, current card bindings and other source-dependent geometry guards. The full output is retained at `/tmp/yanxi-storehouses-current-state.log`; the integration owner is updating the exact registry and will own the final combined run. This patch does not relax or modify those guards and does not claim a green whole-project suite.

No browser run, Git write, upload or deployment was performed. Integrated visual acceptance and final source-registry checks remain with the owner.
