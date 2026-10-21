阶段说明：以下原始验收记录对应793100dc，保持原文。文渊阁入口的a3baa876后续变化、最新61/61及79/79结果见文末“第10组追加”，不得将第一阶段的“旧mesh原样”或29个walkables结论直接套到后续门槛拟合。

# R48 outer first18：安全修复的明确保留差异

状态：源代码因果归因与精确保留专项 36/36 通过。此文件不替换、不更新原始已验收快照。

## 冻结依据与验证方式

- 原模块 SHA-256：`fcb22fe64d01bbcadb39912842c4830af0f21574d0add38094a0efa11ff4a60d`。这是模块内容哈希，不是 Git commit ID。已仅读取 SHA 完全匹配的旧模块，并在当前依赖/fixture 下重新构建18身份，全部重现原快照。
- 不可变基线文件：`docs/current-state/r48-remaining/outer-first18-retained-signatures.json`，文件 SHA-256：`6b20b5dcec05ee4151a3234dfa2b30ecdf724f7ba602683b30c23848f235ac47`。测试在源码中固定此哈希，不接受刷新基线。
- 本次评审模块 SHA-256：`793100dc22cf801751ffd8a8e93be43d58ccfa17c79d49fe4701f225898a6290`。这是本次 provenance，测试并不锁死与first18无关的后续宝蕴等工作。
- 机器可读白名单：`outer-safety-retention-delta.json`。每个变化字段均保存固定 before/after 值，以及各值 JSON 序列化的 SHA-256；数值计数也有哈希。每个字段必须指向具体源码原因。
- 不是盲录当前状态：只把9组已确认安全补丁在内存中反向应用，18项全部9字段必须恢复原基线；然后一次只重新施加1组源码补丁，核对它实际影响的身份与字段。无生产源码/原快照临时覆盖，也不依赖别的工作目录运行测试。
- 另以旧墙面颜色改变1位的内存变异证明：其 geometry 不能通过原基线恢复测试，其他字段仍精确。

## 18身份的字段白名单

18×9=162个原签名字段，仅21个具有白名单变化，其余141个字段与冻结快照严格相同。7身份全字段不变；8身份只改变碰撞；3身份有可见安全几何变化。

| 身份 | 允许变化字段 | 柱底半径修正对应构件数 |
|---|---|---:|
| 文渊阁 | geometry, meshes, triangles, colliders | 10 |
| 南三所西所前殿 | 无：9字段完全相同 | 0 |
| 南三所西所后殿 | 无：9字段完全相同 | 0 |
| 南三所中所前殿 | 无：9字段完全相同 | 0 |
| 南三所中所后殿撷芳殿 | 无：9字段完全相同 | 0 |
| 南三所东所前殿 | 无：9字段完全相同 | 0 |
| 南三所东所后殿 | 无：9字段完全相同 | 0 |
| 浴德堂 | 无：9字段完全相同 | 0 |
| 南薰殿 | colliders | 12 |
| 含清斋 | colliders | 8 |
| 延寿堂 | colliders | 8 |
| 宝相楼 | geometry, meshes, triangles, colliders, walkables | 32 |
| 吉云楼 | colliders | 32 |
| 慈荫楼 | geometry, meshes, triangles, colliders | 24 |
| 慈宁宫 | colliders | 20 |
| 大佛堂 | colliders | 16 |
| 延春阁 | colliders | 40 |
| 寿安宫 | colliders | 12 |

所有18项的 rooms、regions、mapItems、原 helper 的 navigation 均保持不变；除宝相楼外，walkables 也全保持不变。

重要：原 helper 的 navigation 仅哈希 profile 的 p.navigation，不是 built.g.navigation，不能把该空值哈希当作楼梯实际路线保留证据。新测试另对全部18身份的实际 built.g.navigation 保存/核对 before/after 哈希，仅宝相楼有批准的实际底部路线改变。

## 精确变化值

以下完整列出差异；哈希为 SHA-256 全值，数字为精确计数。各值的独立序列化哈希见 JSON。

### 文渊阁

- geometry: `283336a6a077f8ab0a129d14ca3225aa1d3b7b563eb3539c230992159106afa8` → `1c94bc3fb69f2ade61bf8d7890ff22a19e39e60d3d0c717079f3de525b64ec8b`
- meshes: `645` → `689`
- triangles: `9960` → `10488`
- colliders: `f18993f38b5145eac094704f9de576421d9acb05c5285e66df04ff31a2597c02` → `6ce79a94d41d62285fec795a3e7368612671e846c8579ff0f245b1b3a35b368d`
### 南薰殿

