# 四神祠：实体定位、有限候选与验证记录
原文 FC-492344B85B / MASTER-PROMPT:625；父候选71a9d7a5。

## 来源与非猜测边界
官方 https://www.dpm.org.cn/explore/building/236488.html 已实际读取：八角主体前出抱厦，周围出廊，八角黄瓦攒尖、抱厦黄瓦卷棚歇山；不施斗栱，豆腐卦槅心/青砖槛墙、坐凳栏杆。供案砖台靠南墙面北。文字没有实测尺寸。
实际看过官方整正面 https://img.dpm.org.cn/Uploads/Picture/2020/04/17/s5e9988cb9778c.jpg 与匾额 https://img.dpm.org.cn/Uploads/Picture/2020/04/17/s5e9988cb9a7bb.jpg 。正面可见闭合门面、木栏、柱/梁、黄瓦出檐、宝顶与石阶，两侧古柏、后方山石；匾是“四神祠”，不凭小缩略误认别的字。满文不猜写。后部抱厦尚无实际看清的完整外观，不能按通用八角亭省略它，也不能声称已验整历史对象。
彩画图 https://img.dpm.org.cn/Uploads/Picture/dc/1615%5B1024%5D.jpg 直读被网络隧道403拒绝，没有重试或绕过；不声称看过完整彩画近景。

## 重要纠错与定位
最初将官刊园图东南八角符号暂作备用圈选，范围[-40,-18]×[437,460]的零碰撞结果**不属于四神祠，作废，不能用作安全证据**。尚未写生产实现，未产生错误实体。
实际公开sphPicDetail读取vp3380，名称四神祠，coordinate=(503367.64540516725,306003.2856162851)。以既有万春/千秋两相机与模型锚作反射相似配准，北侧相机映射(30.7839905,471.58252489)。官刊图中真正标“四神祠”的符号位于西井亭东邻、千秋亭东南，不是东南八角符号。暂估主体在(30.2,464.4)附近，须独立核符号范围/北阶和北抱厦；这是拟合，不是测绘。

## 正确范围普查
实际World候选[22,37]×[456,474]全高注册collider有31项：其中30是新西井的边缘源体，另1是原GardenBuilder树，低AABB范围[24.1391622383,0,460.0539528977]–[25.6393035680,3,461.5540942273]。不能称空区，也不能只靠3m树AABB核屋顶。西井绕行和这棵真实原树是必须闭合的邻接；不挪树、不洗牌34树、不用隐形挡墙来掩盖。

## 初始调查状态（历史记录，已由下文候选状态取代）
只读调查，未写四神祠生产源码/配置。若原树真枝与完整屋顶/抱厦、原西井绕行不能在有限真实铺装/域内闭合，则保留调查，不把未验对象塞入安全父。

### 官刊符号放大纠正
实际放大园图250..410×400..540片区后，四神祠文字清楚，八角主体前的矩形抱厦伸向北侧，且北侧外有阶台。不能从南墙供案面北推断抱厦在南；先前临时南抱厦设想作废。西井外景公开API还链接另一四神祠视点1943272203659366400，后续独立核西侧外观。


## Candidate status — 2026-10-29 19:06 UTC (NOT accepted/released)
A complete source-fit octagonal closed shrine and **north** annex is now WIP, not a surveyed reconstruction. Explicit no dougong, no invented interior or Manchu lettering. Dedicated actual-visible source physics, finite real paving, strict bounded motion and unique live Environment witness are implemented. The original 34 tree render buffers/matrices remain identical. Only original cypress instance 7's inadequate 3m collider is replaced by its exact unchanged F32 trunk/branch triangles after measured failure.
- `tree-motion-before-source.json`: preserved RED, 32 legal starts, 16 actual branch penetrations.
- `tree-motion-after-source-green.json`: post-source run, 32 legal starts, zero penetrations; fixed target approach only, **not a terminal exit claim**.
- `roof-tree-probe.json`: 880 roof / 3034 original trunk+crown triangles, zero segment hits and zero sampled roof standing-body contacts. Not coplanar-complete collision proof.
- `focused.log`: 20 focused tests passed, including source correspondence, closed manifold edges, strict scope/lifecycle, 32 isolated movement cases and vertical tests; no GPU/device acceptance.
- Full-world local routes, high-branch terminal exits, old-neighbour comparison and independent review remain pending. No safe checkpoint for Sishen yet.

