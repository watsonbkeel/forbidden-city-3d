# P2-S · S 档内景扩展（养心殿 / 皇极殿 / 坤宁宫 / 慈宁宫）

> 基线：标签 `p2a-done`（586634b，test:gate 8/8）。分支 `feat/p2-interior-s`，worktree `../fc-interior-s`，端口 **5191**。
> 前置阅读：`docs/ARCHITECTURE-1to1.md`、`docs/agent-tasks/P1-COMMON.md`、`docs/agent-tasks/REPORTS/P1-I.md`（§2 管线、§5 新增殿步骤）、`data/interiors/schema.md`。

## 0. 必须先知道的三件事（L0 核查 2026-10-13）

1. **InteriorLoader 从未接进 main.js。** P1-I 的接线提交 2b1292d / 1f01647 在孤立分支上，不是 `p2a-done` 的祖先。现状：运行时连太和殿 / 乾清宫的 S 档都不会加载，P1-I 报告的 stepwalk 132/132 是在「未接线」状态下测的。→ 本任务第一步 **S-0** 先补接线并重跑全量门禁。
2. **四座殿分属两套建殿代码，B 档宝座公式不同：**
   - 坤宁宫：中轴 `PalaceBuilder.buildHall`（同太和殿 / 乾清宫），但 `REAL['坤宁宫']` **没有 throne**（B 档无宝座）。
   - 养心殿 / 皇极殿 / 慈宁宫：zone JSON → `ZoneBase.buildHall` → `CourtKit.hall`（`src/scene/palace/kit.js:363`）。这三座的宝座、柱网、天花都按 **kit 公式**生成，**不能照抄 P1-I 的 PalaceBuilder 推导**（`taihe.py` / `qianqing.py` 的注释只适用于中轴殿）。
3. **zone JSON 的 `"interior": "A:palace-front"` 字段目前不生效**：`ZoneBase.buildHall` 不透传 `interior`，而且就算透传，`furnishRoom` 也不认识带 `A:` 前缀的值（会退回 empty）。S 档只认 `registry.js`，不依赖这个字段；**不要在本任务里修它**（属于 A 档，已在 L0 收尾报告登记）。

## 1. 已算好的 B 档参数（殿局部坐标：原点殿中心，南 −Z，单位 m）

kit 公式：`n = max(3, round(w/3.6)|1)`，`bay = w/n`，宝座 `tz = d/2 − min(2.6, 0.3d)`（无 backDoor），`tw = min(1.4·bay, 5)`；宝座碰撞 `x ±tw/2, z [tz−1.2, tz+1.3], 高 3`；屏风 `tw·0.8 × 2.6 × 0.25 @ z=tz+1.15`，顶到 y0+3.1；天花是一整块平面，高度 `y0 + colH − beamH`，`beamH = clamp(0.12·colH, 0.45, 0.85)`；**kit 殿只有前后檐两排柱，殿内没有金柱**。

| 殿 | id | 建殿 | 世界中心 | w × d | 台明 ph | 间数 n / 每间 | B 档宝座 tz / tw | 室内净高（到天花） |
|---|---|---|---|---|---|---|---|---|
| 皇极殿 | `huangji` | kit（ningshou） | (−293.2, 287.7) | 49.8 × 26.3 | 1.5 | 15 / 3.320 | 10.55 / 4.65 | 7.79 |
| 养心殿 | `yangxin` | kit（west-six） | (108.6, 277.5) | 36 × 12 | 0.6 | 11 / 3.273 | 3.40 / 4.58 | 6.83 |
| 慈宁宫 | `cining` | kit（outer-west） | (222.0, 204.7) | 42.1 × 26.8 | 1.2 | 13 / 3.238 | 10.80 / 4.53 | 8.75 |
| 坤宁宫 | `kunning` | PalaceBuilder（中轴） | (0, 386.1) | 46 × 20 | 后三宫台 5 + 台明 | 9 / 5.111，nd 3 / 6.667 | **无宝座** | H = clamp((26 − 地面y)·0.38, 5, 11) |

