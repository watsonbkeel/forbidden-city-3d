# R158 — 默认节能运行与后台安全暂停（作者候选）

基线 `c20fd576a9bd2469d69df0d0d14fc3086be92c3e`（四项用户修复运行源）。唯一作者独立工作树，不改基线、main/branches，不上传。累计整应用构建及远端回读由唯一集成人完成；本候选尚不代表已发布。

## 用户可见行为

- 所有设备默认 **节能 · 30 FPS**；“游览设置 → 运行模式”可切“流畅 · 跟随屏幕”。旧高/低画质、音效、人物、地图设置不被切换或覆盖。
- 节能实际 DPR = `min(devicePixelRatio, 原画质上限, 1.5)`；低画质仍至多1。流畅恢复原画质DPR和刷新节奏。切换走同一resize，renderer/composer/FXAA同步。
- 只读写独立 `fc3d-performance-mode-v1` 的 eco/smooth 值。没有值、坏值或禁止存储时默认eco；保存失败不阻断本次使用，界面明确“浏览器允许时在本机记住”。不新增其他设置持久化、不迁移旧键。
- 一个主游览RAF：节能闸在所有主update/render之前；用余数deadline避免120/144Hz时频率退化。hidden取消待执行RAF并停止重排；旧迟到callback不能复活。visible首帧dt=0，清键/跳跃队列/飞行输入，保玩家位置、飞行占用/路径、地图freeMove，不自动请求指针锁。
- 停在异地的无人飞机空闲回收计时扣除hidden时间，避免后台回来即换位置。无新增物理/支承/实体/NPC数量改动。
- 不把打开地图或失去pointer lock当暂停条件；地图同行保留。加载时为进度条让出的RAF和既有各模块异步任务不属于此主循环限帧合同。

## 实际验证

`final.tap` **87/87**（新17+继承70）；非全站测试/整World/GPU。

1. 虚拟RAF：60/120/144Hz输入各10秒，主调度约30帧/秒；smooth保刷新节奏。100次visibility切换至多一个待执行RAF；初始hidden不排，hidden零update，取消后迟到callback、dispose不复活。可见长卡顿dt上限0.1，无补算突发。
2. 从实际 `main.js` 提取类、仅移除启动/替换import.meta测试环境，平台RAF/DOM/渲染依赖为桩：主正常入口全部update/render计数相等；hidden恢复dt/位置与飞行状态、独立模式/DPR同步。不是完整浏览器GPU证据。
3. 实际SettingsMenu+项目DOM fixture：独立运行按钮可发现/可点、aria-pressed同步、原高画质/静音/人物关闭不变；原菜单/输入/会话、postprocessing质量生命周期、FlightTour操作及独立手动交接70测试通过。
4. 原FirstPerson/Collision在30Hz：平路、地图freeMove、真实跳跃落地（峰1.733333m）、薄墙跑步拒绝、显式传送清输入。两层南翼实际组件上下往返：走434帧/跑233帧，峰脚地差0，真实到达3.3m上层再返回地面。
5. 实际FlightTour+FlightState在虚拟120Hz RAF输入/eco30Hz更新：起飞、hidden保持、恢复首帧不跳位、下降、停稳后退出。是局部真实飞行模块/DOM事件，不是整宫飞行/GPU。

## 红测与限制

- 初始13项全缺功能断言RED（不是import崩溃），随后实现。首绿11/2：两项主方法测试的VM与导入scheduler默认document属不同JS域；仅QA显式注入相同平台依赖后通过，生产未为该错误放宽。
- 首本地实控2/1：飞行已触地但尚未下一accepted帧归零速度，QA过早要求停稳操作面板；保落地断言，补等后续8个120Hz输入tick后验证停稳/退出，生产不改。
- 增加异地停机hidden空闲计时真RED（3绿1红）后，只在主visibility边界扣除隐藏区间，最终87全绿。原失败及最终证据均保留。
- Mac温度、耗电、风扇噪声、真实浏览器帧率/GPU/手机未实测。30FPS是调度目标，不承诺慢设备必达；调用预算下降不等同温度测量。无新试玩包/部署。
- `/tmp/r158-performance-0240` 原TAP/实控摘要仅本地、非持久；远端只本说明和SHA索引，不能声称远端可逐帧回读这些原件。

## 复验命令

```sh
PERF_NATIVE_OUT=/tmp/performance-native.json node --test --test-reporter=tap \
 tests/r158-performance/*.test.mjs \
 tests/settings-menu.test.mjs tests/settings-tour-session.test.mjs \
 tests/settings-inputs.test.mjs tests/postprocessing-quality-lifecycle.test.mjs \
 tests/current-state/r31-flight-operations.test.mjs \
 tests/r36-helicopter-independent-lifecycle.test.mjs
```

无项目通用 `npm test` script。本轮按授权只跑上述有界集合，未运行整个历史套件。作者四生产路径已完整接线，无另行patch；父集成人只需精确摘取、必要累计构建和身份绑定，避免混入其他WIP。
