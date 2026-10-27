# R120 验证账

## 来源与艺术冻结
父版R119 `7743ab31b5bfe022b8ebc389ca9faaee7a9ff1da`；R120_PRE_PERF `cb77e454db5b4b494caa1198a827210bb7077b8d`，runtime `8938de15545ac0fd46b7dfbde5a2d8c30e650ed130ecfbbb5cb8f7783cabfdcb`。最终性能恢复同值；release=R120。

官方1523整室与2568轴上近照实际亲看，来源分类和未知项见SOURCE-DIFFERENCES。真实22色/21法线文件，三paint均ready（46请求、零错误）。6机位actual geometry/UV/真实RGBA CPU前后图；图证f116与8938只有release标签不同，独审内存替换该旧字节精确重现f116，非口头推断。

## 红绿与保留保护
- 初始一次fixture marker查找错误先修，再5个有效装配/owner/生命周期RED；实际口沿法线背向额外RED后修，未忽略FrontSide条件。
- pre-perf13新门PASS，合R10616PASS；完整R11827PASS。
- 4栏2656实际成品面逐顶点和merge来源匹配；小洞独立clip和surface谓词都空，明确不是缩玩家。完整.5方足/1.7身高10/30/60正退三flight、门→中央→侧后绕→返回6条完成，新栏每帧endpoint0正交叠，最终grounded。不是全部世界/连续扫掠0证明。
- 初版route误取后柱所在z326.5和小曲线上的probe，分别按实际既有柱位置改合法走线z325.3/移至真正孔隙；没有改产品/缩body洗结果，旧失败保留。
- 106旧中央parts、所有旧collider/walkable（仅排除新4ID）、六陈设全LOD、far ceiling及3paint资产exact R119。旧R112/R11925项24/1：唯一R119旧整世界physics hash与新增4owner冲突，expected未改；新精确差分覆盖旧物理保持。
- 高/低中央/天花自有geometry/material/map源与成品恰一次释放，无新图集/材质key。

## 五方向专项
见 `reports/r120-performance/candidate-ledger.json` / `CANDIDATE-PROTOCOL.md` / `ACCEPTANCE.md`。新源校验热点真实；45124/48170 frozen记录是冗余校验候选，但**两版本均REJECT_COUNTER**，生产恢复PRE_PERF。

13功能负例+NR1b额外分配测试与独立172混合对象差分验证，不能替代性能保护门。低5对A/A、每版5对A/B完整保留。旧NR1唯一construction越界；NR1b3个counter越界。高候选pair因低门失败NOT_RUN。61项候选门60/1的旧measurement-contract要求tracked clean失败诚实记录；它不是运行source错误，也不冒称整套绿。最终clean后重新运行必要门。

初始完整startup diagnostic的readyCpuMs是setup-before-paint，另等待真实三paint；新driver已增加allReadyCpuMs，累计对比只用后者。routine raw的memory.ready实际是end-route采样，表格明确如此，不称初建heap。ArrayBuffer/Canvas逻辑像素与未知native/JS/GPU成本分开。

## 当前态 / 累计成本 / 构建
本节在各必要门终态后追加准确结果；未完成内容不记PASS。

### 原112文件完整门终态
恢复后的8938艺术运行源跑原112文件：1289项，1094PASS/195FAIL，260.741秒。R119同集合188失败均仍在，新增7个是本版有意修改 `QianqingCentralArt.js` / `QianqingCeiling.js` 后，旧R32源码逐字节反转注册链拒绝新epoch的冻结断言；不改expected，不声称这些已经通过。完整名字/栈见 `reports/r120-validation/current-state-differential.json` / raw TAP。不是7个画面/通行缺陷，更不是把所有188旧失败关闭。

原门写出的两份R58报告完整归档后恢复自身HEAD精确字节。区间内writer另把已拒compile诊断脚本移入reports，故changedReports还列该文件；它不是测试产出，未回写产品。完整源码恢复独审562输入missing/extra/different全0、runtime8938等于PRE_PERF。

### R115-fix → R120 累计 all-ready 成本
同一成熟 driver，稳定热修 c09a66c8 与完整艺术基线 cb77，低/高各3对 fresh process、交替顺序，所有 raw 保留：`reports/r120-performance/cumulative/summary.json`。这是新增累计功能的成本描述，**非优化验收/显著性/浏览器全帧**。

| CPU 指标 | R115-fix 中位 | R120 中位 |
|---|---:|---:|
| low 全部 ready | 6249.919 ms | 6642.700 ms |
| high 全部 ready | 6157.816 ms | 6701.786 ms |
| low CharacterSystem setup | 3.158 ms | 405.755 ms |
| high CharacterSystem setup | 2.748 ms | 390.734 ms |

用户方案1全准备好保持；计时直到真实图片与三 paint ready，未把异步成熟移出主指标。角色设置新增成本主要含累计R118私有导航准备，不能全归R120艺术。production Teleport.go 首次进入 CPU setup 旧14–32ms/新54–109ms，不是连续行走FPS。普通return/rebuild为low785–1481ms/high863–1455ms；另独立TTL expiry重建为low1885–2026ms/high1901–2106ms，最坏2.106s明确保留，未以预建宣称永不重建。

资源 inventory 仅去重列举根 `scene/library/environment/palaceBuilder/enclosure/garden/zoneManager/cm/roomNightLights/flight` 可达 ArrayBuffers；**没有显式把全部 character 私有 pool、interior/historical lamps/flightTour 对象加入根，不能称整个应用完整持有/heap/VRAM**。其 low 180690086→181219238 B、high183348518→183877670 B（+529152 B）；texture 对象109→110。59个native image/Canvas资源仍UNKNOWN，不把未知算0；既有/新增 atlas逻辑像素、source数值payload与JS对象开销另列，不相加伪造完整总数。

### 干净 checkpoint 84ce013a 终态
- R120新门＋既有performance measurement/process/equivalence：**21/21 PASS**，3.850s；`clean-targets-checkpoint.tap`。此前20/21/候选60/61的tracked-clean约束在真正clean提交后闭合，未改测试预期。
- 三fresh生产base各137文件：root `R120-07996f68ea93`，gugong `R120-8382f175f127`，pages `R120-38f74d1400fc`。源码releaseR120、runtime8938、sourceCommit=84ce013a、sourceDirty=false，before/after相同。
- HTTP逐文件SHA/内部发现链接/404、launcher及139payload精确manifest、旧混合dist/错误身份拒绝：**9/9 PASS**，1.914s；`build-http-checkpoint.tap`。root包42340382B，manifest SHA256 `5f5efbcfbede451d4f97783dca8620248b730e3fbf55787691d7fc4d27a6c9ed`。
- 保留Vite大chunk与npm http-proxy环境警告；不削细节/改警告阈值当优化。Node24.19CPU/本地HTTP，不是GPU/手机/Node20。
- 本记录准确绑定已验证checkpoint，不伪称自身最终commit。最后文档冻结后，外部delivery manifest再绑定最终commit/tree并fresh三base/包/readback；无runtime变更，不盲重跑原112四分钟门。
