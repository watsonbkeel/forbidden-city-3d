import {createDafotangPhotoSession} from '../palace/special/DafotangPhotoPresentation.js';
import {buildXiangxuGlazedGate} from '../palace/special/XiangxuGlazedGate.js';
import {buildDailouWaitingHouse} from '../palace/special/DailouWaitingHouse.js';
import {buildTishunSouthBeam} from '../palace/special/TishunSouthBeam.js';
import {buildChenghuangGlazedEntry} from '../palace/special/ChenghuangGlazedEntry.js';
import {buildDanyuanElevenBayHall} from '../palace/special/DanyuanElevenBayHall.js';
import {buildZhongzhengMainHall} from '../palace/special/ZhongzhengMainHall.js';
import {buildYanxiRearEarHall} from '../palace/special/YanxiRearEarHall.js';
import {buildYangxinCompanionHalls} from '../palace/special/YangxinCompanionHalls.js';
import {buildXihuaNorthWatchHouse} from '../palace/special/XihuaNorthWatchHouse.js';
import {buildFuyiThreeBay} from '../palace/special/FuyiThreeBay.js';
import {buildXuanshouSouthFront} from '../palace/special/XuanshouSouthFront.js';
import {buildXuhuiGallery} from '../palace/special/XuhuiGallery.js';
import {buildXiefangHillPavilion} from '../palace/special/XiefangHillPavilion.js';
import {buildSongxiuHillPavilion} from '../palace/special/SongxiuHillPavilion.js';
import {buildLutaiRockTerrace} from '../palace/special/LutaiRockTerrace.js';
import {buildYunguangMainShell} from '../palace/special/YunguangMainShell.js';
import {buildJutingMainPavilion} from '../palace/special/JutingMainPavilion.js';
import {buildZhuxiangMainShell} from '../palace/special/ZhuxiangMainShell.js';
import {consumeSynchronousBuild, getBuildStepMetrics} from './ZoneBuildSteps.js';
import {buildYizhaiMainShell} from '../palace/special/YizhaiMainShell.js';
import {buildSanyouMainShell} from '../palace/special/SanyouMainShell.js';
import {buildYucuiMainShell} from '../palace/special/YucuiMainShell.js';
import {buildQingshouNorthHalls} from '../palace/special/QingshouNorthHalls.js';
import {buildBaotaiGate} from '../palace/special/BaotaiGate.js';
import {buildForiFanhuaStair} from '../palace/special/ForiFanhuaStair.js';
import {buildLushunGate} from '../palace/special/LushunGate.js';
import {buildDaoheGate} from '../palace/special/DaoheGate.js';
import {buildZhenshunGate} from '../palace/special/ZhenshunGate.js';
import {buildQingshouRaisedWalk} from '../palace/special/QingshouRaisedWalk.js';
import {buildYiheJingqiConnector} from '../palace/special/YiheJingqiConnector.js';
import {buildThirteenSouthEntry} from '../palace/special/ThirteenSouthEntry.js';
import {buildNorthThirteenHouses} from '../palace/special/NorthThirteenHouses.js';
import {buildSouthThirteenHouses} from '../palace/special/SouthThirteenHouses.js';
import {buildLianxiGate,lianxiWallGaps} from '../palace/special/LianxiGate.js';
import {buildYangxingFrontCeiling} from '../palace/special/YangxingFrontCeiling.js';
import {buildChangyinLowerNameboard} from '../palace/special/ChangyinLowerNameboard.js';
import {buildChangyinMiddleNameboard} from '../palace/special/ChangyinMiddleNameboard.js';
import {buildYiheCourtCensers} from '../palace/special/YiheCourtCensers.js';
import {fitNingshouFrontHall} from '../palace/special/NingshouFrontHall.js';
import {buildNingshouSideApproach} from '../palace/special/NingshouSideApproach.js';
import {releaseUnusedConstructionBranches,forgetConstructionSources} from '../palace/ConstructionSources.js';
import {buildJingfuWenfeng} from '../palace/special/JingfuWenfeng.js';
import {buildZhenfeiWell} from '../palace/special/ZhenfeiWell.js';
import {buildBaozhongEastHall} from '../palace/special/BaozhongEastHall.js';
import {buildZhongzhengWestHall} from '../palace/special/ZhongzhengWestHall.js';
import {buildZhongzhengEastHall} from '../palace/special/ZhongzhengEastHall.js';
import {buildZhaofuGate} from '../palace/special/ZhaofuGate.js';
import {buildYuhuaWestLou} from '../palace/special/YuhuaWestLou.js';
import {buildYuhuaEastLou} from '../palace/special/YuhuaEastLou.js';
import {buildHuifengPavilion} from '../palace/special/HuifengPavilion.js';
import {buildJianfuMainHall} from '../palace/special/JianfuMainHall.js';
import {buildFuchenHall} from '../palace/special/FuchenHall.js';
import {buildYudeWestHall} from '../palace/special/YudeWestHall.js';
import {buildXiangyunPavilion} from '../palace/special/XiangyunPavilion.js';
import {buildNinghuiHall} from '../palace/special/NinghuiHall.js';
import {buildChongjingHall} from '../palace/special/ChongjingHall.js';
import {buildFengyacun} from '../palace/special/Fengyacun.js';
import {buildGaoyunqing} from '../palace/special/Gaoyunqing.js';
import {buildJinzhaoYucui} from '../palace/special/JinzhaoYucui.js';
import {buildShufangFrontHall} from '../palace/special/ShufangFrontHall.js';
import {buildBilinGuan} from '../palace/special/BilinGuan.js';
import {buildYinghuaWestEarHall,buildYinghuaWestEarCourtWalls} from '../palace/special/YinghuaWestEarHall.js';
import {buildBaohuaDian} from '../palace/special/BaohuaDian.js';
import {buildFanzongLou} from '../palace/special/FanzongLou.js';
import {buildYuhuaGe} from '../palace/special/YuhuaGe.js';
import {buildJingyiXuan} from '../palace/special/JingyiXuan.js';
import {buildShufangStage} from '../palace/special/ShufangStage.js';
import {buildJicuiPavilion} from '../palace/special/JicuiPavilion.js';
import {buildJianfuJiyunLou} from '../palace/special/JianfuJiyunLou.js';
import {buildJingshengZhai} from '../palace/special/JingshengZhai.js';
import {buildYinghuaStelePavilion} from '../palace/special/YinghuaStelePavilion.js';
import {applyGardenStreetGatePins} from '../palace/special/GardenStreetGatePins.js';
import {buildQinanIncensePavilions} from '../palace/special/QinanIncensePavilions.js';
import {buildYucuiPavilion} from '../palace/special/YucuiPavilion.js';
import {buildChengguangGate} from '../palace/special/ChengguangGate.js';
import {buildYanheGate} from '../palace/special/YanheGate.js';
import {buildJifuGate} from '../palace/special/JifuGate.js';
import {buildYangxingZhai} from '../palace/special/YangxingZhai.js';
import {buildNingxiangPavilion} from '../palace/special/NingxiangPavilion.js';
import {buildYanhuiHall} from '../palace/special/YanhuiHall.js';
import {buildChizaoHall} from '../palace/special/ChizaoHall.js';
import {buildWeiyuHall} from '../palace/special/WeiyuHall.js';
import {buildJiangxueHall} from '../palace/special/JiangxueHall.js';
import {buildChangchunLezhiWing} from '../palace/special/ChangchunLezhiWing.js';
import {buildChangchunYishouWing} from '../palace/special/ChangchunYishouWing.js';
import {buildTihePingkangWing} from '../palace/special/TihePingkangWing.js';
import {buildTiheYishouWing} from '../palace/special/TiheYishouWing.js';
import {buildXianfuRearEastWing} from '../palace/special/XianfuRearEastWing.js';
import {buildXianfuRearWestWing} from '../palace/special/XianfuRearWestWing.js';
import {buildYongshouRearEastWing} from '../palace/special/YongshouRearEastWing.js';
import {buildYongshouRearWestWing} from '../palace/special/YongshouRearWestWing.js';
import {buildJideRearHall} from '../palace/special/JideRearHall.js';
import {buildJingrenRearEastWing} from '../palace/special/JingrenRearEastWing.js';
import {buildJingrenRearWestWing} from '../palace/special/JingrenRearWestWing.js';
import {buildJingyangRearEastWing} from '../palace/special/JingyangRearEastWing.js';
import {buildJingyangRearWestWing} from '../palace/special/JingyangRearWestWing.js';
import {buildZhongcuiRearWestWing} from '../palace/special/ZhongcuiRearWestWing.js';
import {buildZhongcuiRearEastWing} from '../palace/special/ZhongcuiRearEastWing.js';
import {buildYongheRearWestWing} from '../palace/special/YongheRearWestWing.js';
import {buildYongheRearEastWing} from '../palace/special/YongheRearEastWing.js';
import {buildZhongsiGate} from '../palace/special/ZhongsiGate.js';
import {buildLinzhiGate} from '../palace/special/LinzhiGate.js';
import {buildTianqiongFrontHall} from '../palace/special/TianqiongFrontHall.js';
import {buildDunbenFrontHall} from '../palace/special/DunbenFrontHall.js';
import {buildYuqingFrontHall} from '../palace/special/YuqingFrontHall.js';
import {buildChengsuFrontHall} from '../palace/special/ChengsuFrontHall.js';
import {registerFengxianCentralContact} from '../palace/special/FengxianCentralContact.js';
import {buildZhaigongFrontHall} from '../palace/special/ZhaigongFrontHall.js';
import {finishFengxianFrontSteps} from '../palace/special/FengxianFrontSteps.js';
import {buildJiuqingSouthPorchFragment} from '../palace/special/JiuqingSouthPorchFragment.js';
import {buildJunjiSouthPorchFragment} from '../palace/special/JunjiSouthPorchFragment.js';
import {buildShangshuSouthFragment} from '../palace/special/ShangshuSouthFragment.js';
import {publicMapItem} from '../../ui/PublicPlaceNames.js';
import {buildNansansuoWestMiddleHall} from '../palace/special/NansansuoWestMiddleHall.js';
import {buildNansansuoMiddleWell} from '../palace/special/NansansuoMiddleWell.js';
import {buildNansansuoMiddleEastSideHall} from '../palace/special/NansansuoMiddleEastSideHall.js';
import {buildNansansuoMiddleWestSideHall} from '../palace/special/NansansuoMiddleWestSideHall.js';
import {buildNansansuoWestCourtWestSideHall} from '../palace/special/NansansuoWestCourtWestSideHall.js';
import {buildNansansuoEastCourtEastSideHall} from '../palace/special/NansansuoEastCourtEastSideHall.js';
import {buildNansansuoWestCourtEastSideHall} from '../palace/special/NansansuoWestCourtEastSideHall.js';
import {buildNansansuoEastMiddleHall} from '../palace/special/NansansuoEastMiddleHall.js';
import {buildNansansuoMiddleHall} from '../palace/special/NansansuoMiddleHall.js';
import {buildNeigeHanbenTextVolume} from '../palace/special/NeigeHanbenTextVolume.js';
import {finishWenhuaCompanionSteps} from '../palace/special/WenhuaCompanionSteps.js';
import {buildChuanxinZhubanShell} from '../palace/special/ChuanxinZhubanShell.js';
import {buildNeigeSecondStorehouse} from '../palace/special/NeigeSecondStorehouse.js';
import {buildDapaoWell} from '../palace/special/DapaoWell.js';
import {buildLuanjiaEastWing} from '../palace/special/LuanjiaEastWing.js';
import {buildLuanjiaSouthWing} from '../palace/special/LuanjiaSouthWing.js';
import {finishLuanjiaEastTwoLevel} from '../palace/special/LuanjiaEastTwoLevel.js';
import {finishLuanjiaSouthTwoLevel} from '../palace/special/LuanjiaSouthTwoLevel.js';
import {finishLuanjiaSouthPhotoWindows} from '../palace/special/LuanjiaSouthPhotoWindows.js';
import {buildZhifangShell} from '../palace/special/ZhifangShell.js';
import {buildZhishengShell} from '../palace/special/ZhishengShell.js';
import {buildNeigeTextSideWings} from '../palace/special/NeigeTextSideWings.js';
import {buildNeigeEastTextAnnex} from '../palace/special/NeigeEastTextAnnex.js';
import {finishZhujingNorthWindows} from '../palace/special/ZhujingNorthWindows.js';
import {finishNansansuoNorthEaves} from '../palace/special/NansansuoNorthEaves.js';
import {buildNeigeSouthConnectingGate} from '../palace/special/NeigeSouthConnectingGate.js';
import {buildNeigeWestAnnexSegment} from '../palace/special/NeigeWestAnnexSegment.js';
import {finishNansansuoCourtyardGates} from '../palace/special/NansansuoCourtyardGates.js';
import {buildJingxingGate} from '../palace/special/JingxingGate.js';
import {finishNansansuoFrontHalls} from '../palace/special/NansansuoFrontFinalizer.js';
import {buildNeigeStorehouse} from '../palace/special/NeigeStorehouse.js';
import {buildNeigeCourt} from '../palace/special/NeigeCourt.js';
import {buildChuanxinHall} from '../palace/special/ChuanxinHall.js';
import {buildWenyuanStelePavilion} from '../palace/special/WenyuanStelePavilion.js';
import {buildNansansuoCommonGate} from '../palace/special/NansansuoCommonGate.js';
import {finishWenyuanEntryTread} from '../palace/special/WenyuanEntryTread.js';
import {buildZuoyiOwnGate} from '../palace/special/ZuoyiOwnGate.js';
import {raiseMiddleLeftPlatform} from '../palace/special/MiddleLeftPlatform.js';
import {sideConnectionTargets} from '../palace/special/PavilionSideConnections.js';
import {buildYouyiFreshGate} from '../palace/special/YouyiFreshGate.js';
import {sideGateGalleryOptions,validateSideGateGalleryDeck} from '../palace/special/SideGateGalleryProfiles.js';
import {buildBaoheLinkedGallery} from '../palace/BaoheLinkedGalleries.js';
import {buildMiddleRightGate} from '../palace/special/MiddleRightGate.js';
import {applyMiddleAxisFacades} from '../palace/special/MiddleAxisFacades.js';
import {buildRearAxisGate} from '../palace/special/RearAxisGate.js';
import {buildShoukangRearSouth} from '../palace/special/ShoukangRearSouth.js';
import {applyJingrenGateStoneFrame} from '../palace/special/JingrenGateStoneFrame.js';
import {finishYikunInnerSouthWindows} from '../palace/special/YikunInnerSouthWindows.js';
import {finishChangchunSouthWindows} from '../palace/special/ChangchunSouthWindows.js';
import {finishWuyingSouthWindows} from '../palace/special/WuyingSouthWindows.js';
import {finishWenhuaSouthWindows} from '../palace/special/WenhuaSouthWindows.js';
import {finishWenhuaCentralDoors} from '../palace/special/WenhuaCentralDoors.js';
import {finishArrowSouthHeadBands} from '../palace/special/ArrowSouthHeadBands.js';
import {finishWenyuanUpperSeat} from '../palace/special/WenyuanUpperSeat.js';
import {finishWenyuanGroundFans} from '../palace/special/WenyuanGroundFans.js';
import {finishWenyuanSouthVeranda} from '../palace/special/WenyuanSouthVeranda.js';
import {finishTiyuanCoverVisual} from '../palace/special/TiyuanCoverVisual.js';
import {finishTiheSouthVisual} from '../palace/special/TiheSouthVisual.js';
import {buildSishenShrine} from '../palace/special/SishenShrine.js';
import {buildWestWellPavilion} from '../palace/special/WestWellPavilion.js';
import {buildEastWellPavilion} from '../palace/special/EastWellPavilion.js';
import {registerShoukangRetainedPerimeter} from '../palace/special/ShoukangRetainedPerimeter.js';
import {buildShoukangEntry,validateShoukangEntryCourtWall} from '../palace/special/ShoukangEntry.js';
import {buildCiningGate} from '../palace/special/CiningGate.js';
import {buildShouanEntry,validateShouanEntryCourtWall} from '../palace/special/ShouanEntry.js';
import {applyFengxianFrontVats} from '../palace/special/FengxianFrontVats.js';
import {registerRetainedCourtyardAccess,registerChuxiuMainFinishedAccess,registerChuxiuFrontWingFinishedAccess} from '../../controls/RetainedCourtyardAccess.js';
import {applyChengqianGateArrival,applyChengqianRearArrival} from '../palace/special/ChengqianArrival.js';
import {buildChengqianRearWing} from '../palace/special/ChengqianRearWings.js';
import {applyChuxiuFrontWing} from '../palace/special/ChuxiuFrontEnsemble.js';
import {buildChuxiuRearWing} from '../palace/special/ChuxiuRearWings.js';
import {buildChengqianCourtyardGroup,bindChengqianTerraceDomain,chengqianWingHardGable} from '../palace/special/ChengqianCourtyardGroup.js';
import {applyLijingWestRoom} from '../palace/special/LijingWestRoom.js';
import {registerChuxiuSideAccess} from '../../controls/ChuxiuSideAccess.js';
import {registerStairInterfaces} from '../../controls/StairInterfaces.js';
import {buildXiqingGate,xiqingWallGaps} from '../palace/special/XiqingGate.js';
import {applyChengqianRearSouthWindows} from '../palace/special/ChengqianSouthWindows.js';
import {buildHongdeCourt} from '../palace/special/HongdeCourt.js';
import {buildZhaorenCourt} from '../palace/special/ZhaorenCourt.js';
import {buildYangxinCourtEntrance} from '../palace/special/YangxinCourtEntrance.js';
import {buildNightBeds} from '../characters/NightBeds.js';
import {applyTongdaoRoof} from '../palace/special/TongdaoRoof.js';
import {applyWestRearSouthWindows} from '../palace/special/WestRearSouthWindows.js';
import {validateWestUnknownAnnexInventoryPolicy,applyWestUnknownAnnexInventory} from '../palace/special/WestUnknownAnnexInventory.js';
import {validateEastUnknownAnnexInventoryPolicy,applyEastUnknownAnnexInventory} from '../palace/special/EastUnknownAnnexInventory.js';
import {applyEastFiveRoofBeasts} from '../palace/special/EastFiveRoofBeasts.js';
import {applyJingrenRearWindows} from '../palace/special/JingrenRearWindows.js';
import {buildFengxianRearHall} from '../palace/special/FengxianRearProfile.js';
import {validateEastUnknownThroneInventoryPolicy,applyEastUnknownThroneInventory} from '../palace/special/EastUnknownThroneInventory.js';
import {applyFengxianFrontWindows} from '../palace/special/FengxianFrontWindows.js';
import {buildJingyangRearFacade} from '../palace/special/JingyangRearFacade.js';
import {applyDonghuaCentralDoorFront} from '../palace/special/DonghuaCentralDoorFront.js';
import {applyDonghuaExteriorEnvelope} from '../palace/special/DonghuaExteriorEnvelope.js';
import {validateNansansuoInventoryPolicy} from '../palace/NansansuoInventoryPolicy.js';
import { applyZuoyiDoorFront } from '../palace/special/ZuoyiDoorFront.js';
import {resolveRemainingProfile as resolveNingshou,buildRemainingHall as buildNingshou,augmentRemainingHall as augmentNingshou,finalizeNingshouCoveredPlatforms} from '../palace/special/RemainingNingshouHalls.js';
import {resolveRemainingProfile as resolveOuter,buildRemainingHall as buildOuter,augmentRemainingHall as augmentOuter} from '../palace/special/RemainingOuterHalls.js';
import {resolveRemainingProfile as resolveResidential,buildRemainingHall as buildResidential,augmentRemainingHall as augmentResidential} from '../palace/special/RemainingResidentialHalls.js';
import {buildRitualHall,ritualHallGeometry} from '../palace/special/RitualHalls.js';
import {buildEnclosedPavilion,enclosedPavilionGeometry} from '../palace/special/EnclosedPavilions.js';
import {buildShoukangHall} from '../palace/special/ShoukangHall.js';
import {buildYiheHall} from '../palace/special/YiheHall.js';
import {buildGuhuaPavilion} from '../palace/special/GuhuaPavilion.js';
import {buildEastResidentialFacade} from '../palace/special/EastResidentialFacades.js';
import { buildWestDomesticHall } from '../palace/special/WestDomesticHalls.js';
import { rearHallProfile } from '../palace/special/RearHallProfiles.js';
import { buildSouthCourtTrees } from '../palace/special/SouthCourtTrees.js';
import { buildYudeBath } from '../palace/special/YudeBath.js';
import { buildBaoyunStorehouse } from '../palace/special/BaoyunStorehouse.js';
import {finishBaoyunPorchLions} from '../palace/special/BaoyunPorchLions.js';
import {finishBaoyunExteriorSteps} from '../palace/special/BaoyunExteriorSteps.js';
import { buildWenyuanPavilion } from '../palace/special/WenyuanPavilion.js';
import { buildSouthCourtGate } from '../palace/special/SouthCourtGates.js';
import * as THREE from 'three';
import { CourtKit, FACE } from '../palace/kit.js';
import { resolveCourtWallContract } from './CourtWallContract.js';
import { buildEastWestCityGate } from '../palace/special/EastWestCityGate.js';
import { buildYanxiRuin } from '../palace/special/YanxiRuin.js';
import { detachYanxiRuinFrames, installYanxiRuinLODs } from '../palace/special/YanxiRuinLOD.js';
import { buildYanxiStorehouse } from '../palace/special/YanxiStorehouses.js';
import { historicalGateMapItem } from './HistoricalGateSites.js';
import { buildChuxiuHall } from '../palace/special/ChuxiuHall.js';
import { buildChuxiuCourtyard } from '../palace/special/ChuxiuCourtyard.js';
import { buildYikunSideAccess } from '../palace/special/YikunSideAccess.js';
import { buildSouthCourtHall, southCourtGeometry } from '../palace/special/SouthCourtHalls.js';
import {applySourceGuidedNameboardMount} from '../palace/special/SourceGuidedNameboardMounts.js';

