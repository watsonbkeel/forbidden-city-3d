# A37 当前代码对账附录

对账对象：远端 `32421fd0e1124edaf9372e3c4274f3fb32dd187e`，完整树 `7b0ec9e28ef0debcc7e502268cd2fe09e61c95de`。日期：北京时间2026-11-04。本后继仅增加文档，不改变运行源码。

[逐项结构化证据、60个文件固定哈希及测试来源](A37-CODE-APPENDIX.json)。原始R157表仍保留在 [37-STATUS.json](../../photo-fidelity/batches/R157-PRACTICAL-CLOSEOUT-1523/37-STATUS.json)，其运行版本为856421、记录时间为2026-11-01，并非当前版本的新验收。

## 如何理解数量

- 37个原始ID、名称和顺序完整保留，均找到已有局部实现或组合绑定。没有在本轮37项范围内判为完全未找到的对象。
- 这不是37项全部完成，也不意味着37栋独立建筑；午门组、廊段、台基和桥组有共享或组合实现。
- 34个原ID出现在入口字面导入可达源码；体仁阁、太和殿南庑、三台另外核对名称、配置和组合调用。ID出现本身不作为验收。
- 全部条目的整项验收均为未声明。GPU、手机、整世界和用户实际视觉／通行验收没有新增通过结论。

## 37项当前证据导航

下表只指向当前实现入口。精确数据索引、正常调用说明、旧记录及保留限制逐项见JSON，不从文件存在推断整项完成。

