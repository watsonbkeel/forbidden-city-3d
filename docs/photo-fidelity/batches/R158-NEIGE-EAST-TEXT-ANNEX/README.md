# 内阁东四间灰瓦耳房：文字依据候选

基线 remote `0d996ea0100f346539baba86fbe03475ec24d8f0` = local `97420d8d9742bccea11d1a77869e9b9aab67cf96` / tree `154f5190b82c5cfa29266d9ff35b7a4feadd7882`。仅新增 `NeigeEastTextAnnex.js`，不改共享 hooks、旧建筑、河道或通用物理。本候选**未安装生产 hook**。

## 有据内容与拟合

[故宫内阁大堂正文](https://www.dpm.org.cn/explore/building/236523.html)支持主堂东侧耳房四间、灰瓦硬山及历史满票签房名称；**没有取得该东耳房自身可辨现状官照，不能证明单体当前存续、立面或历史机构一一对应**。原8036图不能把树遮东侧认作已见；没有镜像西耳照片。`historicalIdentityCandidate:FC-12AA4B4366`，不绑定正式 objectId，`wholeObjectAccepted:false`。不造官网明确不存的满本堂。

本次只做四间可辨简化壳：灰硬山（屋顶端与山墙齐）、五条深色前柱分四间，三个素红闭合面板，一个可见开门，素砖山墙/后墙、真实齐地石地。无细雕、未知窗格、室内陈设或分间。**南向、门位、开叶及门洞均为交互拟合，不是文字证实或现实开放。**位置/尺寸同为工程拟合：中心(-182.4,-363)，主体14.8×6.4m，檐4.35m，名义脊5.95m，门净宽2.8m/净高3.12m。实际可见bounds x[-189.8000001,-174.9999999],z[-366.79999995,-359.20000005],y[-.06,6.09499979]；不称测绘。

保原东厢z=-368横路、x=-174/-182往返、堂库/南门/西耳/黄瓦两厢不动。72mesh、6168tri、18真三角owner、0新增walkable/room，实体来自全部最终Float32可见三角，无整房隐形盒或虚假支承。砖/石采用`applyBoxUV`返回值，借用材质不由本模块释放。

## 实际检查与保留红态

- 建前真实World（只载outer-east）候选盒原碰撞相交0；480个身体/水网格、74个原侧路点和z=-368横路无阻挡。这不是建后通行证明。
- 首轮missing-builder **7真红**。实现后11项 **9绿2红**：静态门洞及原生返回路线遭空洞假阻。精确诊断只有门bay owner命中：surface=false；贴接门框/邻板两重同点射线交点被窄相位去重，奇偶误判为实心。只把该七个真实闭体由一个owner拆开，未改共享物理或任何可见几何/UV/矩阵/材质；完整流SHA均为`d84006e73094acccb25026d580f9cdc0a3de67836518198fd43835fdfd6400d0`，owner12→18。旧红和修前源保留。
- 修后 **11/11**，exit0，无跳过。新8种10/60Hz行/跑/倒行实际进门、室内转身、退出及外绕：**3108帧，脚地峰差0**；另4次闭面阻挡。资源仅证明正常finish/dispose与坏输入/重复前拒，不声称任意晚发布异常完整回滚。
- 单院局部原生飞行两帧率：从默认home飞来屋顶下降受阻、空中退出拒绝、远处地面交接脚0；另明确注入12m坠落在真实屋顶6.09499979落地。不是全World/浏览器飞行验收。
- **实际World 28.77秒exit0**：`loadAll:false`，outer-east+全局构件，借用固定`a8901f6b7b3c1b18c43a2a184ad5cf1c5847dc05`正常运行源（0d996后仅已审文华门接触3源变化）并在`CourtKit.finish`前QA安装新耳房一次。新8/3108同样到达、无身体碰撞、脚差0。原两厢16+原四实体32＝**48/40298帧**完整rows在测试中与本地2003累计基线逐字deepEqual；8旧诊断仍4绿/4旧文华中心线红，全部行相同。不是正常生产接线或全城验收。
- 为低盘不重复存旧6MB帧：`world-final.json.gz`保新8完整帧、旧六组完整JSON的SHA/行数/帧数及基线SHA；原2003完整记录仍本地在，不是删帧或放宽断言。
- 4张自制CPU：front/oblique/context/doorway亲看；文字拟合四间/门洞可见。平色几何诊断，非GPU/PBR、实景复原或手机验收。未跑全应用构建/全仓回归。

## 接线及小命令

唯一集成人在`src/scene/zones/ZoneBase.js`引入：
```js
import {buildNeigeEastTextAnnex} from '../palace/special/NeigeEastTextAnnex.js';
```
在现`buildNeigeTextSideWings(this.kit,this.zoneJson)`之后、`kit.finish`之前恰一次调用：
```js
buildNeigeEastTextAnnex(this.kit,this.zoneJson);
```
正常接线验收时**删除world.test.mjs整个prototype注入和finally恢复**，其余新8/原48/旧8断言不变。不要双装，不回退文华门已审修正。全应用构建由集成人关闭。

```sh
# 极小作者树借固定源；完整累计树省略QA_BASE_ROOT即可。
QA_BASE_ROOT=/workspace/scratch/02a8023d1a85/r158-wenhua-route-1821 node --test --test-concurrency=1 tests/r158-neige-east-ear/{component,routes,flight}.test.mjs
QA_BASE_ROOT=/workspace/scratch/02a8023d1a85/r158-wenhua-route-1821 BASELINE_REPORT=/workspace/scratch/02a8023d1a85/r158-cumulative-evidence-2003/neige-world.json EVIDENCE_OUT=/tmp/neige-east-ear-world.json.gz node --test tests/r158-neige-east-ear/world.test.mjs
```

证据与官源副本仅本地`r158-neige-east-ear-evidence-2044` / `r158-neige-audit-1621/hall-page.html`，PINS记录SHA不是远端原件可用承诺；仓库仅源码/测试/短摘要/pins/自制PNG。小树采用cone+sparse-index，首次384KB/index3.9KB；因全上下文68510tri，恢复窗口实际新证据约1.14MiB，超过原1MiB约142KiB，已如实报告并暂停；父追加≤300KiB仅封装，未删任何唯一证据。结束磁盘仍须>500MiB。