/**
 * 分区构建器基类：从 zone JSON 构建一个区域的所有建筑。
 * 
 * 每个 zone 有唯一 id、边界、邻区列表，以及一组构件清单（items）。
 * ZoneBase 按 kind 分发到 CourtKit 对应方法，最终返回合并的 group、碰撞体、
 * 可行走面、房间、地图标注、命名区域、silhouette（远处替身低模）。
 */
export class ZoneBase {
  /**
   * @param {object} library - 材质与贴图库
   * @param {object} zoneJson - zone 数据（含 id, name, bounds, neighbors, items）
   */
  constructor(library, zoneJson) {
    this.library = library;
    this.zoneJson = zoneJson;
    this.kit = new CourtKit(library, zoneJson.id);
    this.group = null;
    /** gate name → 返回的开口宽度（用于 wall gaps 引用） */
    this.gateWidths = new Map();
    this.gateGeometries = new Map();
  }

  /**
   * 构建本区所有构件。
   * @returns {{ group, colliders, walkables, rooms, mapItems, regions, silhouette }}
   */
  build() {
    return consumeSynchronousBuild(this, this.#buildSteps());
  }

  getBuildStepMetrics() { return getBuildStepMetrics(this); }

  *#buildSteps() {
    const items = this.zoneJson.items ?? [];
    
    // 第一遍：构建所有 gate，记录开口宽度
    let gateIndex = -1;
    for (const item of items) {
      gateIndex++;
      if (item.kind === 'gate') {
        yield {phase:'gate',index:gateIndex};
        const w = this.buildGate(item);
        if (item.name) this.gateWidths.set(item.name, w);
      }
    }
    
    // 第二遍：构建其他构件（wall/courtWalls 可引用 gate 宽度）
    let itemIndex = -1;
    for (const item of items) {
      itemIndex++;
      yield {phase:'item',index:itemIndex};
      switch (item.kind) {
        case 'hall':
          this.buildHall(item);
          break;
        case 'gate':
          // 已在第一遍构建
          break;
        case 'wall':
          this.buildWall(item);
          break;
        case 'courtWalls':
          this.buildCourtWalls(item);
          break;
        case 'corridor':
          this.buildCorridor(item);
          break;
        case 'cityGate':
          this.buildCityGate(item);
          break;
        case 'region':
          this.buildRegion(item);
          break;
        case 'nineDragonWall':
          this.buildNineDragonWall(item);
          break;
        default:
          throw new Error(`[ZoneBase] 未知 kind: ${item.kind}`);
      }
    }
    
    yield {phase:'profile',index:0};
    if (this.zoneJson.yikunAccessProfile !== undefined) buildYikunSideAccess(this.kit, this.zoneJson);

    // Explicit opt-in, after all retained halls, before material merging.
    yield {phase:'profile',index:1};
    if (this.zoneJson.courtyardProfile !== undefined) buildChuxiuCourtyard(this.kit, this.zoneJson);

    yield {phase:'profile',index:2};
    if (this.zoneJson.southTreeProfile !== undefined) buildSouthCourtTrees(this.kit, this.zoneJson);

    yield {phase:'profile',index:3};
    if (this.zoneJson.hongdeProfile !== undefined) buildHongdeCourt(this.kit,this.zoneJson);
    yield {phase:'profile',index:4};
    if (this.zoneJson.zhaorenProfile !== undefined) buildZhaorenCourt(this.kit,this.zoneJson);
    yield {phase:'profile',index:5};
    if (this.zoneJson.eastWellProfile !== undefined) buildEastWellPavilion(this.kit,this.zoneJson);
    yield {phase:'profile',index:6};
    if (this.zoneJson.westWellProfile !== undefined) buildWestWellPavilion(this.kit,this.zoneJson);
    yield {phase:'profile',index:7};
    if (this.zoneJson.sishenProfile !== undefined) buildSishenShrine(this.kit,this.zoneJson);
    yield {phase:'profile',index:8};
    if (this.zoneJson.yangxinEntranceProfile !== undefined) buildYangxinCourtEntrance(this.kit,this.zoneJson);

    yield {phase:'hook',index:0};
    buildChengqianCourtyardGroup(this.kit,this.zoneJson);
    yield {phase:'hook',index:1};
    buildNightBeds(this.kit,this.zoneJson);
    yield {phase:'hook',index:2};
    registerStairInterfaces(this.kit,this.zoneJson);
    yield {phase:'hook',index:3};
    bindChengqianTerraceDomain(this.kit,this.zoneJson);
    yield {phase:'hook',index:4};
    registerChuxiuSideAccess(this.kit,this.zoneJson);
    yield {phase:'hook',index:5};
    registerRetainedCourtyardAccess(this.kit,this.zoneJson);
    yield {phase:'hook',index:6};
    registerChuxiuMainFinishedAccess(this.kit,this.zoneJson);
    yield {phase:'hook',index:7};
    registerChuxiuFrontWingFinishedAccess(this.kit,this.zoneJson);
    yield {phase:'hook',index:8};
    finishTiheSouthVisual(this.kit);
    yield {phase:'hook',index:9};
    finishTiyuanCoverVisual(this.kit);
    yield {phase:'hook',index:10};
    finishWenyuanUpperSeat(this.kit);
    yield {phase:'hook',index:11};
    finishWenyuanGroundFans(this.kit);
    yield {phase:'hook',index:12};
    finishWenyuanSouthVeranda(this.kit);
    yield {phase:'hook',index:13};
    finishWenyuanEntryTread(this.kit);
    yield {phase:'hook',index:14};
    finishWenhuaSouthWindows(this.kit);
    yield {phase:'hook',index:15};
    finishWenhuaCentralDoors(this.kit);
    yield {phase:'hook',index:16};
    finishZhujingNorthWindows(this.kit);
    yield {phase:'hook',index:17};
    finishWuyingSouthWindows(this.kit);
    yield {phase:'hook',index:18};
    finishChangchunSouthWindows(this.kit);
    yield {phase:'hook',index:19};
    finishYikunInnerSouthWindows(this.kit);
    yield {phase:'hook',index:20};
    finishArrowSouthHeadBands(this.kit,this.zoneJson);

    yield {phase:'hook',index:21};
    finishNansansuoFrontHalls(this.kit,this.zoneJson);
    yield {phase:'hook',index:22};
    finishNansansuoCourtyardGates(this.kit,this.zoneJson);
    yield {phase:'hook',index:23};
    finishNansansuoNorthEaves(this.kit,this.zoneJson);
    yield {phase:'hook',index:24};
    buildNansansuoMiddleHall(this.kit,this.zoneJson);
    yield {phase:'hook',index:25};
    buildNansansuoEastMiddleHall(this.kit,this.zoneJson);
    yield {phase:'hook',index:26};
    buildNansansuoWestMiddleHall(this.kit,this.zoneJson);
    yield {phase:'hook',index:27};
    buildNansansuoMiddleWell(this.kit,this.zoneJson);
    yield {phase:'hook',index:28};
    buildNansansuoMiddleEastSideHall(this.kit,this.zoneJson);
    yield {phase:'hook',index:29};
    buildNansansuoMiddleWestSideHall(this.kit,this.zoneJson);
    yield {phase:'hook',index:30};
    buildNansansuoWestCourtWestSideHall(this.kit,this.zoneJson);
    yield {phase:'hook',index:31};
    buildNansansuoEastCourtEastSideHall(this.kit,this.zoneJson);
    yield {phase:'hook',index:32};
    buildNansansuoWestCourtEastSideHall(this.kit,this.zoneJson);
    // Keep distance levels out of the ordinary recursive material merge.
    yield {phase:'detach',index:0};
    const yanxiFrames = detachYanxiRuinFrames(this.kit.root);
    yield {phase:'hook',index:33};
    buildNeigeCourt(this.kit, this.zoneJson);
    yield {phase:'hook',index:34};
    buildNeigeStorehouse(this.kit, this.zoneJson);
    yield {phase:'hook',index:35};
    buildNeigeSouthConnectingGate(this.kit, this.zoneJson);
    yield {phase:'hook',index:36};
    buildNeigeWestAnnexSegment(this.kit, this.zoneJson);
    yield {phase:'hook',index:37};
    buildNeigeTextSideWings(this.kit, this.zoneJson);
    yield {phase:'hook',index:38};
    buildNeigeEastTextAnnex(this.kit, this.zoneJson);
    yield {phase:'hook',index:39};
    buildNeigeSecondStorehouse(this.kit, this.zoneJson);
    yield {phase:'hook',index:40};
    buildNeigeHanbenTextVolume(this.kit, this.zoneJson);
    yield {phase:'hook',index:41};
    buildZhishengShell(this.kit, this.zoneJson);
    yield {phase:'hook',index:42};
    buildZhifangShell(this.kit, this.zoneJson);
    yield {phase:'hook',index:43};
    buildChuanxinZhubanShell(this.kit, this.zoneJson);
    yield {phase:'hook',index:44};
    buildDapaoWell(this.kit, this.zoneJson);
    yield {phase:'hook',index:45};
    buildWenyuanStelePavilion(this.kit, this.zoneJson);
    yield {phase:'hook',index:46};
    buildChuanxinHall(this.kit, this.zoneJson);
    yield {phase:'hook',index:47};
    buildJingxingGate(this.kit, this.zoneJson);
    yield {phase:'hook',index:48};
    buildLuanjiaEastWing(this.kit, this.zoneJson);
    yield {phase:'hook',index:49};
    buildLuanjiaSouthWing(this.kit, this.zoneJson);
    yield {phase:'hook',index:50};
    finishLuanjiaEastTwoLevel(this.kit, this.zoneJson);
    yield {phase:'hook',index:51};
    finishLuanjiaSouthTwoLevel(this.kit, this.zoneJson);
    yield {phase:'hook',index:52};
    finishLuanjiaSouthPhotoWindows(this.kit, this.zoneJson);
    yield {phase:'hook',index:53};
    finishWenhuaCompanionSteps(this.kit, this.zoneJson);
    yield {phase:'hook',index:54};
    finishBaoyunPorchLions(this.kit);
    yield {phase:'hook',index:55};
    finishBaoyunExteriorSteps(this.kit);
    yield {phase:'hook',index:56};
    finishFengxianFrontSteps(this.kit);
    yield {phase:'hook',index:57};
    registerFengxianCentralContact(this.kit);
    yield {phase:'hook',index:58};
    buildZhaigongFrontHall(this.kit,this.zoneJson.id);
    yield {phase:'hook',index:59};
    buildChengsuFrontHall(this.kit,this.zoneJson.id);
    yield {phase:'hook',index:60};
    buildYuqingFrontHall(this.kit,this.kit.root.name);
    yield {phase:'hook',index:61};
    buildDunbenFrontHall(this.kit,this.kit.root.name);
    yield {phase:'hook',index:62};
    buildTianqiongFrontHall(this.kit,this.kit.root.name);
    yield {phase:'hook',index:63};
    buildLinzhiGate(this.kit,this.kit.root.name);
    yield {phase:'hook',index:64};
    buildZhongsiGate(this.kit,this.kit.root.name);
    yield {phase:'hook',index:65};
    buildYongheRearEastWing(this.kit,this.kit.root.name);
    yield {phase:'hook',index:66};
    buildYongheRearWestWing(this.kit,this.kit.root.name);
    yield {phase:'hook',index:67};
    buildZhongcuiRearEastWing(this.kit,this.kit.root.name);
    yield {phase:'hook',index:68};
    buildZhongcuiRearWestWing(this.kit,this.kit.root.name);
    yield {phase:'hook',index:69};
    buildJingyangRearWestWing(this.kit,this.kit.root.name);
    yield {phase:'hook',index:70};
    buildJingyangRearEastWing(this.kit,this.kit.root.name);
    yield {phase:'hook',index:71};
    buildJingrenRearWestWing(this.kit,this.kit.root.name);
    yield {phase:'hook',index:72};
    buildJingrenRearEastWing(this.kit,this.kit.root.name);
    yield {phase:'hook',index:73};
    buildJideRearHall(this.kit,this.kit.root.name);
    yield {phase:'hook',index:74};
    buildYongshouRearWestWing(this.kit,this.kit.root.name);
    yield {phase:'hook',index:75};
    buildYongshouRearEastWing(this.kit,this.kit.root.name);
    yield {phase:'hook',index:76};
    buildXianfuRearWestWing(this.kit,this.kit.root.name);
    yield {phase:'hook',index:77};
    buildXianfuRearEastWing(this.kit,this.kit.root.name);
    yield {phase:'hook',index:78};
    buildTiheYishouWing(this.kit,this.kit.root.name);
    yield {phase:'hook',index:79};
    buildTihePingkangWing(this.kit,this.kit.root.name);
    yield {phase:'hook',index:80};
    buildChangchunYishouWing(this.kit,this.kit.root.name);
    yield {phase:'hook',index:81};
    buildChangchunLezhiWing(this.kit,this.kit.root.name);
    yield {phase:'hook',index:82};
    buildJiangxueHall(this.kit,this.kit.root.name);
    yield {phase:'hook',index:83};
    buildWeiyuHall(this.kit,this.kit.root.name);
    yield {phase:'hook',index:84};
    buildChizaoHall(this.kit,this.kit.root.name);
    yield {phase:'hook',index:85};
    buildYanhuiHall(this.kit,this.kit.root.name);
    yield {phase:'hook',index:86};
    buildNingxiangPavilion(this.kit,this.kit.root.name);
    yield {phase:'hook',index:87};
    buildYangxingZhai(this.kit,this.kit.root.name);
    yield {phase:'hook',index:88};
    buildJifuGate(this.kit,this.kit.root.name);
    yield {phase:'hook',index:89};
    buildYanheGate(this.kit,this.kit.root.name);
    yield {phase:'hook',index:90};
    buildChengguangGate(this.kit,this.kit.root.name);
    yield {phase:'hook',index:91};
    buildYucuiPavilion(this.kit,this.kit.root.name);
    yield {phase:'hook',index:92};
    buildQinanIncensePavilions(this.kit,this.kit.root.name);
    yield {phase:'hook',index:93};
    buildYinghuaStelePavilion(this.kit,this.zoneJson);
    yield {phase:'hook',index:94};
    buildYinghuaWestEarHall(this.kit,this.zoneJson);
    yield {phase:'hook',index:95};
    buildJingshengZhai(this.kit,this.zoneJson);
    yield {phase:'hook',index:96};
    buildBilinGuan(this.kit,this.zoneJson);
    yield {phase:'hook',index:97};
    buildNinghuiHall(this.kit,this.zoneJson);
    yield {phase:'hook',index:98};
    buildJianfuJiyunLou(this.kit,this.zoneJson);
    yield {phase:'hook',index:99};
    buildJicuiPavilion(this.kit,this.zoneJson);
    yield {phase:'hook',index:100};
    buildShufangStage(this.kit,this.zoneJson);
    yield {phase:'hook',index:101};
    buildShufangFrontHall(this.kit,this.zoneJson);
    yield {phase:'hook',index:102};
    buildJinzhaoYucui(this.kit,this.zoneJson);
    yield {phase:'hook',index:103};
    buildGaoyunqing(this.kit,this.zoneJson);
    yield {phase:'hook',index:104};
    buildFengyacun(this.kit,this.zoneJson);
    yield {phase:'hook',index:105};
    buildChongjingHall(this.kit,this.zoneJson);
    yield {phase:'hook',index:106};
    buildYudeWestHall(this.kit,this.zoneJson);
    yield {phase:'hook',index:107};
    buildJingyiXuan(this.kit,this.zoneJson);
    yield {phase:'hook',index:108};
    buildYuhuaGe(this.kit,this.zoneJson);
    yield {phase:'hook',index:109};
    buildBaohuaDian(this.kit,this.zoneJson);
    yield {phase:'hook',index:110};
    buildFanzongLou(this.kit,this.zoneJson);
    yield {phase:'hook',index:111};
    buildXiangyunPavilion(this.kit,this.zoneJson);
    yield {phase:'hook',index:112};
    buildFuchenHall(this.kit,this.zoneJson);
    yield {phase:'hook',index:113};
    buildJianfuMainHall(this.kit,this.zoneJson);
    yield {phase:'hook',index:114};
    buildHuifengPavilion(this.kit,this.zoneJson);
    yield {phase:'hook',index:115};
    buildYuhuaEastLou(this.kit,this.zoneJson);
    yield {phase:'hook',index:116};
    buildYuhuaWestLou(this.kit,this.zoneJson);
    yield {phase:'hook',index:117};
    buildZhaofuGate(this.kit,this.zoneJson);
    yield {phase:'hook',index:118};
    buildZhongzhengEastHall(this.kit,this.zoneJson);
    yield {phase:'hook',index:119};
    buildZhongzhengWestHall(this.kit,this.zoneJson);
    yield {phase:'hook',index:120};
    buildBaozhongEastHall(this.kit,this.zoneJson);
    yield {phase:'hook',index:121};
    buildZhenfeiWell(this.kit,this.zoneJson);
    yield {phase:'hook',index:122};
    buildJingfuWenfeng(this.kit,this.zoneJson);
    yield {phase:'hook',index:123};
    buildSouthThirteenHouses(this.kit,this.zoneJson);
    yield {phase:'hook',index:124};
    buildNorthThirteenHouses(this.kit,this.zoneJson);
    yield {phase:'hook',index:125};
    buildThirteenSouthEntry(this.kit,this.zoneJson);
    yield {phase:'hook',index:126};
    buildYiheJingqiConnector(this.kit,this.zoneJson);
    yield {phase:'hook',index:127};
    buildQingshouRaisedWalk(this.kit,this.zoneJson);
    yield {phase:'hook',index:128};
    buildQingshouNorthHalls(this.kit,this.zoneJson);
    yield {phase:'hook',index:129};
    buildYucuiMainShell(this.kit,this.zoneJson);
    yield {phase:'hook',index:130};
    buildSanyouMainShell(this.kit,this.zoneJson);
    yield {phase:'hook',index:131};
    buildYizhaiMainShell(this.kit,this.zoneJson);
    yield {phase:'hook',index:132};
    buildForiFanhuaStair(this.kit,this.zoneJson);
    yield {phase:'hook',index:133};
    buildYiheCourtCensers(this.kit,this.zoneJson);
    yield {phase:'hook',index:134};
    buildChangyinMiddleNameboard(this.kit,this.zoneJson);
    yield {phase:'hook',index:135};
    buildChangyinLowerNameboard(this.kit,this.zoneJson);
    yield {phase:'hook',index:136};
    buildZhuxiangMainShell(this.kit,this.zoneJson);
    yield {phase:'hook',index:137};
    buildJutingMainPavilion(this.kit,this.zoneJson);
    yield {phase:'hook',index:138};
    buildYunguangMainShell(this.kit,this.zoneJson);
    yield {phase:'hook',index:139};
    buildLutaiRockTerrace(this.kit,this.zoneJson);
    yield {phase:'hook',index:140};
    buildSongxiuHillPavilion(this.kit,this.zoneJson);
    yield {phase:'hook',index:141};
    buildXiefangHillPavilion(this.kit,this.zoneJson);
    yield {phase:'hook',index:142};
    buildXuhuiGallery(this.kit,this.zoneJson);
    yield {phase:'hook',index:143};
    buildXuanshouSouthFront(this.kit,this.zoneJson);
    yield {phase:'hook',index:144};
    buildFuyiThreeBay(this.kit,this.zoneJson);
    yield {phase:'hook',index:145};
    buildXihuaNorthWatchHouse(this.kit,this.zoneJson);
    yield {phase:'hook',index:146};
    buildYangxinCompanionHalls(this.kit,this.zoneJson);
    yield {phase:'hook',index:147};
    buildYanxiRearEarHall(this.kit,this.zoneJson);
    yield {phase:'hook',index:148};
    buildZhongzhengMainHall(this.kit,this.zoneJson);
    yield {phase:'hook',index:149};
    buildDanyuanElevenBayHall(this.kit,this.zoneJson);
    yield {phase:'hook',index:150};
    buildChenghuangGlazedEntry(this.kit,this.zoneJson);
    yield {phase:'hook',index:151};
    buildTishunSouthBeam(this.kit,this.zoneJson);
    yield {phase:'hook',index:152};
    buildDailouWaitingHouse(this.kit,this.zoneJson);
    yield {phase:'hook',index:153};
    buildXiangxuGlazedGate(this.kit,this.zoneJson);
    yield {phase:'merge',index:0};
    finalizeNingshouCoveredPlatforms(this.kit);
    this.group = this.kit.finish();
    if(this.zoneJson.id==='outer-west'&&this.group.userData.architecture.some(r=>r.id==='place-outer-west-6cae88b6a2'))this.dafotangPhotoSession=createDafotangPhotoSession(this.group);
    yield {phase:'lod',index:0};
    installYanxiRuinLODs(this.group, yanxiFrames, this.kit.owned);
    
    // silhouette：本区屋顶的合并低模（Phase 1 优化时实现，当前返回 null）
    // 实在拿不到屋顶网格就先返回 null，不强求改 kit 内部
    const silhouette = null;
    
    yield {phase:'result',index:0};
    return {
      group: this.group,
      colliders: [...this.kit.colliders],
      walkables: [...this.kit.walkables],
      rooms: [...this.kit.rooms],
      mapItems: this.kit.mapItems.map(publicMapItem),
      regions: [...this.kit.regions],
      silhouette,
    };
  }

