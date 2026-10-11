# Phase 1 公共说明（总控 2026-10-12，优先级高于各 P1 任务卡中与之冲突的旧描述）

> P0 已合入 main：tag `p0-done` = e08ef33。场景已是真实 1:1 米制。各任务卡写于 P0 之前，以下条目覆盖其中过时内容。

## 1. 起步
```
cd /Users/watson/Documents/Codex/故宫/forbidden-city-3d
git worktree add ../fc-<task> -b feat/<task> main
cd ../fc-<task> && cp -R ../forbidden-city-3d/node_modules ./node_modules   # worktree 没有 node_modules
```
必读：`docs/ARCHITECTURE-1to1.md` §1–2、`docs/agent-tasks/REPORTS/P0.md` 末尾「## P0 总结」（最终接口 + 遗留清单）、你的任务卡、本文件。

## 2. 测试（每个 Agent 用自己的端口，避免互相杀进程）
- 统一入口：`PORT=<你的端口> tools/run-with-vite.sh <node> tests/<脚本>.cjs [参数]`（在当前 worktree 根目录起停 vite）。
- node：`/Users/watson/.workbuddy/binaries/node/versions/22.22.2-6/bin/node`；构建：`npx vite build --outDir /tmp/fc-build-<task>`（不要 `npm run build`）。
- 端口表：P1-T 5181 · P1-R 5182 · P1-U 5183 · P1-I 5184 · P1-Z-east-six 5185 · west-six 5186 · ningshou 5187 · outer-east 5188 · outer-west 5189 · P1-Z-axis 5190。
- 合并门禁（顺序）：build → `test:zones` → `test:anchors` → smoke → regression（24/24）→ `stepwalk 60,10 0,1 all`（当前 132/132）→ perf（对比 `tests/perf-p0c.json`）。
- regression 截图在 swiftshader 下偶发超时：失败先重跑一次。stepwalk 比 PASS/FAIL 与最高脚点，不比终点坐标。
- 改文件用编辑工具，不用 `sed -i`；没有 `timeout`，用 `perl -e 'alarm N; exec @ARGV'`；curl 加 `--noproxy '*'`。

## 3. 数据源规则（P0 后变化）
- `tools/p0c-relocate.mjs` **已归档**：P0c 一次性迁移工具，Phase 1 起任何人不再运行它。**`data/zones/*.json` 本身即真相源**，P1-Z 各区直接编辑自己的 JSON。
- 坐标/尺寸先查 `data/anchors.json`，再查 `docs/research/dimensions.md`；都没有的标 `"source": "estimated"`。改完必须 `npm run test:anchors` 超差 0。
- 各区 `bounds` 已在 P0c 定稿且两两不重叠。需要改 bounds → 写 `REQUESTS.md`，总控批。

## 4. 测试文件所有权
- 现有 `tests/*.cjs` 归 P1-T。其他任务**不得修改**现有测试脚本；需要新路线/新检查时，新建 `tests/<task>-*.cjs`，或写进 REQUESTS.md 交 P1-T。
- 例外：场景改动导致现有 stepwalk 路线取点失效（如御花园亭子按锚点挪位），在 REQUESTS.md 写明"路线名 + 新取点"，由总控在合并时同步。

## 5. 各任务卡的覆盖项
### P1-R
- 基线改为 `tests/perf-p0c.json`（真实尺度）。目标：6 点 calls 平均下降 ≥ 50%；太和殿前 calls ≤ 300、tris ≤ 1.5M。
- 追加任务：R-5 silhouette 远景替身（ZoneBase 返回的 `silhouette` 目前为 null）；R-6 单区构建 > 8 ms（`CourtKit.finish()` 不可切片，axis-courts ~50 ms）——拆分帧或预合并；R-7 天际线环半径 / 天空球 / 雾随 1:1 尺度调整（场景纵深约 1060 m）。
- 所有权追加：`src/scene/zones/ZoneManager.js` 的内部实现（silhouette 显隐、分帧），**公共方法签名不变**；`src/scene/sky/*`、`src/scene/Environment.js` 中雾/天空/阴影参数。

### P1-U
- ZoneManager 没有 `ensureLoaded(zoneId)`，用 `ensureLoadedAt(x, z)`（同步加载该点所在区 + 邻区）。
- 传送点坐标从 `LAYOUT` 与 `data/anchors.json` 推导；午门到神武门约 950 m。
- 殿内宝座在中轴上，传送落点放殿门外，不放殿内。

### P1-T
- `test:gate` 在已有 `test:zones / test:anchors / test:smoke / test:regression / test:walk / test:perf` 基础上串联，perf 对比 `tests/perf-p0c.json`。
- T-2 自动路线：从 zone JSON 的 gate/hall 生成；P0c-2 发现"院门外 4 m 被对面墙封死"类缺陷两处，把这项扫描做成 `test:zones` 的一条检查。
- zone-equiv 已退役，可从门禁中移除（文件保留）。

### P1-I
- 宝座碰撞以 `PalaceBuilder.buildHall` 的 `ztb0/ztb1/thW` 为准；中轴殿已按真实面阔（太和 11 间、乾清 9 间间宽 5.11）。改宝座尺寸会影响 stepwalk 绕行路线 → 写 REQUESTS.md。

### P1-Z（各区）
- 任务卡第 1 步「读 data/zones/axis.json 范例」作废：没有 axis.json，中轴项在 `src/scene/Layout.js` + `PalaceBuilder`；范例看 `data/zones/east-six.json`。
- 占位版已是真实坐标（不是 ×2 占位），工作是**逐院落细化**：补全配殿/后殿/井亭/随墙门，修正六宫正殿面阔（当前 s 截到 1.6，约 24 m，真实 27–29 m），补无锚点的门。
- 每改完一个院落：`test:zones` + `test:anchors` + 本区 stepwalk 子集（`tests/stepwalk.cjs 60 0 <路线名子串>`）。

### P1-Z-axis（新增，中轴与宫城外围）
- 所有权：`src/scene/Layout.js`、`src/scene/PalaceBuilder.js`、`src/scene/Enclosure.js`、`src/scene/GardenBuilder.js` 与 `src/scene/garden/*`、`src/scene/palace/river.js`、`data/zones/axis-courts.json`、`data/zones/garden.json`；`src/config/constants.js` **仅** `DIMENSIONS` 段（P1-U 只加 `TELEPORT` 段，两者不冲突）。
- 内容（P0 遗留）：午门墩台凹形东西约 120 m、雁翅楼中心 (±45, −450)、墩台高 12；太和门台基 3.44；御花园内部按锚点（万春/千秋亭 x −52.5/+54.6，浮碧/澄瑞池亭 z≈498.7）；金水河五桥 x 0/±13 等（`buildRiver` 与 `Collision.checkRiverCrossing` 同步，Collision 改动写 REQUESTS）；角楼按 anchors。
- 御花园改动会使 stepwalk 20–23 号路线取点失效 → 按第 4 节写 REQUESTS。
