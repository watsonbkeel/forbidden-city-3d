# R162 凝香亭 FC-7BE8375458 — 独立四柱最低方亭

基线 `dd49cd4416cef8ffec1c825fe964df0232bcf805` 已含延晖。仅新增 NingxiangPavilion.js；0旧源码/墙路/景观/全局控制器改动，未接共享hook/release，wholeObjectAcceptance=NOT_ASSERTED。

## 自身身份与可见大形
官方 https://www.dpm.org.cn/explore/building/236444.html 将玉翠/凝香分别置东北/西北隅，说明四柱方攒尖、坐凳栏杆、黄蓝绿棋盘瓦。**本次仅凝香**。该页图65明确题注凝香亭，原图 https://img.dpm.org.cn/Uploads/Picture/dc/1632%5B1024%5D.jpg （/tmp/r162-ningxiang-own.jpg）亲看：小方攒尖、红柱、低凳与石台、三色瓦。近景白栏、左邻楼、竹树与盆栽/临时小坡均未新造。

中心(42.2,514.4)为西北区域工程fit，位于当前延晖与位育之间，**不是原址精确定位或survey**。3.6方顶、四柱local±1.6、.2平台4.2方/.1阶1.6×.4、三侧凳和南开口为最低游戏适配。三色真实屋面采用原三角的粗位置分区，**不是精确棋盘纹、逐瓦或古物材质复制**；没有室内/天花细画/细兽/专匾。原古树与床路径均保留。

真实pavilion sides4 roof base3/rise1.5/overhang.4，完整bbox X[39.568630886,44.831369114] Z[511.781868362,517.018131638] Y≈0..4.989999771；锁唯一盒[39.4,45]×[511.6,517.2]Y5.2。26owner（24mesh真三角+2低石体Box），2false同顶。0contact/虚坡/room/map，南面真空口，不造空气墙。

## 正常先验/旧物保全
/tmp/r162-ningxiang-1804/scan.mjs与原件，loadAll:false、实际库、west-six/garden/axis-courts+global。96,608旧三角、144 body采样，visible/owner/top/water/body交叠0。Y≥.04保留草.012/铺地.028；不称全高空柱，0景观裁剪。
原布局派生路x17,z507↔515及z509.3,x20↔45，30走跑4/590完整对象与本先验/延晖同点一致；不是另造历史QA。必要(42.2,509.3)→(42.2,512.65)返30走跑2/73是未来占台的地0先验；建台后仅同输入到达，不冒脚轨迹同。

## TDD与实际通行
7缺件RED→本体7+local1=8/8绿。首resource红发现真实数组材质屋面被现mergeByMaterial跳过且不dispose；只对新彩屋面加既有noMerge:true，正常finish保留三组/资源各一次释放硬锁，**未改通用merge**。原red与修前local留存。
新10/60走跑4条进亭净中心(42.2,514.4)原返，是获准新增合同，不偷偷改旧路/地0先验。中心radius.5全脚在真平台，四柱/三侧凳远离中心，峰.1836666682，4/236全到。真实北凳/东南柱两负控均拒绝，无原北墙内假出生点。
唯一候选World1/1：新4含end完整对象与local同，两拒绝完整同，末态native clear/feet0；旧4/590全对象同scan。必要30Hz2条同输入到达但受真实平台影响。旧garden2940mesh/1593collider/100top与rooms/maps/regions前后同，732旧src/data Gitblob逐字锁。
两CPU已亲看：四柱方顶、三色粗块/三凳/开口可辨，fallback平色非GPU/纹理实机，不称现代开放或整对象验收。未跑作者全站suite/build，严格有限授权。

## 正常集成
所有既有finalizer后、kit.finish前 `buildNingxiangPavilion(this.kit,this.kit.root.name)`。新彩屋面noMerge保持正常finish可见（3材质组），不可省略该标记。
累计QA复制另base/输出，去全部loader注入import/call及before/after/global捕获，改正常architecture record/26owner/2false顶及彩屋面存续关口；旧4、新4和2拒对象精确作者原件。必要30Hz只同输入/到达。勿覆/tmp作者raw；唯一正常hook/build由集成人关闭。
