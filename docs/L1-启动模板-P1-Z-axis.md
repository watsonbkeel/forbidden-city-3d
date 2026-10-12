# [L1] P1-Z-axis 任务对话启动模板

**时间**：2026-10-12 16:35  
**任务**：P1-Z-axis 中轴与宫城外围  
**模型**：opus5.5 high  
**工作目录**：`/Users/watson/Documents/Codex/故宫/fc-zone-axis`  
**分支**：feat/p1-zone-axis @ b2ab225  
**状态**：A1–A5 已完成，剩 A6 验收

---

## 启动指令（复制到新对话窗口）

```
你是 P1-Z-axis 任务 Agent。

### 当前状态
- 分支 feat/p1-zone-axis @ b2ab225（worktree fc-zone-axis）
- 已完成：A1 午门、A2 太和门、A3 金水桥、A4 角楼、A5 御花园
- 剩余：A6 验收（6 项验收条件）

### 任务
请读取以下文件理解任务：
1. /Users/watson/Documents/Codex/故宫/forbidden-city-3d/docs/ARCHITECTURE-1to1.md（控制文件）
2. /Users/watson/Documents/Codex/故宫/forbidden-city-3d/docs/agent-tasks/P1-Z-zones.md（任务卡模板）
3. /Users/watson/Documents/Codex/故宫/forbidden-city-3d/docs/agent-tasks/P1-COMMON.md（公共约定）
4. /Users/watson/Documents/Codex/故宫/fc-zone-axis/docs/agent-tasks/REQUESTS.md（跨任务请求）

### 工作目录
cd /Users/watson/Documents/Codex/故宫/fc-zone-axis

### A6 验收要求（来自 P1-Z-zones.md）
- [ ] zone-lint 全绿
- [ ] 本区所有 enter: true 的殿能走进去
- [ ] 3 张截图：院落全景、正殿近景、从邻区看过来的屋顶群
- [ ] docs/agent-tasks/REPORTS/P1-Z-axis.md：建筑清单（名称/尺寸/来源）、estimated 项列表、遗留
- [ ] stepwalk 自动路线通过（如果 P1-T 已合并）
- [ ] 对照 REQUESTS.md 中的 R3，确认御花园四亭路线问题已记录

### 注意
- **只改所有权清单内的文件**：data/zones/axis-courts.json, data/zones/garden.json, src/scene/zones/（如需）
- 需要跨文件改动写到 docs/agent-tasks/REQUESTS.md
- 完成后写 docs/agent-tasks/REPORTS/P1-Z-axis.md
- P1-T (test:gate) 已在 main 分支，本分支未合并，需要手动验证或等合并

### 开始工作
现在执行 A6 验收，逐项检查并输出结果。
```

---

## 对话命名
`[P1-Z-axis] 中轴与外围`

## 固定到侧边栏
是

## 记录到 L0 日志
启动时间：2026-10-12 16:35  
对话链接：（用户粘贴启动后记录）  
预计完成：2026-10-12 18:00
