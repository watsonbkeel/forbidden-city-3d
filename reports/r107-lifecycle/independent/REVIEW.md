# R107 分区离场复用独审

当前候选f735a75998c533c0dd05e561429123c0d5407fb2，三运行路径SHA见source-f735.sha256，基底R106 f776。**限定功能生命周期门通过；正式五对成本尚在运行，最终性能取舍待全样本，不提前全面通过。** 不改产品源码。

## 范围与真实限制

这不是首载优化，也未修Garden常驻构建约+182ms回退。已有7区初始prebuilt仍全建；候选只保留短期离场资源避免重返重复构建。最多2区、32MiB几何数组+已知自有RGBA8/mip估算、120秒离场TTL；原prebuilt、active、共享library、CPU对象/碰撞索引和JS堆不在这32MiB里，不能称总内存被限制为32MiB。未知owned纹理类型/尺寸保守不缓存。当前主入口显式开启，其他构造调用默认关闭。

## 独立实际功能

actual-zones.mjs以真实east-six/west-six ZoneBase、真实ZoneManager与CollisionManager执行update驱动空间切换（空间采样压力，不是无障碍步行路线）：
- 离场原group不在scene、CM不留该tag、onUnload按原mesh身份移除shadow；未dispose可复用资源。
- 重返取相同builder/group，原几何与物理盒值精确，无重复注册；从inactive移出预算。
- 人工推进120秒，过期释放、重进重建；已loaded低/高档不强重建，旧档离区不缓存，后继重新按当前low构建。
- rooms/map/regions JSON精确，额外独立tag不受zone卸载影响；dispose幂等、scene/shadow/cache最终清空。额外tag是模拟独立owner，不冒称实际S GLB已由此跑过。
- 普通held staticRoutineNavigation仍保创建时数组快照，新建clone读取当前源；这是R106既有语义，不误写成所有held普通碰撞实时刷新。

oversize-roof.mjs实际完整宁寿：几何36,426,432字节已超过32MiB，且某owned纹理未知被提前保守拒绝（Infinity在JSON为null），不能把此例说成纯maxBytes分支独测。实际卸载不缓存；held导航中的3个锡庆roof live owner卸载为0，重建3面源JSON精确，再dispose为0。无三角/适配器改动。

证据actual-zones-4b8e.json/log、oversize-roof-4b8e.json/log，绑定4b8e功能阶段。后继仅LRU last-use与录取原子规划，几何/注册/卸载/TTL/quality机制未变；分层复用不伪称全部矩阵在最终hash重跑。

## 发现并修正的录取问题

42ed在同帧卸载中以真实lastUsedAt替代Map插入先后，避免旧邻区踢走刚访问区。本审随后发现二次驱逐失败：容量30，old10@10/new10@30，incoming25@20，旧实现先删old再因new更新拒incoming，白白丢旧可用cache。admission-atomic-42ed-red.tap保存。

f735先规划全部victims，确认能够录取再统一release；独立同一RED→GREEN，pending保护/预算不变。source diff仅此局部，无新资源范围或控制逻辑。

## 性能协议审查

writer paired-driver：两版每次fresh Node、同low、同7实际分区、production FirstPerson/Teleport.go承乾↔储秀8次和TTL后返回，5对交替顺序，所有样本保留。明确TELEPORT_SETUP，不是步行连续游宫；只含7流式分区，不是常驻Palace/Enclosure/Garden完整场景；Canvas调用fixture不是浏览器图像。双方用同只读candidate资源统计函数，不改变基底运行行为。

GC后仍有library/manager元数据等同进程活引用；剩余heap不能自动称泄漏。UNKNOWN texture entries令已知bytes只为下界，不可当全显存。正常update每帧prune；直接load命中prebuilt或unload拒旧档可能不访问cache，TTL在下一update清理，不夸大每次任意调用立即清理合同。

## 五对正式成本读回（2026-10-26 14:59 UTC）

本审读取writer paired-final全部10个fresh过程，不重新制造测量样本，独立重算见cost-independent-readback.json。

|指标|R106|候选|
|---|---:|---:|
|7区初始化5轮中位 ms|4115.943|4130.783|
|30次重返中位 ms|1475.493|1022.699|
|重返p95（最近秩）ms|1979.784|1458.966|
|重返p99/max ms|2053.083|1462.546|

每对对应Teleport返回点位、真实feet、loaded列表全部精确。候选east-six构建5→2（含TTL后重建）、west-six4→1；其他大区仍因邻区需要而构建，故重返仍约1秒，不称无卡顿。首载没有可信改善。

最大观测inactive 33,329,760字节，小于32MiB；仍然是换取短期内存驻留的成本。初始全部prebuilt使两版观测总geometry最大都122,054,712字节，knownTexture最大60,917,128字节；不能由相同峰值推断离场阶段毫无额外驻留。UNKNOWN storage entries不计作0显存。

全部过程最终colliders/walkables/sceneChildren/cacheBytes为0。baseline GC后heap两轮约157MiB、其余约43MiB，候选约43MiB；异常及全样本保留，未定位原因，不能声称修复内存泄漏。

限定重返收益成立，预算/资源释放门有证据。实际S GLB与cache交接尚待writer最小组合门；本审外部tag只证明独立owner不受zone标签误移除，静态InteriorLoader所有权分离不能冒称完整S实跑。R110累计/GPU/手机仍另验。

## 15:03 预算门重新阻断（覆盖上述预算通过口径）

