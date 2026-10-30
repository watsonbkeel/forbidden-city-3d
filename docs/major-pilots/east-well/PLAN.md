# 东井亭整亭 Implementation Plan
> **For agentic workers:** REQUIRED SUB-SKILL: superpowers:executing-plans；单一写手原生实现，独立只读审查。
**Goal:** 原文东井亭整亭及保留南北连接的局部绕路。
**Architecture:** 专用CourtKit构建，ZoneBase显式garden profile；独立严格物理域/真实环境witness，运动数学不变。
**Tech Stack:** 现有Three.js、Node test；无新依赖。
**Spec:** DESIGN.md、RECON.md。
## Global Constraints
不改main/不push/deploy，不删除旧资料；顺序重测试；仅原物证支持构件，尺寸和背面诚实标拟合；磁盘<500MiB停止大产物。
## Review Focus
- 1.94m柱网不能为玩家通路擅自放大：外绕路与顶部接触测试。
- 新亭不能污染旧随机采样：34树全矩阵/材质/碰撞保留。
- 顶洞须真空：多层向上射线/落体口边，无隐形盖。
- 椽/梁/瓦可见三角面最终F32对应物理：逐面merge和身体oracle。
- 局部域不得引入邻亭三角旧shape：全高度1.25m包边调查及边界走跑跳。
## Files and interfaces
Create src/scene/palace/special/EastWellPavilion.js: buildEastWellPavilion(kit,zoneJson) 返回{frame,geometry}，exact garden/eastWellProfile绑定。
Create src/scene/garden/EastWellGroundFit.js: clipEastWellBedRectangle(rect) 仅局部床面/边，真实低铺面由EastWellPavilion可见实体注册；原paths/beds/采样不变。
Create src/controls/EastWellSupport.js 与 EastWellEnvironmentWitness.js: exact源台scope、真实Environment见证；现FurnitureMotion/Collision/ZoneManager/test world仅窄路由。
Modify data/zones/garden.json 顶层eastWellProfile；ZoneBase显式调用；GardenBuilder地面裁剪/补铺面。
Tests tests/major-pilots/east-well/{geometry,retention,motion,material,source-guard}.test.mjs；报告同名目录。
---
Goal：补原文已证独立小亭及局部双侧绕路，不改变其余庭园。
Architecture：现有CourtKit/ZoneBase实例；GardenBuilder只做地面局部裁剪，不把新碰撞加入旧树采样；严格源面域复用既有运动数学。
- [x] 先录基线全高邻域、34树位置/种类/尺度、地面与原路；复现缺亭红测。
- [x] 专用轮廓/八角天井/四柱承托/井盖与台栏、最终F32物理；守卫误绑定/错误源，TDD。
- [x] 原路双侧绕行和本体周圈/跳跃/落顶/孔口10/60Hz；全高邻居保护、源面不穿透。
- [x] 完整非目标保留、材质/几何生命周期、最终merge一致性、实际范围成本。
- [x] 独立只读复审；串行专项/共享161/邻居32/zone旧失败实跑；旧14哈希保留。
- [x] 提交前证据/回滚点、来源/拟合/未验说明完成；本地提交结果以git log为准，不推送、main或删除大产物。
