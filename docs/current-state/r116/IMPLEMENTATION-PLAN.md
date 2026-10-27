# R116–R120 累计开发与 R120 等质量性能专项 Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking. **一个产品实现负责人，评审只读并行；不得另派实现 owner。**

**Goal:** 在完整继承 R115 的前提下推进 R116–120，交付真实首载/有限接触/两殿改进，并在 R120 额外筛选和采纳不降质量的可证明性能收益。

**Architecture:** 沿当前 Three.js/Vite、程序化构建、ZoneManager、真实控制器和人物资源系统做有界修改。先冻结实际输入、共同测量协议和等价证据，再按热点选择最小改动；有依赖的启动方案必须先闭合元数据、灯光遮挡、飞机包络与首访碰撞，不能盲删预建。R120 建模和性能专项分提交、分直接基线。

**Tech Stack:** 当前 package/lock 精确依赖、Three.js 0.162 系列、Vite 5 系列、Node 原实际版本；现有 node:test、Python 编排及 CPU 几何工具。无新增依赖，无擅自升级；真实 Node20/GPU/手机另验。

**Spec:** `PROPOSED-SCOPE.md`（含 2026-10-26 23:55:52 UTC 用户 R120 增量）；原 `docs/photo-fidelity/MASTER-PROMPT.md`；R115/各前版 VALIDATION 与 full-group ledger。

**R118新增规范：** `R118-EMPEROR-CHUXIU-ADDENDUM.md`（用户2026-10-26 23:59:03 UTC）；是本计划Task5必做组成，不是待批准想法。R116 Task0–3可立即执行，不需等待R118实施。

## Global Constraints

- 只写新的授权开发工作树；不改 R115 等冻结版本、main、Pages。按最终保留源/远端回执接续，不假设历史 remote-pending 仍成立。
- 108 逻辑人物；地面显示40/45m、预备60/70m，飞行120/140m、180/220m；原1ms准备预算、逻辑dt、21:00/06:00保留。**R118明确例外**：皇帝21:00改跑储秀西北床与后妃同躺，06:00跑回太和；原中和目的地与后妃东侧夜床映射由此替代，其它白天/人物/三床/屏无关语义保留。禁止借性能降频/少显人。
- 真实身体 .5m 方足、1.7m 高、现步高不改；不传送跳过坏路线、不缩身体、不添无形地板。普通路线、传送初始化、人物逻辑与人工高空压力分层。
- R107 缓存默认最多2区、32MiB已知资源、120秒TTL；不扩大预算换命中率，不保已dispose资源，不把未知内存记0。
- 等质量专项保持相同 quality、尺寸、光照、相机、视口、可见对象/陈设、材质采样、人物和昼夜；不是 R106 那类 low 减模。优化内部存储/构造可以，外显几何/像素数据/行为不能下降。
- 原全套1290=1114/176是 R115 历史实际结果，非合格豁免。原163＋新增13保 raw/expected，所有新红逐项分析；测试桥只允许有精确来源和反例的显式版本迁移，不全局放宽 hash。
- 五类性能候选要检查，不保证五类都有收益，不为凑号/凑优化提交无效改动；某类无收益是结论，不是阻止其它已授权目标推进。

## Review Focus

1. 启动未造完整远区时，地图/房间/夜灯遮挡/飞机高度包络仍完整，第一帧和首次到区不掉地（Task 2–3）。
2. 相同资源被成品、builder.kit.root、牌匾、owned材质与不同TypedArray视图共同引用，计量不漏、释放不早也不重复（Task 1/4/9）。
3. 人物相同 key 去重不吞姿态/座位差异，count缩少或hidden/LOD切换不复活旧slot、近处动态身体无对应隐形人（Task 8–9）。
4. 性能把初次阻塞挪到首次进区、把GC/统计计时混入热路径、只给中位不报尾峰时不得通过（Task 1/3/10）。
5. 新等价测试必须实际调用最终main启用的模式；旧fixture默认off、依赖被清理路径、历史hash guard未执行路线均不能冒充产品覆盖（Task 0/1/11）。

## File Map / 文件职责与权限

以下路径相对**新的实现工作树**，不是让规划代理修改冻结树。标“可改”的产品文件仅在对应实证候选需要时改；不得为名单齐全都改一遍。

