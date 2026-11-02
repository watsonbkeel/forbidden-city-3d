# R158 内阁西侧灰瓦耳房可见段（身份候选）

Base: remote92c8 / local `6f7188c1270b2eeedeb8506f9be7a3ccb0f2fc64`, tree `1af17ed106646759e1b64902a71bf620d7c3f64c`.

## 图证与边界
- [故宫内阁大堂](https://www.dpm.org.cn/explore/building/236523.html) 的[自身官图8036](https://img.dpm.org.cn/Uploads/Picture/dc/8036.jpg)：主堂左侧可见低灰瓦双坡屋面及红色格扇片段；页面明确大堂坐北朝南，故左侧为西侧是方向推断。文字记西耳房四间、灰瓦硬山顶、历史稽查房用途；**裁图不能证明完整四间外观、现用途或2026状态**。
- 只补短灰瓦屋面、红色闭合格扇、低石基；两块重复面板是工程拟合，非实测开间/门扇数。未拍背面及两端用素砖闭合，不猜陈设、雕刻或镜像东耳房。
- 名称为“内阁西侧灰瓦耳房可见段（身份候选）”；`historicalIdentityCandidate=FC-93081154E4` 不等于正式 `objectId`，`wholeObjectAccepted=false`；不把整稽查房或内阁11项勾为完成。保留现大堂 withheld 身份口径。
- 位置/尺寸/深度/格栅重复/简化背端均是可逆工程拟合，不称测绘。仅这5.1m宽可见片段；不推四间总长度，不新增具名办公室、可行走支承或室内。
- 相片日期、完成2023修缮后的状态、隐藏面和真实开放未知；无2026实勘、GPU/PBR/移动端验收。

## 空间与实体
拟合整体屋面盒 x[-147.4,-142.3], z[-369.1,-361.3]，最高约6.095m；主体 x[-147.1,-142.6]，z[-368.4,-362]。保留原 x=-140 接近线；与既有白墙外缘 x=-148.665 在人物高度净距约1.565m，侧巷 x=-147.9。屋檐上方间距约1.265m，不拿屋檐包围盒封堵下方空气。官图灰段视觉紧邻主堂；本候选为保既有白墙与通路而外置，两者的相对间距是明确工程差异，不称官图原位复刻。所有可见 Float32 三角直接生成原生实体 owner；闭前格扇/砖端实际挡人，中部空气无整块隐形盒。原大堂/大库/南小门、河道、既有共享碰撞不改。

## 终态检查
独立 scratch 正常92c8 World基线：该盒现有实体相交0；176个.5m网格人物全体积/水阻挡0；10/60fps行跑4条原侧巷路线通过。仅说明施工前占用，不冒充新实体通行。

候选测试采用 `loadAll:false`，只加载 outer-east；`CourtKit.finish` **QA before-finish** 安装专属模块，不是生产 hook 已接。新8走跑/后退往返已到达，2746帧脚差峰值0；原南门8/3456帧、大堂8/11318帧、大库8/14856帧共29630帧逐帧与92c8完全相同，旧诊断仍4绿4旧红且终点逐字相同。实际World单测试终态 exit0，23.39秒；不称全World全分区回归。

专项10/10 exit0：6个组件（身份/全三角stream/实体负控/真实UV返回链/拒错与旧引用/正常finish-dispose）+2个原生步行正负控+2个局部飞行/12m落脚。施工前 missing-builder6红保留。四实体局部飞行10/60fps：屋顶阻挡与空中退出拒绝、远处地面handoff脚0；不是全World飞行。原生落脚两帧率停于实际屋脊6.09499979m，无假支承。资源结论限正常dispose和输入前拒，不夸称任意late-publish异常回滚。

最终几何61 meshes合并前、3492三角、8原生实体owners、3自有材质、0新walkables/rooms。4张实际网格CPU图（front/oblique/context/slot）已亲看，平色诊断非GPU/PBR；原始导出/日志/官图留本地，仓库只自制PNG。作者不运行整仓构建，正常hook与累计build留唯一集成人。

原始证据目录 `/workspace/scratch/02a8023d1a85/r158-neige-west-annex-evidence-1906/`；`PINS.json` 绑定源、测试、依赖、原始记录及两份官方原件。`target-first.tap/.exit`、`world-first.tap/.exit/.json` 均是这份终态源（从首绿至冻结无源码变化）；不以未完成日志算通过。

命令（在该树运行；原始日志和逐帧JSON仅本地）:
```sh
node --test --test-concurrency=1 tests/r158-neige-west-annex/component.test.mjs tests/r158-neige-west-annex/routes.test.mjs tests/r158-neige-west-annex/flight.test.mjs
BASELINE_REPORT=/workspace/scratch/02a8023d1a85/r158-cumulative-evidence-1855/world.json EVIDENCE_OUT=/tmp/neige-annex-world.json node --test tests/r158-neige-west-annex/world.test.mjs
node tests/r158-neige-west-annex/export-cpu.mjs /tmp/neige-annex-cpu
python3 tests/r158-neige-west-annex/render-cpu.py /tmp/neige-annex-cpu/front.json.gz /tmp/neige-annex-cpu/front.png
```

## 唯一集成人接线建议（本候选不改共享文件）
`src/scene/zones/ZoneBase.js` 增加:
```js
import {buildNeigeWestAnnexSegment} from '../palace/special/NeigeWestAnnexSegment.js';
```
在 `buildNeigeSouthConnectingGate(this.kit,this.zoneJson);` 后、`kit.finish` 前恰一次:
```js
buildNeigeWestAnnexSegment(this.kit,this.zoneJson);
```
独审后再接。累计真实构造验证须去 QA prototype 注入，正常入口恰一次；保持旧堂库南门路径与当前累计构建。无共享接线/全应用构建的作者侧完成宣称。
