# 午门局部坡面 provider 设计与足迹并集独审

审查人：独立只读 reviewer；2026-10-31 17:23 UTC。

## 结论先行

**足迹纯函数有限通过；provider 仅设计方向可进入父已授权的隔离 TDD，尚未实现/验收，不批准生产安装或真实午门路线通过。** 优先在 `CollisionManager.getValidPosition` 的实际 `tryMove` 小步内显式委派，拒绝在最终端点事后补脚高。必须先落实下面 P1 语义，再评价实现。

本轮没有 World、CPU、共享源码修改或仓库写入。当前 592 个受跟踪 src/data 文件逐字等 HEAD `48a6dcf7c94dd1233e1135e8fbf4f12f837e1074`。所有审计输出在仓库外 `independent-wumen-provider-design-1719/`。

## 冻结与实际验证

工作树：`r157-wumen-joint-layout-1622`。以作者 `provider-design-coverage-freeze-1719.json` 为输入，三 SHA 均独立匹配：

- `CONTACT-PROVIDER-DESIGN-1706.md`：`697c252f800be03b80e408676c6b0e185e7fa945da13cd074439bb6b7f7b9b8f`
- `footprint-coverage.mjs`：`e82897d7a1afd7251c7a7d5e0bdf4057c9c326bb1bc541cd06fb80db8e0dee4b`
- `footprint-coverage.test.mjs`：`af996a91860ef4efe6ee110b713bcdb7d7c7a9a9411e24afbc577d38c507b104`

独立执行原四测试：**4/4，exit 0，88.99 ms**，无 skip/cancel。日志 `coverage-4.tap/.exit`。

另写独立补集 oracle：512 种 3×3 单元矩形并集，25,088 个点足迹和 24,576 个双向路径；采用未覆盖开矩形与移动方足迹的相交条件，并用 BigInt 有理数时间区间求交，不调用待测函数内部算法。**零差异、输入未变**。见 `coverage-oracle.mjs/.json/.log/.exit`。此验证域为半单位格点和指定路径/半径，不是任意 IEEE 数输入的形式证明。

纯函数静审：`footprintCovered` 沿所有 X 边界切条，在各条内合并 Z 区间；`pathFootprintCovered` 按矩形边界 ± 半径产生事件并检查事件及间隔中点。对于固定、闭合、轴对齐矩形的数学模型，这些事件覆盖平面覆盖关系的变化。真实 1e-9 缝未用容差粘合。函数不创建地面，不认证 owner、Y、高度连续、旋转、可见 mesh、动态障碍或身体碰撞；这些必须由 provider 独立证明。最多 64 矩形是显式输入边界。

## 真实红证据：不能以到达替代安全

只读重新计数作者原 TAP 与全部帧 JSON（本轮没有重跑控制器）：

| 轮次 | pass/fail | 到达 | raw body 红帧 | 无中心支承高处帧 | 最大脚面误差 |
|---|---:|---:|---:|---:|---:|
| 原始 probe-1701 | 9/7 | 16/16 | 382 | 37 | 2.152419 m |
| 原路线严格 probe-strict-1704 | 0/16 | 16/16 | 382 | 37 | 2.152419 m |
| 内部 waypoint 去重 probe-interior-unique-1705 | 0/16 | 16/16 | 386 | 18 | 2.069615 m |

全部 exit 1、无取消/跳过，原日志 SHA 在 `red-round-audit.json`。严格轮已加 `maxFootError <= .005`、`unsupported == 0`，并保留 body 与到达断言。不过 unsupported 当前仍是**中心点**的作者面查询；以后不能将它冒称完整 .5 方足迹覆盖。脚面断言先失败时后面的断言未实际走到，帧指标仍已完整记录。

此前独立离线复现 382 raw body 红帧，诊断查询仅将脚高换成 authored 面高即可消除这 382 次碰撞；这支持脚高平滑滞后解释，**不是实际控制器修复，也不解释全部下坡失支承/越边**。新 provider 不得以改时钟、降低半径、降低盒顶、删碰撞、加宽未知台面或换路线抹掉原红。

## P0 / P1 / P2

### P0

当前无已安装运行代码，未发现本轮已造成生产 P0。此结论不预先批准尚未实现的共享接线。

### P1-1：必须区分范围外、无支承与失效，不能失败后退回旧隐式支承

`null` 仅表示未注册/真正范围外等明确不接管情形；域内错 owner、少 mesh/body/walkable、身份漂移、缺颈不能返回 null 让原 `getGroundHeight` 的隐式零面或残留 ramp 救回。管辖域应来自独立固定 expected 合同，不能随剩余 owner bbox 缩小而使删坡逃出认证。

允许完全认证的 owner 子集用于真实删除诊断，但单 owner 的 mesh、全部 body rows、实际 walkable 必须成套且 live。完整 rig 验收另要求全部 14 个。注册后删除、替换、移动、隐藏、源属性变化必须失效；外来普通障碍仍是合法场景对象，不能因不属于白名单就忽略或让整个注册拒绝来冒充堵路测试。

