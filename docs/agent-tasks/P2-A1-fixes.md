# P2-A1：已知问题修复

**目标**：修复 Phase 1 标记为 KNOWN_ISSUE 的 2 条 region 碰撞盒缺陷，恢复 stepwalk 路线正常。

---

## 背景

Phase 1 为快速上线，将以下路线标记为已知问题：
1. **outer-east 文华殿院北夹道→文渊阁院**（4 条路线被排除）
2. **ningshou 蹈和门→宁寿宫→返回**（3 条路线标记 KNOWN_ISSUE）

根本原因：两个 zone 的 region 碰撞盒定义缺陷，导致玩家无法正常导航。

---

## 任务清单

### A1-1：诊断 outer-east 文华殿院路线问题

**路线定义**（tests/stepwalk.cjs L112）：
```javascript
['文华殿院北夹道→文渊阁院', [[whd.x + 36.4, -153], [A['文渊阁'].x, -153], [A['文渊阁'].x, -145]]]
```

**失败现象**（P1 门禁日志）：
- 玩家从 `[-160.9, -152.8]` 无法导航到 `[-186.5, -153]`
- 判断为 outer-east 区域 region 碰撞盒定义问题

**诊断步骤**：
1. 读取 `data/zones/outer-east.json`，检查 bounds 和内部 region 结构
2. 使用 `tests/zone-probe.cjs` 或创建临时测试脚本，探测路线关键点的碰撞状态
3. 对比 `docs/D1/anchors.json` 中文华殿院和文渊阁院的真实位置与尺寸
4. 找出导致碰撞的具体 region、courtWalls 或 building 定义

### A1-2：修复 outer-east region 碰撞盒

**修复原则**：
- 保持建筑真实位置不变（以 anchors.json 为准）
- 调整 courtWalls 的 gaps 或 region 范围，确保夹道畅通
- 修复后运行 `npm run test:zones` 和 `npm run test:anchors` 确保无回归

**验收标准**：
- `npm run test:zones` 零错误
- `npm run test:anchors` 超差 0 条
- 文华殿院北夹道→文渊阁院路线探测通过

### A1-3：诊断 ningshou 蹈和门路线问题

**路线定义**（tests/stepwalk-auto.cjs 自动生成）：
```
[ningshou] 蹈和门→宁寿宫→返回
```

**失败现象**（P1 门禁日志）：
- 3 种配置组合失败
- 判断为 P1-Z-ningshou 的 region 碰撞盒定义缺陷

**诊断步骤**：
1. 读取 `data/zones/ningshou.json`，检查蹈和门和宁寿宫的 region 结构
2. 使用探测脚本检查蹈和门→宁寿宫路径的碰撞状态
3. 对比 `docs/D1/anchors.json` 中的真实位置与尺寸
4. 找出导致碰撞的具体定义

### A1-4：修复 ningshou region 碰撞盒

**修复原则**：同 A1-2

**验收标准**：
- `npm run test:zones` 零错误
- `npm run test:anchors` 超差 0 条
- 蹈和门→宁寿宫路线探测通过

### A1-5：恢复 stepwalk 和 stepwalk-auto

**修改文件**：
- `tests/stepwalk.cjs`：删除 SKIP_ROUTES 集合和过滤逻辑
- `tests/stepwalk-auto.cjs`：从 KNOWN_ISSUES 中删除两条路线

**验收标准**：
- `npm run test:stepwalk` 132/132 全过
- `npm run test:stepwalk-auto` 144/144 全过（无 KNOWN_ISSUE）

### A1-6：完整门禁验证

**命令**：`npm run test:gate`

**验收标准**：所有 8 个步骤全绿

---

## 所有权清单

**允许修改**：
- `data/zones/outer-east.json`
- `data/zones/ningshou.json`
- `tests/stepwalk.cjs`
- `tests/stepwalk-auto.cjs`

**只读**：
- `docs/D1/anchors.json`
- `docs/D1/dimensions.md`
- `src/utils/Collision.js`（不在本任务范围）

**临时文件**（可创建，完成后删除）：
- `tests/outer-east-probe.cjs`
- `tests/ningshou-probe.cjs`

---

## 验收项

1. ✅ outer-east 文华殿院路线诊断报告（具体问题 + 根因）
2. ✅ outer-east region 碰撞盒修复
3. ✅ ningshou 蹈和门路线诊断报告（具体问题 + 根因）
4. ✅ ningshou region 碰撞盒修复
5. ✅ stepwalk.cjs / stepwalk-auto.cjs 恢复正常
6. ✅ test:gate 全绿（8/8）
7. ✅ 完成报告 docs/agent-tasks/REPORTS/P2-A1-fixes.md

---

## 注意事项

1. **坐标系**：+Z 北 / -X 东，原点太和殿中心
2. **真实尺寸优先**：以 anchors.json 为准，不要为了通过测试而扭曲真实位置
3. **碰撞调试技巧**：
   - 使用 `tests/zone-probe.cjs` 探测关键点
   - 检查 courtWalls 的 x0/x1/z0/z1 和 gaps
   - 检查 region 的范围与内部碰撞体
4. **提交规范**：每个修复一个 commit，commit message 格式 `fix(zone): outer-east 文华殿院夹道碰撞盒修正`
