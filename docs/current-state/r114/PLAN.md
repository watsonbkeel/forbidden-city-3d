# R114 承乾前后院主要空间组合：一次有界候选

基底 R113 `da6bc5ac450139e90cdbb864f57fee64ca15baed`；sole writer，新隔离树；release保R110。root18:54批准中央前凸月台方案，20:40前冻结/明确未完，21:54 R115累计截止。使用 writing-plans/executing-plans/TDD；局部门与独审逐项，非编号凑完成。

## 来源/完整分母

已亲看官方gallery04（s5e980b05dbe20.jpg）及前研五图哈希；图04证宽月台、中央阶、一侧院间门短墙；官文236438证两前配三间硬山。图左按面南殿常规摄影推断西侧(+X)，无罗盘，单侧可逆MODEL_FIT，不对称复制未知侧门。所有米制数是工程拟合，不是照片测绘。

WHOLE-GROUP-READONLY-LEDGER保11对象×E1–E8/I1–I6。后院两配/两耳房/井亭、未知整栋内景不能因本组合删除；当前后院8.65m纵深不足复制12.2m前配，北余量.4m等具体冲突保留。R111山体五类仍未完成。

## 已选择的唯一组合

1. 原主殿平台/壳/四南窗/床屏不挪。前接中央约23m宽×1.6m深月台，避免全宽拉伸新增侵两前配角部。新真实分块mesh/box/walkable，不以一个全宽幽灵盒代台面。原中央4级阶和2垂带/唯一ramp前移1.6m，旧阶不留隐藏支持。
2. R109仍原唯一主平台owner；同次query读取新旧真实平台，专用post-register将该实例域北界延回原374.55，覆盖新旧373.75/373.8接缝及前凸两肩。无改SAT/身体/步高/FP/全园支持数学。
3. 西侧一座真实净宽2m院间门＋短墙，拟中心(-76,380)，避前配北端后；具体净距实测锁定。门框/短墙真实盒；小型低面闭合山形门罩取真实成品Float32面，只复用既有surface原语，无新算法/平盒替斜面。独立有限ordinary域保门旁原台沿全足交接，Environment0不添地板。未知背面/门神/铭刻不补。
4. 两前配仅精确11/12 hardGableEnd=true，保其它声明/UNKNOWN库存策略，不改通用默认或其它宫。
5. 三床日位/床端/速度/21:00/06:00不动，仅必要阶口路径前缀重配；原地面验证surface收紧到未被新台阶覆盖范围。以真实导航重新验证，不把任意Y写成已验。

## 任务/预计时间

- 19:00–19:15：真实源清单/邻接RED、单owner/ramp/硬山RED，冻结原source/地图/床屏；实现前明确选择器。
- 19:15–19:40：专用组实现＋同机位图；新源量化、非目标全属性保持、source clone/update/卸载。视觉若不成立不刷第三档。
- 19:40–20:10：独审实际中央阶/接缝/两肩、单侧门前后院往返10/30/60；合法跳/落/头顶、夜归三床与前配入口、原后殿保护。
- 20:10–20:30：唯一真实局部成本、共享小门/root smoke；若硬阻点未闭合如实保RED/部分，不牺牲R115窗口。
- ≤20:40：运行冻结、完整差异账与成本、独审尾读。184/全套/三base/包只R115一次累计。

## 停止门

全宽平台方案已因新增侵前配角部拒绝，不能重新偷偷使用。新中央月台/一侧门若需改全园solver、挪外墙/主殿或删除床/缩身，停止报root；不临时扩范围。未知后配不凭通用屋复制填满。成本不混R106收益；GPU/手机/实机Node20未验不PASS。

## 19:07 root 批准的必要源端接入补充（不是新通用 solver）

实际 kinematic 原起点仍在原 Environment 地面，但最后 .25m 进入已批准两有限域时，原域内 ground witness 尚未覆盖源点。只为 `stair-interface/chengqian-front-stair` 与 `chengqian-court-access/chengqian-west-court-access` 精确成对标记提供现存 Environment 地砖来源见证。Environment 仅加 source metadata；ZoneManager 初始化/销毁绑定弱引用；新增 helper 仅缓存固定局部 X[-110,-72], Z[369.5,384] 相交三角，不每帧全地面扫描。无新地板/高度/身体/步高/碰撞容差，不改原数学或其它旧域。

