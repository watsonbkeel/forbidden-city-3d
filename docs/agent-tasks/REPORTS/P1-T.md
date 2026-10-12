# P1-T · 测试工具链 报告

> 分支 `feat/p1-tests`（worktree `fc-tests`，起点 main 3ffd181），端口 5181。只改 tests/*、package.json scripts.test:*、docs/TESTING.md、本报告、REQUESTS.md「## P1-T」小节。

### 进度
- T-3 ✅ zone-lint 增强：新增 `tests/lib/world.mjs`（node 里用真实 ZoneBase/CourtKit/PalaceBuilder/Enclosure/GardenBuilder + CollisionManager 建出全场景碰撞世界，~1 s）；zone-lint 加 (7) bounds 重叠=错/相邻缝隙=警告/neighbors 引用与单向，(8) 每座门两侧：门洞中心被占=错、出门净空 <1.5 m=错 <4 m=警告、出门 12 m 内封闭死角=错，(9) enter 殿前/后门门前 2 m：中线走不进殿=错、2 m 内有其他构件但中线可走=警告；`--no-geo`、`ZONES_DIR` 选项。当前 main 数据：0 错 25 警告。回放 P0c-2 两处旧缺陷（养心殿院 z1 302、文华殿院 z1 −152）→ 3 错（永寿门/太极门/文渊阁院门 被封死）。 — 4d31a89
- T-1 ✅ `npm run test:gate` = `tests/gate.cjs`：自起停 vite（PORT，默认 5181，strictPort，端口被占直接报错不误杀）→ build（/tmp/fc-build-gate-<PORT>）→ zones → anchors → smoke → regression（失败自动重试 1 次）→ stepwalk 60,10 0,1 all →（stepwalk-auto，文件存在时）→ perf 对比 perf-p0c.json；汇总表、日志 /tmp/fc-gate-<PORT>/、`--keep-going`、`GATE_SKIP`、`PERF_FPS_STRICT`。smoke.cjs 改为 pageerror 才失败（原来恒 0 退出）；stepwalk.cjs 执行器抽到 tests/lib/stepwalk-runner.cjs（路线不动，132/132 与重构前逐条一致，仅「乾清宫偏中轴」fps60 慢走最高脚点 6.46↔6.45 抖动）。**fps 规则降为警告**：同一版本（3ffd181）连跑 perf 两次 fpsP5 相差 −1.6%～−50%，gate 内第三次比基线低 50–77%（多 Agent 共享 CPU），calls/tris 三次完全一致。首跑全绿 500 s。 — (见下行)
