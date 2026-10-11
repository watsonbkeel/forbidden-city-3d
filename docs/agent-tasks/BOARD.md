# 任务板（总控维护）

> 状态：⬜ 未开始 · 🔵 进行中 · 🟡 待审 · ✅ 已合入 · ❌ 阻塞
> 每个任务卡的完整要求见同目录 `P*.md`；Agent 完成后把报告写到 `REPORTS/`。

## Phase 0（串行）
| ID | 任务 | 模型 | 分支 | 状态 | 备注 |
|---|---|---|---|---|---|
| P0 | 底座：米制坐标 + zone schema + ZoneManager + PerfHUD + perf 基线 | opus5.5 high | feat/p0-foundation | 🔵 | 首次执行中断（仅 23be8d6）；拆为 P0a→P0b→P0c。P0a ✅ c079f37（PerfHUD + 6 点基线）；P0b ✅ 11e9bb9（opus 半成品，总控补完：修 3 个阻塞 bug + 24 处数据错误，zone-equiv 全等、stepwalk 96/0、regression 24/24）；P0c 拆 P0c-1（锚点+重定位脚本+中轴常量）→ P0c-2（测试路线同步+全绿+合 main），任务卡 `P0c-relocate.md`；P0c-1 ✅ 344964a（两轮 opus：ff398c9 锚点表 147 条、eb3d458 重定位脚本、0a0833d 中轴真实米制、1c944eb 相机/地面/小地图、4a3d2a7 anchor-check；总控复核 build/zones/anchors 绿、截图无错位）；P0c-2 🔵 opus（测试坐标迁移+全绿） |
| P1-D | 测绘/内景资料（可与 P0 并行） | ~~kimi-k3~~ → gpt-6.1-sol | — | ✅ | kimi 两次 524 超时无产出，gpt 接手后完成：dimensions 380 行 + 6 殿内景 + sources，验收 4/4 |

## Phase 1（并行，P0 合入后启动）
| ID | 任务 | 模型 | 交叉审 | 分支 | 状态 |
|---|---|---|---|---|---|
| P1-R | 渲染性能：BatchedMesh / 阴影 / 遮挡 | sonnet5.5 | gpt-6.1-sol | feat/p1-render | ⬜ |
| P1-I | 内景管线：GLB loader + A 档模板 + 2 座 S 档样板 | sonnet5.5 | gpt-6.1-sol | feat/p1-interior | ⬜ |
| P1-U | 传送 / 快捷点 / 步速 / 位置提示 | gpt-6.1-sol | sonnet5.5 | feat/p1-ux | ⬜ |
| P1-T | 一键门禁 / 路线扩展 / 截图回归 | gpt-6.1-sol → glm-flash | — | feat/p1-tests | ⬜ |
| P1-Z-east-six | 东六宫 zone | glm-5.3 | opus 抽审 | feat/p1-zone-east-six | ⬜ |
| P1-Z-west-six | 西六宫 zone | glm-5.3 | opus 抽审 | feat/p1-zone-west-six | ⬜ |
| P1-Z-ningshou | 宁寿宫 zone | glm-5.3 | opus 抽审 | feat/p1-zone-ningshou | ⬜ |
| P1-Z-outer-east | 外东路 zone | glm-5.3 | opus 抽审 | feat/p1-zone-outer-east | ⬜ |
| P1-Z-outer-west | 外西路 zone | glm-5.3 | opus 抽审 | feat/p1-zone-outer-west | ⬜ |

## Phase 2（集成）
| ID | 任务 | 模型 | 状态 |
|---|---|---|---|
| P2-M | 按序合并：P1-T → P1-R → P1-U → P1-Z×5 → P1-I；每合一个跑 test:gate | 总控 + glm-flash | ⬜ |
| P2-A | 终审：架构一致性、死代码清理（删 SideCourts.js）、README 更新 | opus5.5 | ⬜ |
| P2-S | S 档内景扩展：养心殿 / 坤宁宫 / 皇极殿 / 慈宁宫 | sonnet5.5 | ⬜ |

## 合并顺序理由
P1-T 先合（门禁就位）→ P1-R（渲染底层，别人基于它测性能）→ P1-U（独立）→ 5 个 zone（内容）→ P1-I 最后（依赖 zone 里的 `interior` 字段齐全）。

## 启动一个 Agent 的标准话术
```
请读取 forbidden-city-3d/docs/ARCHITECTURE-1to1.md（控制文件）和
forbidden-city-3d/docs/agent-tasks/<任务卡>.md，严格按任务卡执行。
只改所有权清单里的文件；需要别的改动写到 docs/agent-tasks/REQUESTS.md。
完成后写 docs/agent-tasks/REPORTS/<任务ID>.md 并告诉我验收项逐条结果。
```
