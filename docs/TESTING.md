# 测试与门禁（P1-T）

坐标系：真实米制，原点太和殿中心，**+Z 向北，x 负 = 东**。所有机位 / 路线坐标都从 `src/config/constants.js` 的 `LAYOUT`、`data/anchors.json`、`data/zones/*.json` 推导，下表数值是当前 main 推导结果，仅供查阅——**改场景时不要改测试里的数字，改数据源**。

## 1. 环境约定

| 项 | 约定 |
|---|---|
| node | PATH 上的 Node.js（本轮 Linux 验证为 v24.19.0）；下文 `$NODE` 可先设为 `node`，或指定绝对路径 |
| playwright | 先运行 `npm ci`，使用仓库锁定的本地依赖；不再依赖个人目录的 `NODE_PATH` |
| 浏览器 | `BROWSER_EXECUTABLE_PATH` 优先；否则自动查找 Linux Chromium/Chrome、macOS Chrome/Chromium 或 Windows Chrome，再回退 Playwright 管理的 Chromium。headless + `--use-angle=swiftshader`（CPU 软渲染：fps 不代表真机，只看 calls / tris / 画面） |
| 构建 | `npx vite build --outDir /tmp/fc-build-<task>`（不要 `npm run build`，会写仓库 `dist/`） |
| 超时 | 没有 `timeout`，用 `perl -e 'alarm N; exec @ARGV' <cmd>` |
| curl | 一律 `--noproxy '*'` |

### 端口（每个 Agent 一个，避免互相杀 vite）

| 任务 | 端口 | 任务 | 端口 |
|---|---|---|---|
| P1-T | 5181 | P1-Z-east-six | 5185 |
| P1-R | 5182 | P1-Z-west-six | 5186 |
| P1-U | 5183 | P1-Z-ningshou | 5187 |
| P1-I | 5184 | P1-Z-outer-east | 5188 |
| P1-Z-axis | 5190 | P1-Z-outer-west | 5189 |

浏览器类脚本都读 `PALACE_URL`（默认 `http://127.0.0.1:5173`）。统一入口：

```sh
PORT=5181 tools/run-with-vite.sh $NODE tests/<脚本>.cjs [参数]
```
在当前 worktree 根目录通过 Bash 起 vite（`--strictPort`），就绪后设好 `PALACE_URL` 跑命令，保留调用者已有环境；结束仅关闭自己创建的 vite 进程，端口已占用或启动失败则明确退出；整体 2400 s alarm。

Linux 示例：

```sh
npm ci --cache /tmp/fc-npm-cache   # HOME 不可写时指定可写缓存
NODE=node
BROWSER_EXECUTABLE_PATH=/usr/bin/chromium PORT=5181 tools/run-with-vite.sh "$NODE" tests/smoke.cjs
node --test tests/browser-path.test.cjs tests/world-node.test.mjs
```

浏览器运行环境须允许 Chromium 的本地 IPC socket；如果在启动阶段出现 `socket() failed: Operation not permitted`，属于运行环境限制，不能据此宣称浏览器测试通过。

## 2. 一键门禁 `npm run test:gate`

```sh
PORT=5181 $NODE tests/gate.cjs            # = npm run test:gate（自己起停 vite，不需要 run-with-vite.sh）
PORT=5181 $NODE tests/gate.cjs --keep-going
GATE_SKIP=perf,regression PORT=5181 $NODE tests/gate.cjs
GATE_VISUAL=1 PORT=5181 $NODE tests/gate.cjs   # 追加截图回归（只警告）
```

顺序（任一失败即停，`--keep-going` 跑完）：

| 步骤 | 命令 | 判定 |
|---|---|---|
| build | `vite build --outDir /tmp/fc-build-gate-<PORT>` | 退出码 0 |
| zones | `tests/zone-lint.cjs` | 0 错（警告不挡） |
| anchors | `tests/anchor-check.cjs` | 超差 0 |
| smoke | `tests/smoke.cjs` | 无 pageerror |
| regression | `tests/regression.cjs` | 24/24；失败自动重跑 1 次（swiftshader 截图偶发超时） |
| stepwalk | `tests/stepwalk.cjs 60,10 0,1 all` | 失败 0 |
| stepwalk-auto | `tests/stepwalk-auto.cjs 60,10 0,1 all` | 失败 0（knownIssue 单列不计） |
| perf | `tests/perf.cjs /tmp/fc-gate-<PORT>/perf.json` 对比 `tests/perf-p2.json` | 任一点 calls 或 tris 劣化 > 10% = 失败 |
| visual（可选） | `tests/visual.cjs` | `GATE_VISUAL=1` 才跑；超阈值只记 ⚠，不影响退出码 |

