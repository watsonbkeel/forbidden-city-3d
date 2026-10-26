# R104 锡庆三座分立随墙门：限定设计

用户已批准R101–R105继续直接实施，parent限定锡庆一组。基底R103 final4189623a；R103远端b1013608已交付，保留R102/101/100/99/96与R97/98记录。不得修改main或已冻结版本。

## 证据与目标
亲看官方照片 https://img.dpm.org.cn/Uploads/Picture/2020/04/17/s5e99830b66756.jpg ，SHA38c553a449cfcdab53450f47e86fbb2bbb621e013388c2d15de63362e1614968，与官方锡庆门说明三座分立随墙琉璃门/中央较高/朝西/黄瓦庑殿顶相符。拍摄日期未知；文字不提供米制尺寸，背面与礓磋高差未测。不复制原照片进发布。

当前实际只有一门（16mesh、portalCount1，旧xieshan屋顶），center[-233.2,135.5]/west，中央有效碰撞净宽3.6。宁寿西侧墙from[-233.2,118] to[-233.2,520]高7。亲建完整Ningshou局部X[-239,-228],Z[122,150]仅该门与该墙相邻；九龙壁、皇极横墙等无包络冲突。需后续完整世界实际路线核验。

## 方案选择与最小边界
- 选专用XiQingGate模块及ZoneBase精确实例分派；三独立门楼、真实三处墙cut、保间墙。现通用triple/wall也被敛禧使用，不能全局替换。
- 不用一座三开间gateHall作替身；不返回17.6然后把全宽当透明洞。返回总体包络用于map/登记，但该墙的gaps必须取同一profile的三个独立接口。
- 不修改全园墙/roof/控制器，不通用布尔，不新增人物/家具/门神灯具库存。

## 拟合尺寸（MODEL_FIT_NOT_SURVEY）
局部x横沿墙（世界+Z），z穿墙。中心0、侧±6.4；中净宽3.6/垛1.4，总6.4；侧净宽2.8/垛1，总4.8。三门主体横向17.6，世界Z126.7..144.3，距南墙118≥8.7、皇极横墙154.1≥9.8；roof实际曲面包络另核，不能只凭此值宣称不交。相邻门组主体间保.8原墙。

中央门头净高至少原4.4（旧可见砖楣最低4.3）；门体上沿拟5.5；侧净高4.0/上沿5.1。三屋顶独立wudian、低细分、有限.15出檐/.7举高，中央略高，实际吻/脊最高须核不吞没背景7m墙。

中央实际ground路径不变：不加新高台/慢道/隐形walkable；原薄threshold视觉保留。新石座只门垛脚下，不横断侧门。门扇保持游戏打开状态，不照官方闭门照封路；实际叶片移到净口外垛侧，mesh与collider同源，不缩中央3.6通路。无门神绘制。

三组原墙cut取各完整垛外包（6.4/4.8），新垛填回实体；中间/外端墙仍在。每组门楣以上至原7m背墙以真实1m厚墙段和同源body collider闭合，不以大AABB假填门洞。墙顶帽需连续接原墙，来源支持墙后连续；roof/墙嵌接是安装接合，不能当作可穿透虚洞。屋面沿既有高处建筑视觉语义，不新增整屋顶bbox虚假地板。

所有非锡庆对象（特别敛禧/皇极/R99梵华/人物）逐属性/物理精确保留；目标wall41必需三洞切分外的墙面域/占用保留，切分产生三角与UV分段不伪称整条旧mesh逐字节相同。map一个旧名字/center/rot/stable place ID place-ningshou-77f449d2fe，宽度更新，central传送目标保持。

