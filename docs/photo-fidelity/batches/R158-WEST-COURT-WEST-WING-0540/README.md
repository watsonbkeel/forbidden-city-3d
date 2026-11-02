# R158 — 西所首进西配殿（有限候选）

Base `21c45d7a5f6e2ff8f357a953053cb34186ef562c` (=remote02fbbc). One new dedicated module only; no shared hook/source/data edit. Source SHA256 `d91e4f68cf560e235174ffc50e61af00319310d66ab1d7912c0348bf33caf0da`.

## Evidence and limits
- [故宫南三所](https://www.dpm.org.cn/explore/building/236452.html): each hall's east/west side halls have three bays. [官刊2020/10,p142](https://www.dpm.org.cn/Uploads/File/2020/11/12/u5facb56c07c8f.pdf): front/rear side halls inherit the non-projecting hard-gable form. Local original `r158-nansansuo-next-readonly-1718/page142.png` personally read; historical Fig25 is NOT modern survey. Official aerial4647 gives courtyard context, not this facade's measured detail.
- Target only **西所首进西配殿**, world +X is palace west, inward facade faces −X. Center(-238.6,36), three bays8.4m, depth3.6m, roofdepth4.4m, eave3.4m/ridge5.2m, rotation+PI/2 are engineering fits. Plain green/red/gray, closed opaque panels, exact facade rhythm also fit; no own facade photograph claim.
- Independent `EXPAND-04-WEST-FIRST-WEST-01`, parentFC-C640AE8651, retained hostFC-172C8CBF68. No original41 objectId, map item, room, walkable, interior furnishings or present public-access claim. No second-stage narrow-band implementation or identity reassignment.
- Roof/walls remain inside scanned X[-241,-236.2],Z[31.2,40.8],Y(.05,5.8); flush slab extends only .04m below ground. Actual existing front-roof maxX **−242.2874649**, reserve gap **1.2874649m**, superseding rough1.9m. Source wall's visible base inner edge−234.56 leaves1.64m to reserve. No wall/hall moved.

## Terminal evidence
- `/tmp/r158-west-court-west-wing-scan-0531/`: normal current source, loadAll:false, actual library, reuseInactive:true, loadedouter-east plus global scene. No collider intersections;98,988 potentially relevant visible triangles tested,0 intersecting reserve;861 radius.5 body/water samples and6 lines clear.
- `/tmp/r158-west-court-west-wing-evidence-0540/`:8 actual missing-builder RED → **8/8 component GREEN**.32 visible meshes/32 native Float32 triangle owners/672 triangles, closed positive-volume paired-edge bodies, returned UV geometry with real stone tileSize6m. Old streams intact; foreign/occupied/moved-host/duplicate before-publication rejection; normal resource disposal once. Not a claim of arbitrary late-publish atomic rollback.
- One QA-before-finish World installation, NOT production shared hook: original west front door, z28.5 forecourt and proposed exterior loop **3/3,1419 frames,peak0**, complete arrays exactly equal pre-candidate scan. Two actual closed-wall approaches reject. Every positive frame checks body and actual water. Nine old halls9; well41/middleEast32/middleWest32 complete ownerSHA unchanged. No product or route correction needed.
- Two800×450 CPU z-buffer views personally inspected. Oblique shows simple3-bay closed shell. Bounded context uses retained west front hall and exact source west wall, not a full nine-hall scene. Flat palette, **not GPU/production texture/mobile screenshot**. Initial cropped footer retained locally; final change only shortens footer, same geometry/cameras.
- Parent tracked src/data SHA equals scan. Original tests/raw/official copies stay local; pins record bytes. No author whole-app build or full-world/GPU acceptance.

## Integrator handoff
Import `buildNansansuoWestCourtWestSideHall` from `../palace/special/NansansuoWestCourtWestSideHall.js` in ZoneBase, unique call immediately after existing `buildNansansuoMiddleWestSideHall(this.kit,this.zoneJson)` and before finish. No other shared edit required.

```sh
node --test tests/r158-west-court-west-wing/component.test.mjs
NORMAL_INSTALLED=1 WING_EVIDENCE=/tmp/r158-west-court-west-wing-integrated \
WING_BASELINE=/tmp/r158-west-court-west-wing-scan-0531/scan.json \
node --test tests/r158-west-court-west-wing/world.test.mjs
```

Normal mode does NOT inject/restore CourtKit.finish; requires exactly one installed record. It hard-compares all three1419frame arrays and three ownerSHA to pre-candidate scan, keeps nine halls9 and two closed-wall rejects. Compare `routes`/`negative` to author world.json.gz. Only unique integrator owns normal hook/cumulative build/publication after Astra.