环境变量：`PORT`（默认 5181）、`BUILD_DIR`、`PERF_BASELINE`（默认 `tests/perf-p2.json`，P2 发布时重定；`perf-p0c.json` 留档）、`PERF_FPS_STRICT=1`、`GATE_SKIP`、`GATE_VISUAL=1`。
日志：`/tmp/fc-gate-<PORT>/<步骤>.log`；结束打印 Markdown 汇总表，有失败退出码 1。整套约 8–10 分钟。

### fps 规则

任务卡原规则是 fpsP5 下降 > 15% 判失败。实测同一提交连跑两次 fpsP5 差 −1.6%～−50%，多 Agent 共享 CPU 时比基线低 50–77%，而 calls/tris 三次完全一致。因此 **fps 默认只警告**，`PERF_FPS_STRICT=1` 恢复为失败（只建议在独占机器 / CI 上开）。

## 3. 各脚本

### 纯 node（不需要 vite）

| 脚本 | npm | 用法 | 说明 |
|---|---|---|---|
| `zone-lint.cjs` | `test:zones` | `node tests/zone-lint.cjs [--no-geo]`；`ZONES_DIR=<dir>` 指向另一份 JSON | schema / id / bounds；区间重叠=错、缝隙=警告、neighbors；门洞两侧通行（中心被占 / 净空 <1.5 m / 12 m 内死角 = 错，<4 m = 警告）；enter 殿门前 2 m（中线走不进 = 错）。几何检查用 `tests/lib/world.mjs` 在 node 里建全场景碰撞世界（~1 s） |
| `anchor-check.cjs` | `test:anchors` | `node tests/anchor-check.cjs` | 有名建筑与 `data/anchors.json` 中心偏差：conf 低 15 m、其余 5 m |
| `stepwalk-auto.cjs --check` | — | `node tests/stepwalk-auto.cjs --check` | 在 node 碰撞世界里预检自动路线（区分"生成算法问题"与"场景缺陷"） |
| `stepwalk-auto.cjs --list` | — | | 打印 32 条自动路线及生成说明 |

### 浏览器（经 `run-with-vite.sh` 或自设 `PALACE_URL`）

| 脚本 | npm | 用法 | 说明 |
|---|---|---|---|
| `smoke.cjs` | `test:smoke` | 无参数 | 加载完成 + 无 pageerror；console error 只记录 |
| `regression.cjs` | `test:regression` | 无参数 | 24 项：几何（四门门洞通行、侧墙阻挡、午门凹口空地 `WUMEN_WING_GAP`、河道开孔/水面、桥/桥栏、亭台/花园碰撞、sRGB）+ 画质切换/资源释放 + 键盘与移动端双指摇杆 + 无 pageerror |
| `stepwalk.cjs` | `test:walk` | `[fps=60,20,10] [sprint=0,1] [axis\|side\|all\|名称子串]`；`DUMP=1` 打印坐标 | 固定帧间隔逐帧调用真实 `FirstPersonControls.update`；判到达每个途经点、不"掉到台下"。33 条 × fps × sprint |
| `stepwalk-auto.cjs` | — | 同上 | 从 zone JSON 生成：每座有名 enter 殿 院门外→门内→殿前 2 m→殿内 1 m→返回；+2 条跨区（另判"所在区未加载时行走距离 ≤ 1 m"） |
| `perf.cjs` | `test:perf` | `[输出=tests/perf-baseline.json]`；`QUERY_STRING`、`SCALE`、`FRAMES` | 6 点各采 60 帧（主循环照跑），1280×720 |
| `visual.cjs` | `test:visual` | `[--update] [机位名子串]`；`VISUAL_DIR`、`VISUAL_THRESHOLD` | 12 机位截图回归，见 §5 |
| `shot.cjs` | — | `输出名 x,y,z lx,ly,lz …` | 开发目视截图，输出 `../outputs/dev/` |
| `realwalk.cjs` | — | `x0,z0 x1,z1 [秒]` | 真实主循环按住前进直走 |
| `probe.cjs` | — | `"<JS 表达式>"`（可用 `a`=app、`THREE`、`v(x,z,feetY)`） | 调试探针 |
| `sense.cjs` | — | | 在场感：镜头起伏、脚步、碰撞漂移、音效生命周期 |
| `walk.cjs` | — | | 旧版步行（不推进分区加载），以 stepwalk 为准 |
| `zone-equiv.cjs` | `test:zone-equiv` | | **已退役**（分区重构零变化证明），不在门禁内 |

