import * as THREE from 'three';
import {buildRoof} from '../../RoofBuilder.js';

// R63: roof form only. The dedicated museum entry and inspected official image
// show lower hip returns with inset upper gables. The generic Xianfu entry says
// hard gable. Keep that conflict explicit; neither source supplies measurements.
const page=n=>`https://www.dpm.org.cn/explore/building/${n}.html`;
const PHOTO='https://img.dpm.org.cn/Uploads/Picture/dc/18015%5B1024%5D.jpg';
const PHOTO_SHA='c7e93e5dc4f186007c74d2f65a1cf5b3de4743c4f099e6ddda1a037218dda090';
const BASELINE=[
 ['dougong_band',24,'77ee89cd','20a94d05'],
 ['rafters',372,'915171cd','6a4fa29d'],
 ['roof_tile',720,'a03821a5','599b0e05'],
 ['roof_ridge_glaze',852,'70d8f60d','88847bd3'],
 ['wall_red',288,'3a1ef035','d6923ac5'],
];
const fail=message=>{throw Error(`Tongdao roof: ${message}`);};
function fingerprint(a){let h=2166136261;for(const v of new Uint8Array(a.buffer,a.byteOffset,a.byteLength))h=Math.imul(h^v,16777619);return(h>>>0).toString(16);}
function identity(o,position=[0,0,0]){
 if(!o||!o.visible||!o.matrixAutoUpdate||!o.position.toArray().every((v,i)=>v===position[i])||!o.quaternion.toArray().every((v,i)=>v===[0,0,0,1][i])||!o.scale.toArray().every(v=>v===1))return false;
 const local=new THREE.Matrix4().compose(o.position,o.quaternion,o.scale);
 if(!o.matrix.equals(local))return false;
 // Newly built roof children have not yet received the hall world transform.
 return true;
}
// Disposal is safe only when every retired geometry and backing payload is
// exclusive to its original mesh. Include hidden/nested non-mesh consumers,
// interleaved attributes, indices and morph attributes in the same kit root.
function geometryResources(g){
 if(!g)return [];
 const attributes=[g.index,...Object.values(g.attributes??{}),...Object.values(g.morphAttributes??{}).flat()];
 return [g,...attributes.flatMap(a=>a?[a,a.data,a.array,a.data?.array,a.array?.buffer,a.data?.array?.buffer].filter(Boolean):[])];
}
function assertUnborrowedRoofResources(root,retired){
 const owners=new Map();
 for(const mesh of retired)for(const resource of geometryResources(mesh.geometry)){
  if(owners.has(resource)&&owners.get(resource)!==mesh)fail('retired roof resource is borrowed by another source mesh');
  owners.set(resource,mesh);
 }
 root.traverse(object=>{for(const resource of geometryResources(object.geometry))if(owners.has(resource)&&owners.get(resource)!==object)fail('retired roof geometry or backing payload is borrowed elsewhere in the kit');});
}
function sourceRoof(kit,f){
 const roofs=f.children.filter(o=>o.name.startsWith('roof_'));
 if(roofs.length!==1||roofs[0].name!=='roof_gable'||!identity(roofs[0])||roofs[0].children.length!==BASELINE.length)fail('exact original hard-gable group required');
 const roof=roofs[0];
 if(roof.userData.hardGableEnd?.endPlaneX!==13.1||roof.userData.topY!==13.049957275390625||roof.userData.ownedMaterials?.length!==0)fail('original roof envelope drift');
 const seen=new Set();
 for(let i=0;i<BASELINE.length;i++){
  const[name,count,pos,norm]=BASELINE[i],m=roof.children[i],g=m.geometry,a=g?.attributes;
  if(!m.isMesh||m.name!==`roof_gable_${name==='roof_ridge_glaze'?name:kit.lib.material(name).name}`||!identity(m)||m.material!==(name==='roof_ridge_glaze'?kit.ridge:kit.lib.material(name))||g.index||g.groups.length||g.drawRange.start!==0||g.drawRange.count!==Infinity||seen.has(g))fail('original roof mesh/material/topology drift');
  if(Object.keys(a).sort().join()!=='normal,position,uv'||a.position.count!==count||a.normal.count!==count||a.uv.count!==count||fingerprint(a.position.array)!==pos||fingerprint(a.normal.array)!==norm||Object.values(a).some(a=>[...a.array].some(v=>!Number.isFinite(v))))fail('original roof vertex stream drift');
  seen.add(g);
 }
 assertUnborrowedRoofResources(kit.root,roof.children.slice(1));
 return roof;
}

