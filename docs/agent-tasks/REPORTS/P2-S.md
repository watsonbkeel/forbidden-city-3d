# P2-S 报告：S-0 接线 + 皇极殿 + 养心殿（P2-S1）+ 坤宁宫 + 慈宁宫（P2-S2）

分支 `feat/p2-interior-s`（worktree `fc-interior-s`，端口 5191）。未合并 main、未打标签、未推送。
P2-S1 范围：S-0 / S-1 皇极殿 / S-2 养心殿。P2-S2 范围：S-3 坤宁宫 / S-4 慈宁宫 / 收尾（见文末「P2-S2」各节与最终门禁）。

## 提交

| 子任务 | 提交 | 说明 |
|---|---|---|
| S-0 | c54474b | `feat(integrate): main.js 接线 InteriorLoader（补 P1-I 遗漏）` |
| S-1 皇极殿 | dac08be | `feat(interior): 皇极殿 S 档内景` |
| S-2 养心殿 | f252af9 | `feat(interior): 养心殿 S 档内景` |

## §0 三条前置核查的处理

1. InteriorLoader 未接线：S-0 已补（见下）。此前 stepwalk 132/132 是在"未接线"状态下测的，现在接线后重测仍 132/132。
2. 两套建造路径宝座公式不同：皇极殿、养心殿走 zone JSON → `ZoneBase.buildHall` → `CourtKit.hall`（kit 公式，`tz = d/2 − min(2.6, 0.3d)`，无后门），不是 taihe.py / qianqing.py 的 PalaceBuilder 推导。两殿的 JSON `throne` 字段均按 kit 公式实测填写（`builder: "kit"`），S 档宝座/屏风完整包住 B 档碰撞盒。
3. zone JSON 里 `"interior": "A:palace-front"` 不生效（`ZoneBase.buildHall` 不透传、`furnishRoom` 不认 `A:` 前缀）：属 A 档问题，本任务未改，原样保留。

## S-0 main.js 接线

只改 `main.js`，4 处：import；`this.rooms` 之后创建 `new InteriorLoader(scene, collisionManager, { renderer })`；`animate` 里 `zoneManager.update` 之前 `interiors?.update(camera.position)`；`dispose()` 里 `interiors?.dispose()`。未加 PerfHUD 行。
验证：`p1i-loader taihe` / `qianqing` PASS（`__missing__.glb` 警告是故意的回退测试）；全量 gate 8/8。无需改任何 GLB 碰撞代理。

## S-1 皇极殿 (huangji)

- 框架：中心 (−293.2, 287.7)，49.8 × 26.3 m；kit 参数 colH 8.64、台基 ph 1.5 → n=15、bay=3.32、梁高 0.85、天花 7.79；地面 y=1.5；宝座 tz=10.55（B 档碰撞盒 x ±2.32、z 9.35~11.85）。
- 内容：低矮两层宝座台（下层 `WALK_dais_low` ≤0.35 m 可直接踏上，上层 + `COL_dais`）、4 根金龙盘柱（x ±3.9, z 7.2/11.9, r 0.42，各带碰撞盒）、藻井（前移到 z=9.0，因后墙距宝座仅 2.6 m）、屏风（宽度系数 0.55、厚 0.32）、宝座。
- 指标：24 096 tris；glb 0.16 MB（172 816 B，Draco）；加载 56 ms（swiftshader）；碰撞体 5 个（6 个隐藏代理）；视觉可见 mesh 9；draw calls 约 +9 / +9 / +7，tris 约 +24k（三个测试视角）。
- `p1i-loader` PASS，加载/卸载正常；`p1i-visual` B/S 对比 S 档完整覆盖 B 档盒。
- 截图：`/Users/watson/Documents/Codex/故宫/outputs/dev/p1i-huangji-{B,S}-{1,2,3}.png`
- 可信度：柱/藻井/宝座配置（A14 文档）高；殿宽进深高度中；藻井尺寸、宝座台尺寸为纯估算，低。
- P1 未做内容：铜壶滴漏、自鸣钟、浑金雀替、宝座前陈设、金龙和玺贴图。

## S-2 养心殿 (yangxin)