npm 脚本里的命令是裸 `node tests/x.cjs`，不起 vite；需要浏览器的用 `PORT=… tools/run-with-vite.sh $NODE tests/x.cjs`。

R3 测试夹具：门洞仍按 0.5 m 连续采样，但排除玩家半径越过世界边界的点（神武门北侧 z=560 是世界边界，不是门洞）；真实神武门锚点偏差仍独立检查。桌面 DPR=2 的 SwiftShader 截图允许 120 s，视口、画质与全部断言不变。上述中和殿与交泰殿路线沿真实中门、台阶绕行，不穿新的围护或栏墙。

## 4. 机位坐标表

### stepwalk.cjs 内置路线（33 条，[x, z]）

| 路线 | 途经点 |
|---|---|
| 午门→太和门 | (0,−470) → (0,−194.2) |
| 太和门→太和殿内 | (0,−194.2) → (0,5) |
| 太和殿→中和殿→保和殿 | (0,3) → (0,0) → (6.2,0) → (6.2,16) → (0,16.5) → (0,58) → (5,58) → (5,72.2) → (0,72.2) → (0,76) → (0,116.2) → (6.1,116.2) → (6.1,133.7) → (0,133.7) |
| 保和殿→北下台→乾清门 | (0,133.7) → (0,205.3) |
| 乾清门→乾清宫 | (0,205.3) → (0,310.8) |
| 乾清宫→交泰殿→坤宁宫 | (0,310.8) → (5.7,310.8) → (5.7,327.8) → (0,327.8) → (0,349.4) → (6.5,349.4) → (6.5,361.3) → (0,361.3) → (0,394.1) |
| 坤宁宫→御花园→神武门 | (0,394.1) → (0,429.7) → (17,432.7) → (17,509.3) → (0,509.3) → (0,550) |
| 乾清宫偏中轴(x=2.3) | (2.3,221.3) → (2.3,303.1) |
| 太和殿后→中和殿前(x=2.5转中阶) | (2.5,21.1) → (2.5,48) → (0,48) → (0,50.4) |
| 协和门→文华门→文华殿内 | (−30,−300.3) → (−126.2,−300.3) → (−186.3,−253.2) → (−186.4,−188.7) → (−189.9,−188.7) → (−189.9,−179.3) |
| 协和门→东华门→出宫 | (−30,−300.3) → (−126.2,−300.3) → (−340.8,−257) → (−390,−257) |
| 熙和门→武英门→武英殿内 | (30,−301.1) → (129.8,−301.1) → (220.8,−257.8) → (220.8,−241.8) → (219.5,−188.5) |
| 熙和门→西华门→出宫 | (30,−301.1) → (129.8,−301.1) → (335.5,−260.6) → (390,−260.6) |
| 左翼门→文渊阁一带 | (−75,−53.1) → (−130.5,−53.1) |
| 内左门→东一长街→景仁宫内 | (−62.4,183.8) → (−62.4,296.2) → (−92.4,296.2) → (−92.4,310.2) → (−93.4,329) |
| 内右门→养心殿内 | (65.4,183.9) → (65.4,248.9) → (84.4,248.9) → (108.6,260) → (108.6,275.5) |
| 西一长街→月华门→乾清宫院 | (65.4,183.9) → (65.4,249.2) → (40,249.2) |
| 乾清宫院→日精门→东一长街→基化门 | (−40,249.6) → (−63.3,249.6) → (−63.3,410) → (−40,410) |
| 御花园→钦安殿内→穿殿北出 | (0,433.7) → (0,473.1) → (0,492.1) → (3.5,492.1) → (3.5,499.1) → (0,499.1) → (0,509.1) |
| 御花园→万春/千秋亭 | (0,433.7) → (0,429.7) → (17,429.7) → (17,455.5) → (32,455.5) → (32,470.5) |
| 御花园→千秋亭(西) | (0,433.7) → (0,429.7) → (−17,429.7) → (−17,455.5) → (−32,455.5) → (−32,470.5) |
| 御花园→浮碧亭(桥) | (0,433.7) → (0,429.7) → (32,429.7) → (32,445.7) |
| 御花园→澄瑞亭(桥) | (0,433.7) → (0,429.7) → (−32,429.7) → (−32,445.7) |
| 景运门→箭亭→东路 | (−80,174.1) → (−124.2,174.1) → (−124.2,60.8) → (−154.7,60.8) → (−154.7,78.8) |
| 午门外→午门门洞→金水桥北 | (0,−470) → (0,−330.8) |
| 东侧金水桥(x=−15) | (−15,−330.8) → (−15,−290.8) |
| 顺贞门→神武门→出宫 | (0,512.3) → (0,550) |
| 东华门出宫 | (−340.8,−257) → (−390,−257) |
| 西华门出宫 | (335.5,−260.6) → (390,−260.6) |
| 中左门过(台外) | (−72,−30) → (−77,−30) → (−77,5) |
| 后左门过(台外) | (−72,110) → (−76.4,110) → (−76.4,140) |
| 西一长街→夹道→永寿门 | (63,300.8) → (95.4,300.8) → (95.4,311.6) |
| 文华殿院北夹道→文渊阁院 | (−150,−153) → (−186.5,−153) → (−186.5,−145) |

