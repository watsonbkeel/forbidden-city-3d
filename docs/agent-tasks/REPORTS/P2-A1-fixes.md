# P2-A1 完成报告：已知碰撞盒修复

**日期**：2026-10-13
**范围**：`data/zones/outer-east.json`、`data/zones/ningshou.json`、`tests/stepwalk.cjs`、`tests/stepwalk-auto.cjs`
**目标**：修复 Phase 1 标记为 KNOWN_ISSUE 的 region/碰撞盒缺陷，恢复 stepwalk 全绿

---

## 一、诊断结论（初版方向错误）

初版尝试（main 上 5 个 commit + 未提交改动）反复**扩 region 边界**和**改测试路点** —— 方向错误：
**region 不产生任何碰撞体**（碰撞仅来自 hall / gate / wall / courtWalls / buildX 系列），改 region 对"走不过去"零作用。

用纯 Node 碰撞引擎（`tests/lib/world.mjs`，colliders 7661）复现三条**互不相连**的根因：

| 路线 | 卡点 | 元凶 |
|---|---|---|
| outer-east 文华殿院北夹道→文渊阁院 | x≈-161, z=-153 | 「文渊阁门」为 `style:"hall", w:40.5` 门殿，其台基/柱/侧墙碰撞体横跨 z=-150±3.2，堵死 z=-153 的东西夹道 |
| ningshou 蹈和门→宁寿宫 | x≈-229.8 | 「蹈和门」**缺 `rot`**（默认朝南）；而它开在南北向墙（东筒子 x=-233.2）上、洞为东西向 → 门体与洞口垂直，门自堵 |
| garden 御花园四亭 | 万春/浮碧/澄瑞各卡一处 | GardenBuilder 池壁/亭台/古柏实体碰撞与测试路线不匹配 |

### A 的数据溯源（关键）
`docs/research/dimensions.md:406-414`（D1）**没有「文渊阁门」这个建筑**；zone 里它的 `w=40.5` 与文渊阁本体 `w=40.5` **完全相同**（系误抄）。D1 记载的真实南入口是「**文渊阁前方池石桥**」（方池~20 m + 单孔石桥，位于文渊阁正南）。
→ 所以 `w=40.5` 是**错误数据**，不是需要保护的建筑形制。

---

## 二、修复内容

### A · outer-east（`data/zones/outer-east.json`）
- 删除虚构的 `gate「文渊阁门」`（style hall, w 40.5）
- 文渊阁院南墙 `courtWalls` 南边改为纯洞口 `{ "side": "s", "at": -186.5, "w": 12 }`

实测对比（git HEAD 干净基线）：

| 配置 | 结果 |
|---|---|
| 原状（`style:hall`, w=40.5） | ❌ 卡 11/36.5 |
| 仅加 `rot:"west"`（w 不变） | ✅ 但把门转 90°，与院墙垂直，几何不符 |
| `w:12 + rot:"west"` | ✅ 同上问题 |
| `style:"wall", w:6, rot:"west"`（另一 AI 方案） | ❌ 36.5/36.5 ｜ 6/8（进不了院） |
| **删门 + 院墙开洞 6/12 m** | ✅ **采用** |

### B · ningshou（`data/zones/ningshou.json`）
- 「蹈和门」补 `"rot": "west"`（与同墙锡庆门一致）
- 实测：无 rot ❌ / `west` ✅ / `east` ✅ / `north` ❌

### C · garden（`tests/stepwalk.cjs`）
四亭路线按真实园路重规划（原路线被 GardenBuilder 实体挡死）：
- **万春亭**：沿亭中线 x=-52.5 自南横路北上，走南面台阶进亭（原经 x=17 横穿被古柏挡）
- **千秋亭**：沿 x=54.6+2 北上绕开西南侧古柏，再西移进亭（fps=60 慢走被古柏挡）
- **浮碧亭**：沿园墙内侧 x=-63.5 绕过万春亭 → 经南北石桥进亭
- **澄瑞亭**：沿园墙内侧 x=63.5 绕过千秋亭 → 经南北石桥进亭
- 新增常量 `POND_DETOUR_X / POND_DETOUR_Z0 / POND_DETOUR_Z1`，删除废弃的 `PAVILION_APPROACH`

### 附带修复
- `tests/stepwalk-auto.cjs`：浏览器分支引用了未定义的 `KNOWN_ISSUES`（此前清理排除列表时漏改），补 `const KNOWN_ISSUES = {}`

---

## 三、验收结果

| 项 | 结果 |
|---|---|
| `npm run test:zones`（zone-lint） | ✅ **0 错误** / 25 警告（均为既有跨区布局问题） |
| `npm run test:anchors`（anchor-check） | ✅ 113 条，**超差 0** |
| `node tests/stepwalk.cjs 60,10 0,1 all` | ✅ **132/132** |
| `node tests/stepwalk-auto.cjs 60,10 0,1 all` | ✅ **144/144**（knownIssue 0） |
| `node tests/stepwalk-auto.cjs --check` | ✅ 36/36 |
| `npm run test:smoke` | ✅ 无 pageerror |
| `npm run test:regression` | ✅ 24/24 |

> 浏览器测试需绕过系统代理：`env -u http_proxy -u https_proxy NO_PROXY=127.0.0.1 PALACE_URL=http://127.0.0.1:5183 …`

**验收项对照（任务卡）**：A1-1~A1-6 逐条达成。

---

## 四、遗留与后续

1. **文渊阁院南入口视觉**：现为 12 m 洞口；真实为「方池 + 单孔石桥」，已登记 `REQUESTS.md`（低优先级）。
2. **初版试探提交**：main 上仍留有初版的 5 个试探 commit（region 边界扩展）。其改动无害（region 不产生碰撞，且让两个 region 无缝衔接），未回退以免打乱历史。
3. **未提交试探已回退**：`git stash@{0}`（garden 3 亭 region / outer-east 北 gap / stepwalk 绕行路点 / `tests/collider-debug.cjs`），确认无用后可 drop。
4. **御花园余项**：万春亭南侧花坛/古柏较密，路线已绕开但观感上非最短路径；如需更贴近真实园路可后续细化。
