# R158 内阁南小门＋短红墙（局部候选）

基于 remote `2cbf123901368438493dab71349c83632258133c` / local `e35789c207621b2b0ea1be4a56052339e5048fc4`。仅新专属模块，不改 NeigeCourt、NeigeStorehouse、河道/物理或共享接线；本候选不是内阁 11 项整体验收，也不是新增一个历史官署身份。

## 图证与拟合

- [2008《紫禁城》163 p024](https://www.dpm.org.cn/Uploads/pdf/6179/T00024_00.pdf) 有“内阁大堂南小门”自身近照：灰瓦小门顶/山面、红墩与短红墙、石脚、厚门洞可辨。
- [同刊 p018](https://www.dpm.org.cn/Uploads/pdf/6179/T00018_00.pdf) 记当时仍存并可通大库。不是已建 8036 白墙垂花门，也不是约1950年代增开的库北无槛院门。2008是刊年，不是2026勘测或开放证明。
- 仅 1 小门、2 短墙；不扩围墙院落、双库、耳房、失存满本堂或室内。位置 `(-186,-383)`、东西向穿行、尺度、素化屋脊/背面、两扇可见折开门均为工程/交互拟合；叶数与现实开放未证。门净空实测代码约 **1.93m×2.72m**（砖洞2.2m宽，折开叶边条减去.27m），不将照片门洞测量化。
- 真实薄屋面、门墩、短墙、开扇均由最终可见 Float32 三角生成碰撞；0 新房间/0 新 walkable，没有跨洞隐形墙、空中支承或库别猜测。石铺地顶与现地齐平；不发明照片未证台阶。

## 接线建议——本分支未装生产 hook

由唯一集成人在 `src/scene/zones/ZoneBase.js` import：

```js
import {buildNeigeSouthConnectingGate} from '../palace/special/NeigeSouthConnectingGate.js';
```

在现 `buildNeigeStorehouse(this.kit, this.zoneJson);` 之后、`this.kit.finish()` 之前恰调用一次：

```js
buildNeigeSouthConnectingGate(this.kit, this.zoneJson);
```

不覆盖任何旧 hook。模块只接受原 outer-east identity root，要求已有主堂与第一库；重复/坏注册在变更前拒绝。正常 finish/dispose 检查不等于任意 late-publish 异常原子回滚保证。

## 验证口径

精确最终源/测试/命令原始日志 SHA、CPU/官图原件 SHA 见 `PINS.json`；所有 raw、逐帧JSON、官图副本仅本地保留。

- 专项 **12/12**：功能、全顶点 native owner、实门洞/墙/屋顶、旧数组保留、真UV、正常finish/dispose、开扇不埋墙、原生步跑/后退、两端绕行、局部飞行及高落负控。
- 实际 **outer-east、loadAll:false、QA before-finish 注入** World：新连接门双向往返 **8/8、3,456帧**；现堂/库各8路线共 **26,174帧** 与2cbf基线逐字不变；继承两条长路线仍 **4绿＋4旧文华中心线红** 完整相同。新线路共享原主堂锚点 `(-161,-383)` 和原库外绕锚点 `(-196,-375)`，不是两个不相连的假场景。
- 飞行只为堂/库/新门局部真实网格 envelope：10/60Hz 默认home升空、门顶拒降/空中exit拒绝；近墙点 `(-180,-393)`因完整5.7m旋翼+网格正确拒降，较远 `(-180,-396)`可地面handoff，脚高0；注入12m落体落真实门脊约4.315m。不是全World飞行或浏览器UI验收。
- 4 幅自制 CPU 图来自最终几何，平色分类、非纹理/GPU/移动端截图；浏览器模块 bundle 通过；本作者未做累计全应用build。

保留的失败：最初6项缺builder真RED；World测试误取旧baseline.rows在构造前失败（改成2cbf的mainRoutes/newRoutes，无生产修改）；局部飞行近墙正例失败后保为正确负例。CPU又发现初版门扇被门墩包住，补专测真RED再将叶中心1.16→1.03使其可见；旧绿/CPU全部保留但不作为修后证据，另以真RED消除门框与砖墩内面共面闪点，木框前露2cm、开扇净宽不变；修后12项/实际World/4CPU/bundle已重跑。不要把旧前态称最终通过。

## 最小复跑命令

```sh
E=/absolute/local/evidence/directory
mkdir -p "$E"
EVIDENCE_OUT="$E/routes.json" NEGATIVE_OUT="$E/negative.json" FLIGHT_OUT="$E/flight.json" DROP_OUT="$E/drop.json" node --test tests/r158-neige-south-gate/{component,routes,flight}.test.mjs
BASELINE_REPORT=/absolute/path/to/r158-cumulative-evidence-1742/neige-store-world.json EVIDENCE_OUT="$E/world.json" node --test tests/r158-neige-south-gate/world.test.mjs
node tests/r158-neige-south-gate/export-cpu.mjs "$E/cpu"
for view in front oblique context portal; do python tests/r158-neige-south-gate/render-cpu.py "$E/cpu/$view.json.gz" "$E/cpu/$view.png"; done
./node_modules/.bin/esbuild src/scene/palace/special/NeigeSouthConnectingGate.js --bundle --format=esm --platform=browser --external:three --outfile="$E/module.js"
```

**生产 hook 安装后不可原样跑注入版 World，会重复注册。** 集成人须改为正常 ZoneBase 路径并确认恰一次，保新8/原堂库16/继承8，再做累计build。当前文件交付未冒称这一门已关闭。