> 动手前用 `p1i-visual` 的 B 档截图 + `getGroundHeight` 实测核对地面 y 和宝座位置；表中数值是按公式算的，以实测为准。

## 2. 每座殿的内容范围（只做考证文档里的 P0，P1 有余力再做）

| 顺序 | 殿 | 考证文档 | P0 内容 | 难点 / 约束 |
|---|---|---|---|---|
| 1 | 皇极殿 | `docs/research/interiors-huangji.md` | 4 根贴金蟠龙柱（宝座四周）、八角浑金蟠龙藻井、宝座 + 屏风 + 地平床 | 最接近 `throne_hall.py` 模板，先做它来验证 kit 殿的套法。**藻井只能往下挂**：B 档天花是一整块平面，盖住往上凹的部分；不改 kit.js（如必须开洞，写 REQUESTS） |
| 2 | 养心殿 | `interiors-yangxin.md` | 明间宝座 + 屏风 +「中正仁和」匾；东暖阁西向宝座 + 黄幔；明间与东西暖阁之间的隔断 | 进深只有 12 m，**不能套 7 级踏跺**；隔断不得挡住从前门到殿内的通道（stepwalk「内右门→养心殿内」终点为殿心南 2 m） |
| 3 | 坤宁宫 | `interiors-kunning.md` | 东暖阁（红色洞房、龙凤喜床、囍字顶）、西侧三面炕、东次间板门 | **不是宝座殿**，不要用 `throne_hall.py`；需要新写非宝座殿脚本（照 P1-I §5 第 3 条的约定）；schema 的 `throne` 字段可省略，但 `tests/p1i-visual.cjs` 会读 `throne.ztb0`，需给出机位替代值或在测试里兜底 |
| 4 | 慈宁宫 | `interiors-cining.md` | 明间太后宝座 + 屏风（**原状，资料低置信**） | 现为雕塑馆，原陈设不存；按原状推断做，JSON `source` 注明推断，报告里单列置信度。**若前三座已耗尽上下文，本殿可延到下一轮** |

## 3. 文件所有权

| 可改 | 说明 |
|---|---|
| `main.js` | **仅 S-0 接线的 4 处**（L0 授权，见 §4） |
| `data/interiors/{huangji,yangxin,kunning,cining}.json` | 新增 |
| `src/scene/interior/registry.js` | 只追加 import 和 INTERIORS 条目 |
| `assets-src/interiors/*.py` | 新增脚本；`throne_hall.py` / `_common.py` **只做向后兼容的扩展**（新增可选参数），不改变太和殿 / 乾清宫的导出结果 |
| `public/models/interiors/*.glb` | 新增 |
| `tests/p1i-*.cjs` | 只做兼容新殿的小改（如无 throne 时的机位兜底） |
| `docs/agent-tasks/REPORTS/P2-S.md`、`REQUESTS.md`（追加行） | 报告与跨文件请求 |

**不可改**：`data/zones/*.json`、`src/scene/palace/kit.js`、`src/scene/PalaceBuilder.js`、`src/scene/zones/*`、`src/scene/interior/InteriorLoader.js`（发现 bug 写 REQUESTS）、`tests/stepwalk*.cjs`、`tests/lib/*`、`tests/perf-*.json`。
**不提交** `assets-src/interiors/__pycache__/*.pyc` 的新改动（`git restore` 掉）。

## 4. 子任务与验收

### S-0 接线（先做，不过不准往下）
在 `main.js` 4 处接线（参考孤立提交 `git show 2b1292d`，但**不要照抄它的 `hudLine` 覆盖那一行**：它调用的 `getLoadedCount()` 不存在）：
1. import：`import { InteriorLoader } from './src/scene/interior/InteriorLoader.js';`
2. 「碰撞检测」步骤里 `this.rooms = ...` 之后：`this.interiors = new InteriorLoader(this.scene, this.collisionManager, { renderer: this.renderer });`
3. `animate` 里 `zoneManager.update` 之前：`this.interiors?.update(this.camera.position);`
4. `dispose()` 里：`this.interiors?.dispose();`