- colliders: `2d39c78dc123113c6e1226bd2d3e16bfed12feb0d3b63441d0c96382819f4490` → `1cf8eddaa738c76d90498a51bc2de39af873ac5b719931be2f0a401535374fba`
### 含清斋

- colliders: `f344a754a30feafa744f7558fb67b1fd0d7b1ed75b64cf92572d94e55bf10400` → `b80020f518aa0083a0406abc167cdf25c1829dddedb17823c0e16199aec16d04`
### 延寿堂

- colliders: `ed09d739d795c6850cd208719acba53d46985654796d15d21cea0164c7b55d1c` → `9dc6d9611122a948299493ab07863794d496afe9a34b005953695476aef6f5d7`
### 宝相楼

- geometry: `9be97ac9a829d66ff5c0a99e01dab6baaecbad62f181c5fed70db809e1808973` → `97fdfd84043d8a56e8cab4ff8436e5503a4e0fa57afd43a6344c2f42f1684a28`
- meshes: `1181` → `1449`
- triangles: `18556` → `21772`
- colliders: `05f87d5c9898ecb1a554947e54cd3c7b0a52536d3af3b8bdc9ab026c25b8d028` → `7a8d2851cbfa308ba254b2ce79093b1caf60db9b55a827b5593e95c3b2ac1912`
- walkables: `640d727cc1ae4730e05b6c004f5076c5c95a735bfe969189d62c86349d53af49` → `5f9e777574a5639ce83a1a6e847d09f11c7e181c06ac956802575f5fbf1bff6f`
- 实际 built.g.navigation: `ff17faa2189c753369fbc91219a1e84fc6098301655b99d1a9f8d6c98cd954ed` → `3c4a34a62eb9360e2c1893b32e203ff3189817b11d9166e054adf7027c99cd2e`
### 吉云楼

- colliders: `4df11876b32d2583cc0a7e2a7b8578fccf0958751f7769f2e03b947b73dff5ec` → `de6f1f6b952b43c53d2d9c1e074d04e7e3c18d4b8a53c93256ebd1c1593aa4f2`
### 慈荫楼

- geometry: `af0f6d0d96277280aa8b3eede296ff5258507908c707eccbfeb32327ac8310d1` → `2f41c60c7f1a0cf17fd1b1022048406095ea59344cee489871b1642ee7bf1a2c`
- meshes: `575` → `593`
- triangles: `10996` → `11212`
- colliders: `891ca56070c16958678c51d7a3be402534f8cf8ffe151d3ed0a4558bd4f8b0ef` → `791c352049a25f8c988ca60a45a25d9de50fe6120885b16dd668432e9e4d4c93`
### 慈宁宫

- colliders: `4e1f945e3e314d4ea73abad6aed4c0ee0db8aca0cc59ebf4ab2c4101ff1ffb03` → `fff3793d3f308b988d2a84ff4e90304bf093827b49f02244a5927eca8b57032e`
### 大佛堂

- colliders: `dd49990966ffebffa3b0731a4cbcdd497932482c7c721c65e0dd1d59304ac4e1` → `8e0cc46b56e1555898c95afeb314eeec097cc3232d9ffcbeeca4126c173c94c0`
### 延春阁

- colliders: `b8de39cd5f731c0e777a8278964fa800cec48d58d2a2563a1cd2b72bdac54694` → `3e5177750d621f250838a56fbc3a01875d7f750127e5455421566115610e081e`
### 寿安宫

- colliders: `25ef347506db2d243f08f9abff962b1852a07513a3074319d4386b44d0aa8ad7` → `8c3c1f4a81e96fa0599450df137d0bae799ae46b2a2f5ebff956bb8e326c2372`

## 源码原因与组件级证明

### 共用柱底半径

context.column 的原 CylinderGeometry 已是顶半径 r、底半径 1.05r，本轮只把碰撞 X/Z 从 ±r 纠正为 ±1.05r，不新增柱、不改变柱形、柱高或摆位。确实影响11身份：

