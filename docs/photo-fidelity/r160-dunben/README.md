# R160 惇本殿：独立大修前图证外壳

Base `884e089b111e80b51ea2628d02f45b6ce77f7d6a`. Original E61 ID `FC-1ED6740852`. Adds only `src/scene/palace/special/DunbenFrontHall.js`; all old runtime unchanged. This is NOT the just-built Yuqing front hall, Jide rear hall or whole compound.

## Own evidence
- DPM236570 `https://www.dpm.org.cn/explore/building/236570.html`: separate Dunben in second courtyard,5bays/3depth-bays/yellowxieshan andfrontplatform. Does not verify current interior inventory or gameplay dimensions.
- Official2020 article PDF `https://img.dpm.org.cn/Uploads/File/2020/08/20/u5f3df3653f823.pdf`, `/tmp/r160-yuqing-three-emperors-2020.pdf` 8,653,078B SHA6836ed33b1b5a34e01c81a30750f7d51925dd82afd2ead6216109d62c8fe7d18. **p6/print41 LOWER image explicitly 大修前惇本殿外景**. Upper image is Yuqing, not source for this facade. Own lower image personally viewed: five bays, yellow roof,6redfrontcolumns,three middle closed-door bays/two end sill-window bays, greyplatform/frontapproach. Photograph is explicitly PRE-REPAIR, not2026present-day acceptance. No invented repair/date.
- Official2021 region plan `/tmp/r160-yuqing-2021.pdf` p2/print110 places Dunben south of gongzi front hall. Used onlyrelative sequence, not converting diagram to surveyed XZ. No gate/side-wing reconstruction from this plan.

## Fitted implementation
Main20×11 at(-134.5,226),5equal bays; closed3middle bays (4coarse leaveseach is fit),2end sillwindows,6frontcolumns, yellowxieshan. No interior/room/map/modernadmission. Unseen side/rear closure explicitlyfit. No two pictured tubs, fine御路stone carving, ridgebeastfinework, sidewings or gates.

Grey22×14 mainbase and14×4 frontprojection both.3m,2actualbroadsteps .15rise/1.4depth. Heights/counts/dimensions are low game-access fit, not a measurement from the oldphoto.4visible solids each ownmatchingBox/toprescue:false;153othermeshsexactFloat32triangleowners,157totalcolliders. No ramp/contactexception/globalchange. All UV actuallibrarytilesizes. Stagedregistration validates before publishing, not a promise of late-publication rollback.

Approved reserve X[-147,-122],Z[211,238],Y[0,12]. Actual fullmesh bbox X[-145.949279785,-123.050720215],Z[212.200000012,233],Y[-5.96e-9,9.002203941]. Oldstreetx=-120.8 remains2.25072m from nearestmesh (radius.5margin1.75072). NewYuqing southtoe241.7 remains8.7m north. Neither oldroad nor anybuilding moved.

## Actual verification / failure record
- One actual normalWorld baseline scan,loadAll:false,explicit east-six/garden/axis-courts+global: fullreserve oldvisible/collider/support/water/bodyclear. Actual Zhaigong/Chengsu/Yuqing frames resident, bounds recorded. Oldtwo-street4/3315fullframes andYuqing4/443fullframes identical previous acceptedraw.
-7missing-buildertrueRED, then7/7GREEN firstsource implementation: ownidentity/3doorbays/2windows;bounds;true permeshtriangleunion;4Boxsolids/tops;actualUV;pre-registrationguards;finish/disposeeachcandidategeometry/ownedmaterialonce, borrowedlibrarymaterialretained.
-First localQA4roundtrips failed because targetz220.2 was on the closedfacade's radiusboundary. Stoppedz219.959..220.138, allfootgaps<.15. **Source not changed.** Raw `local.json.gz`/`local.log` preserve this RED. Parent authorized targetz218.5 on real frontplatform (z215..219), allowing up to1.2m nominalstep+.5bodyradius before the facade220.7. This is exteriorplatformarrival, NOT reaching/entering closeddoor.
-Final local4/372frames at10/60walk/run allarrive;peaks.052000003/.052000003/.147277781/.202000006. Existing negative220.2→223 and rear235→229 bothblocked.OnlyQApoint/outputchanged, no iterative producttuning or globalphysics.
-One candidate actualWorld1/1: finalnew4arrays exactlylocal; originalstreet4/3315 andYuqing4/443 completearrays unchanged. Original3298meshes/1829colliders/99supports androoms/maps/regions SHAidentical before/after, including newthreehalls. No fullroute resampling oftheirinteriors. World inherited emptyoccupancy arrays are unused placeholders; baseline scan is the actualclearanceevidence.
-Two800×450 CPU views personally inspected: actualgeometry andlibraryfallbackcolors only, notGPU/textures/screenshots orfullvisualacceptance.3024exporttriangles include12QAgroundtriangles, notproductionfloor.
-No fullprojectsuite/build/browser/mobile run; authorverification is7component+1local+1World finalassertions, not counting baseline/RED aspass. No normalproductionhook installed byauthor.

## Integration contract
Import/call `buildDunbenFrontHall(this.kit,this.kit.root.name)` once at normal ZoneBase.build end beforekit.finish; retain source-independent identity and leave all oldmodules unchanged. Otherzone false; duplicates/transformed/frozenhost reject.
World QA loader injects this builder andcaptures oldflow before/after. For normalcumulative use a freshcopy/base/output, removebuilderinjection AND donot reinterpret after-normalhookcapture asoldbaseline. Keep frozenauthorflowproof; assert normalowners/tops, originalstreet/Yuqing/newplatform fullarray equality. Do not overwrite `/tmp/r160-dunben-1027` authorraw. Finalnormalhook/build/Astra belongs tosingleintegrator.
Only code/QA/smallsummary/CPU committed. OfficialsourcePDFs/images andframegzip remain/tmp underrawhashpolicy. No source implies modernpublicopening orwholecompoundcompletion.
