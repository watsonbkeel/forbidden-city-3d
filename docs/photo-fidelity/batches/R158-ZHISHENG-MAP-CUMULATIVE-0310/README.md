# R158 治牲所地图入口累计修复

运行冻结 `5fe2b7b3198b153fae17fc5ce0742c5fa34b7cda`，基线本地 `9db2713115c1b2ef6eaaf2f439d9b0df1c2763a9`，已回读远端父 `ec54e94bc6e6ea55b0108dabd384abf5da877068`。仅一个生产字段：治牲所 mapItem.rot 从 0 改为 Math.PI；不是旋转建筑。正常 ZoneBase 和原 Teleport 无新增适配、无注入或 fallback。已有唯一北门、南实墙和所有几何/碰撞/支承/未知旗不变。

## 实际结果

旧地图导航朝南背墙，落点(-236.5,-258)，5m安全探针未走到墙；新落点(-236.5,-232)，朝现有北门。实际 Teleport.go 初始化同一原生控制器，10/60Hz走跑4往返共430帧全到达，脚地差峰0；南实墙180帧拒绝不变。累计完整报告逐对象等作者最终原件，不只比较摘要。5组件（1全流保全＋4地图净名）及1正常World共6测试，无失败/跳过。

World loadAll:false，从outer-east与global开始，实际go正常预加载axis-courts、ningshou；不是全分区/GPU验证。门的游戏开放/拟合位置、硬山与词条歇山冲突等原限制仍存于内部资料；公共地图仍仅显示“治牲所”。没有新增官方形制或现存认证。

## 保全与构建

相对9db的src/data/main/release差分精确仅ZhishengShell.js一个字段。性能模式四源及前四用户修复、Teleport/Collision、release逐字保留（见VERIFICATION）。旧性能91项本轮未重跑，不能冒称再次验收Mac温度/耗电。原文渊.3912739559与文华.44417642短冲刺诊断继承，未借本修宣称全场≤.3。

661模块 clean R158 `/gugong/` 构建和verifyBuildSource通过；outDir `/tmp/r158-zhisheng-map-build-0309`，buildId `R158-a15f523708f2`，源指纹 `75f4343a8acac1c7b4aaac5cdb1e41caba90913c5f861fac405bc69fd21a5abe`。无新ZIP、Pages部署或GPU/手机实机声明。

## 复核与本地边界

普通World命令 `PHASE=cumulative-0309 node --test tests/r158-zhisheng-map/world.test.mjs`（另用新PHASE避免覆盖原件）；`node --test --test-concurrency=1 tests/r158-zhisheng-map/component.test.mjs tests/r158-place-display/*.test.mjs`。
组件历史对照需要本地9db Gitblob；净树备份不保证该本地提交在远端可达，不声称远端clone可直接跑历史对照。精确基线模块SHA为 `fd732bdff9c0d2562c8c547fbc42f0eb26bd424a1899aeb1b4955c709e13e5e3`。普通World不依赖历史父blob。作者测试与原红记录保留，未改断言。

EVIDENCE仅登记本地/tmp日志/完整帧SHA和长度，非持久、不会上传原件。远端只本候选source/QA/简短摘要；既有回滚分支保留，不修改main/branches。03:04只读main相对87ca仍identical0/0，用户24B release原文保留。
