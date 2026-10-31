# 午门局部接触共享入口独立有限审查（1824 冻结）

结论：**允许保存为“未安装的局部共享接触候选”检查点，并继续隔离诊断；不批准实际 World 注册或完整午门/马道验收。** 1816 发现的注册代际 handoff P1 已在 1824 真实 RED→GREEN 后由独立探针确认关闭。本轮没有发现新的 P0。既有完整路线、真实建筑入口及全局回归门槛仍是未闭合 P1，不能用下面的单坡 16 项替代。

## 1. 身份、只读范围

- 工作树：`r157-wumen-joint-layout-1622`；基准 HEAD `48a6dcf7c94dd1233e1135e8fbf4f12f837e1074`。
- 逐项独核 `shared-entry-freeze-1824.json` 的 **33 路径**、`source-shared-1824.json` 的 **598 源路径**：文件集合、每个 SHA256 全同，无源符号链接。
- 相对 HEAD 的原 592 源，仅 `src/utils/Collision.js` 变动；另增 Fit/Contact/Coverage/Motion/Sweep/Handoff 六模块。`FirstPerson.js` 原字节不变。
- 相对已读 1816 冻结，仅 Contact、Handoff、shared-entry.test 三路径变化；源清单仅前两路径变化。Collision 没有借本轮新增其他行为。
- 本审未修改仓库源或 QA，未运行 World、CPU/GPU、构建或全套；所有独立证据在 `independent-wumen-shared-1819/` 与 `independent-wumen-shared-1828/`。

关键最终 SHA：

| 文件 | SHA256 |
|---|---|
| Collision.js | `5fa4c7fb5e9dd2c4992ad0d3a3a4ace32dd562e6668d3941bd568725167e0d54` |
| FirstPerson.js | `c90de689a5710d1ed272482429b25b14774591eb0f6dd09731cf6bc8c4d5c61c` |
| Contact.js | `fe721a92b817fef95099bcdc79903d02d38b3b2414fb5df1d5149e97b092bfab` |
| Handoff.js | `7c3c4b1eb7ada040a6c7d71aeaf6ed8fe60a93639c8997b9439e216f8b699349` |

## 2. 实际独立结果

1824 同冻结执行 shared-entry、player-interior、shared-outside 三文件：**26/26、exit 0，3170.736 ms**，即 shared 9 + 实际 FirstPerson 16 + A/B 1。命令与原 TAP 见 `current-26.tap/.exit`。不能把其中子进程 A/B 920 行再当额外 920 个测试。

- 16 项确用真实 FirstPerson 构造器、真实 CM、实际注册的封闭坡体/支承/普通 body；两侧、双向、10/60 Hz、走/跑。逐帧锁 authored 脚高、raw 身体无碰撞、非 airborne、onSupport、完整半径 .5 足迹及到达。
- **它们只在单一 outward 坡面内部约 4 米行程**，不是六段折返马道、未知零地面起点或亭口接入。
- 1816 独立使用精确父 Collision 的同 16 项反跑为 **0/16**，全部失败消息是 `hard actual authored foot height`，并非测试加载失败或 fixture 缺失。1824 未改变该测试、Collision 或父 loader；原红证据继续有效但不冒称本轮重跑。
- 父 loader 仅精确替换旧 Collision，锁实际 FirstPerson SHA；已核两原件与 48a Git blob/字节一致。**不是全仓旧历史闭包**，不可称完整旧版 clone 对照。

### 920 行旧行为 A/B

1824 再用独立父/当前进程导出 **20 场景、920 行**，两份 JSON 逐字相同，也与本审 1819 轮逐字相同。SHA 均：
`d3f4de5eaf709e71745a1ecf984bef88bc47a66444f479be4db6143eed742a01`。

- 12 个 raw CM 场景：绑定/不绑定 × 域内/域外 × 无 actor/kinematic/airborne-player，每个 30 行；记录 position、lastGroundY、lastFurnitureStepFeet、lastDuixiuStepFeet。
- 8 个实际 FirstPerson 域外场景：绑定/不绑定 × 10/60 Hz × 走/跑，含实际跳跃；记录 position、feetY、groundY、airborne、onSupport、verticalVelocity、velocity。
- 这是这些字段和场景的 JSON 字节等价；不是全部内部状态、所有 IEEE 特例、NPC 动态人群、水域/其他地形或整个 World 的等价证明。