- 框架：中心 (108.6, 277.5)，36 × 12 m；colH 7.68、ph 0.6 → n=11、bay=3.273、天花 6.81；地面 y=0.6；宝座 tz=3.4（B 档碰撞盒 x ±2.29、z 2.2~4.7）。
- 内容：宝座 + 屏风（稍窄）+ 低矮宝座台（platH 0.5）；无藻井、无金柱；仅中间明间铺金砖（`floorW=floorD=11.8`）；两只甪端、两座香炉（带碰撞代理）；后墙"中正仁和"匾（用 Blender 字体曲线 + 宋体生成）；x=±6 的楠木板隔断（带窗、横披、3.0 m 门洞，中间走廊 x∈[−1.6,1.6] 完全通畅）；东暖阁木地板 + 面西宝座台（`COL_east_dais`）+ 黄色纱帐；西暖阁仅木地板。
- 指标：8 852 tris；glb 0.06 MB（63 044 B）；加载 36 ms；碰撞体 10 个（11 个隐藏代理）；draw calls +11 / +11 / +10，tris 约 +8.7k。
- `p1i-loader` PASS；`p1i-visual` 截图显示匾额文字正确、宝座/屏风包住 B 档盒，从明间可看到东暖阁黄纱和面西宝座。
- 截图：`/Users/watson/Documents/Codex/故宫/outputs/dev/p1i-yangxin-{B,S}-{1,2,3}.png`
- 可信度：宝座/屏风/匾/面西宝座/黄纱（A 级来源）高；隔断位置与暖阁布局为推断，中低（已在 json `source` 注明）。
- P1 未做内容：三希堂小室、"勤政亲贤"匾、书案/炕/多宝格、后殿寝床、抱厦与假九间方柱、养心门狮子/影壁；西暖阁目前只有地面。

## 对 throne_hall.py 的改动（向后兼容，已验证 taihe/qianqing 输出一致）

新增可选参数：`dais`（两层低台，与 `throne_platform` 二选一）、`throneBackOff`、`screenWidthScale`、`screenThick`、`dragR`、`noCaisson`、`extra(cfg)` 钩子（在陈设之后、碰撞代理之前）、`floorW/floorD`。
`_common.merge_by_material` 默认 `skip_prefix=('COL_','WALK_')`（WALK_ 代理不再被合并改名）。
一致性验证方法：Draco 输出不确定（同一脚本两次运行字节也不同），所以比较 GLB JSON 里的 accessor 数量与 min/max，旧/新脚本各两次结果 `o1==o2, n1==n2, o1==n1` 全 True。

## 门禁结果（P2-S1 阶段，`npm run test:gate`）

最后一次全量运行（皇极殿已提交、养心殿改动在工作区，随后原样提交为 f252af9）：

| 步骤 | 结果 | 说明 | 耗时 |
|---|---|---|---|
| build | ✅ | built 1.20s | 1s |
| zones | ✅ | 0 错 23 警告 | 1s |
| anchors | ✅ | 比较 113 条，超差 0 | 0s |
| smoke | ✅ | colliders 6560，pageerror 0，console 6 | 11s |
| regression | ✅ | 24/24 | 42s |
| stepwalk | ✅ | 132/132 | 15s |
| stepwalk-auto | ✅ | 152/152 | 14s |
| perf | ✅ | calls/tris 无劣化 | 185s |

perf 对比 perf-p0c.json：calls/tris 全部远低于基线；fpsP5 最大降幅宁寿宫 −11.4%（警告线 −15%），其余 ≤ −5%。S-0 与皇极殿提交后的 gate 也均为 8/8。

## 偏差与遗留

- 未触发任务卡 §6 停止条件。
- 未向 REQUESTS.md 追加条目（没有需要越权修改的文件）。
- `"interior": "A:palace-front"` 问题（A 档）原样保留。

## 给 P2-S2（坤宁宫、慈宁宫）的交接事项

