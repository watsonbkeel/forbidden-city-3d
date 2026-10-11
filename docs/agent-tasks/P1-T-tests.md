# P1-T · 测试工具链（推荐模型：gpt-6.1-sol high 设计 / glm-5.3-flash 执行）

> 前置：P0 已合入 main。
> worktree：`git worktree add ../fc-p1-tests -b feat/p1-tests`

## 所有权文件
- `tests/*`
- `package.json` **仅允许**新增 `scripts.test:*` 条目
- `docs/TESTING.md`（新建）

## 任务
### T-1 一键门禁 `npm run test:gate`
- 顺序执行：`zone-lint` → `smoke` → `regression` → `stepwalk 60,10 0,1 all` → `perf`（与 baseline 比较）
- 任一失败立即退出非 0；输出汇总表。
- perf 比较规则：任一机位 calls 或 tris 劣化 > 10%、fpsP5 下降 > 15% → 失败。

### T-2 stepwalk 路线扩展
- 为 5 个新区各加 2 条路线（从区门进 → 主殿 → 出），路线坐标从 zone JSON 读取 hall 位置自动生成，避免硬编码。
- 增加"跨区行走"路线：中轴 → 东六宫 → 宁寿宫 → 回中轴，验证 ZoneManager 加载/卸载时碰撞不丢。

### T-3 zone-lint 增强
- 在 P0 版本基础上加：相邻区 bounds 相接无缝隙/重叠；每个 `enter: true` 的 hall 的门前 2m 内无其他碰撞体。

### T-4 截图回归
- `tests/visual.cjs`：固定 12 机位截图到 `tests/visual/<branch>/`，与 `tests/visual/main/` 做像素差异（阈值 2%），输出差异图。

### T-5 `docs/TESTING.md`
- 所有脚本用法、机位坐标表、如何更新 baseline、CI 接入建议。

## 验收
- [ ] 在 main 上 `npm run test:gate` 全绿
- [ ] 故意把一个 hall 坐标移到墙里，`test:gate` 能在 zone-lint 或 stepwalk 阶段抓到
- [ ] `docs/agent-tasks/REPORTS/P1-T.md`

## 禁止
- 不改 `src/` 任何文件；发现 bug 写 `docs/agent-tasks/REQUESTS.md`
