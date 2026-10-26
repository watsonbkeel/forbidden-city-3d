# R96 Yangxin Furniture Motion Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:executing-plans. 唯一writer执行，独立reviewer只读审核；用户已授权直接实施，不重复确认。

**Goal:** 从真实可达桌/炕边普通走下不制造身体穿入，保留其他区域和R95修复。
**Architecture:** 显式B层区域所有权＋局部普通实体完整身体接触/水平迈步/竖向扫掠；全园旧分支不重写。
**Tech Stack:** 现有JavaScript/Three.js/Node tests，无新依赖。
**Spec:** `docs/superpowers/specs/2026-10-26-r96-yangxin-furniture-design.md`

## Global Constraints
- 基底最终R95 local14d8997e；其远端发布状态独立记录，不接回R94。
- 玩家方形半宽0.5m、身高1.7m不变，不扩大豁免、不加救援面、不改家具实体。
- 单writer；先RED后runtime，源哈希绑定独检。R95/main/Pages不写。

## Review Focus
1. 地面/屋顶同XZ：地板contact保留，blockedPose不得等于没有实体。
2. 脚缘、桌腿与薄板：切触可离开；正体积/跨面扫掠必须挡。
3. 空中进入/离域：不偷抬脚、不复位速度/跳跃，不等落地才交接。
4. NPC/无motion调用：真实radius，支撑与占位分离，不把人当站台。
5. S/B载卸和每帧navigation clone：无失效scope/重复index/幽灵owner，域外行为精确同R95。

### Task 1：重绑真实RED、冻结域契约（本阶段）
**Files:** `tests/r96-movement/reachable-kang.test.mjs`, `scripts/r96-movement/diagnosis.mjs`, 新spec/本plan。
**Interfaces:** 当前生产fixture+真实FirstPerson tick；输出B/S×10/30/60南退和独立positive-depth证据。
- [x] 写6项原RED：从真实地面进桌，`firstVerticalOverlap===null`、结束无collision、普通回地面；原半径反例保留。
- [x] 跑 `node --test tests/r96-movement/reachable-kang.test.mjs`，预期6FAIL而非夹具错误。
- [ ] 核scope范围实际对象/门口与S载卸；提交设计+RED给parent/reviewer，未写产品代码。

### Task 2：纯接触/扫掠与区域所有权
**Files:** 新`src/controls/FurnitureMotion.js`；`src/scene/palace/special/YangxinWestWarmRooms.js`、`src/utils/Collision.js`、`src/scene/characters/RoutinePath.js`（仅共享源代数身份）；`tests/r96-movement/contact-sweep.test.mjs`、`lifecycle.test.mjs`。
**Interfaces:** spec的scope/contact/bodySweep；返回真实surface与独立poseClear，marker不造几何。
- [ ] RED：foot square角、face/edge/corner touch±1e-9，薄板大位移TOI；两层地面/屋顶足够/不足净空，动态体不站立；scope sweep含高空，register/remove/update/held clone。
- [ ] 最小实现，验证所有新体/原几何数组精确不变，非盒实际清单有对应真实窄相位，不使用bbox替代。
- [ ] 同版单测GREEN、独立审核；小commit，仅明确路径。

### Task 3：水平迈步＋重力接入
**Files:** `FurnitureMotion.js`、`Collision.js`、`src/controls/FirstPerson.js`；`tests/r96-movement/controller.test.mjs`。
**Interfaces:** furnitureTryStep/resolveFurnitureVertical与独立lastFurnitureStepFeet。
- [ ] RED：grounded lift→translate→settle三段头/身体阻挡；airborne禁autostep；下降/小落差/顶碰/临时NPC阻挡、资源域离开状态不重置。
- [ ] 最小接入域dispatch；源姿态有效方可迈步，纯竖向先扫后落，非域旧分支不动。
- [ ] 6原RED→GREEN、半径-only旧失败反例变绿；真实8向/10/30/60矩阵与独立逐帧oracle，合法墙挡不算失败。

### Task 4：兼容/性能/累计交付
**Files:** R96范围报告/台账/版本说明；测试新增，不覆盖旧oracle。
- [ ] 域外方法/真实轨迹与R95逐值差分，Duixiu原trap点、NPC实际radius、地图/飞行、S/B重载、门内外边界；R95人物准备新门继续绿。
- [ ] 冷/热局部与完整108作息配对，scopeindex代数/clone无逐帧重建；保留p95/p99/max。
- [ ] 全current-state失败多重集、必要累计专项、三base/包身份、独立审查；冻结后交唯一上传器，不操作main。

## 2026-10-26 已批准累计范围扩展（独立模块，不混改）
用户明确将附近40m人物模型流式、皇帝太和↔中和路线纳入R96。顺序：
1. 当前养心局部身体修复先独立checkpoint/审核。
2. 人物模型40m关注区，外围预热/退出滞后；保留远处逻辑作息/位置、共享资源所有权；地图/飞行使用XZ地面关注与目的地预热，不以3D高度清空地面人物。仅实际绘制近处角色提交动态体，恢复必须避开玩家占位。
3. 皇帝日夜路线和相应座位一起改为太和↔中和，禁止遗留乾清座位瞬移。先读只读调研再写具体RED/工程参数。
4. 三模块分别绑定hash/证据，最终累计验收；R97仅剩余性能，不重复已做项。

### Task 5：模型驻留独立模块
Spec: `../specs/2026-10-26-r96-character-residency.md`。
先纯contact metrics等价RED→GREEN，再兴趣40/45/60/70与飞行120/180/220策略、Manager/System/Renderer/Queue小范围接入；保持DailyRoutine不变。实际位置、共享引用与取消、UI真实计数各写RED。家具源码冻结不动。完成独立check后再Task6。
### Task 6：皇帝中和终点
读取真实中和displaySetting/原路线前段，写新座位/路线接触与往返RED，再修改路线数据与日夜终点关联。保持时钟/速度/稳定ID与玩家占位合同。累计回归后统一R96发布。
