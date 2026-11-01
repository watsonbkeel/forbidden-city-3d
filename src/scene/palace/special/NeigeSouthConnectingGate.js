import * as T from 'three';
import {applyBoxUV} from '../../../utils/GeometryUV.js';
import {createTriangleTemplate,triangleInstance} from '../../../utils/TriangleSupport.js';
const ID='neige-south-connecting-gate',FIT='PHOTO_TOPOLOGY_ENGINEERING_FIT_NOT_SURVEYED';
export const NEIGE_SOUTH_GATE_FIT=Object.freeze({x:-186,z:-383,rotation:Math.PI/2,doorWidth:2.2,clearWidthBetweenOpenLeaves:1.93,doorHeight:2.72,wallSpan:8,roofWidth:4.4,roofDepth:3.1,eave:3.12,ridge:4.15});
export const NEIGE_SOUTH_GATE_SOURCES=Object.freeze(['https://www.dpm.org.cn/Uploads/pdf/6179/T00024_00.pdf','https://www.dpm.org.cn/Uploads/pdf/6179/T00018_00.pdf']);
const identity=o=>o?.isObject3D&&o.position.lengthSq()===0&&o.rotation.x===0&&o.rotation.y===0&&o.rotation.z===0&&o.scale.equals(new T.Vector3(1,1,1));
/** The photographed red-wall south connecting gate, NOT the white-wall hanging
 * gate already represented in NeigeCourt. 2008 is the publication year, not a
 * present-day survey. Placement, east-west passage and visibly open leaves are
 * reversible interaction fits. No new named office, room or walkable support. */