|职责|新增或既有路径|
|---|---|
|共同诊断/计量（新增）|`scripts/r120-performance/{profile-process.mjs,paired-run.mjs,snapshot.mjs,summarize.mjs}`；`tests/r120-performance/{measurement-contract,equivalence,lifecycle}.test.mjs`|
|R116启动路径（可改）|`main.js`、`src/scene/zones/{ZoneManager,ZoneBase}.js`；依赖检查 `src/scene/sky/RoomNightLights.js`、`src/scene/flight/FlightEnvelope.js`、`src/ui/Teleport.js`；新专属小模块的精确路径必须在Task2短案中登记|
|R116测试（新增）|`tests/r116/{startup-readiness,metadata-consumers,first-entry}.test.mjs`|
|R117花园（可改）|`src/scene/GardenBuilder.js`、仅被热点证据点名的`src/scene/garden/`文件、必要时`src/utils/MergeUtils.js`；`tests/r117/{garden-equivalence,garden-lifecycle}.test.mjs`|
|R118接触（可改）|`src/controls/{QianqingAssemblySupport,ChengqianEnvironmentWitness}.js`、对应登记owner的专属模块；必要时共享接触机制，但不得先改全局步高；`tests/r118/{qianqing-low-platform,chengqian-wood-threshold,domain-handoff}.test.mjs`|
|R118皇帝/后妃夜间（可改）|附录列明`DailyRoutine.js`、`DailyRoutineClock.js`、`NightBeds.js`、相关路线/床数据、来源绑定与必要睡姿；`tests/r118/{chuxiu-northwest-bed,shared-sleep-slots,emperor-chuxiu-route,routine-clock,streamed-night-roundtrip}.test.mjs`|
|R119交泰（可改）|`src/scene/palace/special/{JiaotaiCentralInterior,JiaotaiCentralArt,JiaotaiCeilingFrame,JiaotaiDisplaySetting,JiaotaiLandmarks,SquareHalls}.js`中图证明确涉及部分；`tests/r119/{jiaotai-assembly,jiaotai-route,jiaotai-lifecycle}.test.mjs`|
|R120乾清（可改）|`src/scene/palace/{QianqingCentralSetting,QianqingCentralArt,QianqingCeiling,QianqingCeilingPaint,QianqingDisplay}.js`中确证部分；`tests/r120/{qianqing-assembly,qianqing-route,qianqing-lifecycle}.test.mjs`|
|人物专项候选（只在实测命中后可改）|`src/scene/characters/{CharacterSystem,CharacterManager,CharacterRenderer,CharacterResourcePool,CharacterWorkQueue}.js`；不更改角色数据/作息/预算来制造收益|
|证据/发布|`reports/r116-*`至`reports/r120-performance/`、`docs/current-state/r116/`至`r120/`；原raw只读。新增`scripts/r120-validation/current-state.py`，不用改旧driver覆盖旧报告。|

## Task 0: 绑定唯一实现树、原始基线及可用验证能力

**Consumes:** 主代理最终交付的 R115 source/remote 回执、清理后的保留清单。**Produces:** `reports/r116-baseline/inputs.json`，含parent SHA、runtime逐文件SHA、依赖与工具版本、原raw准确位置、设备能力状态。

- [ ] 在新树运行 `git status --short; git rev-parse HEAD; node --version; npm --version`，核父提交与实际runtime，不在冻结树修报告。
- [ ] 从 R115 跟踪文件读取415输入清单、1290原TAP/176名称多重集、R97拒绝/R107漏计与首返miss/R108边界；记录hash。任何清理后缺失材料先从保留Git提交或校验归档取回到只读baseline路径，不重建旧开发分支。
- [ ] 固定 `$BASELINE_ROOT` 与 `$WORK_ROOT` 为明确绝对路径；测试/成本driver不得再硬编码相邻r95/r105/r106旧目录。旧脚本提供参考协议，不直接复制过期输出路径。
- [ ] 确认候选真实GPU、手机、Node20可用性；没有就写 `NOT_RUN` 和准确能力原因，不重试已拒环境或改sandbox。CPU/HTTP工作继续。
- [ ] 将本计划和起点清单提交到唯一新开发分支；确认没有src/data/main产品变化。这是准备步骤，不单发产品版本。

