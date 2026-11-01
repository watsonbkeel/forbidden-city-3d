# 中右门整项候选 Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: superpowers:executing-plans. 已授权持续实施；单一生产写手，独立只读来源/终态复核，不再重复方案问答。

**Goal:** 把原FC-85E0528ECA中右门由三间旧壳修成自身图支持的中央三间＋两端窄廊、完整双坡栏、共同门厅与墙端接口的一个可检验候选。
**Architecture:** 新MiddleRightGate专用构建通过ZoneBase显式绑定axis-courts item14，替代该门的旧generic壳/MiddleAxisFacades/MiddleNorthVisibleHall链；中左仍走既有链。所有数值集中在只绑定本物体的契约中，屋面、门窗、台坡、碰撞、地图一致；不修改其它屋顶默认值。
**Tech Stack:** 既有Three.js、CourtKit、真实CollisionManager/FirstPerson/CharacterWorldAdapter、Node tests和内存Vite构建；不加依赖。
**Spec:** 原STATUS的FC-85E0528ECA；私人zhongyou-whole-closure/WHOLE-READ-DECISION.md及FIXED-THREE-MANIFEST.json（三机位1665/1623/1615、18完整640面、72tiles）；此前MIDDLE-AXIS-GATES.md仅为局部历史，不当整项验收。

## Global Constraints
- 原37分母、397任务不变，wholeObjectAccepted=false；无GPU/浏览器证据不计整项完成。
- 只改item14门本体、item15对应墙洞/近端、所需地图/真实物理；item15.from=[65.5,-12.2]、既有太和西墙terminalJoin、全部三台支承、中左和其他门/廊远端逐值保护。
- 北口短踏/中央现代可移动覆板只按可见通行层次拟合，不称历史永久坡道；不镜像无图南踏，不复制游客/展牌/家具。
- 真实中门开闭，不新增两侧绕过防火分段的假通口。隐藏梁架/榫卯不造细节；南透窗北实面保持各自来源。
- 六轴柱网、屋面、双坡共享一组明示工程尺度；不由假设游客眼高推台高，不照抄右翼尺寸。数值仍是候选，不是测绘。
- 回滚父d70a4a02（生产11b1d8d9），保原六份脏报告/其它实验；不main、不部署。

## Review Focus
- 错身份/变换必须在分配、碰撞登记前拒绝；Task1负测。
- 端窄廊不是新房间/新通门，关闭中央门不得被绕行；Task1真实胶囊负探针。
- 北口短踏及双坡顶/脚须连续真实支承，不能用无限平面或过宽碰撞桥接；Task2落脚、脱离和渲染面射线。
- 屋面参数height不等于脊至檐高，斗栱/承点/檐/主脊需实测最终几何；Task1/2实际包络与source机位CPU对照。
- 合批释放一次，借用图库不误释放；Task2生命周期、原外物哈希。

## Task1: 整门契约、构建和墙口（一个候选，不以组件单独计版本）
Files: create src/scene/palace/special/MiddleRightGate.js; modify src/scene/zones/ZoneBase.js and data/zones/axis-courts.json; create tests/photo-fidelity/batches/middle-right-whole.test.mjs。
Interfaces: middleRightGateGeometry(item,zoneId,index) -> validated frozen contract; buildMiddleRightGate(kit,item,zoneId,index) -> {width,geometry,frame}; only item.middleRightGate==='own-three-bay-end-aisles' at originalitem14。
- [ ] 写并运行旧真实构建红测：六轴/单通口、两南透窗北实面、完整双坡、两端窄廊不绕行、中央开闭；失败须因实际旧结构不满足而非缺import。
- [ ] 条件起点总柱宽16.4、五跨[1.85,3.85,5,3.85,1.85]、深6.4；依据独立双面/坡脚拟合修正台面、屋面、run并留理由。禁止因测试字面值锁住不符源的数字。
- [ ] 专用构建共同门厅；旧北纵隔墙仅在1615b/l/r能支持的短入口/实墙范围保留，不套三隧道。构建真实叶/窗体阻挡和可见横梁头顶接触，南北材质不同。
- [ ] 台基实体、完整南北坡、北短踏/中板、栏板/卷尾/柱、端墙接口与地图统一。栏细雕只做可见粗类型，不虚构逐花纹复原。
- [ ] 显式单对象接入；不从名字批量泛化。错名称/坐标/旋转/版本拒绝，错误不留半构建。
- [ ] 专测与受影响原测试：把原中右“保留.45/旧全碰撞”历史合同明确转为中左/旧fixture保护，另以新源几何与真实行为覆盖中右；不删真实失败证据。