- 文渊阁：wenyuan-fitted-inner-floor-post × 10。
- 南薰殿：nanxun-column × 12。
- 含清斋：hanqing-inset-front-house-column × 8。
- 延寿堂：yanshou-inset-front-house-column × 8。
- 宝相楼：baoxiang-column × 16；baoxiang-upper-column × 16。
- 吉云楼：jiyun-column × 16；jiyun-upper-column × 16。
- 慈荫楼：ciyin-column × 12；ciyin-upper-column × 12。
- 慈宁宫：cining-column × 16；cining-photo-partial-column × 4。
- 大佛堂：dafotang-column × 16。
- 延春阁：yanchun-column × 12；yanchun-lower-side-column × 8；yanchun-fitted-floor-support-post × 8；yanchun-upper-three-bay-column × 12。
- 寿安宫：shouan-column × 12。

南三所6项与浴德堂不调用此柱构件，因此不加入碰撞例外。浴德堂天窗圆筒、南薰殿藻井圆/八角过渡件不是 context.column，也没有被误计为柱。

### 宝相楼：5 cm 下端延长、47级访问拟合、真实楼板洞与薄护挡

- 曾试的0.65 m下端延长会封住原端门，已经撤回，不属于本白名单。当前 z0 为 g.front+2.25，旧值为 g.front+2.3，只前移0.05 m；x、width、z1、两端门隔墙与6处采光井均严格保留。
- 当前每跑 ceil(4.2/0.09)=47踏步；旧每跑21踏步。两跑总踏步42→94、相应踢面/坡侧护栏分段随之增加。这些都是生产角色体积净空的可逆访问拟合，不是测绘级数或历史依据。
- 上层楼板开洞原本就由这两条真实楼梯端点推导，端点前移使洞边、相邻楼板分片、分片薄底代理以及两条walkRamp边界同步改变；walkables总数77不变（含保留平台支撑及楼板/坡道）。没有通过虚假抬升或整段不可见碰撞填充代替真实几何。
- 两跑共新增28个可见梯下栏杆/柱，并逐件匹配薄碰撞。已有44根佛龛格栅仅打开逐条碰撞，渲染网格本身完全保留。
- 所有非楼梯、非被洞口边界影响的 upper-floor mesh 逐件名称/世界矩阵/材质/顶点/索引完全保留，包含端门、隔墙、采光井、屋面、经柜和格栅。
- 实际导航底部接近点独立登记与测试，不靠 p.navigation 的null哈希掩盖。

### 慈荫楼

- 只新增18个可见梯下防误入栏杆/柱及其逐件薄代理，并应用24根柱的1.05r半径修正。
- 原21踏楼梯、楼板洞、所有旧mesh、walkables、端门/通道/经柜与实际导航全部精确保留。geometry、meshes、triangles 的差异全部来自新护挡，不能夹带其他视觉改动。

### 文渊阁

- 两跑共新增44个可见梯下护挡mesh/代理。保留原29踏步、原真实楼板与楼梯洞、全部walkables和实际楼梯导航。去除新增护挡后，所有旧mesh完整指纹序列与冻结状态完全相同。
- 51个已有可见构件新增逐件代理：28根旧木柱、6根彩画梁、4片砖墙、9个门窗构件、4片红墙/填充。旧门扇、旧梁柱和楼上围护都未拆除、缩小或改材质来躲避检测。
- 每个旧构件代理由自己的实际geometry包围盒及世界矩阵推导，且有逐件元数据与碰撞对应断言；仅彩画梁下缘有0.05 m生产头顶修正，其余无扩张。低于地面+STEP_UP的部件不因此新增挡路代理。没有整屋、整层或屋顶聚合盒。
- 5条已有照片屏风横栏只补逐条薄代理；10根新增楼板支承柱执行共用1.05r修正。碰撞条数439→539，恰为44护挡+51旧构件+5横栏；柱半径只改既有代理尺寸、不增条数。

### 材质身份兼容不作为新视觉例外

生产 TextureLibrary 名字会带_material，fixture是裸共享名；最终 materialKey 按真实库缓存对象身份、kit.ridge身份和owned私有身份辨识。此兼容修复并不放宽first18字段白名单。测试曾真实抓到 kit.ridge 被误认为lib共享材质，导致南三所6项和延春屋脊换色丢失；修复 owned/ridge身份后，原安全delta完全恢复。materialKey函数也作为精确源码证据固定。

## 执行与范围

运行：

`node --test tests/r48-outer-safety-retention.test.mjs`

