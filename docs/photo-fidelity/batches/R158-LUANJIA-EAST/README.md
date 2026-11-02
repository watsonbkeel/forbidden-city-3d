# R158 銮驾库东侧五间翼楼：仅官文暂定大形

Base local `74c6832d1c8351ac3e08031558a0e7146a81a1f1` = remote `e2f0969db843d5048d15d5ed716e75d30b6e0faf`, tree `288d67a14febe7743ebd55dc412a608ee7b866c7`。只新增 `LuanjiaEastWing.js`，不改共享hook、旧数据/物理/通路、河、城墙或角楼。独立极小no-checkout树，不clone、不复制src/data。

## 已知与拟合必须分开

[故宫銮驾库正文](https://www.dpm.org.cn/explore/building/236525.html)明确现存院东五间大库、院南十间大库，黄琉璃硬山、内部上下两层；原大堂/小堂/办事/班档房已失。**本候选只东五间，不造南十间或已失院组，不是原FC-33770DFDD3整组完成。**

本次没有亲眼核到可确定为东库的完整本体官照。8037远照的既有像素审查不转写成本候选的官照验证；不据其两排小窗复制窗数/门位。本候选地图明确“官文五间；暂定大形；未经官照验证”。现代立面/修后状态、色值/窗格/门扇/屋脊细雕皆未验；本体保持朴素实墙，不将未知窗户说成证实不存在。

中心(-352,-331)、25×9m、檐6.6/脊9.2m及面向西的门面都是**工程拟合，非测绘、非正文明确朝向**。六浅砖墩只表达五间分隔，是工程重复而非已核柱式。红色闭合面板为未验外壳适配，不是证实的历史门，不声称现实开放。上下两层只保为已知文本元数据：**未建上层楼板、楼梯或陈设**，不拿外形通过代表内部两层完成。

南移预留盒x[-358,-346],z[-345,-317],y(.05,10)来自正常e2f CPU World只读stdout：旧碰撞交叠0，336人体/水样本均清、ground0。仅outer-east已加载及全局实体，不等于所有未加载分区。北侧(-362,-297)存在旧阻体，保留并远避，不造补偿地面或删障碍。占用清楚不是施工后通行结论。

## 实体与验证边界

每个最终可见Float32网格直接拥有完整原生triangle碰撞，不用整屋包围盒填空气；没有新walkable/room，也没有接触名单或全局控制器改动。地面齐平，不造台阶。硬山屋端与两山墙平齐；借用库材质不改共享材质，真实UV接回applyBoxUV返回几何。守卫限输入前拒绝/重复/变换/冻结，资源测试限普通finish/dispose，不夸称任意late-publish事务回滚。

测试使用只读冻结74c依赖（临时symlink，未进提交）；候选World通过QA-only CourtKit before-finish注入新模块。**作者没有安装生产hook，没有全应用构建、全仓、GPU或移动端验收。**原始小TAP/摘要和自制CPU几何只本地，最终身份与终态见PINS；自制小PNG只是实际网格平色诊断，不是官照/GPU贴图验收。

## 唯一集成人的精确接线

```js
import {buildLuanjiaEastWing} from '../palace/special/LuanjiaEastWing.js';
// 普通 ZoneBase.build 所有既有末端构件之后、this.kit.finish()之前恰一次：
buildLuanjiaEastWing(this.kit,this.zoneJson);
```

其他zone严格no-op，outer-east错误/变换/重复拒绝，无fallback。正常集成需去测试prototype注入，真实构造恰一次，再核所列有限外绕/原东华路径。不要把仍含QA注入的作者test直接放已接线树运行。

```sh
node --test tests/r158-luanjia-east/component.test.mjs
BASELINE_REPORT=/path/to/r158-cumulative-evidence-2003/neige-world.json EVIDENCE_OUT=/tmp/luanjia-small-summary.json node --test tests/r158-luanjia-east/world.test.mjs
node tests/r158-luanjia-east/export-cpu.mjs /tmp/luanjia-cpu
python3 tests/r158-luanjia-east/render-cpu.py /tmp/luanjia-cpu/west-front.json.gz /tmp/luanjia-west.png
```

低盘不输出全帧JSON，只记录有限逐帧计算的帧数/峰值/hash和断言结果；不宣称完整原始帧已保存或可远端取回。低于500MiB停止所有新产物；不以未接线版本build冒充本候选覆盖。

## 最终有限结果

7/7组件、1/1实际World终态exit0；8/8新外绕/门前往返，2383帧脚地差峰0；4/4真实闭墙拒绝；4条既有东华诊断完整rows逐字等2003正常基线。17个可见网格、444三角、17原生owner。2张最终实际网格CPU已亲看。初CPU后发现端墩与山墙外面共面风险，新增断言实际6绿1红，仅把两端墩内收，最终7绿后重渲；World来自修后源，未复用修前World。所有未知口径不变，非整组/官照复原验收。

### 独审资源后继（不重跑World）

Astra核实applyBoxUV内部已释放indexed原几何，调用方曾重复释放；新增计数断言实际7绿1红（2≠1），仅删调用方后一次dispose，最终8/8轻组件绿。修前后17mesh完整attributes/材质/变换stream及17owner全部顶点stream完全一致，SHA见PINS。上文World/2CPU来自1ad4源；当前4f33资源后继仅以精确stream同一性承接，不冒称新源又跑World/图。共享helper、所有几何/碰撞/metadata未改，仍未安装生产hook。