## Task 1: 建立同一 driver 的测量与等质量证据合同

**Create:** File Map中四个`r120-performance`脚本与三个测试文件。**Reference:** `scripts/r107-lifecycle/paired-driver.mjs`、`scripts/r108-characters/cold-process.mjs`、`scripts/r112-interiors/cost-process.mjs`、`scripts/r114-courtyard/cost-process.mjs`。

**Interfaces:**
- `profile-process.mjs --root <absolute> --scenario <startup|garden|zone-return|characters> --quality <high|low> --out <absolute.json>`；一个fresh进程一个样本，使用root内实际产品和同一driver，失败exit非0；非本任务已实现scenario拒绝，不默默fallback。
- `paired-run.mjs --baseline <absolute> --candidate <absolute> --scenario <...> --quality <...> --pairs 5 --out <new-directory>`；5对10个fresh进程，AB/BA交替；候选与基线加载同一entrypoint配置。
- `snapshotWorld({scene,builders,zoneManager,collisionManager,characters}) -> {render,physics,metadata,actors,resources}`；CPU证据，明确未知项。渲染等价比较逻辑对象/世界TRS/属性索引/实际纹理像素及采样参数，不用UUID或聚合计数冒充。
- `summarize.mjs <pairs.json> -> summary.json`；原样保各样本/每对delta、最近秩p50/p95/p99/max、首样、无丢弃；每个指标附单位/协议，禁止合并不同测量域。

- [ ] 写measurement RED：相同root两边snapshot精确；错误root/脏源/缺输出/候选异常退出必须失败；同backing不同subarray不能少计；重复引用不能多计；未知纹理保unknown，不写0；统计测试固定 `[1,2,3,4,100]` 的最近秩p95/p99/max均100。
- [ ] 运行 `node --test tests/r120-performance/measurement-contract.test.mjs`，保存RED；当前函数缺失是预期，不改旧tests。
- [ ] 实现driver；计时用 `process.hrtime.bigint()`，检测测试fixture覆盖performance时不能拿假时间计CPU。性能计时循环和重型等价快照分开采样，且绑定相同源码/输入。
- [ ] 分阶段记录build/merge/register/firstQuery/dispose、每帧原始CPU、人物actual submitted首帧；memory记录heapUsed/external/arrayBuffers/rss，资源以全世界唯一ArrayBuffer/texture身份去重，覆盖loaded/prebuilt/inactive/library/常驻Garden/原构建图。支持时GC在测量边界两边同样调用，不能逐帧GC。
- [ ] 运行上述测试GREEN，再做同一baseline的5对A/A控制样本，冻结每个场景/指标的噪声范围与采样协议；不读候选结果后重设门槛。高/低同档分别测，CPU图不能解释GPU差异。
- [ ] 提交诊断工具和完整A/A证据；审核者检查driver实际导入和运行配置，尤其reuseInactive确实同main启用。准备工具本身不占R116成果。

## Task 2: R116 首屏依赖闭环与可落地短案（诊断门，不盲改架构）

**Read/possibly modify:** File Map R116路径。**Create:** `reports/r116-startup/ownership.json`、`docs/current-state/r116/STARTUP-CONTRACT.md`、R116三份测试。

**Consumes:** Task1 startup分项；实际`ZoneManager.init(scene,library,cm,initialPos)`、`ensureLoadedAt(x,z)`；`createPalaceFlightEnvelope`。**Produces:** 一个精确候选合同，列出同步必需、可去重、可延后工作，owner/可见性/碰撞就绪时刻与恢复规则；接口新增签名和精确文件路径写入短案后才进入Task3。

