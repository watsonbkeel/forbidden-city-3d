# 内阁第二库：双库文字格局的有限候选

基线 remote `0c22` = local `0e02ef9103400b5a03c0ca795ac150f83698044c` / tree `8f7675593c031cee81cb34e739c99ee490f9e44d`。仅新增 `NeigeSecondStorehouse.js`；原大堂、第一库、南门、东西耳片/两厢、河道和共享物理均不改。**作者尚未安装正常生产 hook。**

## 依据与未知

- [故宫大库正文](https://www.dpm.org.cn/explore/building/236579.html)：大堂东侧库群，砖石、铁栅与铁皮窗门，主体保存；不能从群体介绍把既有照片指定到某一库。
- [《紫禁城》163期第18页](https://www.dpm.org.cn/Uploads/pdf/6179/T00018_00.pdf)：2008年的两库仍存叙述及北侧石框铁栅/铁板窗。不是2026年现状测绘、修缮完工或开放承诺。
- [同刊第25页](https://www.dpm.org.cn/Uploads/pdf/6179/T00025_00.pdf)：历史二十间四门、北向、东西各十间；东库曾两组五间，1931检查时内部隔墙已变。故十间/每体两门是**历史文字依据**，不是当代窗洞普查。没有照搬第26页不明库别照片的五窗序。
- [2011院刊第106页民国内阁图](https://www.dpm.org.cn/Uploads/File/pdf/dc/90/c9/dc90c935d785bbdf396ad66173ebf391.pdf)：两座长体东西并列、大堂东侧/河西侧的相对关系；只用拓扑，不当现代坐标。坐标系 +X 为西，故第二体 x=-273 在第一体 x=-221 东侧。

名称“内阁大库第二体（文字拟合、库别待核）”；仅 `parentObjectId:FC-40EB11CF20`，无新增正式 objectId，第一库原正式条目保留。`identityUnresolved:true` / `wholeObjectAccepted:false`；**不判哪座是红本库或实录库，不造已不存满本堂**。

中心(-273,-365)，42×12m，名义檐5.4/脊8.7m；位置、尺寸、素坡屋顶形色、八窗两门具体分布均工程拟合，不称官照复原。北面石框/铁栅、素铁窗扇；一门可见合拢，一门可见折开，后者净2.7×3.1m、真实石地顶0。开叶是交互拟合，不表示现实公众可入。无楼层、台阶、内部分间或陈设；历史“重之以楼”不外推当前内部。当前精确屋顶、洞口数量/位置、修后状态、库别及室内仍未知。

215 mesh / 9420 tri / 111 真三角 owner / 0 新 walkable。全部最终可见 Float32 三角与 owner 完整流逐项相同；接触墙/框/门各闭体分 owner，避免整房隐形盒或接面奇偶假阻。砖/石使用 `applyBoxUV` 的返回几何，无重复原几何 dispose。实际bounds x[-294.200001,-251.799999],z[-371.650000,-357.910000],y[-.06,8.845000]。

## 验证与保留边界

- 建前真实 outer-east World：预留盒 x[-294.5,-251.5],z[-373,-357],y[.05,10] 原 collider 相交0；2871个半米网格经真实身体/河道检查全通，原x=-246库侧路及新外绕点无阻。此为占用先验，不替代建后路线。
- missing-builder **6真红**，实现后 **10/10**（4.894秒，exit0），首绿后未改源，无跳过。含完整几何/UV/身份/旧数组引用、开门/闭门/墙/高窗/屋顶负例、正常finish/dispose和前置坏输入/重复拒绝；不声称任意晚发布异常完整回滚。
- 新10/60Hz、行/跑/倒行8条原生旅程：从旧x=-246路到开门、入内、转身、退出及外绕，**8498帧，脚地峰差0**；闭门另4次真实拒绝。
- **实际 World 32.61秒exit0**：`loadAll:false`，outer-east+全局构件，固定0e02运行源，在`CourtKit.finish`前QA装一次。新8完整rows与本地全部8498帧逐字deepEqual；原东耳8+两厢16+西耳/南门/第一库/主堂32＝**56条43406帧**与2003/2109正常累计基线逐字deepEqual。旧长路8诊断仍4绿/4旧文华中心线红，全部行相同；不是全城通行或共享hook已装。
- 低盘：`world-final.json.gz`仅保存新8完整行SHA/帧数/本地全帧文件SHA及旧7组JSON SHA；完整数组先在测试中deepEqual。独有新帧仍在`local-first.json.gz`，原56条完整基线原件仍在2003/2109，没有删证据或放宽断言。
- 局部六旧实体+第二库飞行包络10/60Hz：默认home飞来，屋顶下降挡、空中退出拒、南侧地面落地/交接脚0；另明确注入12m坠落落于真实屋顶。**非全World飞行/浏览器验收。**
- 两张自制CPU正面/斜面已亲看；平色几何诊断，不是GPU/PBR、手机或实景照片。本作者未跑全应用构建/全仓回归。

## 唯一集成人接线及小命令

在 `src/scene/zones/ZoneBase.js` 引入：
```js
import {buildNeigeSecondStorehouse} from '../palace/special/NeigeSecondStorehouse.js';
```
在既有 `buildNeigeEastTextAnnex(this.kit,this.zoneJson)` 之后、`kit.finish`之前恰一次：
```js
buildNeigeSecondStorehouse(this.kit,this.zoneJson);
```
正常接线后删除作者 `world.test.mjs` **整个prototype注入及finally恢复**，保新8/原56/旧8和全行相等断言不变，不双装。不回退其它已审实体/接触模块。正常入口和全应用构建由唯一集成人关闭。

```sh
# 作者小树借固定0e02；完整集成树省略QA_BASE_ROOT。
QA_BASE_ROOT=/workspace/scratch/02a8023d1a85/r158-wenhua-route-1821 node --test --test-concurrency=1 tests/r158-neige-second-store/{component,routes,flight}.test.mjs
QA_BASE_ROOT=/workspace/scratch/02a8023d1a85/r158-wenhua-route-1821 BASELINE_REPORT=/workspace/scratch/02a8023d1a85/r158-cumulative-evidence-2003/neige-world.json EAR_BASELINE=/workspace/scratch/02a8023d1a85/r158-cumulative-evidence-2109/neige-world.json.gz LOCAL_REPORT=/workspace/scratch/02a8023d1a85/r158-neige-second-store-evidence-2122/local-first.json.gz EVIDENCE_OUT=/tmp/neige-second-store-world.json.gz node --test tests/r158-neige-second-store/world.test.mjs
```

官源/全部原始记录仅本地 `r158-neige-audit-1621` / `r158-neige-second-store-evidence-2122`；PINS为原件身份，不声称远端保存raw。仓库仅新模块、9个QA、本文/pins和2张自制PNG。采用已有Git对象的小型cone sparse工作树/已有依赖，不clone；产品新增文件预算≤500KB，磁盘500MiB为停止线。正常hook、累计构建与Astra结论另由集成人记录。
