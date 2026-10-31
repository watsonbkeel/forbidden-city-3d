# 3b2 新停止轮：16条真实 FirstPerson 内部链独立只读审查

**结论：本轮有限内部路线的“到达并稳定停止”及完整记录状态检查通过。** 与此前只越过 waypoint 的1835b不同，本轮最后一点要求真实停稳；5658帧经独立离线复算全部与原记录一致。同一新driver的精确父Collision负控0/16是真合同红。仍不代表真实地面入口、完整马道或World/建筑验收。

## 身份及原件保留

- 源码提交 `3b2d95ae544d41d348a536a41a4f89026d62e24b`；33输入/598源逐SHA仍匹配1824冻结。FirstPerson保持原父字节，无本轮生产改动。
- driver `probe-authenticated-stop-1841.test.mjs`：SHA256 `78ae4b2a48b4f38bf2d625ad5cec03d52989e3d4528833fdd5536ba46d0d64f5`。
- 原JSON `authenticated-stop-1841.json`：SHA256 `c2cf0952dc0d0c6c2d7a01256aa4575211b33d73de877c6f543e346f3df6bd38`。
- 实际resource锁同driver、cwd、HEAD、输出环境变量及命令；当前作者终态16/16，exit0，21.202秒，RSS158488 KiB。
- 旧1835b driver SHA `24ef4470…1139c`、4771帧JSON SHA `a968548b…23877` 完全未变。本轮是新输入策略/更强断言的新结果，不覆盖旧越点记录，也不倒称旧轮已检查停止。
- 本审只静态源码、校验身份及离线复算原JSON；未重跑FirstPerson、World或CPU图。独立产物在 `independent-wumen-stop-1844/`。

## 控制输入是真实状态驱动，不是强制停住

使用原 `r72-player-fixture` 的实际FirstPerson构造器、实际CM、原update/原固定步进时钟和相同14件已认证rig。初始位置仍是内部entry中心约1.65m或receiver中心12.3m，不是地面自然进入。

本轮每帧只调整相机yaw目标与 `moveForward` 输入标志，`canSprint` 为该案例既定走/跑设置。没有直接改运行位置、velocity、motion.speed或碰撞结果；初始feet/ground/airborne仍是明确初始化。它测试的是输入状态驱动，不是DOM键盘事件或真实人的操作误差。

最终目标的松键策略读取当前速度，按原指数减速率10计算预计余滑距离：
`speed × dt / (exp(10 × dt) − 1)`，再用 `max(.12, predictedTravel + .08)` 决定是否继续前进。这是**知道控制器减速规律的自动驾驶策略**；它不是对任意松键时机、任意玩家输入都能停准的证明。

独立逐帧重算输入判断与原FirstPerson的 `1-exp(-10*delta)` 速度递推（包含原<.01时自然归零及fixture实际浮点时钟），输入不一致数为0、所有velocity误差为0。每例实际都只松开一次，没有重新按下，也没有由driver强制归零。motion.speed与实际水平位移/真实delta的误差同为0。

## 5658帧独立复核

重建同冻结的真实CM，仅对已记录帧端点做raw body查询；另用独立z条带/x区间并集计算完整 .5 方形足迹，而非调用driver的coverage函数。全部16组合唯一完整（两侧、双向、10/60Hz、走跑）。

| 项目 | 结果 |
|---|---:|
| 总帧数 | 5658 |
| raw身体端点碰撞 / 中心支承缺失 | 0 / 0 |
| 独立完整足迹缺口 | 0 |
| onSupport非true / airborne非false | 0 / 0 |
| authored坡面脚高最大误差 | 0 |
| groundY与feet最大误差 / 竖直速度绝对最大值 | 0 / 0 |
| velocity递推误差 / motion.speed复算误差 | 0 / 0 |
| 输入策略不一致 / stable计数不一致 | 0 / 0 |
| 最终距目标最大值 | 0.06386628473592129m |
| 最后稳定段位置漂移 | 0 |

原driver本轮已明确硬断言完整足迹、onSupport、airborne、groundY、竖速、数学脚高、raw身体及最终stopped。不是只记录而未断言；离线结果也不只引用作者summary。

### 最后1秒及阈值

中途waypoint仍允许原 `.12m或crossed` 进位；**最后目标不再允许crossed替代停准**。需同时：距离≤.12m、真实velocity长度=0、motion.speed=0、非airborne、onSupport、竖速=0、每步水平位移≤1e−9m，连续至少fps次update。

16例均最后10或60次update满足这些条件，moveForward全false，XYZ位置实际完全不变（不是只在1e−9以内缓慢漂移）。稳定计数独立重算无误。按步数是1秒；重建实际IEEE时钟累计最小为0.9999999999999633秒，是浮点表示差，不应宣称比离散测试更高精度的连续实时时长保证。

.12m是明确验收容差，.08m是松键预测余量，1e−9用于数学接触/位移检查，速度归零门槛来自原控制器的.01；没有修改物理或把停止门槛放宽至旧0.607m越点误差。

## 同driver精确父Collision负控

`authenticated-stop-parent-1843` 使用相同driver SHA、相同16案例，仅加载已锁48a父Collision，实际FirstPerson SHA仍被loader验证。结果0/16、exit1，首次失败为：
- 15项 `actual onSupport each frame`；
- 1项 `full .5 footprint each frame`。

均为真实断言，不是加载失败。原JSON实际 **15739帧**，其中7例stopped条件最终成立但仍因之前帧的安全/支承合同失败；不能将它们称通过。25200是所有例都跑满45秒的理论上限，不是实际记录帧数。

该负控证明这个新停止合同能区分父Collision与当前候选；不是原1704/1705完整路线已修复，也不是完整历史依赖闭包（loader只替Collision并核FirstPerson）。本审读取并核作者负控的原TAP/JSON/身份，没有再执行一次负控。

## P0–P2与未验范围

- **P0：本轮未发现。**
- 上轮P2的“最终只越点、停止后完整状态未存/未硬锁”在**这个新停止轮**已关闭；1835b仍保留其原先局限。
- **P1仍未闭合：**真实零地面入口、离开entry/receiver、缺面释放及着陆、建筑亭口/台顶/南墙等接口、完整World与全旧回归。仍不能默认安装或声称整个马道/门楼完成。
- **P2：**尚无实际accepted子步全状态日志；本轮独立查询证明的是记录帧端点，连续安全仍依赖先前已审的分段Motion/Sweep合同。自动驾驶策略不代替任意输入/延迟/边缘停步验证。
- **P2性能：**完整owner认证的逐行全collider过滤存在既知复杂度风险。当前21.2秒/5658帧与父0.73秒/15739帧既不走相同认证，也不走相同失败轨迹，不能直接当等价性能比或具体加速目标。后继索引优化应独立冻结、保重复/身份/变形负控，并验证实际行为等价，不能继承本轮SHA结论。

可称：“3b2未安装局部rig的新内部停止16组合通过，5658帧全状态及最后10/60步停稳经独立离线复核；同driver精确父Collision0/16真实负控。外部入口、释放、真实建筑与World仍未验。”