御花园路线（20–23 号）取点依赖园内亭子位置；P1-Z-axis 按锚点挪亭后需同步（P1-COMMON §4 例外条款）。

### stepwalk-auto.cjs 自动路线（32 条）

坐标运行时由 `tests/lib/auto-routes.mjs` 从 zone JSON 生成，`$NODE tests/stepwalk-auto.cjs --list` 打印清单、`DUMP=1` 打印坐标。当前：east-six 7、garden 1、ningshou 4、outer-east 2、outer-west 8、west-six 8、跨区 2（中轴→东六宫景仁宫→宁寿宫皇极殿→回中轴；中轴→景运门→锡庆门→皇极殿→回中轴）。

### perf.cjs（6 点，眼高 1.7，yaw 0 = 面向北；基线 `tests/perf-p2.json`）

| 点 | 位置 [x, z] | 推导 | 基线 calls | 基线 tris |
|---|---|---|---|---|
| 午门前 | (0, −470) | `LAYOUT.START_POSITION` | 604 | 1,387,343 |
| 太和殿前 | (0, −74) | 三台南沿 − 20 | 746 | 1,973,543 |
| 乾清门 | (0, 195.3) | `QIANQING_GATE_Z − 20` | 412 | 1,270,335 |
| 东六宫中 | (−120.8, 382.6) | 东二长街中线 | 256 | 893,715 |
| 宁寿宫 | (−293.2, 164.1) | 锚点「皇极门」+10 | 260 | 733,227 |
| 御花园 | (0, 433.7) | 园南墙 + 11 | 278 | 1,016,815 |

### visual.cjs（12 机位，960×540 @DPR1；眼位 y = 该处地面 + 1.7）

| 机位 | 眼位 [x, z] | 高度 | 看向 [x, y, z] | 推导 |
|---|---|---|---|---|
| 01-午门外广场 | (0, −470) | 地面 | (0, 12, −419.6) | START_POSITION → WUMEN_Z |
| 02-金水桥南望太和门 | (0, −330.8) | 地面 | (0, 8, −214.2) | JINSHUI_RIVER_Z − 20 → TAIHE_GATE_Z |
| 03-太和门广场东望 | (−40, −280.8) | 地面 | (−106.5, 6, −300.8) | 河北 30 m 望协和门 |
| 04-太和殿前 | (0, −74) | 地面 | (0, 15, 0) | 三台南 20 m |
| 05-太和殿内 | (0, −6) | 最高可行走面（台上 9.94） | (0, 11, 8) | TAIHE_Z − 6 |
| 06-乾清门广场 | (0, 195.3) | 地面 | (0, 6, 215.3) | QIANQING_GATE_Z − 20 |
| 07-东二长街 | (−120.8, 382.6) | 地面 | (−120.8, 4, 462) | east-six「东二长街」中心望北端 |
| 08-景仁宫院 | (−93.4, 311) | 地面 | (−93.4, 5, 331) | 景仁宫 hall − 20 |
| 09-养心殿前 | (108.6, 260) | 地面 | (108.6, 5, 277.5) | 养心殿 hall − 17.5 |
| 10-宁寿宫皇极门内 | (−293.2, 164.1) | 地面 | (−293.2, 8, 284.1) | 锚点皇极门 + 10 |
| 11-御花园 | (0, 433.7) | 地面 | (0, 6, 493.1) | 园南墙 + 11 望钦安殿 |
| 12-鸟瞰中轴 | (0, −530) | 160 | (0, 0, −214.2) | 午门外 60 m 高空 |