## Task2: 候选整项验收证据与保存
Files: scripts/photo-fidelity/batches/r157-a37/middle-right-*; docs R157-A37 STATUS/本计划/回归JSON。
Interfaces: actual ZoneBase/PalaceBuilder world; production physical surfaces and merged geometry, no测试专用救援面。
- [ ] 父/候选两外面、北内厅、南北坡反向与两端接点同机位CPU比较；独审源与最终几何，不把CPU图称GPU照片验收。
- [ ] 实际控制器10/60Hz，南北走跑、中心/两贴框、坡顶坡脚/旁边/栏尾/北踏；闭门/窗外/端窄廊负例，跳顶与高落；NPC适配器真实路径段/地面采样。
- [ ] 合批前后资源/三角/缓冲/材料和生命周期；中左/太和西墙/三台/远廊fingerprint不变。
- [ ] 批次专测、3base内存构建、冻结源码完整current-state串行；对照最近父1331/1113pass/218fail，逐名记录新增/历史失败，不冒称全绿。
- [ ] 独立终态复核，修复实际问题后重跑受影响验证；选择性检查点并报告可回滚SHA和仍缺浏览器证据，不增加整项计数。

## 2026-10-30 implementation / verification rulings
- 已完成专用整门候选和最初红测→绿测；14项本门行为、4项竖直边界几何、批次与相关三角共139项通过。原generic中右局部测试现在明确去掉本次marker作历史fixture，当前item14另由本门完整测试覆盖；中左仍生产原链。
- 北条纹属于现代覆板，不据条纹造三级石阶。当前只留可见高差的最小石边和独立现代板；2.6/2.36等仍工程拟合。
- 独审修正主栏开孔：每跨单个中部粗瓶形支承＋两端半托，非两根等距直条。数量仍四排各9跨10主柱＋低端卷尾，顶回栏不报未知跨数。
- 墙接点红测发现抬台后原item15可见7m墙仅3m碰撞。仅本对象已绑定profile下的exact item15扩既有实体碰撞至可见7m；端点/几何不移，其它wall不改。8条实际双向10/60Hz跳跃通过，独立12静态高空探针通过。
- 高落红测揭示共享三角边界口径冲突：vertical SAT排除静止轴边界，但inclusive body判相交，北檐在贴边下降后滞留。新增includeBoundary选项只用于resolveTriangleVertical，覆盖贴边下降/上升/恰好t=1/外侧负例；默认水平语义不变。18组真实高落通过，坡面允许原有有界滑移，不能用初始XZ判断已移动角色穿体。
- 12正常往返路线通过；真实CharacterWorldAdapter 528渲染地面支承、600分段、4实墙负例通过，不称NPC活体人群仿真。
- 两张source CPU是条件来源机位；inside与两斜视是工程诊断，不是1615源机位重投影。仅CPU无纹理/光照/GPU验收。独审主轮廓可留，但实际带帽外轮廓宽20.30与名义19.79不是同一量；记录残差不硬缩屋檐。
- 冻结7生产文件于私有frozen-production-2331.sha256，完整current-state运行中。三base第一次前2通过、第三进程被kill exit137，须独立内存可用后重跑，不能计3/3。
- 资源释放一次；邻门2/3/12及廊36/37几何/碰撞/支承、PalaceBuilder511支承与静态碰撞和父一致。既有6脏报告逐字保留。未提交、不部署、整项仍0/37。

