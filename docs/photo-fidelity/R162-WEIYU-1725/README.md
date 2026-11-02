# R162 位育斋 FC-E83C733B72：最低五间闭壳与可达前台

基线 `104e8c61fc549a22f3e44eb92a537950055cea8b`，包含已正常交付绛雪。仅新增 `src/scene/palace/special/WeiyuHall.js`，未改旧景观/屋体/路径/物理/共享 hook 或 release。不是整院或实景逐面验收。

## 自身证据与拟合边界
- 官网 https://www.dpm.org.cn/explore/building/236445.html ：御花园西北，坐北面南，五间黄琉璃瓦硬山顶，明间门、两次间支摘窗；前有鱼池与澄瑞亭。
- 官网本页自身图 https://img.dpm.org.cn/Uploads/Picture/2020/04/16/s5e9814153be5c.jpg 已亲看，原件 `/tmp/r162-weiyu-own.jpg`：黄瓦、红闭中门、上格下玻璃窗区域、灰低台。**近景高柱/梁/石栏属于澄瑞亭，不复制进本体**；店招/精匾/盆栽不建。
- 模型中心58.8,514.5、宽14/深3.6、0朝南，roof base3.5/rise1.5/overhang.5；米制均fit。为保原 x48 甬路，较澄瑞 x53.5 略向西（game+X）偏移5.3m，紧凑进深/偏移不称测绘。侧背/外两梢间窗/细格/色纹和内陈未实证，外窗只粗分区；内部metadata标明，前端无开发长标签。
- .2平台14.8×4.2和.1阶2.8×.4均真Box及同顶 `rescue:false`。闭面local z=-.9是获准的前廊fit；初静算实际为 -1.3，台目标512.65距初闭面仅.45，执行前已明确改为-.9，门净距.85；未修改任何旧路线/实体，不称可入室。
- 最终真几何 bbox X[51.399999905,66.200000095]、Z[511.922326565,517.077673435]、Y≈0..5.332399845，全在唯一盒[51.3,66.3]×[511.8,517.2]×[0,5.5]。
- 原 x48路东边49.8距新台1.6；北横路北边511.1距新檐.822；北墙基内面517.74距新檐.662；西墙基内面67.44距新台1.24；澄瑞旧北阶趾507.6距新檐4.322。背后窄缝不承诺玩家通行，不挪亭/院墙/路。

## 唯一先验
`/tmp/r162-weiyu-1723/scan.*` 为正常实际 World/实际材质，garden+west-six+axis-courts+global，loadAll:false，不是全分区流式/GPU。
- 完整实例化可见三角含各树矩阵检查90,996三角；owner/support/水/可见交叠0，341 body样本0。树静态推断另用原完整34实例捕获及104e保留33树合同；实际先验再次检查。
- **扫描 Y 从 .04 起**，仅排除保留不动的地/草.012与铺装.028；不把完整地坪柱说空。不存在新增裁树/裁床。
- 固定现布局派生路线，不冒历史QA：x48,z507→515返；北横z509.3,x30→65返，各30Hz走跑，4条760帧。必要接近58.8,509.3→58.8,512.65返30Hz走跑，2条73帧。6条833帧全到，先验峰0。
- 原消息口误933/173已更正，所有机器摘要直接由frames.length计算。

## TDD / 实体 / 后验
- 真缺builder RED 7项→7/7绿（身份、bbox、逐mesh有向三角对应、石台顶、真实库UV、注册前置守卫、资源各一次释放）。真实独立local4/169全到，峰.151232947，闭门与后墙2有效拒绝。
- 新41 owner（39逐可见mesh真实triangle+2真Box），2真实顶rescue:false；0新接触、0虚坡、0room/0map。不改全局Collision/FP/B或旧认证。
- 作者 World 用临时 loader 在正常 ZoneBase.finish 前注入新builder与before/after捕获；**不是已安装正式hook**。旧 garden 2735mesh/1388owner/94top及room/map/region前后哈希同，所有旧src/data Git blob逐个锁。
- 原必要两街4/760完整对象含end逐字同先验。必要接近2条30Hz因新真平台由地0变为.2，不要求旧脚轨迹不变；同输入/到达，后验仍44/29帧，峰.079023/.153823。
- 新10/60Hz走跑4/169全对象含end逐字等local，峰.151233；实际World末态feet0/native body clear。前闭门有效World负控全对象等local。
- **后侧无效出生点红保留**：首次World额外错误要求后负控全数组等local，真实红 `world-first-negative-contract-red.*`。点(58.8,517.5)半径.5原已碰旧北墙 Box[10.8,0,517.8]..[68,3,518.8]，所以World无速度拒绝不同于单殿接近新后墙。按批准只修QA合同、点/产品不动：World该行列blocked-start诊断，不计有效新后墙移动负控；新后墙拒绝仅由单殿证明。最终World1/1，末态/旧流关口全部执行。
- 最终日志测试标题有旧Jiangxue字样，冻结QA只纠正标题为Weiyu，不改断言/产品，未为文字重测。
- 两图为实际几何CPU z-buffer和库fallback色，已亲看；不是GPU/纹理/手机验收。无作者全站suite/build；只按批准有界测试，累计由唯一集成人关闭。

## 正常接线与证据保全
ZoneBase import `buildWeiyuHall`，在所有现有finalizer之后、`this.group=this.kit.finish()`之前调用 `buildWeiyuHall(this.kit,this.kit.root.name)`，其它区域返回false。这是唯一需后续修改的正常hook。
累计不能覆盖作者/tmp原件：复制测试、改base/output；去掉**全部作者注入及before/after/global捕获**，以正常架构record/41owner/2false顶守卫替代capture。保旧4及新4完整对象、必要30Hz到达/脚差、前门有效负控、后侧invalid诊断；一次正常World和单build。不要把新台途经轨迹不变冒成旧6全字节同。
