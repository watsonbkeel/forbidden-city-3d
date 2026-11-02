# R158 — 西所首进内东配殿（有限候选）

Base `07ae0467cff1c9a4acfe0334add7b0acb4ed34e4` (=remote679bc). One new dedicated module; no shared hook/source/data edits. Source SHA256 `cd4a987ebcae2bdd77b0affe04fb8c37d2ad0548886e9ee97b322c050d24f26f`.

## Source versus fit
- [故宫南三所](https://www.dpm.org.cn/explore/building/236452.html) supports three-bay east/west side halls before the main halls; [官刊2020/10,p142](https://www.dpm.org.cn/Uploads/File/2020/11/12/u5facb56c07c8f.pdf) supports front/rear side halls' non-projecting hard-gable form. Local page142 personally inspected; Fig25 is historical, not modern survey. No own facade photograph is claimed.
- **西所首进内东配殿**, at(-264.5,36), facing+X into its western court, not the retained middle court's western side hall. Three bays8.4m,depth3.6m,roofdepth4.4m,eave3.4m/ridge5.2m,rotation−PI/2,plain green/red/gray and closed opaque panels are engineering fits. No carving/furniture/exact window reconstruction.
- Independent`EXPAND-04-WEST-FIRST-EAST-01`,parentFC-C640AE8651,hostFC-172C8CBF68; no original41objectId,map,room,walkable or interior-admission claim. Existing middle court side hall retains its separate identity. Eastern court inner-west and middle second-stage candidates stay stopped.
- Whole actual visible bounds are X[-266.7000000476837,-262.2999999523163],Z[31.67636251449585,40.32363748550415],Y[-0.03999999910593033,5.28000020980835]. Slab extends only.04m below ground; no new invisible support. Roof/walls remain within pre-scanned X[-266.9,-262.1],Z[31.2,40.8],Y(.05,5.8).
- Actual old western-front roof minX−261.312535095 gives **0.987464857m** to new visible roof; **.787464905m** to conservative reserve. These are different bounds, not a loosened tolerance. Old middle-west roof to new roof about1.700m. No retained wall/roof/portal or x=−267.2 loop moved.

## Terminal checks
- `/tmp/r158-west-court-east-wing-scan-0605/`: normal07ae loadAll:false/reuseInactive:true with actual library, loadedouter-east plus global scene.0 existing collider/visible-triangle overlaps,99,332 relevant visible triangles checked;861 radius.5 body/water points and6 lines clear. Original middle-west10Hzwalk/60Hzrun285frames exactly equal its0517 author record.
- `/tmp/r158-west-court-east-wing-evidence-0608/`: **8 genuine missing-builder RED →8/8 GREEN**.32 visible meshes/32 actual native Float32 triangle owners/672triangles, closed positive-volume paired edges; real stone6mUV uses returned geometry. Old streams unchanged; foreign/occupied/moved-host/duplicate guard; normal private disposal once/borrowedstone retained. No arbitrary late-publish atomic rollback or per-owner historical authentication claim.
- One author **QA-before-finish injection**, not production hook: same3 near routes1407frames **plus** original middle-west2 combinations285frames = **5/5,1692frames,peak0**. Both complete array groups equal pre-candidate scan;5 old ownerSHA groups(well41 +4 side halls32each) unchanged; nine old halls9;2 closed-wall approaches reject. Positive frames also check actual body and water. No source/QA/path adjustment after RED→implementation.
-2 small CPU z-buffer views personally inspected. Context shows old western front hall, new inner-east body, retained middle-west side hall and their visible gaps; it is not a whole nine-hall rendering. Flat category palette, **not GPU/production-texture/mobile acceptance**. No author full-app build or global route claim. All parent tracked src/data SHA equals scan. Raw/official copies remain local; only source/tests/summary/pins/self-made PNGs committed.

## Unique integration
Import`buildNansansuoWestCourtEastSideHall` from`../palace/special/NansansuoWestCourtEastSideHall.js`; call once after`buildNansansuoEastCourtEastSideHall(this.kit,this.zoneJson)` and beforefinish. No other shared edit needed.

```sh
node --test tests/r158-west-court-east-wing/component.test.mjs
NORMAL_INSTALLED=1 WING_EVIDENCE=/tmp/r158-west-court-east-wing-integrated \
WING_BASELINE=/tmp/r158-west-court-east-wing-scan-0605/scan.json \
node --test tests/r158-west-court-east-wing/world.test.mjs
```
Normal mode does not inject/restore finish. It requires one installed record, both3+2 exact array groups,five old ownerSHA,nine halls9 and2rejects. Compare`routes`/`oldMiddleWestRoutes`/`negative` with author world.json.gz. Astra then unique integrator owns normal hook/cumulative build/publication.
