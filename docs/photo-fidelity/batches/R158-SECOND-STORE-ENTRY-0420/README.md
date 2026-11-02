# R158 第二库传送：使用已有偏轴开门

基线 `881c214bac9b8b567733d03fcf9962b37b37217b`。仅 `NeigeSecondStorehouse.js` 与 `Teleport.js`；无需新hook。不改变第一库闭门、两库名称/库别待核、map中心尺寸、任何门窗实体/物理。

## 原因与最小修复
原实际 `go('内阁大库第二体')` 返回 `(-273,-351)`，朝 `(-273,-365)`，fallback=false。30Hz走240帧停 `(-273,-358.41357)`，实际窄相位命中原 `bay-4-base/bay-5-base` 两块2.3m高窗下砌体。由同一落点经北侧 `z=-355` 横路到 `x=-262.5`，309帧入库返回全部到达，脚差0；原红与阳性均保留。

本体已有 `i=7` 可见开门，局部横坐标 `-18.9+7×4.2=10.5`。将既有几何常量在本模块共享给profile，无数值改动。map仅加专属structure/entryProfile；新落点 `(-262.5,-351.12)` 看向门 `(-262.5,-359.12)`，显式检查再到门内1m，复用原采样/碰撞/地面/LOS，未添加放行豁免。

驻留检查的准确范围：OE已加载、唯一精确map/profile/frame、全部111原owner的ID/数量、原i7门楣bbox与12三角数量；**不是每次全量认证每个owner的几何，也不是历史库别认证**。未知/错profile、错尺寸/rotation/父ID、缺zone/map/门楣或另一闭门owner、异tag均拒绝，不凭地0虚认本体。

## 验证
- 新专项父态15断言红/4绿 → **19/19**；加原东耳16与地图名3，**38/38，exit0**。
- 215mesh完整属性/索引/矩阵/材质特征和111owner/9420三角流哈希逐字同父；0新增walkable/room。第一库源码与通用导航目标不变。
- 正常ZoneBase，无prototype注入：`loadAll:false`、main的`reuseInactive:true`；实际go的 `heading=[0,0,-1]`，`approachVerified=true/fallback=false`。30Hz同controls按该朝向直入并原路返，**182帧到达，脚差0**。
- 原中心线120帧仍被上述两砌体拒绝；另一闭门由明确北横路近点起走90帧拒绝，实际窄相位确中 `bay-2-closed-leaf--1/1`，不是邻楼替代证据。
- 实际加载axis-courts、outer-east、ningshou；manager真实时钟，只给controls.prevTime设30Hz delta。无GPU/移动端/全宫或作者全应用构建声明。

### QA错误单独披露
首轮修后World阳性已182帧到达、全部x=-262.5，但复制的帧断言误留 `f.x+184.25`，故测试exit1，负控尚未执行。这不是产品回归，不算通过。保留原脚本/原日志/原raw；授权后只将该常量改成 `262.5`，重新完整有限World终态exit0。两次产品684文件SHA完全相同，最终前后源锁也相同。没有更改目标或放宽断言。

## 正常累计命令
```sh
node --test tests/r158-second-store-entry/component.test.mjs tests/r158-east-ear-entry/component.test.mjs tests/r158-place-display/names.test.mjs
EVIDENCE_DIR=/tmp/r158-second-store-entry-integrated node --expose-gc --test tests/r158-second-store-entry/world.test.mjs
```
无额外接线/注入修改。集成人可直接应用2源，并关闭累计构建；作者不上传。

本地原件：父真红 `/tmp/r158-second-store-teleport-0418/`；专项/QA错误红/最终World `/tmp/r158-second-store-entry-evidence-0420/`。`PINS.json`逐bytes/SHA绑定，原日志和逐帧JSON不进仓。几何无变更，本轮不重复CPU外观或官图研究。既有“第二体文字拟合、具体库别/现况/门窗排列未核、游戏开放非实地开放”边界全部保留。
