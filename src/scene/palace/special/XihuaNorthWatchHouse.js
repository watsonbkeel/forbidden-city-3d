import * as T from 'three';
import {applyBoxUV} from '../../../utils/GeometryUV.js';
import {createTriangleTemplate,triangleInstance} from '../../../utils/TriangleSupport.js';

const ID='xihua-north-watch-house',SOURCE_ID='FC-47E803E147',done=new WeakSet();
const HOST=[{"kind":"cityGate","cityGateProfile":"east-west","name":"西华门","x":360.5,"z":-260.6,"rot":"west"},{"kind":"region","name":"西华门","x0":345,"x1":376,"z0":-275.6,"z1":-245.6,"source":"estimated"}];
export const XIHUA_NORTH_WATCH_FIT=Object.freeze({center:Object.freeze([350,-234]),reserve:Object.freeze({minX:337,maxX:363,minZ:-239,maxZ:-228}),bays:5,front:'NORTH_MODEL_PI_BAKED',status:'CAPTION_NORTH_RELATION_WITH_REVERSIBLE_POSITION_ORIENTATION_DIMENSION_FIT_NOT_SURVEY'});
const mutable=a=>Array.isArray(a)&&Object.isExtensible(a)&&Object.getOwnPropertyDescriptor(a,'length')?.writable;
function validate(kit,zone){const r=kit?.root;let duplicate=false;r?.traverse(m=>{if(m.userData.structure?.sourceObjectId===SOURCE_ID)duplicate=true});if(!r||r.name!=='outer-west'||r.parent||r.position.lengthSq()||!r.quaternion.equals(new T.Quaternion())||!r.scale.equals(new T.Vector3(1,1,1))||!r.matrix.equals(new T.Matrix4())||!r.matrixWorld.equals(new T.Matrix4())||!Object.isExtensible(kit)||!mutable(r.children)||['colliders','walkables','owned','rooms','mapItems','regions','plaques'].some(k=>!mutable(kit[k]))||!Array.isArray(zone.items)||HOST.some(h=>zone.items.filter(i=>JSON.stringify(i)===JSON.stringify(h)).length!==1)||duplicate||done.has(kit))throw Error('Exact mutable Xihua north host required, once only');}
/** Captioned museum photo8007 guides only the visible five-bay front/palette.
 * Exact position/cardinal front, dimensions, roof section/ends, fine motifs and
 * all hidden geometry remain reversible fits; no interior/admission is implied. */