  /** Cache admission only: mergeByMaterial already disposed these source
   * geometries and moved noMerge/LOD objects into the finished group. Drop
   * only unused construction references. Private contact certificates retain
   * their real source branches; never dispose live merged resources. */
  releaseConstructionReferences() {
    if (!this.group || this.group === this.kit.root) throw new Error('Zone is not finished');
    releaseUnusedConstructionBranches(this.kit);
    this.kit.plaques.length = 0;
  }

  update(dt) {
    // 当前无动画需求，预留接口
  }

  dispose() {
    if (this.disposed) return;
    this.disposed = true;
    this.dafotangPhotoSession?.dispose();
    this.dafotangPhotoSession=null;
    // A failed build may own source resources before a merged group exists.
    this.kit.dispose(this.group ?? this.kit.root);
    this.group?.removeFromParent();
    this.group = null;
    this.kit.root.clear();
    this.kit.plaques.length = 0;
    forgetConstructionSources(this.kit);
    this.gateWidths.clear();
    this.gateGeometries.clear();
  }

  // ───────────────────────── 各 kind 构建方法 ─────────────────────────

  buildHall(item) {
    if(item.structure==='chengqian-rear-wing')return buildChengqianRearWing(this.kit,item,this.zoneJson);
    const itemIndex=this.zoneJson.items.indexOf(item);
    const inventoryContext=this.zoneJson.id==='east-six'&&[2,9,16,30,37].includes(itemIndex)
      ? {zoneId:this.zoneJson.id,itemIndex,item:{...item,furnishingPolicy:{mode:'unknown-inventory',target:`east-six/items/${itemIndex}`,scope:'r62-east-five-generic-thrones-only'}}}:null;
    if(inventoryContext)validateEastUnknownThroneInventoryPolicy(inventoryContext);
    const annexContext=this.zoneJson.id==='east-six'&&[3,4,5,10,11,12,17,18,19,24,25,26,31,32,33,38,39,40,44,45,46,47,48,54].includes(itemIndex)
      ? {zoneId:this.zoneJson.id,itemIndex,item:{...item,furnishingPolicy:{mode:'unknown-inventory',target:`east-six/items/${itemIndex}`,scope:'r62-east-24-unnamed-annex-furnish-room-only'}}}:null;
    if(annexContext)validateEastUnknownAnnexInventoryPolicy(annexContext);
    const westAnnexContext=this.zoneJson.id==='west-six'&&[3,9,10,16,17,25,26,32,33,41,42,48,49].includes(itemIndex)
      ? {zoneId:this.zoneJson.id,itemIndex,item:{...item,furnishingPolicy:{mode:'unknown-inventory',target:`west-six/items/${itemIndex}`,scope:'r63-west-13-unnamed-annex-furnish-room-only'}}}:null;
    if(westAnnexContext)validateWestUnknownAnnexInventoryPolicy(westAnnexContext);
    const finish=built=>{
      applyEastFiveRoofBeasts(this.kit,this.zoneJson.id,itemIndex,item,built);
      if(westAnnexContext)return applyChuxiuFrontWing(this.kit,this.zoneJson.id,itemIndex,item,applyWestUnknownAnnexInventory(this.kit,westAnnexContext,built));
      if(annexContext)return applyEastUnknownAnnexInventory(this.kit,annexContext,built);
      return inventoryContext?applyEastUnknownThroneInventory(this.kit,inventoryContext,built):built;
    };
    const shoukangRear=buildShoukangRearSouth(this.kit,item,{zoneId:this.zoneJson.id,itemIndex,zoneJson:this.zoneJson});
    if(shoukangRear)return finish(shoukangRear);
    const fengxianRear=buildFengxianRearHall(this.kit,item,itemIndex);
    if(fengxianRear)return finish(fengxianRear);
    if(this.zoneJson.id==='east-six'&&this.zoneJson.items.indexOf(item)===38)return finish(buildJingyangRearFacade(this.kit,item,this.zoneJson.id));
    if (item.furnishingPolicy !== undefined) validateNansansuoInventoryPolicy({zoneId:this.zoneJson.id,itemIndex:this.zoneJson.items.indexOf(item),item});
    // R48 exact-identity profiles are opt-in by the reviewed catalog binding.
    // Existing dedicated builders remain the sole owner for augmentation.
    const candidates = [[resolveResidential,buildResidential,augmentResidential],[resolveNingshou,buildNingshou,augmentNingshou],[resolveOuter,buildOuter,augmentOuter]]
      .map(([resolve,build,augment])=>({profile:resolve(this.zoneJson.id,item),build,augment})).filter(x=>x.profile);
    if(candidates.length>1)throw Error('Ambiguous R48 named-building profile');
    const selected=candidates[0];
    if(selected?.profile.mode==='replace')return finish(applySourceGuidedNameboardMount(this.kit,this.zoneJson.id,item,selected.build(this.kit,item,selected.profile)));
    const built=this.buildHallBaseline(item);
    if(this.zoneJson.id==='west-six'&&[24,47].includes(itemIndex)){
      built.f.updateWorldMatrix(true,true);
      if(!applyWestRearSouthWindows(this.kit,built.f,item,itemIndex))throw Error('West rear south window profile failed closed');
      applyLijingWestRoom(this.kit,this.zoneJson.id,itemIndex,item,built);
    }
    if(this.zoneJson.id==='east-six'&&itemIndex===3){
      built.f.updateWorldMatrix(true,false);
      if(!applyJingrenRearWindows(this.kit,built.f,item))throw Error('Jingren rear window profile failed closed');
    }
    if(this.zoneJson.id==='east-six'&&itemIndex===10){
      built.f.updateWorldMatrix(true,true);
      if(!applyChengqianRearSouthWindows(this.kit,built.f,item,itemIndex))throw Error('Chengqian rear south window profile failed closed');
      applyChengqianRearArrival(this.kit,built.f,item,this.zoneJson,itemIndex);
    }
    applyFengxianFrontWindows(this.kit,this.zoneJson.id,item,built);
    applyFengxianFrontVats(this.kit,this.zoneJson.id,item,built);
    if(selected?.profile.mode==='augment')return finish(applySourceGuidedNameboardMount(this.kit,this.zoneJson.id,item,selected.augment(this.kit,item,built,selected.profile)));
    return finish(applySourceGuidedNameboardMount(this.kit,this.zoneJson.id,item,built));
  }

