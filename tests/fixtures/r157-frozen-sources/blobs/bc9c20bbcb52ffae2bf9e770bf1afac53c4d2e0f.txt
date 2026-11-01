import * as T from 'three';
import {createTriangleTemplate,triangleInstance} from '../../../utils/TriangleSupport.js';
import {buildShoukangRearWindow} from './ShoukangRearWindow.js';
const expected={kind:'hall',x:288.8,z:260.1,w:24.7,d:12.1,pad:.6,ph:.45,colH:6.01,roof:'xieshan',map:'hall'};
const source='https://www.dpm.org.cn/explore/building/236448.html',photo='https://img.dpm.org.cn/Uploads/Picture/2020/04/16/s5e982bf339786.jpg';
const close=(a,b)=>Math.abs(a-b)<1e-7;
const arrays=['colliders','walkables','rooms','regions','mapItems','plaques','owned'];
/** Only the old D1 rear-hall instance. Stage privately, retain its old rear
 * architecture, remove unverified preset furniture, replace the south front. */
export function buildShoukangRearSouth(kit,item,{zoneId,itemIndex,zoneJson}){
 if(zoneId!=='outer-west'||itemIndex!==48)return null;
 const writableArray=a=>Array.isArray(a)&&Object.isExtensible(a)&&Object.getOwnPropertyDescriptor(a,'length')?.writable;
 if(!kit.root.visible||!kit.root.matrixAutoUpdate||kit.root.parent||!Object.isExtensible(kit.root)||!Object.getOwnPropertyDescriptor(kit.root,'children')?.writable||!writableArray(kit.root.children)||arrays.some(k=>!writableArray(kit[k]))||kit.root.position.lengthSq()||kit.root.rotation.toArray().slice(0,3).some(Boolean)||!kit.root.scale.equals(new T.Vector3(1,1,1))||!kit.root.matrix.equals(new T.Matrix4())||!kit.root.matrixWorld.equals(new T.Matrix4()))throw Error('Shoukang rear root/write contract mismatch');
 if(kit.root.name!==zoneId||zoneJson?.items[48]!==item||zoneJson.items[47]?.name!=='寿康宫'||zoneJson.items[47]?.x!==289.2||zoneJson.items[47]?.z!==231||Object.keys(item).length!==Object.keys(expected).length||Object.entries(expected).some(([k,v])=>item[k]!==v)||kit.root.children.some(f=>f.userData.shoukangRear))throw Error('Shoukang rear identity mismatch');
 const tmp=Object.assign(Object.create(Object.getPrototypeOf(kit)),kit,{root:new T.Group()});tmp.root.name=kit.root.name;for(const key of arrays)tmp[key]=[];
 tmp.furnish=function(){return this._lastFurnish={cover:[],spawns:[]};};
 let built;const removed=[],privateMats=[];
 try{
  built=tmp.hall({...item,interior:'empty'});const f=built.f,front=-item.d/2+1.65,y=item.ph,H=item.colH-Math.max(.45,Math.min(.85,item.colH*.12)),bay=item.w/5,axes=Array.from({length:6},(_,i)=>-item.w/2+i*bay);
  for(const m of [...f.children]){const mat=m.material;if(!m.isMesh)continue;const frontColumn=mat===kit.lib.material('wood_column')&&m.geometry.type==='CylinderGeometry'&&close(m.position.z,-item.d/2),frontPanels=mat===kit.lib.material('lattice_doors')&&m.position.z< -item.d/2+1.5,head=mat===kit.lib.material('wall_red')&&close(m.position.z,-item.d/2),threshold=mat===kit.lib.material('wood_column')&&m.geometry.type==='BufferGeometry'&&close(m.position.z,-item.d/2)&&close(m.position.y,y+.11);if(frontColumn||frontPanels||head||threshold){removed.push(m);f.remove(m);}}
  if(removed.length!==18)throw Error('Shoukang rear retained source changed');
  const mat=(name,color)=>{const m=new T.MeshStandardMaterial({name,color,roughness:.8});privateMats.push(m);tmp.owned.push(m);return m;};
  const red=mat('shoukang_rear_red_fit',0x783a2d),dark=mat('shoukang_rear_opaque_glass_fit',0x3b4845),stone=mat('shoukang_rear_stone_fit',0x96968b),gold=mat('shoukang_rear_plain_gold_fit',0xac8a48);
  const group=new T.Group();group.name='shoukang-rear-five-bay-south';f.add(group);
  const mesh=(role,geo,material,x,yy,z,parent=group)=>{const m=tmp.mesh(parent,geo,material,x,yy,z);m.name='shoukang-rear-'+role;m.userData.shoukangRear={role};return m;};
  const box=(role,w,h,d,x,yy,z,material=red,parent=group)=>mesh(role,new T.BoxGeometry(w,h,d),material,x,yy,z,parent);
  for(const x of axes){mesh('front-column',new T.CylinderGeometry(.31,.3255,item.colH-.13,12),red,x,y+.13+(item.colH-.13)/2,-item.d/2);mesh('front-column-base',new T.CylinderGeometry(.38,.38,.13,16),stone,x,y+.065,-item.d/2);box('inner-front-post',.16,4.4,.30,x,y+2.2,front);}
  box('front-head',item.w,H-4.4,.30,0,y+4.4+(H-4.4)/2,front);
  for(let i=0;i<5;i++){const cx=(axes[i]+axes[i+1])/2;if(i===2)continue;box('window-masonry-sill',bay-.16,.6,.30,cx,y+.3,front,stone);const total=bay-.24,lw=total/2;for(const side of[-1,1])buildShoukangRearWindow(tmp,group,{cx:cx+side*lw/2,bottom:y+.6,top:y+4.4,z:front,width:lw-.025,red,dark});}
  box('central-threshold',bay-.32,.22,.30,0,y+.11,front);
  box('central-head',bay-.16,.55,.30,0,y+3.85+.275,front);
  for(const side of[-1,1])for(let k=0;k<2;k++){
   const leaf=new T.Group(),lw=(bay-.32)/4;leaf.name='shoukang-rear-open-door-leaf';leaf.userData.shoukangRear={role:'door-leaf',pose:'VIRTUAL_OPEN_FOLD_NOT_PHOTOGRAPHED_CLOSED_STATE'};leaf.position.set(side*(bay/2-.25-k*.17),y,front+lw/2+.08);leaf.rotation.y=side*Math.PI/2;group.add(leaf);
   box('door-body',lw-.025,3.85,.10,0,1.925,0,red,leaf);box('door-upper-field',lw-.16,2.35,.025,0,2.4,-.0625,dark,leaf);
   for(const x of[-(lw-.16)/2,(lw-.16)/2])box('door-gold-border',.025,.85,.025,x,.64,-.0625,gold,leaf);for(const yy of[.215,1.065])box('door-gold-border',lw-.16,.025,.025,0,yy,-.0625,gold,leaf);
  }
  const room=tmp.rooms[0];room.name='寿康宫后殿';room.kind='unverified-rear-hall-shell';room.min.z=item.z+front;room.doors=[{x:item.x,z:item.z+front}];room.cover=[];room.spawns=[{x:item.x,z:item.z+1}];Object.assign(room,{currentInventoryVerified:false,knownEmpty:false,inventoryStatus:'UNKNOWN_PRESET_FURNITURE_WITHHELD',interiorAccepted:false});
  tmp.mapItems[0].name='寿康宫后殿';tmp.regions.push({name:'寿康宫后殿',minX:item.x-item.w/2,maxX:item.x+item.w/2,minZ:item.z+front,maxZ:item.z+item.d/2});
  f.userData.structure={id:'outer-west/shoukang-rear-hall',objectId:'FC-EFD43D2106',canonicalName:'寿康宫后殿',source,photo,photoHash:'7a4aae80942b957e20ad166bf4289cb7af7430ac1bb98c5067d0b2ddc6e1bf29',frontBays:5,oldFrontBays:7,retainedBackColumns:8,accepted:false,scope:'SOUTH_FIVE_BAY_GALLERY_AND_ACTUAL_MODEL_CONTACT',identityStatus:'OLD_D1_POSITION_IDENTITY_NOT_SURVEY',dimensionStatus:'INHERITED_ENVELOPE_PHOTO_FIT_NOT_SURVEY',rearStatus:'UNCHANGED_SEVEN_BAY_BACK_COLUMNS_NO_NEW_REAR_DOOR',interiorStatus:'UNKNOWN_FURNITURE_WITHHELD_NOT_EMPTY_HISTORY',glass:'OPAQUE_DARK_SURROGATE_NOT_OPTICAL_RECONSTRUCTION',doorPose:'FOUR_LEAF_VIRTUAL_OPEN_FIT',roofStatus:'RETAINED_GEOMETRY_WITH_ACTUAL_TRIANGLE_CONTACT_NOT_HISTORICAL_ACCEPTANCE',wholeHallAccepted:false};f.userData.shoukangRear=f.userData.structure;
  // Preserve the legacy <=.55m platform stepping contract and its floor skin.
  // Exact triangle sides there would block the .5m body before its .3m foot
  // could reach the original walkable. Upper architecture and roof are solid.
  tmp.colliders=[];tmp.root.updateMatrixWorld(true);let ordinal=0,retainedStepping=0;
  f.traverse(m=>{if(!m.isMesh)return;const retainedBase=(m.material===kit.lib.material('wall_brick')&&close(m.position.y,y/2)&&m.position.x===0&&m.position.z===0)||(m.material===kit.lib.material('stone_slab')&&close(m.position.y,y-.03)&&m.position.x===0&&m.position.z===0)||m.material===kit.floorMat;if(retainedBase){retainedStepping++;return;}if(m.userData.shoukangRear?.role==='central-threshold'){const b=new T.Box3().setFromObject(m);tmp.colliders.push(b);tmp.walkables.push({type:'box',box:new T.Box3(new T.Vector3(b.min.x,b.max.y,b.min.z),b.max.clone())});return;}const p=m.geometry.attributes.position,ix=m.geometry.index,values=[];for(let i=0;i<(ix?.count??p.count);i++){const v=new T.Vector3().fromBufferAttribute(p,ix?ix.getX(i):i).applyMatrix4(m.matrixWorld);values.push(v.x,v.y,v.z);}const g=new T.BufferGeometry();g.setAttribute('position',new T.BufferAttribute(new Float64Array(values),3));try{const owner=triangleInstance(createTriangleTemplate(g),[0,0,0],`shoukang-rear:${ordinal++}`),b=owner.box.clone();b.triangleSupport=owner;tmp.colliders.push(b);}finally{g.dispose();}});if(retainedStepping!==3)throw Error('Shoukang rear low stepping source mismatch');Object.assign(f.userData.structure,{contactScope:'UPPER_ARCHITECTURE_AND_ROOF_ACTUAL_MESH; ORIGINAL_LOW_PLATFORM_FLOOR_STEPPING_RETAINED',retainedSteppingMeshes:3,thresholdContact:'EXACT_BOX_WITH_OLD_STEP_CLEARANCE_AND_ACTUAL_TOP'});
 }catch(error){const seen=new Set();tmp.root.traverse(m=>{if(m.isMesh)seen.add(m.geometry);});for(const m of removed)seen.add(m.geometry);for(const g of seen)g.dispose();for(const m of privateMats)m.dispose();throw error;}
 const snapshots=Object.fromEntries(arrays.map(k=>[k,[...kit[k]]]));const children=[...kit.root.children];
 try{kit.root.add(built.f);const offset=kit.rooms.length;tmp.rooms.forEach((r,i)=>{r.id=offset+i;});for(const key of arrays)kit[key].push(...tmp[key]);}
 catch(error){kit.root.children=children;for(const f of children)if(f.parent!==kit.root)f.parent=kit.root;built.f.parent=tmp.root;for(const key of arrays)Array.prototype.splice.call(kit[key],0,kit[key].length,...snapshots[key]);const seen=new Set();built.f.traverse(m=>{if(m.isMesh)seen.add(m.geometry);});for(const m of removed)seen.add(m.geometry);for(const g of seen)g.dispose();for(const m of privateMats)m.dispose();throw error;}
 const kept=new Set();built.f.traverse(m=>{if(m.isMesh)kept.add(m.geometry);});for(const g of new Set(removed.map(m=>m.geometry)))if(!kept.has(g))g.dispose();return built;
}
