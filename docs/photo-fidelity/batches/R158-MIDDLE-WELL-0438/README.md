# 南三所中所井亭 — EXPAND-04 单一附属候选

基线 `e0340ee56bf36e1dbe5f17df74babdaa8830b2dc`。只新增专属模块；尚未安装共享 hook，不改 9 殿、3 门、北壳或现有身份。独立实例 `EXPAND-04-MIDDLE-WELL-01`，父 `FC-C640AE8651`；无新增原 41 项 objectId，不把附属一亭写成整组完成，也不改原始清单快照。

## 自身证据与拟合界限
- [故宫南三所页](https://www.dpm.org.cn/explore/building/236452.html) 的自身图片题为“南三所中所井亭”；官文说明井亭在中殿前。
- [官图 7997](https://img.dpm.org.cn/Uploads/Picture/dc/7997.jpg)，本地 `/workspace/scratch/02a8023d1a85/r158-nansansuo-readonly-1618/well.jpg`，SHA256 `e17c77f480f457711fa46471e481ea6a91b75eb5f8481d4342089a3b4cf47495`。作者亲看，可证四红柱、绿色曲坡大盖、低红围护、浅色井石。原件不入仓。
- 中心 `(-300,46.5)`、4m 盖、2.5m 柱距、高 4m、南侧观井缺口、简化栏杆、井石圆环、浅可见安全底皆工程拟合，不是测绘。图不能确认顶心：使用闭合简盖，**无顶孔**，不借大庖井形制填空；不定屋顶专名、纹样、瓦件数、脊兽、真实井深或现实开放。当前照片拍摄年代亦未核。
- 不复制其他两所井亭、不加室内陈设/导航目标。图中未证精细装饰未做。两自制 CPU 图为实际几何/平色诊断，非生产贴图/GPU/移动端验收；上下文图仅含既有中殿和本亭，并非全院景观。

## 实体与空间
41 可见 mesh、41 独立真实 Float32 三角 owner、1460 面；无通空整块代理、无新 walkable/支承/room/mapItem。石材采用真实库 `stone_slab` 的 6m UV 密度及返回 geometry；私有三材随 kit 正常释放，不释放借用石材。闭盖、柱、低栏、井石各自实体碰撞。浅底防坠为游戏适配，不代表井底；正常半径 .5 人物不能穿井石。

实际外包 X[-302,-298]、Z[44.5,48.5]、Y[-.04,4]；原预留 X[-302.2,-297.8]、Z[44.2,48.8]、Y(.05,5.4)。只读正常 World 扫描：已有 collider 相交 0、380 身体/水格点无阻，4 条保护线静态均净空。位置仅拟合；本体未移动河道或旧建筑。

## 有界验证（非全 World/全应用构建）
- 6 项 missing-builder 真红；补闭盖外法线检查后 1 真红→修正绕序；补实际 stone UV 后 1 真红→仅 UV 表达式修订。终态 **8/8 组件绿**。完整原件不覆盖。
- `loadAll:false`、实际库、`reuseInactive:true`，只加载 outer-east＋全局；作者在真实 CourtKit.finish 前注入一次专属 builder，非已装生产 hook。
- 最终实际控制器 **8/8、2255 帧、最大脚差 0**：10 Hz 走/60 Hz 跑，各跑原中殿两侧环路、z59 横路、邻东殿 x=-305 通路、新井前往返；原中殿闭门等未改。
- 两个 30 Hz 负控：正对井石和侧低栏均停止，不能进入井口；组件另证柱/屋盖实体及观井净空。
- 首轮 7/8：10 Hz 每步 .5m，新终点 z=45.4 太近井石，在 z=45.260 停住。保该原红；经批准仅将新观井终点提前至 45.1，**不删石、不改控制器或旧路线**。原 6 路 2194 帧及两负控完整数组在续验中逐字不变。
- UV 修订前后源码只差 tileSize 表达式，所有位置/索引/owner 构造不变。测试实际最终顶点到 owner 逐三角相等；无假几何代理。正常 finish/dispose、坏宿主/占用/重复安装前拒已验；不泛称任意发布中途异常原子回滚。
- 未测 GPU、动态跨区加载、飞行或全宫路线；未运行全应用 build，交唯一集成人。

## 最小接线（只交建议）
`src/scene/zones/ZoneBase.js` 添加 import：
```js
import {buildNansansuoMiddleWell} from '../palace/special/NansansuoMiddleWell.js';
```
在 `buildNansansuoWestMiddleHall(this.kit,this.zoneJson);` 后、kit.finish 前恰一次：
```js
buildNansansuoMiddleWell(this.kit,this.zoneJson);
```
不编辑其他作者模块；本模块依赖保留的中所中殿实际 frame 身份/位置，预留占用检查在生成/发布前拒绝。

## 复验与原件
```sh
node --test tests/r158-middle-well/component.test.mjs
# 作者未接线版本（一次 before-finish 注入）
node --test tests/r158-middle-well/world.test.mjs
# 累计接线后：不注入，检真实架构记录恰一份；输出独立目录避免覆盖作者证据
NORMAL_INSTALLED=1 WELL_EVIDENCE=/tmp/r158-middle-well-integrated node --test tests/r158-middle-well/world.test.mjs
```
作者原件 `/tmp/r158-middle-well-evidence-0438/`（终态 `component-final.tap`、`world.tap`/`world.exit=0`、`world.json.gz`、`retention.json`）；占用 `/tmp/r158-middle-well-scan-0434/`。续验输出应逐项比对作者最终 `routes`/`negative` 完整数组，不以摘要替代。PINS.json 绑定源、QA、自制图、官方原件、依赖及本地原始证据；绝对路径原件不随项目上传。