36/36通过，覆盖18身份逐字段锁定、9组单独源码因果回放、柱半径身份范围与真实底缘覆盖、旧mesh保留、逐件护挡/旧围护碰撞、宝相5cm/47踏/旧端门/采光井保留，以及未授权改色拒绝证明。

此测试证明明确差异和保留边界，不取代 production controller 全高身体回放、真实TextureLibrary兼容、全项目回归或浏览器验收。冻结文件保持不动；没有写入任何现有测试/模块。

## 合跑与仓库全量检查的真实状态

- 两个保留测试合跑：54/54通过，0失败。
- 在 `r48-worker-outer`、基点 `56fd3e90fa9bfbc56784888ec8ac3db723e76ab6` 实际运行 `npm run test:current-state`：1038项，946通过、92失败。这是worker较早基点的检查结果，不是owner当前整合树的失败名单，也没有被认定为本安全修新增退化。因此本交付不能被表述为全项目回归通过。
- 失败涉及历史源、场景、路由和产品清单精确保留链；本次只增独占3文件，不修改旧guard或旧快照。未在该任务中建立全部92项失败的完整因果归属，不能擅自断言全是本次无关既有问题。以下列出精确失败名称，JSON的 verification 同样保存它们。

- tests/current-state/gate-ground-door-source-guard.test.mjs
- tests/current-state/gate-plaque-source-guard.test.mjs
- src/scene/RoofBuilder.js: no roof/builder/camera-constant edit in the visibility fix after exact V14 leaf normalization
- src/scene/PalaceBuilder.js: no roof/builder/camera-constant edit in the visibility fix after exact V14 leaf normalization
- tests/current-state/qinan-exterior-routes.test.mjs
- main.js: exact named R15 feature delta retains every R13 byte outside scope
- src/scene/Environment.js: exact named R15 feature delta retains every R13 byte outside scope
- src/ui/Minimap.js: exact named R15 feature delta retains every R13 byte outside scope
- R31 combines only the ten reviewed source changes and four added product files against 2be1751
- R31 restores exact R30 PalaceBuilder before the untouched older source chain
- R31 aliases retain exact older R6 catalog and source contracts without changing old fixtures
- historical R32 exported bytes, source/profile and all 27 collision/walking proxies remain bound
- tests/current-state/r31-qianqing-scene.test.mjs
- main.js: exact interaction delta restores R30 and rejects unregistered edits
- src/scene/flight/FlightTour.js: exact interaction delta restores R30 and rejects unregistered edits
- near exact crest geometry reverses only five registered crowns; all other bytes remain identical
- far exact crest geometry reverses only five registered crowns; all other bytes remain identical
- actual same-count rebuilt crest from unknown source never acquires the frozen geometry exception
- independent full crest capture binds exact total budget and byte-identical navigation through every old entry point
- crest scene binding rejects unknown equal-count geometry, costs, collisions, partial restoration and runtime mutations
- src/ui/Minimap.js: follow-through reverses only exact full bytes and seven unique review hunks
- unregistered paths and changed epochs cannot acquire a follow-through exception
- R25 unchanged exact product inventory rejects extra, missing and duplicate paths
- R26 unchanged exact product inventory rejects extra, missing and duplicate paths
- R26 frieze unchanged exact product inventory rejects extra, missing and duplicate paths
- R27 unchanged exact product inventory rejects extra, missing and duplicate paths
- R28 unchanged exact product inventory rejects extra, missing and duplicate paths
- R29 unchanged exact product inventory rejects extra, missing and duplicate paths
- R30 unchanged exact product inventory rejects extra, missing and duplicate paths
- near complete geometry including UVs remains byte-identical to independent 898b4e6
- far complete geometry including UVs remains byte-identical to independent 898b4e6
- actual frieze capture restores only metadata; all older exact scene entry points remain connected
- frieze metadata binding rejects geometry, material, budget, collision, partial and runtime mutations
- historical R32 resident scene binds every captured byte and its retained resident cost
- historical R32 ordered navigation retains every frozen collider and walking surface
- only the exact complete R32 capture restores the complete frozen R31 capture and all earlier entrypoints
- both complete capture identities reject unregistered costs, topology, fields and geometry/material identities
- registered JSON runtime exceptions retain exact R31 values and never allow arbitrary omitted fields or negative zero
- unknown ordered collisions and walking surfaces never receive historical restoration, including at the R30 bridge
- fixed: exact current descriptors restore only registered R31 changes for historical comparisons
- auto: exact current descriptors restore only registered R31 changes for historical comparisons
- current automatic set removes the fictional Yanxi room route and adds all three real Huangji openings
- near central UV restoration exactly matches independent afb geometry; all other bytes remain equal
- far central UV restoration exactly matches independent afb geometry; all other bytes remain equal
- exact current capture restores independently rebuilt afb then original R32; navigation and costs remain unchanged
- UV and metadata bridges reject unknown fields, changed values, partial reversals and runtime exceptions
- historical R27/R28 retained-driver guards bind all three exact R32 test-source deltas
- data/places/zh-CN.json: exact frozen R32 bytes restore exact R31 bytes; all other bytes fail closed
- data/zones/east-six.json: exact frozen R32 bytes restore exact R31 bytes; all other bytes fail closed
- data/zones/ningshou.json: exact frozen R32 bytes restore exact R31 bytes; all other bytes fail closed
- data/zones/west-six.json: exact frozen R32 bytes restore exact R31 bytes; all other bytes fail closed
- main.js: exact frozen R32 bytes restore exact R31 bytes; all other bytes fail closed
- src/scene/Environment.js: exact frozen R32 bytes restore exact R31 bytes; all other bytes fail closed
- src/scene/PalaceBuilder.js: exact frozen R32 bytes restore exact R31 bytes; all other bytes fail closed
- src/scene/flight/FlightEnvelope.js: exact frozen R32 bytes restore exact R31 bytes; all other bytes fail closed
- src/scene/palace/kit.js: exact frozen R32 bytes restore exact R31 bytes; all other bytes fail closed
- src/scene/zones/ZoneBase.js: exact frozen R32 bytes restore exact R31 bytes; all other bytes fail closed
- src/ui/Minimap.js: exact frozen R32 bytes restore exact R31 bytes; all other bytes fail closed
- src/ui/Teleport.js: exact frozen R32 bytes restore exact R31 bytes; all other bytes fail closed
- src/utils/Collision.js: exact frozen R32 bytes restore exact R31 bytes; all other bytes fail closed
- tests/lib/auto-routes.mjs: exact frozen R32 bytes restore exact R31 bytes; all other bytes fail closed
- tests/lib/world.mjs: exact frozen R32 bytes restore exact R31 bytes; all other bytes fail closed
- tests/stepwalk.cjs: exact frozen R32 bytes restore exact R31 bytes; all other bytes fail closed
- older source guard entry chains consume R32 only through exact full-byte dispatch
- tests/current-state/r33-flight-envelope-retention.test.mjs
- tests/current-state/r33-scene-retention.test.mjs
- data/zones/west-six.json: raw R33 source restores one independently frozen R32 blob and fails closed on every mutation
- src/scene/PalaceBuilder.js: raw R33 source restores one independently frozen R32 blob and fails closed on every mutation
- src/scene/zones/ZoneBase.js: raw R33 source restores one independently frozen R32 blob and fails closed on every mutation
- src/ui/ModelFidelity.js: raw R33 source restores one independently frozen R32 blob and fails closed on every mutation
- existing R32 and older strict source chains dispatch only complete registered R33 identities
- src/scene/palace/special/ChuxiuHall.js: added R33 source or binary is independently byte-bound and never reversed
- R33 product inventory admits exactly two runtime modules and two GLBs after checking all source/provenance and asset bindings
- unknown paths, inherited property names and older epochs cannot acquire an R33 exception
- tests/current-state/r34-flight-envelope-retention.test.mjs
- Frozen R34 lighting-only checkpoint reverses to R33 and rejects mutations: src/scene/Environment.js
- tests/current-state/r34-scene-retention.test.mjs
- data/zones/west-six.json: exact historical R34 identity restores independently frozen R33 bytes, rejects mutations, and does not modify input
- src/scene/Environment.js: exact historical R34 identity restores independently frozen R33 bytes, rejects mutations, and does not modify input
- src/scene/PalaceBuilder.js: exact historical R34 identity restores independently frozen R33 bytes, rejects mutations, and does not modify input
- src/scene/zones/ZoneBase.js: exact historical R34 identity restores independently frozen R33 bytes, rejects mutations, and does not modify input
- tests/lib/world.mjs: exact historical R34 identity restores independently frozen R33 bytes, rejects mutations, and does not modify input
- later integrated fixes preserve only the exact original lighting checkpoint and never normalize unknown sources
- R35 binds the complete raw finish scope, independent R34 sources, unchanged product inventory and all previous fixtures
- src/scene/palace/kit.js: raw R35 bytes restore only the independently frozen R34 identity and reject every mutated candidate
- src/scene/zones/ZoneBase.js: raw R35 bytes restore only the independently frozen R34 identity and reject every mutated candidate
- every retained production and provenance file remains byte-exact, including binary assets
- protected sources match V7 with only the exact accepted skyline, V9 map/gate, V10 lifecycle and V13 entry deltas
- tests/current-state/taihe-core-geometry.test.mjs
- tests/current-state/taihe-core-source-guard.test.mjs
- tests/current-state/wumen-vertical-source-guard.test.mjs
- V7 historical routes retain exact descriptors with only the later Qin’an and R6 Ningshou replacements isolated