- [ ] 用startup driver对R115跑high/low各一轮诊断：区分TextureLibrary、Palace、Enclosure、Garden、七区build、FlightEnvelope、RoomNightLights和控制器ready，实际计数，不用旧R107数字代当前实测。
- [ ] 列出每个首屏消费者需要何种数据：地图目标/regions/rooms、夜灯遮挡、飞机标量网格、人物source binding、spawn与首访collision。说明哪些目前只能从生产几何导出；不得用JSON粗包络冒充全部真实几何。
- [ ] 纳入已授权R118依赖：皇帝静态区→west-six长路线、后妃西北睡床owner与夜灯分区必须在远处逻辑/近处模型重入间保持同一状态；现`staticRoutineNavigation`只引用当前colliders，`DailyRoutine`对非ready白天zone会reset。R116不得使必要导航/床source失真；不靠永久加载西六宫全模型规避。
- [ ] 建立`metadata-consumers`行为RED：首屏没有完整远区成品也不能缺任何既有地图目标/room/region；飞机原高度/水域网格和夜灯遮挡判定在固定场景一致；非法/陈旧源失败关闭。先验证旧全预建实现自身参考可靠，再将“远区尚未完整build”的候选目标断言设RED。
- [ ] 在同一现有栈内选择最小可逆方法并写STARTUP-CONTRACT：明确真实工作减少或可操作前长任务减少，不将一秒阻塞藏到首次到区；保原同步ensureLoadedAt语义直到替代入口经过独立安全审查。
- [ ] 若唯一可行方法变成Worker世界重写、跨版本持久缓存、改变飞行可用性/启动功能或需要增预算，则向主代理报告具体范围/原因，暂停该依赖部分；继续其它已授权任务。不得以“R120增量”自动扩授权。
- [ ] 只读接口评审通过后进入Task3；本诊断未产生运行收益时不可发R116完成声明。

## Task 3: R116 实施并验证真实首次启动收益

**Consumes:** Task2已固定的候选合同及文件白名单。**Tests:** `tests/r116/*.test.mjs`；现有`r106-*`、`r107-*`、`r108-world-cache-contract`、`r48-zone-flight-envelope`和输入门。

- [ ] 写startup-readiness/first-entry RED：第一次可操作时出生支持有效；未访问区首次步行接近、地图传送、飞机到区均不会观察未完成几何/无碰撞；dispose或更新到达途中不会旧任务复活。
- [ ] 运行 `node --test tests/r116/*.test.mjs`，保存真实失败；不要删旧全预建参考以使RED消失。
- [ ] 仅实现Task2明确方案；逐步提交，不修改角色数量/LOD距离、纹理、画质和几何细节。
- [ ] 跑R116门＋受影响的质量/cache/地图/飞机/灯光门，核原有效路线、未知源拒绝、构造/释放次数；相同最终世界render/physics/metadata快照必须匹配。
- [ ] 跑Task1相同协议5对fresh high/low，报startup与首次进入/重返所有首样和尾峰。只有目标收益超过冻结噪声且无相关尾峰/内存/首访回退才采纳；否则恢复候选运行改动并报告未完成。
- [ ] 唯一实现人提交已采纳运行+测试+raw，独审绑定准确hash。R116只报实际达到的启动范围，不称首载/Garden全解。

## Task 4: R117 Garden 常驻构造与资源热点

**Files:** File Map R117路径；已拒绝`DuixiuOuterRock`行缓存作为负证据，不复活。**Produces:** 同一成品Garden下可证明CPU或资源收益，不改变自然山体造型。

- [ ] 在R116最终源诊断Garden地面/水池/亭/院物/山体/合批/树/登记/索引/释放，首建与显式rebuild分开。额外检查有没有成品与临时源图并存强引用，不假设一定泄漏。
- [ ] 写`garden-equivalence` RED：相同最终所有geometry属性/index/材质像素/世界TRS、地形owner与碰撞/支持结果；任何更改几何/山路/树数量/LOD/水面为负例必须失败。资源候选则另写共享两实例、反序释放、double-dispose、重建与源世代RED。
- [ ] 运行 `node --test tests/r117/*.test.mjs` 保存RED，再实现只由热点支持的重复工作消除/同质几何复用/安全源图释放之一；复用必须显式owner，不把库纹理当临时资源dispose。
- [ ] 跑Garden门和实际堆秀正常路线/接触门；不可把合批相同当真实碰撞等价。
- [ ] 按Task1跑5对Garden首建与rebuild；真实heap/external/arrayBuffers/rss与资源计数全部报，未知项照列。GPU显存不能由CPU字节外推；历史+182ms只在对应同协议被验证时关闭。
- [ ] 采纳/拒绝按Task10同门，提交实际成果和负样本；未采纳则R117目标保持未完，不挤掉后续两殿工作。

