# R158 协和跨区：不因拓扑邻接而激活无关远区

基线：`bf6705edcd704a3af32ff3b6cba6cb635b529955`（开发版 5a086）。仅改 `src/scene/zones/ZoneManager.js` 两处排队，不改建筑、碰撞、道路、地图、角色或缓存预算。由唯一负责人累计集成；无需新 hook。

## 原因与修正

从外东路南端往返协和，宁寿区距玩家边界约 419–422m，却被 `init` / `onEnterZone` 的无距离 neighbors 循环加载；进入中轴又卸载，返回重建。真实 main 配置 `reuseInactive:true` 下，cache admission 为 `cacheable:false / unknown-texture-size / Infinity`；此 CPU library 的未知纹理类型不是浏览器纹理结论。独立可证：其原几何缓冲 54,327,360B 已超过闲置缓存 33,554,432B，不能靠猜测增大缓存解决。

- `init` 仍同步加载当前区；只把距离出生点 ≤40m 的已声明邻区放进首队列。
- `onEnterZone` 保当前区优先与缓存先接回，近区交紧随其后的原 `update` 全区 ≤40m 判定。生产调用者只有 `update`。
- 显式 `ensureLoadedAt` 的同步当前＋全部邻区、`loadAll`、原60m卸载/已加载邻区保留、8ms队列循环、shadow/lifecycle callback、silhouette 机制均未改。

**不声称启动或总内存改善**：启动仍构造全部 7 个 prebuilt；未激活的远区可能保留更久。32MiB 是闲置缓存预算，不是总内存。远区原 silhouette 保留可见，主体不入场景/碰撞，进入40m空间范围时仍按原逻辑预载。

## 实测分账

1. 新6项先 **4红/2绿**；只改两处后，新6＋既有 cache/reuse/quality 13＝**19/19 绿**。覆盖400m远邻、40m边界/非邻区、当前跨界/缓存接回、重复owner、真实碰撞注册、silhouette/lifecycle、显式传送和全常驻。
2. **两次各自冷起的正常 World**，`loadAll:false`、`reuseInactive:true`，路线 `(-145,-300.3) → (-80,-300.3) → 原点`，30Hz走/跑。保持 `controls.update()` 后 `zoneManager.update(camera.position)`，manager 使用真实时钟；仅 `controls.prevTime` 控制约1/30秒运动步长。
3. 父/候选均 **2/2 到达，784＋335＝1119 帧**，最大脚差分别 0.131046039 / 0.131046198m、最高2.62m、返回地面0。真实调度微差使坐标不要求逐字同。候选 axis 首帧实际入场并注册坡/台，入东坡前可用；currentId 实现 OE→axis→OE，非只拿静态已加载通路。
4. 父每场初始7次 build 后又重建宁寿1次；候选仍仅7次初始build，远区从未激活/重造。返OE `update` 两次 CPU 采样约 **2403/2527ms → 0.193/0.124ms**；首帧必要axis注册仍 **43/53ms**。这是该CPU fixture采样，不是实机FPS、GPU帧时、温度或全局无卡顿承诺。
5. 初轮误用 harness 默认 `reuseInactive:false` 的 2条数据另存，只作原始诊断；最终对比仅使用正确 main 缓存配置的父数据。
6. 实测后按集成人要求仅改一条类注释说明策略，执行源码旧/新 SHA 与“一处注释替换”关系见 PINS；未再次跑 World。没有全仓回归或应用构建；最终累计构建由集成人完成。

## 复验命令（仓库根目录）

```sh
node --test tests/r158-nearby-streaming/component.test.mjs tests/r107-inactive-cache.test.mjs tests/r107-zone-reuse.test.mjs tests/r106-zone-quality.test.mjs
BASELINE_REPORT=/tmp/r158-xiehe-streaming-main-0338/world.json.gz \
EVIDENCE_DIR=/tmp/r158-nearby-integrated-world \
node --expose-gc --test tests/r158-nearby-streaming/world.test.mjs
```

World 无注入、不替换ZoneManager策略；只旁观记录 `ZoneBase.build` / `InactiveZoneCache.take` 次数并原样调用，结束恢复。所有原始日志/轨迹只在本地 `/tmp`，不纳仓库：
- 缓存关闭前态：`/tmp/r158-xiehe-streaming-0336/`
- 正确 main 父态：`/tmp/r158-xiehe-streaming-main-0338/`
- 实际 cost / 邻队列根因：`/tmp/r158-streaming-rootcause-0341/`
- RED、19绿、最终World及摘要：`/tmp/r158-nearby-streaming-evidence-0344/`

各文件及父依赖精确 SHA 见 `PINS.json`。待独立 Astra 复审；无自行上传/发布。