writer自查提出并由本审源码独立确认：CourtKit.finish保留kit.root原始构建图，MergeUtils只dispose源geometry，不释放其attribute数组；kit.plaques另持原mesh/frame。因此inactive entry→builder→kit可以强持已dispose但仍有CPU数组的源图。原zoneRetainedResourceCost只枚举data.group，33,329,760字节不是全部被保留数组，不能据此声称实际保留资源低于32MiB。

所有旧五对原样保存，仍说明旧实现重返耗时；**预算门暂停，不放行该最终性能候选**。需要正确计入merged+source root+plaques及owned材质未显示map，或有界且经精确证明地断开废构建引用。不得全局改CourtKit.finish重复语义；修后重新绑定相应成本/资源，不自动沿用旧五对。

## 15:09 修正资源所有权门通过，最终新五对仍待

运行源bd80be20（证据尾75c752d5运行相同）：仅在ZoneManager准备inactive录取时调用ZoneBase专用releaseConstructionReferences；已完成group必须不同于kit.root，清root.children与plaques，不dispose源/成品，不改通用CourtKit.finish或初始active/prebuilt行为。cost现在遍历merged、未清source root、plaques及所有owned材质，geometry按唯一ArrayBuffer全backing字节计量，并保留logical attribute字节单列。

本审release-sources.mjs在真实高档east/west输出上验证：全部成品属性/矩阵/visibility/userData（含architecture）、LOD levels、collider/walkable/rooms/map/regions精确；owned/ownedTextures引用保留；重复调用0活geometry dispose。实际东1个Yanxi LOD层级和parent保留，最终全部活geometry各dispose一次。源几何可达字节下降east7,682,628、west7,620,156（高档测试，不与低档数据混用）。日志release-sources-bd80.json/log。

实际S组合亦已新鲜执行：真实Yangxin GLB+InteriorLoader加载→西区B离场进入cache（仅B tag移除，S仍在scene及CM）→S卸载（原S geometry各dispose一次，group/tag/lights归零）→西区同一builder/group重新激活→最终dispose场景/CM归零。s-layer-bd80.json/log。此为显式生命周期次序压力，不是连续步行/GPU体验。

预算功能修复已通过；旧f735五对保留于paired-f735-incomplete-accounting，不再用于最终资源上限。新五对按修后运行源及全buffer/owned计量重新执行，待最终读回再给性能放行。

## 15:21 新预算成本拒绝与唯一访问年龄修复

bd80完整计量五对（writer `paired-bd80-first-return-miss`，本审 `cost-bd80-independent-readback.json`）重返中位1449.720→1047.468ms，但p95 1973.387→2094.433ms、max2096.025→2380.754ms，首返东4/5更慢。root明确拒绝直接采纳；不得引用早先不完整计量版本作为此版性能通过。旧14:59独立成本文件现名 `cost-f735-incomplete-accounting-readback.json`。

原raw实际首返east仍buildCount2：离east后cache仅outer-east。静态独立确认后台邻区load也获得更晚lastUsedAt，将真实访问east挤出。aba575100aa7b7542fba8e3160b9fe0709c38136仅修loadZone年龄：当前区才记now，后台保留旧age或0，不变预算/TTL/几何/碰撞。writer最小3区RED已有旧失败，本审复跑该回归通过（visited-age-aba575-green.tap），非独立新造同等测试。

本审额外单次实际7区phase插桩已运行，JSON记录commit/hash明确属于aba575，不是旧bd80（初始文件名有误，已改名phase-aba575.json/log）。首返east load .723ms、无east build，axis build480.663ms与ningshou build733.347ms仍主导1265.747ms总耗时；离east阶段每区清源.028–.132ms、预算枚举.18–.41ms。嵌套方法计时不重复相加；单次插桩只作因果定位，不作正式配对性能结论。不推测GC免责。

最终新五对仍待全量读回；旧负数值/原始日志保留。不得把本版范围描述成首载或Garden重载性能修复。

## 最终限定结论：aba575 短期重返门通过（15:22 UTC）

本审从最终10份fresh raw重新计算而非抄summary，见 `cost-aba575-independent-readback.json`，运行四源绑定 `source-aba575.sha256`。5对对应point/feet/loaded列表逐值相等；首次返east每对均更快，且构建计数2→1。所有进程最终scene/CM/cache归零。

|指标|R106 f776626|R107 aba575|
|---|---:|---:|
|30次短期重返中位 ms|1474.068|987.164|
|重返p95 ms|2115.798|1358.822|
|重返p99/max ms|2184.977|1432.334|
|7区初始化中位 ms|4304.113|4221.905|
|7区初始化max ms|4505.462|4548.429|

完整计量最大inactive29,048,756B，小于32MiB；最多2区/120秒条件不变。初始总geometry峰值两版199,456,918B、known纹理63,713,328B另1unknown不变；该预算不等于整个JS heap或实测GPU显存上限。初始化max略退，**不宣称首载提速**。即使命中east，邻区axis/ningshou仍同步重建，当前重返仍约1秒，不称卡顿消失。

独立功能证据复用边界：实际双区/TTL/quality、Ning超限与held roof live-source、真实S离场卸载再入、source引用释放/真实LOD/重复dispose等合同在前述source检查点通过；aba575唯一变化为访问年龄，已单点复验及全实际新五对精确点位/加载状态验证。未改几何/控制器/人物，不重跑旧物理矩阵。普通held导航快照保留旧语义，不称全部快照实时化。

**允许进入R110累计候选，限定为有界短期分区重返收益。** R106低档效果保留，Garden常驻构建/重载、初始全预建峰值、真实GPU/手机与连续无障碍游览不是本门已解决项。原f735漏计预算、bd80首返退步和最终所有样本均保留，不以最终通过覆盖失败历史。
