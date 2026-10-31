# 午门局部 owner 认证与 ordinary sweep：有限终审

2026-10-31 17:56 UTC。审查树 `r157-wumen-joint-layout-1622`，HEAD48a。最终输入为 `owner-auth-sweep-freeze-1755.json` 的 **8 路径**，非其后所有 WIP。

## 决定

**可接受为固定 LOCAL_CONTACT_RIG 的认证及单段普通盒扫掠前置。此前发现的本组阻断反例已实际关闭。** 这不是 provider 移动状态机、真实 World scene、上下坡路线或生产安装批准。既有两套严格16组合仍各0/16，不能被本轮轻测替代。

独立原测试 **19/19、exit 0、396.06 ms、无 skip/cancel**：fit2、owner12、sweep5。全部原断言保留并新增反例。没有 World、CPU/GPU、共享 Collision/FirstPerson 修改，也没有审核者仓库写入。

## 输入身份与范围

8 SHA 独立尾核全匹配，完整记录 `input-audit.json`。关键模块：

- Contact：`1cb3f9a6b21fb1c1340e55817132e14c0d830d2e2c6a1466173669de28a68fae`
- Fit：`e34c2a3e00fff3b551003fbd9e42280a476c6c09c0ebf8b62f317bbb7af08098`
- Sweep：`a66da80518b3e783adea2eac1f545c4d5af694a3f5c35499b556ae4f7ff1b013`

原 HEAD 的 **592 个 src/data 文件逐字不变**。当前另有5个新 default-off 源模块：Contact/Fit/Sweep 属本轮；Coverage/Motion 不属这8路径审查，不沿用早期“595全部输入”说法。它们没有使原 Collision/FirstPerson 发生改动。

本轮独立证据在 `independent-wumen-owner-sweep-1755/`；原1729、1735、1744、1753各轮文件保留，不覆盖旧漏检。

## 已关闭的认证漏洞

最终代码复跑了原独立探针，**12种反例全部拒绝**：

1. 实际零计数 InstancedMesh subclass；
2. position morph +100m；
3. colorWrite=false；
4. alphaTest=2；
5. 注册后脱离原 parent；
6. 仅数组的假 CM；
7. 隐藏 non-enumerable taper（曾令真地面1.65m→0而仍获授权）；
8. position.count=0；
9. NeverDepth；
10. 普通 Mesh prototype 不变但启用 isInstancedMesh/count=0；
11. material.isRawShaderMaterial；
12. position.gpuType=IntType。

对应 `probes.json` 六项、`extra-probes.json` 三项、`flag-and-bounds-probe.json` 一项、`render-channel-probe.json` 两项。原19测试另覆盖 ShaderMaterial flag、normal IntType、batch/skin/geometry/attribute执行flags、模板剔除、bounds及更多身份/移除等变异。

初版 material.toJSON 白名单没有包含 shader执行flag，因此1753的18/18仍不足；本轮将普通执行通道同时应用到 material，并显式绑定 position/normal FloatType。不是仅刷新测试期望。

现有合适边界：

- 期望面/盒来自独立固定 fit，不从 actual geometry 反抄。
- 注册真实 CM class/prototype及指定原方法；live ramp/body row 限原型、完整 own keys/data descriptors，并锁具体记录引用。
- 普通 Mesh、geometry、attribute、material 执行通道受限；拒 morph、实例、骨骼、batch、自定义 shader/cache/变形等不在本阶段模型中的通道。
- geometry 的真实 position/normal、draw count/itemSize/normalized/gpuType、drawRange、index、bounds/sphere 认证；identity world/local矩阵及可见祖先链/parent成员身份保持。
- 材质按独立默认 MeshStandardMaterial 序列化允许模板比较，拒纹理及变形/裁剪/discard通道；初始 color允许、注册后序列化颜色状态锁定，name/userData不作执行差异。**这不是所有颜色浮点分量逐字或任意 JS/全局原型污染的安全证明**。
- WeakMap 默认无绑定；合法 owner 子集必须逐个成套，routeAcceptance仍false；dispose不生成/删除场景面。明确 `LOCAL_CONTACT_RIG_NOT_LIVE_WORLD_SCENE`，没有冒充 actual World root 存活证明。

## Sweep 修订结论

原 ordinary policy仍 `.35m` clearance，不降低脚底、不冒 full-feet triangle。

已读取当前 body 函数字面代码并与真实 `CollisionManager.playerBox` 比较，feet为0、3.3、10、11.9、12.3、8.4453776023六样本的全部 XYZ min/max **逐位相等**。原IEEE薄片反例也在正式测试中通过。当前实际顺序为 eye→feet→bottom/top→size/center→Box3；前一轮“直接 feet+.35”的不同次序不再使用。

保留原 raw endpoint/boundary/water/dynamic/triangle检查，另外对 ordinary盒进行仿射body的连续正体积交叠判定；薄墙、下降穿薄板、低地面/边界、IEEE薄片、合法Duixiu triangle空域与真实阻挡的5项均通过。

Duixiu口径已经订正：合法带triangleSupport的owner交给原raw连续triangle策略，不把triangle AABB当floor；overhead或非triangle异常terrain依然保守拒绝。本轮不是完整曲面算法证明。

P2保留：该sweep新增的是直线段正体积交叠限制，原终点仍inclusive；不泛称每一浮点中间时刻逐字回放。overhead broad-grid候选的保守拒绝可能产生误挡。范围外/异常巨大位移、所有动态水域组合与连续高度分支仍需真实调用层保证和后续门禁，不由这5项概括。

## 证据分轮与剩余门槛

独立1743轮17/17，发现普通Mesh执行flag漏检；独立1753轮18/18，确认该项关闭但发现material/raw shader与gpuType遗漏；最终1755轮19/19并重放全部上述12反例。旧轮均真实保留，不能将19写回前轮。

已只读核作者1740真实12/14红、1743的45/45，及原1735八文件副本逐SHA相同；当前作者56/56等更大分母包含另外的ground/Motion工作，不作为本轮独立结论。

P0：无本轮已安装生产P0。

本组先前P1：在上述固定模型及已列反例范围内关闭，可作为后续局部provider的认证前置。

**整体P1仍未关闭**：真实入口默认无注册行为A/B、域内缺坡不得null救回、连续高度/足迹分支、实际accepted小步、失败滑步与一次handoff、静止/跳跃/释放、真实环境/台基/亭接缝、旧共享全回归。原严格路线红仍有效。不得把有限认证当作真实午门通行、完整马道或整城发布批准。
