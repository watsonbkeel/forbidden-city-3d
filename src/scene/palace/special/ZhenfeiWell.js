import * as T from 'three';
import {createTriangleTemplate,triangleInstance} from '../../../utils/TriangleSupport.js';
const ID='zhenfei-well',OBJECT='FC-EBADA47212',done=new WeakSet();
const BOUNDS={x0:-366.5,x1:-222.45,z0:111.5,z1:526.5};
const ANCHORS=[{kind:'gate',name:'贞顺门',x:-272.3,z:518.9},{kind:'hall',name:'景祺阁',x:-293.3,z:496.8,w:31,d:11.2,pad:.8,ph:.8,colH:10.24,roof:'xieshan',layers:2},{kind:'hall',name:'倦勤斋',x:-252.6,z:513.6,w:31.5,d:8.8,pad:.5,ph:.5,colH:5.5,roof:'yingshan'}];
const same=(a,b)=>JSON.stringify(a)===JSON.stringify(b),mutable=a=>Array.isArray(a)&&Object.isExtensible(a)&&Object.getOwnPropertyDescriptor(a,'length')?.writable;
function validateHost(kit,zone){
 const r=kit?.root;let exists=false;r?.traverse(m=>{if(m.userData.structure?.sourceObjectId===OBJECT)exists=true;});
 if(!r||r.name!=='ningshou'||r.parent||r.position.lengthSq()||!r.quaternion.equals(new T.Quaternion())||!r.scale.equals(new T.Vector3(1,1,1))||!r.matrix.equals(new T.Matrix4())||!r.matrixWorld.equals(new T.Matrix4())||!Object.isExtensible(kit)||!mutable(r.children)||['colliders','walkables','owned','rooms','mapItems','regions'].some(k=>!mutable(kit[k]))||!same(zone.bounds,BOUNDS)||ANCHORS.some(a=>zone.items?.filter(i=>same(i,a)).length!==1)||exists||done.has(kit))throw Error('Exact mutable untransformed Zhenfei well host required, once only');
 // This reserve includes the fitted well and an unobstructed viewing margin.
 // Existing ground at y=0 is retained; broadphase candidates are not collisions.
 const reserve=new T.Box3(new T.Vector3(-279.6,.01,509.1),new T.Vector3(-276.6,1.8,512.1));
 if(kit.colliders.some(c=>(c.box??c).intersectsBox(reserve)))throw Error('Zhenfei well reserve is occupied');
}
/** Official text/photo supports a separate stone well with an open central mouth.
 * Coordinates, 1.10m diameter and .85m height are reversible model fitting, not
 * a survey. The visible solid .10m-high bottom is a game-safety adaptation,
 * NOT the historical well depth. No pavilion, plaque, new room or map target. */
export function buildZhenfeiWell(kit,zone){
 if(zone?.id!=='ningshou')return false;validateHost(kit,zone);
 const frame=new T.Group();frame.name=ID;frame.position.set(-278.1,0,510.6);
 const geometries=[],materials=[],colliders=[];
 try{
  const stone=kit.lib.material('stone_slab').clone();stone.name='r164_zhenfei_stone';materials.push(stone);
  const dark=new T.MeshStandardMaterial({name:'r164_zhenfei_shallow_bottom',color:0x353630,roughness:1});materials.push(dark);
  const mesh=(role,g,m,y=0)=>{geometries.push(g);const q=new T.Mesh(g,m);q.name=ID+'/'+role;q.position.y=y;q.castShadow=q.receiveShadow=true;frame.add(q);return q;};
  // Closed annular section: outward barrel, flat rim, real inward shaft wall.
  // No disk over the aperture and no invisible floor or rescue walkable.
  const profile=[[.22,0],[.46,0],[.51,.12],[.55,.38],[.53,.67],[.49,.85],[.22,.85],[.22,0]].map(p=>new T.Vector2(...p));
  mesh('stone-barrel-annulus',new T.LatheGeometry(profile,32),stone);
  mesh('visible-shallow-bottom-fit',new T.CylinderGeometry(.225,.225,.06,32),dark,.07);
  frame.updateWorldMatrix(true,true);
  frame.traverse(m=>{if(!m.isMesh)return;const g=m.geometry.clone();try{g.applyMatrix4(m.matrixWorld);const shape=triangleInstance(createTriangleTemplate(g),[0,0,0],m.name),b=shape.box.clone();b.triangleSupport=shape;b.zhenfeiWellMesh=m.uuid;colliders.push(b);}finally{g.dispose();}});
 }catch(e){for(const g of geometries)g.dispose();for(const m of materials)m.dispose();throw e;}
 const meta={id:ID,sourceObjectId:OBJECT,name:'珍妃井',surveyed:false,wholeObjectAccepted:false,currentAdmissionVerified:false,panoramaPixelsViewed:false,realDepthVerified:false,newRooms:0,newMapItems:0,fit:{x:-278.1,z:510.6,outerDiameter:1.10,height:.85,innerDiameter:.44,visibleBottomTop:.10},wellBottom:'VISIBLE_SOLID_SHALLOW_GAME_SAFETY_FIT_NOT_REAL_DEPTH',sources:['https://www.dpm.org.cn/explore/building/236447.html','https://www.dpm.org.cn/explore/building/236480.html','https://img.dpm.org.cn/Uploads/Picture/dc/4654.jpg','https://young.dpm.org.cn/info/995'],sourceSupported:['Separate stone well inside Zhenshun gate, outside west wall of Jingqi rear court; Huaiyuan hall is north of the well','Official photograph shows pale barrel-shaped stone and central dark opening'],fitted:['All metric coordinates/dimensions and simplified stone profile/material','Pictorial map to retained nearby model anchors, not surveyed placement','Visible shallow solid bottom for safe game geometry'],unknown:['Exact surveyed coordinates/scale/profile, side lock-hole and ironwork details, hidden well depth/water','Current condition/public access and full surrounding architecture','Browser/GPU/mobile visual acceptance and full World integration']};
 frame.userData.structure=meta;kit.root.add(frame);kit.colliders.push(...colliders);kit.owned.push(...materials);done.add(kit);return{frame,meta,colliders,materials};
}