/** Bounded visual replacement after rear-hall metadata, before the kit merge.
 * No collision, walkable, room, facade, furnishing, actor or map data is touched.
 */
export function applyTongdaoRoof(kit,zoneId,itemIndex,item,built){
 if(zoneId!=='west-six'||itemIndex!==47)return built;
 for(const[k,v]of Object.entries({kind:'hall',name:'咸福宫后殿',rearHallProfile:'tongdaotang',x:149.3,z:449.8,w:26.2,d:12.9,pad:.6,ph:.45,colH:6.08,roof:'gable',bays:5,map:'hall'}))if(item?.[k]!==v)fail(`target identity or retained envelope changed: ${k}`);
 for(const k of['rot','roofH','layers','eaveCount','storeys','brackets','hardGableEnd','enter','open','backDoor','roomBays','structure'])if(item[k]!==undefined)fail(`unreviewed shell override: ${k}`);
 const f=built?.f,s=f?.userData.structure;
 if(kit?.root.name!=='west-six'||!identity(kit.root)||f?.parent!==kit.root||!identity(f,[149.3,0,449.8])||s?.id!=='west-six/tongdaotang'||s.profile!=='tongdaotang'||s.storeys!==1||s.eaveCount!==1)fail('target frame or rear-hall identity drift');
 if(f.userData.tongdaoRoof||kit.root.userData.tongdaoRoof)fail('already applied');
 const old=sourceRoof(kit,f);
 // Preserve the old 13.4 * 0.4 height input and existing bearing geometry. All
 // metres and the stock roof profile proportions remain model fits, not survey.
 const roof=buildRoof(kit.lib,{detail:'low',type:'xieshan',width:26.2,depth:13.4,baseY:6.53,height:5.36,layers:1,brackets:true});
 kit.adopt(roof);
 const oldBand=old.children[0],newBand=roof.children.find(m=>m.material===kit.lib.material('dougong_band'));
 newBand.removeFromParent();newBand.geometry.dispose();roof.add(oldBand);
 const record={id:'west-six/items/47/tongdao-roof',itemIndex:47,canonicalName:'同道堂',runtimeName:item.name,position:[149.3,0,449.8],roof:'xieshan',eaveCount:1,status:'PARTIAL_VERIFY_PENDING',accepted:false,
  source:page(236583),photo:PHOTO,photoSHA256:PHOTO_SHA,photographyDate:null,sourceConflictResolved:false,
  sourceConflict:[{source:page(236507),claim:'Generic Xianfu entry calls Tongdao a five-bay hard-gable hall'},{source:page(236583),claim:'Dedicated Tongdao entry calls it a five-bay yellow-glazed xieshan hall'}],
  decision:'Dedicated building entry plus visible lower hip returns and upper gable in official photo support this bounded roof-form correction; conflicting generic entry remains recorded',
  dimensionStatus:'RETAINED_MODEL_FIT_NOT_SURVEYED',fit:{width:26.2,depth:13.4,baseY:6.53,height:5.36,topY:roof.userData.topY},
  retained:'All lower hall meshes, columns, windows, doors, furniture, room and navigation data, plus the original roof-bearing bracket band',
  limits:'Stock low-detail xieshan proportions; dimensions, pitch, exact eave/gable construction, ornament counts/species, bracket carving, colour and photography date remain unverified. Not whole-building or GPU/browser acceptance'};
 old.removeFromParent();old.traverse(m=>m.geometry?.dispose());f.add(roof);
 roof.userData.tongdaoRoof=record;f.userData.tongdaoRoof=record;kit.root.userData.tongdaoRoof=record;
 for(const key of['structure','rearHall'])f.userData[key]={...f.userData[key],legacySourceClaim:f.userData[key].sourceClaim,sourceClaim:'Five-bay rear hall; roof form follows dedicated Tongdao evidence with unresolved conflict in generic Xianfu text',roof:'xieshan',tongdaoRoof:record};
 return built;
}
