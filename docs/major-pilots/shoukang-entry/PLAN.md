# 寿康门整体入口 Implementation Plan
> 单一写手按executing-plans顺序执行；独立只读复核，不并发重测试。
**Goal:** 完整单门/肩墙/白石座与低南墙关系，保持原3.6m通路。
**Architecture:** 专用ShoukangEntry精确profile及南墙contract；局部材料/实际源物理，无共享样式扩散。
**Tech Stack:** 现有Three.js/Node tests，无新依赖。
**Spec:** DESIGN.md / RECON.md。
## Global Constraints
保原锚/3.6净口和3面院墙渲染/前殿；三墙高位物理按DESIGN红测修订增强；细雕/门背/满文未知不造；不碰14旧脏报告/main/推送；低于500MiB停止大产物。
## Review Focus
低肩墙不能被旧高墙穿过；所有旧南墙必须实际补回除唯一门口；门神/满文不臆造；开门不能埋在门垛；石座不得堵主线或用大盒封空。
## Tasks
- [x] 构建真实父夹具/唯一墙守卫与全区邻居census，红测单门+肩墙完整关系与开口。
- [x] src/scene/palace/special/ShoukangEntry.js + 局部Paint模块实现真实闭合源；ZoneBase/data精确派发/南墙接口；独立source/geometry/retention/material tests转绿。
- [x] 实World通路与高落/NPC/generic/域交接；若需strict先红测，scope与Environment验源限定入口及三条明确周边窄域。
- [x] 完整专项/共享/旧组串行，历史测试范围必要迁移须保留旧断言及新当前非目标对照；独立复核/成本/未验与旧失败记录/本地提交。

验收范围为CPU source/motion/retention闭环；GPU、精细雕饰及原区域旧缺口不因此接受，见VALIDATION。
