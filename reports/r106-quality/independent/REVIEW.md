# R106 独立局部门

候选 `39fa67abe1a3180c96e4087b4f2e77949fb25d77`，基底R105 `b2d9327c`。8运行路径SHA见 `source-39fa.sha256`。本审不改产品。**形制、局部几何与生命周期限定门通过；成本只支持织物/窗组CPU改善及三项资源降低，不支持锡庆CPU提速。** 累计/构建/远端及GPU/手机另门。

## 拒绝记录与修复

首候选7029低前菱格有6个严格零面积/零UV cap三角，原高档测试不能覆盖；`geometry-low-7029.json/log`保留。当前仅删最终Float32严格零面，不移点、不调容差。独立loader读取旧源/新源实际构建，使用Float32定点BigInt叉积筛除真零面：所有正面积面及其全部attribute哈希严格一致（positive-7029/39fa.json）。

修后52目标mesh、6522三角，全部位置/UV正面积、法线有效、正体积、不透明。闭合独立oracle按2^30定点BigInt叉积对真正共线端点细分（含斜向T接点），有向余额全部0；不是放宽EPS。`geometry-low-39fa.json/log`。四后窗实际斜ray仍命中厚reveal，未重新打开隐私缝（privacy-low-7029.json，修后rear完全未变）。

## 形制与精确面域

亲看实际同机位高低front/rear四图：低档保中宽矩格/两窄菱格、后高灰槛与不透明背板，明确更稀，不是移除整窗。cloth高低真实RGBA采样图及原图案分区仍在；CPU无mip点状alias两档均见，不作GPU质量/FPS证明。非照片精确格数。

锡庆9 painted mesh前面各50→18tri；各红/金/绿域面积用Float32定点BigInt逐面精确求和，高低完全相等。所有低顶点及UV均是高档精确子集（gate-colour-7029.json）；外形/屋面源不因颜色面合并改变。自写首轮脚本未兼容既有null-material mesh导致工具夹具异常，修为跳过非目标后通过，原错误log保留，不是产品bug。

## 生命周期

`lifecycle.mjs`用真实East-six/Ningshou ZoneBase与ZoneManager，不是假Builder：high预建→low使未加载宁寿失效→排队实际load→已加载东六宫卸载重进→high再卸载重进。旧宁寿60个合批geometry各恰dispose一次；与已加载东六宫无共享geometry；silhouette引用保留且不dispose；rooms/map/regions完整JSON不变；注册/移除无重复，最终零注册。碰撞collector仅证明注册生命周期，不冒充本轮物理路径矩阵。

`maps-lifecycle-39fa.json`：独立两library，20次高低切换，共42个实际map，各dispose恰一次；同档无重复生成；另一library不变；材料dispose后监听不再生成；新材质重建读取当前档。已加载几何不热更新是明确合同，菜单说明重载应用，不把热切low后仍在场的旧几何计为已减少。

## 成本读回与边界

独立重算writer `cost-paired.json` 全5轮×每档8样本的轮内total中位，再取5轮中位：

|局部构建+合批+释放|高档ms|低档ms|结论|
|---|---:|---:|---|
|交泰织物组|30.801860|22.142344|5对均下降|
|承乾两殿|21.525830|15.480589|5对均下降|
|锡庆门组|8.888104|9.628130|正负混合，不称CPU改善|

交泰RGBA 2097152→524288字节；窗15904→10250tri、1526784→984000属性字节；门3998→3710tri、383808→356160字节。材质/合批数不降低。数据来自writer正式测量，本审读取/重算而非声称自己重复CPU测试。协议是同进程交替局部warm测试，保留rawCold，不代表完整分区首次加载、浏览器GPU或手机帧率。

R107完整Garden约+182ms旧回退尚未由本版解决；R108人物加载也不由这些资源数字代替。R110需独立累计与实际输入链门。R109正常可达地面RED已另在最终R105重绑，见 `../r109-movement-independent/READONLY-RED-INVENTORY.md`，不将高空压力冒称正常主游线失败。

## 最终收口附录：4119bb7d（覆盖上文候选结论）

最终 `4119bb7dcd43bfe58593d77d890f09908c5bd9e6`，SHA见source-4119.sha256。root拒绝锡庆低色面实验：仅27KiB资源收益不足以支撑CPU无一致改善。XiqingGate已与R105 b2d9327c字节精确相同，ZoneManager失效范围收窄为east-six；其余6运行文件与39fa精确不变。上文gate色域/负成本是被拒实验记录，不作为最终交付功能。

另新鲜运行实际两区生命周期lifecycle-final.mjs：初始宁寿loaded、东六宫high预建；low仅失效东六宫；宁寿实例完整保留；排队东六宫low实际总三角109673→104019。再切high不动已loaded对象，卸载重进恢复109673；silhouette引用、所有rooms/map/regions保持精确，最终owner注册清空。结果lifecycle-4119.json/log。不是只检查策略flag。

**最终限定功能门通过，仅交泰贴图与承乾低档几何进入交付；两者已测局部CPU/资源收益成立，菜单正确说明建筑重载生效。** 无变的纹理/窗形/物理和成本按精确源保留复用，不重跑大矩阵或五对CPU。R110累计、GPU/手机、R107完整分区成本仍另验。
