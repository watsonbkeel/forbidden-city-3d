# P0c · 1:1 真实坐标迁移（总控 2026-10-11 22:30 编写）

> 前置：P0a ✅ c079f37、P0b ✅ 11e9bb9。分支 `feat/p0-foundation`，直接在当前目录工作（不建 worktree）。
> 控制文件：`docs/ARCHITECTURE-1to1.md`（第 2 节接口冻结，不得改 ZoneBase/ZoneManager/CourtKit 签名）。
> 数据源：`docs/research/dimensions.md`（第 0.3 节绝对坐标 + 各分区表"相对位置描述"列）。

## 0. 为什么不能"整体 ×2"
现有布局是**非均匀压缩**的（总控实测）：

| 对象 | 现坐标 | 真实 | 倍率 |
|---|---|---|---|
| 午门 z | −150 | −419.6 | 2.8 |
| 乾清宫 z | 210 | 316.8 | 1.5 |
| 景仁宫 x | −65 | −93.4 | 1.4 |
| 武英殿 x | 111 | 219.5 | 2.0 |
| 皇极殿 (x,z) | (−137,198) | (−293.2,287.7) | 2.1/1.45 |
| 中左门 x / 后左门 x | −52 / −60 | −77 / −76.4 | 非单调 |
| 太和殿尺寸 | 63×37 | 63.96×37.17 | 已真实 |

结论：**按锚点重定位，不做全局缩放**。

## 1. 方法（硬性）
1. **锚点表** `data/anchors.json`：从 dimensions.md 抽取所有带明确坐标的建筑（名称 → `{x, z, w?, d?, conf, src:"dimensions.md:行号"}`），至少覆盖：中轴全部门殿、四门、四角楼、东西六宫 12 正殿、养心殿、文华殿、武英殿、慈宁宫、寿康宫、皇极殿、九龙壁、箭亭、奉先殿、南三所、协和/熙和/左翼/右翼/中左/中右/后左/后右/景运/隆宗/日精/月华/内左/内右门等。坐标冲突时：外廓以官方 961×753 为准（南墙外皮 z=−425，北墙外皮 z=+536，东西外皮 x=±376.5），内部以 OSM 量算为准；神武门取城墙上（约 +531），在锚点里注明 `"note"`。
2. **院落组（court group）**：在重定位脚本里把每个 zone 的 items 按院落分组（一个 gate + courtWalls + 其内 hall/region 为一组；以组内主殿为锚）。每组做**刚体平移 + 可选水平等比缩放 s**：
   - 平移：使主殿中心落到锚点。
   - 缩放 s：= 锚点面阔 / 现面阔（仅当锚点有 w 且置信度 ≥ 中）；作用于组内相对位置与 w/d/courtWalls 边界；**不缩放** `ph`（台阶/台基高，人体尺度）、`pad`；`colH` 可按 s 缩放但上限 ×1.6。
   - 组内有自己锚点的成员（如后殿、配殿有真实坐标）优先用自己的锚点。
3. **连接件**（院落之间的长墙 wall、廊 corridor、长街 region）：端点吸附到相邻已重定位院落的墙线上，不做独立缩放。
4. **重定位必须由脚本完成**：`tools/p0c-relocate.mjs`，输入 = P0b 版 7 个 zone JSON（git `11e9bb9` 版本）+ `data/anchors.json` + 脚本内院落分组表；输出 = 新的 `data/zones/*.json`。脚本可重跑、幂等；手工微调写成脚本里的 `overrides` 表并附原因，**禁止直接手改输出 JSON**。
5. 中轴（非 zone 部分）：`src/config/constants.js` 的 `LAYOUT.*_Z`、`DIMENSIONS.*`、`BOUNDARY`、`START_POSITION`；`src/scene/Layout.js`（筒子河/外城墙/金水河/中轴殿门/御花园位置与尺寸）；`src/scene/Enclosure.js` 的硬编码墙线（外城墙 ±155/−150/420、太和殿院 ±75、乾清门隔墙、内廷 ±40、御花园 ±67/305/395）全部换成真实值，尽量改为从 constants/Layout 派生而非新的硬编码。
6. 尺寸：中轴殿门按 dimensions.md 修正 DIMENSIONS（保和殿 49.7×25、乾清宫约 46×25、坤宁宫约 46×20、交泰殿约 19、太和门 48×20.5 等）；其他 hall 只走第 2 步的组缩放，**细化留给 P1-Z**。

## 2. 拆段与提交（每步一个 commit，提交信息以 `P0c-1:`/`P0c-2:` 开头；每步完成后追加进度到 `docs/agent-tasks/REPORTS/P0.md` 的 P0c 小节）