## 第10组追加：文渊阁完整入口净空（不覆盖原9组）

- 前序模块：`793100dc22cf801751ffd8a8e93be43d58ccfa17c79d49fe4701f225898a6290`。
- 后续模块：`a3baa8766f7e2df13f98fb53802a5d3332082983d652b540c1599d44fe792f91`。
- JSON新增 `followupDeltas[0]`；原root reviewedModuleSha256、records、sourceChanges、sourceHelpers、baseline和verification不刷新，并分别以哈希绑定。原不可变first18快照仍为6b20b5dc。
- 第10组包含完整入口块（新增踏沿、唯一旧槛scale/position拟合、walkBox、元数据）和return字段2个精确源码edit。反向后整个源码逐字恢复793100dc，再逆原9组恢复冻结first18签名；正向重放也逐字恢复a3baa876。

### 新发现与批准边界

完整入口身体回放发现：继承的旧槛顶0.72米，在平台尚未支撑脚下时已碰到人物0.5米半径身体。最终是可逆访问拟合，不是历史尺寸或文物复原事实：

1. 新增1个石踏沿：宽6.07、深0.09、顶0.51米；世界X[-192.91,-186.84]，Z[-142.4,-142.31]。它在静态桥北端接合，不越界南伸。
2. 新增1个 `rescue=false` 的walkBox，世界Z[-142.4,-142.25]、Y=0.51；末端0.06米由原石帽实物顶部承托。原29个walkable移除新增索引1后，完整顺序和字段逐字相同。
3. 唯一旧门槛深0.30→0.22，局部中心Z -8.95→-8.91；前沿内退0.08。宽、高、原0.72米槛顶、后沿、材质、UV、法线与拓扑保留，只有position属性的Z按0.22/0.30缩放。该旧mesh确实改变，不能再称它完全原样。
4. 支撑前沿到新门槛前沿0.58米，减生产0.5米身体半径后留0.08米余量。全部旧collider、其余旧mesh、原平台、门叶、柱、池桥及实际导航点均严格保留。
5. 原0.30米踏沿候选因与静态桥局部重叠撤回；0.09米但不修门槛候选只有零半径余量也撤回。两者不属于批准链。