1. **复用 throne_hall.py 的新参数**：`dais`、`throneBackOff`、`screenWidthScale`、`screenThick`、`dragR`、`noCaisson`、`extra(cfg)`、`floorW/floorD`；皇极殿 / 养心殿的 py 文件可作为参数模板。
2. **慈宁宫走 kit 公式**（zone JSON → CourtKit.hall）：按任务卡表 w42.1 d26.8 ph1.2 → n=13，tz=10.8，tw=4.53。必须用实测验证，不要只信公式：写个探针读取地面高度和 B 档碰撞盒（我用的 `/tmp/p2s-probe.cjs` 在仓库外，需重写）。
3. **坤宁宫走 PalaceBuilder，且 REAL 数据里没有宝座**：不能套 throne_hall 的宝座逻辑；`tests/p1i-visual.cjs` 读取 `throne.ztb0/ztb1/thW`，坤宁宫没有这些字段，需要给该测试加兜底（测试文件允许小改）或另写一个无宝座的视觉脚本。
4. **Blender 5 文字**：`TextCurve` 没有 `character_spacing`，用 `cu.space_character`；中文字体用 Songti.ttc（养心殿匾额可参考 `yangxin.py` 的 `plaque()`）。
5. **Draco 输出不确定**：验证"无回归"要比较 accessor 数量与 min/max，不要比字节。
6. **提交前** `git restore assets-src/interiors/__pycache__`（Blender 运行会改 pyc，任务卡禁止提交）。
7. **浏览器测试**每条命令都要写完整的 `env -u http_proxy -u https_proxy -u HTTP_PROXY -u HTTPS_PROXY NO_PROXY=127.0.0.1,localhost ...`，zsh 下不要用变量拼命令（会静默无输出）。
8. **registry.js**：当前 `INTERIORS = { taihe, qianqing, huangji, yangxin }`，P2-S2 在此追加 kunning、cining。
9. 顶层 `A:` 前缀 bug 仍在，属 A 档，不要在 S2 里修。

---

# P2-S2 报告：坤宁宫 + 慈宁宫 + 收尾

起点：`73e44ab`，工作区干净，`test:gate` **8/8**（279 s），确认后才开工。

## 提交（P2-S2）

| 子任务 | 提交 | 说明 |
|---|---|---|
| S-3 | f35e886 | `feat(interior): 坤宁宫 S 档内景` |
| S-4 | eb82ee4 | `feat(interior): 慈宁宫 S 档内景（原状推断，低置信）` |

## S-3 坤宁宫 (kunning)

- **建殿路径**：PalaceBuilder（中轴），`REAL['坤宁宫']` 无 `throne`，B 档无宝座 / 屏风 / 藻井。**未使用 `throne_hall.build`**，新写非宝座殿脚本 `assets-src/interiors/kunning.py`，只借 `throne_hall.gold_floor`。
- **实测（B 档）**：地面 y = 6.9375；B 档殿内只有 16 根内柱（x = ±2.56…±17.9，z = ±3.33，半径 0.41），无宝座碰撞；H = 7.244，天花平面 7.194，额枋底约 6.32。中轴通道 |x| < 2.15 通畅。
- **内容（P0 全做 + P1 的灶间 / 神龛 / 神幔）**：
  - 东次间南墙**双扇板门**（门钉、铜拉手、门框、门簪横披）——史实位置，不在明间；
  - 前后檐 bay 6–8 的**直棂吊搭窗**（窗纸 emissive 0.3、直棂、横楗、坎墙）；
  - 东暖阁（bay 0–1）：大红帷帐 + 红地毯 + 红地金「囍」顶棚（3×7 个囍字）+ 囍字影壁（双面）+ 龙凤喜床（四柱帐架、帐幔、床头围屏、囍字）；
  - 门西 4 间：南 / 北 / 西三面炕（U 形，南北炕在明间通道两侧留空）、北炕神龛 + 神位、西隔断前神幔；
  - 后檐东次间：锅灶 2 口 + 浑金毗卢罩 + 熏黑墙面；
  - 东暖阁、西两间各一道隔断（x = ∓12.78 / 12.78，各开 2.4 m 门洞）。
