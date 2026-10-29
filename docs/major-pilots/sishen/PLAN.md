# 四神祠有限整对象 Implementation Plan
> For agentic workers: use superpowers:executing-plans. Single writer in existing worktree; no main/deploy.

**Goal:** 在原文FC-492344B85B位置补八角主体、北抱厦、廊栏与前阶，关闭与原西井绕行及一棵原柏树的全身源面安全问题。
**Architecture:** 独立ZoneBase profile/builder；可见轴向盒采用精确F32源盒，其余几何采用有限命名真实三角源。严格小域和真实Environment地面见证；不改共享运动算法。地面只切实际有限新铺装，去除与已存西井铺装重叠；34树实例buffer/矩阵保持。
**Tech Stack:** 当前Three.js / JavaScript ES modules / node:test。
**Spec:** RECON.md；尺寸、曲率、未见隐藏面属于工程拟合，wholeObjectAccepted=false，不复制官方图到纹理。

## Decisions / alternatives
- 摛藻堂邻接尚有北墙/浮碧阶争议：只保留调查；不挪它来过测试。
- 四神祠采用官刊图+正面官照+西井北侧官方全景R/B完整侧视；不省略北抱厦，不做单匾小补丁，不虚构室内供案/神像/现代陈设。
- 暂定八角主体中心(30.3,463.8)，至少±1m图拟合不确定度；主体台基外接半径3.6，北抱厦宽等于八角台基北边2×3.6×sin(pi/8)，延伸至局部z4.8；北侧三阶至z6，主檐半径3.8，尺寸均可在原图复核后调整，绝不按绿测缩形。

## Global constraints
保留71a9d7a5所有原源；仅允许四神祠局部铺装/床裁剪及真实冲突柏树的源物理替代，需红证据。西井原32绕行与32树体接近不变、邻域96轨迹对照；不把全部历史snapshot变绿作为删除旧断言的理由。未知GPU/实机明确未验。

## Review focus
- 北抱厦朝向与平台/屋盖相交、闭壳；未见后侧细雕不装成确证。
- 真树枝/新屋顶静交与高位步离；全height真实源而非3m代理。
- 新铺装与西井旧铺装不能叠面或重切旧树随机序列。
- 前阶/廊栏/门窗处完整身体在10/60Hz步行跑跳/下落不穿透，闭门不生造室内路线。
- 重复注册、晚失败回滚、卸载重载、私有资源释放，不能留下隐形物理。

### Task 1: 全高邻接、独立注册和完整可见对象
Files: scripts/major-pilots/sishen/preflight.mjs; src/scene/palace/special/SishenShrine.js; src/scene/zones/ZoneBase.js; data/zones/garden.json; tests/major-pilots/sishen/geometry.test.mjs.
- [x] 保存现父全height注册与实际可见源普查；读完整官刊符号和照片，不仅靠metadata。
- [x] 红测：profile独立整对象、八角主体+北抱厦+北阶、无通用斗栱、无虚构可进入内室，anchor精确且拒绝变形。
- [x] 实现 `sishenGeometry(zone)` 与 `buildSishenShrine(kit,zone)`，只用源证支持的整体关系，其余写入unverified。
- [x] 绿测形体、F32源face逐点一致、闭壳/没有无证屋面空洞。

### Task 2: 完整源运动与可见地面
Files: src/controls/SishenSupport.js, SishenEnvironmentWitness.js; src/scene/garden/SishenGroundFit.js; narrow hooks FurnitureMotion/XiqingRoofSurface/Collision/ZoneManager/tests/lib/world; tests/major-pilots/sishen/{source,motion,lifecycle}.test.mjs.
Interfaces: SISHEN_REGION; validateSishenScope(input,ownerBox,region); bind/unbindSishenEnvironmentWitness; clipSishenBedRectangle(rect).
- [x] 红测前阶全身、上下廊、闭门回退、上屋盖落体、.3/.5 bodies跨4边界；持有真实source而非宽AABB。
- [x] 最小实现命名source/有限域/真实地面见证及地面裁剪，不改全局solver。
- [x] 在真实World复跑西井/邻居；失败优先查实际源与初始姿态，不削断言。

### Task 3: 原树真枝闭合（仅在证实动态缺口后）
Files: scripts/major-pilots/sishen/tree-motion.mjs; optional SishenTreeSource.js + GardenBuilder exact-instance hook; tests/major-pilots/sishen/tree-source.test.mjs.
- [x] 按真实instance7的可见trunk face逐帧测试，保存缺口红证据；不得凭低AABB断言无风险。
- [x] 如必要，只替换该柏树原低AABB为完整F32原三角；真bounds+.6m全部在严格域内，保留全部34树可见数据/随机消费。
- [x] 静交、地面接近、树顶四向持续行进/跳跃至合法终态均检查；不称预置可达性已证明。

### Task 4: 保留、回滚与验证
- [x] 逐父比对全garden非目标geometry/material/UV/physics、34树buffer、两处profile独立及组合生命周期。
- [x] 专项→西井/东井→共享运动/地形/input/住宅→root build串行单worker，保留历史失败并在真实父版复放。
- [x] 独立只读复核，修所有作用域内问题，有限候选commit和小报告；仍不部署/main，GPU/实机不虚报。


Progress 19:06 UTC: tasks 1–3 have WIP implementations and 20 focused passing tests. Task 4 remains open: actual whole-world local paths, high-tree terminal coverage, 96 parent/candidate neighbour diff, broad regression/build and independent review. Not release-ready. Exact red/green tree evidence is disambiguated in RECON.

19:15 UTC: official front photo review corrected paired short front rails and continuous sloping cheeks; source frozen. Whole-world 32 local routes passed; build-final passed. 76 narrow regression has 5 explicitly classified historical snapshot failures, no claim of aggregate green. Full-height tree oracle and broad historical replay still running; independent review requested.

19:34 UTC: final gate closed; focused27/27, merged F32 and actual combined garden-zone streaming verified, 32 local routes +32 tree approaches +16 high exits use full-body406-source oracle. Root build passes. Historical aggregate1257/1039/218 remains red with all failure identities accounted for; isolated Zhaode75/74/1 on both parent/candidate. Bounded local checkpoint only; no GPU/device/whole-object or release acceptance. See validation-summary.json.
