# 午门认证修订与 ordinary sweep 独审（1735 冻结）

## 结论

**上一轮七个认证反例已关闭；仍有两项实际渲染执行状态漏检，认证前置继续 P1，不批准 provider/生产安装。** Ordinary 连续扫掠的三项有限功能实测通过，但“端点运算逐位等原 Collision”措辞不成立；foreign Duixiu 的实际分支与交接口径不一致。均应在后继冻结中处理，不能把本轮结果改写成后继结果。

独立只读树 `r157-wumen-joint-layout-1622`，HEAD48a；`owner-auth-sweep-freeze-1735.json` **8 路径逐 SHA 全匹配**。旧 592 个 src/data 文件逐字等 HEAD，新增 3 个未接共享运行入口的模块，共595。没有 World、CPU、Collision/FirstPerson 修改；审计文件均在仓库外 `independent-wumen-owner-sweep-1735/`。

## 实际验证

- fit2 + owner9 + sweep3：**14/14，exit 0，332.18 ms，无 skip/cancel**。`original-14.tap/.exit`。
- 独立复跑原六探针：零实例、morph、colorWrite=false、alphaTest=2、注册后 parent 脱离、假 CM，现全拒。脚本复制到新目录，旧1729漏检证据未覆盖。见 `prior-probes.mjs/.log` 与 `probes.json`。
- 原第七项 non-enumerable taper 再次实测，现认证拒绝，见 `extra-probes.json`。
- 当前 plain-record 限制原型/Reflect.ownKeys/data descriptors，避免旧 Object.keys 漏隐藏物理字段；CM class/prototype/指定方法身份复验、固定 parent/祖先成员链、禁止 instancing subclass/morph、显式 `LOCAL_CONTACT_RIG_NOT_LIVE_WORLD_SCENE`，都是有效收紧。它仍不是实际 World scene-root 安装证明。

## P1：仍漏实际无绘制状态

独立探针使用真实未变 rig 与真实 CM，先成功注册，再只改一项，随后正式 `validateWumenJointAscentBinding`：

1. `mesh.geometry.attributes.position.count = 0` → **仍 true**。数组/itemSize 不变，但 WebGL 非索引绘制使用 position.count；认证不能仅检查 array 内容而忽略实际 draw count。
2. `mesh.material.depthFunc = THREE.NeverDepth`（depthTest 保持默认 true）→ **仍 true**。有效深度测试使片元不通过；标准材质 visible/opacity 等原白名单不能保证有效可见性。

本轮没有 GPU 渲染：这些是实际 Three 执行状态的独立反例，不是假称亲眼看过新截图。日志 `extra-probes.mjs/.json/.log`，已及时交作者补 TDD。

建议明确一个完整、有限的**允许渲染执行状态**合同，而非继续只列已发现的隐藏字段黑名单：普通 Mesh 身份及相关实际 flags；position/normal BufferAttribute 的 count/类型/itemSize/normalized 等执行元数据；有效绘制范围；无实例/骨骼/morph/自定义变形回调；允许的标准材质深度、剔除、模板、裁剪与 discard 状态。若颜色/纹理/粗糙度不属于物理认证目的，可明确允许范围；但不能让它们引入顶点变形或完全不绘制。后继应至少覆盖注册前与注册后两个阶段。

## Ordinary sweep：有限可用，两个 P2 必须准确表述

本轮 `WumenJointAscentSweep.js` 仍独立、未被 Collision 调用。先保留原 `checkCollision(toEye,r,fromEye)`，再对 broad query 的普通盒求仿射 body 与固定盒之间正体积交叠的时间区间。薄横墙两端都清楚但中间碰撞、下降穿薄板、已有低地面 clearance/边界三项实测均符合断言。没有降低原 `.35m` 口径，没有把普通盒改成 full-feet triangle。

### P2-1：端点“exact order”声明错误

helper 直接构造 `[feet+.35, feet+HEIGHT-.05]`，而真实 Collision 先 eye→feet，计算 top/bottom、size/center，再 `Box3.setFromCenterAndSize`。独立从真实 CM 的 `playerBox` 读取对照：

- feet0：raw minY `0.3500000000000001`，helper `0.35`。
- feet3.3：raw minY `3.6499999999999995`，helper `3.65`。
- feet11.9：raw maxY `13.549999999999997`，helper `13.549999999999999`。
- 另外10、12.3、8.4453776023三样本也非逐位同一。

误差量级很小，但其方向并非一律保守，不能保留“exact Collision order”结论。应采用原运算次序并测试真实端点 Box，或明确/证明保守误差界。修复端点相等也不自动成为任意浮点中间时刻形式证明。

当前 interval 检查是严格正体积交叠，终点 raw Collision 仍是原 inclusive Box3 检查；单点中间相切与末点接触语义不完全相同。应明确它是新增连续正交叠限制，不泛称每个浮点时刻的原 checkCollision 原字节回放。

### P2-2：Duixiu 分支顺序与交接不一致

循环先对 `triangleSupport || xiqingRoofSurface` continue，然后才检查 `overhead || duixiuTerrain`。真实 Duixiu collider 必带 triangleSupport，所以合法 Duixiu 不会进入后一个“unsupported”分支；它实际交给原 triangle sweep。若选择保留原 triangle 支持，应据实说明并测；若设计要保守阻挡 foreign Duixiu，则应先检查它。不能同时声称这两种行为。

overhead 当前对 broad query 返回的同网格候选即保守阻挡，即使未精确落入 body swept bounds；这是受限 helper 的保守能力边界，不是完整曲面解算通过。

## 本轮不覆盖

没有运行 provider 状态机或原严格16路线；此前两套严格路线仍各0/16。单段 sweep3 不能证明完整高度分支路径、动态角色/水界回归、缺坡/跳跃/释放、handoff滑步与单次消费。无注册默认路径的真实前驱 A/B、完整共享回归及生产安装仍待后续阶段。

P0：本轮没有运行安装造成的生产 P0。P1：上述 count/depthFunc 漏检未关闭，不能把认证结果用作可见支承的权威。P2：sweep 精度及形状支持口径应在下一版明确；其他设计 P1 不因此解除。