  buildHallBaseline(item) {
    if(item.structure==='chuxiu-rear-wing'||item.rearCourtProfile!==undefined)return buildChuxiuRearWing(this.kit,item,this.zoneJson);
    if(item.structure==='ritual-hall'||item.ritualProfile!==undefined){const g=ritualHallGeometry(item);if(this.zoneJson.id!=='outer-west')throw Error('Ritual hall wrong zone');return buildRitualHall(this.kit,item);}
    if(item.structure==='enclosed-pavilion'||item.enclosureProfile!==undefined){const g=enclosedPavilionGeometry(item);if(this.zoneJson.id!==g.id.split('/')[0])throw Error('Enclosed pavilion wrong zone');return buildEnclosedPavilion(this.kit,item);}
    if(item.structure==='shoukang-front-hall'||item.shoukangProfile!==undefined){if(this.zoneJson.id!=='outer-west')throw Error('Shoukang requires outer-west zone');return buildShoukangHall(this.kit,item);}
    if(item.structure==='yihe-ground-hall'||item.yiheProfile!==undefined){if(this.zoneJson.id!=='ningshou')throw Error('Yihe requires ningshou zone');return buildYiheHall(this.kit,item);}
    if(item.structure==='guhua-open-pavilion'||item.guhuaProfile!==undefined){if(this.zoneJson.id!=='ningshou')throw Error('Guhua requires ningshou zone');return buildGuhuaPavilion(this.kit,item);}
    const rearProfile=rearHallProfile(this.zoneJson.id,item);
    if(item.structure==='east-residential-facade'||item.facadeProfile!==undefined){
      if(this.zoneJson.id!=='east-six')throw Error('East facade profile belongs only in east-six');
      return buildEastResidentialFacade(this.kit,item);
    }
    if(item.structure==='west-domestic-hall'||item.domesticProfile!==undefined){
      if(this.zoneJson.id!=='west-six')throw Error('West domestic profile belongs only in west-six');
      return buildWestDomesticHall(this.kit,item);
    }
    if(item.structure==='yude-bath-compound'){
      if(this.zoneJson.id!=='outer-west')throw new Error('Yude belongs in outer-west');
      return buildYudeBath(this.kit,item);
    }
    if(item.structure==='baoyun-western-storehouse'){
      if(this.zoneJson.id!=='outer-west')throw new Error('Baoyun belongs in outer-west');
      return buildBaoyunStorehouse(this.kit,item);
    }
    if (item.structure === 'wenyuan-pavilion') {
      if(this.zoneJson.id !== 'outer-east') throw new Error('Wenyuan belongs in outer-east');
      return buildWenyuanPavilion(this.kit,item);
    }
    if (item.structure === 'south-court-hall' || item.southCourtProfile !== undefined) {
      const g = southCourtGeometry(item);
      if (this.zoneJson.id !== g.zone) throw new Error('South court profile is in the wrong zone');
      return buildSouthCourtHall(this.kit, item);
    }
    if (item.structure === 'chuxiu-household' || item.chuxiuProfile !== undefined) {
      if (this.zoneJson.id !== 'west-six' || item.name !== '储秀宫') throw new Error('Chuxiu profile belongs only to west-six/储秀宫');
      return buildChuxiuHall(this.kit, item);
    }
    if (item.structure === 'yanxi-ruin' || item.ruinProfile !== undefined) return buildYanxiRuin(this.kit,item);
    if (item.structure === 'yanxi-storehouse' || item.storehouseProfile !== undefined) return buildYanxiStorehouse(this.kit,item);
    const params = {
      x: item.x,
      z: item.z,
      rot: item.pavilionProfile || item.qinanProfile ? item.rot : this.parseRot(item.rot),
      w: item.w,
      d: item.d,
      pad: item.pad,
      ph: item.ph,
      colH: item.colH,
      roof: item.roof,
      layers: item.layers,
      eaveCount: item.eaveCount,
      storeys: item.storeys,
      lowerStoreyH: item.lowerStoreyH,
      upperStoreyH: item.upperStoreyH,
      structure: item.structure,
      pavilionProfile: item.pavilionProfile,
      sideGalleryConnections: sideConnectionTargets(this.zoneJson,item),
      qinanProfile: item.qinanProfile,
      interiorFloorWorldY: item.interiorFloorWorldY,
      bays: item.bays,
      roofH: item.roofH,
      roomBays: item.roomBays,
      interior: item.interior,
      brackets: item.brackets,
      enter: item.enter,
      throne: item.throne,
      backDoor: item.backDoor,
      open: item.open,
      name: item.name,
      plaque: item.plaque,
      plaqueText: item.plaqueText,
      map: item.map,
    };
    // 过滤 undefined 参数，让 kit 方法使用默认值
    Object.keys(params).forEach(k => params[k] === undefined && delete params[k]);
    if(rearProfile||chengqianWingHardGable(this.zoneJson.id,this.zoneJson.items.indexOf(item),item))params.hardGableEnd=true;
    const result=item.furnishingPolicy===undefined ? this.kit.hall(params) : this.kit.nansansuoUnknownHall(params,{zoneId:this.zoneJson.id,itemIndex:this.zoneJson.items.indexOf(item),item});
    if(rearProfile){
      result.f.userData.rearHall=rearProfile;
      result.f.userData.structure={...result.f.userData.structure,...rearProfile,id:`${rearProfile.zone}/${rearProfile.id}`,profile:rearProfile.id};
    }
    applyTongdaoRoof(this.kit,this.zoneJson.id,this.zoneJson.items.indexOf(item),item,result);
    if(item.auxiliaryIdentity!==undefined){
      if(this.zoneJson.id!=='outer-west'||item.auxiliaryIdentity!=='恒寿斋'||item.name)throw new Error('Unknown southern auxiliary identity');
      result.f.userData.structure={id:'wuying-hengshou-auxiliary',name:item.auxiliaryIdentity,x:item.x,z:item.z,w:item.w,d:item.d,bays:item.bays,status:item.dimensionStatus,source:item.source,interiorPolicy:'CLOSED_UNFURNISHED_NO_INVENTED_CONTENTS'};
    }
    return result;
  }

