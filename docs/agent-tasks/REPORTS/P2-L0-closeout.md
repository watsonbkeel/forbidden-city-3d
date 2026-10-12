# P2-L0 收尾报告：P2-A 系列核查与合并

**日期**：2026-10-13　**执行**：L0 总控（小B）　**标签**：`p2a-done`

## 核查结论

| # | 问题 | 另一 AI 是否已处理 | L0 处置 |
|---|---|---|---|
| 1 | R1 金水桥桥位（1feceed 悬空，未进 main） | ✅ 已补落 65135dd，`Collision.js:4,183` 已改读 `river.isOnBridge` | 跳过，已复核 |
| 2 | BOARD 中 P2-A2/A3 状态滞后、BOARD 未提交 | ✅ 已在 7d67745 校正并提交 | 跳过 |
| 3 | `feat/p1-zone-outer-west` 2 个提交未合（BOARD 误标已合入） | ❌ 未处理 | 补合 2c5bb35 |
| 4 | P2-A 改动叠加后 main 未跑过完整门禁 | ❌（复核报告只跑了分项，未跑 perf / stepwalk-auto） | 全量 test:gate |
| 5 | 本地领先 origin 20+ 提交未推送 | ❌ | 推送 main + 标签 |

## 外西路补合后暴露的问题（stepwalk-auto 141/152，失败 11 条 = 3 路线 × 档位）

| 路线 | 根因 | 修复（11d1112 / e9366ca） |
|---|---|---|
| 武英门→浴德堂 | 凝道殿/焕章殿 `rot=west/east` 时宽深写反（w 应为面阔），殿身伸出院墙 7 m、堵死院内东西两侧 | 按 D1 互换：w=27.4/26.7，d=12.3/10.2 |
| 揽胜门→咸若馆 | 揽胜门在花园东墙（xmin 侧）却缺 `rot`，门洞朝南北，院墙未开口 | 补 `rot: "east"`（同遵义门写法） |
| 武英门→敬思殿 | ① 武英殿 `backDoor` 在细化时丢失，工字殿前殿不贯通；② 路线生成器只认台明相接的工字殿 | ① 补回 `backDoor: true`；② `auto-routes.mjs` 增加「前殿挡路且无法侧绕 → 穿前殿」分支，38 条路线中仅此条变化 |

## 最终门禁（运行时工作区代码与 e9366ca 一致；之后仅文档提交）

| build | zones | anchors | smoke | regression | stepwalk | stepwalk-auto | perf |
|---|---|---|---|---|---|---|---|
| ✅ | ✅ 0 错 23 警告 | ✅ 113 条超差 0 | ✅ colliders 6560 | ✅ 24/24 | ✅ 132/132 | ✅ 152/152 | ✅ 无劣化 |

> 浏览器测试需绕开系统代理：`env -u http_proxy -u https_proxy NO_PROXY=127.0.0.1,localhost npm run test:gate`

## 遗留（不阻塞 P2-S）

1. `tests/stepwalk-auto.cjs:27` 把 `knownIssues: {}` 写死，L14 的 `KNOWN_ISSUES` 表实际不生效。当前表为空不影响结果，但将来登记已知问题时需改为传入 `KNOWN_ISSUES`。
2. 文渊阁院南入口 12 m 临时洞口（`source: interim`），待按 D1 补「方池石桥」（REQUESTS 低优先级）。
3. perf fps 警告属软渲染环境波动，calls/tris 无劣化。
