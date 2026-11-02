# 南三所中所首进西配殿 — 独立文字拟合候选

基线 `17a0467a8990eed3a71dfa62a24ea44633acee58`（远端 `46b14621c6714a206b461d68b5e8410483e5b329` 精确回读）。仅新增专属 `NansansuoMiddleWestSideHall.js`，不改已有东配殿、井亭、九殿、三院门或物理。共享 hook 未装。

独立附属实例 `EXPAND-04-MIDDLE-FIRST-WEST-01`，父 `FC-C640AE8651`；**不新增原41项objectId，不把本一体宣称整个EXPAND-04完成**。名称为“南三所中所西配殿”，拟合状态单独放metadata；无新增mapItem/Teleport目标。

## 来源及未知
- [故宫南三所总页](https://www.dpm.org.cn/explore/building/236452.html)：各殿前东西配殿各三间，支持首进两侧及间数。
- [故宫院刊2020年第10期，总222期，p142](https://www.dpm.org.cn/Uploads/File/2020/11/12/u5facb56c07c8f.pdf)：南三所前、后配殿沿用不出掖头的硬山形式。作者已亲看本地 `r158-nansansuo-next-readonly-1718/page142.png`；该页历史图25不能当现代尺寸图。原PDF/文字/页图保本地、只pin。
- [官鸟瞰](https://img.dpm.org.cn/Uploads/Picture/dc/4647[1024].jpg)仅院落低屋背景，含旧临时花房，未据此认定本西配殿正面或现代状态。
- 文字支持三间与硬山大形；**准确位置、8.4×3.6m尺寸、檐脊、绿红灰配色、向院内(-X)朝向、闭合门窗式素板均为工程拟合**。无本项立面官照证明，不能把同类素壳与东配殿共用简单形态说成实物立面完全相同。
- 无室内陈设、细纹样或现代开放声明；本次是**闭合可外绕素壳，不可进入**。不建黑瓦后罩房、不重绑旧北壳身份。

## 独立空间与真实接触
并非无检查复制坐标：源静算后单独检查中心(-270.6,36)、预留 X[-273,-268.2] Z[31.2,40.8] Y(.05,5.8)。现中所、西所前殿屋盖与候选屋盖分留约3.7m/7.7m；已审东配殿和井亭保持原位。正常17a先验：既有collider相交0，861身体/水格无阻，6条保护线静态净空；旧5条实际路线和东外绕2条均通，九殿9/井41/东32真实注册。

本体 **32可见mesh、32独立Float32真实三角owner、672面**。每个可见闭体有真实接触，未加整屋空气盒；闭体非退化、正体积、每边两面实检。无新walkable/room/map，地坪齐地。石UV使用真实库6m密度和返回geometry；私有3材正常finish/dispose恰一次，借用石材不释放。运行前要求保留真实前殿、井亭及东配殿位置/身份和东32owner数量；这些是本工程源守卫，非历史身份或每帧全几何认证。

## 验证终态（仅有界，不是全应用）
- 8项missing-builder真红保存；专属西配殿实现后 **8/8组件绿**。既有几何、材质流及原数组前缀不变，坏前殿host/占用/重复在发布前拒绝；正常资源生命周期已验，不泛称任何late-publish异常原子回滚。
- 作者在正常 `CourtKit.finish` 前QA注入一次，`loadAll:false`、真实库、`reuseInactive:true`；加载outer-east＋全局。**尚未接共享生产hook**。
- **旧5路1895帧＋既有东外绕2路283帧完整数组=正常17a先验**。硬锁九殿记录9、井41和东32的完整owner顶点/包络SHA均相同。
- 新西外绕10Hz走/60Hz跑 **2路285帧全到、最大脚差0**；30Hz闭前墙/端墙2负控正确拒绝。所有正向路线合9路2463帧。没有改路线目标、削墙或控制器救场。
- 两自制CPU已亲看：单体三间素面与局部前院两侧配对可辨。上下文仅含旧前殿/中殿/井亭/东配殿和新西配殿，非整院全景。CPU平色几何诊断不等于生产纹理、GPU或移动端验收。
- 未扩全宫/飞行/动态加载测试，不宣称室内体验或现状测绘。全build与正常hook由唯一集成人完成。

## 最小接线与复验
`ZoneBase.js` 增加：
```js
import {buildNansansuoMiddleWestSideHall} from '../palace/special/NansansuoMiddleWestSideHall.js';
```
在 `buildNansansuoMiddleEastSideHall(this.kit,this.zoneJson);` 后、finish前恰一次：
```js
buildNansansuoMiddleWestSideHall(this.kit,this.zoneJson);
```
```sh
node --test tests/r158-middle-west-wing/component.test.mjs
NORMAL_INSTALLED=1 WING_EVIDENCE=/tmp/r158-middle-west-wing-integrated WING_BASELINE=/tmp/r158-middle-west-wing-scan-0516/scan.json node --test tests/r158-middle-west-wing/world.test.mjs
```
正常模式禁QA注入，并已有九殿9、井/东ownerSHA和旧7路完整数组硬断言；累计再比作者 `oldRoutes/oldEastRoutes/routes/negative` 全数组。作者原件 `/tmp/r158-middle-west-wing-evidence-0517/`（component-first终态、world.exit=0、world.json.gz）；先验 `/tmp/r158-middle-west-wing-scan-0516/`。PINS绑定源/QA/依赖/本地原件，官方大文件及raw不入仓。