### Superseding status — 19:15 UTC
Source geometry is frozen under `final-source-sha256.json` (no release). The source-visible paired short front rail panels and continuous sloping stair cheeks are now present, with photo-topology RED→GREEN coverage. 291 visible entities have 74 exact source boxes + 217 actual triangle sources. All dimensions, front-opening width, roof curves, painted details and concealed finishes remain **model fits**, not a survey or proof of current visitor access.
- Whole-world local movement: `world-local-routes.json`, 32/32 passed, including north stairs, southern approach and both retained west-well bypasses. The west bypass now ends on the finite .04m paving extension; old zero-height expectation is preserved as diagnostic evidence, not a collision failure.
- Neighbour trajectories: 96 actual-controller parent/candidate runs; 80 identical; 16 Tianyi-west traces differ due to local paving. Both versions retain 72 arrivals, 24 inherited non-arrivals, and zero illegal starts. Never call all traces equal.
- Final source build: `build-final.log`, 508 modules, 6.17s, passed. GPU and real-device tests remain unperformed.
- Narrow regression: 76 tests, 71 pass / 5 fail. Two eastern-well whole-garden historical snapshots already fail on parent 71a9d7a5. Three western-well historical “only west well changed” snapshots now intentionally differ because the Sishen object/paving/tree source exists; corresponding parent checks pass. Assertions remain untouched. The new parent-relative Sishen retention checks pass.
- High-branch exits: 16/16 legal, no penetrations, grounded beyond the tree envelope on frozen geometry. Some stop inside a motion domain. A stricter **untrimmed full-height** tree oracle rerun is in progress and will be the final cited evidence.
- Broad current-state run and its baseline failure comparison are still pending. No aggregate-green claim, no commit/checkpoint yet, `wholeObjectAccepted=false` remains.

### Superseding validation — 2026-10-29 19:32 UTC
Production remains byte-identical to `final-source-sha256.json`. Validation-only repairs preserve prior red/legacy receipts:
- `tree-motion-inconsistent-spawn-red.json` records the invalid fixture: setPosition snapped the eye to 6.118706669648548 while the script forced feet to 4.3. The corrected script keeps snapped feet (first start 4.4187066696485475) and verifies eye/feet consistency. `tree-motion-neighbour-oracle-candidate.json`: 32/32 legal, zero penetrations using the actual final F32 trunk triangles **and all 406 registered neighbouring sources**, full untrimmed body. Earlier unrounded CPU-transform false positives remain documented in `oracle-precision-diagnostic.json`; no production geometry was changed to clear them.
- `world-local-routes-neighbour-oracle.log` and `world-local-routes.json`: 32/32 pass with all 406 neighbour sources checked at initial, movement and settling frames, not only shrine/tree.
- `tree-terminal-consistent-spawn-final.log` / `tree-boundary-directed-terminal.json`: 16/16 clean high-start/drop/exit cases; zero untrimmed-body penetration; every endpoint grounded beyond the tree envelope. These prepositioned starts do **not** prove gameplay reachability or departure beyond every motion domain.
- `focused-review-final.log`: 27/27 pass. Additional review tests prove every triangular physical source exists with exact ordered F32 vertex multiplicity in the actual merged render geometry, and actual combined garden-zone west-well/shrine unload/reload preserves counts/map identities and clears owned registration/witness on disposal. This streaming coverage does not claim static GardenBuilder lifecycle.
- `build-review-final.log`: root-path build passed, 508 modules; existing large-chunk warning retained. GPU/device/visual-performance acceptance remains unperformed.
- Independent read-only review found no definite production defect and approves a bounded **local** checkpoint conditional on final historical replay accounting. See `independent-review.md`.
- Broad aggregate receipt remains **1257 tests / 1039 pass / 218 fail**, not green. Its file-level Zhaode termination hid individual tests; never infer that omitted tests passed. Parent batch initially reproduced 191 identities, missed 27, and added one file-level R63 termination. Serial isolated replay reproduces all 26 hidden R63 failures. Parent Zhaode completes 75 tests / 74 pass / 1 fail (`lib.aspect` missing in historical route fixture); targeted parent replay also propagates the source loader into subprocesses and reproduces that failure. Final candidate isolated comparison is recorded separately before checkpoint.

Historical whole-object fidelity is still unaccepted (`wholeObjectAccepted=false`). No deployment or main operation is part of this checkpoint.

### Final comparison / bounded local checkpoint gate — 19:34 UTC
Candidate isolated Zhaode TAP completes **75 tests / 74 pass / 1 fail**, exactly matching the parent’s failed test identity and historical `lib.aspect` fixture error. The previously hidden 74 tests now have explicit passing receipts on both versions. Parent accounting: 191 direct matched failure identities + 26 isolated R63 failures + the isolated Zhaode historical failure explain all 218 original failure identities; this is **not** a fresh green aggregate or a claim that the original file-level termination did not happen. `validation-summary.json` holds the final scoped result. Recalculated `world-final-source-comparison.json` confirms the final frozen candidate’s 96-route comparison: 80 identical, 16 local-paving differences, 72 arrivals each, zero illegal starts.

Independent-review conditions are fulfilled; a rollback-preserving local checkpoint is justified. Keep unrelated 摛藻堂/翊坤影壁 WIPs, original historical report rewrites and scratch ledger outside the commit. Do not deploy or modify main.
