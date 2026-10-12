# P2-A3：架构审查与清理

**目标**：完成 Phase 1 的架构一致性审查、死代码清理、README 更新，准备正式发布。

---

## 背景

Phase 1 完成了故宫核心区域的 1:1 复刻（中轴线、东西六宫、宁寿宫、外东西路）+ 内景管线。在正式发布前，需要：
- 检查架构一致性（是否有偏离控制文件的实现）
- 清理死代码和遗留文件
- 更新 README 和文档

---

## 任务清单

### A3-1：架构一致性审查

**审查清单**：

#### 1. 控制文件符合性
- 读取 `docs/ARCHITECTURE-1to1.md`
- 检查关键原则是否被遵守：
  - 坐标系：+Z 北 / -X 东，原点太和殿中心
  - 单位：米制
  - Zone schema：是否所有 zone 都符合 schema
  - 数据源：是否严格按 anchors.json 和 dimensions.md
  - 接口冻结：ZoneBase / CourtKit 签名是否稳定

#### 2. 数据一致性
- 运行 `npm run test:zones` 和 `npm run test:anchors`
- 检查是否有数据不一致的警告
- 对照 `docs/D1/anchors.json` 和 `docs/D1/dimensions.md`，抽查 3-5 个建筑的位置和尺寸

#### 3. 代码规范
- 检查是否有 console.log 或调试代码残留
- 检查是否有未使用的 import
- 检查是否有 TODO/FIXME 注释（整理成 issue 或文档）

**输出**：
- 审查报告（问题清单 + 改进建议）
- 如发现严重问题，在 REQUESTS.md 中记录

### A3-2：死代码清理

**已知死代码**：
- `src/scene/palace/SideCourts.js`（BOARD.md 明确提到要删除）

**清理步骤**：
1. 全局搜索 `SideCourts` 引用，确认无处使用
2. 删除文件
3. 搜索其他可能的死代码：
   - 未使用的工具函数
   - 未引用的常量
   - 废弃的测试文件

**验收标准**：
- `npm run build` 通过
- `npm run test:gate` 全绿
- 提交 message：`chore: 删除死代码 SideCourts.js`

### A3-3：README 更新

**待更新内容**：
1. **项目简介**：
   - 添加 Phase 1 完成的里程碑说明
   - 更新已完成区域列表（中轴线、东西六宫、宁寿宫、外东西路）
   - 添加内景系统简介

2. **技术栈**：
   - 确认依赖版本是否最新
   - Three.js r162 + Vite

3. **快速开始**：
   - 确认安装和运行步骤准确
   - 添加传送功能和快捷点使用说明

4. **测试与门禁**：
   - 添加 `npm run test:gate` 说明
   - 添加各个测试步骤的说明（zones / anchors / smoke / regression / stepwalk / perf）

5. **开发规范**：
   - 添加控制文件链接（ARCHITECTURE-1to1.md）
   - 添加任务板链接（BOARD.md）
   - 添加多 Agent 开发规范

**验收标准**：
- README.md 内容完整、准确
- 所有链接有效
- 提交 message：`docs: 更新 README（Phase 1 完成）`

### A3-4：性能分析与优化建议

**性能数据回顾**（P1 perf 结果）：
- Calls -46% ~ -78%（渲染优化显著）
- Tris -7% ~ -57%
- FPS 下降 33.7% ~ 42.3%（6 个场景，软渲染环境）

**分析任务**：
1. 识别 FPS 下降的主要原因：
   - 是否因为 BatchedMesh 批处理开销？
   - 是否因为阴影计算？
   - 是否因为场景复杂度提升？

2. 提出优化建议（不需要实现）：
   - LOD（Level of Detail）策略
   - 遮挡剔除改进
   - 材质合并
   - 其他优化方向

**输出**：
- 性能分析报告（包含优化建议）
- 写入 `docs/performance-analysis.md`

### A3-5：最终手动测试

**测试清单**：
1. **启动与加载**：
   - `npm run dev` 启动正常
   - 页面加载无错误
   - PerfHUD 显示正常

2. **核心功能**：
   - 移动和碰撞检测正常
   - 传送功能正常（测试 3-5 个快捷点）
   - 内景加载正常（太和殿、乾清宫）

3. **区域巡查**：
   - 中轴线（午门→太和门→御花园→神武门）
   - 东六宫（随机选 2 个宫院）
   - 西六宫（随机选 2 个宫院）
   - 宁寿宫（九龙壁→皇极门→宁寿宫）
   - 外东路（文华殿→文渊阁）
   - 外西路（随机选 1-2 处）

4. **性能观察**：
   - FPS 是否稳定（记录典型场景 FPS）
   - 是否有卡顿或闪烁

**输出**：
- 手动测试报告（问题清单 + 截图）
- 写入报告中

---

## 所有权清单

**允许修改**：
- `README.md`
- `src/scene/palace/SideCourts.js`（删除）
- 其他死代码文件（如确认无用）

**允许创建**：
- `docs/performance-analysis.md`

**只读**：
- `docs/ARCHITECTURE-1to1.md`
- `docs/agent-tasks/BOARD.md`
- 所有 src/ 下的业务代码（只读审查）

---

## 验收项

1. ✅ 架构一致性审查报告
2. ✅ 死代码清理（SideCourts.js 等）
3. ✅ README.md 更新
4. ✅ 性能分析报告（docs/performance-analysis.md）
5. ✅ 最终手动测试报告
6. ✅ test:gate 全绿（8/8）
7. ✅ 完成报告 docs/agent-tasks/REPORTS/P2-A3-audit.md

---

## 注意事项

1. **架构审查重点是"发现问题"，不是"立即修复"**。如发现需要跨文件改动的问题，写到 REQUESTS.md
2. **死代码清理要谨慎**，每次删除前确认无处引用，删除后运行门禁
3. **README 更新要面向新用户**，确保内容清晰易懂
4. **性能分析要客观**，基于实际数据，避免主观臆断
5. **手动测试要覆盖关键场景**，发现的 bug 记录在报告中（不强制修复，可留给后续 Phase）
