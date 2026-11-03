# Independent bounded review: Yuhua Ge bf01f2c9

**PASS within the agreed visible-exterior and game-fit ground/low-porch scope.** No current executable blocker found. This does not retroactively accept ddcf3197, which had two substantive massing defects.

Reviewed product commit: bf01f2c98b3bdcabd371e0a213d7c6dc617b59bd. Yuhua source SHA256: 5c1de9c5a51a33a8876c29af14bd4a0e93a65c7471f8fad847e67aaf37fc7b7d.

## Previous blockers closed
- The main lower/middle eaves no longer rise into continuous 2.2/1.8 m arches. They retain a largely flat eave with at most 0.3 m fitted corner rise, with four distinct backset rolled-gable masses above the main roof. Those closed masses penetrate the actual main shell by 0.12 m at their sampled lower vertices. Actual three new CPU views were personally inspected against the preserved official exterior photograph. The major flat-eave/gable distinction now holds; no exact sculpture, original roof curve, or fine paint claim is made.
- Lower enclosing walls remain 14×12 within an 18×16 outer column grid. The approximately 2 m covered perimeter corridor is no longer filled by walls. The front three-bay projection is open, and the closed front doors/windows are on the main wall. Six visible 0.1 m-rise/0.4 m-run low steps connect actual ground to the 0.6 m porch; these are explicitly labeled gameplay fit rather than photograph-observed stairs.

## Independently executed and passed
- 62 affected component tests, including all 8 Yuhua checks, zero failed/skipped. Current roof undersides, all 32 true roof bearings, profile enclosure, staging failures, host guards and sole hook are covered.
- Isolated normal World: 1/1 passed in 62.3 s; 44 route variants at 30/60 Hz walking/sprinting, 64,014 frames, zero native body contacts. New ground→six low steps→complete perimeter corridor in both directions→original ground return passed. Five real blocking negatives and the single actual-column removal sensitivity probe passed. New porch maximum feet is 0.600000012 m; natural running descent foot/ground gap peaks at 0.420333 m, not an invisible support or modified gravity.
- Complete old normal-loaded stream equals the pre-Yuhua baseline: 853 meshes, 84 instances, 17,180 collision owners, 1,318 walkables, maps/rooms/regions/architecture and selected material fields. No old visible triangle or collider overlaps the complete new envelope above 0.04 m. Old far-silhouette prefix stays exact, appended tail equals only actual new roof/metal triangles. Original 185 line remains a blocking negative; approved 196 bypass and prior routes remain usable.
- Independent added audit: all 364 non-stone owners match real visible mesh world-triangle vertices exactly (24,944 triangles), plus 8 stone boxes exactly match real meshes. Unmerged 932 and merged 1,318 allocated private geometries each disposed once; 18 private materials each disposed once; 5 shared material handles not disposed.
- All 13 original four-batch evidence files byte-identical to 6d852ab5; all 15 latest stage/Jingyi files and README byte-identical to 6bde248e; original four-batch README remains a complete suffix. All three required ancestors present. Runtime diff versus latest cumulative parent is only YuhuaGe.js and the one import/pre-finish hook in ZoneBase.js.
- Source hash, all 3 CPU image hashes and official-photo SHA256 independently checked. Normal report uses the same current source hash. Test output was redirected only to /tmp via a load hook; repository test assertions were unchanged. No source or remote writes performed.

## Author evidence read back, not independently executed
Clean root build R163-e0b0757f4cdc, fingerprint 26a2f76854a68478af99beca20b596ba0bf1a4c177dbc5a38812d28abf61e4aa, sourceDirty=false, expected product commit. Author's 137-file local HTTP/hash verification records root 200 and missing 404. This review does not relabel those as independently run or remotely deployed.

## Limits
CPU geometry/albedo only, not GPU/PBR/browser/mobile acceptance. No full streaming/history, exact survey, whole-building acceptance, complete interior/upper-floor access, or real-site admission claims. Stairs, porch offsets, repeated detail, roof curves and unseen supports remain disclosed engineering/gameplay fit. Official page: https://www.dpm.org.cn/explore/building/236446.html . Official image: https://img.dpm.org.cn/Uploads/Picture/dc/7985[1024].jpg . A fresh web extraction timed out; review used the preserved official-page bytes/text and personally viewed official-photo bytes, not a new successful live fetch.

Evidence: /tmp/r163-independent-bf01-yuhua-review.json, /tmp/r163-independent-bf01-yuhua-all-components.tap, /tmp/r163-independent-bf01-yuhua-normal.tap, /tmp/r163-independent-bf01-yuhua-normal-world.json, /tmp/r163-independent-bf01-yuhua-extra.mjs, /tmp/r163-independent-bf01-yuhua-extra.json. Prior ddcf logs remain distinct; they are not current acceptance evidence.
