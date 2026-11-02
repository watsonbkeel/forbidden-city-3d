# R158 内阁东耳房：传送对准已有门轴

基线 `a3802106f9da49c880930ad8fa4726e90ad16992`。仅修改本体地图元数据与 Teleport 专属入口分支；无需新增 ZoneBase hook。不是建筑新造/现状复原/现实开放认证。

## 用户路径与修复
原真实 `Teleport.go('内阁东耳房')` 返回 `(-182.4,-374.2)`，看向本体中心，30Hz走240帧在 `(-182.4,-366.95335)` 停住；原断言红保留。随后同 controls 经原已证门轴 `x=-184.25`，174帧往返到达，脚差0。真实组件窄相位证明：从停点前进一个名义走步 `3.2/30m` 会碰原中央可见柱 owner 与右门框 owner，不是应删的隐墙。

本体 map 只增加 `structure/entryProfile`；原 x/z/w/d/name/身份信息均不动。入口从 FIT/doorX 绑定至 `(-184.25,-366.26)`，8m外落点 `(-184.25,-374.26)`，显式路径继续检查门内1m。复用原采样、碰撞、地面和 LOS，不新增放行特例、不改通用深宽或物理。

驻留守卫具体范围：OE loaded、唯一精确 map/profile/frame、18 原 triangle owner 的 ID/数量、原柱 owner bbox/60三角数量。**不等于每次重新认证所有 owner 的完整几何，更不是历史身份认证。** 缺 zone/map/柱 owner、错 profile/尺寸/父 ID/owner tag 均不能凭地0认证入口。

## 实证与边界
- 专项16：父态13红/3绿 → 最终16/16；加原地图名3项，**19/19**，exit0。
- 原72 mesh的属性/索引/世界矩阵/材质特征、18 owner/6168三角完整流与父态哈希一致；0新增walkable/room。原门框7独立闭体保留。
- 唯一修后正常 World：`loadAll:false`、`reuseInactive:true`、正常 ZoneBase（无prototype注入），实际 `go` 返回新落点，`lookAt=(-184.25,-366.26)`，`heading=[0,0,1]`，`approachVerified=true/fallback=false`。同 controls 30Hz沿该朝向直入门并原路返回，**152帧到达、脚差0**。
- 原中心线120帧仍被柱/门框挡住。第三条偏轴长线60帧在 `z=-374.13` 已受阻，尚未到耳房立面；**该 World 原日志中的 `closed-front-panel-still-solid` 名称过宽，不能当作闭板处拒绝证据**。最终QA仅改该标签和标题，不改路线/断言/执行逻辑；原执行脚本另存并按精确两字符串替换绑定。闭板本身的真实组件 body 负控以及新门洞附加闭墙拒绝均在19项中实证。
- World实际加载区：axis-courts、outer-east、ningshou，不只OE。manager真实时钟；仅 controls.prevTime设30Hz步长。未测试GPU/移动端/全宫/全应用构建；由单一集成人收尾。
- 保留原文字候选身份/现存待核、朝向门位尺度工程拟合；没有新的官方外观主张。

## 命令与交接
```sh
node --test tests/r158-east-ear-entry/component.test.mjs tests/r158-place-display/names.test.mjs
EVIDENCE_DIR=/tmp/r158-east-ear-entry-integrated node --expose-gc --test tests/r158-east-ear-entry/world.test.mjs
```
这是正常入口测试，无需去除注入或额外 hook；集成人直接应用本2源即可。测试源可在累计 commit 使用，无硬锁父SHA。

原始资料仅本地：
- 父真红/阳性/owner复核：`/tmp/r158-east-ear-teleport-0404/`；raw SHA `f2fed24afb7b3a81f1867e688a3eec6538b901717f515023a253b897d382f9c2`。
- TDD/终态：`/tmp/r158-east-ear-entry-evidence-0407/`；World raw SHA `f3eefabda4177a711f72c01c2052201ef5de57254bd091f92247e1edf6acdd3d`。
- 修前684运行文件聚合SHA `5ec3b483704344698d30e8b4dc4feddf5c35fcc92bc4fec3fa9a6e3d3b1eff9a`；修后 `59e7ae222c91ca8a0862db9a55797b8fb031df7d67026f4071379d3bac4fe5a0`，各自World前后相同。
- `PINS.json` 绑定源、原依赖、原件，不包含原件副本；本轮不需新官图/CPU图，外观流未改变。