### P0c-1（本次 Agent 范围）
1. `data/anchors.json` + 抽取说明（写进 REPORTS）。
2. `tools/p0c-relocate.mjs` + 院落分组表；跑出新 7 个 zone JSON；bounds 按新内容外包框 +6 m 重算，并**消除 P0b 遗留的 11 对 bounds 重叠**（重叠只允许在共享墙线上 ≤ 2 m）。
3. constants / Layout / Enclosure / GardenBuilder 默认值 改真实米制。
4. 相机与远景：`main.js` 相机 far 1200 → 2500；`src/scene/sky/Skyline.js` 远景环改为每帧跟随相机 x/z（否则走到神武门时南侧远景被裁掉）；`src/ui/Minimap.js` 的 `/400`、`/710` 改为从 `LAYOUT.BOUNDARY` 派生。
5. 新增 `tests/anchor-check.cjs`（纯 node，不开浏览器）：zone JSON 与 Layout 中每个出现在 anchors.json 的命名建筑，中心偏差 ≤ 5 m（置信度"低"的 ≤ 15 m），输出表格；加入 package.json `test:anchors`。
6. 验收（本段）：`npx vite build --outDir /tmp/fc-build-p0c` 成功；`npm run test:zones` 0 错；`npm run test:anchors` 全过；`/tmp/run-with-vite.sh node tests/smoke.cjs` 页面无报错。**stepwalk/regression 本段允许失败**（坐标还没同步），但要把失败清单写进报告。

### P0c-2（总控 2026-10-12 06:10 细化；P0c-1 已验收 344964a）
起点：场景已是真实米制，build / test:zones / test:anchors / smoke 绿；stepwalk 24 条中 16 条、regression 5 条因测试写死旧坐标而失败（清单见 REPORTS/P0.md「P0c-1 step6」）。上一段的临时脚本已存入 `tests/_handoff-p0c/`（regression-newcoords.cjs = 已验证 24/24 的真实坐标版；stepwalk-real*.cjs = 14 条真实路线抽检）。

步骤（每步 commit `P0c-2: stepN`，并在 REPORTS/P0.md 新建「## P0c-2」逐步追加进度）：
1. **regression**：以 `_handoff-p0c/regression-newcoords.cjs` 为准替换 `tests/regression.cjs` 的坐标；坐标一律从 `LAYOUT` / `data/anchors.json` 推导或写成命名常量+注释，不留裸数字。24/24。
2. **stepwalk 路线重写**：`AXIS_ROUTES` 与 `SIDE_ROUTES` 每条按**原路线语义**（名称所写的起止建筑、绕宝座、偏中轴、穿殿）用真实坐标重写；途经点优先从 anchors 推导。路线数量不得减少（仍 24 条 × fps × sprint = 96 次）；可以吸收 `_handoff-p0c/stepwalk-real*.cjs` 里的新路线作为**追加**路线（午门门洞、东侧金水桥、东华门/西华门出宫、顺贞门→神武门出宫）。`node tests/stepwalk.cjs 60,10 0,1 all` 全部 PASS。
3. **修场景缺陷**：第 2 步中若有路线因场景本身（门洞宽、台阶、碰撞、掉台）失败，修场景而不是改路线绕开；修 zone 数据只能改 `tools/p0c-relocate.mjs` 再重跑。每个修复在报告写"现象 / 根因 / 改动"。
4. **其余测试**：`tests/perf.cjs` 6 个点位改真实坐标（午门前、太和殿前、乾清门、东六宫中、宁寿宫、御花园，语义同 P0a），录 `tests/perf-p0c.json`（`?zones=` 默认流式），与 `perf-p0b-stream.json` 对照写进报告；`walk/sense/probe/realwalk/shot` 中的默认机位改真实坐标（只改坐标，不改逻辑）。
5. **门禁脚本**：package.json 增 `test:walk`（stepwalk 60,10 0,1 all）与 `test:regression`；README 或报告里写一键验收顺序：build → test:zones → test:anchors → smoke → regression → stepwalk → perf。
6. **P0 总报告**：REPORTS/P0.md 末尾「## P0 总结」：P0a/b/c 成果、最终接口、性能基线三版对照（P0a 压缩 / P0b 流式 / P0c 真实）、遗留问题清单按归属拆给 P1-R / P1-Z / P1-U / P1-I。
7. **不要合并到 main**。完成后保持在 `feat/p0-foundation`，由总控复核后合并。

本段不做（已记为遗留，归 Phase 1）：午门墩台 120 m 与雁翅楼位置、太和门台基 3.44、御花园内部按锚点布置、角楼坐标、金水河五桥位置、天际线/雾随尺度调整、三台分层尺寸——除非它们直接导致第 2 步路线失败。

## 3. 测试环境（必读，前几轮踩过的坑）
- 5173/5174 被占；一律用 `/tmp/run-with-vite.sh <命令>`（在 5180 起停 vite，同一条 shell 命令内完成；后台 vite 跨命令会被杀）。
- Playwright：`NODE_PATH=/Users/watson/.workbuddy/binaries/node/workspace/node_modules`（脚本已设置）。node 用 `/Users/watson/.workbuddy/binaries/node/versions/22.22.2-6/bin/node`。
- 没有 `timeout` 命令，用 `perl -e 'alarm N; exec @ARGV' ...`。curl 探活要 `--noproxy '*'`。
- **不要跑 `npm run build`**（清 dist/ 会被安全策略拦），用 `npx vite build --outDir /tmp/...`。
- 不要用 `sed -i` 改复杂内容，用编辑工具。

## 4. 禁止
- 不改 `PLAYER.*`；不改 `src/render/*`、`src/scene/palace/interiors.js`；不改 ZoneBase/ZoneManager/CourtKit 公共签名。
- 不删 `SideCourts.js`（zone-equiv 在 P0c 后会失效，属预期；在报告里注明 zone-equiv 已退役，不必修）。
- 不引入新 npm 依赖。
- 不编造尺寸：dimensions.md 没有的，沿用组缩放结果并在 JSON item 上加 `"source": "estimated"`。
