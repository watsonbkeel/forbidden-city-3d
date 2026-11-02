# R158 内阁大库：一座外壳候选

基于 acc36 对应本地 `d1c66bf9f977f354432ef20a2e783f1c33d5cfae`。仅新增一座“**内阁大库（具体库别待核）**”；不是两库复制，不是历史内阁 11 项整体验收，未赋红本/实录身份。共享 hook 未安装。

## 证据 / 拟合

[故宫说明](https://www.dpm.org.cn/explore/building/236579.html)证砖石库体、铁柱窗及外铁板窗、建筑存续；[2023 修缮函](https://wwj.beijing.gov.cn/bjww/362679/362680/482911/436282535/)支持现存维修对象，不是竣工或开放证明。[官刊 2008 p026](https://www.dpm.org.cn/Uploads/pdf/6179/T00026_00.pdf)有清楚砖石墙/石窗框/外板窗/红门；[p025](https://www.dpm.org.cn/Uploads/pdf/6179/T00025_00.pdf)有铁包门特写；[p018](https://www.dpm.org.cn/Uploads/pdf/6179/T00018_00.pdf)描述北向铁窗，也记录南窗改玻璃和后加无槛院门。不能把两张未注库别的照片指定给红本库或实录库。

[自身远照 8358](https://img.dpm.org.cn/Uploads/Picture/dc/8358.jpg)仅辅助山墙/坡屋面，[2011 院刊 p106 民国图](https://www.dpm.org.cn/Uploads/File/pdf/dc/90/c9/dc90c935d785bbdf396ad66173ebf391.pdf)仅作大堂以东的相对方位。拍摄日、现代测量、整栋窗数、瓦色及后/侧立面不明。

- 中心 `(-221,-365)`、主体 42×12m、檐约5.4m、脊约8.7m；5组铁窗/2处门及间距、窗/屋面细节和色值均为**可撤销工程拟合，不是开间测绘或窗瓦清单**。
- 仅一侧落实可辨石框、真铁条、外翻铁板窗和闭合红门，端/背为素砖闭合拟合；不把未知背面复制成同一排窗，不造斗拱/兽饰。墙面正常使用既有 brick 贴图及真实 UV；自制 CPU 图只显示平色，不冒 GPU 贴图效果。
- 窗缝没有暗板，闭门有真实门叶，屋顶为真薄实体；空腔仅有地面齐平基面，无虚构楼层/楼梯/陈设、无新 room、无新 walkable。不允许靠隐形填满盒阻住可见空腔；闭门外观不表示现实开放许可。
- 最终可见 bounds：x `[-242.25,-199.75]`、z `[-371.659708,-358.340292]`、y `[-0.28,8.885000]`，位于独立核过的预留盒 x[-244,-198],z[-373,-357]。保河道、桥、两条旧南路和既有大堂入口；不动旧模块。

## 检查边界

12 项定向检查通过：可见 Float32 顶点对真实碰撞 owner、窗间净缝/空腔、真实铁栅/闭门/砖墙/屋顶、高侧注入、合并资源所有权；16条人物全身体积外绕/近立面路线（10/60Hz、走/跑/倒退），8次闭门负控。局部原生飞行从默认家起飞，落顶/空中下机被拒、南侧净地下机通过；另有12m人为注入落顶负例。**飞行仅本堂+库的局部包络，不是全城/浏览器操作验收。**

实际 CPU World（loadAll:false、outer-east已加载、测试before-finish追加）：新库外绕/门前 **8/8**、14856帧脚地差0；原大堂 **8/8**、11,318帧逐字等acc36；旧两路仍 **4绿/4旧红**，完整诊断逐对象相同。原2083碰撞/66支承/13rooms保留，新37真owner、0新walkable；模块browser bundle exit0。**不代表生产hook已装、全应用构建、全分区/全仓、GPU或手机验收。**原图原件、原始红绿日志/逐帧 JSON 全部只本地保留，项目仅存摘要/SHA/命令与自制 CPU。

## UV 返回值修正

最终自查发现 `applyBoxUV` 对带索引几何返回新对象，旧候选未接回返回值。真实 UV 测试先红，再仅改 `geo=applyBoxUV(...)`；最终 12/12（含每个顶点的实际米制UV、资源和路线）与模块bundle全绿。21,610可见三角流及37 owner全三角流 SHA 前后完全相同，不只是bounds比较。**上列World和5平色CPU来自修前源；UV修后未重跑World或GPU**，以精确几何保持证据承接通行结论，正式接线仍需集成人复验。平色CPU不使用UV，不能充当贴图验收。

## 接入 / 命令

新模块 `src/scene/palace/special/NeigeStorehouse.js`。唯一集成人在 ZoneBase 加 import：
`import {buildNeigeStorehouse} from '../palace/special/NeigeStorehouse.js';`

在现有 `buildNeigeCourt(this.kit,this.zoneJson);` **之后**、`this.kit.finish()` 之前调用 `buildNeigeStorehouse(this.kit,this.zoneJson);`，保所有旧 finish hook。其他区 no-op；原 outer-east、未变换 root、已有主堂、只装一次；错误/重复前拒。不宣称任意发布阶段异常完整回滚。

```sh
node --test tests/r158-neige-store/component.test.mjs tests/r158-neige-store/routes.test.mjs tests/r158-neige-store/flight.test.mjs
BASELINE_REPORT=/path/to/r158-cumulative-evidence-1711/world-neige.json EVIDENCE_OUT=/tmp/neige-store-world.json node --max-old-space-size=1024 --test tests/r158-neige-store/world.test.mjs
```

World 命令要求可访问 acc36 实际大堂基线 JSON，不是更早未装大堂的基线；测试在正常 CourtKit.finish 前追加候选，不改生产代码。正式接线后不能重复注入，集成人需移除测试专用 hook，核正式注册恰一次、原路径/新外绕及累计应用构建。