### 追加字段值

只文渊阁4字段改变；其余17身份全部9字段及文渊其他5字段精确等于前序793阶段。

- geometry: `1c94bc3fb69f2ade61bf8d7890ff22a19e39e60d3d0c717079f3de525b64ec8b` → `3b32001f73b749faa34ca8a94e5a423ea43d748cf4815a35d70d7024b996580d`
- meshes: `689` → `690`
- triangles: `10488` → `10500`
- walkables: `4e3123f2b87a74b8b0624ebf65c4f363597cbd81e3afd358195161a72a2392ba` → `d765b0c0a62e19a69d9571df927d5d24313ac784f68887da9c67eed5aad8f968`

对应基线的最终允许字段数由21增至22，其余140个字段仍等于原first18冻结基线。前序21字段白名单并未改写。

### 后续验证

- `node --test tests/r48-outer-safety-retention.test.mjs`：61/61。原36项在逆入口后得到的精确793模块继续执行；新增25项覆盖最终18身份、前序ledger保留、源码正反向因果、旧门槛精确变化、其余mesh与collider保留、原walkable顺序、实物顶部射线支撑和未授权门槛加宽拒绝。
- 与 `r48-outer-first18-retention.test.mjs` 合跑：79/79。
- 完整世界297/297、成功子步可见身体接触0由父任务及 `outer-entry-fix-report.json` / `outer-entry-fix-review.md` 报告，world基点fcde072；本保留任务没有重复该物理大矩阵。
- 原stage的54/54、current-state在worker基点56fd3e9的946/92、旧全量440均保持原阶段归属，不能改标成入口后续全量结果。


