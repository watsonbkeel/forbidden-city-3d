# P1-T · 测试工具链 报告

> 分支 `feat/p1-tests`（worktree `fc-tests`，起点 main 3ffd181），端口 5181。只改 tests/*、package.json scripts.test:*、docs/TESTING.md、本报告、REQUESTS.md「## P1-T」小节。

### 进度
- T-3 ✅ zone-lint 增强：新增 `tests/lib/world.mjs`（node 里用真实 ZoneBase/CourtKit/PalaceBuilder/Enclosure/GardenBuilder + CollisionManager 建出全场景碰撞世界，~1 s）；zone-lint 加 (7) bounds 重叠=错/相邻缝隙=警告/neighbors 引用与单向，(8) 每座门两侧：门洞中心被占=错、出门净空 <1.5 m=错 <4 m=警告、出门 12 m 内封闭死角=错，(9) enter 殿前/后门门前 2 m：中线走不进殿=错、2 m 内有其他构件但中线可走=警告；`--no-geo`、`ZONES_DIR` 选项。当前 main 数据：0 错 25 警告。回放 P0c-2 两处旧缺陷（养心殿院 z1 302、文华殿院 z1 −152）→ 3 错（永寿门/太极门/文渊阁院门 被封死）。 — 4d31a89
- T-1 ✅ `npm run test:gate` = `tests/gate.cjs`：自起停 vite（PORT，默认 5181，strictPort，端口被占直接报错不误杀）→ build（/tmp/fc-build-gate-<PORT>）→ zones → anchors → smoke → regression（失败自动重试 1 次）→ stepwalk 60,10 0,1 all →（stepwalk-auto，文件存在时）→ perf 对比 perf-p0c.json；汇总表、日志 /tmp/fc-gate-<PORT>/、`--keep-going`、`GATE_SKIP`、`PERF_FPS_STRICT`。smoke.cjs 改为 pageerror 才失败（原来恒 0 退出）；stepwalk.cjs 执行器抽到 tests/lib/stepwalk-runner.cjs（路线不动，132/132 与重构前逐条一致，仅「乾清宫偏中轴」fps60 慢走最高脚点 6.46↔6.45 抖动）。**fps 规则降为警告**：同一版本（3ffd181）连跑 perf 两次 fpsP5 相差 −1.6%～−50%，gate 内第三次比基线低 50–77%（多 Agent 共享 CPU），calls/tris 三次完全一致。首跑全绿 500 s。 — d90fb4b
- T-2 ✅ `tests/stepwalk-auto.cjs` + `tests/lib/auto-routes.mjs`：从 zone JSON 自动生成 30 条区内路线（7 区每座有名 enter 殿：院门外 → 门内 → 殿前台阶外 2 m → 殿内 1 m → 原路返回；门外净空不足 7 m 时沿夹道中线横移 8 m 进门；被殿挡住侧绕；工字殿后殿穿前殿绕宝座）+ 2 条跨区（中轴→东六宫景仁宫→宁寿宫皇极殿→回中轴；中轴→景运门→锡庆门→皇极殿→回中轴），跨区额外判定"所在区无碰撞体时的行走距离 ≤ 1 m"。`--check` 用 node 碰撞世界预检（区分生成算法/场景缺陷）、`--list`、`DUMP=1`。原 33 条路线不动。结果 `60,10 0,1` **128/128 PASS**（连跑两次一致）；调试中 11 条 fps10 快走失败均为生成算法问题（≤1 m 折线段惯性过冲被判卡住），加 `simplify`（<2.5 m 且可直达的中间点删除）后全过；未发现场景缺陷，knownIssue 0 条。gate 已接入（stepwalk 之后）。 — eb9b4e1
- T-4 ✅ 截图回归 `tests/visual.cjs`：12 机位（坐标从 LAYOUT / anchors / zone JSON 推导，表见 docs/TESTING.md §4），960×540@DPR1，注入固定种子 Math.random、停主循环、每机位 `ensureLoadedAt` + 20 次 `update` + 清空 buildQueue 后手动渲染，隐藏 HUD。像素任一通道差 >24 记差异，占比 >2% 失败；差异图 `<机位>.diff.png` + `report.json` 输出到 `tests/visual/<分支>/`（`.gitignore`，不入库）。基线 `tests/visual/main/` 12 张共 6.5 MB **入库**（每张 ~0.5 MB，可接受；大量更新时再考虑 LFS）。本分支对比模式 12/12 PASS（11 张 0%，御花园 0.04%，来自树叶/水面抖动）。`npm run test:visual`；gate 加可选步 `visual`（`GATE_VISUAL=1` 才跑，失败只标 ⚠ 不影响退出码）。 — a35ca21
- R2 ✅ regression `WUMEN_WING_GAP` → **[25, −20]**（世界 (25, −439.6)），**偏离 R2 原提 [30, −20]**：在 main 几何下 (30, −439.6) 落在 PalaceBuilder 估值朝房碰撞体 x 29–39 × z −464.6..−434.6 内（P1-Z-axis A1 才移除它），直接用 [30,−20] 本分支 regression 23/24（「午门翼楼旁空地无空气墙」失败）。用 `tests/lib/world.mjs` 分别在本分支与 feat/p1-zone-axis ed2ba79（git archive 到 /tmp，只读）几何上扫 dx 15–30 × dz −16..−25：dx ≤ 28 两边都空，取 25（离朝房 4 m、离 zone-axis 翼内皮 38.5 有 13 m）。改后本分支 regression 24/24。已通知 p1-zone-axis-r3。 — 309a7e4
- T-5 ✅ `docs/TESTING.md`：环境/端口表、gate 步骤与判定、fps 规则、全部脚本用法、stepwalk 33 条 / stepwalk-auto 32 条 / perf 6 点 / visual 12 机位坐标表、基线更新流程（visual/perf/取点/自动路线）、CI 分级接入建议。 — 83063a5

### 验收
**1. 本分支 `npm run test:gate` 全绿**（83063a5，`GATE_VISUAL=1 PORT=5181`，489 s）：

| 步骤 | 结果 | 说明 | 耗时 |
|---|---|---|---|
| build | ✅ | /tmp/fc-build-gate-5181，built 1.61s | 2s |
| zones | ✅ | 0 错 25 警告 | 1s |
| anchors | ✅ | 比较 108 条，超差 0 | 0s |
| smoke | ✅ | colliders 5580，pageerror 0，console 5 | 25s |
| regression | ✅ | 24/24 | 103s |
| stepwalk | ✅ | 132/132 | 17s |
| stepwalk-auto | ✅ | 128/128 | 15s |
| perf | ✅ | calls/tris 与 perf-p0c 完全一致，fps 警告 6（−33%～−66%，共享 CPU） | 300s |
| visual | ✅ | 超阈值 0 机位 | 25s |

注：任务卡写的是"在 main 上全绿"；按总控指示只在本分支验收（本分支 = main 3ffd181 + 仅 tests/docs 改动，src/data 未改）。

**2. 反向验证（已还原，未提交）**：把 `data/zones/east-six.json` 景仁宫 hall x −93.4 → −110（面阔 24 → 殿身 x −122..−98，压进院西墙 −114.4），`GATE_SKIP=perf --keep-going` 跑 gate → **退出码 1**，三步抓到：
- zones ❌ 1 错：`hall「景仁宫」(-110, 331) 前门 从门前 2 m 沿中线走不进殿内（走了 3.2/4.76 m 停在 [-110,324.44]）`
- anchors ❌ 超差 1：景仁宫 dx −16.6 > 5 m
- stepwalk-auto ❌ 120/128：「[east-six] 景仁门→景仁宫→返回」与跨区「中轴→东六宫景仁宫→宁寿宫皇极殿→回中轴」× 4 档 fps/sprint 全部卡在 (−110, 313.2)，未到达殿前途经点
- 手写 stepwalk 132/132 未抓到（「内左门→东一长街→景仁宫内」终点取自 anchors 而非 zone JSON，殿挪走后终点成了空地）——这正是 T-2 自动路线的价值。
还原后 `git status` 干净、zone-lint 0 错。

### 遗留 / 建议
- perf fps 在多 Agent 并行时恒报警告（calls/tris 稳定），只有独占机器才适合 `PERF_FPS_STRICT=1`。
- visual 基线在 P1-R / P1-Z / P1-I 合入后必然大面积变化：每次合并后由总控在 main 上 `tests/visual.cjs --update` 并单独提交（流程见 TESTING.md §6）。
- zone-lint 25 条警告（门外净空 <4 m、enter 殿门前 2 m 内有构件但可走）均为现有数据，留给各 P1-Z 细化时顺手处理。
- R2 合并顺序：本分支 [25,−20] 在 zone-axis 合入前后都成立，P1-Z-axis 可将 `wingInnerX` 回调 38.5。
