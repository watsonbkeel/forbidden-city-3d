# R100 Xishang Stone Rails Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox syntax for tracking.

**Goal:** 将禊赏现有两侧透空细栏校正为图证实体石栏，保既有槽/通路与其他已交付功能。
**Architecture:** 新建专用box同源栏模块，仅buildXishang替换两次generic rail调用。所有非栏对象不变，工程包络不扩；不改控制器。
**Tech Stack:** Three.js、Node test、CPU实际几何图；不新增依赖。
**Spec:** docs/superpowers/specs/2026-10-26-r100-xishang-stone-rails-design.md

## Global Constraints
仅既有两侧；不填前开口、不造背栏；不凑27m，不改R83槽；不动R99梵华/北墙或人物/物理；原图不入发布。

## Review Focus
- panel变实体之后完整身体沿栏/转身退出不能产生新夹点。
- 新柱帽/压顶实际落地必须可离开，不能只测地面。
- 非栏旧mesh/collider/walkable逐属性保留，不靠总数。
- 两侧90度旋转后的mesh/collider一致，不能只看local AABB。
- 来源仅支持形制，精确纹样/尺寸和27m保持未复原声明。

### Task 1: 图证栏体与保留合同
Files: create src/scene/palace/special/XishangStoneRails.js; modify RemainingNingshouHalls.js buildXishang; create tests/lib/r100-xishang-fixture.mjs and tests/r100-xishang-stone-rails.test.mjs.
Interface: buildXishangStoneRails(c,{mainW,mainD}) consumes existing c.box/tag/p; returns explicit model-fit metadata, no global mutation.
- [x] 捕获R99基线全部非栏mesh属性/矩阵、colliders、walkables/map/profile，gzip只读fixture。
- [x] RED：8实体板/10宽柱/压顶存在，真实box对应，旧透空role全部移除，非栏全部精确。
- [x] 实现spec四板五柱参数及同源实体；只替换两侧generic调用。
- [x] GREEN：新测试与原R83两个槽测试，固定entry/rail图自看与独审。
- [x] 锁定源码hash/提交，再交局部身体轨迹独检。

### Task 2: 实际通路与成本
Files: tests/r100-xishang-movement.test.mjs; reports/r100-xishang/.
- [x] 基线/候选10/30/60真实入口、石场四边、沿栏、跳落柱帽/压边→八向普通离开，记录完整身体交叠并区分旧台基行为。
- [x] 全宁寿非目标对象/地图导航/水槽逐属性保留，完整load/dispose无泄漏。
- [x] 记录实际新增tri/collider与局部构建成本；无实机/GPU承诺。
- [x] 独审同hash通过后提交证据。

### Task 3: 累计收口
- [x] 来源/长度口径及未实现纹样、阶/北联系更新台账；release R100不覆盖R99历史。
- [x] fresh main逐树核内容；精确展开固定fixtures后原1290失败多重集与累计有效合同。
- [x] 三fresh base/HTTP及包，同source fingerprint；显式force纳入3build.log。
- [ ] 独立最终静态/产物审查及唯一上传器回读，未完成前不称已交付。

实施裁决：凸柱头ce7物理失败被拒；最终87f保真实连续同高顶梁，原因及独立差分见VALIDATION，未改控制器。
