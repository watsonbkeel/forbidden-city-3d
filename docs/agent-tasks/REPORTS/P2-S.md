# P2-S1 报告：S-0 接线 + 皇极殿 + 养心殿

分支 `feat/p2-interior-s`（worktree `fc-interior-s`，端口 5191）。未合并 main、未打标签、未推送。
范围：任务卡 §4 的 S-0 / S-1 皇极殿 / S-2 养心殿。坤宁宫、慈宁宫留给 P2-S2。

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

## 门禁结果（`npm run test:gate`）

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
