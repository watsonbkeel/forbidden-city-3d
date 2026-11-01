# R158 景行门：官文大形简化候选

## Scope and installation
Base e35789c207621b2b0ea1be4a56052339e5048fc4 (same tree as remote2cbf1239). Only new `src/scene/palace/special/JingxingGate.js`; **no production hook installed on this author branch**. Unique integrator imports `buildJingxingGate` and calls `(this.kit,this.zoneJson)` once in ordinary ZoneBase.build before finish, retaining ChuanxinHall and all previous modules. No zone JSON replacement, no existing-object deletion.

## Evidence and uncertainty
Official https://www.dpm.org.cn/explore/building/236526.html and 黄燕虹《传心殿琐谈》p21 agree:3bays, facing south, yellow suspended-gable roof, historical front/rear central opening. p21 describes an exposed gable end. This is deliberately NOT the main hall's hard-gable roof.
The Palace Museum's 阿乐画故宫之传心殿区 p2 says 景行门 was converted into offices. It proves that use at the article's time, NOT a2026 site survey or current public admission. The courtyard sequence is 治牲所→景行门→传心殿 south-to-north; the compound has no south front gate. This candidate is the INTERNAL Jingxing building, not a fabricated south courtyard gateway or the separately photographed east glazed door.
No confirmed current complete own-facade photograph was found. Therefore the side bays use explicitly unverified plain closures, with ZERO modeled modern windows, door leaves, office furniture or painted artworks. Simple exposed end framing conveys broad form, not a guessed five-flower joinery/art inventory. Existing illustration backgrounds are NOT claimed as identified whole-gate photographs.
Original sources remain in sibling `r158-chuanxin-evidence-1618`; this low-disk deliverable records URLs/hash in SOURCES.json rather than copying PDFs again.

## Visible distinction and fitted geometry
Map label: `景行门（官刊：办公室；通路：游戏适配）`. No invented physical museum sign or inscription is placed on the building. Historical central passage is opened solely as an approved GAME adaptation, not a claim that modern offices are publicly passable.
Centre(-236.5,-224),body13.2×6.4m,eave4.3/ridge6.7m,roof15.2×8.2m and every construction member are ENGINEERING FITS. Roof extends1m past each end wall, with plain exposed end frame;3-bay axis atX±6.6/±2.2. Entire visible/collision envelope lies within audited reservationX[-245,-228],Z[-230,-218]. The actual final bounds are in cpu/counts.json. Floor is a real solid slab whose TOP is exactly existing ground0: no raised threshold, stairs, invisible ramp/walk plane, rescue flag or contact exception.
All22 colliders come from exact visible Float32 mesh triangles. No new walkables are needed. Main hall remains12m+ north of reservation; old east-west Donghua route z=-257, west-bridge approach x=-255, Wenhua outside alley x=-221.5 and river are retained. No courtyard walls, south gate, Zhishengsuo or unverified three rear buildings are added.

## Targeted verification
- `node --test tests/r158-jingxing/component.test.mjs`:4/4, actual exact vertex ownership, safe envelope, central clearance/side solid, true suspended roof overhang, malformed/transformed/frozen/duplicate atomic guards, ordinary finish.
- `EVIDENCE_OUT="$PWD/docs/photo-fidelity/r158-jingxing/world.json" node --test tests/r158-jingxing/world.test.mjs`:7/7 real cumulative World routes with explicit QA-only before-finish injection:4 central Jingxing→existing Chuanxin main hall round trips at10/60fps walk/run;3 protected external road round trips;2 side-bay departure attempts rejected.4025 routeframes, max feet-ground gap0.27033332141239874m (existing Chuanxin stairs); unchanged0.3m threshold. All body samples clear of solids. Prior arrays/children retain original identity.
- Two960×540 actual-mesh CPU views personally inspected:13,890triangles. These are diagnostic flat palettes, NOT GPU/runtime texture/mobile screenshots. Modern facade/door-leaf details remain unknown.
- No full historical suite or unregistered-module Vite build is claimed. Unique integrator must validate actual normal-hook installation and cumulative source-bound build after adding the hook.

## Low-disk / remote distribution
SUMMARY.json contains commands' finite results and sourceSHA. LOCAL-RAW-SHA.json records locally retained raw paths/sizes/hash:world.json/log,component/red logs and CPU geometry JSON.gz. These raw files are deliberately NOT in the author commit or remote tree. They remain accessible locally for Astra. Only self-produced CPU PNGs/counts, tests, source, summaries and source references are distributed. Do not describe raw hashes as remote file availability.
