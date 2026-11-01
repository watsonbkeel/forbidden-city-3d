# 午门连通 grounded substep：1804 冻结有限独审

## 结论

**固定14面、12条真实共享边的局部 grounded 小步可接受为后续隔离 shared-entry TDD 的前置。** 原半径/高度/域外角落问题已在此轮关闭；这不批准生产注册、实际马道完整路线或真实地面/亭入口连接。

本轮独立运行 **41/41、exit 0、751.17 ms，无 skip/cancel**：ground11 + seam24 + boundary6。没有 World、CPU/GPU或审核者生产改动。10路径 `ground-step-connected-freeze-1804.json` 尾核全部SHA匹配，旧592个src/data文件逐字等HEAD48a。审计时另5新模块仍为隔离候选，原Collision/FirstPerson未改；尾核后已明确释放冻结供作者另阶段工作，后继不得倒写本报告。

关键 Motion SHA：`fa04e15f5805255a8db2c50490f5062c27afc6f6ca1663080c80745b77036fb2`。全部输入、原TAP、独立探针在 `independent-wumen-connected-1806/`。

## 已核范围

- 固定管辖域来自全部expected14面，不因缺owner缩小。真实线段对.5膨胀矩形判断接管范围，绕外角但整段足迹实际不交域时OUTSIDE，不因坏owner额外抛错。
- 有binding后先完整认证live owner子集，再检查kind/grounded/radius；**active半径仅.5，水平小步最多.25m**。非.5不再靠缩脚印接受原本不安全的路径。
- 初始脚高与authored面仅允许64×EPS×高度尺度的运算回绕；1e-10几何偏移已拒。正式测试采14面×1025点的eye往返误差，界内通过；没有使用Y容差补XY缺缝。
- 固定14矩形无正面积叠层，实际正长度边恰12条，所有共享边两端authored双精度高度严格相同；测试还对照rig真实seam IDs，不只数12。
- live图使用真实共享边/相容高程形成连通分支。全.5方足迹对该分支做完整路径覆盖；每个中心路径区间检查真实面和高度唯一/相容，按实际矩形边事件拆XYZ段，逐段raw+ordinary连续扫掠。
- 24项双侧、各6条边、双向正向小步过；12边静止/双向切向共36 query过；删两侧neck/receiver均UNSUPPORTED；错误起始高度、partial/airborne/长步/异类actor、坏owner、真实foreign薄体均保非接受。
- 返回仍routeAcceptance=false。没有地面入口/出口、air release/landing或实际FirstPerson handoff。

## 独立判别性 kink 探针

只放“共享边薄墙”不足以证明实现不是把坡度折点错误压成一条弦。本轮另构造两个真实CM、真实rig、真实ordinary foreign盒案例，不mock物理函数：

1. **错误弦假阻挡**：east entry→innerTurn的.2m跨缝，放一块低薄障碍，使错误单弦进入普通身体区间，而真实分段已抬至平面、保原.35m clearance。错误弦 sweep=blocked；正式分段step=SUPPORTED。
2. **错误弦漏顶板**：同路径另一薄顶板，使真实第一段身体升高时碰撞，错误较低弦线却从下方错过。错误弦 sweep=clear；正式分段step=BODY_BLOCKED。

结果符合预期，证明这两个有判别力的实际例子确实依赖分段高度，而不是只查最终点或整条弦。详见 `kink-probe.mjs/.json/.log`。建议后继纳为固定QA，但本报告不假装已纳当前41项。

## 旧合同与未覆盖事项

原单面测试里一条SEAM_UNRESOLVED被明确迁移为SUPPORTED，属于有限合同迁移；原全文已有历史副本，不称旧11原字节全部不变。此前旧16原路线与内部路线各0/16的严格红证据仍保留，不能拿24个局部接缝测试覆盖。

P0：无本轮运行安装造成的P0。

局部P1：固定.5/小步、缺neck/receiver、域外corner与高度回绕等本组已知问题在这有限输入中关闭。

整体P1仍在：真实ground/entry/exit；缺面真实下落而非保守拒绝；跳跃/landing；accepted solver小步与滑动；单次handoff；默认/域外原行为A/B；全部共享回归。所有建筑图源尺度、工程高程、亭入口、墙/台接口未知也不因此算法通过而消失。

P2：该固定无叠层矩形模型不能直接推广到任意回环/多层覆盖；浮点有限样本不是实数形式证明，原Float32 mesh表示误差仍须按primitive合同表述；overhead保守拒绝与ordinary严格交叠语义沿用前报告。

## Shared-entry 设计只读意见（不是实现验收）

已读 `SHARED-ENTRY-PROPOSAL-1804.md`，读取SHA `d92dac499517eb306444e9d35e95ab2ccb3c3446f4f69e5028a0e8bcaf355d4c`，并收到作者后续明确决策。可按父已有授权做最小Collision-only隔离TDD，FirstPerson保持原字节，**不授权PalaceBuilder/默认World注册**。

必要条件：

1. 未绑定CM O(1)直接旧路径，不新增认证扫描、状态或权威。active只选真实player且grounded，NPC/kinematic/airborne走原分支并清候选token，不可将纯函数UNSUPPORTED_ACTOR当NPC的新墙。做域内与域外真实旧版A/B。
2. pending仅由实际接受的小步发布。失败对角/失败X或Z不污染；最后实际接受的外部/旧分支清pending，并终止本call候选认证链。同call再入不能仅验证后半段后复活handoff；下次新call另认证。
3. 垂直接口truthy值会被原FirstPerson当完整state消费。未实现的active partial/unsupported或token失配，本隔离阶段应抛明确diagnostic，而非返回残缺{status}、null掉旧0面或复制state无限悬浮。这不是生产边缘物理。
4. token绑定call、finalXZ、原帧实际feet/grounded状态、source身份及半径，一次消费；不复用Furniture ID/lastFurnitureStepFeet。无移动时也单独认证真实静止支持；跳跃不黏附/重置速度。现src仅FirstPerson调用该vertical API可作为有限前提，不宣称识别任意外部伪装调用。
5. 所有真实旧/普通分支接入顺序、return/lastGround/旧字段和水域/动态/三角语义须回归。保留旧两文件fixture只能证明这两个文件的前驱身份，不冒称完整历史闭包。
6. 当前每个candidate body查找会filter全collider数组；实际World的544×N重新验证可能昂贵。这是静态复杂度风险、未做World性能测。可另阶段用每次认证的临时mesh→rows索引保重复/身份检测，不用会漏删除的跨call陈旧缓存，且不混改本冻结。

上述条件支持设计继续，不代表共享入口已过测。作者新shared-entry初始4测1绿3红仍只是TDD起点，不能作为完成证据。
