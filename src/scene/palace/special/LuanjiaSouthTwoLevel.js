import {authorizeLuanjiaSouthContact} from './LuanjiaSouthContact.js';
import * as T from 'three';
import {cloneOverheadShape} from '../../../utils/OverheadShape.js';
import {applyBoxUV} from '../../../utils/GeometryUV.js';
import {createTriangleTemplate,triangleInstance} from '../../../utils/TriangleSupport.js';
const HOST='luanjia-south-provisional-wing',KEY='luanjiaSouthTwoLevel',PREFIX=HOST+':gameplay-two-level:';
const ARRAYS=['colliders','walkables','rooms','owned','mapItems'];
const SOURCE='https://www.dpm.org.cn/explore/building/236525.html';
export const LUANJIA_SOUTH_TWO_LEVEL_FIT=Object.freeze({floorY:3.3,slabThickness:.16,doorWidth:2.2,doorHeight:2.7,doorCenter:2.27,stairStart:-8.5,stairEnd:-1.03,treadRun:.33,topLanding:1.2,stairZ:2.5,stairWidth:2.2,stepCount:20,holeX0:-8.65,holeX1:-1.03,holeZ0:1.28,holeZ1:4.18,guardHeight:1.1});
const near=(a,b)=>Number.isFinite(a)&&Math.abs(a-b)<2e-5;
const writableArray=a=>Array.isArray(a)&&Object.getPrototypeOf(a)===Array.prototype&&Object.isExtensible(a)&&Object.getOwnPropertyDescriptor(a,'length')?.writable;
const writable=(o,k)=>{const d=Object.getOwnPropertyDescriptor(o,k);return d?d.writable===true:Object.isExtensible(o)};
const noEvents=o=>!Object.values(o?._listeners??{}).some(a=>a.length);
function vertices(m){const p=m.geometry?.attributes?.position,ix=m.geometry?.index;if(!p||p.itemSize!==3)throw Error('Luanjia access requires actual original mesh positions');const out=[];for(let i=0;i<(ix?.count??p.count);i++)out.push(...new T.Vector3().fromBufferAttribute(p,ix?ix.getX(i):i).applyMatrix4(m.matrixWorld).toArray().map(Math.fround));return out;}
function validate(kit,zone){
 if(zone?.id!=='outer-east')return null;
 const b=zone.bounds,r=kit?.root;if(!b||b.x0!==-382||b.x1!==-131.95||b.z0!==-400||b.z1!==111.5||r?.name!=='outer-east'||r.parent||r.position.lengthSq()||r.rotation.x||r.rotation.y||r.rotation.z||!r.scale.equals(new T.Vector3(1,1,1))||!r.matrixAutoUpdate||!r.visible||!noEvents(r)||ARRAYS.some(k=>!writableArray(kit[k])))throw Error('Luanjia access requires the untransformed pre-finish outer-east kit');
 const found=r.children.filter(g=>g.userData.structure?.id===HOST);if(found.length!==1)throw Error('Luanjia access requires one actual south warehouse');
 const f=found[0],s=f.userData.structure;
 if(f.parent!==r||f.position.x!==-340||f.position.y!==0||f.position.z!==-378||f.rotation.x||f.rotation.y!==Math.PI||f.rotation.z||!f.scale.equals(new T.Vector3(1,1,1))||!f.visible||!f.matrixAutoUpdate||!noEvents(f)||!writableArray(f.children)||f.userData[KEY]||f.children.length!==22||s.parentObjectId!=='FC-33770DFDD3'||s.width!==46||s.depth!==9||s.eave!==6.6||s.ridge!==9.2||s.bays!==10||s.documentedInternalLevels!==2||s.modeledUpperFloors!==0||s.modeledStairs!==0||s.interiorFurnishings!==0||s.modernFacadeVerified!==false||s.wholeObjectAccepted!==false||!writable(f.userData,KEY)||['modeledUpperFloors','modeledStairs','access','gameplayInteriorStatus','gameplayTwoLevelAccess','triangleOwners','boxOwners','physicalOwners'].some(k=>!writable(s,k)))throw Error('Luanjia access needs the unchanged closed south host, once');
 f.updateWorldMatrix(true,true);
 const pairs=[];
 for(const [key,lo,hi]of[['long-wall--1',[-23,0,-4.5],[23,6.6,-4.18]],['unverified-closed-panel',[1.17,0,-4.62],[3.37,2.7,-4.52]]]){
  const id=HOST+':'+key,ms=f.children.filter(m=>m.isMesh&&m.name===id&&m.userData.luanjiaOwner===id),cs=kit.colliders.filter(c=>c.triangleSupport?.id===id&&c.luanjiaSouthWing?.id===key);
  if(ms.length!==1||cs.length!==1||!noEvents(ms[0]))throw Error('Luanjia access needs the unique actual wall/panel owner');
  const m=ms[0],c=cs[0],bounds=new T.Box3().setFromBufferAttribute(m.geometry.attributes.position),a=vertices(m),shape=c.triangleSupport,old=shape.template.triangles.flatMap(q=>[q.triangle.a,q.triangle.b,q.triangle.c].flatMap(v=>v.toArray()));
  if(m.position.lengthSq()||m.rotation.x||m.rotation.y||m.rotation.z||!m.scale.equals(new T.Vector3(1,1,1))||!lo.every((n,i)=>near(bounds.min.getComponent(i),n))||!hi.every((n,i)=>near(bounds.max.getComponent(i),n))||shape.offset.lengthSq()||!c.equals(shape.box)||a.length!==old.length||a.some((v,i)=>v!==old[i]))throw Error('Luanjia access original physical wall/panel changed');pairs.push({m,c});
 }
 const maps=kit.mapItems.filter(m=>m.parentObjectId==='FC-33770DFDD3'&&m.x===-340&&m.z===-378);if(maps.length!==1||!writable(maps[0],'name'))throw Error('Luanjia access requires the actual south map declaration');
 return{f,s,pairs,map:maps[0]};
}
/** A reversible EMPTY two-level GAMEPLAY fit, not an interior reconstruction.
 * Official prose supplies two levels only. Entrance, floor height, stair layout,
 * neutral deck and safety parapets are explicitly game adaptations. No windows,
 * furniture, vanished buildings, east-wing changes or global physics policy. */
