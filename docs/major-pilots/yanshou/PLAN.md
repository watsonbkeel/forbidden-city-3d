# 延寿堂复合院接口 Implementation Plan
> 实施方式：单一写手按 executing-plans 串行实现，独立只读复核。
**Goal:** 以官方已证前后房/天井/东穿廊拓扑闭合原缺口，不冒称照片未见室内复原。
**Architecture:** 新YanshouCompound模块只消费精确延寿堂上下文；RemainingOuterHalls原前房末尾调用；共享求解仅有反例时做严格限定接入。
**Tech Stack:** 现有Three.js/Node tests，无新依赖。
**Spec:** DESIGN.md / RECON.md。
## Global Constraints
原前房屋顶/入口/平台不变；新源x<=285.425,z<=98.8；不碰14旧脏报告/main/推送；低于500MiB停止大产物；未知家具/细雕不造。
## Review Focus
闭墙开口视觉/碰撞一致；天井不能被隐形地板覆盖；东侧及北侧邻居路线；新屋檐/花窗全高接触；修改主builder不能改变其他25个对象。
## Tasks
- [x] 精确真实父源码夹具与邻居边界调查；红测前后房/廊/天井及旧后墙开口。若包络与实际邻居冲突先改拟合设计而非藏碰撞。
- [x] 新src/scene/palace/special/YanshouCompound.js函数buildYanshouCompound(c)，精确守卫与真实闭合源；限定RemainingOuterHalls调用。专项几何/材质/源面及保留测试转绿。
- [x] 加实际世界路线/动作/NPC/generic/落体，先复现再修；scope/支持见证仅必要且有限。
- [x] 串行完整专项/共享/旧导航组、实际父版成本对照、独立审查/未验与旧失败记录、本地单独提交。
