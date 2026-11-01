# 右翼门白石栏板/简化柱头：独立视觉候选

Base `2add4a25`。只改`YouyiFreshGate.js`，不修改/更新用户正在合并的`branches`，不动main、不部署。

自身官方西向完整照片（原SHA90898697…c0cab，私有研究，不分发图片）可见连续下部石栏板和较厚圆鼓/莲瓣柱头；原候选仅细方柱与一根横杆。本轮在原四条坡边栏线上补16块随坡白石板（约.48m高/.12m厚），20根柱改收细柱身与简圆头（最大宽.18m，总高.9m保持）。没有雕花精确复刻声明。

**物理完全不变**：原逐行post collider运算保留，连续栏代理保持；所有collider/support、门洞/坡/屋面等非栏mesh签名逐项等改前2add。全部新增可见顶点在既有真实proxy内（1e-6仅用于Float32表示比较），没有穿得过去的明显新石板，不占门洞。

## 终态
- 原门6组件＋新2组件=8/8，含实材质库API、三实际空门ray、原护栏/闭房拒绝、全物理/非栏签名保全。
- 原真实World脚本1顶层，三门24＋共享厅4＋原弘义前门4，共32/32往返到达、5656帧，脚地绝对峰.150333m。
- 必要`npm run build`：599模块、exit0，/gugong/ base；身份2add+本轮dirty源码，详EVIDENCE。不称clean构建或GPU启动。
- 同机位东西整体/栏近景前后6张平色CPU，7148→9740三角；不是纹理/光影/GPU截图。

仍保留12.6m紧凑门、.45m低台与3m短坡工程简化，未把官方高台/长坡恢复；不变相抬门或移动两邻廊。GPU/手机/用户验收未完成。当前试玩ZIP不含本候选，未更新branches。

复现：
```sh
node --max-old-space-size=384 --test tests/r157-youyi-rails/component.test.mjs tests/r157-youyi-fresh/component.test.mjs
EVIDENCE_OUT=/tmp/r157-youyi-rails-world.json node --max-old-space-size=1024 --test --test-concurrency=1 tests/r157-youyi-fresh/world.test.mjs
npm run build
```