export function finishLuanjiaSouthTwoLevel(kit,zone){
 const host=validate(kit,zone);if(!host)return null;const{f,s,pairs,map}=host,p=LUANJIA_SOUTH_TWO_LEVEL_FIT;
 const working=new T.Group(),detail=new T.Group();working.position.copy(f.position);working.rotation.copy(f.rotation);working.add(detail);detail.name=PREFIX+'assembly';
 const meshes=[],colliders=[],walkables=[],geos=[],owned=[];let ordinal=0;
 const brick=kit.lib.material('wall_brick'),deck=new T.MeshStandardMaterial({name:'luanjia-gameplay-neutral-unverified-deck',color:0x746650,roughness:.94});owned.push(deck);
 const box=(role,mat,x0,x1,y0,y1,z0,z1)=>{
  let g=new T.BoxGeometry(x1-x0,y1-y0,z1-z0).translate((x0+x1)/2,(y0+y1)/2,(z0+z1)/2);if(mat===brick)g=applyBoxUV(g,kit.lib.tileSize('wall_brick'));geos.push(g);
  const m=new T.Mesh(g,mat),id=PREFIX+(ordinal++)+':'+role;m.name=id;m.castShadow=m.receiveShadow=true;m.userData.luanjiaAccessRole=role;m.userData.luanjiaOwner=id;detail.add(m);working.updateMatrixWorld(true);meshes.push(m);
  const a=vertices(m),q=new T.BufferGeometry().setAttribute('position',new T.Float32BufferAttribute(a,3));try{const shape=triangleInstance(createTriangleTemplate(q),[0,0,0],id),c=shape.box.clone();c.triangleSupport=shape;c.luanjiaSouthAccess={host:HOST,role,ownerId:id,...(role==='upper-floor'?{floorTriangles:shape}:{})};if(role==='closed-stair-tread'||role==='upper-floor')delete c.triangleSupport;if(role==='upper-floor')c.overhead=cloneOverheadShape({type:'piecewise-linear-x',sourceId:id,points:[[c.min.x,c.min.y],[c.max.x,c.min.y]],minZ:c.min.z,maxZ:c.max.z,topY:c.max.y},c);colliders.push(c);}finally{q.dispose();}return m;
 };
 const walk=(x0,x1,z0,z1,y)=>{const a=new T.Vector3(x0,y,z0).applyMatrix4(working.matrixWorld),b=new T.Vector3(x1,y,z1).applyMatrix4(working.matrixWorld);walkables.push({type:'box',box:new T.Box3().setFromPoints([a,b]),rescue:false});};
 const slab=(x0,x1,z0,z1)=>{box('upper-floor',deck,x0,x1,p.floorY-p.slabThickness,p.floorY,z0,z1);walk(x0,x1,z0,z1,p.floorY);};
 const toWorld=(x,z,y=0)=>new T.Vector3(x,y,z).applyMatrix4(working.matrixWorld).toArray();
 try{
  // Split the ACTUAL full wall, not just its old decorative red panel.
  box('fitted-door-wall-left',brick,-23,p.doorCenter-p.doorWidth/2,0,6.6,-4.5,-4.18);
  box('fitted-door-wall-right',brick,p.doorCenter+p.doorWidth/2,23,0,6.6,-4.5,-4.18);
  box('fitted-door-wall-lintel',brick,p.doorCenter-p.doorWidth/2,p.doorCenter+p.doorWidth/2,p.doorHeight,6.6,-4.5,-4.18);
  slab(-22.68,22.68,-4.18,p.holeZ0);slab(-22.68,p.holeX0,p.holeZ0,4.18);slab(p.holeX1,22.68,p.holeZ0,4.18);
  for(let i=0;i<p.stepCount;i++){
   const x0=p.stairStart+p.treadRun*i,x1=i===p.stepCount-1?p.stairEnd:p.stairStart+p.treadRun*(i+1),h=p.floorY*(i+1)/p.stepCount;
   box('closed-stair-tread',deck,x0,x1,0,h,p.stairZ-p.stairWidth/2,p.stairZ+p.stairWidth/2);walk(x0,x1,p.stairZ-p.stairWidth/2,p.stairZ+p.stairWidth/2,h);
   for(const z of[p.stairZ-p.stairWidth/2-.12,p.stairZ+p.stairWidth/2])box('stair-side-guard',deck,x0,x1,0,h+p.guardHeight,z,z+.12);
  }
  box('stairwell-guard',deck,p.holeX0,p.holeX1,p.floorY,p.floorY+p.guardHeight,p.holeZ0-.12,p.holeZ0);
  box('stairwell-guard',deck,p.holeX0-.12,p.holeX0,p.floorY,p.floorY+p.guardHeight,p.holeZ0,4.18);
 }catch(error){geos.forEach(g=>g.dispose());owned.forEach(m=>m.dispose());throw error;}
 const meta={status:'GAMEPLAY_FIT_NOT_HISTORICAL_INTERIOR_RECONSTRUCTION',sourceUrls:[SOURCE],documentedLevels:2,modeledLevels:2,upperFloors:1,stairs:1,...p,entrance:'EXISTING_UNVERIFIED_PANEL_LOCATION_GAME_OPENING_NOT_PUBLIC_ADMISSION',floorAndStair:'ENGINEERING_FIT_NOT_SURVEYED',furnishings:0,newWindows:0,eastWingChanged:false,routeWorld:{outside:toWorld(p.doorCenter,-8),inside:toWorld(p.doorCenter,-1),bottomApproach:toWorld(-10.2,0),bottom:toWorld(-10.2,p.stairZ),top:toWorld(.0,p.stairZ,p.floorY),upperCenter:toWorld(0,-1,p.floorY)},unknown:['historical door and staircase locations/form','actual floor height, structure and finish','modern internal condition and public admission','GPU/mobile acceptance']};
 // Publish only after every visible closed part and its physical owner exists.
 for(const {m,c}of pairs){f.remove(m);kit.colliders.splice(kit.colliders.indexOf(c),1);}working.remove(detail);f.add(detail);kit.colliders.push(...colliders);kit.walkables.push(...walkables);kit.owned.push(...owned);
 Object.assign(s,{modeledUpperFloors:1,modeledStairs:1,access:'EMPTY_TWO_LEVEL_GAMEPLAY_ADAPTATION_NOT_CURRENT_PUBLIC_ADMISSION',gameplayInteriorStatus:meta.status,gameplayTwoLevelAccess:meta,triangleOwners:65,boxOwners:23,physicalOwners:88});f.userData[KEY]=meta;map.name+='；空置两层游戏适配（非室内复原）';authorizeLuanjiaSouthContact(kit,f,{detail,meta,walkables,colliders,meshes});for(const{m}of pairs)m.geometry.dispose();
 return{frame:f,detail,meta,meshes,colliders,walkables,replaced:pairs};
}
