# Verification — bounded candidate, no shared hook installed

## Terminal evidence

**118 / 118 pass**, zero failure/skip/cancel. Command:

`node --test --test-concurrency=1 tests/r158-nansansuo-front*.test.mjs tests/r59-nansansuo-inventory.test.mjs tests/r59-nansansuo-inventory-controller.test.mjs tests/r59-nansansuo-inventory-world-consumer.test.mjs`

58 new tests: 9 builder tests, 24 actual FirstPerson door/step round trips (three halls × 10/60 Hz × W/S × walk/sprint), 18 high-drop then walk-away cases, 1 normal full outer-east build with the finalizer inserted only at kit.finish boundary, and 6 terminal-adapter identity/source/resource cases. The new normal-entry test injects its terminal shim only when the source has no installed terminal call; once installed, it uses the ordinary entry without injection/fallback, so double application cannot invalidate cumulative tests or conceal a missing result. Existing 60 inventory tests remain unchanged and green; historical direct buildHall fixtures are not rewritten.

The normal-build test uses existing production `realTextureLibrary` APIs (inert offline textures, real tile-size/aspect/material APIs) because the first abbreviated-library run correctly failed Wenyuan's strict geometry/UV source guard. That failure was diagnosed in the test fixture; NO shared guard or renderer was relaxed. Final pass preserves the three rear-shell complete geometry attributes, all room records, all supports and map registrations, gate width14.8 and one common-gate record, and checks three door/step paths with the complete zone collision set.

RED observed: missing builder, missing terminal adapter, and shared-source-buffer negative. Adapter certifies actual complete legacy mesh/material streams against the exact current baseline+augmentation, then binds each of the actual 20 unique collider references. It never removes nearest/name-only geometry. It stages all three candidates before replacing anything. It transfers the original 11 low meshes per hall, original platform collider, and preserves the actual original room/walkable/map/region references. Upper geometry and unsupported template nameboards alone are replaced. Late commit rollback keeps original graph and resources alive. External shared attribute storage rejects before mutation.

Terminal geometry/material attributes are **exactly equivalent** to the separately rendered/controller-tested builder (explicit test), including original low geometry; moving original low objects does not change the rendered surface. Each new hall: 1662 triangles, 7 merged materials, 25 colliders (1 original low platform +24 actual upper triangle owners), 2 original walkables, 1 original UNKNOWN room. Three halls add15 colliders in total, preserve all support/room arrays, and own9 private materials. No new textures or shared material mutation.

`node --check` for both modules/script and proposed patch `git apply --check`: exit0. Shared ZoneBase/kit/physics/declarations remain untouched. Final cumulative ordinary entry/build smoke still belongs to the single integrator; this isolation test is not a full installed World/browser claim.

## Private artifacts

Private root `/workspace/scratch/02a8023d1a85/r158-nansansuo-fronts-evidence-1723/`. These hashes identify raw evidence; logs/reports and original official pixels are not part of this small candidate package.

| file | SHA256 |
|---|---|
| `red.log` | `0a42f687db76ba3fea79740894240bd527ce2bdabad6666f1d1162e6c0c4988f` |
| `finalizer-red.log` | `18b78d0ee79ab5e83bcc42e493019f5ebeb361bf87ac8983743d94275cb30dce` |
| `finalizer-shared-red.log` | `c466151b5dea19c7cb6cbdc103dd07cea05777514fad11cd86308597e5d14dee` |
| `all-final-compat.log` | `21a534582b13175b9ca50c1ff6cd72c69556768aee5f1500da0509c0e5b86aeb` |
| `controller.json` | `6e24682469005ec01298b189a722e3d76a3958058a6f715ecc61c8bfb590f2a2` |
| `cpu/proof.json` | `0d214f40cda358ccbffa2e437a3c6867307806bbb04da038cf2c17d99b746249` |

## Runtime freeze

- `src/scene/palace/special/NansansuoFrontHalls.js`: `3dff6bafef6f0a9a753801085d83d0628f51daf928b821404478c222b73a4561`
- `src/scene/palace/special/NansansuoFrontFinalizer.js`: `ab6201711e99dabe28abe0efb8350021d7446d6f158c648108b0b9ee93018124`