## 新增四身份的独立源码扩展层（25 ready，保留上述全部历史）

这是新增身份层，不是第 10 组入口补丁的替代版本，也不刷新原 first18 的任何允许变化值。

- 基点仍为 `a3baa8766f7e2df13f98fb53802a5d3332082983d652b540c1599d44fe792f91`。
- 经父任务确认的 25 身份模块为 `b7d318a374e8249b272ddada2dcf5feb6ce9b59772f1dc1c9ab2e7d34e6e4be4`。
- 新账本单列为 `outer-final-four-source-delta.json`。原 `outer-safety-retention-delta.json` 整文件 SHA 仍为 `77e7d240b8061bfa4b7b33b8e83a7873c794e466d371da39486989f5ca3b808d`，原 9 组与第 10 组的文本、字段值、hash 和验证记录没有改写。
- 新层只允许 4 类、共 5 个固定源码 edit：本仁/集义两条证据局限文字；READY 增加主敬、本仁、集义、恒寿 4 key；插入 3 个新身份专用函数及 1 个图源常量；新增 3 条精确 key 分派。旧 context、材质、柱、楼梯、入口、其他 builders 和分派均不在白名单。
- 每个 edit 都固定 before/after 原文及各自 SHA。逆序应用后必须恢复完整 a3baa 源码 SHA，正序应用后必须恢复完整 b7d318a3 源码。源代码多一个无关注释也不允许悄悄并入；仅刷新当前 SHA 仍会被完整逆向 SHA 拒绝。

### 21 身份冻结来源而非当前自比较

既存 `outer-first21-post-entry-signatures.json` 文件保持原字节，SHA 为 `07b4c81b04fa819af873286c2dd907b9fc3ddc6b5af1f5b7b3be8666c24d0029`。其来源模块固定 a3baa，没有由新 25 模块重录。

每个旧身份都验证 11 字段：geometry、meshes、triangles、colliders、walkables、rooms、regions、map、profileNavigation、builtNavigation、builtMetadata。共 231 字段无任何变化白名单。先用精确逆回的 a3baa API 独立重建，逐字段等于该冻结文件；再用 live API 独立重建，也逐字段等于冻结文件。因此包含文渊入口、武英/敬思、宝蕴在内的旧 21，不是 live 与 live 自比较。

first21 原签名 helper 本体保持原文，原代码 SHA `770eee7830c4d8ffea8e389eb7aae399cece48d026bbee70ac18c52eb0779b07` 在测试中固定；新逆链函数只在末尾追加。完整实际 built navigation 和 built metadata 都被覆盖，不沿用早期 first18 只哈希 profile.navigation 的盲点。

### 验证与后续边界

- 三份保留测试合跑 `106/106`：原 first18 为 18 项，原安全/入口链为 61 项，强化 first21 为 27 项。
- 原 61 项在先逆新身份层后的 a3baa 上继续证明第 10 组，再逆至 793 继续原 9 组；针对 live 的旧身份 geometry、collider、walkable 和导航检查仍保留。
- 额外拒绝证明包括：无关共享源码改动、刷新 live hash 后仍未完全恢复 a3baa、移动插入锚点，以及旧慈荫墙色一位变异。
- 新四座自身的真实材质/几何/通行与生命周期另有 `outer-final-four-review.json.gz` 的 68/68、`PASS_WITH_EVIDENCE_LIMITS` 记录。该结果来自独立评审，本保留任务未重复运行，也不把本源码保留证明当成新四座真实性或物理安全的替代证据。
- 本轮没有重跑整应用 current-state；前文 worker 基点 `56fd3e9` 的 946/92 原记录继续保持历史归属，不表述为本次新增回归或 owner 当前整合失败。
- 之后若新增两配殿，必须再加独立末级扩展，先精确逆回 b7d318a3，再进入本层。不能仅替换本层 after SHA 或覆盖 a3baa / 793 的历史记录。


## 末级配殿与主敬薄代理（source-reviewed 固定 27，原 25 基点不改）

本节是在独立 paired 工作目录中的追加证明。主 worker 的 b7 生产模块、25-stage JSON、原 first21 与 first18 基线均没有修改。