真实离开支承可设计显式 `RELEASE_TO_AIR`，保当前脚高、不重置跳跃、onSupport=false，按实际扫掠和重力落下；这比隐形防坠墙更诚实。但它是另一个需要 TDD 的状态分支，**不是默认 null，也不是已有通过**。仅方足迹一角悬边不等于中心已经离开实体，不能为了足迹安全谓词失败而掉穿仍在脚下的实面。最小实验暂时保守拒绝可以，但必须写成诊断未通过/保守限制，不声称那里有真实栏墙；删颈后的预期不是“仍到达”。

### P1-2：原 checkCollision(from) 不是 ordinary 盒的连续扫掠

已读实际 `src/utils/Collision.js:208–237,380–430`。`dynamicFrom` 对 triangle/xiqing/dynamic 走扫掠；普通盒分支仍是终点 `playerBox.intersectsBox(collider.box)`。因此仅调用 `checkCollision(candidate,r,from)` 不足以证明上/下坡、竖直下降或穿越窄障碍的全路径安全。

新入口须对实际接受的小段按高度分支/面边界分段，做普通盒连续扫掠，并保留 boundary、水域、overhead、triangle、动态角色约束；不得借用 full-feet Furniture sweep 后偷偷改变原 ordinary `.35 m` step-clearance 口径，也不得忽略候选自身盒。不同形状若不支持，应明确拒绝/限制实验，而非跳过。真实脚面、高度分支与坡面支承不能由平面 union 单独推导；地面大 slab 不能给高处缺颈作证。

### P1-3：共享入口与 handoff 的原子性、消费时序

优先最小接口是 `tryWumenJointStep` 在原 tryMove 内返回 OUTSIDE / ACCEPT / REJECT（以及另审的 RELEASE）结果，保存实际接受的序列，最后独立 token 在现 vertical 入口消费。不要复用 `lastFurnitureStepFeet` 或旧 Stair ID。

- 未注册 WeakMap O(1) 分支必须保持旧调用顺序、返回值、lastGround/其他既有状态；应和锁定 48a 前驱实际 A/B，不仅“附近无报错”。
- 失败的对角尝试不能发布或污染 token；随后的 X/Z 滑动只记录实际接受步骤。拒绝、异常、clear/dispose、新 movement call 均清理适当状态。
- 最后接受步骤出域时，之前域内 handoff 不得覆盖最终域外位置；须清除或经过显式认证 exit。
- token 绑定同 CM、同 movement call、真实最终 XZ、起始 feet/grounded 状态、半径与源代际；一次消费，错位置/第二次调用/跨调用不得重放。
- `FirstPerson` 静止时不调用 getValidPosition，故要单测单次消费后的静止、源删除、重新移动。不能用 stale token 维持地面。
- `airborne` 与 `airFeet != null` 不是同一件事：现 onSupport=true 的地面玩家也传 airFeet。跳跃/上抛不黏附；非 player/kinematic 不得误接管。最终 vertical state 要与真实输入状态一致，不凭标签清零速度/制造 landed。
- 若新域与旧 Furniture/Duixiu 接管域相交，优先级必须明确，不能以新分支绕掉原阻挡或支承合同。

### P1-4：门禁仍缺，设计不等于接线批准

除真实上下坡 10/60 Hz、走跑、双向、双侧外，至少补：未注册 A/B；注册但域外 A/B；静止；跳跃/落下/跳过缺口；坏/重复/删除/替换 owner；删颈及删落台实际轨迹；部分脚印越边；错误高度的大地面不能救高缺口；边界水域；动态角色；普通细盒/头顶/下降阻挡；失败对角后成功滑动；跨域最终 token；dispose 后不残留；真实原接缝路线和内部路线分别保留结果。

严格路线不能只 assert 到达：每帧 raw body、独立 authored 脚高误差、全半径有效面覆盖及高度连续、无高处缺面均是硬条件。跳跃/真实释放分支需单列预期，不拿步行“精确贴面”规则误杀正常空中运动。初始地面显式可见试块仅证明 rig；真实 Environment / 台基 / 亭入口以后另验。

### P2：纯几何谓词边界和证据措辞

当前 4/4 与独立 oracle 足以支持本固定尺寸 rig 使用平面谓词，没有发现阻断算法错误。后续建议把 L 形凹角/反向路径/沿边精确切触及输入不变性固定入仓测试，避免只留外部 oracle。任意巨大浮点坐标的稳健性不能由有限 lattice 验证无限推广；本轮已拒不可表示查询与溢出路径，但不是精确实数库。

## 可继续的最小范围

按父已有授权继续**隔离实现与 RED→GREEN**，先写明确三态/释放状态机及连续扫掠合同，再做最小 Collision 委派。FirstPerson、原身体尺寸/时钟、无注册路径保持；不安装 PalaceBuilder、不宣称真实午门马道接通。P1 关闭必须由实际代码/负控/全回归证明，不由设计文件勾选。此前 source 比例、工程高程、接颈门位、真实平台与南墙接口等建筑证据未决，完全不因接触算法改进而关闭。