## Task 5: R118 两个接触修复＋皇帝/后妃西北同床作息

**Files:** File Map R118；参考`tests/r112/floor-source.test.mjs`、`tests/r114/wing-entry.test.mjs`和前版独立实际轨迹。

- [ ] 从准确R115/R117源复现乾清低台3/10/20、承乾木槛4/16/32旧轨迹，使用同一成品面与完整body，确认具体owner/空间，不按旧文档数直接写PASS。
- [ ] 写三个R118测试RED：10/30/60普通往返无正交叠、横移松键/空中进域/离域、木槛有实体却不封门；缺源/同数换源失效，保持旧域外行为。
- [ ] 运行 `node --test tests/r118/*.test.mjs`保存RED；只做同源有限域实体登记/支持交接修复，不缩身体/改全局步高。
- [ ] 跑R118＋`tests/r96-movement/*.test.mjs tests/r109-*.test.mjs tests/r112/*.test.mjs tests/r113/*.test.mjs tests/r114/*.test.mjs`，再独立真实整世界目标连续路线；全身与render面检查不能被feet单值代替。
- [ ] 用同协议记录新局部CPU代价、跨域/人物/缓存卸载重入；提交局部通过与保留限制，不宣称全园接触无错。
- [ ] **执行附录A–D全部子任务**：实际定位西北床（不是东床/白天北炕混用）、双slot身体/成品接触、皇帝原速连续夜归/晨返、午夜与调时及真实streamed重入。只有接触修复而缺新作息，R118仍PARTIAL。
- [ ] R96中和夜坐与R78一人一床/旧夜灯工作房等旧合同，不再当“不变保护”要求硬跑全绿；保历史raw/expected，新增精确R118需求合同与明确变更白名单，负例继续覆盖未知床/错方位/重复slot。人数、其它人作息和太和白天座位仍需保护。

## Task 6: R119 交泰成组主视觉实改

**Files:** File Map R119；原参考`docs/current-state/r112/WHOLE-BUILDING-READONLY-LEDGER.md`。

- [ ] 读取并实际查看已索引正面/钟侧参考；在当前ready（非paint fallback）成品建立相机/FOV/光照记录，把屏框、藻井/悬镜、内檐明确差异写成参考区域→对象→验证；未证实差异不改。
- [ ] 写`jiaotai-assembly`真实成品RED和`jiaotai-route`保护四门/钟漏/后绕行；新增或改变可触实体必须匹配成品面。低档现有织物不回退，未知铭文全文/罩下陈设不造。
- [ ] 运行 `node --test tests/r119/*.test.mjs`保存RED；按组合实现，不以单联/花边代整室，保存同机位前后实际输出。
- [ ] GREEN后跑 `tests/r106-{detail,textile}-quality.test.mjs`实际存在文件（命令展开先核）、交泰原相关门与生命周期；记录新增构建/材料/几何/纹理成本，对照R118而非更早慢基线。
- [ ] 独审图证/物理/成本后冻结R119。没有GPU则图形为CPU诊断、最终视觉VERIFY_PENDING，不假称全室实机验收。

## Task 7: R120 乾清主空间实改，并冻结“优化前等质量基线”

**Files:** File Map R120乾清；继承四炉、三门十二叶、四器架实际碰撞。**Produces:** `R120_PRE_PERF`准确提交及`reports/r120-performance/pre-perf-inputs.json`。

- [ ] 同Task6方式对乾清中央五屏/宝座前案/三路阶栏/器架/无藻井天花锁定成组差异，真实paint ready后比图；未知暖阁/仙楼不新增家具。
- [ ] 写`qianqing-assembly` RED与`qianqing-route/lifecycle`保护：门→中央→侧绕→返回、四炉/器架同源接触、域出口和exact release。
- [ ] 运行 `node --test tests/r120/*.test.mjs`保存RED，实施确证组合再GREEN；不能重报R112四炉/折叶为新成果。
- [ ] 跑所有受影响R112/R118和两殿保护；记录建模本身的CPU/资源新增成本。
- [ ] 提交乾清实际改动并冻结 `R120_PRE_PERF`。后续专项直接比较此成品，不拿R115简化形体、low对high、较少人物作基线。另保留R115→最终R120累计对照。