  buildGate(item) {
    if(this.zoneJson.id==='ningshou'&&this.zoneJson.items.indexOf(item)===6){const b=buildBaotaiGate(this.kit,item,{zoneId:this.zoneJson.id,itemIndex:6,zoneJson:this.zoneJson});this.gateGeometries.set(item.name,b.geometry);return b.width;}
    if(this.zoneJson.id==='ningshou'&&this.zoneJson.items.indexOf(item)===4){const b=buildLushunGate(this.kit,item,{zoneId:this.zoneJson.id,itemIndex:4,zoneJson:this.zoneJson});this.gateGeometries.set(item.name,b.geometry);return b.width;}
    if(this.zoneJson.id==='ningshou'&&this.zoneJson.items.indexOf(item)===5){const b=buildDaoheGate(this.kit,item,{zoneId:this.zoneJson.id,itemIndex:5,zoneJson:this.zoneJson});this.gateGeometries.set(item.name,b.geometry);return b.width;}
    if(this.zoneJson.id==='ningshou'&&this.zoneJson.items.indexOf(item)===9){const b=buildZhenshunGate(this.kit,item,{zoneId:this.zoneJson.id,itemIndex:9,zoneJson:this.zoneJson});this.gateGeometries.set(item.name,b.geometry);return b.width;}
    if(this.zoneJson.id==='ningshou'&&this.zoneJson.items.indexOf(item)===1){const b=buildLianxiGate(this.kit,item,{zoneId:this.zoneJson.id,itemIndex:1,zoneJson:this.zoneJson});this.gateGeometries.set(item.name,b.geometry);return b.width;}
    if(this.zoneJson.id==='outer-east'&&item.name==='南三所宫门'){const built=buildNansansuoCommonGate(this.kit,item,{zoneId:this.zoneJson.id,itemIndex:this.zoneJson.items.indexOf(item),zoneJson:this.zoneJson});if(!built)throw Error('Nansansuo common gate dispatch mismatch');this.gateGeometries.set(item.name,built.geometry);return built.width;}
    if(this.zoneJson.id==='axis-courts'&&item.name==='左翼门'){const b=buildZuoyiOwnGate(this.kit,item,this.zoneJson.id,this.zoneJson.items.indexOf(item));this.gateGeometries.set(item.name,b.geometry);return b.width;}
    if(this.zoneJson.id==='axis-courts'&&item.name==='右翼门'){const b=buildYouyiFreshGate(this.kit,item,this.zoneJson.id,this.zoneJson.items.indexOf(item));this.gateGeometries.set(item.name,b.geometry);return b.width;}
    if(item.middleRightGate!==undefined){const b=buildMiddleRightGate(this.kit,item,this.zoneJson.id,this.zoneJson.items.indexOf(item));this.gateGeometries.set(item.name,b.geometry);return b.width;}
    if(item.rearAxisGate!==undefined){const b=buildRearAxisGate(this.kit,item,this.zoneJson.id,this.zoneJson.items.indexOf(item));this.gateGeometries.set(item.name,b.geometry);return b.width;}
    if(item.gateProfile==='shoukang-entry'){const walls=this.zoneJson.items.filter(q=>q.kind==='courtWalls'&&q.gates?.some(r=>r.gate==='寿康门'));if(walls.length!==1)throw Error('Shoukang entry requires unique actual court wall');validateShoukangEntryCourtWall(walls[0]);const built=buildShoukangEntry(this.kit,item,this.zoneJson.id);this.gateGeometries.set(item.name,built.geometry);return built.width;}
    if(item.gateProfile==='cining-entry'){const built=buildCiningGate(this.kit,item,this.zoneJson.id);this.gateGeometries.set(item.name,built.g);return built.width;}
    if(item.gateProfile==='shouan-entry'){const walls=this.zoneJson.items.filter(q=>q.kind==='courtWalls'&&q.gates?.some(r=>r.gate==='寿安门'));if(walls.length!==1)throw Error('Shouan requires a unique actual court wall');validateShouanEntryCourtWall(walls[0]);const built=buildShouanEntry(this.kit,item,this.zoneJson.id);this.gateGeometries.set(item.name,built.geometry);return built.width;}
    if(item.gateProfile==='xiqing'){const built=buildXiqingGate(this.kit,item,this.zoneJson.id,this.zoneJson.items.indexOf(item));this.gateGeometries.set(item.name,built.geometry);return built.width;}
    if (item.southGateProfile !== undefined) return buildSouthCourtGate(this.kit,item).width;
    if (item.historicalSite !== undefined) {
      this.kit.mapItems.push(historicalGateMapItem(item));
      // No physical opening width: a new wall must not silently use a
      // demolished gate as evidence for cutting a current-day opening.
      return 0;
    }
    const params = {
      x: item.x,
      z: item.z,
      // Dedicated profiles validate their cardinal transform; do not let the
      // permissive legacy parser turn malformed input into a south-facing gate.
      rot: item.gateProfile !== undefined ? item.rot : this.parseRot(item.rot),
      w: item.w,
      h: item.h,
      t: item.t,
      style: item.style,
      gateKind: item.gateKind,
      gateProfile: item.gateProfile,
      open: item.open,
      plaque: item.plaque,
      name: item.name,
      roof: item.roof,
      brackets: item.brackets,
      layers: item.layers,
      eaveCount: item.eaveCount,
    };
    Object.keys(params).forEach(k => params[k] === undefined && delete params[k]);
    const ownGateColliderStart=this.kit.colliders.length,ownGateWalkableStart=this.kit.walkables.length;
    const width = this.kit.gate(params);
    buildNingshouSideApproach(this.kit,this.kit.root.children.at(-1),{zoneId:this.zoneJson.id,itemIndex:this.zoneJson.items.indexOf(item),item});
    fitNingshouFrontHall(this.kit,this.kit.root.children.at(-1),{zoneId:this.zoneJson.id,itemIndex:this.zoneJson.items.indexOf(item),item});
    buildYangxingFrontCeiling(this.kit,this.kit.root.children.at(-1),{zoneId:this.zoneJson.id,itemIndex:this.zoneJson.items.indexOf(item),item});
    applyGardenStreetGatePins(this.kit,this.kit.root.children.at(-1),{zoneId:this.zoneJson.id,itemIndex:this.zoneJson.items.indexOf(item),item});
    applyMiddleAxisFacades(this.kit,this.kit.root.children.at(-1),{zoneId:this.zoneJson.id,itemIndex:this.zoneJson.items.indexOf(item),item});
    raiseMiddleLeftPlatform(this.kit,this.kit.root.children.at(-1),{zoneId:this.zoneJson.id,itemIndex:this.zoneJson.items.indexOf(item),item,colliderStart:ownGateColliderStart,walkableStart:ownGateWalkableStart});
    applyJingrenGateStoneFrame(this.kit, this.kit.root.children.at(-1), {zoneId:this.zoneJson.id,itemIndex:this.zoneJson.items.indexOf(item),item});
    applyZuoyiDoorFront(this.kit, this.kit.root.children.at(-1), {zoneId:this.zoneJson.id,itemIndex:this.zoneJson.items.indexOf(item),item});
    if (item.gateProfile === 'zhaode' || item.gateProfile === 'zhendu' || item.gateProfile === 'huangji') this.gateGeometries.set(item.name, this.kit.root.children.at(-1).userData.gateGeometry);
    if(this.zoneJson.id==='east-six'&&this.zoneJson.items.indexOf(item)===7)applyChengqianGateArrival(this.kit,this.kit.root.children.at(-1),item,this.zoneJson,7);
    return width; // 返回开口宽度
  }

