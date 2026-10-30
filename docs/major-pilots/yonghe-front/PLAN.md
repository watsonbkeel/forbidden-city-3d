# Yonghe south-window ensemble implementation plan

> Native sole-writer execution; read-only source/final review. User authorized autonomous subdivision; no repeated design approval requested.

**Goal:** Improve the complete four south window groups and the existing two operational door finishes of original FC-D2B7EEC1F3 永和宫, not a new hall or current exhibition.
**Architecture:** Dedicated guarded `YongheSouthVisual.js` invoked only by the exact `yonghe-open-baoxia` host in `EastResidentialFacades.js`. Replace visual window geometry within each original rendered F32 envelope; retain all physics arrays, operational leaves/UV/pose, canopy/knees/roof joints/plaque/interior. No global style edits.
**Tech stack:** Existing Three.js / Node tests / in-memory Vite compilation.
**Spec:** MASTER-PROMPT.md FC-D2B7EEC1F3 and official 236518 photo set.

## Source/design
Official page https://www.dpm.org.cn/explore/building/236518.html. Personally inspect original front s5e9d39e4779a2, reverse s5e9d39abd8bbe, overview s5e9d39097fb38 under https://img.dpm.org.cn/Uploads/Picture/2020/04/20/ . Explicit page titles and open three-bay canopy establish main hall identity, not rear 同顺斋 or 永和门. Photo dates unknown.
Red frames, slim gold outlines, dense stepped rectangular dark/red upper fields, pale gray lower glazing appearance. Two inner windows visibly have three fields; outer field counts obscured, so retain three-field MODEL FIT, not four-window surveyed count. Central closed door looks dark wood in shadow; finish the existing two operational open leaves with abstract dark rectangular timber divisions, not a closed leaf-count reconstruction, bamboo carving, door nails, or copied artwork.
Alternatives: material-only would retain the sparse obsolete upper frame geometry and misplace full-height field divisions; wholesale shell would endanger validated canopy/physical sources. Choose bounded full window ensembles, exact original outer frame and sill vertices, modest private canvases, no new collision certificate.

## Global constraints
- Safe parent ddb9bc8781366823e0bf12b7d5d8d5dced26b1b0; no reset/push/main/deploy.
- Keep six dirty report hashes and all independent chizao/weiyu/yikun-screen WIP unchanged.
- Actual World/controller comparison is retention, not route success or whole-palace acceptance. Preserve inherited illegal starts/non-arrivals.
- Native canvas currently absent; executed draw-layout checks must not be described as raster/GPU checks. GPU/browser unverified.

## Review focus
- Exact host/source geometry, morph, index, metadata setter, borrowed resources fail before live mutation.
- Failure rollback and disposal exactly once; no global shared material edits.
- New panels/outline stay inside original F32 envelope, outline bonds to both backing fields.
- Real full zone pipeline including Yanxi LOD and all physics/source/nav arrays unchanged.
- Leaf original UV spans full private panel and opaque depth semantics remain correct.

## Tasks
- [x] Write composition/contract/lifecycle/retention and World tests in tests/major-pilots/yonghe-front; first run composition against unchanged source: missing full ensemble must fail.
- [x] Add guarded full visual module and exact owner hook; all focused tests pass, 3 fields/group with honest confidence metadata, private gray glass and dark wood textures, no photo pixels.
- [x] Execute full actual parent/candidate World 96 traces, source retention, navigation, East facade, residential, shared and household serial suites. Compare aggregate reds by names/locations to exact-parent receipts; do not hide failures.
- [x] Full current-state execution compared to frozen Tihe receipt, hash-verified against ddb9bc87; compile real entry at all three bases in memory.
- [x] Independent read-only final review; fix Important findings and rerun affected tests, record deferred Minor. Hash source and preserved WIP, scoped local checkpoint only.
