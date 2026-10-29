# 咸若馆抱厦正面闭窗区域验证

## 范围与实景边界
基线c16795e728367afe20e554cb61b9a754770ff554。官方建筑236534正面照片实际查看，约1MiB缓存，不打包生产。图支持左右各4闭窗、红褐涂饰框、金色细边、密斜格、上下窄横框及灰砖槛墙。精确格数/材质/工艺/细纹均未测绘；中央门卷曲纹不复制到窗。照片所示闭门姿态与模型开放观览状态分开。树遮主体侧窗未复制本次细节。

## 实作及空间
8闭窗与2槛墙成组处理；56旧粗格移除、480个内嵌件。保留原不透明窗拓扑，背衬材质未知。每件接背板且落于原叶包络；全装配最终Float32包络相同，原保守窗AABB不变，不等于精确凹格表面。金线前沿在红框前，专项红测先抓出被框遮住的问题后修正；仍不越原叶。无新collider/walkable或隐形面。

几何指标（metrics.json）：277→701未合并mesh，17→19合并mesh，5064→10152三角。colliders74、walkables2不变。4个原开门、8个遮挡主体窗、屋顶、抱厦/本殿空间与3面旧阶梯柜、房间导航保持。

## 测试与独立审查
`node --test --test-concurrency=1 --test-reporter=tap tests/major-pilots/xianruo/*.test.mjs` 专项7/7（specialized.tap）：
- 原physics/navigation严格相等；实际Float32最终合并顶点和包络；各构件接背板；金线前于红框。
- 所有非目标几何与材质保持（仅两块槛墙允许改色，几何仍逐属性比较）；英华共享构造隔离。
- 全World真实控制器：抱厦入口及抱厦→主殿两段双向路线，10/60Hz走跑16路次。
- 局部CollisionManager：窗前走跑跳8组逐帧与原版严格相等，实际起跳高度及不能穿窗另断言。

独立审查轻量5/5，照片边界与选择限定通过；“临时闭门”已纠为“照片所示闭门姿态”。未验证GPU/实机视角：VERIFY_PENDING、acceptedWholeObject=false，不是整馆验收。

相关旧测试初轮48/51；其中R46 all120的axis-courts/24陈旧R45几何签名失败，在父c16795e7源码hook同样复现（parent-related.tap 29/30），与本次无关，保留失败。其余两项是本次装配形态与历史快照契约变化：
- R46仍逐一检查所有原实体；8个新内嵌窗改核完整真实装配包络匹配原保守代理，而非要求后半厚背板单块匹配整叶代理。不放宽其余实体。
- R66 Yinghua-only历史快照显式关闭后续Xianruo窗拟合，只用于该快照；默认开启模型隔离由本次专项覆盖。
两项迁移后相关文件17/17（migrated-contracts.tap）。父源码对照可复现：`node --import ./scripts/major-pilots/xianruo/parent-hook.mjs --test --test-concurrency=1 tests/r46-independent-ritual-halls.test.mjs tests/r46-ritual-layout.test.mjs tests/r66-h-yinghua-windows.test.mjs`。

未跑全current-state/全major，无构建/大资产复制/推送；旧脏报告保留。

最终一次串行相关集58项：57通过，唯一失败仍为父版本已复现的R46 all120 axis-courts/24旧签名；见final-related.tap。没有SIGKILL，没有更改旧签名或缩减原断言。专项与大佛堂、英华/咸若相关测试均纳入这次串行集。
独立复审确认两项测试迁移合理：旧黄金数据未改、默认模型隔离另测；57/58唯一失败的名称与actual/expected哈希逐项一致。按“既有失败仍存在、视觉待核”边界提交，不称全套全绿。
