# R158 箭亭：完整对象复核，局部门棂实施待集成

## 已交付与范围

基线 `3e9d5c92`，独立分支 `feat/r158-arrow-pavilion-20261031`。未修改 `main`、未部署，未改 ZoneBase、数据、EnclosedPavilions 或其他亭。

只修正自身高分辨率官图能确认的**两侧南次间、8 片保留闭合门叶上部槅心**：旧黄色正交 cue → 深木色斜向 cue + 不透明深暗表面衬层。64 个旧装饰网格换成 16 个新 mesh；门棂模块保留原门板、开合、四叶拟合数量、轮廓、碰撞、旧南明间两肩和房间/地图；追加独立中轴牌移除见 `NAMEBOARD-REVIEW.md`。斜棂不是精确菱花纹样；暗衬不是玻璃、镂空或测量得到的阴影。**整项不通过，局部视觉仍 VERIFY_PENDING。**

实际局部 CourtKit：312→264 meshes，5420→6476 triangles（净 +1056）；87 colliders、3 walkables、1 room 均不变。合并后斜棂 1728 triangles、衬层 96 triangles，各一个私有材质桶。测试明确排除目标旧 64 网格，其他每个实际对象属性及全部物理登记逐字节对照；不是重新生成一个较低分母的 frozen 基线。

## 真实证据

