# 任务板（总控维护）

> 状态：⬜ 未开始 · 🔵 进行中 · 🟡 待审 · ✅ 已合入 · ❌ 阻塞
> 每个任务卡的完整要求见同目录 `P*.md`；Agent 完成后把报告写到 `REPORTS/`。

## Phase 0（串行）
| ID | 任务 | 模型 | 分支 | 状态 | 备注 |
|---|---|---|---|---|---|
| P0 | 底座：米制坐标 + zone schema + ZoneManager + PerfHUD + perf 基线 | opus5.5 high | feat/p0-foundation | ✅ | 首次执行中断（仅 23be8d6）；拆为 P0a→P0b→P0c。P0a ✅ c079f37（PerfHUD + 6 点基线）；P0b ✅ 11e9bb9（opus 半成品，总控补完：修 3 个阻塞 bug + 24 处数据错误，zone-equiv 全等、stepwalk 96/0、regression 24/24）；P0c 拆 P0c-1（锚点+重定位脚本+中轴常量）→ P0c-2（测试路线同步+全绿+合 main），任务卡 `P0c-relocate.md`；P0c-1 ✅ 344964a（两轮 opus：ff398c9 锚点表 147 条、eb3d458 重定位脚本、0a0833d 中轴真实米制、1c944eb 相机/地面/小地图、4a3d2a7 anchor-check；总控复核 build/zones/anchors 绿、截图无错位）；P0c-2 ✅ e08ef33（stepwalk 33 路线 132/132、regression 24/24、修 2 处院门夹道封死、perf-p0c 基线）。**main 快进到 e08ef33，tag p0-done** |
| P1-D | 测绘/内景资料（可与 P0 并行） | ~~kimi-k3~~ → gpt-6.1-sol | — | ✅ | kimi 两次 524 超时无产出，gpt 接手后完成：dimensions 380 行 + 6 殿内景 + sources，验收 4/4 |

## Phase 1（并行，P0 合入后启动）
> 先读 `P1-COMMON.md`（覆盖各任务卡中 P0 之前写的过时条目：测试端口、数据源规则、测试文件所有权、新增 P1-Z-axis）。
> 机器 10 核 16G，浏览器测试为软渲染：分两波启动。第一波 T/R/U/I/Z-axis，第二波 Z×5。
> **双总控分工（10-12 11:25 起）**：P1-R、P1-I 由另一对话总控负责启动/续跑/验收，本对话不再派 agent、不碰 fc-render / fc-interior。P1-T、P1-U、P1-Z-axis 及后续 Z×5 由本对话负责。合入 main 统一由本对话按序执行（T → R → U → Z-axis → Z×5 → I），另一对话验收完 R/I 后在本表把状态改为「🟡 待合并」即可。两边改 BOARD.md 只改自己负责的行，避免冲突。
| ID | 任务 | 模型 | 交叉审 | 分支 | 状态 |
|---|---|---|---|---|---|
| P1-R | 渲染性能：BatchedMesh / 阴影 / 遮挡 | ~~sonnet5.5 → glm-5.3~~ → gpt-6.1-sol（用户 10-12 11:05 指定） | sonnet5.5（原交叉审 gpt 已改为执行） | feat/p1-render | ✅ 已合入 main 938109e |
| P1-I | 内景管线：GLB loader + A 档模板 + 2 座 S 档样板 | sonnet5.5（I-1~I-3）→ 总控接手（I-4 + 门禁） | gpt-6.1-sol | feat/p1-interior | 🟡 待合并 @ b69c188（12:45）。sonnet 完成 I-3 后被杀，总控接手：太和殿 40.8k tris / 乾清宫 33.4k tris，各 0.26 / 0.23 MB；门禁 build/zones/anchors/smoke/regression 24/24/stepwalk 132/132/perf 全绿；p1i-loader 两殿 PASS、p1i-presets PASS。REPORTS/P1-I.md 已写。**合并时需顺手接 main.js**（REQUESTS 第 1 条） |
| P1-U | 传送 / 快捷点 / 步速 / 位置提示 | gpt-6.1-sol（10-12 opus 503 后用户改回） | sonnet5.5 | feat/p1-ux | ✅ 已合入 main a894d5c |
| P1-T | 一键门禁 / 路线扩展 / 截图回归 | ~~gpt-6.1-sol → glm-flash~~ → opus5.5（用户 10-12 指定） | — | feat/p1-tests | ✅ 已合入 main 1fa53ec（T-1~T-5 完成，报告 d84be47） |
| P1-Z-axis | 中轴与宫城外围：午门/太和门/御花园内部/金水桥/角楼 | opus5.5 | sonnet 抽审 | feat/p1-zone-axis | ✅ 已合入 main a4f893d（A1–A6）；R1 Collision 改法 / R3 stepwalk 御花园路线待处理 |
| P1-Z-east-six | 东六宫 zone | glm-5.3 | opus 抽审 | feat/p1-zone-east-six | ✅ 已合入 main 6c07fef（总控代提交 a17ab91；越界改动 package.json/tests/shot.cjs 未合入） |
| P1-Z-west-six | 西六宫 zone | glm-5.3 | opus 抽审 | feat/p1-zone-west-six | ✅ 已合入 main 6356eb3 |
| P1-Z-ningshou | 宁寿宫 zone | glm-5.3 | opus 抽审 | feat/p1-zone-ningshou | ✅ 已合入 main 0e84718 |
| P1-Z-outer-east | 外东路 zone | glm-5.3 | opus 抽审 | feat/p1-zone-outer-east | ✅ 已合入 main 220e418 |
| P1-Z-outer-west | 外西路 zone | glm-5.3 | opus 抽审 | feat/p1-zone-outer-west | ✅ 已合入 main（P2-M 早期） |

## Phase 2（集成）
| ID | 任务 | 模型 | 状态 |
|---|---|---|---|
| P2-M | 按序合并：P1-T → P1-R → P1-U → P1-Z-axis → P1-Z×5 → P1-I；每合一个跑 test:gate | 总控 | ✅ 全部完成（标签 p1-done @ 7166826） |
| P2-A | 终审：架构一致性、死代码清理、README 更新、修复已知问题 | opus5.5 | ⬜ 待启动 |
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