| 原编号 | 对象 | 当前证据文件 |
|---|---|---|
| 1 | 午门 | [WumenPracticalAssembly.js](../../../src/scene/palace/special/WumenPracticalAssembly.js)、[WumenPracticalFit.js](../../../src/scene/palace/special/WumenPracticalFit.js) |
| 2 | 太和门 | [TaihemenProfile.js](../../../src/scene/palace/special/TaihemenProfile.js)、[TaihemenBronzeLions.js](../../../src/scene/palace/TaihemenBronzeLions.js) |
| 3 | 太和殿 | [TaiheCore.js](../../../src/scene/palace/special/TaiheCore.js)、[TaiheEighteenTripods.js](../../../src/scene/palace/special/TaiheEighteenTripods.js) |
| 4 | 中和殿 | [ZhongheDisplaySetting.js](../../../src/scene/palace/special/ZhongheDisplaySetting.js)、[ZhongheDisplayStands.js](../../../src/scene/palace/special/ZhongheDisplayStands.js) |
| 5 | 保和殿 | [BaoheHallPlinth.js](../../../src/scene/palace/BaoheHallPlinth.js)、[BaoheNorthApproaches.js](../../../src/scene/palace/BaoheNorthApproaches.js) |
| 6 | 体仁阁 | [SurveyedPavilion.js](../../../src/scene/palace/special/SurveyedPavilion.js)、[PavilionProfiles.js](../../../src/scene/palace/special/PavilionProfiles.js) |
| 7 | 弘义阁 | [SurveyedPavilion.js](../../../src/scene/palace/special/SurveyedPavilion.js)、[PavilionProfiles.js](../../../src/scene/palace/special/PavilionProfiles.js) |
| 8 | 协和门 | [SideGate.js](../../../src/scene/palace/special/SideGate.js)、[SideGateProfiles.js](../../../src/scene/palace/special/SideGateProfiles.js) |
| 9 | 熙和门 | [SideGate.js](../../../src/scene/palace/special/SideGate.js)、[SideGateProfiles.js](../../../src/scene/palace/special/SideGateProfiles.js) |
| 10 | 东雁翅楼 | [WumenPracticalAssembly.js](../../../src/scene/palace/special/WumenPracticalAssembly.js)、[WumenPracticalFit.js](../../../src/scene/palace/special/WumenPracticalFit.js) |
| 11 | 西雁翅楼 | [WumenPracticalAssembly.js](../../../src/scene/palace/special/WumenPracticalAssembly.js)、[WumenPracticalFit.js](../../../src/scene/palace/special/WumenPracticalFit.js) |
| 12 | 午门钟鼓亭 | [WumenPracticalAssembly.js](../../../src/scene/palace/special/WumenPracticalAssembly.js)、[WumenPracticalUpper.js](../../../src/scene/palace/special/WumenPracticalUpper.js) |
| 13 | 午门四角方亭 | [WumenPracticalAssembly.js](../../../src/scene/palace/special/WumenPracticalAssembly.js)、[WumenPracticalFit.js](../../../src/scene/palace/special/WumenPracticalFit.js) |
| 14 | 昭德门 | [ZhaodeGate.js](../../../src/scene/palace/special/ZhaodeGate.js)、[ZhaodeSouthPanels.js](../../../src/scene/palace/special/ZhaodeSouthPanels.js) |
| 15 | 贞度门 | [ZhenduGate.js](../../../src/scene/palace/special/ZhenduGate.js)、[ZhenduGateProfile.js](../../../src/scene/palace/special/ZhenduGateProfile.js) |
| 16 | 协和门北庑房 | [SideGateGalleryProfiles.js](../../../src/scene/palace/special/SideGateGalleryProfiles.js)、[ZoneBase.js](../../../src/scene/zones/ZoneBase.js) |
| 17 | 协和门南庑房 | [SideGateGalleryProfiles.js](../../../src/scene/palace/special/SideGateGalleryProfiles.js)、[ZoneBase.js](../../../src/scene/zones/ZoneBase.js) |
| 18 | 熙和门北庑房 | [SideGateGalleryProfiles.js](../../../src/scene/palace/special/SideGateGalleryProfiles.js)、[ZoneBase.js](../../../src/scene/zones/ZoneBase.js) |
| 19 | 熙和门南庑房 | [SideGateGalleryProfiles.js](../../../src/scene/palace/special/SideGateGalleryProfiles.js)、[ZoneBase.js](../../../src/scene/zones/ZoneBase.js) |
| 20 | 中左门 | [MiddleAxisFacades.js](../../../src/scene/palace/special/MiddleAxisFacades.js)、[MiddleNorthVisibleHall.js](../../../src/scene/palace/special/MiddleNorthVisibleHall.js) |
| 21 | 中右门 | [MiddleRightGate.js](../../../src/scene/palace/special/MiddleRightGate.js)、[MiddleRightRoofProfile.js](../../../src/scene/palace/special/MiddleRightRoofProfile.js) |
| 22 | 后左门 | [RearAxisGate.js](../../../src/scene/palace/special/RearAxisGate.js)、[RearLeftPlatform.js](../../../src/scene/palace/special/RearLeftPlatform.js) |
| 23 | 后右门 | [RearAxisGate.js](../../../src/scene/palace/special/RearAxisGate.js)、[RearRightPlatform.js](../../../src/scene/palace/special/RearRightPlatform.js) |
| 24 | 左翼门 | [ZuoyiOwnGate.js](../../../src/scene/palace/special/ZuoyiOwnGate.js)、[ZuoyiDoorFront.js](../../../src/scene/palace/special/ZuoyiDoorFront.js) |
| 25 | 右翼门 | [YouyiFreshGate.js](../../../src/scene/palace/special/YouyiFreshGate.js)、[ZoneBase.js](../../../src/scene/zones/ZoneBase.js) |
| 26 | 太和殿南庑 | [ZoneBase.js](../../../src/scene/zones/ZoneBase.js)、[axis-courts.json](../../../data/zones/axis-courts.json) |
| 27 | 内金水桥 | [InnerJinshui.js](../../../src/scene/palace/special/InnerJinshui.js)、[Layout.js](../../../src/scene/Layout.js) |
| 28 | 武英门前三座石桥 | [SouthWaterSystem.js](../../../src/scene/palace/special/SouthWaterSystem.js)、[WuyingThreeBridgeRails.js](../../../src/scene/palace/special/WuyingThreeBridgeRails.js) |
| 29 | 半壁桥 | [SouthWaterSystem.js](../../../src/scene/palace/special/SouthWaterSystem.js)、[BanbiCoveredCrossing.js](../../../src/scene/palace/special/BanbiCoveredCrossing.js) |
| 30 | 三座门外三座石桥 | [SouthWaterSystem.js](../../../src/scene/palace/special/SouthWaterSystem.js)、[Layout.js](../../../src/scene/Layout.js) |
| 31 | 三台（外朝三大殿台基） | [ThreeHallTerrace.js](../../../src/scene/palace/ThreeHallTerrace.js)、[PalaceBuilder.js](../../../src/scene/PalaceBuilder.js) |
| 32 | 太和殿东联庑 | [GalleryInventoryPolicy.js](../../../src/scene/palace/GalleryInventoryPolicy.js)、[PavilionSideConnections.js](../../../src/scene/palace/special/PavilionSideConnections.js) |
| 33 | 保和殿东联庑 | [BaoheLinkedGalleries.js](../../../src/scene/palace/BaoheLinkedGalleries.js)、[GalleryInventoryPolicy.js](../../../src/scene/palace/GalleryInventoryPolicy.js) |
| 34 | 太和殿西联庑 | [GalleryInventoryPolicy.js](../../../src/scene/palace/GalleryInventoryPolicy.js)、[PavilionSideConnections.js](../../../src/scene/palace/special/PavilionSideConnections.js) |
| 35 | 保和殿西联庑 | [BaoheLinkedGalleries.js](../../../src/scene/palace/BaoheLinkedGalleries.js)、[GalleryInventoryPolicy.js](../../../src/scene/palace/GalleryInventoryPolicy.js) |
| 36 | 太和殿两侧阶梯状封火墙 | [AxisFirewallProfiles.js](../../../src/scene/palace/special/AxisFirewallProfiles.js)、[AxisFirewalls.js](../../../src/scene/palace/special/AxisFirewalls.js) |
| 37 | 保和殿两侧阶梯状封火墙 | [BaoheEastFirewall.js](../../../src/scene/palace/BaoheEastFirewall.js)、[BaoheWestFirewall.js](../../../src/scene/palace/BaoheWestFirewall.js) |