  buildWall(item) {
    if(buildShangshuSouthFragment(this.kit,item,this.zoneJson.id,this.zoneJson.items.indexOf(item)))return;
    const [x1, z1] = item.from;
    const [x2, z2] = item.to;
    const gaps = this.zoneJson.id==='ningshou'&&this.zoneJson.items.indexOf(item)===43 ? lianxiWallGaps(item,this.gateGeometries.get('敛禧门'),this.gateWidths) : item.gaps?.some(g=>g.gate==='锡庆门') ? xiqingWallGaps(item,this.gateGeometries.get('锡庆门'),this.gateWidths) : this.resolveGaps(item.gaps);
    if(buildJunjiSouthPorchFragment(this.kit,item,this.zoneJson.id,this.zoneJson.items.indexOf(item),gaps))return;
    if(buildJiuqingSouthPorchFragment(this.kit,item,this.zoneJson.id,this.zoneJson.items.indexOf(item),gaps))return;
    const params = { h: item.h, t: item.t, gaps };
    // Existing courtyard south boundary: appearance-only masonry split,
    // estimated against the retained gate platform, not a surveyed repair datum.
    const southBoundaryIndex=this.zoneJson.id==='axis-courts'?this.zoneJson.items.indexOf(item):-1;
    if([9,11].includes(southBoundaryIndex)){
      const east=southBoundaryIndex===9,gate=east?'昭德门':'贞度门';
      if(item.h!==7||item.t!==undefined||JSON.stringify(item.from)!==JSON.stringify([east?-25:25,-214.2])||JSON.stringify(item.to)!==JSON.stringify([east?-106.47:110.7,-214.2])||item.gaps?.length!==1||item.gaps[0].gate!==gate)throw Error('Changed south boundary wall source');
      const geometry=this.gateGeometries.get(gate);
      if(!geometry||geometry.platform.topY!==3.216)throw Error('Missing retained south boundary gate platform');
      params.baseHeight=geometry.platform.topY;
    }
    Object.keys(params).forEach(k => params[k] === undefined && delete params[k]);
    // The own raised middle-right gate meets this exact retained 7m wall.
    // Generic wall physics is historically only 3m; do not change other walls.
    const ownMiddleRight=this.zoneJson.id==='axis-courts'&&this.zoneJson.items.indexOf(item)===15&&this.gateGeometries.get('中右门')?.profile==='own-three-bay-end-aisles';
    if(ownMiddleRight&&(JSON.stringify(item.from)!=='[65.5,-12.2]'||JSON.stringify(item.to)!=='[110.7,-12.2]'||item.h!==7||item.t!==undefined||gaps.length!==1||gaps[0].at!==80||gaps[0].w!==16.4))throw Error('Invalid own middle-right adjoining wall');
    const ownMiddleLeft=this.zoneJson.id==='axis-courts'&&this.zoneJson.items.indexOf(item)===13;
    if(ownMiddleLeft&&(JSON.stringify(item.from)!=='[-65.5,-12.2]'||JSON.stringify(item.to)!=='[-106.47,-12.2]'||item.h!==7||gaps.length!==1||gaps[0].at!==-77||gaps[0].w!==12.4))throw Error('Invalid own middle-left adjoining wall');
    const ownBaoheWall=this.zoneJson.id==='axis-courts'&&[17,19].includes(this.zoneJson.items.indexOf(item));
    if(ownBaoheWall){
      const west=this.zoneJson.items.indexOf(item)===19;
      if(item.h!==7||item.t!==undefined||JSON.stringify(item.from)!==JSON.stringify([west?64.85:-64.97666666666667,123])||JSON.stringify(item.to)!==JSON.stringify([west?110.7:-106.47,123])||item.gaps?.length!==1||item.gaps[0].gate!==(west?'后右门':'后左门'))throw Error('Invalid own Baohe adjoining wall');
    }
    const colliderStart=this.kit.colliders.length;
    this.kit.wall(x1, z1, x2, z2, params);
    if(ownMiddleRight||ownMiddleLeft||ownBaoheWall)for(const collider of this.kit.colliders.slice(colliderStart))collider.max.y=7;
  }

