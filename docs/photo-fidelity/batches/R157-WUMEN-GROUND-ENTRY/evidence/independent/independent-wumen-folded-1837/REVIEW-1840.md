# 3b2 隔离折线内部链：只读独立审查

**结论：支持记录为新的“已认证局部 rig 内部折线穿行”16/16 诊断结果；不是原完整路线修复验收，更不是实际午门/亭口/台基完成。** 没有发现这份原 JSON 的 4771 帧统计造假或几何计数错配。独立离线复算补证了每个记录帧的完整 .5 足迹，但 driver 的到达/支承口径必须按下述限定说明。

## 输入身份与执行边界

- 当前源码提交 `3b2d95ae544d41d348a536a41a4f89026d62e24b`。1824 的33输入及598源清单均逐项等当前文件和 HEAD Git blob；未出现审后运行源漂移。
- 新外置 driver `contact-controller/probe-authenticated-interior-1818.test.mjs` SHA256：`24ef4470a5622a33946ce67c2acfb8c61819adbd80eb81e3c2b449f7ad51139c`。它**不是原33路径中的测试**。
- 原输出 `authenticated-interior-1835b.json` SHA256：`a968548b5b5ec1df4ab2b455baf1d0a0dd8c0ffb21c1364b18c79f4ab5f23877`。
- 后补的 `authenticated-interior-input-bindings-1837.json` 所有输入/输出 SHA 与实际文件一致，记有 `CONTACT_PROBE_RESULT` 输出环境变量。应称运行后身份整理，不倒称新 driver 的运行前冻结证明。
- 原 resource：Node v24.22.1、768 MiB heap，实际16/16、exit0、19.703秒、最大 RSS112356 KiB。1835 无 b 首次是 `/usr/bin/time` 不存在、exit127，Node 没启动；保留它是启动错误，不计作路线 RED。
- 本审没有重新运行 FirstPerson 路线或 World，只静态读源码、校验文件/Git及对既有 JSON 做约0.13秒的离线几何/raw CM查询。独立文件在 `independent-wumen-folded-1837/`。

## Driver 是否真实

`r72-player-fixture.mjs` 调用实际 `new FirstPersonControls(camera,canvas,cm)` 与实际 CollisionManager，调用原 controls.update；临时 DOM/锁鼠标和固定步进时钟是原 fixture 机制，未改控制器、运动速度或碰撞函数。该 fixture、ui-dom、package及lockfile均等3b2原字节；实际 FirstPerson 仍等48a父字节。

driver 把14件实际封闭 rig 的 collider/walkable 注册到真实 CM，再显式注册局部 owner。每帧仅朝向下个 waypoint并走/跑，没有逐帧直接设置位置或脚高。初始 feet/ground/airborne 是明确构造条件，不是从实际地面入口自然行走而来。

两侧 × 上下行 × 10/60 Hz × 走跑的16组合无重复或缺失。每侧路线使用7件中心和6共享边中点，共13个点，前进12次；不把东西镜像作为替代证据。

## 4771帧独立复算

独立 `audit-frames.mjs` 从相同已冻结 rig 重新构造真实 CM，并逐帧复算：

| 检查 | 结果 |
|---|---:|
| 组合 / 原帧数 | 16 / 4771 |
| raw CM 身体端点碰撞 | 0 |
| 重算碰撞与记录不一致 | 0 |
| 重算中心 provider集合与记录不一致 | 0 |
| 中心不存在 authored支承区域 | 0 |
| authored数学坡面脚高最大误差 | 0 |
| 记录的 airborne=true 帧 | 0 |
| 独立完整半径 .5 方形足迹未覆盖 | 0 |

足迹复算没有调用运行 provider 的 coverage函数，而以每侧7矩形的 z条带/x区间并集独立计算；没有用下方零地面或另一侧面补洞。这是**记录帧几何覆盖**补证，不是 onSupport 字段恢复，也不是所有 solver实际接受子步的录像。raw body仍是既有普通碰撞的 .35m 脚部 clearance/内部代理语义，不等同完整脚底三角精确碰撞。脚高误差0针对 authored 双精度数学平面，不能抹掉先前已量化的 Float32 可见网格微误差或工程高程非测绘性质。

每例 waypoint progression均由独立重算得到12次；端点等原JSON记录。10 Hz下行跑步的首个记录帧已离开receiver，故那两例仅在帧末见到6个owner；初始位置在receiver上。不能据帧末采样声称每个小步/接缝都已有独立状态日志。

## 到达与支承的必要限定

1. `arrived` 使用原逻辑：距离 < .12m **或**跨过目标垂直分界平面；没有要求停住/速度衰减。原帧中终点离最终目标最大 **0.6065598276731751m**，任何被跨过的中途 waypoint 距离最大 **1.0430128575225008m**。这些点仍有完整足迹覆盖，但应称“通过内部 waypoint序列”，不是“精确到点并稳定停止”。
2. 原 `unsupported` 只数中心不在任何矩形且脚高>.01的帧，并非完整足迹或控制器 onSupport断言。本审另做完整足迹验证，可以并列注明“离线补证”，不可反写原driver已断言。
3. airborne字段虽均false，原driver只记录未硬断言。onSupport、groundY、verticalVelocity、solver实际接受子步与停止后状态**没有存入该原JSON**。不能声称这些状态已从4771帧逐项验证。
4. 后续如果升级为正式路线门禁，应另留新轮：显式完整状态/足迹硬断言、实际接受子步或等价连续证据、停止及边缘行为。不要覆盖1835b或把新的更强结果倒记入本轮。

## 与原RED的关系

旧 `probe-interior-unique.test.mjs` 与其1705原TAP/JSON/exit，以及1704严格诊断原TAP/JSON，都与已提交归档解压字节精确一致；两轮仍各为0/16。旧证据没有被修改。

新 driver 对旧内部 waypoint方案作了以下显式变化：删除首个域外0地面点；从entry中心的真实 authored高度约 **1.65m** 开始，逆向从receiver的12.3m开始并只走至entry内部；增加局部绑定；脚高容限由 .005 收紧为1e-9；相应改名称/输出scope。其余中心/共享边点及原 .12/crossed到达规则保留。

因此这不是同起终点/同授权条件的原16条RED→GREEN。旧未认证零地面入口、从entry至外界下降/释放、真实亭口接入被明确排除。新内部链目前也没有运行精确父 Collision 的同scope负控；此前单坡内部16的父0/16只能证明那个较小范围，不能挪作本折线链负控。

## P0–P2与结论边界

- **P0：本次只读检查未发现。**
- **P1仍未闭合：**完整起止/零地面入口/失足释放/真实建筑接口、实际World注册及全局回归。若要声称“原完整路线已修复”，还缺同scope前驱负控与完整路线终态；本轮不批准该升级。
- **P2记录与driver：**到达只是越点、未验停止；支承及竖直完整状态未硬锁/未全记录；外置driver的后补身份清单要如实说明。这些不否定已复算的记录帧结果，但限制可以作出的结论。

可用措辞：“在3b2未安装局部候选上，新的折线内部16组合原运行全过；原4771帧经独立离线复算，raw身体端点碰撞、数学脚高误差和完整足迹缺口均为0。原完整路线RED、外部入口/释放及实际门楼接口仍未验。”

本审不修改既有3b2有限审批或源图UNKNOWN，不新增完成件，不主张World/full/build/GPU/远端备份通过。
