# R126 actual feature cost, not performance optimization

Finalruntime ba885f34. Same corrected target-only dynamic import helper for both R125 andR126; capture:false excludes diagnostic frame snapshots. Fresh alternating3pairs per building high/low, all12raw retained; setup imports/library/paint mature inside allReady, narrowerbuild aroundactualZoneBase.build. Never compare to earlier asymmetricR123/R124 causal deltas; seeCOST-ERRATUM.

|quality|buildΔms, all3|median|allReadyΔms, all3|median|
|---|---|---:|---|---:|
|high|177.675,9.086,-21.560|9.086|191.709,108.101,-66.485|108.101|
|low|109.440,17.831,6.145|17.831|131.954,-4.594,32.785|32.785|

No significance/throughput/GPU claim from3pairs. No omittedcold/outlier or chosen rerun. Wholeeast-six high113453→113697tri,low107799→108043; geometry+23424B inboth,2newmergedmeshes/ownedmaterials,25colliders,2walkables,3finite-scopeowners,0room/map/texture.30unique textures/24338432logicaldecodedRGBA unchanged; notfullVRAM.18extraactualsurfacefaces have1296vertex-scalarB,ordinaryboxpayload+1056B; object/template/grid/cache/copy overhead excluded (not0).

## Final two-actor routine CPU observation
One complete streamed all-prebuilt low/SD world,8566frames,108states. Worldready7330.148ms;CharacterSystemconstruction441.031ms (nav436.604). Newroute7417samples:P50.165/P952.815/P9920.958/max52.127ms; raw allsamples kept. Two routines only, notwholeframe/renderFPS/mobile andnotpairedcausal regression/improvement vsR124P9918.831/max50.533. Stutter/tailrisk remains unresolved; no rejectedR120optimization restored.

Nav711colliders/106walkables, numericestimate123936B notheap;817liveowners/48235proofrows. `memory.ready` raw is **end-route**, notinitialready:382734960heapUsed/320917158external/314522071arrayBuffersB,maxRSS1030260KiB;postdispose109980816heapUsed/269412865arrayBuffersB (processholdsdriver/scene refs andsharedresources,notproofleak/fullreachableheap). All-ready startup and normal return/TTL have separate terminal samples below.

## Clean full startup and bounded ownership inventory (final ba885)
HEAD76f0e76d, fresh all-ready SD/low7087.307ms and HD/high7079.013ms; setup before paint maturity7079.971/7072.473ms. First-entry `Teleport.go` CPU63.934–147.244ms,7→7build/emptyqueue; not walkingFPS. Normal return/rebuild low903.344–1510.451ms/high972.573–1704.724ms. Separate inactive-TTL expiry low2246.484ms/high2210.076ms: do not hide it inside ordinary return range. No paired causal startup claim from these two samples.

Resource traversal is only explicitly passed reachable roots: low182561342/high185219774 uniqueArrayBufferB,110texture objects,59unknown texture representations. Known texture estimate42983468/160707791B, unchanged from R125; notVRAM. Same driver/root inventory observed +41856ArrayBufferB/+85buffers/+1895objects versus R125 (geometry-only +23424B is narrower); excludes unobserved/native/JS sizing.

Startup ready heapUsed419189448/420724016B, external309592658/311844050B, arrayBuffers303197571/305448963B; OS startup maxRSS1058712/1168640KiB. Afterdispose heap177752184/177739696B and arrayBuffers153259759/118587365B are post-inventory boundary samples, not complete leakproof/wholeheap reachability. Full raw includes memory/TTL/outliers and has not been filtered.
