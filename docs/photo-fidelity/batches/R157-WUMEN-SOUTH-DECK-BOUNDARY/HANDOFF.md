# 午门南亭真实台面南界例外（隔离候选）

基线：`4b5497a2a33b59dd3a4f247ebbd141fd531ba176`。不改 main/远端分支，不推送；交唯一集成人合并。

## 原因与范围

实用午门南台到 world z=-515.6，南亭中心约-503.6；旧 LAYOUT.BOUNDARY.minZ=-500 把真实外侧台面切断。原生 FirstPerson 在 x=±62 南行停在 z=-499.31/-499.47，非柱后净隙或可见实体阻挡。

保 constants 不变、全部可见几何/碰撞/高程/支承数量不变。仅实际午门安装器创建的真实 slab support 获得不可复制的 WeakMap 来源身份；CollisionManager 注册时保留其身份。每次越南界查询均核当前 walkables 中仍存活、原 source/注册 box 均未改变；脚面距12.3m不超过0.08m；整个半径脚印被相邻真实 slab 并集覆盖。单个 cell 拼缝不会产生新空气墙。其他建筑同高box、复制标签/clone、移除/卸载后均不授权。

东北西边界、河水、闭亭/柱墙等原碰撞继续独立执行。未增加隐形平台、未开放宫外地面、未改变角色半径或控制器。

## 实际验证

- 新测试最终驱动回放精确4b父：1通过/5失败，正向路线在旧南界被阻挡。
- 新候选专项6/6通过：16条实际FirstPerson路线，东西两侧、10/60Hz、走/跑、双向，全部到达且逻辑身体接触帧0。路径世界坐标 `(±62,-406.1) → (±62,-514.6) → (±42,-514.6)`，feet12.3。
- 合并原午门assembly/routes/wall-junction/real-library/descent与新测试：20/20通过；包含旧64路线及北台8路线，不称全World/GPU。
- Astra独立新6/6＋原13/13通过；确认source修改撤权、unload/reload、原生来源传递、完整脚印并集、其他边界/实体/水检查。未发现阻断。
- `npm run build`通过；有既有chunk体积提示。
- `npm test`不存在该脚本，不宣称默认全套通过。
- `npm run test:smoke`在Chromium socket() Operation not permitted启动失败，未建立页面，不绕过限制。
- `npm run test:gate`构建通过，zones阶段因武英门北侧/寿安门南北净空问题及 `Unsupported furniture-domain shape` 终止，其余门禁步骤未执行。精确4b父基线 `node tests/zone-lint.cjs` 也以exit2出现同名武英/寿安错误及同一FurnitureMotion调用栈，已保留 `base-zones.txt`。

日志保留 `/tmp/wumen-perimeter-audit-20261101/`，Astra日志 `/tmp/wumen-boundary-independent-regressions.log`，不把这些原始报告上传。

## 交互边界

“站在台面”按脚面几何接触带定义，不是 airborne 标志。旧南界外跳起超出0.08m接触带时暂止水平移动；独审验证可正常落回12.3m并继续行走，不会永久锁死。未授权开放空中或地面通行。后续若要允许台上跳跃的水平连续性，应单独按真实支承起跳/落地约束设计，不能扩大本例外。

## 集成文件

1. `src/scene/palace/special/WumenSouthDeckBoundary.js`（新）
2. `WumenPracticalAssembly.js`（安装器授权实际world支持）
3. `src/utils/Collision.js`（注册身份、南界有界例外；唯一集成人合并这三小处）
4. `tests/photo-fidelity/batches/wumen-south-deck-boundary.test.mjs`

新测试用底层 `replayKunning` 的真实FirstPerson驱动。旧 `replayGateTower` 包装器会把所有walkable克隆成未注册新对象（即正确撤销身份），故不能用于验证本能力；没有削弱或修改生产运动物理。
