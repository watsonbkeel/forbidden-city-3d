# P1-R · 渲染性能（推荐模型：sonnet5.5 high；交叉审：gpt-6.1-sol）

> 前置：P0 已合入 main。控制文件 `docs/ARCHITECTURE-1to1.md` 第 1.3 节渲染预算。
> worktree：`git worktree add ../fc-p1-render -b feat/p1-render`

## 所有权文件（只能改这些）
- `src/render/*`（PostProcessing.js、ShadowSetup.js、新建文件）
- `src/utils/MergeUtils.js`、`src/utils/InstancedMeshPool.js`
- `src/scene/zones/ZoneBase.js` **仅允许**：在 build() 末尾接入 BatchedBuilder；不改签名
- `tests/perf.cjs`（只加采样点，不改输出格式）

## 任务
### R-1 BatchedMesh 替代 mergeByMaterial
- 新建 `src/render/BatchedBuilder.js`：输入一组同材质 mesh，输出 `THREE.BatchedMesh`（r162 原生）。
- 优势：保留每个建筑的独立 bounding sphere → frustum cull 按建筑而非按区；可 `setVisibleAt(id, false)` 做遮挡。
- 保留 `mergeByMaterial` 作为 BatchedMesh 不支持的情况（如需要独立 UV 变换）的回退。
- ZoneBase.build() 末尾：对 group 内静态 mesh 调 BatchedBuilder。

### R-2 阴影收敛
- `ShadowSetup.js`：方向光阴影相机跟随玩家，正交 frustum 半径高画质 120m / 低画质 60m；`shadow.camera` 每帧更新位置，`updateShadowLOD` 保留。
- 远处（> 半径）mesh `castShadow=false`；silhouette 替身永不投影。
- 目标：阴影 pass draw calls ≤ 主 pass 的 40%。

### R-3 宫墙遮挡（区块级）
- 新建 `src/render/OcclusionByWall.js`：
  - 输入：ZoneManager 的各区 bounds + 玩家位置 + 相机朝向
  - 规则：玩家在某区宫墙内时，**不相邻且不在视锥方向**的区直接 `group.visible=false`（只留 silhouette）
  - 每 200ms 评估一次，避免每帧开销
- 简单可靠优先，不做像素级 occlusion query。

### R-4 分帧构建协作
- 与 ZoneManager 的分帧构建配合：BatchedMesh 的 `addGeometry` 也走时间切片。

## 验收
- [ ] `tests/perf.cjs` 6 点对比 P0 基线：draw calls 下降 ≥ 50%，fps 不降
- [ ] 太和殿前机位（最重）：calls ≤ 300、tris ≤ 1.5M（高画质）
- [ ] stepwalk + regression 全绿
- [ ] 视觉对比：用 `tests/shot.cjs` 在 6 点截图，与 P0 截图肉眼无差异（阴影边缘允许细微不同）
- [ ] `docs/agent-tasks/REPORTS/P1-R.md`：前后数据表、每项优化的贡献、遗留

## 禁止
- 不改 zone JSON、不改 CourtKit/HallKit/RoofBuilder 几何生成逻辑
- 不引入新 npm 依赖