## 验收
1. RED原实际一门不能满足3独立roof/portal；失败保护身份/错墙/错gap/敛禧不误派。
2. 实际合成Ningshou三洞中心/边缘body通道、间墙/垛阻挡、头顶实墙、门扇bounds同源；不只metadata计数。
3. 原中央地面双向/传送10/30/60Hz保可达与逐帧非新增穿入；侧各双向步/跑、撞垛后退、转身/跳边界。合法初态；区分继承旧控制器交叠与新增。
4. 独立其他对象/人物输入精确，地图ID保持；新source闭合/normal/UV与卸载，有限局部CPU/合批数量。
5. 同机位实际front/oblique图看三独立庑殿门和背景墙；工程拟合、未知背装/礓磋/现代库存与GPU NOT_RUN保留。
6. cleancheckpoint184、固定166夹具自身HEAD、原1290失败多重集、三base/包/独审/唯一上传器，最终仍不合main。

## 首轮实际包络修正
RoofBuilder既有翼角/吻兽使名义.15出檐实际更宽；±6.4中心初稿roof包络交叠约.35m，保留roof-spacing-red。仅侧center改±7.0，中口不动：主体18.8m、间墙1.4m，真实屋檐Z125.5257..145.4743，与南墙/皇极横墙包络分离。没有改roof算法或扩大到其他建筑。三cut仍各独立6.4/4.8，map宽18.8深2.8，默认中央传送位置不变。

新glaze初稿是向前.035/.045m薄盒，独审指出同源注册会增加窄落点且旧普通.3支撑/.5身体风险，不应为花饰扩大物理。最终只在主垛/门楣原front face内做齐平顶点色矩形分区（先删除原前面两tri再精确覆盖，不叠加同面）；不加浮雕/凸饰/纹理或新落脚薄盒。主solid闭合体/box精确，检验前面面积、体积、normal与UV。照片所见复杂琉璃花纹仍未复刻。

## 必要局部落脚适配（2026-10-26 11:22 UTC parent授权）
独审1eac合法高空压力发现新南垛.31/.4m前缘落脚八向全困；.3旧支撑与.5真身体不一致。仅允许复用已验R96 ordinary-box适配，新独立kind `xiqing-gates`，不冒用养心/堆秀归属、不改TOI/步高/身体/全局算法。标记附在真实永久门box而非新救援实体；有限矩形域按实际三门/背停叶完整包络加工程缓冲，所有域内静态必须实际ordinary。地面0来自现有Environment真实地面，非空夹具隐形floor。

新增RED先锁原两点及合法下降/八向离开；再复验完整域内shape inventory、held navigation clone源世代/卸载、空中进出域保持速度、旧养心输入/域外精确对照，局部成本。以已有控制器入口复用，不重写solver。打开叶片沿垛后侧停靠，actual bbox不再埋垛，新增背部范围和邻物必须复核。

屋顶约.228m普通玩家穿面是独立未解决项：飞机Envelope不替代普通脚姿。现有triangleSupport圆足/闭体假设与box-only域不可直接混挂；先只读实际roof拓扑与既有机制兼容，parent确认最小方案前不增加屋面支持、更不能平盒/隐形台面代替曲面。

## 三门真实开放曲面合同 A（11:41 UTC parent授权）
仅新三屋顶：读取生产屋面实际Float32 position/index，经同一matrixWorld得到world点；每roof1008源面只删20严格零面积面，保988正面积面及原mesh/triangle映射。此为双面薄surface的阻穿/真实向上足底接触，不声称开放mesh有可判断的实体内部；不使用parity，原Duixiu闭实体与Yangxin算法不改。

独立XiqingRoofSurface纯原语提供真实square裁剪最高witness、严格interior SAT静态/连续扫掠（双面、触边可离开、正穿入阻挡）。显式roofSurface owner的bbox仅broadphase，不得成为floor。Collision注册/同数update/移除/clone保同世代，未知kind/id/无效映射原子拒绝。marker区域包含实际门、叶、屋面完整XZ加1m；其余区域和无marker行为不改。

门域ordinary与surface在同一次contact/bodySweep/step子段/vertical取最早阻挡，不在普通求解之后clamp。下降落脚必须使用实际向上面witness，同源square范围；若TOI舍入与witness不同，只有完整真实扫掠/站姿证明安全的接触可落地，不放松身体或全局容差。抬头撞下面仅停竖速、不重置jump；合法下层floor不因上屋面消失。surface存在与poseClear分别保留，NPC/饰件阻碍不能擦除floor。