export function buildNeigeSouthConnectingGate(kit,zone){
 if(zone?.id!=='outer-east')return false;
 const b=zone.bounds,keys=['colliders','walkables','rooms','owned','mapItems'];
 if(!b||b.x0!==-382||b.x1!==-131.95||b.z0!==-400||b.z1!==111.5||kit?.root?.name!=='outer-east'||!identity(kit.root)||!['neige-main-court','neige-storehouse-candidate-a'].every(id=>kit.root.children.some(o=>o.userData.structure?.id===id))||kit.root.children.some(o=>o.userData.structure?.id===ID)||keys.some(k=>!Array.isArray(kit[k])||Object.isFrozen(kit[k])||!Object.isExtensible(kit[k]))||Object.isFrozen(kit.root.children)||!Object.isExtensible(kit.root.children)||typeof kit.lib?.material!=='function')throw Error('Neige south gate requires original outer-east after main and store, once, untransformed');
 const p=NEIGE_SOUTH_GATE_FIT,frame=new T.Group();frame.name=ID;frame.position.set(p.x,0,p.z);frame.rotation.y=p.rotation;
 const owned=[],geometries=[],colliders=[],brick=kit.lib.material('wall_brick'),stone=kit.lib.material('stone_slab');
 const material=(name,color)=>{const m=new T.MeshStandardMaterial({name,color,roughness:.92});owned.push(m);return m;};
 const red=material('neige-south-gate-red-plaster',0x993b2a),wood=material('neige-south-gate-dark-red-leaf',0x743022),gray=material('neige-south-gate-gray-tile',0x696b68);
 const add=(a,geo,mat,role)=>{if(mat===brick||mat===stone)geo=applyBoxUV(geo,kit.lib.tileSize(mat===brick?'wall_brick':'stone_slab'));geometries.push(geo);const m=new T.Mesh(geo,mat);m.name=ID+'-'+role;m.userData.neigeGateRole=role;m.castShadow=m.receiveShadow=true;frame.add(m);a.push(m);return m;};
 const box=(a,role,mat,w,h,d,x,y,z)=>add(a,new T.BoxGeometry(w,h,d).translate(x,y,z),mat,role);
 const own=(a,key)=>{frame.updateMatrixWorld(true);const v=[];for(const m of a){const pos=m.geometry.attributes.position,ix=m.geometry.index;for(let i=0;i<(ix?.count??pos.count);i++){const q=new T.Vector3().fromBufferAttribute(pos,ix?ix.getX(i):i).applyMatrix4(m.matrixWorld);v.push(Math.fround(q.x),Math.fround(q.y),Math.fround(q.z));}}const g=new T.BufferGeometry().setAttribute('position',new T.Float32BufferAttribute(v,3));try{const shape=triangleInstance(createTriangleTemplate(g),[0,0,0],ID+':'+key),c=shape.box.clone();c.triangleSupport=shape;c.neigeSouthGate={id:key,parentObjectId:'FC-E09ED30C27'};colliders.push(c);for(const m of a)m.userData.neigeGateOwner=shape.id;}finally{g.dispose();}};
 const prism=(section,x0,x1)=>{const sh=new T.Shape();section.forEach(([z,y],i)=>sh[i?'lineTo':'moveTo'](z,y));sh.closePath();const g=new T.ExtrudeGeometry(sh,{depth:x1-x0,bevelEnabled:false,steps:1});g.rotateY(Math.PI/2);g.translate(x0,0,0);return g;};
 try{
  const floor=[];box(floor,'ground-level-stone-passage',stone,2.2,.05,3.3,0,-.025,0);own(floor,'visible-ground-paving');
  for(const s of[-1,1]){
   const pier=[];box(pier,'stone-foot',stone,.9,.55,1.48,s*1.55,.275,0);box(pier,'red-gate-pier',red,.9,2.42,1.4,s*1.55,1.76,0);own(pier,'masonry-pier-'+s);
   const wall=[];box(wall,'stone-foot',brick,2,.54,.55,s*3,.27,0);box(wall,'red-short-wall',red,2,1.66,.5,s*3,1.37,0);
   for(const [y,h,d]of[[2.2,.13,.63],[2.33,.10,.71],[2.43,.12,.77]])box(wall,'gray-wall-cap-band',gray,2,h,d,s*3,y,0);
   // Plain repeated tile ridges, not copied sculptural details from hidden sides.
   for(let i=0;i<9;i++){const g=new T.CylinderGeometry(.065,.065,.78,6).rotateX(Math.PI/2).translate(s*3-.9+i*.225,2.51,0);add(wall,g,gray,'wall-cap-tile');}own(wall,'short-wall-'+s);
   const jamb=[];box(jamb,'wood-door-jamb',wood,.10,2.72,.18,s*1.13,1.36,-.65);own(jamb,'door-jamb-'+s);
   // Leaves lie along the inner jambs, with a real gap from masonry. Their
   // rails leave1.93m clear; the2.2m masonry aperture is not the net width.
   // The visible open state and two-leaf count are explicit interaction fits.
   const leaf=[];box(leaf,'visible-open-leaf',wood,.10,2.61,1.04,s*1.03,1.335,.12);for(const y of[.21,1.34,2.48])box(leaf,'leaf-plain-rail',red,.13,.06,1.02,s*1.03,y,.12);own(leaf,'open-leaf-'+s);
  }
  const head=[];box(head,'wood-lintel',wood,2.2,.25,1.4,0,2.845,0);box(head,'gate-upper-red-band',red,4,.15,1.4,0,3.045,0);own(head,'visible-lintel');
  const half=1.55,n=14,curve=z=>p.eave+(p.ridge-p.eave)*(.55*(1-Math.abs(z)/half)+.45*(1-Math.abs(z)/half)**2),points=Array.from({length:n+1},(_,i)=>{const z=-half+2*half*i/n;return[z,curve(z)]});
  // Closed roof skin and closed gables, no bounding-box ceiling across the void.
  const roof=[];add(roof,prism([...points,...points.toReversed().map(([z,y])=>[z,y-.16])],-2.2,2.2),gray,'gray-roof-shell');
  for(const s of[-1,1]){const sec=[[-.73,3.08],[.73,3.08],...Array.from({length:13},(_,i)=>{const z=.73-1.46*i/12;return[z,curve(z)-.165]})];add(roof,prism(sec,s<0?-2.0:1.82,s<0?-1.82:2.0),gray,'gray-gable-face');}
  for(let i=0;i<=20;i++){const x=-2.15+4.3*i/20,path=new T.CatmullRomCurve3(points.map(([z,y])=>new T.Vector3(x,y+.022,-z)));add(roof,new T.TubeGeometry(path,14,.045,6,false),gray,'roof-tile-roll');for(const t of[0,1]){const v=path.getPoint(t),normal=path.getTangent(t).multiplyScalar(t===0?-1:1),g=new T.CircleGeometry(.045,6);g.applyMatrix4(new T.Matrix4().makeRotationFromQuaternion(new T.Quaternion().setFromUnitVectors(new T.Vector3(0,0,1),normal)));g.translate(...v.toArray());add(roof,g,gray,'roof-tile-end');}}
  box(roof,'plain-gray-ridge',gray,4.4,.19,.20,0,4.22,0);for(const s of[-1,1])box(roof,'plain-raised-ridge-end',gray,.14,.28,.23,s*2.12,4.30,0);own(roof,'true-closed-roof');
 }catch(error){geometries.forEach(g=>g.dispose());owned.forEach(m=>m.dispose());throw error;}
 const meta={id:ID,parentObjectId:'FC-E09ED30C27',relatedObjectId:'FC-40EB11CF20',name:'内阁南小门',...p,dimensions:FIT,scope:'SOUTH_CONNECTING_GATE_AND_SHORT_RED_WALL_ONLY',sourceYear:2008,photographDate:null,sourceUrls:[...NEIGE_SOUTH_GATE_SOURCES],openState:'VISIBLE_OPEN_LEAVES_INTERACTIVE_FIT_NOT_PUBLIC_ADMISSION',wholeObjectAccepted:false,additionalNamedOfficeCount:0,interiorFurnishings:0,triangleOwners:colliders.length,unknown:['current post-repair state and admission','surveyed location, orientation and dimensions','exact leaf count and original opening state','hidden reverse elevation and fine carved details','2026 site survey and GPU/mobile acceptance']};
 frame.userData.structure=meta;kit.root.add(frame);kit.colliders.push(...colliders);kit.owned.push(...owned);kit.mapItems.push({kind:'gate',name:meta.name,x:p.x,z:p.z,w:4.4,d:3.1,rot:p.rotation,parentObjectId:meta.parentObjectId,sourceStatus:FIT});return{frame,meta,colliders};
}