  buildCourtWalls(item) {
    if(buildYinghuaWestEarCourtWalls(this.kit,item,this.zoneJson.id,this.gateWidths.get('英华门')))return;
    if(item.gates?.some(g=>g.gate==='寿康门')&&this.gateGeometries.get('寿康门')?.profile==='shoukang-entry'){validateShoukangEntryCourtWall(item);const {x0,x1,z0,z1}=item,start=this.kit.root.children.length;this.kit.wall(x0,z1,x1,z1);this.kit.wall(x0,z0,x0,z1);this.kit.wall(x1,z0,x1,z1);registerShoukangRetainedPerimeter(this.kit,this.kit.root.children.slice(start));return;}
    if(item.gates?.some(g=>g.gate==='寿安门')&&this.gateGeometries.get('寿安门')?.profile==='shouan-entry'){validateShouanEntryCourtWall(item);const {x0,x1,z0,z1}=item;this.kit.wall(x0,z1,x1,z1);this.kit.wall(x0,z0,x0,z1);this.kit.wall(x1,z0,x1,z1);return;}

    const { x0, x1, z0, z1, gates } = resolveCourtWallContract(item, this.gateWidths);
    const params = { h: item.h, t: item.t };
    Object.keys(params).forEach(k => params[k] === undefined && delete params[k]);
    this.kit.courtWalls(x0, x1, z0, z1, gates, params);
  }