- 前序 25 模块：`b7d318a374e8249b272ddada2dcf5feb6ce9b59772f1dc1c9ab2e7d34e6e4be4`。
- 父任务最终确认的 source-reviewed 固定 27 模块：`a150b7de4351b9543ed03e91c1027c88f625f9b1adcf7ecff0640c2c04452ad0`。此处是保留链验收。父任务另报该 SHA 的主敬 94/94、配殿屋面 24/24、馆内 56/56、6 包络 6/6；这些专项不等于 owner consumer 或 GPU 已验。
- 新账本：`outer-final-pair-source-delta.json`。原 25-stage JSON SHA 仍为 `6af080706fc3dac3ff5a4b64755f51677c021d5f587415e591b17f967de27c2c`；原 safety JSON 仍为 `77e7d240b8061bfa4b7b33b8e83a7873c794e466d371da39486989f5ca3b808d`。
- 新层 5 类、7 个精确 edit：凝道/焕章各自 profile 的 evidenceStatus/unknown；2 个 READY key；配殿私有 helper 与 2 个 builder；1 条配殿 dispatch；主敬 2 个真实构件薄代理块及单个返回元数据字段。profile 的身份、坐标、尺寸等全部字段另行深比较，不因整个 profile 片段作为定位锚而放宽。
- 全部逆回后整文件严格等于 b7，再进入既有 b7→a3baa→793→原 9 组证明。源码前后 hash、每个 edit 前后 hash 与唯一出现次数均固定。

### first25 冻结不是 live 自比较

`outer-first25-pre-paired-signatures.json` 从精确 b7 源码独立构建，文件 SHA 为 `bbec61cc7b06879de419cb6015a66d0c361ee4fc3b0f998f3a1041843d3a8fe3`。此文件新增而非替换 first21。新的 first25 helper 对主敬明确调用原 `buildSouthCourtHall`，不使用通用 hall 冒充它的专用圆形展陈；其对原 first21 的输出与原 helper 和冻结快照逐位相同。

旧 25 × 11 = 275 字段中，273 字段保持严格相同。只主敬两字段允许变化：

- colliders：`0711fd83208d5ddf8a8c1546e412fc5f07ab88178e04dd1e39bbf62fde0aa2a3` → `abc6d87b97aefd806b16ae9c5f92601571c928e73b509ae3607f3f50e8c1fe2d`
- builtMetadata：`012f814762abcc6a5803c206bce16a1ff4f6c3b41d4fdb8ef1004c504d6c9a5f` → `19c47e9787b843328f2e7ea02924953c74de949ddd8ae596fdbe7c686cf4e489`

另外 24 身份所有字段、主敬 geometry/meshes/triangles/walkables/rooms/regions/map/profileNavigation/builtNavigation 均严格等于 b7。

### 主敬例外的构件级证据

主敬原矩形展陈碰撞未覆盖圆环及照明件的最前端。新增恰好两个原实物的薄包围盒，碰撞数量 46→48，插入索引为 30/31。去掉这两项后，全部旧 46 collider 顺序和每个坐标逐字保留；两新盒各自等于圆环/照明件的实际 world bounds，headMargin 为 0，不是整室填充。

完整 built g 仅新增 `circularDisplayProxies`。删除该字段后，整个 g 深比较等于 b7，而非忽略全部 metadata。门扇拟合、展陈、既有导航及几何都不借此改动。两个薄代理变化各自有固定 before/after hash；将圆环代理额外下扩 0.05 米的内存变异会被明确拒绝。

### 可执行归因与结果

- 配殿 4 类 source change 单独施加：旧 25 全部 275 字段零变化。
- 主敬代理 change 单独施加：只产生上述两项明确变化，其他 24 身份全字段不变。
- 原 106 项链在先逆末级之后继续全部通过；新 first25 为 36/36；四套合跑为 `142/142`。
- 原 first21 测试的 READY 25 断言仍检查精确还原的历史 b7 API，不改成 live READY 27 来覆盖旧阶段；live 原 first21 签名检查继续保留。
- 另验证未批准共享源码、伪装成 profile 文字变更的坐标移动、放大薄代理都被拒绝。
- 父任务最终确认此 SHA 的几何专项通过，上述结果由其他评审产生，本任务未重跑。owner consumer 集成和 GPU 运行未由本保留任务验证；整应用 current-state 也未在此轮重跑，前述 worker 旧链红名单继续保留历史归属。
