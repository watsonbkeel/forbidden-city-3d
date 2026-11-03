# B41 当前代码对账附录

## 基准与含义

本附录基于远端 `73f6e2da734c33c293b5c7559835f451e7e9a9c4`，本地等树 `35f7692b3b6e3229107ed08869a1eefa24557e80`，完整树 `d7f2c2fb56d2d6123d5b65f4c1140bfe6762c275`。后继只新增文档和测试，游戏源码、几何及玩家物理不变。

[逐项证据与固定源指纹](B41-CODE-APPENDIX.json)保留原41个ID、名称及顺序；[R158原始台账](../../photo-fidelity/batches/R158-41-STATUS-0201/STATUS.json)和R59记录不覆盖。

**19项已有主体、12项拟合、5项身份待核、5项未找到独立运行体，不是完成率。** 19主体包含南三所区域；36与41共享OE15候选北壳，不是两栋，也不等于后殿／撷芳殿身份已核定。全部条目不作整项验收认定。

## 41项当前证据导航

表中专用模块不等于整栋完成。精确映射、限定范围及历史路径纠正见JSON。

| 原编号 | 原名称 | 代码分类 | 主要当前证据 |
|---:|---|---|---|
| 1 | 文华殿 | 主体 | [SouthCourtHalls.js](../../../src/scene/palace/special/SouthCourtHalls.js)、[WenhuaCentralDoors.js](../../../src/scene/palace/special/WenhuaCentralDoors.js) |
| 2 | 文渊阁 | 主体 | [WenyuanPavilion.js](../../../src/scene/palace/special/WenyuanPavilion.js)、[WenyuanUpperSeat.js](../../../src/scene/palace/special/WenyuanUpperSeat.js)、[WenyuanSouthVeranda.js](../../../src/scene/palace/special/WenyuanSouthVeranda.js) |
| 3 | 东华门 | 主体 | [EastWestCityGate.js](../../../src/scene/palace/special/EastWestCityGate.js) |
| 4 | 内阁大堂 | 主体 | [NeigeCourt.js](../../../src/scene/palace/special/NeigeCourt.js) |
| 5 | 内阁大库 | 拟合 | [NeigeStorehouse.js](../../../src/scene/palace/special/NeigeStorehouse.js)、[NeigeSecondStorehouse.js](../../../src/scene/palace/special/NeigeSecondStorehouse.js) |
| 6 | 传心殿 | 主体 | [ChuanxinHall.js](../../../src/scene/palace/special/ChuanxinHall.js) |
| 7 | 箭亭 | 主体 | [EnclosedPavilions.js](../../../src/scene/palace/special/EnclosedPavilions.js)、[ArrowSouthHeadBands.js](../../../src/scene/palace/special/ArrowSouthHeadBands.js) |
| 8 | 文华门 | 主体 | [SouthCourtGates.js](../../../src/scene/palace/special/SouthCourtGates.js)、[WenhuaGateApproaches.js](../../../src/scene/palace/special/WenhuaGateApproaches.js) |
| 9 | 主敬殿 | 主体 | [SouthCourtHalls.js](../../../src/scene/palace/special/SouthCourtHalls.js)、[ZhujingNorthWindows.js](../../../src/scene/palace/special/ZhujingNorthWindows.js) |
| 10 | 本仁殿 | 主体 | [RemainingOuterHalls.js](../../../src/scene/palace/special/RemainingOuterHalls.js)、[WenhuaCompanionSteps.js](../../../src/scene/palace/special/WenhuaCompanionSteps.js) |
| 11 | 集义殿 | 主体 | [RemainingOuterHalls.js](../../../src/scene/palace/special/RemainingOuterHalls.js)、[WenhuaCompanionSteps.js](../../../src/scene/palace/special/WenhuaCompanionSteps.js) |
| 12 | 文华殿穿廊 | 主体 | [SouthCourtHalls.js](../../../src/scene/palace/special/SouthCourtHalls.js) |
| 13 | 文渊阁碑亭 | 主体 | [WenyuanStelePavilion.js](../../../src/scene/palace/special/WenyuanStelePavilion.js) |
| 14 | 治牲所 | 拟合 | [ZhishengShell.js](../../../src/scene/palace/special/ZhishengShell.js) |
| 15 | 景行门 | 拟合 | [JingxingGate.js](../../../src/scene/palace/special/JingxingGate.js) |
| 16 | 传心殿祝版房 | 拟合 | [ChuanxinZhubanShell.js](../../../src/scene/palace/special/ChuanxinZhubanShell.js) |
| 17 | 传心殿神厨 | 未建 | [ChuanxinHall.js](../../../src/scene/palace/special/ChuanxinHall.js) |
| 18 | 传心殿值房 | 拟合 | [ZhifangShell.js](../../../src/scene/palace/special/ZhifangShell.js) |
| 19 | 内阁汉票签房 | 拟合 | [NeigeTextSideWings.js](../../../src/scene/palace/special/NeigeTextSideWings.js) |
| 20 | 内阁蒙古堂 | 拟合 | [NeigeTextSideWings.js](../../../src/scene/palace/special/NeigeTextSideWings.js) |
| 21 | 内阁汉本堂 | 拟合 | [NeigeHanbenTextVolume.js](../../../src/scene/palace/special/NeigeHanbenTextVolume.js) |
| 22 | 内阁满本堂 | 未建 | [NeigeCourt.js](../../../src/scene/palace/special/NeigeCourt.js) |
| 23 | 内阁祝版房 | 未建 | [NeigeCourt.js](../../../src/scene/palace/special/NeigeCourt.js) |
| 24 | 内阁满票签房 | 拟合 | [NeigeEastTextAnnex.js](../../../src/scene/palace/special/NeigeEastTextAnnex.js) |
| 25 | 内阁稽查房 | 待核 | [NeigeWestAnnexSegment.js](../../../src/scene/palace/special/NeigeWestAnnexSegment.js) |
| 26 | 内阁典籍厅 | 未建 | [NeigeCourt.js](../../../src/scene/palace/special/NeigeCourt.js) |
| 27 | 内阁满票签档子房 | 未建 | [NeigeCourt.js](../../../src/scene/palace/special/NeigeCourt.js) |
| 28 | 文渊阁池桥 | 主体 | [SouthWaterSystem.js](../../../src/scene/palace/special/SouthWaterSystem.js)、[WenyuanBridgeAxis.js](../../../src/scene/palace/special/WenyuanBridgeAxis.js)、[WenyuanPondBridgeRails.js](../../../src/scene/palace/special/WenyuanPondBridgeRails.js) |
| 29 | 南三所 | 主体 | [NansansuoCommonGate.js](../../../src/scene/palace/special/NansansuoCommonGate.js)、[NansansuoFrontHalls.js](../../../src/scene/palace/special/NansansuoFrontHalls.js)、[NansansuoMiddleHall.js](../../../src/scene/palace/special/NansansuoMiddleHall.js) |
| 30 | 南三所共用宫门 | 主体 | [NansansuoCommonGate.js](../../../src/scene/palace/special/NansansuoCommonGate.js) |
| 31 | 南三所东所前殿 | 主体 | [NansansuoFrontHalls.js](../../../src/scene/palace/special/NansansuoFrontHalls.js) |
| 32 | 南三所东所中殿 | 拟合 | [NansansuoEastMiddleHall.js](../../../src/scene/palace/special/NansansuoEastMiddleHall.js) |
| 33 | 南三所东所后殿 | 待核 | [NansansuoNorthEaves.js](../../../src/scene/palace/special/NansansuoNorthEaves.js) |
| 34 | 南三所中所前殿 | 主体 | [NansansuoFrontHalls.js](../../../src/scene/palace/special/NansansuoFrontHalls.js) |
| 35 | 南三所中所中殿 | 主体 | [NansansuoMiddleHall.js](../../../src/scene/palace/special/NansansuoMiddleHall.js) |
| 36 | 南三所中所后殿 | 待核 | [NansansuoNorthEaves.js](../../../src/scene/palace/special/NansansuoNorthEaves.js) |
| 37 | 南三所西所前殿 | 主体 | [NansansuoFrontHalls.js](../../../src/scene/palace/special/NansansuoFrontHalls.js) |
| 38 | 南三所西所中殿 | 拟合 | [NansansuoWestMiddleHall.js](../../../src/scene/palace/special/NansansuoWestMiddleHall.js) |
| 39 | 南三所西所后殿 | 待核 | [NansansuoNorthEaves.js](../../../src/scene/palace/special/NansansuoNorthEaves.js) |
| 40 | 銮驾库 | 拟合 | [LuanjiaEastWing.js](../../../src/scene/palace/special/LuanjiaEastWing.js)、[LuanjiaSouthWing.js](../../../src/scene/palace/special/LuanjiaSouthWing.js)、[LuanjiaEastTwoLevel.js](../../../src/scene/palace/special/LuanjiaEastTwoLevel.js) |
| 41 | 南三所中所后殿撷芳殿 | 待核 | [NansansuoNorthEaves.js](../../../src/scene/palace/special/NansansuoNorthEaves.js) |

