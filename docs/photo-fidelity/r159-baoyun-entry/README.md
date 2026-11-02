# R159 宝蕴楼室外六阶与门廊台基：有限通行修复

独立基线 `bd1ba792f2bd625bc1cdd85fd24886aeca95716c`（四狮作者冻结；原运行源 a098）。本候选不改四狮、closed 室内、门洞、地图、enter、楼体；不声称开放宝蕴楼室内。无作者全站 build/GPU。

## 实红及范围
- 正常 actual-library World / 原生 controls / 真实 Teleport.go('宝蕴楼') 原 0/2：脚0卡原整块楼梯碰撞南缘。原 go 本身正确返回 x300.9,z-241.7,feet.45，非导航方向 bug。
- 旧六阶 .2m高、.32m深，总整块高1.2碰撞填满阶上空气，原平台没有 walkable。先仅按原阶加真实支承仍四路红：.5m玩家半径先碰第二阶。
- 批准仅将六个可见踏面深拟合为 .52m，保 .2m升高、北缘-213.27、平台南缘-213.4及 .13重叠。新南趾-216.39；硬保既有横路 z=-217，距趾.61m。不扩大到 .6m踏面。
- .52m四路到达但峰 .888111、60跑21帧>.3（14帧中心在组件范围、7帧趾外）；既有通用缓降不能当最终绿。

## 产品三源
1. `BaoyunExteriorSteps.js`：精确正常 builder 私有身份/七原网格验证；只替六 visible boxes 与旧整块碰撞为六真 boxes，增六阶顶+原平台顶7 box walkables。原平台/其他网格/旧支承/房间/地图/结构字段保留。
2. `BaoyunExteriorContact.js`：七面私有 WeakMap，真实原网格/实体/注册行持续验证、删重移复制失败；仅已有持续贴地角色，限 dt≤.1、速≤12、半径.5、脚印全覆盖，原 `wumenJointBodySweep` 阻薄普通体及动态角色。无虚坡，无新空气支承。
3. `BPrincipalStairContact.js`：只前缀接入。`function toeRect(` 起含 marker 到 EOF、Collision.js/FirstPerson.js及全部旧证书不变，inclusive SHA 与旧 src/data 表见 summary。

六阶共享 Float32 顶点边界，消除独立半深+平移造成约2e-8m真实缝隙；未放宽原 coverage/sweep 容差。趾外只最多1.2m既有地0的连续交接，不捕获首次高落。源网格验证针对 builder 保留源；不宣称任意外部直接编辑合并后的显示网格会撤权。原生支承按通常 tag 生命周期管理，手删私有认证行只撤局部接触，不宣称自动删除其余原生支持。

## 最终有限结果
- 最后轻组件 **8/8**（含实际本殿4上下273帧，峰 .0493194；旧横路2/133完整帧同原；closed内门仍拒绝）。原7面直接阳性、跳高/高落/侧出、删/重复/复制/移位/隐藏、薄Box两端clear及动态体拒绝。
- 真实 native stationary jump 与初始4m高落，启用/去新认证 **各100帧全等**，未改跳跃/重力。首运行仅DOM fixture缺exitPointerLock失败，保原日志；补 fixture 后绿，未改产品。
- 旧 B **9/9**，非全站回归。
- 一次候选 World：完整正常 ZoneBase 构建，**QA只在其末端注入一次本 finalizer**，无虚构物理/路径/材质。真实 go→室外阶台→原 go 地点返回 **2/452帧全到**（10走/60跑），本阶区域 z≥-217.6峰0；原 z=-217横路 **2/133帧同原**。加载 outer-west+globals，go后邻区 axis-courts/west-six，不是全分区。
- **全程仍有既有远处 .4472778 脚差**，发生 z约-235.6 地面 .45→0，与本阶隔约19m；原 go/路线/落点没改，不洗成全程≤.3。
- 两小 CPU 是实际 geometry/flat colors；作者已亲看六道可见踏步及平台。非GPU/纹理照片对照，.52尺寸是工程拟合而非测绘。

## 接入与证据
唯一集成人在 `ZoneBase.build` 末端、`kit.finish()` 前正常调用一次 `finishBaoyunExteriorSteps(this.kit)`，在四狮之后即可；不得再手动重复调用。作者未改共享 hook。
`world.test.mjs` 写死作者基线和 QA hook，仅作者候选用。累计复制脚本到新路径、改 base/output/移除QA注入；不要覆盖作者 `/tmp` 原件。其它轻测试直接本殿 builder，不依赖正常 hook。
原件 `/tmp/r159-baoyun-entry-0634`：旧World RED、旧.32 RED、.52接触RED、missing-helper RED、接触边界初红、最终轻/World/原帧与2CPU几何全部保留；manifest给哈希。官方四狮原图不作为新 .52踏深证据。

复现：`node --test tests/r159-baoyun-entry/{component,contact,jump,routes}.test.mjs`；`node --test tests/photo-fidelity/batches/b-principal-stair-contact.test.mjs`；World依上注。测试 raw 路径固定，累计必须重定向新路径，不能重写冻结原件。