## 不再按旧结论重复开发

早期 `R157-A37/STATUS.json` 的12行分类已经落后于代码：12钟鼓亭；16–19四处协和／熙和南北庑房；20–23中左右／后左右门；25右翼门；26南庑；30三座门外三桥。原文件保留历史身份，不能照着“待定位／通用占位”再造一套。

现行南庑对应axis-courts的38–41四段及9／11墙体接口，不是增建北廊的依据。三座门外三桥也不等于已经补建三座琉璃门建筑。

18鼎、两阁端吻、体仁下层西面竖匾、中和／保和中央御路接触及乾清入口交接均已有实现，不应重复添加。

## 实际验证边界

本轮执行轻量生产配置检查，直接调用SideGateGalleryProfiles、PavilionProfiles、InnerJinshui及SouthWaterSystem：四庑房的原ID与索引、两阁各自profile、四桥组的5／3／1／3数量均匹配。没有生成World或完整场景。

R157旧组件44项和单个World测试内104条路线的原始日志已读取并核对压缩内容哈希。但其13个源／记录固定哈希有4个与当前不同：PalaceBuilder、SurveyedPavilion、Collision、axis-courts。因此它们保留为历史结果，不称当前重跑44／104。

当前16个关键体验修复文件仍逐字节匹配 [既有保留清单](../../../reports/r163-baohua/cumulative-b0/PRESERVATION.json)。中央阶梯158项、乾清入口32项原始日志及压缩hash已核验；这是原测试加当前源文件保留证明，不是本轮移动测试。已有163项有界地图／卡片／名称／身份检查与本附录的代码绑定对账是不同证据，不能相加冒充37项验收。

现行运行源码仍对应已核实的Pages-base构建R163-ff9834c19984，实际来源为本地d2f65984（与远端d5完整树一致）。本次没有新构建、部署或改main，不把文档提交冒充原构建来源。

## 保留问题与下一步

- 熙和门自身外观图文冲突仍待核；太和南庑1991修缮的精确范围未确定，不猜测或盲改。
- 储秀宫完整“3D冻结、地图不能离开”未复现；NPC方形脚印接触修复不能替代完整卡死结论。
- R6卡片旧哈希及其他历史测试失败保留，不称全套通过。
- 按用户视觉和通行优先的要求，不因旧记录中无害的短帧高度偏差自动返工。重点是明显视觉错误、实际卡住和掉地。
- 下一次实际体验优先复查乾清往返、中和／保和中央上下阶、储秀宫接触NPC后地图离开；出现冻结时区分人物／时钟是否继续和传送提示是否响应。

只交付新开发分支，324、165、d5及全部已有分支保留。用户以后合并main会触发现有Pages工作流；本次不合并、不部署。