### Final-ridge refinement and restart receipt
- 2331瓦面轮全量终态1331/1113pass/218fail，失败名与父11b1完全相同；仅作priorFullScope，不当后续完整脊饰终态。
- 主脊/圆帽/鸱吻真实三角此前未登记，独立射线与body证明中央可穿入.3324。只为自身最终ridge网格另加实际三角owner，未改可见几何或用总AABB堵空气。新红测→绿测；22高落（含两端脊饰）全过，中央脚12.4324与真实帽顶一致；独审561实体/空气点0差异。
- 终态专测15+4，批次+相关三角140/140；两中门24实际走跑往返、8墙缝跳跃、528NPC支承/600分段/4负例终态重跑通过。
- 三base隔离3072MB上限重跑3/3通过、各546modules；初次exit137日志保留，不能与终态混淆。
- 2341终态全量因环境重启中断（247行、无总结、旧process66136不存在），未盲重试；恢复逐字核7生产hash及6原脏报告后以新日志resume2342运行，尚待终值。

### Actual material/crown review, not just CPU white meshes
- 独审亲看实际wood_column.webp为红漆柱纹，而1615中央现代板为灰/灰褐。新增真实材质归属红测；仅本板改owned neutral matte0x77766b、无map，共享柱材质/楔体/支承不改。
- 自身近栏有尖端下鼓腹与颈圈，纯圆锥柱头不符粗型。改8段粗旋转外轮廓（非8瓣声称），保高1.17、半径.135→.145；实际三角实体同步。精确莲瓣浮雕仍未复原。
- 专测17+edge4=21，批次与相关三角142/142；新增四排中柱后高落30组全部无穿体。两中门24实际路线、8墙缝跳跃、528NPC支承/600分段/4负例按最后材质/柱头源码重跑通过。
- 最后资源：本门+item15合批15meshes、21,208triangles、2,035,968bufferbytes、292colliders（86triangleOwners）/6walkables；不是GPU实测。3base隔离重跑通过各546modules。
- 前一ridge完整轮1331/1113/218、失败名与父完全相同，明确为pre-neutral-board/crown；最终7生产hash另存2353，完整终态正在新log运行，不混用前轮。

### Terminal verification, 2026-10-31 00:03 UTC
Final neutral-board/crown source hashes match before/after full serial run: **1331 tests /1113 pass /218 fail /0cancel**,448.784s. All218 failure names equal the saved11b1 parent; no added/removed names. This is a completed failing historical suite, NOT all green. Final focused/batch142,30actualdrops,24two-gate routes,8wall-jumps,NPC528supports/600segments/4negatives,owned-resource lifecycle,non-target fingerprints and3base546-module builds have their own complete receipts. Original6dirty reports remain byte-identical. Selective rollback checkpoint permitted; GPU acceptance, precise source dimensions/relief/animals and wholeObjectAccepted remain unresolved/false. No main/deploy.

### North-leaf joint family, 2026-10-31 00:21 UTC
Own1623 studded leaf faces23–26px exposed a real discrepancy against old90-degree7–8px. Own1615 pull-ring/free-edge identification supports over-opening, not a sub90 shortcut. New conditional3m hinge span/1.48m leaves/125deg family, closed fixed red side frame, and actual oblique leaf triangles match visible face widths while preserving empty side air. Parameters are engineering fit, not measurements. Corrected north camera is constrained by six actual column axes; inside CPU remains diagnostic only.24focused,144batch+triangle,30highdrops and real route/wall/NPC tests pass. Right near-jamb probes honestly narrowed±1.29→±.85 and old near-frame points are additional blocked negatives, not silently deleted failures; left unchanged. Full current-state and three-base build not yet final. Neutral-crown2353 results remain historical and separate. Independent final review running. No commit/main/deploy.

### Joint-leaf terminal freeze, 00:29 UTC
Final7hashes0020 unchanged before/after455.327s serial full suite:1331tests/1113pass/218fail/0cancel. All218 failure names equal prior2353 and its11b1 parent comparison; no new/removed names, NOT all green. Independent review no new blocker; actual open/closed leaf grid each1007points matches rendered bodies (5 initial exact-tangent numerical differences disclosed and all blocked by fixed frame). Three-base546modules each, non-target fingerprints and original6dirtyreports exact. Final verification lives under northLeafJointCandidate in regression JSON; top earlier2353 hashes/results deliberately historical. Candidate can be rollback-saved, not GPU/whole accepted. Next priority per parent is wholeWumen, not middle-left.