PerfHUD 显示内景那一行**不做**（要改 PerfHUD.js，不在所有权内）。

验收：
- [ ] `p1i-loader taihe`、`p1i-loader qianqing` PASS
- [ ] **全量 test:gate 8/8**（接线后 stepwalk 走进太和殿 / 乾清宫会真的加载 GLB，GLB 的踏跺 / 陈设碰撞可能挡住绕宝座的路线，这是本步重点风险）
- [ ] 若 stepwalk 因 GLB 碰撞失败：**改 GLB 碰撞代理**（太和殿 / 乾清宫脚本重新导出），不改路线；改不动就停下写报告
- [ ] 单独提交：`feat(integrate): main.js 接线 InteriorLoader（补 P1-I 遗漏）`

### S-1 ~ S-4 每座殿
- [ ] `data/interiors/<id>.json` + registry 条目；`frame` 与 zone JSON / Layout.js 一致；`throne` 按 §1 的 **kit 公式**（坤宁宫可省略）
- [ ] 建模脚本 + GLB：tris ≤ 400k（**目标 ≤ 80k**），体积 ≤ 8 MB（**目标 ≤ 1 MB**）；Blender `/Applications/Blender.app/Contents/MacOS/Blender -b -P <脚本> -- public/models/interiors/<id>.glb`
- [ ] GLB 完整包住 B 档宝座 / 屏风盒子，不穿模；殿内新增的柱子 / 隔断**不挡从前门到殿内 1 m 的通道**（stepwalk-auto 每座 enter 殿都会走到殿内 1 m）
- [ ] `p1i-loader <id>` PASS；`p1i-visual <id>` 出 B / S 对比图（`../outputs/dev/p1i-<id>-*.png`），自己看一遍并在报告里贴路径
- [ ] 每座殿做完跑一次 test:gate，8/8 才算完成
- [ ] 每座殿一个提交：`feat(interior): <殿名> S 档内景`

### 收尾
- [ ] 最终 test:gate 8/8（贴结果表）
- [ ] `docs/agent-tasks/REPORTS/P2-S.md`：每座殿的 tris / MB / 加载耗时 / 碰撞代理数 / 截图路径 / 置信度 / 未做的 P1 内容
- [ ] 不合并 main、不打标签、不推送，交 L0 验收

## 5. 测试命令

```bash
cd /Users/watson/Documents/Codex/故宫/fc-interior-s
# 浏览器测试必须绕开系统代理，否则 vite 页面加载失败（每条命令都带 env -u …，zsh 下不要用变量拼命令）
env -u http_proxy -u https_proxy -u HTTP_PROXY -u HTTPS_PROXY NO_PROXY=127.0.0.1,localhost PORT=5191 tools/run-with-vite.sh node tests/p1i-loader.cjs huangji
env -u http_proxy -u https_proxy -u HTTP_PROXY -u HTTPS_PROXY NO_PROXY=127.0.0.1,localhost PORT=5191 tools/run-with-vite.sh node tests/p1i-visual.cjs huangji
env -u http_proxy -u https_proxy -u HTTP_PROXY -u HTTPS_PROXY NO_PROXY=127.0.0.1,localhost PORT=5191 npm run test:gate
```
`node_modules` 是指向主仓 `forbidden-city-3d/node_modules` 的软链接，不要在 worktree 里 `npm install`。

注意：本机 shell 的 `grep` 不支持 `\|` 交替写法，搜代码用 `grep -E 'a|b'` 或编辑器搜索。

## 6. 停止条件（遇到就停，写进报告 / REQUESTS，不要硬改）
- 需要改 zone JSON / kit.js / PalaceBuilder.js / InteriorLoader.js 才能做下去
- S-0 接线后门禁失败，且改 GLB 碰撞代理解决不了
- 某座殿 GLB 超预算、加载失败、或让任何已有路线失败