## Task 8: R120 用户增量专项——五类真实热点筛选

**Files:** `reports/r120-performance/{candidate-ledger.json,baseline/}`；仅诊断，不因候选名称先改产品。

**candidate-ledger 每行合同:** `id, category, sourceHashes, hotspotEvidence, proposedFiles, preservedOutputs, targetMetric, counterMetrics, expectedMechanism, risk, decision`；decision只能`MEASURE_NEXT / REJECT_NO_BENEFIT / BLOCKED_SCOPE / ACCEPTED`且每项有证据路径。

- [ ] 对 `R120_PRE_PERF` 跑startup/Garden/zone-return/characters high+low同协议；首屏用真正main阶段或明确标CPU构建代理，不混浏览器下载。
- [ ] 分类检查①重复构建：真实buildCount/key，是否重复同世代同档成果；②材质/几何复用：不可变同字节对象、材质采样/UV/TRS与owner；③人物更新：实际热点而非frustum调用数量；④资源释放：源图/成品/池/灯/S内景引用；⑤首屏阻塞：是否仍有无需阻塞的已知工作及first-entry代价。每类至少给当前源证据，即使结论无可做项。
- [ ] 将R97三个已拒候选逐一对照：除非当前有**新热点或失效前提变化**，不重复照搬；明确静态矩阵microbench不能证明实际world更新/人物首显改善。
- [ ] 按影响最大的有证据候选逐个选入，不并行改多机制后无法归因。优先无新架构、无外显变化的小边界改动；候选收益目标/尾指标/资源上界在实现前冻结。
- [ ] 对Worker/异步全世界流式重写、持久缓存、扩大cache、变少人物/降低画质/降频等标`BLOCKED_SCOPE`或直接拒绝质量降低，不用本次性能授权自动扩大功能。其余已授权任务继续，不重复问同一R120增量是否做。

## Task 9: 每个选中性能候选的统一 RED→GREEN→保真→成本循环

**Files:** 仅该ledger行`proposedFiles`；`tests/r120-performance/{equivalence,lifecycle}.test.mjs`及对应新定向测试；旧历史测试不删不改expected。

- [ ] 先写可失败的机制/保护测试：重复build必须识别真实同源key；复用必须保持全部像素/几何/材质采样；人物固定时间每帧actualSubmitted IDs、矩阵/bounds、动态体、占位相同；释放必须每自有资源恰一次且共享活引用不受损。
- [ ] 人物候选额外覆盖：count减少再增加、LOD/姿态/座位切换、hidden/开关、21→06、快速到离驻留边界、近处阻塞后退出、source同数更新；少跑时间/调1ms预算都不是合法优化。
- [ ] 运行 `node --test tests/r120-performance/*.test.mjs`保存RED；实现单机制最小修改，运行GREEN。所有等价报告与性能报告绑定准确src/content hash，不重用不同候选的测试绿。
- [ ] 跑受影响实际world门：人物用`tests/r96-characters/*.test.mjs tests/r96-emperor/*.test.mjs tests/r108-world-cache-contract.test.mjs`；资源/分区用R106/R107/R116门；共享MergeUtils改动须跨同类构建器验证而非只验目标一宫。
- [ ] 先跑5对fresh完整目标场景，再跑风险counter场景；保所有cold/warm/first-return/p95/p99/max和memory。不得调相机、样本量、初始化档位直到“赢”，新增合理场景需两边同跑并注明。
- [ ] 独审按Task10判采纳；不通过则还原该候选运行输入（不回退已采纳两殿/前版），保RED/负raw与ledger拒绝理由。每次只提交一个已采纳机制；所有候选都拒绝时专项可以报告“未发现可信余量”，但不能宣称新增加速。

## Task 10: 等质量专项验收标准与累计归因

**Produces:** `reports/r120-performance/ACCEPTANCE.md`和机器可读summary；以下是保守工程门，不是用户承诺的百分比目标。