  buildCorridor(item) {
    if(this.zoneJson.id==='axis-courts'&&[31,37].includes(this.zoneJson.items.indexOf(item)))return buildBaoheLinkedGallery(this.kit,item,this.zoneJson.items.indexOf(item));
    let from = item.from, to = item.to, contact;
    if (item.gateJoin !== undefined) {
      const ref = item.gateJoin;
      const g = ref && this.gateGeometries.get(ref.gate);
      if (!g || !['zhaode', 'zhendu'].includes(g.profile) || g.rot !== 0 || !Object.hasOwn(g.joins, ref.side)) throw new Error('Invalid or unbuilt explicit gate join');
      contact = g.joins[ref.side];
      if (ref.end !== contact.end || item.facing !== 'z-' || !Array.isArray(from) || !Array.isArray(to) ||
          [...from, ...to].some(n => typeof n !== 'number' || !Number.isFinite(n)) || from.length !== 2 || to.length !== 2 ||
          Math.abs(from[1] - contact.world[1]) > 1e-8 || Math.abs(to[1] - contact.world[1]) > 1e-8 ||
          (ref.side === 'left' ? from[0] >= contact.world[0] || to[0] <= contact.world[0] || to[0] >= g.x : to[0] <= contact.world[0] || from[0] >= contact.world[0] || from[0] <= g.x)) {
        throw new Error('Invalid corridor gate join endpoint or centerline');
      }
      if (ref.end === 'from') from = [...contact.world]; else to = [...contact.world];
      if (Math.abs(to[0] - from[0]) < 4) throw new Error('Gate join leaves a nonpositive or too-short corridor');
    }
    const [x1, z1] = from;
    const [x2, z2] = to;
    const params = { facing: item.facing, depth: item.depth, colH: item.colH, name: item.name };
    const gallery = sideGateGalleryOptions(this.zoneJson.id,this.zoneJson.items.indexOf(item),item);
    if(gallery) Object.assign(params,gallery);
    if (item.furnishingPolicy !== undefined) {
      params.furnishingPolicy = item.furnishingPolicy;
      params.furnishingTarget = `${this.zoneJson.id}/items/${this.zoneJson.items.indexOf(item)}`;
      params.furnishingKind = item.kind;
    }
    Object.keys(params).forEach(k => params[k] === undefined && delete params[k]);
    const galleryWalkableStart=this.kit.walkables.length;
    this.kit.corridor(x1, z1, x2, z2, item.facing, params);
    if(gallery&&[27,33].includes(this.zoneJson.items.indexOf(item))){
      const deck=this.kit.walkables.slice(galleryWalkableStart).find(w=>w.type==='box'&&w.box.min.y===2.4&&w.box.max.y===2.4);
      if(!deck)throw Error('Actual north gallery deck missing');
      deck.sideGateGalleryDeck=validateSideGateGalleryDeck(gallery.objectId,deck.box);
    }
    if(gallery) this.kit.root.children.at(-1).userData.sideGateGallery = {...gallery,scope:'VISIBLE_PRIMARY_BODY_AND_FRONT_PORCH_ENGINEERING_FIT',inventory:'UNKNOWN_NOT_FURNISHED'};
    if (contact) this.kit.root.children.at(-1).userData.gateJoin = {
      ...item.gateJoin, boundary: [...contact.world], effectiveFrom: [...from], effectiveTo: [...to],
      provisional: true, status: contact.status,
    };
  }

  buildCityGate(item) {
    if (item.cityGateProfile !== undefined) {
      const frame=buildEastWestCityGate(this.kit,item);
      applyDonghuaCentralDoorFront(this.kit,frame,{zoneId:this.zoneJson.id,itemIndex:this.zoneJson.items.indexOf(item),item});
      applyDonghuaExteriorEnvelope(this.kit,frame,{zoneId:this.zoneJson.id,itemIndex:this.zoneJson.items.indexOf(item),item});
      return frame;
    }
    const params = {
      x: item.x,
      z: item.z,
      rot: this.parseRot(item.rot),
      name: item.name,
    };
    Object.keys(params).forEach(k => params[k] === undefined && delete params[k]);
    this.kit.cityGate(params);
  }

  buildRegion(item) {
    this.kit.region(item.name, item.x0, item.x1, item.z0, item.z1);
  }

  buildNineDragonWall(item) {
    // 九龙壁是 SideCourts 私有函数，需直接内联或在 kit 注册为方法
    // 这里直接复制 SideCourts.nineDragonWall 的实现
    const k = this.kit;
    // FC-FF99BC5DC0: the Palace Museum identifies a yellow-glazed hip roof.
    // Only this known wall's roof changes. Dimensions/overhang remain a model fit.
    const knownNingshouWall = this.zoneJson.id === 'ningshou' && item.name === '九龙壁';
    if (knownNingshouWall && (this.zoneJson.items.indexOf(item) !== 10 ||
        item.kind !== 'nineDragonWall' || item.x !== -295 || item.z !== 123 ||
        item.length !== 29.4 || item.height !== 3.5 || item.rot !== 'north')) {
      throw new Error('Nine Dragon Wall source changed');
    }
    const x = item.x;
    const z = item.z;
    const len = item.length;
    const rot = this.parseRot(item.rot ?? Math.PI); // 默认朝北
    
    const f = k.frame(x, z, rot);
    const h = 4.2;
    k.box(f, 'sumeru_band', len + 0.6, 0.9, 1.6, 0, 0.45, 0, 'band');
    const glaze = new THREE.MeshStandardMaterial({ color: 0x1f5f7a, roughness: 0.3, metalness: 0.1, name: 'kit_glaze_blue' });
    const wave = new THREE.MeshStandardMaterial({ color: 0x2e8a6e, roughness: 0.3, metalness: 0.1, name: 'kit_glaze_green' });
    k.owned.push(glaze, wave);
    k.mesh(f, new THREE.BoxGeometry(len, h, 1.1), glaze, 0, 0.9 + h / 2, 0);
    // 壁心：故宫九龙壁实物照片（正面拼接图，壁心长宽比约 10.8:1）。贴图缺失时仍显示蓝绿琉璃底色。
    const ASPECT = 10.77;
    const fh = Math.min(h - 0.3, len / ASPECT);
    const tex = new THREE.TextureLoader().load(`${import.meta.env?.BASE_URL ?? '/'}textures/nine_dragon.webp`);
    tex.colorSpace = THREE.SRGBColorSpace;
    tex.anisotropy = 8;
    // This photo belongs to this zone generation, unlike borrowed library maps.
    (k.ownedTextures ??= []).push(tex);
    const face = new THREE.MeshStandardMaterial({ map: tex, roughness: 0.35, metalness: 0.05, name: 'kit_nine_dragon_face' });
    k.owned.push(face);
    const fg = new THREE.PlaneGeometry(len - 0.4, fh);
    fg.rotateY(Math.PI);   // 正面朝局部 -Z
    k.mesh(f, fg, face, 0, 0.9 + fh / 2 + 0.1, -0.56).castShadow = false;
    // 壁心上方的檐下琉璃带（蓝绿）
    k.mesh(f, new THREE.BoxGeometry(len - 0.2, h - fh - 0.1, 1.16), wave, 0, 0.9 + fh + 0.1 + (h - fh - 0.1) / 2, 0);
    k.roof(f, { type: knownNingshouWall ? 'wudian' : 'gable', width: len + 0.4,
      depth: 1.6, baseY: 0.9 + h, brackets: false, height: 0.7,
      ...(knownNingshouWall ? { overhang: 0.3 } : {}) });
    if (knownNingshouWall) f.userData.structure = {
      id: 'place-ningshou-ff99bc5dc0-roof', originalObjectId: 'FC-FF99BC5DC0',
      name: '九龙壁', scope: 'SOURCE_GUIDED_ROOF_TYPE_FIT_ONLY',
      wholeObjectAccepted: false, surveyed: false,
      source: 'https://www.dpm.org.cn/explore/building/236477.html',
      roofFit: { type: 'wudian', overhang: 0.3, detail: 'low', retainedBaseY: 5.1 },
      remaining: 'Overall height/base definition, ridge dragons, brackets and detailed glazed decoration are not reconstructed or accepted; existing wall/photo/physics retained.',
    };
    k.col(f, -len / 2, 0, -0.8, len / 2, 3, 0.8);
    k.mapRect(f, 'hall', item.name ?? '九龙壁', len, 1.6);
  }

  // ───────────────────────── 辅助方法 ─────────────────────────

  /**
   * 解析旋转角：支持弧度数值或字符串 "south"|"north"|"east"|"west"
   */
  parseRot(rot) {
    if (rot === undefined || rot === null) return 0;
    if (typeof rot === 'number') return rot;
    const map = { south: FACE.south, north: FACE.north, east: FACE.east, west: FACE.west };
    if (rot in map) return map[rot];
    console.warn(`[ZoneBase] 无效的 rot 值: ${rot}，使用默认 0`);
    return 0;
  }

  /**
   * 解析 wall gaps：将 { at, gate } 转为 { at, w }
   */
  resolveGaps(gaps) {
    if (!gaps) return [];
    return gaps.map(g => ({
      at: g.at,
      w: g.gate ? this.gateWidths.get(g.gate) : g.w,
    }));
  }
}