- **p1i-visual 的 throne 问题**：`tests/p1i-visual.cjs` 改为 `throne` 存在走旧机位；不存在时读 JSON 新增的 `views[]`（殿局部坐标，坤宁宫给了 3 个机位），再无则用殿心通用机位。对 taihe / qianqing / huangji / yangxin / cining 行为不变。
- **字体坑**：Songti.ttc 没有「囍」字（只有轮廓残形），改用 STHeiti Medium（囍 / 喜 / 卍 全）。字形面数高（res=3 extrude=0.02 约 2k 三角），故囍字全部 extrude=0 单层、天花 res=1。
- **指标**：17 908 tris；glb 0.09 MB（92 140 B，Draco）；加载 53 ms（loader 测试）/ 41 ms（visual）；碰撞体 13 个（13 个隐藏代理）；可见 mesh 16；draw calls 约 +12 / +14 / +12，tris 约 +17k。
- **p1i-loader PASS**：加载 / 淡入 / 距离触发 / 卸载 / 失败回退全通过。
- **截图**（`/Users/watson/Documents/Codex/故宫/outputs/dev/`）：`p1i-kunning-{B,S}-{1,2,3}.png`；补拍 `p1i-kunning-S-x-{north-kang,south-window,stove,door,bed,bed2,east-ceil,west-curtain,shrine}.png`。目视核对：板门、直棂窗、灶 + 毗卢罩、囍字顶棚 / 影壁 / 喜床、神幔均可见；板门在东次间而非明间；明间通道无碰撞物。
- **置信度**：东次间开板门、直棂吊搭窗、东暖阁（洞房 / 龙凤喜床 / 囍字顶）、三面炕、后檐灶间 + 毗卢罩 —— **高**（A13 官方页）。各间具体尺寸、炕高（0.46 m）、灶数量（2 口）、神龛形制、神幔位置、东暖阁隔断位置、西两间功能 —— **低**（推断，已在 json `source` 注明）。
- **P1 / P2 未做**：殿外烟囱、嘉庆御笔联、神杆、窗纸材质贴图、西尽间功能、穿堂。
- **与 B 档的已知差异（未改 B，S 档做了适配）**：B 档把中间 3 间做成敞开出入口，史实是东次间一扇板门；S 档把板门做在东次间，并在敞开间两侧放炕、明间保持通道。stepwalk 走 x=0 与 walk.cjs 走 x=4.7 均不受影响（门禁 stepwalk 132/132）。

## S-4 慈宁宫 (cining)

- **建殿路径**：zone JSON → `ZoneBase.buildHall` → `CourtKit.hall`（kit 殿，与皇极殿同套），按 kit 公式；脚本 `assets-src/interiors/cining.py` 复用 `throne_hall.build` 的 `dais / throneBackOff / screenWidthScale / screenThick / noCaisson / extra` 参数，无需再改 `throne_hall.py` / `_common.py`。
- **实测与公式一致**：getGroundHeight = 1.2 = ph；B 档宝座碰撞 x ±2.27、z 9.6~12.1、高 3（公式 tz = 10.8，tw = 4.533）。n = 13，bay = 3.238，天花平面 8.75（相对台面）。
- **内容（P0）**：地平床（下层 0.3 可直接迈上，上层 0.6 包住 B 档台座）、宝座（靠背 @ tz + 0.5）、七扇屏风（宽度系数 0.55，厚 0.32，完整包住 B 档屏风盒）、宝座前两侧铜香筒（x ±4.0, z 8.0，带碰撞代理）。无藻井。
- **指标**：7 922 tris；glb 0.04 MB（46 616 B）；加载 36 ms；碰撞体 3 个（4 个隐藏代理）；可见 mesh 7；draw calls 约 +7 / +7 / +6（三个视角，B→S 差值），tris 约 +8k。
- **p1i-loader PASS**；**p1i-visual**：S 档完整覆盖 B 档宝座 / 屏风，无穿模。
- **截图**：`/Users/watson/Documents/Codex/故宫/outputs/dev/p1i-cining-{B,S}-{1,2,3}.png`（1：门内望宝座；2：宝座前近景；3：因无藻井，机位仰视天花）。
- **置信度（单列）**：
  - 殿身尺寸（42.1 × 26.8 / 7 间前后廊）：高（间数）/ 中（米数）——来自 zone JSON，非本任务产物；
  - 「太后正宫、明间设宝座与屏风」这一**事实**：**中**（dpm 官方页文字描述，无原状实物 / 照片）；
  - **宝座形制、屏风扇数与样式、地平床尺寸、香筒**：**低**，纯推断——慈宁宫现为雕塑馆，原陈设不存，资料中无殿内原状图（仅有《慈宁燕喜图》未据以建模）；
  - 无藻井：**低**（资料「未查到」，推断井口天花）。
  - JSON `source` 已写「【推断，低置信】」。
