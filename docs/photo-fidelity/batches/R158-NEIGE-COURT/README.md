# R158 内阁大堂小院候选

基于 `be5393cb62b24d726896403a4a27ad37ca92a3f9`，新增一个大堂、前垂花门/屏门、短墙小院；共享接线尚未安装。**不是内阁 11 项整体验收，也不表示现实开放。**

## 图证与拟合边界

- [故宫内阁大堂说明](https://www.dpm.org.cn/explore/building/236523.html)及[自身官图 8036](https://img.dpm.org.cn/Uploads/Picture/dc/8036.jpg)：南向三间、黄琉璃硬山顶、红柱格扇；前方灰瓦门和短白墙。照片拍摄日期未知。满本堂明确现不存，不造；其他八个历史附属身份、内阁大库均未实例化。
- [2011 院刊第 6 期 p106 图三](https://www.dpm.org.cn/Uploads/File/pdf/dc/90/c9/dc90c935d785bbdf396ad66173ebf391.pdf)转载民国时期清内阁遗址图，和[官方游览示意图](https://img.dpm.org.cn/static/themes/image/xf/map3.jpg)仅作相对方位依据，**不是现状测绘**。不混用 2008 官刊红墙里的另一座“内阁大堂南小门”。
- 中心 `(-161,-365)`、柱间总宽 18 m、主体深 9.6 m、檐高 5.1 m、脊高 8.3 m，均为可撤销工程拟合。实际整体 bounds：x `[-173.335,-148.665]`，z `[-382.1094,-358.4650]`，y `[-0.36,8.79]`。
- 前门净宽约 3.04 m、大堂门净宽约 3.22 m；四扇门叶可见地收折，属交互拟合。官图前门/墙挡住堂门台阶：批准将堂地与院地齐平，**未证真实台阶形态**。无悬空支承、无共享物理改动，不发明室内陈设。
- 背侧院形、精确窗格/瓦数、彩画/雕刻、原门扇开态未知。仅保可辨体量，屋脊端部为素形，不声称复原细雕。`cpu/` 是真实几何平色诊断，不是 GPU/实际贴图截图。

## 实测范围

- 11 项定向检查通过：7 组件/资源检查，20 条 native full-body 步行/跑步/倒退路径（10/60 Hz），实体与门洞正负控；两帧率 12 m 注入下落落在真实屋顶、高侧冲入被挡。
- 局部原生 FlightState 从默认停靠点更新到本堂上空：落顶被挡、实际 FlightTour.exit 空中拒绝、外侧净地安全下机。**仅本组飞行包络，不是全宫飞行或浏览器指针锁验收。**
- 实际 CPU World、实际 TextureLibrary、正常 ZoneBase/CourtKit 合并，测试专用 before-finish 接入：既有道路→前门→小院→堂内→原路返回 **8/8**；不占旧实体、不侵水域，既有实体/碰撞/支承引用不变。新增 **20,584 三角面、60 个真实 triangle owner、0 walkable**。
- 旧南路诊断 8 条：东华 4 绿、文华旧中心线 4 红，候选与未安装基线逐终点一致。原红保留，不能写成 8 绿；现有文华门测试使用偏置中路/侧门，不在此改写旧线路。
- 独立模块 browser bundle 通过；**全应用构建、正式共享 hook、GPU/mobile、全仓回归未在此验收**。源图原件、逐帧 JSON、红/绿日志只在本地保留；`PINS.json` 绑定 SHA 与终态，未作为项目原始报告上传。

## 运行与接线

```sh
node --test tests/r158-neige/component.test.mjs tests/r158-neige/routes.test.mjs tests/r158-neige/flight.test.mjs
EVIDENCE_OUT=/tmp/neige-base.json node --test tests/r158-neige/baseline-world.test.mjs
# 上一命令保留旧文华中心线失败（非新缺陷），仍会写全 8 行基线。
BASELINE_REPORT=/tmp/neige-base.json EVIDENCE_OUT=/tmp/neige-world.json node --test tests/r158-neige/world.test.mjs
```

单一集成人在 `ZoneBase.js` 加 import：
`import {buildNeigeCourt} from '../palace/special/NeigeCourt.js';`

在全部既有 finish 调用之后、`this.group = this.kit.finish();` 之前加：
`buildNeigeCourt(this.kit, this.zoneJson);`

函数只接受原 outer-east 边界且一次接入，其他 zone no-op；不替换其他 hook。上述 World 测试是**候选隔离注入**，不能在已经接线的树原样再注入。整合人需去除测试注入后复用其 8 条入口路径，验证正式接线恰好一次，再运行累计应用构建。官方证据不纳 Git，候选源码/测试和自制 CPU 可单独撤销。
