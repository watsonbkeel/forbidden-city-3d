# R159 坤宁门原阶接触

基线 **224065bb93a9a9d45e67d95614741de486e5e174**（已含七兽、宝蕴入口）。修复原门路快速下阶短时离地；不是补建台阶或历史复原。

## 结果
- 父正常 garden World 原 60Hz 跑峰 **0.875278m**；10Hz走/跑、60Hz走另为 .202/.532/.300278m。四组均能到达，但严格 .3m 条件原红保留。
- 同四组、同原始 waypoint/速度输入，修后 **4/4、845帧**；峰依次 **.269273/.086212/.129212/.186556m**。下降轨迹发生预期变化，**不声称运动数组与父相同**。
- 正常 `loadAll:false`、`reuseInactive:true`，仅 garden 驻留及全局静态，真实 controls，无注入。全部 **9605 collider/919 walkable/1 river** 有序字段摘要与父精确相同：`05544652e0b35c054a4ffaf96e2a8e15fa2a5b551a8ad0b323b15a2dac082b11`。
- **29/29** 定向终态（13本项、16原东/南銮驾库及宝蕴）。含原生跳跃/高落100帧数组与去私有授权对照完全相同、薄静态/动态阻体、缺/重复/改动/复制 owner、四 lane、三个独立 import 入口、旧两库/宝蕴正常分派。
- 30Hz 另用同门真实单体 fixture 走/跑，不重建 World；数据见 SUMMARY。不是全宫动态流式/GPU/帧率验收。

## 最窄变化
仅新 `KunningGateStairContact.js`、KunningGate 末尾完成认证、B 前缀独立 East alias wrapper/owner克隆接点。Baoyun 原 South 前缀及 `toeRect` 至 EOF 字节不变；原 FirstPerson/Collision/任何几何尺寸不改。

33 个既有原顶 = 32 阶 + 平台。每阶 .4m深/.15m升；完整旧支承仍 **36**（另有门槛和两中央石坡）。认证是完成后的规范本体私有 WeakSet/WeakMap，关联原 mesh、原 ordinary collider、原 flat support；克隆到真实 Collision 时私有延续，**不新增任何序列化 support 字段**。运行核原 source 顶点/位姿、33唯一支承与33唯一真实碰撞 box；复制标签/缺体不获授权。

仅同 lane 向外下阶、前一帧已支承、非跳跃/高落，且路径足印覆盖及“原高度横移→目标点竖降”两段原生体扫均清才接触。toe 只交接既有 ground=0，最多1.5m，绝无补地/隐坡。中心御路、门槛、侧出、柱墙和平台下方无新通行许可。

原本体 **261 mesh、186 collider、36 supports、60北栏**、地图/结构全流 hash 与父相同。北两 lane X[-4.1,-.1]/[2.3,6.3],Z[426.7,429.9]；南两 lane X[-10.1,-.1]/[2.3,12.3],Z[415.5,418.7]。身体半径 .5，横向内缩 .5。现有门/七兽/台基/北栏/中央石坡均不重做。

## 验证与交接
原始失败和最终日志/完整帧仅本地 `/tmp/r159-kunning-stair-evidence-0710/`，PINS绑定。组件原1绿5缺contact红；父 World 为真实 .875红。后源未再改。作者未做全应用 build；无外观变化，未重复 CPU 图。

```sh
node --test --test-reporter=tap tests/r159-kunning-stair/component.test.mjs tests/r159-kunning-stair/jump.test.mjs tests/r159-kunning-stair/dispatch.test.mjs tests/r159-kunning-stair/routes30.test.mjs tests/r158-luanjia-east-twolevel/contact.test.mjs tests/r158-luanjia-south-twolevel/contact.test.mjs tests/r159-baoyun-entry/contact.test.mjs
MODE=cumulative OUT=/tmp/r159-kunning-stair-cumulative.json.gz node --test --test-reporter=tap tests/r159-kunning-stair/world.test.mjs
```

三源已在候选正常接线，**无需 ZoneBase/shared hook 或 prototype注入**。唯一集成人 cherry-pick 后正常命令/全应用构建关闭累计门。父原件路径固定于同 `/tmp`，不要重新覆盖 `world-parent.json.gz` 或 baseline.json。保留旧原红；此后继通过不倒改七兽报告中的旧门红。
