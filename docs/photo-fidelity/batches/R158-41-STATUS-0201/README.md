# R158 原 41 项：只读版本台账

## 基准与用途

- 本地冻结提交：`ebe22f654a99ac5dc268b0a1f7980e95df4ecd7e`；tree `0591e28dc67b230303d3751a65b7d1db98131756`。
- 初账：`901eddb194b4658eb1401362dd73bc5c6ce26b56`。本台账绑定该本地 Git 树；远端9d9bd891c84724220d11135ec1e887b3e39c4df4已完整回读，tree精确同ebe，收据见r158-backup-0157。后继仅保留用户release元数据与补充本台账，不改变以下运行分类。
- 原名单：`docs/photo-fidelity/THIRTEEN-RELEASES.md`，R59-B 第49–91行；详细需求参考 `docs/photo-fidelity/MASTER-PROMPT.md` 第379行起。41个ID和名称逐字取原表，唯一、无遗漏。
- 方法：只读正常 `src/scene/zones/ZoneBase.js` 接线、实际模块 metadata 和 `data/zones/outer-east.json` 映射。旧矩阵、旧 withheld 清单不当作当前全局状态。本次没有运行 World、改生产源、重新验收或上传。

## 分类而非完成率

**19 主体／12 拟合／5 待核／5 运行未建，共41条原记录。** “主体”仅指已有可见主体，仍可能有工程尺寸和未验细部；“拟合”不升级成现存身份；“待核”可只是同一旧壳或局部片段；“未建”只指此运行基线，绝不等于现实已拆。该计数不是用户视觉验收比例，也不是41栋互不重叠建筑。

901 初账为19／11／5／6。唯一此次分类修订是 #38：西所中殿在901仍仅有独立候选 `0c9dc736`，到 ebe 已正常接线，所以“未建→拟合”。`ZoneBase.js:225–227` 分别调用中、东、西中殿；不因此将旧北壳自动确认为后殿。

## 完整原41表

下表 `S/` 精确展开为 `src/scene/palace/special/`，模块名均带 `.js`；`OE#n` 指 `data/zones/outer-east.json` 的 `items[n]`，不是数组序号以外的新对象ID。完整路径、映射与基准文件 SHA-256 均在同目录 `STATUS.json`。