## 5. 截图回归 `tests/visual.cjs`

```sh
PORT=5181 tools/run-with-vite.sh $NODE tests/visual.cjs            # 对比：输出 tests/visual/<分支>/
PORT=5181 tools/run-with-vite.sh $NODE tests/visual.cjs 太和殿     # 只跑名称含"太和殿"的机位
```

- 确定性：注入固定种子 `Math.random`，停主循环，每个机位 `ensureLoadedAt` + 20 次 `update` + 清空 `buildQueue` 后手动渲染两次再截图；隐藏 HUD/欢迎层，只截 3D 画面。同一版本两次对比差异 0–0.04%。
- 判定：任一通道差 > 24 记差异像素；占比 > 2%（`VISUAL_THRESHOLD`）= FAIL；无基线也算 FAIL；pageerror 退出 1。
- 输出：`tests/visual/<分支>/<机位>.png`、`<机位>.diff.png`（灰度底 + 红色差异像素）、`report.json`（每机位差异%、脚点、已加载区、calls）。分支目录已 `.gitignore`，**只有 `tests/visual/main/` 入库**（12 张约 6.5 MB）。
- 不进门禁必过项：画面变化是 P1-R / P1-Z / P1-I 的正常产出。门禁里 `GATE_VISUAL=1` 只给 ⚠ 提示。合并前由总控看差异图判断。

## 6. 更新基线

| 基线 | 何时更新 | 怎么更新 |
|---|---|---|
| `tests/visual/main/*.png` | 画面变化经总控确认合理、合入 main 后 | 在 main（或刚合并的提交）上：`PORT=… tools/run-with-vite.sh $NODE tests/visual.cjs --update`，目视抽查后单独提交「visual 基线更新：原因」 |
| `tests/perf-p2.json`（原 `perf-p0c.json`） | P1-R 有意降 calls/tris，或场景内容有意增加并被批准 | `PORT=… tools/run-with-vite.sh $NODE tests/perf.cjs tests/perf-<阶段>.json`，在 gate 里用 `PERF_BASELINE=` 指向新文件，确认后再把 gate 默认值改过去（P1-T 改） |
| regression / stepwalk 取点 | 场景挪动导致取点失效 | 不要在别的任务里改；写 `docs/agent-tasks/REQUESTS.md`（路线名 + 新取点），P1-T 或总控合并时同步。取点用 `tests/lib/world.mjs` 在新旧两种几何下都验证一遍（R2 即为此改成 [25,−20]） |
| stepwalk-auto | 不需要：路线从 zone JSON 自动生成 | 新路线失败时先 `--check` 判断是生成算法还是场景缺陷；场景缺陷写 REQUESTS 并临时放入 `KNOWN_ISSUES` |

## 7. CI 接入建议

1. 运行环境：macOS、Linux 或 Windows + Chrome/Chromium。使用 `BROWSER_EXECUTABLE_PATH=/usr/bin/google-chrome` 等显式选择，不必改测试源码；也可安装 Playwright 管理的 Chromium。需要支持 swiftshader（`--enable-unsafe-swiftshader`）。`tools/run-with-vite.sh` 需要 Bash、curl、Perl；Windows 可直接用 `node tests/gate.cjs`。
2. 分两级：
   - **快速级**（每次 push，< 30 s）：`npm run test:zones && npm run test:anchors && node tests/stepwalk-auto.cjs --check`——纯 node，无浏览器。
   - **完整级**（合并 PR 前）：`PORT=5181 npm run test:gate`，失败时上传 `/tmp/fc-gate-5181/*.log` 作为产物。
   - **视觉级**（可选/夜间）：`GATE_VISUAL=1`，上传 `tests/visual/<分支>/` 的 diff 图供人工审阅。
3. CI 独占机器上可开 `PERF_FPS_STRICT=1`；共享 runner 不要开。
4. 端口固定一个（CI 里只有一个 gate），`--strictPort` 保证端口被占时直接报错而不是误连别人的 vite。
5. 超时：gate 单步自带超时（build 300 s、regression 900 s、stepwalk 1800 s、perf 1200 s），外层建议 45 min。