export function buildXihuaNorthWatchHouse(kit,zone){
  if(zone?.id!=='outer-west')return false;validate(kit,zone);
  const frame=new T.Group();frame.name=ID;frame.position.set(350,0,-234);
  const geometries=new Set(),materials=new Set(),cache=new Map(),colliders=[],walkables=[];let published=false;
  const mat=(name,color)=>{const key=name+':'+color;if(!cache.has(key)){const m=new T.MeshStandardMaterial();materials.add(m);m.copy(kit.lib.material(name));m.name='r165_watch_'+key;m.color.setHex(color);m.map=null;m.normalMap=null;cache.set(key,m)}return cache.get(key)};
  const triangle=(v,a,b,c,n)=>{const normal=new T.Vector3().subVectors(new T.Vector3(...b),new T.Vector3(...a)).cross(new T.Vector3().subVectors(new T.Vector3(...c),new T.Vector3(...a)));v.push(...a,...(normal.dot(new T.Vector3(...n))>=0?[...b,...c]:[...c,...b]))};
  const quad=(v,a,b,c,d,n)=>{triangle(v,a,b,c,n);triangle(v,a,c,d,n)};
  const mesh=(role,v,name,color,stone=false)=>{const g=new T.BufferGeometry();geometries.add(g);g.setAttribute('position',new T.Float32BufferAttribute(v,3));g.computeVertexNormals();applyBoxUV(g,2);g.rotateY(Math.PI);const m=new T.Mesh(g,mat(name,color));m.name=ID+'/'+role;m.userData.watchRole=role;m.userData.watchStone=stone;m.castShadow=m.receiveShadow=true;frame.add(m);return m};
  const box=(role,w,h,d,x,y,z,name,color,stone=false)=>{const a=x-w/2,b=x+w/2,c=y-h/2,e=y+h/2,f=z-d/2,g=z+d/2,v=[];quad(v,[a,c,f],[a,e,f],[b,e,f],[b,c,f],[0,0,-1]);quad(v,[a,c,g],[b,c,g],[b,e,g],[a,e,g],[0,0,1]);quad(v,[a,c,f],[a,c,g],[a,e,g],[a,e,f],[-1,0,0]);quad(v,[b,c,f],[b,e,f],[b,e,g],[b,c,g],[1,0,0]);quad(v,[a,c,f],[b,c,f],[b,c,g],[a,c,g],[0,-1,0]);quad(v,[a,e,f],[a,e,g],[b,e,g],[b,e,f],[0,1,0]);return mesh(role,v,name,color,stone)};
  const prism=(role,left,right,section,name,color)=>{const v=[],faces=T.ShapeUtils.triangulateShape(section.map(([z,y])=>new T.Vector2(z,y)),[]),point=(x,i)=>[x,section[i][1],section[i][0]];for(const ids of faces){triangle(v,...ids.map(i=>point(left,i)),[-1,0,0]);triangle(v,...ids.map(i=>point(right,i)),[1,0,0])}for(let i=0;i<section.length;i++){const j=(i+1)%section.length,dz=section[j][0]-section[i][0],dy=section[j][1]-section[i][1];quad(v,point(left,i),point(right,i),point(right,j),point(left,j),[0,dz,-dy])}return mesh(role,v,name,color)};
  const red=0x984a3b,grey=0x666969,blue=0x397073,stone=0x8e8c83,dark=0x4d4140;
  try{
    box('grey-base',22.6,.25,7,0,.125,.1,'stone_slab',stone,true);
    for(let i=1;i<=2;i++)box('fitted-low-tread',3,.125*i,.5,0,.0625*i,-4.4+(i-.5)*.5,'stone_slab',stone,true);
    box('closed-hidden-core-fit',21.4,3.95,3.5,0,2.225,1.2,'wall_red',red);
    for(const x of[-10,-6,-2,2,6,10])box('front-column',.25,3.95,.25,x,2.225,-2.45,'wood_column',red);
    for(const x of[-8,-4,4,8]){
      box('side-window-group',3.55,1.68,.12,x,2.75,-.61,'wood_column',dark);
      for(const dx of[-1.77,0,1.77])box('simplified-window-mullion',.065,1.78,.06,x+dx,2.75,-.70,'wood_column',red);
      for(const y of[1.86,2.75,3.64])box('simplified-window-rail',3.6,.065,.06,x,y,-.70,'wood_column',red);
    }
    for(const x of[-.88,.88])box('central-closed-door-leaf',1.72,3.35,.12,x,1.925,-.61,'wood_column',red);
    box('blue-green-front-beam',21.5,.38,.3,0,3.99,-2.45,'caihua_beam',blue);
    box('front-roof-bearing',22,.18,.24,0,4.16,-2.45,'wood_column',red);
    box('rear-roof-bearing',22,.28,.24,0,4.17,2.75,'wood_column',red);
    box('ridge-roof-bearing',22,1.7,.18,0,5.02,0,'wood_column',red);
    box('plain-hidden-ceiling-fit',21.4,.12,5.5,0,4.16,.2,'wood_column',red);
    const top=[[-3.5,4.45],[-3.15,4.35],[-2.4,4.32],[0,5.95],[2.4,4.32],[3.15,4.35],[3.5,4.45]],section=[...top,...top.map(([z,y])=>[z,y-.16]).reverse()];
    prism('grey-closed-roof',-11.5,11.5,section,'roof_tile',grey);
    // Shared actual polygon samples: every rib's lower skin intersects the
    // same sampled cover. These31 simplified ribs are not a source tile count.
    const rib=[...top.map(([z,y])=>[z,y+.065]),...top.map(([z,y])=>[z,y-.015]).reverse()];
    for(let i=0;i<31;i++){const x=-11.05+i*22.1/30;prism('grey-continuous-rib',x-.065,x+.065,rib,'roof_tile',grey)}
    box('grey-crown-cap',23.05,.18,.2,0,5.98,0,'roof_tile',grey);
    frame.updateWorldMatrix(true,true);const R=XIHUA_NORTH_WATCH_FIT.reserve,bounds=new T.Box3().setFromObject(frame);
    if(!new T.Box3(new T.Vector3(R.minX,-1e-6,R.minZ),new T.Vector3(R.maxX,8,R.maxZ)).containsBox(bounds))throw Error('Watch-house escaped fitted north reserve');
    // Publication must never silently consume an old mesh/contact or the gate.
    kit.root.traverse(m=>{if(m.isMesh&&bounds.intersectsBox(new T.Box3().setFromObject(m)))throw Error('Watch-house north reserve intersects old actual mesh')});
    if(kit.colliders.some(c=>bounds.intersectsBox(c)))throw Error('Watch-house north reserve intersects old contact');
    let ordinal=0;frame.traverse(m=>{if(!m.isMesh)return;const b=new T.Box3().setFromObject(m);b.watchMesh=m.uuid;if(m.userData.watchStone){colliders.push(b);const top=b.clone();top.min.y=top.max.y;walkables.push({type:'box',box:top,rescue:false})}else{const shape=triangleInstance(createTriangleTemplate(m.geometry),frame.position.toArray(),ID+'/'+ordinal++),c=shape.box.clone();c.triangleSupport=shape;c.watchMesh=m.uuid;colliders.push(c)}});
    const meta={id:ID,name:'西华门内北值房五开间正面有限拟合',sourceObjectId:SOURCE_ID,bays:5,source:'https://www.dpm.org.cn/explore/building/236501.html',photo:'https://img.dpm.org.cn/Uploads/Picture/dc/8007.jpg',photoDateVerified:false,wholeObjectAccepted:false,surveyed:false,currentAdmissionVerified:false,evidenceScope:'CAPTION_IDENTITY_NORTH_RELATION_AND_VISIBLE_FRONT_PALETTE_GROUPING',front:'NORTH_MODEL_PI_BAKED',frontOrientationStatus:'FITTED_NOT_INDEPENDENTLY_VERIFIED',placement:XIHUA_NORTH_WATCH_FIT.status,sourceSupported:['captioned independent house north inside Xihua gate','visible five bays, six front posts, central door and lateral window groups','visible muted red front, blue-green beam and low grey roof'],fitted:['precise anchor, cardinal front, all dimensions, roof cross-section and hidden ends/back','simple window subdivisions, paint abstractions,31 ribs and crown dimensions','shallow stone base and tread geometry'],unknown:['surveyed placement/orientation/dimensions','unseen exterior, gables/back, fine lattice and painted motifs','interior and current public access'],excluded:['parent city gate roof inherited as house evidence','renamed old shell, new room/map/teleport or period furnishings','whole-object photo acceptance, browser/GPU/mobile or performance claim'],newRooms:0,newMapItems:0,newTeleportTargets:0,outsideObservation:[350,0,-228.8]};frame.userData.structure=meta;
    const lengths={colliders:kit.colliders.length,walkables:kit.walkables.length,owned:kit.owned.length};try{kit.root.add(frame);kit.colliders.push(...colliders);kit.walkables.push(...walkables);kit.owned.push(...materials);done.add(kit);published=true}catch(e){frame.removeFromParent();for(const[k,n]of Object.entries(lengths))kit[k].length=n;throw e}return{frame,meta};
  }finally{if(!published){for(const g of geometries)g.dispose();for(const m of materials)m.dispose()}}
}
