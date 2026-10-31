# 午门 fit / owner 认证前置独审（1728 冻结）

## 决定

**Fit 提取保全通过；owner 认证前置暂不通过，P1 阻断后续将它当真实可见坡面权威。** 原 7 测绿不能覆盖本次发现的真实反例。没有 Collision / FirstPerson 入口变更或 World 安装；不据此认定生产发生回归。

树 `r157-wumen-joint-layout-1622`，HEAD `48a6dcf7c94dd1233e1135e8fbf4f12f837e1074`。`owner-auth-freeze-1728.json` 六路径 SHA 全部独立匹配。旧 592 个受跟踪 src/data 字节逐项不变；仅新增未接运行入口的 `WumenJointAscentFit.js`、`WumenJointAscentContact.js`，合 594。审查与探针只在仓库外 `independent-wumen-owner-auth-1729/` 留证，没有改仓库。

## 通过的有限部分

独立执行 `fit-definition.test.mjs` 两项和 `owner-registration.test.mjs` 五项：**7/7，exit 0，275.91 ms，无 skip/cancel**。原日志 `original-7.tap/.exit`；完整输入记录 `input-audit.json`。

Fit 是 14 份不可变工程参数，仍明确 WUMEN_LOCAL_XZ、非测绘、runtimeInstalled=false、routeAcceptance=false。当前提取没有改变先前接触 rig 的全部参数、seams、body、walkable 与 geometry attributes。前驱 fixture 标识旧 rig SHA `d1e15b…b2efb` 与未变 primitive SHA `61ba1b…20b`，与前次独审身份一致。

JSON 会把 -0 序列化为 0，故 JSON 比较只证明记录字段的序列化等价；新增的旧参数＋SHA 固定原 primitive 重建，再比每个 typed-array 原始字节，适当补上了此边界。不是刷新几何黄金，也不是当前形状反录成前驱。

认证期望由独立固定 fit 构造，不从待测 mesh.position 数据反抄；WeakMap 注册默认缺省，失败的 owner 集合未发布 binding，dispose 不删实际几何/物理。当前已锁住不少位置/法线/矩阵、visible、普通盒及 live rows 条件。这些优点不消除下面遗漏。

## P1：七个实际反例

`probes.mjs/.json/.log/.exit` 为六个独立小探针，每次建立真实 rig/真实原 CollisionManager（第六项故意替换为 plain object），只改列出目标，然后调用正式注册与验证。**六个全被接受**：

1. **InstancedMesh count=0。** Three 的真实 InstancedMesh 仍 `isMesh=true`、`type='Mesh'`，当前判定接受，但它没有渲染实例。不能用 type 字符串当普通叶 Mesh 的充分证明。
2. **position morph +100m，influence=1。** base position/normal 不变，认证通过；实际渲染位置语义已被 morph 改变，而 body/walkable 仍旧。当前没有锁 morphAttributes / morphTargetInfluences / instancing 等变形通道。
3. **material.colorWrite=false。** 认证通过；不写颜色的面不能当已认证的可见实体。
4. **material.alphaTest=2。** 认证通过；默认不透明 alpha=1 的片元被舍弃。仅 visible/transparent/opacity/side 不足以排除全隐藏状态。clipping、变形 shader callback 等其他影响可见/顶点的通道也需明确允许集合，不能宣称已全字段认证。
5. **注册时将 mesh 放入 identity 可见 Group，注册后 remove(mesh)。** 认证仍通过；未绑定经认证的 host/root/成员链。当前 rig 本来允许无 parent 的离线 mesh，这可作为 detached component 数据认证，但不能同时宣称已证明 live 场景实例持续存在。需要显式场景/试验根节点契约，或者在实际安装层另补这个前置，不能混用两种保证。
6. **plain object 只有 colliders/walkables 数组。** 可注册并验证。它不是 CollisionManager，不具备真实查询/更新语义。若 API 宣称绑定真实 CM，需 class/受控 capability 身份；纯结构校验须降低措辞且不能直接作为未来共享入口的授权依据。

另 `nonenumerable-probe.mjs/.json/.log` 给出第七个、直接影响真实物理的反例：

7. **注册成功后在 live ramp row 上用 non-enumerable 属性加入 crossMin0/crossMax0/crossMin1/crossMax1，范围 999..1000。** validateBinding 仍 true；同一真实 CM、同一 entry 中心的 `getGroundHeight` 从 **1.6499999999999997 变为 0**。原因是认证用 `Object.keys` 识别额外字段，实际 Collision 直接访问 taper 属性。非枚举/继承的额外语义、accessor 等不能被键列表检查隐藏。body rows 的 triangle/overhead/furniture 等语义字段也有同类检查风险；应逐实际读取语义拒绝，或约束原型及完整 own-property descriptors，再认证值。

上述是实际对象/查询探针，不是 World 或 GPU 渲染测试。没有将“图像已看见”冒充本轮验证；前四项依据实际 Three 对象状态及渲染通道语义，七项依据真实 CM 查询。

## 建议补强与验收

- 先将以上反例纳入 RED，既测注册前异常，也测注册后漂移。不要只禁止探针的具体数值；应定义此阶段接受的真实普通 Mesh、标准材质可见性、无动态变形/实例化、geometry 属性和 host 生命周期合同。
- CM 身份检查避免可伪造 userData / 字符串；完整 mesh/walkable/body rows membership 验证保留。固定 owner 子集允许，但每个提交 owner 必须成套，未知/重复拒绝。
- 明确“离线组件认证”与“实际 scene-root 存活认证”的职责；未来 provider 启用前必须两者均满足。验证 detached 数据不是自动认证运行可见性。
- non-enumerable taper 反例必须修到认证拒绝，而不是修改 Collision 查询或删除原 taper 能力。旧行为不应被本局部认证牵连。
- 对 owner 实现的后继冻结重新轻测，不回写本轮七个漏检结果。

P0：本阶段无运行接线，没有已造成的生产 P0。P1：上述实体可见性/变形、live 身份与隐藏物理语义未闭合，不能给 movement provider 可信支承权。P2：UV/颜色/粗糙度等未锁字段如果刻意不属于本认证目的，需要明确有限边界，不能泛称完整材质或全几何渲染保全。

既有 provider 设计 P1（普通盒连续扫掠、缺面不得 null 回退、真实释放/静止/跳跃、handoff 原子性、严格上下坡两轮仍 0/16）全部独立保留。本次 fit 的 7/7 不改变这些结论。