- [ ] **保真硬门：** 所声明优化范围的最终世界几何/材质像素与采样/世界TRS、陈设/人物数、地图/rooms、物理/实际路线、日夜关键状态不退步。数据改组导致数组顺序不同可用独立语义三角/实例映射，但必须逐对象严格验证、带变异反例；不只比较总tri或截图均值。真实GPU观感未验则单列。
- [ ] **CPU目标：** 五对同目标指标均改善，配对中位改善超过Task1预先冻结的该指标A/A波动范围；首样、p95/p99/max、首次返程与counter场景无超过对应控制噪声的回退。若噪声过大无法区分，结论不确定，不据此采纳或称提速；不能只挑median。
- [ ] **资源目标：** 如候选主收益是内存而非CPU，必须确定性降低相同成品状态下唯一可达资源成本（不是视图长度），整世界peak和关键CPU尾峰不回退；不把unknown被省略当节省。heap/RSS/GC样本仅支持，不能单独证明释放正确或显存节省。
- [ ] **两组对照分别出表：** A=`R120_PRE_PERF`→专项后（等质量优化归因）；B=R115→最终R120（功能与性能累计总体验）。两殿新增模型成本与专项节省分别列，禁止跨协议相减伪称全面加速。
- [ ] 独立复算raw、五对顺序/源hash/异常样本与scene清理计数，记录每个候选接受或拒绝。目标桌面GPU/手机若可用，以同版本同设备真测，不将模拟30Hz帧编号换实机秒数。

## Task 11: R120 major A 累计、原红诚实分诊、产物与交付

**Files:** 新`docs/current-state/r120/{requirements.json,VALIDATION.md,MAJOR-RELEASE.md}`；`scripts/r120-validation/current-state.py`、必要身份/包测试；不篡改旧docs/reports。

- [ ] 冻结运行源与完整变更白名单，执行受影响共享回归与R116–120新门；输入交接/地图/时间/飞机与108人物当前实际模式重新验证，未实际执行路线留NOT_RUN。
- [ ] 复制原全量隔离报告逻辑到新driver，只把基线/TAP/输出路径参数化。先做166自身HEAD固定夹具预检；原current-state全套一次如实保exitCode/176基线名称多重集/新增消失逐项理由。新13从R115继承不是本轮新修，桥接合同不等于原expected自动转绿。
- [ ] 真实构建三base：`npx vite build --base=/`、`npx vite build --base=/gugong/`、`npx vite build --base=/forbidden-city-3d/`，各输出用隔离目录/精确构建命令记录，避免覆盖前一产物。保存日志、sourceDirty=false、fingerprint/buildId；按当前`package-production.mjs --help`或实际参数先核再打包，不猜参数。
- [ ] 独立核产物manifest、public字节、loopback HTTP、三个base解析、启动器与包无extra/漏文件；CPU/HTTP全过不能替代GPU/手机/真实Node20。
- [ ] 单列R120发布说明：实际采用收益、两殿范围、所有拒绝候选、未做/未验、内存/尾峰代价、准确source/build/remote identity和可回滚父版本；用户自行merge/deploy，不动main/Pages。
- [ ] 唯一上传负责人按现授权上传开发分支并完整读回；没有确证收据不得称远端已交付。回滚保留；后续R121只能接该准确累计运行基底。

## Plan Self-Review / 计划核查

- 用户R120增量由Task8–10直接覆盖；不要求再次批准同一范围。Task6/7保留真实两殿成果，不把性能调查替代建模、也不以调查本身撑一个空号。
- 用户R118新增由Task5及独立附录A–D覆盖；R120_PRE_PERF必须已经包含新双人夜间作息，性能优化不允许恢复中和短线或少显示皇帝/后妃来赢数据。
- R116具体机制尚需Task2实证依赖闭环；这里明确该前置决策及输出合同，不假装已经证明可安全删除全部预建。Task3只实施其审定的有界方案。
- 冻结版本/单一实现/不改main-Pages由Global Constraints与Task0/11覆盖；质量、人物、昼夜、通路、资源/内存、CPU/GPU区分均有指定验证任务。
- 所有命令在未来实现树执行；本规划更新只读产品源码，未运行性能、未制造RED/GREEN或成功结果。