- [建筑页](https://www.dpm.org.cn/explore/building/236578.html) 与其[南面原图](https://img.dpm.org.cn/Uploads/Picture/2020/04/20/s5e9d4c87b554a.jpg)：已下载并实际看全图、中央门面裁切。1425×1068，摄影日期未注明；URL 日期不当拍摄日期。南次间可见深暗上部槅心与深木色斜向组织；只修正方向/表面色类，未声称已复刻雕花。
- [官方手语视频《箭亭》](https://www.dpm.org.cn/buildvideo/detail/259665.html)：页面 PubDate 为 2023-05-09 14:27（页面未明确时区），实际视频 336.24 秒、848×478。已取样观看，不是只看标题。页面 poster 复用南面树图，但视频还包含不同照片：`00:01` 斜视；`02:24` 南面无遮挡照片；`02:48` 三组门加两端封闭墙的立面（结合本体文字推定北面）；`03:48` 石碑展陈近照；`05:12` 盔甲展厅。上述时间码为实际单帧，不代表整个视频逐帧覆盖。照片摄影日期未知、图像是小尺寸嵌图，不能推定当前开馆/当前陈设或测绘比例。
- [武备馆页](https://www.dpm.org.cn/pavilion/247424.html)：可证展览地点及展品类别，未给可校核的完整房间布局。馆藏单品不据此自动摆入模型。
- [1981《记箭亭》](https://www.dpm.org.cn/building/talk/223701.html)：已打开其两份 PDF 并渲染看页。`T00015_00.pdf` 含历史斜视，摄影年代未知，不替代现状；正文建造年代叙事与现代建筑页存在差异，不据其改现存几何。`T00015_01.pdf` 是器物图，不能按同页链接当箭亭室内。

原始官图/PDF/视频和本地输出仅保留于私有 `../r158-arrow-evidence/`，不加入 public 或重新打包发布。精确 URL、字节 SHA256、尺寸及时间码见 `SOURCES.json`。

## 完整对象逐特征，不以局部代整项

| 必需特征 | 当前实现与证据观察 | 本次结论／继续动作 |
|---|---|---|
| 平面、朝向、院落连接 | 一座箭亭 + 一个语义 region；保留原位置。官页可证与奉先殿/景运门关系，不能把地图 position 当米坐标 | 保留；须真实游戏同视角核院落，实体不重复计数 |
| 层数、屋顶、脊坡、出檐、颜色 | 既有单层黄瓦歇山。视频补得无树遮挡的正背面与斜视 | 本轮不重建；脊兽/曲率/出檐比例与背面隐藏面仍未实机验收 |
| 开间、柱网、梁枋彩画 | 既有 20 柱；旧南明间双肩保留，非新成果。实际灰蓝梁枋/横披与模型普通红门头差异仍明显 | 旧肩仍待浏览器；门头横披分区/柱网深度尚待独立拟合 |
| 门窗、墙、隔扇 | 南 5 北 3 门组与无窗侧墙已存在；每组四叶仅工程拟合。原局部为黄正交网格 | 本次仅两南次间方向/暗槅心修正；精雕菱花、上下板分区、横披、稍间/北面与叶数仍未通过 |
| 台基、台阶、御路、栏杆 | 既有台基与南北模型出入口；官南图可见中央阶上白石小栏，视频北面可补踏跺关系 | 台阶/栏杆尺寸与当前碰撞未拟合；保留通行，不把闭门照片误作无洞 |
| 四周廊、附属构件 | 保留旧四周廊和围护；只有局部可见 | 侧背柱列、顶棚/梁架与角部连接待匹配，非全量通过 |
| 牌匾文字/位置 | CPU 发现原通用中轴竖“箭亭”牌；南面本体图该区域完整可见而未见此牌，照片可见右侧柱上“武备馆”竖牌 | **追加补项已实施待集成**：独立模块去除无证中轴通用牌，见 NAMEBOARD-REVIEW.md；右柱馆牌仍待定位，未猜造 |
| 院落设施 | 南图可见宫灯、金色动物形摆设及石栏；其年代、用途和个体未一一确认 | 不拷贝通用铜缸/石狮；设施未实现，照片只支持有限朝向/位置 |
| 原有南明间双肩 | 旧 R59 专用 2 件、88 triangles | 完整保留；旧 PARTIAL/VERIFY_PENDING 未改成 ACCEPTED |
| 室内分隔、柱网、层高、地面 | 当前只有一个模型 viewing-region，不等于历史房间数 | 未见完整室内平面；不关闭 |
| 天花、梁架、内檐、固定装修 | 现有 plain ceiling；视频盔甲展厅只给一个局部顶部，不足以定位全室 | 现状陈列年代/区域及完整顶棚仍未知；不按其他殿套藻井 |
| 主要家具/陈设 | 官文历史叙述有宝座/碑；视频给一座碑与盔甲陈列局部 | 不凭历史文字造当代宝座；碑可作为物体造型资料，完整位置/双碑关系与房间目标版本待证 |
| 画、匾联、灯、帘、器物关系 | 视频显示陈列照明与展柜，但非完整房间 | 未定位全部关系，不关闭 |
| 用途专项 | 武备馆来源有效，模型未放通用寝殿家具 | 不把单品图当原位；未复原当前全馆展览 |
| 图有模型无／无证模型物 | 门头/横披、右柱馆牌、院前栏与设施、现代展陈为主要残余 | 保持逐项队列；本轮不是箭亭整项完成 |

## 测试与观察

```sh
node --test tests/r158-arrow-south-door-lattice.test.mjs \
  tests/r59-arrow-baseline-fixture.test.mjs \
  tests/r59-arrow-south-knees.test.mjs \
  tests/r59-arrow-knees-world-consumer.test.mjs
```

门棂初交 **29/29**；追加中轴牌移除后联合 **36/36**；包括真实 CourtKit、有限闭合几何、无越界、所有权/merge处置、错误身份/尺寸/host前置拒绝、10/60Hz W/S 全廊与南北门、旧双膝托实际 merged 三角消费者。未按单建筑任务并跑全仓；分支尚无生产 hook，故不能把通过说成全世界已接入。

真实 Chromium 启动已尝试，`process_singleton_posix.cc:297 socket() failed: Operation not permitted (1)` 后 SIGABRT；**未获真实修改前/后游戏截图**，不能宣称浏览器/最终视觉通过。CPU 诊断是 actual local production geometry + textures/UV/atlas，但无生产 PBR/正常映射/阴影/后期/GPU。已实际看前/后图，只证明几何/材质方向改动可读，不代替对齐官图。可用以下命令复现；最初旧绝对 canvas 路径失效，改用包名后的运行成功。

```sh
node scripts/photo-fidelity/batches/r158-arrow/export-local-cpu.mjs /tmp/r158-arrow-cpu
```

## 给集成写手的精确 hook

`EnclosedPavilions.js` 加：

```js
import {applyArrowSouthDoorLattice} from './ArrowSouthDoorLattice.js';
// 紧跟现有 buildArrowSouthKnees：
if(key==='arrow')applyArrowSouthDoorLattice(kit,f,item);
```

该位置仍在真实 CourtKit root 内、尚未 finish；不应用于临溪亭。专项 fixture 会仅移除这一条自身 hook 以构造同源 before，从而在集成后依然能验证“只改变目标 64 网格”。生产世界只构建一次后可运行：

```js
const {assertArrowSouthDoorLatticeInWorld} = await import('./tests/lib/r158-arrow-south-lattice-world-check.mjs');
assertArrowSouthDoorLatticeInWorld(W); // 纯读取既有 merged scene/cm，不重建世界
```

**旧测试处理注意：** `r59-arrow-south-knees` 的 frozen meshBytes 曾断言“除膝托之外整个旧厅永久不变”；接入门棂后此全厅旧字节快照理应失效。不要改 frozen 源/分母让它变绿。可以保留旧 fixture 的膝托历史回放，并用本次精确非目标对照 + 两项 merged consumer 验当前共同结果。真实接入、独审和浏览器验收交集成写手。追加 nameboard hook 与纯 merged consumer 见 NAMEBOARD-REVIEW.md。

## 独审后异常路径补正

Astra 发现初版门棂 live commit 未保护的 P2；新增12项异常/所有权/同host重试覆盖，修复后联合48/48。原36项只代表其实际正常路径范围，异常修复详见 `ATOMICITY-REVIEW.md`。

提交后64退休几何清理异常的独立补正：`RETIRED-CLEANUP-REVIEW.md`。明确 committed=true 而非回滚，首/中/末资源故障先 RED 后 GREEN，联合51/51。

牌匾同类提交后资源清理补正：`NAMEBOARD-RETIRED-CLEANUP.md`，不改视觉范围；fg/bg/同时异常3项先 RED 后 GREEN，联合54/54。
