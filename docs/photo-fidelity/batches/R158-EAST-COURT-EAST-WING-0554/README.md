# R158 — 东所首进外东配殿（有限候选）

Base `c191e1a4212f8ffbc26a26ff5ae012e9a1aa1006` (=remotec0b58c2b). One dedicated module only; no shared hook/source/data change. Source SHA256 `8c087216aacc4320504eb12b3ea90b378f2783cf01b4ef86bed04c6907746424`.

## Evidence / engineering fit
- [故宫南三所](https://www.dpm.org.cn/explore/building/236452.html) supports three-bay east/west side halls before the main halls. [官刊2020/10,p142](https://www.dpm.org.cn/Uploads/File/2020/11/12/u5facb56c07c8f.pdf) supports the front/rear side halls' non-projecting hard-gable form. Local142page personally read; historicalFig25 and older aerial4647 are NOT a modern measured plan or own facade photograph.
- **东所首进外东配殿**: world−X is palace east, inward facade faces+X. Center(-330.7,36),8.4m three-bay width,3.6mdepth,4.4mroofdepth,eave3.4m/ridge5.2m,rotation−PI/2 are independently placed engineering fits. Plain green/red/gray and opaque closed front panels also fits. No claim of identical observed east/west facades, fine carving or exact current colours/windows.
- Ancillary`EXPAND-04-EAST-FIRST-EAST-01`,parentFC-C640AE8651,hostFC-2E6207278C. No original41objectId,map,room,walkable,furniture,interior admission or complete courtyard claim. Middle second-stage narrow candidate remains stopped.
- Roof/walls bounded by X[-333.1,-328.3],Z[31.2,40.8],Y(.05,5.8); flush slab only.04m below ground. NormalWorld independently measured eastern front roof minX **−326.912535095** (reserve gap **1.387464905m**) and actual visible wall-base maxX **−334.440002441** (gap **1.340002441m**). These replace source-only estimates; no old wall, roof or portal moved.

## Terminal checks and limitations
- `/tmp/r158-east-court-east-wing-scan-0552/`: normalc191 source,loadAll:false,reuseInactive:true,actual texture library,loadedouter-east plus global scene.0 old collider or visible triangle overlap;96,816 relevant visible triangles tested,861 radius.5 body/water samples and6 lines clear.
- `/tmp/r158-east-court-east-wing-evidence-0554/`: **8 true missing-builder RED →8/8 GREEN**. RED diagnostic text mistakenly said west, but imported target was always new EastCourtEast builder; finalQA changes only that label, captured executed variant retained. No product fix or assertion/route relaxation.
-32 visible meshes/32 actual Float32 triangle owners/672 triangles. Per-mesh closed positive-volume paired edges,6m real stoneUV using returned GeometryUV geometry; old source streams intact; foreign/occupied/moved-host/duplicate rejection before publication; normal private-material disposal once, borrowedstone retained. Not claiming arbitrary late-publish atomic rollback or every retained owner geometrically re-certified by runtime guards.
- One **QA-before-finish injection** World, NOT production hook: eastern gate-axis roundtrip,z28.5transverse and candidate exterior loop **3/3,1413frames,peak0**, complete arrays equal pre-candidate baseline.2 closed-wall approaches reject. Every positive frame checks actual body and water. Nine old halls9; well41/middleEast32/middleWest32/westCourtWest32 complete ownerSHA unchanged.
-2 small CPU z-buffer images personally inspected, using real component geometry. Context includes old east front hall and exact source east perimeter; not a full nine-hall courtyard. Flat material colours, **not GPU/production texture/mobile acceptance**. No author full-app build or global route claim. Parent tracked src/data SHA unchanged; raw logs/frames/official copies remain local and pinned.

## Unique integrator handoff
Import`buildNansansuoEastCourtEastSideHall` from`../palace/special/NansansuoEastCourtEastSideHall.js`; call once after existing`buildNansansuoWestCourtWestSideHall(this.kit,this.zoneJson)` and before finish. No other shared changes needed.

```sh
node --test tests/r158-east-court-east-wing/component.test.mjs
NORMAL_INSTALLED=1 WING_EVIDENCE=/tmp/r158-east-court-east-wing-integrated \
WING_BASELINE=/tmp/r158-east-court-east-wing-scan-0552/scan.json \
node --test tests/r158-east-court-east-wing/world.test.mjs
```
Normal mode does NOT inject/restore finish. It requires one installed record, exact3 baseline arrays/four ownerSHA, nine halls9 and2rejects. Compare final`routes`/`negative` with author`world.json.gz`. Astra then unique integrator owns normal hook/build/publication.