## 已过时的结论

- R59“内阁大堂／大库／传心殿等无实现”的记录不能再当当前施工清单。正常ZoneBase已有相关专用或拟合体，不能重复造。
- R158台账第8项误引XiqingGate.js。文华门实际使用SouthCourtGates.js，其末尾调用WenhuaGateApproaches.js；本附录纠正引用，原表留存。
- 早期文华门说明中“保留两条端石板、中央需绕行”已被用户反馈修正取代。当前两片横板已去掉，侧向栏杆和柱仍保留。
- NeigeCourt与ChuanxinHall各自的withheldIdentities只说明该模块不负责其他对象，不代表后续累计仍全部缺建。

历史43个源指纹中37个与当前相同。6个变化分别是内阁东耳房／第二库体入口导航、主敬北阶接触、治牲所地图朝向、延春南栏以及累计ZoneBase接线／公开名称出口。分类未因此升级；不能把旧World或构建结果冒充当前重跑。

## 本轮实际组件检查

运行：`node --test --test-concurrency=1 tests/r163-b41-preservation/current.test.mjs`。3项通过，另有3个测试内真实负控，均不依赖历史快照文件。

1. 真实文渊阁构建及自身四个收尾步骤后，桥、岸墙开口、门口、最终牌匾面和背板都在x=-189.875。牌面位置为[-189.875,8.79,-141.68]。三处门口身体探点通过；旧柱轴无虚构过水许可；实际挪错牌匾会失败。没有新跑完整过桥路线。
2. 真实文华门误挡中央的横板为0，保留6根柱、4片纵栏、40块南侧踏步、6条侧石；中央射线无遮挡，侧面仍有真实碰撞。移除真实南侧物理面会触发负控，不允许以空碰撞场景冒充通过。
3. 实际文华门单体及当前FirstPerson完成10/60Hz走／跑四组中央往返，共1620帧。独立加入真实挡墙后不能通过。60Hz冲刺保留0.44417641998547114米峰值，9帧超过0.3米，约0.15秒；其余三组峰值0.018204、0.131775、0.076538米。路线均到达，但不声称每帧≤0.3米，也不额外调整玩家物理。