先纯原语RED与独审，再接真实三门；保box子门、叶/地面18/压力42、原高空96、屋檐横走/上顶/下降/离域、held clone、原养心/堆秀与域外差分、成本。forced18m明确压力初态，非正常下机路线。若需泛化CSG/改变全园solver即停报，不自行扩面。

### 12:15 numerical contact representation and actual-source registration
- Roof contact `exactHeight` / `exactWitness` are reduced rationals decoded from the actual source binary64 world vertices and exact square clipping. `height` is the least representable binary64 value not below that real witness. They are deliberately distinct representations, not an inflated mesh or an invisible floor.
- SAT axes are rebuilt from the original source doubles. Directed-rounding intervals bound the source differences/cross products/projections; only unresolved strict-contact boundaries use exact rational SAT. Open surfaces never use closed-solid parity. Continuous sweeps with uncertain endpoint contact use exact rational TOI rounded toward the safe prefix. Mid-segment grazing and cost remain independent review gates.
- Exact source coefficients, interval axes, rational axes and the .75 m candidate grid are weakly cached per immutable source. Held navigation clones borrow source owners through the existing live generation; they do not construct per-frame triangle caches.
- Actual registration retains each roof's 1008 source mappings, filters only 20 strictly zero-area faces and exposes the remaining 988 rendered world triangles. The finite dispatch domain includes all three real roof/solid/leaf bounds plus the stated one-metre engineering buffer.
- Production contact regression 1: nearest clipping yielded 5.825099408053476, below the exact face by 3.5957e-16 m; the least safe representable foot is 5.825099408053477. Regression 2: a source-axis separation of approximately 3.017e-20 was hidden by rounded SAT. Both now have source fixtures; real 1e-9 m penetration remains rejected.
- Independent 2123-point contact audit: 224 remaining blocked poses are real decoration intersections, not discarded contacts. Numerical consistency is not permission to erase these physical surfaces or to infer a closed roof volume.

### Production merge quantization correction (12:19)
The first integration used pre-merge world doubles. A new test against actual `CourtKit.finish()` output rejected that assumption: `MergeUtils` writes transformed root-local positions back to Float32. Roof ownership now derives the exact same matrix multiplication → Float32 write → retained root-world transform sequence. All 1008 source faces per roof (including the 20 omitted zero-area mappings) match triangles in the real finished render tree exactly; no rendered geometry changed. Pre-merge primitive regression fixtures remain useful numerical counterexamples but are not mislabelled as the final production coordinates.

### Root scope decision (12:31): do not add edge support
Only actual upward-facing source faces may make the player grounded. No new edge-floor contract is introduced. The open vertical eave sheet's true upper edge can arrest descent without being a supported standing pose; acceptance requires multiple ordinary horizontal exits at 10/30/60 Hz, subsequent actual roof/ground landing, and jump restoration. Report this pressure limitation explicitly, not as zero unsettled drops or universal roof standing. All-direction trapping or real surface penetration remain blocking failures.

### Necessary worst-case static-query deduplication (root approved 12:49)
The real vertical-sheet pressure perch cost 37–43 ms p95, unlike the normal roof-center sample (<2 ms). Instrumentation found 52 body sweeps per single vertical solve, including all 48 safe-prefix arithmetic iterations over repeated identical binary64 feet. Preserve this rejected timing record.

Only an impact of kind `surface` gets a local per-call static-query memo. The from position, XZ, radius, height and source snapshot are fixed within the synchronous closure; the source grid generation is checked before reuse and invalidates all entries on change. Positive and negative zero use distinct keys. All 48 fraction updates and final arithmetic remain unchanged. World-boundary/rivers and every dynamic actor/part are still evaluated on every probe; dynamic decisions are never memoized. The memo cannot escape this call or survive a frame, update, unload or reload. Failed static queries do not populate an entry. This is not a new contact/edge/epsilon rule or a change to ordinary/Yangxin behavior.
