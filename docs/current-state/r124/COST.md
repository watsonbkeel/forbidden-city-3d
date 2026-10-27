# R124 cost ledger — measured scope and remaining limits

Geometry before110603tri; accepted-art geometry after114599tri, **+3996** whole west-six. Six newly owned materials shared among the three targeted facades, zero new textures/atlases/request paths. Current colour/normal image request count43 unchanged.

Independent bounded render export retains27158full triangle rows, removes1524, adds5520; every changed row remains inside a corresponding approved old target convex envelope. This is same-envelope refinement, not a GPU appearance test.

Full collider numeric payload1223,walkables101,rooms53,mapitems38 unchanged. Existing input/source validation remains intact; no accepted performance optimization is present.

Three alternating fresh full-zone pairs per building quality, all raw retained:

| Building quality | Build-time deltas(new−R123),ms | Median build delta | Median all-ready delta |
|---|---|---:|---:|
| high |50.951503,−14.799080,29.654512|+29.654512ms|−56.509603ms|
| low |35.841062,14.425128,54.562530|+35.841062ms|+26.549307ms|

Negative/noisy setup differences are not claimed as an optimization. Both qualities:98→104finished meshes,96→102owned materials,10609248→10992864geometryArrayBufferbytes(**+383616B**),36textureobjects and29415424logicalRGBAbytes unchanged. All tracked final geometries/owned materials disposed exactly once in all12fresh processes. This is not allapplicationJS allocation/fullVRAM. The only additional permanent resources are geometry/material objects; no textures or hidden atlas copies were created.

Full all-ready startup/return/TTL and two-routine profile are below.

## Full two-routineCPU, actual final0773
8566frames, two actors complete. World ready7413.628ms, CharacterSystem construction463.058ms, private-nav initialization457.983ms. New-route7417samples: **P95 2.670297ms, P99 18.831369ms, max50.533056ms**, total7692.124220ms. This is an unresolved CPU tail and a visible-stutter risk, not a performance improvement/no-regression or full-frame budget. R123’s separate earlier observation wasP95 2.299140/P99 13.569703/max29.052037ms; these routine samples are **not same-batch paired causal measurements**, so their difference is not attributed definitively to the facade change. All raw samples retained; no outlier trimming or rerun-to-pick-a-small-number.

Private nav711colliders/106walkables, numeric estimate123936B,817sourceowners/48235proofrows. Numeric estimate excludes JavaScript/index/other scene heap. `memory.ready` in this inherited driver actually samples **end of route**, not startup-ready:heapUsed421663688B,arrayBuffers313880127B; no full retained heap claim.

The startup low/high attempts before a clean tracked commit correctly failed the harness dirty-source guard; logs retained and no timing result claimed. The unchanged guard was rerun successfully after local source commit f20feda2; it was not relaxed. Do not reuse R123's timing as R124's measurement. LogicalRGBA/ArrayBuffer counts will not be called fullVRAM/JS heap.

All src/data/main/release changes are only ChuxiuHall, ZoneBase, the dedicated new ChuxiuFrontEnsemble and release metadata. Every character/navigation/physics algorithm file is byte-exact R123. Numeric nav counts/owner proof row counts and trajectorySHA are exact; six new merged render meshes can add real dependencies to the existing local render-source checks, so verification work is not claimed cost-free. No new per-frame scan or query radius was introduced.

## Clean-source full all-ready startup
Measured on clean local source commit f20feda2, runtime0773. All43base texture requests plus full-scene paints/nine-dragon decode complete, three named paint states ready, no maturity errors/pending assets.

| Quality | All-readyCPU | First-entry setup range | Normal return/rebuild range | TTL expiry rebuild |
|---|---:|---:|---:|---:|
|low|7172.550ms|60.812–107.197ms|931.201–1513.573ms|1994.605ms|
|high|7648.715ms|110.437–199.241ms|995.054–1537.844ms|2372.345ms|

First-entry is production Teleport.go CPU setup, not continuous walkingFPS. TTL expiry is separately disclosed, not hidden under ordinary returns. Low usesSD and high usesHD actual files. These localCPU observations exclude browser network/GPU/mobile and do not demonstrate a speedup.