来源必须仍挂同一 identity scene，auto world/local matrix 开启且 TRS 为原值、可见材质/mesh/scene、完整 drawRange；非有限/零面积源不见证。源 geometry/BufferAttribute 数组更换或 needsUpdate.version 变化使局部缓存失效，遵循真实渲染属性更新合同；不声称未通知渲染器的原地数组写入也自动追踪。移除/卸载后立即无见证；缓存只存弱引用和局部数值，不强持整 scene。

运行批准共9路径：night-routes.json、surfaces.json、FurnitureMotion.js、XiqingRoofSurface.js、Environment.js、ZoneBase.js、ZoneManager.js，加 ChengqianCourtyardGroup.js / ChengqianEnvironmentWitness.js。不修改 Collision/FirstPerson/XiqingSurfaceExact。前台新 slab 南沿与真实砖/坡终点372.15齐平（不增加悬挑），避免新增.06前挑造成 .05 kinematic 精确落脚断层；北沿373.69接原 slab。旧.61可见帽/.6工程平台和.05旧砖登记差异明确保留。

初夜路旧前缀失败、原新帽前挑返程失败、来源手动矩阵/变换反例均保留，不把 WIP 日志 sourceCommit 的计划HEAD视为最终代码身份；最终冻源后夜路再绑定。照片只证形制，23m/1.6m/单门位置及简化门罩均 MODEL_FIT。

## 19:32 root 单西前配必要布局例外（一次候选，20:00停止门）

独审真实中央阶上台后的侧绕仍被旧前配/主殿实体相交截断，外绕仅.2m。完整29mesh包络证：仅西前配/12南移3.5m，Z370.6→367.1后全可见Z[360.94000015,373.25999985]，与南墙北面360.7不相交；北墙373.05至主柱374.21净1.16m。JSON和严格UNKNOWN inventory归一化同步，父frame派生所有mesh/box/map/room门/spawn；东配不移动，身体/全区墙不变。

**明确代价：西配南端原3.74m可走带缩为约.24m，不再可走。** root允许用于恢复有图证的前后院联系，因为目前南端无门死端；但必须证无当前人物任务/spawn/地图落点被困、原内向入口进退和北新通道walk/run/backward完整通过，不称零通行损失/实测。20:00前若未安全闭合撤这一候选，不盲增移或缩主体。

新增两个批准路径：data/zones/east-six.json、EastUnknownAnnexInventory.js，累计11运行路径。原脚本/7c8b失败图日志保留，新的构图/性能均需新源绑定。

### 19:37–19:42 原低台真实源与原入口闭环

西配ph.45旧通用kit仅center walkable、没有真实台明box；新北路实际脚底落下切入原可见砖。因此root批准仅从该实例原砖/帽mat、TRS、Float32bbox及原walkable精确核源登记两盒（不新增render），既有侧门域南延372.5。北通道1498成品三角含帽重验零穿，但实帽新增挡住原内向门；root19:42批准唯一原门口窄域X[-83,-79]/Z[365.8,368.4]，独立ID chengqian-west-wing-entry挂同一真实砖owner，复用数学/真实Environment，固定source patch南界延365。无新坡/支撑面/整殿扩域，20:00截止不延。

fixed-patch缓存筛三角AABB不等于query限域，独审实际远移marker反例已证；helper现显式query限patch，原RED保留。源guard数值实读失败（.42 vs .45-.03、maxX不同double）如实留日志，实际精确值修正而非放宽epsilon。

### 19:53 最后合法跳跃 RED 与来源分派修复

真实地面在新门楣下起跳可顶头但随后穿原Environment0下降至地下；根因是现有zero-plane下降TOI只认source='environment-ground'，新已验证helper为了保来源标签返回existing-environment-ground-r114-handoff，漏入同一既有分支。root批准仅显式白名单该来源进入原0高TOI，无数学/重力/容差变更。52aa349c纯实际Environment+header三fps起跳/落地与删除源failclosed RED→GREEN，最终全world独审另绑，不以纯门代真实门。