|#|原ID|原名称|分类|源码/映射依据|边界|
|---:|---|---|---|---|---|
|1|`FC-CD0B5AC9DE`|文华殿|主体|S/SouthCourtHalls.js; S/WenhuaCentralDoors.js; OE2|可见文华殿主体；非整殿视觉验收|
|2|`FC-FD3D76E74D`|文渊阁|主体|S/WenyuanPavilion.js; S/WenyuanUpperSeat.js; S/WenyuanSouthVeranda.js; S/WenyuanStairHost.js; OE8|阁体、前廊及西梯已接；非完整雕饰复原|
|3|`FC-C8AD5BD621`|东华门|主体|S/EastWestCityGate.js; OE21|现门体及马道；非整城墙通行声明|
|4|`FC-E09ED30C27`|内阁大堂|主体|S/NeigeCourt.js; objectId|大堂及前门短院；非内阁十一项总完成|
|5|`FC-40EB11CF20`|内阁大库|拟合|S/NeigeStorehouse.js; S/NeigeSecondStorehouse.js; objectId / parentObjectId|两库体已存在；红本库与实录库具体对应未核|
|6|`FC-F608EC3356`|传心殿|主体|S/ChuanxinHall.js; objectId|主殿可见主体；初始 withheldIdentities 不是累计缺建清单|
|7|`FC-AF36D75128`|箭亭|主体|S/EnclosedPavilions.js; S/ArrowSouthHeadBands.js; OE19|箭亭主体及局部门头等可见修复|
|8|`FC-5652FA389B`|文华门|主体|S/XiqingGate.js; OE0|文华门专属现体；南阶局部认证不等于全城控制器验收|
|9|`FC-B7C67C602B`|主敬殿|主体|S/SouthCourtHalls.js; S/ZhujingNorthWindows.js; OE3|现主敬殿及北四窗；中央通路为游戏适配|
|10|`FC-4D5AAFEDA4`|本仁殿|主体|S/RemainingOuterHalls.js; S/WenhuaCompanionSteps.js; OE4|本仁主体及真实入口短阶；尺寸拟合|
|11|`FC-BEE00AE333`|集义殿|主体|S/RemainingOuterHalls.js; S/WenhuaCompanionSteps.js; OE5|集义主体及真实入口短阶；尺寸拟合|
|12|`FC-0B08F51957`|文华殿穿廊|主体|S/SouthCourtHalls.js; OE23 southCourtProfile=wenhua-connector|无名 data 项明确为文华连接体，不是传心殿|
|13|`FC-F23B7824D4`|文渊阁碑亭|主体|S/WenyuanStelePavilion.js; objectId|照片指导亭体与一通素碑，不猜碑文|
|14|`FC-905A51A8BC`|治牲所|拟合|S/ZhishengShell.js; objectId|暂定硬山外壳；官网正文硬山与词条歇山冲突仍保留|
|15|`FC-CE6964B462`|景行门|拟合|S/JingxingGate.js; objectId|官文形制拟合；办公室现况未复原，中央通路为游戏适配|
|16|`FC-73FC3BE9A7`|传心殿祝版房|拟合|S/ChuanxinZhubanShell.js; objectId|三间文字暂定体量；身份位置屋顶未核，不是内阁同名或 L 形认定|
|17|`FC-D852D8A192`|传心殿神厨|未建|S/ChuanxinHall.js; withheldIdentities only|无该对象正常 builder；存续官源冲突，不等于现实已拆或可任意造|
|18|`FC-92B6D8420A`|传心殿值房|拟合|S/ZhifangShell.js; objectId|五间文字暂定壳；屋顶颜色朝向现况均未证|
|19|`FC-F539E5D64D`|内阁汉票签房|拟合|S/NeigeTextSideWings.js; historicalIdentityCandidate east|东三间黄瓦厢候选；未正式绑定现存汉票签房身份|
|20|`FC-32A68E9C3E`|内阁蒙古堂|拟合|S/NeigeTextSideWings.js; historicalIdentityCandidate west|西三间黄瓦厢候选；未正式绑定现存蒙古堂身份|
|21|`FC-2C486A3479`|内阁汉本堂|拟合|S/NeigeHanbenTextVolume.js; historicalIdentityCandidate|三间文字体量；存续位置屋型开门未核，无正式 objectId 绑定|
|22|`FC-4A84B24027`|内阁满本堂|未建|S/NeigeCourt.js; withheldIdentities only|无独立满本堂运行体；不可重命名 UNKNOWN 旧壳凑数|
|23|`FC-15E0B02776`|内阁祝版房|未建|S/NeigeCourt.js; withheldIdentities only|无内阁祝版房独立运行体；不得借传心同名体替代|
|24|`FC-12AA4B4366`|内阁满票签房|拟合|S/NeigeEastTextAnnex.js; historicalIdentityCandidate|东四间灰瓦文字候选，非现存身份闭合|
|25|`FC-93081154E4`|内阁稽查房|待核|S/NeigeWestAnnexSegment.js; historicalIdentityCandidate|仅官图灰瓦红格扇可见片段；不是稽查房完整四间|
|26|`FC-DA0F70A4C4`|内阁典籍厅|未建|S/NeigeCourt.js; withheldIdentities only|无典籍厅独立运行体，现存与位置须另核|
|27|`FC-6555093DAA`|内阁满票签档子房|未建|S/NeigeCourt.js; withheldIdentities only|无满票签档子房独立运行体，不以邻接旧壳强配|
|28|`FC-4591AC1E97`|文渊阁池桥|主体|S/SouthWaterSystem.js; S/WenyuanBridgeAxis.js; S/WenyuanPondBridgeRails.js; pond bridge axis|桥、支承、岸口、栏及水判定已对齐；工程轴位非测绘|
|29|`FC-C640AE8651`|南三所|主体|S/NansansuoCommonGate.js; S/NansansuoFrontHalls.js; S/NansansuoMiddleHall.js; S/NansansuoEastMiddleHall.js; S/NansansuoWestMiddleHall.js; OE10–18 + normal hooks|区域主体已存在，不代表九殿身份及细部全部完成|
|30|`FC-B0B56A63EE`|南三所共用宫门|主体|S/NansansuoCommonGate.js; objectId; OE10|共用宫门可见主体，保原墙洞|
|31|`FC-2E6207278C`|南三所东所前殿|主体|S/NansansuoFrontHalls.js; OE16; front ID|东前殿已替为三间绿歇山工程主体|
|32|`FC-D2A4662D07`|南三所东所中殿|拟合|S/NansansuoEastMiddleHall.js; objectId|东中殿文字形制拟合，缺自身立面照，不重绑 OE17|
|33|`FC-4642F5088E`|南三所东所后殿|待核|S/NansansuoNorthEaves.js; OE17; MIDDLE_REAR_UNRESOLVED|东侧既有北壳保留；新中殿不自动证实其后殿身份|
|34|`FC-C1914091EC`|南三所中所前殿|主体|S/NansansuoFrontHalls.js; OE14; front ID|中前殿已替为三间绿歇山工程主体|
|35|`FC-B875FF665E`|南三所中所中殿|主体|S/NansansuoMiddleHall.js; objectId; ownPhotoIdentity|官图题名中所中殿主体；位置尺寸拟合，不重绑 OE15|
|36|`FC-5E024932AE`|南三所中所后殿|待核|S/NansansuoNorthEaves.js; OE15; MIDDLE_REAR_UNRESOLVED|与第41条同一个旧北壳；两条记录不是两栋建筑|
|37|`FC-172C8CBF68`|南三所西所前殿|主体|S/NansansuoFrontHalls.js; OE12; front ID|西前殿已替为三间绿歇山工程主体|
|38|`FC-D4F3E359DE`|南三所西所中殿|拟合|S/NansansuoWestMiddleHall.js; objectId; normal ZoneBase hook|901初账尚未接入；ebe 已正常接入文字形制候选，不重绑 OE13|
|39|`FC-3F2EBD1B02`|南三所西所后殿|待核|S/NansansuoNorthEaves.js; OE13; MIDDLE_REAR_UNRESOLVED|西侧既有北壳保留；中后身份仍待核|
|40|`FC-33770DFDD3`|銮驾库|拟合|S/LuanjiaEastWing.js; S/LuanjiaSouthWing.js; S/LuanjiaEastTwoLevel.js; S/LuanjiaSouthTwoLevel.js; parent group / normal hooks|东、南两翼双层已接；空置内层梯板为游戏拟合，非全历史库群或现实开放|
|41|`FC-1DB501EB23`|南三所中所后殿撷芳殿|待核|S/NansansuoNorthEaves.js; OE15; same entity as row36|原名单明确仓库身份待核记录；不得另外复制一栋撷芳殿|

