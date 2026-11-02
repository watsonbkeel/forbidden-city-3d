# 九卿房前廊可见片段（非整栋验收）

基线 `c973dde55e77bdd658ae040b200edf9e3fc65f34`（累计远端 236492）。只新增专属模块；作者未修改 ZoneBase、data、物理/控制器、其他建筑或名称。`FC-CC6E0C0C81` 仅片段，不代表整座九卿值房完成；不认领蒙古王公值房/奏事待漏值房。

## 图据与拟合

故宫博物院院刊 1986 年第 1 期，单士元《清宫奏事处职掌及其档案内容》p7 图一“清代九卿房原址”：<https://img.dpm.org.cn/Uploads/pdf/1520/T00007_00.pdf>。自身黑白图支持成排廊柱、退后闭门窗、低灰基、深檐粗形，**不证明现代现状或开放情况**。旧粗 anchor 仅定位线索，不是测绘。

只替换 axis-courts/items[21] 原墙 x[-91.8,-82.8] 的 9m 局部。完整预留盒 X[-92.4,-82.2]、Z[198.6,204.6]、Y[0,7]。三展示段不是历史总开间；坐标/尺度、屋顶端/坡型、门窗分格、柱式及所有颜色均工程拟合。没有内部陈设、room、map、导航或新接触算法。外廊可近看，后墙与门窗仍闭合。

## 已完成的有限检查

- 正常 `loadAll:false / reuseInactive:true` 先验只驻留 axis-courts（另有全局 PalaceBuilder/Enclosure/Garden）：盒内仅原目标墙 1 owner / 16 可见面，非目标 owner/可见面/support 均 0；身体半径 .5m 水点 345/345 清。原内左门正常 resolveGaps 为 **(-62.4,6.4)**，非内右 65.4。
- 7/7 专项：精确墙/gap守卫、错误输入前拒、全屋盖/基座包络、每个独立 mesh 与真实三角 owner 完整流逐值相同、.2m 真 Box 低台及一个 `rescue:false` 顶、实际材质 tileSize UV、正常 finish/dispose 一次；另全 axis 非目标 10700 mesh 属性/矩阵/材质及物理/UI流同父。包含景运新框/内左门原物理字面；原墙余段与原 normal gap 重建逐值同。只排除被替换原墙/其替代片段，不泛排其他建筑。
- 必要实际 World：原 6 组合 **755 帧完整数组逐字等先验**；新廊 10Hz 走/60Hz 跑往返 16+57 帧全部到达，脚差峰 .1020000015 / .1972777793m。前闭门/后墙两个 30Hz 负控均拒。总阳性 8 路 / 828 帧。
- 两张 CPU 图亲看，可辨柱列/退后闭面/低台/深檐，无明显插入旧门墙。真实几何平色诊断，不是纹理、GPU、实机截图或现代复原验收。

保留首红：缺 builder 的 0/6；首绿轮 4/6，屋盖北边超盒 .077673m 真红→仅新屋盖深度 4.8 改 4.6 收回既定盒。另一红为错误 UV QA 要求所有小件 uv>1，改为实际 tileSize 投影逐值相等；包络容差 1e-6 只处理 Float32 的 -1.49e-9m 地面舍入。没有放宽人体、穿墙或 .3m 行走阈值。首轮未到的 template.positions QA 读法亦改成真实模板 triangles 全流比较。历史 TAP 原件不覆盖。

## 唯一集成接线（作者尚未安装）

`src/scene/zones/ZoneBase.js` 导入：
```js
import { buildJiuqingSouthPorchFragment } from '../palace/special/JiuqingSouthPorchFragment.js';
```
在 `buildWall` 已正常得到 `gaps`、原 Junji 调用之后，`const params = { h: item.h, t: item.t, gaps };` 之前恰一次：
```js
if(buildJiuqingSouthPorchFragment(this.kit,item,this.zoneJson.id,this.zoneJson.items.indexOf(item),gaps))return;
```
保上书/军机分支、其他墙和正常 resolveGaps；本模块只接受 axis/items21 原数据、已建内左门 record 及 6.4m gap。

作者命令：
```sh
node --test tests/r159-jiuqing-porch/component.test.mjs tests/r159-jiuqing-porch/preserve.test.mjs
node --test tests/r159-jiuqing-porch/world.test.mjs
```
作者 World 仅 QA loader 在 buildWall 注入；正常生产接线后用 `NORMAL=1 OUT=/tmp/<独立已建目录> node --test tests/r159-jiuqing-porch/world.test.mjs`，禁双调用。原始父六数组固定 `/tmp/r159-jiuqing-0839/scan.json.gz`。累计再核实际 hook/build，由唯一集成人负责；作者未全 build/全宫/GPU 验收。正常资源完成/坏输入前拒已验，不宣称任意发布期异常的全事务回滚。

本地原件 `/tmp/r159-jiuqing-0839/`；官刊 PDF/渲图在 `/tmp/r159-jiuqing-source-0833.{pdf,png}`，不纳提交。`PINS.json` 绑定最终源码、QA、两 CPU、保护依赖和保留原始证据 SHA。
