import * as THREE from 'three';
import {positionHallNameboard} from '../HallNameboardMount.js';
import {fitRegisteredNameboard} from './FittedNameboardMount.js';

// Explicit inspected objects, not a rule for all palaces. Photos place these
// boards on the painted beam/bracket FRONT, not in the narrow band below it.
const SOURCES=Object.freeze({
 'east-six/景仁宫':{page:236509},
 'east-six/钟粹宫':{page:236484},
 'west-six/翊坤宫':{page:236517},
 'west-six/储秀宫':{page:236486},
 'west-six/长春宫':{page:236436},
 'east-six/承乾宫':{page:236438},
 'east-six/景阳宫':{page:236511},
 'west-six/太极殿':{page:236475},
 'west-six/永寿宫':{page:236450},
 'west-six/咸福宫':{page:236507},
 'west-six/养心殿':{page:236442,kind:'recessed-main-painted-headband',fit:{x:0,y:7.304,z:-6.6},photo:'https://img.dpm.org.cn/Uploads/image/2026/04/30/_DSC9079-HTsFCzaTn313.jpg'},
 'ningshou/皇极殿':{page:236476,kind:'double-eave'},
 'outer-east/文渊阁':{page:236513,kind:'upper-storey-architrave',fit:{x:0,y:8.35,z:-8.32},residual:'MODEL_UPPER_WINDOW_TOO_HIGH_PHOTO_VERTICAL_PROPORTION_UNRESOLVED',photo:'https://img.dpm.org.cn/Uploads/Picture/dc/1536%5B1024%5D.jpg'},
 'outer-west/咸若馆':{page:236534,kind:'horizontal',background:'blue',fit:{x:0,y:6.12,z:-10.62,width:2.6,height:1.05}},
 'outer-west/寿康宫':{page:236448,kind:'outer-eave-front',fit:{x:0,y:7.2,z:-9.12}},
 'outer-west/慈宁宫':{page:236504,kind:'double-eave'},
 'ningshou/古华轩':{page:236431,kind:'horizontal',fit:{x:0,y:5.35,z:-4.8,width:3.2,height:.9}},
 'ningshou/遂初堂':{page:236512,kind:'horizontal',fit:{x:0,y:5.42,z:-5.43,width:2.4,height:.65}},
 'ningshou/畅音阁':{page:236437,kind:'horizontal',fit:{x:0,y:15.5,z:-5.68,width:3,height:.8}},
 'ningshou/阅是楼':{page:236461,kind:'horizontal',fit:{x:0,y:7.9,z:-5.49,width:2.7,height:.65}},
 'ningshou/颐和轩':{page:236516,kind:'recessed-main-doorhead',fit:{x:0,y:5.75,z:-5.55,width:.95,height:1.5}},
 'ningshou/倦勤斋':{page:236478,kind:'east-five-bay-centre',fit:{x:-7,y:5,z:-4.77,width:.81,height:1.35},residual:'MODEL_INNER_TRANSOM_TOO_HIGH_PHOTO_VERTICAL_PROPORTION_UNRESOLVED'},
 'ningshou/宁寿宫':{page:236471,kind:'outer-eave-front',fit:{x:0,y:7.8,z:-10.22,width:.81,height:1.25},residual:'MODEL_INNER_TRANSOM_TOO_HIGH_PHOTO_VERTICAL_PROPORTION_UNRESOLVED'},
 'ningshou/乐寿堂':{page:236470,kind:'outer-eave-front',fit:{x:0,y:11.65,z:-11.98,width:.81,height:1.25},residual:'MODEL_INNER_TRANSOM_TOO_HIGH_PHOTO_VERTICAL_PROPORTION_UNRESOLVED'},
 'ningshou/梵华楼':{page:236572,kind:'upper-storey-outer-eave',fit:{x:0,y:6.6,z:-4.67,width:.81,height:1.2},residual:'MODEL_INNER_TRANSOM_TOO_HIGH_PHOTO_VERTICAL_PROPORTION_UNRESOLVED'},
});

export function applySourceGuidedNameboardMount(kit,zone,item,built) {
 const source=SOURCES[`${zone}/${item.name}`];if(!source)return built;
 const p=kit.plaques.find(p=>p.text===(item.plaqueText??item.name)&&p.mesh.parent===built.f);
 if(!p)throw Error('Source-guided nameboard registration missing: '+item.name);
 const sourceURL=`https://www.dpm.org.cn/explore/building/${source.page}.html`;
 if(source.kind==='double-eave'){
  let roof;built.f.traverse(m=>{if(m.userData.doubleEaveMountingBand)roof=m;});
  if(!roof)throw Error('Confirmed double-eave nameboard lacks roof band: '+item.name);
  positionHallNameboard(p.frame,roof,item.name,{fitSizeToBand:true});
  p.mesh.position.copy(p.frame.position);p.mesh.position.z-=.06;p.mesh.scale.copy(p.frame.scale);
  p.mesh.userData.hallNameboardMount=p.frame.userData.hallNameboardMount;
  p.frame.userData.hallNameboardMount.source=sourceURL;
  if(built.f.userData.structure)built.f.userData.structure.nameboardMount=p.frame.userData.hallNameboardMount;
  return built;
 }
 if(source.fit){
  const mount=fitRegisteredNameboard(kit,built.f,p.text,{...source.fit,source:sourceURL,mountKind:source.kind,
   dimensions:'SOURCE_LAYER_AND_ORIENTATION_WITH_MODEL_SIZE_FIT_NOT_SURVEYED',photo:source.photo??null,
   residual:source.residual??'RECTANGULAR_FRAME_AND_SIMPLIFIED_SYSTEM_FONT_NOT_HISTORIC_REPLICA'});
  if(source.kind==='horizontal'){p.layout='horizontal';p.readingOrder='right-to-left';p.background=source.background??'dark';}
  built.f.userData.sourceGuidedNameboardMount=mount;if(built.f.userData.structure)built.f.userData.structure.nameboardMount=mount;return built;
 }
 const beamH=THREE.MathUtils.clamp(item.colH*.12,.45,.85);
 const doorTop=item.ph+(item.colH-beamH)*.8;
 const fullHeight=p.frame.geometry.parameters.height*p.frame.scale.y;
 const mount=fitRegisteredNameboard(kit,built.f,p.text,{
  y:doorTop+.08+fullHeight/2,z:-item.d/2-.42,
  source:`https://www.dpm.org.cn/explore/building/${source.page}.html`,
  mountKind:'MAIN_FRONT_PAINTED_BEAM_AND_BRACKET_FACE_ABOVE_DOOR',
  doorHeadY:doorTop,clearance:.08,
  dimensions:'RETAINED_NAMEBOARD_SIZE_WITH_PHOTO_RELATIONSHIP_FIT_NOT_SURVEYED',
  reason:'Inspected official image shows the whole board above the door head, in front of the painted beam/bracket band; covering its elevation is allowed, intersecting its volume is not',
 });
 built.f.userData.sourceGuidedNameboardMount=mount;if(built.f.userData.structure)built.f.userData.structure.nameboardMount=mount;
 return built;
}
