# R101 Xiehe Plaque Interface Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:executing-plans to implement this plan task-by-task.

**Goal:** 消除协和完整牌框上后部与真实彩梁的轻微正体积埋入。
**Architecture:** 只SideGate的协和实例牌组z拟合；CourtKit.plaque不变，面与框共同位移，不改其他门或物理。
**Tech Stack:** Three.js / Node tests / fixed-camera CPU diagnostic.
**Spec:** docs/superpowers/specs/2026-10-26-r101-xiehe-plaque-design.md

## Global Constraints
仅协和完整牌组；不改文字/尺寸/门头/开口/人物/稳定ID；.07为工程拟合非测绘；官方原图不上传。

## Review Focus
- 面移框未移造成假修复：两对象相对transform精确保留。
- 只避梁又撞门头：真实框全部三角/顶点对结构检查。
- 共用代码误改四门：其他实例逐属性/登记精确保留。
- 字面旧6ray可读不能牺牲，不要求所有角度可读。
- 不用全门包围盒替代局部实体，也不改物理/导航来凑可见性。

### Task 1: 精确合同与局部深度
Files: tests/lib/r101-xiehe-fixture.mjs; tests/r101-xiehe-plaque.test.mjs; src/scene/palace/special/SideGate.js.
- [x] 基线快照/真实相穿RED（frame真实Box顶角入梁，旧6ray均可见）。
- [x] 仅xiehe牌面z=-d/2-.36，共用plaque负责完整面框同移；必要metadata明确MODEL_FIT_NOT_SURVEY。
- [x] GREEN真实结构无正交叠、6ray、面框属性/相对关系/全非目标/其他4门精确。
- [x] 固定局部前后图与独立审查，同hash冻结。

### Task 2: 累计交付
- [x] 原通路/物理/地图精确保留核验，若不一致先修而非扩scope。
- [x] 记录轻微接口价值和矩形框/挂距/书法限制，不称遮字堵路或全牌复原。
- [x] fresh main内容核对，166固定输入预展开，184累计/1290原失败多重集。
- [x] 三fresh base与139包；force仅3build.log，独立最终审查后唯一上传者，不改main/Pages。