- **P1 / P2 未做**：《慈宁燕喜图》典礼陈设、殿内匾联、旋子彩画贴图、后寝殿大佛堂、月台四香炉 / 慈宁门麒麟 / 御路石（属外景，不在 S 档范围）。

## 四座殿 + 前两座汇总（P2-S 全部）

| 殿 | tris | glb | 加载 ms | 碰撞体（代理） | 置信度 |
|---|---|---|---|---|---|
| 皇极殿 | 24 096 | 0.16 MB | 56 | 5（6） | 柱 / 藻井 / 宝座配置高；尺寸中；藻井、台尺寸低 |
| 养心殿 | 8 852 | 0.06 MB | 36 | 10（11） | 宝座 / 匾 / 面西宝座 / 黄纱高；隔断位置中低 |
| 坤宁宫 | 17 908 | 0.09 MB | 53 | 13（13） | 板门 / 窗 / 暖阁 / 炕 / 灶高；尺寸、炕高、灶数、西两间低 |
| 慈宁宫 | 7 922 | 0.04 MB | 36 | 3（4） | 宝座存在中；形制 / 屏风 / 香筒低（推断） |

四座全部远低于预算（tris ≤ 400k 目标 ≤ 80k；体积 ≤ 8 MB 目标 ≤ 1 MB）。

## 最终门禁（`npm run test:gate`，eb82ee4 的全部内容：四座 + 坤宁宫 + 慈宁宫）

起点（73e44ab）8/8；坤宁宫完成后 8/8；慈宁宫完成后（含慈宁宫改动，随后原样提交为 eb82ee4）8/8：

| 步骤 | 结果 | 说明 | 耗时 |
|---|---|---|---|
| build | ✅ | built 1.59s | 2s |
| zones | ✅ | 0 错 23 警告 | 1s |
| anchors | ✅ | 比较 113 条，超差 0 | 0s |
| smoke | ✅ | colliders 6560，pageerror 0，console 6 | 11s |
| regression | ✅ | 24/24 | 43s |
| stepwalk | ✅ | 132/132 | 15s |
| stepwalk-auto | ✅ | 152/152 | 14s |
| perf | ✅ | calls/tris 无劣化 | 190s |

perf：calls/tris 全部远低于 perf-p0c 基线；fpsP5 最大降幅宁寿宫 −12.4%（警告线 −15%），其余 ≤ −8.3%。

## 偏差与遗留（P2-S2）

- 未触发任务卡 §6 停止条件；未改任何不可改文件；未向 REQUESTS.md 追加条目。
- 修改的 `tests/p1i-visual.cjs`：仅加无 throne 时的机位兜底（任务卡 §3 允许的"小改"）。
- `p1i-visual` 退出码为 1 是**既有现象**：控制台唯一 error 是 `/favicon.ico` 404（已用 console location 确认 taihe、kunning 的 404 都是 `/favicon.ico`；huangji、cining 同样 404 且退出码 1，未逐个查 URL；与本任务无关）。脚本把任何 console error 当失败。建议 L0 另行处理（改测试过滤 favicon，或给 `index.html` 加 favicon 链接）。
- `__pycache__/*.pyc` 已 `git restore`，未提交。
- `"interior": "A:palace-front"` 问题（A 档）原样保留，慈宁宫的 zone JSON 同样带该字段，未动。
- 已知限制：S 档 GLB 仅在玩家距殿 ≤ 15 m 时加载，坤宁宫 / 慈宁宫 / 皇极殿 / 养心殿的 B 档仍是始终存在的基底，S 档叠加其上；B 档 3 间敞开出入口（坤宁宫）与史实不符，属 B 档，S 档做了适配、未改 B。
- 手动验证建议（L0）：真人走一遍坤宁宫（x=0 中轴、东次间板门、东暖阁门洞、炕前），看喜床 / 灶 / 炕的碰撞手感；慈宁宫走到宝座前确认地平床可迈上。
