# R158 銮驾库南侧十间：官文暂定大形

Base local `97420d8d9742bccea11d1a77869e9b9aab67cf96` = fully API-read-back remote `0d996ea0100f346539baba86fbe03475ec24d8f0`，tree `154f5190b82c5cfa29266d9ff35b7a4feadd7882`。只新增 `LuanjiaSouthWing.js`，不改东五间、共享hook、台基/河/城墙/旧路、数据或全局物理。独立极小树，无clone、无src/data复制。

## 官文事实，不是官照复原

[故宫銮驾库正文](https://www.dpm.org.cn/explore/building/236525.html)分别记院东五间与院南十间大库，均黄琉璃硬山、内部上下两层；原大/小堂、办事/班档房已失。**本候选仅增加南十间，不重造已失院组，不把整个FC-33770DFDD3勾成完成。** 东五间使用0d996已有实体，不镜像替换。

没有亲看并确定为本南库的完整现代官照。全立面、门窗、色值、原柱式、两层内部构造和修后状态未验；素砖封闭不是证明实物没有窗。红闭面板/十一浅砖墩仅是游戏工程拟合，非历史门位/柱式实测。十间为正文依据，墩距/形状不是复原木构。

中心(-340,-378)、46×9m、檐6.6/脊9.2m和北向立面均为**工程拟合**，不是测绘或官文明确朝向。无上层楼板、楼梯、陈设或虚构房间；上下两层只记文本元数据。立面闭合，不声称现实开放。图上“官文十间；暂定大形；未经官照验证”持续可见。

## 避开既有实体

正常97420 CPU World仅stdout只读占用：A盒x[-364,-316],z[-399,-385]撞既有东南角楼台基1个（boundsx[-376.5,-345.7],z[-425,-394.2],y[0,3]），672样本95阻，因此**否决A，台基原样保留**。北移B盒x[-364,-316],z[-385,-371]旧实体交叠0、672身体/水样本均清、ground0。最终南翼在B内；没有为摆放仓库改角楼、河、墙或旧路。此扫描是outer-east+全局实体、非所有未加载分区，且不是施工后路线通过。

所有最终可见Float32三角直接生成22个原生owner，不以整屋包围盒填空；0新walkable/room，地面齐平，无接触名单/救援坡/控制器变化。硬山屋端与山墙齐平；applyBoxUV返回几何且原indexed体只由helper释放一次。普通输入前拒绝/重复/变换/冻结守卫及正常finish/dispose有测试，不夸称任意late-publish异常事务回滚。

首2CPU发现偶数十间的中心砖墩穿过中央拟合闭板，新增断言实际8绿1红，仅将闭板移入相邻中间一间，最终9组件绿后重渲；首源/图/真红保本地。没有借此增纹样或猜门窗。最终2图亲看，平色类别诊断不代替GPU/贴图或官照。

## 测试与空间口径

为避集成人文华门WIP，测试只读复用 `r158-zhifang-2044` 已有冻结97420依赖（此前既有runtime/data/tests-lib与97420逐字不变，值房新模块没有hook）。借用链接只临时本地，不进入提交；原分支完整树保有所有正常依赖。本候选World通过QA-only CourtKit before-finish注入，**作者未安装正常ZoneBase hook，未build、未验GPU/mobile/全仓**。

只输出有限World逐帧断言、完整帧SHA和摘要；低盘不落完整帧JSON，不能说全帧原字节已保存或远端可读。全文原始TAP、首/终小CPU几何与私有源只本地，SHA/有限结果见PINS。父限总新产物≤0.3MiB，500MiB底线，暂停期间没有启动进程或写生产源；释放空间后才恢复。

```sh
node --test tests/r158-luanjia-south/component.test.mjs
BASELINE_REPORT=/path/to/r158-cumulative-evidence-2037/luanjia-world.json EVIDENCE_OUT=/tmp/luanjia-south-small-summary.json node --test tests/r158-luanjia-south/world.test.mjs
node tests/r158-luanjia-south/export-cpu.mjs /tmp/south-cpu
python3 tests/r158-luanjia-south/render-cpu.py /tmp/south-cpu/north-front.json.gz /tmp/south.png
```

## 正常接线仅交唯一集成人

```js
import {buildLuanjiaSouthWing} from '../palace/special/LuanjiaSouthWing.js';
// 现有buildLuanjiaEastWing之后、kit.finish之前，恰一次：
buildLuanjiaSouthWing(this.kit,this.zoneJson);
```

要求真实原东翼唯一且中心/朝向未动；其他zone no-op，错源/重复拒绝，无fallback。已接线后不要再次运行含QA注入的作者World test。正常累计需独立普通入口核16条新/原路线及原台基旁绕，不拿本候选注入或未build状态冒充生产通过。

## 最终有限结果

9/9组件、1/1真实World终态exit0；新8/8外绕与闭板前往返3072帧脚差0，4/4闭板拒绝；原东翼8/8路线2383帧的每条完整帧SHA、终点与摘要逐字等2037正常基线。合16条到达5455帧；不把拒绝记录混入到达分母。新22mesh/504三角/22实际owner，0新增supports/rooms；2终态CPU已亲看。未复用修前World，未重跑远端东华/所有分区或全仓；旧实体数组与root子项前缀引用保留。
