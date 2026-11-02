# 南三所中所首进东配殿 — 单体文字拟合候选

基线 `bf50da59b328518da1f31a300f6c08bb7254f1a6`（远端 fe037 已回读）。本候选只新增 `NansansuoMiddleEastSideHall.js`；共享 hook 未装。独立实例 `EXPAND-04-MIDDLE-FIRST-EAST-01`，父 `FC-C640AE8651`，**不新增原41项objectId、不宣称配殿整组或南三所完成**。既有九殿/三院门/中所井亭不重建、不改名、不挪位。

## 证据：文字可证与工程拟合分开
- [故宫南三所总页](https://www.dpm.org.cn/explore/building/236452.html)说明三所各三进，每殿前有东西配殿各三间。支持层次、方位与三间，不提供本单体尺寸或立面。
- [故宫院刊2020年第10期、总222期，第142页](https://www.dpm.org.cn/Uploads/File/2020/11/12/u5facb56c07c8f.pdf)说明南三所前、后配殿继承明代不出掖头的硬山形式。作者亲看已有 `r158-nansansuo-next-readonly-1718/page142.png`；该页图25为历史《乾隆京城图》，不作现代实测图。原PDF/提取文本/页图只本地pin，不复制进仓。
- [官方鸟瞰](https://img.dpm.org.cn/Uploads/Picture/dc/4647[1024].jpg)只作院落低屋背景，含旧临时花房、不是当前测绘，也不是本东配殿独立正面证据。
- 本体采用三间分节和无突出掖头的硬山大形。**中心(-300,36)、8.4m面阔、3.6m进深、绿/红/灰色、向院内(+X)的立面、闭合门窗式素板、檐脊高度均为工程拟合**；无本项正面官照确认。世界负X对应故宫东侧，故并未按一般地图坐标倒置命名。实际可见最高点约5.28m。
- 不做纹样、斗栱细部或室内陈设，不暗示现实开放；本次是**闭合素壳，不能进入**，外绕可走。无新地图目标/Teleport承诺。中所黑瓦后罩房有遗址/拟复原史证，未以历史记述盲补现代实体或强绑旧北壳。

## 空间与实体
预留 X[-302.4,-297.6]、Z[31.2,40.8]、Y(.05,5.8)。先验使用正常bf50 World、`loadAll:false`/真实库/`reuseInactive:true`，仅 outer-east＋全局：既有collider相交0、861身体/水格无阻；6条静态保护线均通。原前殿门轴、z28.5横路、中殿环路、邻侧通道和井前往返实际5路1895帧全到/脚差0。先验不是新体通过的替代。

新体 **32可见mesh / 32独立真实Float32三角owner / 672面**，没有整栋空气碰撞代理；无新增walkable、room或mapItem。各闭体正体积、配对边及非退化三角均实检；屋盖、墙、素板与接触来自同一实际最终顶点流。保原井亭41owners。石材使用真实库6m UV及返回geometry；私有3材正常finish/dispose恰一次，借用石材不释放。平台顶齐地，仅可见底厚在地面以下，不制造隐形抬升或台阶。

## 终态验证与边界
- 8条missing-builder真红已保存；专属实现后 **8/8组件绿**，没有遗漏失败或跳过条目。
- 作者通过真实 CourtKit.finish 前仅注入本builder一次，**不是已接生产hook**。正常ZoneManager只加载outer-east＋全局；旧碰撞完整前缀SHA保持。
- **原5路1895帧完整数组=先验**；新外绕10Hz走/60Hz跑2路283帧均到，最大脚差0；30Hz闭前墙/端墙2负控拒绝。九殿记录实数9，原井亭41owners仍在。未改原路线/控制器/物理。
- 两张终态自制CPU已亲看：单体正斜面可辨三间素壳，局部上下文含旧前殿/中殿/井亭。首个上下文机位遮井，仅更换机位重渲，原件保留；未改模型。**CPU平色几何图非贴图/GPU验收，不含全院所有实体。**
- 有限范围，不声称全宫/动态加载/飞行/室内开放或当前现实复原；全应用构建及正常hook留唯一集成人。坏宿主、占用、重复在发布前拒绝及正常资源生命周期已验，不泛称任意late-publish异常原子回滚。

## 最小接线建议及命令
`src/scene/zones/ZoneBase.js` import：
```js
import {buildNansansuoMiddleEastSideHall} from '../palace/special/NansansuoMiddleEastSideHall.js';
```
在 `buildNansansuoMiddleWell(this.kit,this.zoneJson);` 后、finish前恰一次：
```js
buildNansansuoMiddleEastSideHall(this.kit,this.zoneJson);
```
正常模式不做prototype注入：
```sh
node --test tests/r158-middle-east-wing/component.test.mjs
NORMAL_INSTALLED=1 WING_EVIDENCE=/tmp/r158-middle-east-wing-integrated WING_BASELINE=/tmp/r158-middle-east-wing-scan-0503/scan.json node --test tests/r158-middle-east-wing/world.test.mjs
```
作者未接线模式省略 `NORMAL_INSTALLED`；不要在已接线生产正常World再注入。累计应另比作者终态 `oldRoutes/routes/negative` 全数组及 `wellOwnerSHA`，并核 `retainedHallCount===9`。

原件：`/tmp/r158-middle-east-wing-scan-0503/`（scan.exit=0、scan.json）；`/tmp/r158-middle-east-wing-evidence-0504/`（component-red、component-first终态8绿、world.exit=0/world.json.gz、CPU原件）。PINS绑定源/QA/依赖/官方原件/原始记录；大原件与官图不入仓。元数据、尺寸和命名限制随模块，不靠报告遮掩。
