# R158 内阁东西三间黄瓦厢房：文字依据简化候选

Base remote `899b96687cf30c173e02e299003cdbd8e36d0ba3` / local `9f67ee103e7f689004daa1be5d0edbc4e8c77d84`，tree `1eabe1cf139489e36519b934607dc9fc4cdf1602`。

## 必须区分的依据
- [故宫内阁大堂正文](https://www.dpm.org.cn/explore/building/236523.html) 明确：东西厢各三间、黄琉璃瓦硬山顶；东厢向西、西厢向东。**本候选仅这三项是文字依据；不是官照复原。** 原图8036不能证明两厢完整立面，本候选不把它列为两厢照片证据。用户已明确允许将未验细节标注后持续推进，本批按此授权做可逆简化。
- 两厢分别带 `historicalIdentityCandidate` 汉票签房/蒙古堂；无正式 `objectId`、`wholeObjectAccepted=false`。不把完整房间用途/现存单体对应/现装修当已核，不新增满本堂、祝版房、另一库或陈设。
- 位置、11.1m×5m尺寸、高度、开间分配、素砖侧后面、无花纹红面板与门位均为**工程拟合/未验简化**。不复制官式雕刻、彩画或格心纹样。外檐普通黄瓦条仅示屋面材质，不是实物瓦数。
- 为保原西灰片段已验 `z=-375` 横穿线，东西厢中间间均设可见前后通空与折开门叶、地面齐平；**这是交互开口拟合，不是文字证明的历史门位，更不代表现实允许进入。** 没有室内陈设/隔断，没有新增walkable或不可见整屋盒。

## 空间与碰撞
东厢中心(-177.5,-375.3)，西厢中心(-144.5,-375.3)，主堂与原白墙不移动。主体11.1m沿南北、5m沿东西，两厢相向。西侧原x=-140接近线、x=-147.9白墙夹道及z=-375横穿线保留；东侧x=-174夹道保留。最终屋面南北界为z[-380.85,-369.75]，东西向各5.8m，屋脊最高6.81m；人物高度最窄墙间距约1.585m（不是测绘值）。所有可见终态Float32三角生成原生碰撞 owner；实体柱/闭面实际挡人，可见通空实际容纳完整人物。

施工前正常World只读：两预留盒各0既有实体相交；各288个.5m网格全人物/水检测全通；原西灰侧巷10/60fps行跑4/4。这不替代候选新增后真路线验收。占用扫描时运行源为899b，但原树旁置未接主敬候选，并非整个工作树clean；集成人确认主敬hook在扫描后才加入。最终候选World来自本独立9f67快照。原始占用记录和最终测试均本地留存，见PINS及SCAN-CONTEXT。

## 最小形制/可见修补
真实红记录保留：6项missing-builder红；首实现屋面纵端超山墙.35m，硬山端面断言红后将屋面/瓦条/正脊归齐11.1m，不把悬山式外挑叫硬山；CPU又发现红面板与砖端墙前面共面，新增断言真实红后仅将面板外提4cm、柱边外提6cm并用朴素色差明确三间分隔。这是解除共面与结构可辨修补，**不是厘米级实物测绘校准**。未借机添加雕刻/窗格纹样。

最终168个合并前mesh、11856三角、28个精确原生owner、2自有材质，0新walkables/rooms。四张实际网格CPU（东西正面/组团/通空）已亲看；素色诊断，不是GPU纹理或官照对照验收。首态CPU与红源留本地，仓库只终态自制PNG。

## 终态验证
- `target-release.tap/.exit`：12/12、exit0（8组件/2原生步行正负控/2局部飞行与双屋顶落脚）。
- `world-release.tap/.exit/.json`：真实单World测试exit0、27.24s；新16往返7922帧、脚差峰0；原四实体32路线32376帧与899b完整rows一致。旧8诊断精确4绿4旧红，终点未变；不是全World全分区回归。
- 局部飞行10/60fps从默认起点飞行：屋顶下降被挡、空中退出拒绝、远端地面退出脚0；两屋顶各10/60fps显式12m掉落终止于真实屋脊6.80999994m，无假支承。
- 四终态CPUexit0且已亲看。原始目录 `r158-neige-side-wings-evidence-1940`；`*-first`、`*-final` 与 `cpu-first` 是旧候选/中间终态，不冒充本次release源。所有旧红和原始帧保留。`PINS.json` 绑定本次源/测试/终态及历史raw，官方正文原件不入Git。

## 运行边界与命令
候选实际World使用 `loadAll:false`，仅加载outer-east，并通过 `CourtKit.finish` **QA before-finish** 注入新专属模块；作者没有安装共享hook。局部飞行只六建筑组合envelope，非全分区/全应用/GPU验收。正常finish/dispose与输入前拒的资源检查，不夸称任意发布阶段异常完整原子回滚。

```sh
node --test --test-concurrency=1 tests/r158-neige-text-wings/component.test.mjs tests/r158-neige-text-wings/routes.test.mjs tests/r158-neige-text-wings/flight.test.mjs
BASELINE_REPORT=/workspace/scratch/02a8023d1a85/r158-cumulative-evidence-1927/neige-world.json EVIDENCE_OUT=/tmp/neige-text-wings-world.json node --test tests/r158-neige-text-wings/world.test.mjs
node tests/r158-neige-text-wings/export-cpu.mjs /tmp/neige-text-wings-cpu
python3 tests/r158-neige-text-wings/render-cpu.py /tmp/neige-text-wings-cpu/context.json.gz /tmp/neige-text-wings-cpu/context.png
```

## 共享接线仅交唯一集成人
`src/scene/zones/ZoneBase.js`:
```js
import {buildNeigeTextSideWings} from '../palace/special/NeigeTextSideWings.js';
// 现 buildNeigeWestAnnexSegment(...) 后、kit.finish 前，恰一次。
buildNeigeTextSideWings(this.kit,this.zoneJson);
```
累计真实构造去QA prototype注入/恢复，正常hook验证新路线与原四实体32路线完全不变，再跑必要累计构建。旧8诊断的4绿4旧红原样留，不把旧红放宽或算候选回归。专属模块外无既有src/data改动。
