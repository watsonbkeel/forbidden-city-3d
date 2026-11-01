# INTEGRATED-ASSEMBLY-PLAN-2248 只读预审

被审文件：`wumen-joint-recovery-1607/upper-reassembly-2034/assembly-recon-2240/INTEGRATED-ASSEMBLY-PLAN-2248.md`，SHA256 `ecb6c649f17c3dca830863a65a759d79429d1df4e865544253aaab119ee0f94c`。现运行前驱为 `5610acf44554d3b2a83cd89f33df8782810cd6d4`。只读计划和实际源码，无 Node/World/CPU、无产品/测试修改。

## 结论 / 可执行边界

**方向支持；可在父批准后只进入 Task1 数值/来源/逐角色合同 TDD，不是批准 Tasks2–6 连续自动执行。** Task1 不生成建筑、不修改600运行源；先写真实数学/身份负控，再形成可逐项审查的端点、frame、owner 与允许 delta。其 JSON 校验绿不能认证来源或建筑设计。

Task2 需要 Task1 精确数值及下列 P1 修订先获审；Task2–4 的输出是同一个完整隔离候选，不分拆成 fan-only 完成对象。Task3 存在未解穿插/暴露缝/未知边界时，允许保留诊断和继续经批准的只读分析，不允许把它当几何通过或自动进入成功路线验收。Task5 若需改变共享接触权限，先保真实 RED、另立明确设计和授权。生产安装/全城 anchor 调整不在本计划批准范围。

## 已合理覆盖的合同

- 主楼52柱/1.43网格/shell/roof/南匾完整保全；104可辨外围轴、8未知接口区、24工程横连柱分账；188旧柱与180条件候选不是同一集合。
- 固定柱径/柱高/框厚；东北3组围护的2/3/2与未知细格、closed pane不冒充通行门。其新X/Z/长度须作为实际delta而非原geometry字节保持。
- 28个补充屋面角色明确为merge前侧壳/朝下fan，不是承重体、地板或28个既存最终mesh；与受审真实tw采样同源，不拿柱心代替beam footprint。
- 新屋面完整保留当前已审生成器的面；跨实例接线区预先定义，只作诊断分类，不是穿插许可。未知tuck/cut不得由隐藏或碰撞结果反录批准。
- 全部新柱脚、实际台面和栏/安全代理须在场；旧188柱脚结果、工程rig成功均不能替代新整组 bearing/FP。五洞及北头明确迁移，旧红与Float32缝证据保留。
- 横连普通体/Xiqing表面/furniture域/floor授权共同迁移；源600前四阶段不改，shared adapter需另批。真实TextureLibrary及finish合批在生产前另验，不把白材质fixture当运行材料验证。

## 必须纳入修订的 P1

### 1. 两次 capture 不是全引用独立

`tests/lib/gate-tower-fixture.mjs` 的 `data=PALACE_LAYOUT.find(...)` 两次返回同一对象。新 geometry/material 多数独立，不代表 anchor data、userData中的源常量或所有物理元数据都独立。Task1/2 须逐类列可写对象与允许的只读共享输入，禁止改共享 layout 来移动 B。以构造前固定签名核 A，并对可写 aliases 的实际对象/数组身份负控；不能只看两个 group 不相等。

### 2. 不存在未经核实的112条live柱碰撞一一映射

`buildHallBody` 返回局部 `userData.colliders`；`WumenWingPavilionInstances`、`WumenOuterSideColumns` 修改的是这些局部描述，并明确运行碰撞不变。`PalaceBuilder.buildWumen` 并未像主楼那样遍历注册所有翼/亭局部数组，而是另注册北亭整盒。计划 Task4 的“old112shaft collision rows”须改为三层真实台账：

1. 可见柱角色；
2. HallKit 局部 collider 描述；
3. builder 实际注册的完整 rows、owner及整盒覆盖关系。

旧452 registered rows不能按柱数量推断。新翼/南亭实际物理若此前不存在，就是**显式新增delta**，不是删除/移动不存在的旧行。真实碰撞形状、3m裁高和闭亭覆盖必须独立决定，不以局部 metadata 偷换实际CM结果。

### 3. Frame必须逐层指定，不能暗移anchor

PalaceBuilder 的mesh在局部group，registered colliders/walkables已加 `ox/oz`。visible-platform新records则来自局部面。合同须明确原mesh local、局部描述、旧registered world、候选CM/路线各自frame，以及唯一一次转换。当前 −419.6 是前驱运行物理基准；禁止静默继承不等于授权改成地图推导 −379.56599。若在local CM重放，应明示对照转换而非声称global row逐字不变。

### 4. 签名不证明没有dispose

Three `geometry.dispose()` / `material.dispose()` 可以只触发事件而不清除attribute，前后签名仍相同。Task2需真实事件探针并分生命周期：A由caller持有，候选永不回收；B保留资源在装配中dispose为0，最终销毁或失败清理时B自有资源恰一次；真正外借材质由外部owner持有，候选不回收。若B的fixture/library由候选内部新建，其材料也需有明确的B-fixture owner最终回收，不能因子工厂借用就无人负责。旧目标资源只有确认无保留引用时才可提前退役。alias图与事件证据两者都需要。

已进一步核源码：captureGate覆盖`finish`，因此没有执行原`finish→addObject→ownedObjects`登记。不能假设`capture.builder.dispose()`已遍历原group全部几何；必须使用明确fixture资源ledger，连同未挂场景的私有资源一起列清。

### 5. “至少1秒稳定”不能直接复制旧帧数条件

原 `ground-entry-player.test.mjs` 用 `stableFrames>=fps`，是nominal一秒帧数；首末稳定样本的间隔是 `(fps−1)/fps`。新计划若声称至少1秒，应记录每帧有效模拟时间、稳定区间开始/结束，并验证实际连续跨度达到1秒（仅允许明确的浮点计时舍入界）。保留旧nominal结果，不改其口径。闭门预期阻挡、缺源失败和实际到达必须使用不同终态判据，不能保守停住即当arrived。

## P2 文字和实施清晰度

- “all original roof faces stay”应定义为**本阶段已经审过的完整surface/trim输出**，包括既有200/48去退化账；A保留原RoofBuilder历史，新B应移除旧目标屋面，不能为了该句把旧新屋顶重叠留下。
- Task1–5每个测试集给可复现命令与预期范围；全65是前驱选定集合，不是替代新Task2完整delta或后续World。
- fan拓扑若为共边重新细分，声明具体index/UV delta；共享坐标grid若需修平台，作为新可见helper单独审核，旧187cell/34正缝证据不可覆盖。

本次没有发现阻止**合同阶段**开展的P0；五项P1在进入相应实体/物理/路线验收前必须显式关闭。已向作者逐项发送，2248原件应保留，修订另命名后可核。未批准任何实际上层安装、源图精确测绘认定或整午门完成计数。