[测试范围说明](../../../tests/r163-b41-preservation/README.md)。这是离线材质和DOM／时钟受控的真实CPU组件检查，没有完整World／外东路、周边对象、NPC、GPU、真实浏览器或手机验收。此前用户反馈累计记录的28条World路线／8470帧仍只是[历史证据](../../photo-fidelity/batches/R158-USER-FEEDBACK-CUMULATIVE-0243/README.md)。

旧牌匾保留测试未提供BEFORE_CAPTURE时直接返回；旧文华门差异测试无BASELINE_SNAPSHOT时跳过。本轮不把这些未执行的历史对比算作通过，也不修改旧断言。

## 未绑定与下一步

五项仍未找到独立运行绑定：传心殿神厨、内阁满本堂、内阁祝版房、内阁典籍厅、内阁满票签档子房。本轮扫描769个src/data JS/JSON，原ID／名称命中只在withheld元数据，不证明匿名几何或现实建筑不存在。历史来源与现代身份冲突仍需核对，不猜位置，不借传心祝版房填内阁同名项。

优先保护已修的桥／门／匾轴线和中央通路，待明确的新视觉或通行问题再修。5项缺绑定、12项拟合和南三所后殿身份都不为凑完成数强行升级。本次不部署，不修改或合并main；73f6、324、165、d5及更早候选全部保留。