## 不可丢失的边界

1. **#36 与 #41 同为 OE15 的旧北壳及身份记录，不是两栋。** 南三所旧三北壳 `NansansuoNorthEaves.js` 明示 `MIDDLE_REAR_UNRESOLVED`；新增三个中殿不提供旧后殿身份的自动证据。
2. **五个运行未建项**：传心神厨、内阁满本堂、内阁祝版房、内阁典籍厅、内阁满票签档子房。神厨官源存续冲突尚未解释；四内阁项缺独立运行体及充分绑定。不得把已有 UNKNOWN 或历史身份候选重新命名补数，不得把传心祝版当内阁祝版。官源进一步核查另行进行，本账不抢先定案。
3. **#40 是东、南两翼双层**，不是东西翼；空置楼层、梯和开口为可通行游戏适配，未有本体现代内部图闭合。治牲屋顶冲突、景行办公室现况、值房/祝版方位屋顶等未核限制继续保留。
4. 本表不新增产品任务、不证明当前有新阻路缺陷，不等于整内阁、全南三所、传心整院或全城验收。GPU、手机、用户实机及真实开放状态均未由此台账验证。附属大庖井不额外算入原41。

## 可复核性

`STATUS.json` 保留完整原ID/名称、分类、精确源路径、初账与修订及基准 sourcePins。使用上述冻结提交的 `git show <commit>:<path>` 可逐件复算字节数与SHA-256。初账9c677cb7仅新增README.md与STATUS.json；本后继另含MAIN-RECONCILIATION.md、CHECKS.json及用户release.json元数据继承。src/data/tests/scripts/public五运行子树逐字不变。文档SHA由CHECKS及交接回执绑定，CHECKS自身不自引用。

## 五个运行未建项：不可为补数造楼

2026-11-02只读复核：[内阁官方条目](https://www.dpm.org.cn/explore/building/236523.html)明确满本堂已不存；内阁祝版房只给满本堂西的历史关系/用途，页面释义却引用传心殿后同名房，不能据此交换身份。典籍厅、满票签档子房仅定位到主堂后斋宿区东的功能，未证两独立栋或共屋、间数/屋型及现代状态。现有两厢/耳房/汉本的候选身份不拿来填这些ID。

神厨：[传心殿条目](https://www.dpm.org.cn/explore/building/236526.html)所载殿后三间、[1993修缮记](https://www.dpm.org.cn/classify_detail/158453.html)工程名，与[王文涛2019官刊p506](https://www.dpm.org.cn/Uploads/File/2020/11/13/u5fae21c07c127.pdf)无存记录及题记曲尺房识别线索未统一；手绘标签不是现代测绘，亦不得把治牲后夹道生活灶或当前矩形祝版壳改绑。当前五项均没有可安全直接施工的现状实体方案；运行未建不是一律现实已拆，也不构成已证阻路。

下一研发仍可核其他已存在主体的实际可见错误/通路，不能用以上未知身份驱动重复造楼。
