# 内阁汉本堂：三间文字暂定体量

基线 local `91fdf605f5cd096318cbe6fd38a56ecd4875494b` / remote `200ce0d8620baf065af41050d3d18f69f9108601`，tree `22d3602729ead021721408898dccc1fa72762a56`。复用既有隔离小树另开分支；仅新模块 `NeigeHanbenTextVolume.js`，不改旧七组、河道、共享物理或飞行。**作者尚未安装正常生产hook。**

## 依据和拟合

[故宫正文](https://www.dpm.org.cn/explore/building/236523.html)支持汉票签房南侧、南向、三间；不支持具体屋型、门窗或现代存续。不要把前句主堂/两厢的黄瓦硬山外推到汉本堂。[2008官刊p18](https://www.dpm.org.cn/Uploads/pdf/6179/T00018_00.pdf)说内阁群体格局基本保留；[院刊p106转载民国图](https://www.dpm.org.cn/Uploads/File/pdf/dc/90/c9/dc90c935d785bbdf396ad66173ebf391.pdf)支持相对历史位置。两者均不能证明汉本堂当代单体身份。2023修缮函也未逐名确认它。

仅 `historicalIdentityCandidate:FC-2C486A3479`，无正式objectId，`currentSurvival:UNVERIFIED_NOT_CURRENT_RECONSTRUCTION`、`wholeObjectAccepted:false`。不造官网明确不存的满本堂，也不冒用其它建筑照片。

中心(-176,-387.2)，三间宽9.6m、主体深3.8m、屋面深4.6m、檐4.15m/名义脊5.95m，**均为工程拟合，不是测绘**。朴素灰暗坡顶、砖背/山墙、素红闭面与四根前柱；无格心雕刻、彩画、室内陈设或分间。屋型/颜色/立面均未证；中间可见折开门叶、净洞2.6×3.1m、齐地地面是交互拟合，不表示现实开放。45mesh、2916tri、19个真实闭体triangle owner、0新增walkable/room。全部可见Float32世界三角与owner完整流相等，砖/石UV采用返回几何；无整房隐形盒。

实际bounds x[-180.8000002,-171.1999998],z[-389.49999995,-384.90000005],y[-.06,6.07499981]。主体并非薄片：入内后可在门叶之外横移转身；CPU正/斜面已亲看，但只是平色几何诊断，非GPU/PBR/手机验收。

## 真红、修正及终态

1. 建前真实91f World只载outer-east：预留盒x[-181,-171],z[-391,-384.5],y[.05,7]原collider相交0；294个半米身体/河网格、原东厢x=-182通路、南门z=-383和旧落客点均无阻。这不替代新建筑运行检查。
2. 首轮missing-builder **0绿6红**。初版深5.2m/屋面6m、中心z=-387.75，首轮 **9绿1红**：虽保人物通路，却占旧直升机5.7m旋翼包络的落地区；`landAt(-180,-396)`正确拒绝。原红保留，未挪落点或改飞行。
3. 获准仅改候选尺度为现较浅体量，屋檐避开旧落点的2m保守网格。第二轮 **8绿2红**：旧飞行已恢复且两行完整相同；但本次新路线横移(-178,-387.75)压可见内折门叶，静态净空末点z=-386贴真实背墙。
4. 恢复后**生产源码与碰撞未再改**，SHA `42f9a6e276b84d523d7c6e61052c1bb9f3f9324aa5da705d1179ba3d68c7d045`。仅把本次新路线三个室内点从z=-387.75移至-386.9，先走过门叶再横移；静态净空止于-386.25。新增负控要求旧两个压叶/贴墙点仍拒绝；不是删碰撞或使旧失败点凭空可通。旧64路线/旧飞行一字不变。
5. 最终 **11/11，exit0，无跳过**：新8种10/60Hz行/跑/倒行共2522帧、脚地峰差0，另4次闭面拒绝；几何/UV/旧数组引用/前置坏输入重复拒绝/正常finish-dispose均过。不声称任意晚发布异常完整原子回滚。
6. 旧第二库局部原生飞行：默认home起飞、屋顶下降挡/空中退出拒、原(-180,-396)落地及地面交接，在加入汉本后10/60Hz两行完整deepEqual旧记录。原raw的scope字符串为历史对照字段，实际fixture是七旧组加汉本；不是全World/浏览器飞行。另明确注入12m坠落落于汉本真实屋面。
7. **实际World33.71秒exit0**：`loadAll:false` outer-east+全局构件，借固定91f源，在CourtKit.finish前QA安装一次。新8/2522与本地完整行相同；旧七组64路线/51904帧逐字deepEqual旧基线；8长路诊断仍4绿/4旧文华中心线红，全部行相同。未跑全城验收/全仓回归或应用build。

低盘继承口径：World输出只存新8完整行SHA及旧8组JSON SHA，**先完整deepEqual再序列化**；新全帧在`local-final.json.gz`，旧完整原件在2003/2109/第二库2122，各自SHA见PINS。所有原红、修前源/QA留存，没有覆盖或删除。raw在独立`/tmp/r158-hanben-evidence-2226`，不纳仓；官源沿用本地原件，无新下载。父后续恢复空间并追加≤64KiB只供冻结封装。

## 唯一集成人接线

`src/scene/zones/ZoneBase.js`：
```js
import {buildNeigeHanbenTextVolume} from '../palace/special/NeigeHanbenTextVolume.js';
// 现buildNeigeSecondStorehouse后、kit.finish前，恰一次：
buildNeigeHanbenTextVolume(this.kit,this.zoneJson);
```
正常接线验证副本删除`world.test.mjs`整个prototype注入及finally恢复，保全部新8/原64/旧8及全行相等断言。作者无共享hook；正常hook和累计应用build由集成人关闭，不双装。

```sh
export QA_BASE_ROOT=/workspace/scratch/02a8023d1a85/r158-wenhua-route-1821
export PRIOR_FLIGHT_REPORT=/workspace/scratch/02a8023d1a85/r158-neige-second-store-evidence-2122/flight-first.json
node --test --test-concurrency=1 tests/r158-hanben-text/{component,routes,flight}.test.mjs
BASELINE_REPORT=/workspace/scratch/02a8023d1a85/r158-cumulative-evidence-2003/neige-world.json EAR_BASELINE=/workspace/scratch/02a8023d1a85/r158-cumulative-evidence-2109/neige-world.json.gz SECOND_BASELINE=/workspace/scratch/02a8023d1a85/r158-neige-second-store-evidence-2122/local-first.json.gz LOCAL_REPORT=/tmp/r158-hanben-evidence-2226/local-final.json.gz EVIDENCE_OUT=/tmp/hanben-normal-world.json.gz node --test tests/r158-hanben-text/world.test.mjs
```
完整集成树省略QA_BASE_ROOT即可。PINS记录本地原件身份，不承诺远端有raw；仓库只新源码/9QA/短说明pins/2张自制PNG。
