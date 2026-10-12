# L1 对话启动：P2-S S 档内景扩展

**任务卡**：`docs/agent-tasks/P2-S-interior.md`（细节全在里面，启动文档只负责开对话）
**基线**：标签 `p2a-done` + 任务卡提交，门禁 8/8
**环境（L0 已建好并验证）**：

| 项 | 值 |
|---|---|
| worktree | `/Users/watson/Documents/Codex/故宫/fc-interior-s` |
| 分支 | `feat/p2-interior-s` |
| 端口 | 5191 |
| node_modules | 软链接到主仓，已排除跟踪，不要 `npm install` |
| 烟测 | `p1i-loader taihe` 在新 worktree 已 PASS |

## 为什么拆成两个对话

上次 P1-I 做两座殿时，Agent 在第 3 步因上下文耗尽被中断。这次是四座殿，外加一个风险最高的接线步骤，所以按 L1 预算（≤200k）拆成两段，**串行**执行，用同一个 worktree：

| 对话 | 范围 | 结束条件 |
|---|---|---|
| **P2-S1** | S-0 接线 + 皇极殿 + 养心殿 | 三个提交 + 门禁 8/8 + 报告前半 |
| **P2-S2** | 坤宁宫 + 慈宁宫 + 收尾 | 门禁 8/8 + 报告完整 |

S1 回到 L0 验收后再开 S2。S-0 接线如果失败（停止条件），S1 直接停，不开 S2。

推荐模型：sonnet5.5（BOARD 原定）。S-0 若卡住超过 3 轮，按多对话规则开 L2 诊断。

---

## 对话 1：P2-S1（复制下面整段）

```
你是 P2-S1 任务的执行 Agent（L1 对话），只在 worktree /Users/watson/Documents/Codex/故宫/fc-interior-s（分支 feat/p2-interior-s，端口 5191）里工作。

先读：
1. docs/agent-tasks/P2-S-interior.md（任务卡，§0 的三条前置核查必须先看懂）
2. docs/agent-tasks/P1-COMMON.md
3. docs/agent-tasks/REPORTS/P1-I.md（§2 管线、§5 新增殿步骤）
4. data/interiors/schema.md

本对话范围：任务卡 §4 的 S-0（main.js 接线）+ S-1 皇极殿 + S-2 养心殿。坤宁宫、慈宁宫留给下一个对话，不要做。

硬性要求：
- S-0 先做，全量 test:gate 8/8 之后才能开始做殿；失败按任务卡 §6 停下写报告
- 只改任务卡 §3 列出的文件；需要改别的写 docs/agent-tasks/REQUESTS.md
- 每个子任务一个提交；不合并 main、不打标签、不推送
- 浏览器测试每条命令都带 env -u http_proxy -u https_proxy -u HTTP_PROXY -u HTTPS_PROXY NO_PROXY=127.0.0.1,localhost
- 结束时写 docs/agent-tasks/REPORTS/P2-S.md（S-0、皇极殿、养心殿三节 + 门禁结果表），并在报告末尾列出给 P2-S2 的交接事项

开始：先读任务卡，用三五句话复述 §0 的三条前置核查和你的执行顺序，然后从 S-0 开始。
```

---

## 对话 2：P2-S2（S1 验收通过后再用）

```
你是 P2-S2 任务的执行 Agent（L1 对话），在 worktree /Users/watson/Documents/Codex/故宫/fc-interior-s（分支 feat/p2-interior-s，端口 5191）继续 P2-S。

先读：
1. docs/agent-tasks/P2-S-interior.md（任务卡）
2. docs/agent-tasks/REPORTS/P2-S.md（P2-S1 的报告，尤其末尾的交接事项）
3. git log --oneline p2a-done..HEAD（确认 S-0、皇极殿、养心殿已提交）
4. docs/research/interiors-kunning.md、docs/research/interiors-cining.md

本对话范围：任务卡 §4 的 S-3 坤宁宫 + S-4 慈宁宫 + 收尾。

硬性要求：
- 先跑一次 test:gate 确认起点是 8/8，不是就停下报告
- 坤宁宫不是宝座殿，不要套 throne_hall.py；p1i-visual 读 throne 字段的问题按任务卡处理
- 慈宁宫原状资料低置信，JSON 的 source 注明推断，报告里单列置信度
- 只改任务卡 §3 列出的文件；不合并 main、不打标签、不推送
- 浏览器测试每条命令都带 env -u http_proxy -u https_proxy -u HTTP_PROXY -u HTTPS_PROXY NO_PROXY=127.0.0.1,localhost
- 结束时把坤宁宫、慈宁宫两节和最终门禁结果补进 docs/agent-tasks/REPORTS/P2-S.md

开始：先确认起点状态（提交 + 门禁），再从坤宁宫开始。
```

---

## 回到 L0 验收时带什么

在本总控对话说「P2-S1 完成」或「P2-S2 完成」即可，L0 会自己核查：
- `git log p2a-done..feat/p2-interior-s` 的提交与所有权
- 在 worktree 重跑全量门禁
- 看 `outputs/dev/p1i-<id>-*.png` 对比截图
- 读 `REPORTS/P2-S.md`
