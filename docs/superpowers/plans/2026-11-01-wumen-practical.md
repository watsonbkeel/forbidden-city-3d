# Wumen Practical Assembly Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** 将完整午门五项可见组装接入正常生产模型，保持五口/主楼并用原生通行验证取代不必要的微缝研究。
**Architecture:** `WumenPracticalFit.js`存冻结工程参数；`WumenPracticalPlatform.js`与`WumenPracticalRoof*.js`复用已验证算法但只依赖src；`WumenPracticalAssembly.js`构建与替换本门范围；共享入口只交patch。
**Tech Stack:** Three.js、既有PalaceBuilder/CollisionManager/FirstPerson/合批与Node tests，无依赖变更。
**Spec:** ../specs/2026-11-01-wumen-practical-design.md

## Global Constraints
- 37原ID不变，五项实用标准与旧精细复原验收分开；≤0.3m且不影响通行不修。
- 不改main、共享controller或其他组文件；保回滚父2cb15fde。
- 不复制白色fixture材质进生产；用真实library材料及tileSize/aspect。
- 不使用旧整块floor或测试receiver补支承；主楼世界坐标不变。

## Review Focus
- 五门/门叶与台体变更保持可通，北洞口真实平移。
- 本门物理范围替换不删全城其他对象，世界offset只一次。
- 柱/亭闭体不挡马道与北台面；放大实体不可孤立安装。
- 保持原材料所有权，退休几何与新合批释放无重复或漏失。
- 实际路线、画面和final源码身份一致；CPU/Node不能称GPU已验。

### Task 1: 专属生产模块及组件证据
Files: new src/scene/palace/special/WumenPractical*.js; tests/photo-fidelity/batches/wumen-practical-assembly.test.mjs.
Interface: installWumenPracticalAssembly(builder,parent,data,{colliderStart,walkableStart}) -> receipt|false; run only original anchor; no shared changes.
- [x] 红测：生产模块不存在/旧亭11m未被新19m替换，完整实例/五门/主楼保留及本门索引隔离。
- [x] 移植冻结工程参数和几何函数，删除offline/fs/test依赖与蓝色reference标记。
- [x] 建完整物理/支持并只替本门尾区间；旧link furniture与旧整floor不继承。
- [x] 绿测：五门图元/主楼保留、四亭两翼两横连尺寸、材料所有权、prefix不变、释放、错源/重复调用。

### Task 2: 正常通行和整组视觉
- [x] 原生10/60Hz走跑往返、五门、双马道、北台面、可见闭体负例：64/64到达，脚下滞后最大0.287m；下坡2组合各1逻辑体接触帧，未宣称零穿，不追不阻行微差。
- [x] 同机位前后整组＋实际Enclosure CPU图供轮廓检查（明确不是GPU）；实际浏览器仍由集成者完成。
- [ ] 交付精确共享hook patch；共同World/构建在协调资源槽后执行；任何blocked如实记录。
- [ ] 独立复核后冻结提交，提供增量及回滚说明；不夸大37/37完成。

## 实施裁决
- 01:42 UTC：原生64路线均到达，但新短中跑保旧10m中转导致60Hz跑上相机脚低0.409m。仅将未实测中转改8m，实际可见坡/有限实体/支持同改；不改控制器、免修阈值或平面权限。原10m诊断版本留档。

- 01:50 UTC：处理实际南城墙埋新坡：只扣实际12段坡脚的墙内重叠footprint，坡体闭合砌体填扣口；剩余近坡墙使用实际全高实体，远墙保持前版；实际Enclosure一起重跑64/64。