## 3. 共享入口与 handoff 审查

- 没有生产安装调用：src 中注册函数仅定义，未由 PalaceBuilder/World 调用。无登记时没有新支承授权，O(1) WeakMap 检查后沿旧数值分支；实测 A/B 支持该有限默认不变结论。
- 横向授权来自 `getValidPosition` 的**实际接受小步**，不是最终位置回推路径或事后任意抬脚。结果先通过完整 owner、半径、连续面/足迹和实际 XYZ 分段普通体扫掠认证，才更新实际 valid 并发布结果对象身份。
- 真实 diagonal 拒绝 → X 接受 → Z 拒绝测试通过；pending 只对应接受的 X。失败尝试不会抹除有效接受链。已接受 legacy 分支会终止本 call 候选链并清 pending；该退出/重入项目前是 helper 状态契约，**不是实际跨域路线已验**。
- vertical 取出即消费 token，检查 final XZ、原脚高、零竖直速度及当前真实支承；无 token 的静止请求也重新认证，不靠旧 token 持续托举。重复旧脚高请求拒绝，合法当前脚高静止请求是新支承查询。
- airborne 请求清 token 后返回旧竖直行为，不重置跳跃；这不是新 provider 的空中着陆验收。
- 域内无法认证的 vertical 是明确 TypeError 诊断，不返回会使 FirstPerson 接受 undefined 的半成品对象，不 null 回落到隐式 0 地面，不造保持原高度的悬浮假支承。该行为仍属隔离开发诊断，不是最终可发布的失足/释放机制。

### 已关闭 P1：注册撤销后跨代际消费

1816 独立真实复现：CM 已接受坡面小步 → dispose → 同样 owners 重新注册 → 旧 token 仍得到 `wumenJointHandoff:true`。这违反来源生命周期；并未声称该探针证明了穿体。

1824 为每次 WeakMap 登记保留不同的不可变对象身份；begin 捕获，try/publication/consume 检查同一代际。它只证明来源代际，不能代替每步完整几何/物理认证。

- 作者原 **7 绿 2 红** 的 generation RED 保留；独立原探针现在报 `registration generation changed before consumption`。
- 额外独立三个边界探针通过：撤销且不重注册时拒绝/消费旧 pending、随后未绑定查询回旧 null；活动 call 中换代不能再提出结果；旧 dispose 句柄不能撤销新登记，新 call 仍正常。
- 原 1816 三文件存档 SHA 与先前冻结精确一致，未覆盖最初缺陷证据。

## 4. 尚未关闭的门槛

**P1（限定结论不等于通过这些门槛）：**
1. 原完整 16 路线严格红必须保留；此轮没有重新验证完整折线路径、所有接缝转角、起止及停步超越。脚高/无高空 unsupported/body 断言不得降级。
2. 真实零地面入口、退出或删颈后的落下、空中 landing、partial 边缘释放尚无实现验收。拒绝移动/抛错是开发 fail-closed，不应包装成无形防坠墙的建筑正确性。
3. 认证仍是 `LOCAL_CONTACT_RIG_NOT_LIVE_WORLD_SCENE`；接收试块不是亭门或真实平台。源图比例、高程、台顶/南墙/阙门接口未知没有因控制器通过而消失。
4. 共享 Collision 的全旧控制器回归、实际 World/动态体环境、完整 batch 与构建尚待独立终态；920 行不能替代。未授权据此默认注册或发布整版。

**P2：**
- 完整 owner 复核中普通体行匹配仍可能 O(544×全局 collider 数)；未绑定路径也有新 Vector3 临时分配。小 rig 约 3 秒不证明大 World 性能或内存安全。优化应另做等价测试，不混入本次已冻结论。
- 目前高度工程拟合和普通 body 代理误差仍按前阶段明确范围；不能称精确三角身体或实测建筑。

## 5. 保存/备份措辞

可称：“598 源的未安装局部接触开发候选；单坡 FirstPerson 16、共享/生命周期 9 与有限旧行为 A/B 独审通过；原完整路线红和架构未知仍保留。”

不可称：“午门整体完成、全马道已可走、已接实际 World、旧全套无回归、GPU/远端恢复已验”。本审未执行上传；任何后续备份或提交身份须另外核对，不能把本地输入冻结冒充远端验收。
