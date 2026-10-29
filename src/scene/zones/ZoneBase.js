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
import {validateNansansuoInventoryPolicy} from '../palace/NansansuoInventoryPolicy.js';
import { applyZuoyiDoorFront } from '../palace/special/ZuoyiDoorFront.js';
import {resolveRemainingProfile as resolveNingshou,buildRemainingHall as buildNingshou,augmentRemainingHall as augmentNingshou} from '../palace/special/RemainingNingshouHalls.js';
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
    const items = this.zoneJson.items ?? [];
    
    // 第一遍：构建所有 gate，记录开口宽度
    for (const item of items) {
      if (item.kind === 'gate') {
        const w = this.buildGate(item);
        if (item.name) this.gateWidths.set(item.name, w);
      }
    }
    
    // 第二遍：构建其他构件（wall/courtWalls 可引用 gate 宽度）
    for (const item of items) {
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
    
    if (this.zoneJson.yikunAccessProfile !== undefined) buildYikunSideAccess(this.kit, this.zoneJson);

    // Explicit opt-in, after all retained halls, before material merging.
    if (this.zoneJson.courtyardProfile !== undefined) buildChuxiuCourtyard(this.kit, this.zoneJson);

    if (this.zoneJson.southTreeProfile !== undefined) buildSouthCourtTrees(this.kit, this.zoneJson);

    if (this.zoneJson.hongdeProfile !== undefined) buildHongdeCourt(this.kit,this.zoneJson);
    if (this.zoneJson.zhaorenProfile !== undefined) buildZhaorenCourt(this.kit,this.zoneJson);
    if (this.zoneJson.eastWellProfile !== undefined) buildEastWellPavilion(this.kit,this.zoneJson);
    if (this.zoneJson.westWellProfile !== undefined) buildWestWellPavilion(this.kit,this.zoneJson);
    if (this.zoneJson.sishenProfile !== undefined) buildSishenShrine(this.kit,this.zoneJson);
    if (this.zoneJson.yangxinEntranceProfile !== undefined) buildYangxinCourtEntrance(this.kit,this.zoneJson);

    buildChengqianCourtyardGroup(this.kit,this.zoneJson);
    buildNightBeds(this.kit,this.zoneJson);
    registerStairInterfaces(this.kit,this.zoneJson);
    bindChengqianTerraceDomain(this.kit,this.zoneJson);
    registerChuxiuSideAccess(this.kit,this.zoneJson);
    registerRetainedCourtyardAccess(this.kit,this.zoneJson);
    registerChuxiuMainFinishedAccess(this.kit,this.zoneJson);
    registerChuxiuFrontWingFinishedAccess(this.kit,this.zoneJson);

    // Keep distance levels out of the ordinary recursive material merge.
    const yanxiFrames = detachYanxiRuinFrames(this.kit.root);
    this.group = this.kit.finish();
    installYanxiRuinLODs(this.group, yanxiFrames, this.kit.owned);
    
    // silhouette：本区屋顶的合并低模（Phase 1 优化时实现，当前返回 null）
    // 实在拿不到屋顶网格就先返回 null，不强求改 kit 内部
    const silhouette = null;
    
    return {
      group: this.group,
      colliders: [...this.kit.colliders],
      walkables: [...this.kit.walkables],
      rooms: [...this.kit.rooms],
      mapItems: [...this.kit.mapItems],
      regions: [...this.kit.regions],
      silhouette,
    };
  }

  /** Cache admission only: mergeByMaterial already disposed these source
   * geometries and moved noMerge/LOD objects into the finished group. Drop
   * obsolete construction references; never dispose live merged resources. */
  releaseConstructionReferences() {
    if (!this.group || this.group === this.kit.root) throw new Error('Zone is not finished');
    this.kit.root.clear();
    this.kit.plaques.length = 0;
  }

  update(dt) {
    // 当前无动画需求，预留接口
  }

  dispose() {
    if (this.group) {
      this.kit.dispose(this.group);
      this.group.removeFromParent();
      this.group = null;
    }
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
    const width = this.kit.gate(params);
    applyZuoyiDoorFront(this.kit, this.kit.root.children.at(-1), {zoneId:this.zoneJson.id,itemIndex:this.zoneJson.items.indexOf(item),item});
    if (item.gateProfile === 'zhaode' || item.gateProfile === 'zhendu' || item.gateProfile === 'huangji') this.gateGeometries.set(item.name, this.kit.root.children.at(-1).userData.gateGeometry);
    if(this.zoneJson.id==='east-six'&&this.zoneJson.items.indexOf(item)===7)applyChengqianGateArrival(this.kit,this.kit.root.children.at(-1),item,this.zoneJson,7);
    return width; // 返回开口宽度
  }

  buildWall(item) {
    const [x1, z1] = item.from;
    const [x2, z2] = item.to;
    const gaps = item.gaps?.some(g=>g.gate==='锡庆门') ? xiqingWallGaps(item,this.gateGeometries.get('锡庆门'),this.gateWidths) : this.resolveGaps(item.gaps);
    const params = { h: item.h, t: item.t, gaps };
    Object.keys(params).forEach(k => params[k] === undefined && delete params[k]);
    this.kit.wall(x1, z1, x2, z2, params);
  }

  buildCourtWalls(item) {
    if(item.gates?.some(g=>g.gate==='寿康门')&&this.gateGeometries.get('寿康门')?.profile==='shoukang-entry'){validateShoukangEntryCourtWall(item);const {x0,x1,z0,z1}=item,start=this.kit.root.children.length;this.kit.wall(x0,z1,x1,z1);this.kit.wall(x0,z0,x0,z1);this.kit.wall(x1,z0,x1,z1);registerShoukangRetainedPerimeter(this.kit,this.kit.root.children.slice(start));return;}
    if(item.gates?.some(g=>g.gate==='寿安门')&&this.gateGeometries.get('寿安门')?.profile==='shouan-entry'){validateShouanEntryCourtWall(item);const {x0,x1,z0,z1}=item;this.kit.wall(x0,z1,x1,z1);this.kit.wall(x0,z0,x0,z1);this.kit.wall(x1,z0,x1,z1);return;}

    const { x0, x1, z0, z1, gates } = resolveCourtWallContract(item, this.gateWidths);
    const params = { h: item.h, t: item.t };
    Object.keys(params).forEach(k => params[k] === undefined && delete params[k]);
    this.kit.courtWalls(x0, x1, z0, z1, gates, params);
  }

  buildCorridor(item) {
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
    if (item.furnishingPolicy !== undefined) {
      params.furnishingPolicy = item.furnishingPolicy;
      params.furnishingTarget = `${this.zoneJson.id}/items/${this.zoneJson.items.indexOf(item)}`;
      params.furnishingKind = item.kind;
    }
    Object.keys(params).forEach(k => params[k] === undefined && delete params[k]);
    this.kit.corridor(x1, z1, x2, z2, item.facing, params);
    if (contact) this.kit.root.children.at(-1).userData.gateJoin = {
      ...item.gateJoin, boundary: [...contact.world], effectiveFrom: [...from], effectiveTo: [...to],
      provisional: true, status: contact.status,
    };
  }

  buildCityGate(item) {
    if (item.cityGateProfile !== undefined) {
      const frame=buildEastWestCityGate(this.kit,item);
      applyDonghuaCentralDoorFront(this.kit,frame,{zoneId:this.zoneJson.id,itemIndex:this.zoneJson.items.indexOf(item),item});
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
    k.roof(f, { type: 'gable', width: len + 0.4, depth: 1.6, baseY: 0.9 + h, brackets: false, height: 0.7 });
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
