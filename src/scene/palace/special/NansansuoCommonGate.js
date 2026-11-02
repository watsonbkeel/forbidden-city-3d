import * as T from 'three';
import {buildRoof} from '../../RoofBuilder.js';
import {createTriangleTemplate,triangleInstance} from '../../../utils/TriangleSupport.js';

const ID='FC-B0B56A63EE',NAME='南三所宫门',KEY='nansansuoCommonGate';
const ARRAYS=['colliders','walkables','mapItems','regions','rooms','plaques','owned'];
const EXPECTED={kind:'gate',name:NAME,x:-285,z:20,w:12,source:'D1'};
const WALL={kind:'courtWalls',x0:-335,x1:-234,z0:20,z1:100,h:7,gates:[{side:'s',at:-285,gate:NAME}]};
export const NANSANSUO_COMMON_GATE=Object.freeze({id:ID,width:14.8,bodyWidth:12,bodyDepth:5,floorY:.5,columnTopY:6.2,portalWidth:3.6,portalHeight:4.6,rampRun:3,rampWidth:4,rampCell:.125});
const exact=(a,b)=>JSON.stringify(a)===JSON.stringify(b);
const tag=(m,role)=>{m.name=`nansansuo-common-gate:${role}`;m.userData[KEY]={role};return m;};
function validate(kit,item,{zoneId,itemIndex,zoneJson}){
 if(zoneId!=='outer-east'||itemIndex!==10)return false;
 if(zoneJson?.id!==zoneId||zoneJson.items?.[10]!==item||!exact(item,EXPECTED)||!exact(zoneJson.items[11],WALL)||zoneJson.items.filter(q=>q?.kind==='gate'&&q.name===NAME).length!==1||zoneJson.items.filter(q=>q?.kind==='courtWalls'&&q.gates?.some(g=>g.gate===NAME)).length!==1)throw Error('Nansansuo common gate requires exact original gate and unique court-wall opening');
 const writable=a=>Array.isArray(a)&&Object.isExtensible(a)&&Object.getOwnPropertyDescriptor(a,'length')?.writable;
 const r=kit.root;
 if(r.name!==zoneId||r.parent||!r.visible||!r.matrixAutoUpdate||!Object.isExtensible(r)||!Object.getOwnPropertyDescriptor(r,'children')?.writable||!writable(r.children)||ARRAYS.some(k=>!writable(kit[k]))||r.position.lengthSq()||r.rotation.toArray().slice(0,3).some(Boolean)||!r.scale.equals(new T.Vector3(1,1,1))||!r.matrix.equals(new T.Matrix4())||!r.matrixWorld.equals(new T.Matrix4())||r.children.some(f=>f.userData[KEY]))throw Error('Nansansuo common gate root, array or duplicate contract mismatch');
 return true;
}
/** Bounded own-gate fit, not a survey or acceptance of the other eleven IDs.
 * Gate width is the inherited court-wall cut, NOT the central bay width. */
export function buildNansansuoCommonGate(kit,item,context){
 if(!validate(kit,item,context))return null;
 const tmp=Object.assign(Object.create(Object.getPrototypeOf(kit)),kit,{root:new T.Group()});tmp.root.name=kit.root.name;for(const k of ARRAYS)tmp[k]=[];
 const privateMats=[],geometries=new Set(),sourceMesh=kit.mesh;
 tmp.mesh=function(parent,geo,...rest){geometries.add(geo);return sourceMesh.call(this,parent,geo,...rest);};
 const dispose=()=>{tmp.root.traverse(m=>{if(m.isMesh)geometries.add(m.geometry)});for(const g of geometries)g.dispose();for(const m of privateMats)m.dispose();};
 let frame,geometry,ownerOrdinal=0;
 try{
  // Resolve shared resources before roof generation; no shared resource is
  // recolored, retagged, cloned for ownership, or disposed by this candidate.
  const stone=kit.lib.material('stone_slab'),brick=kit.lib.material('wall_brick');
  const material=(name,color,roughness)=>{const m=new T.MeshStandardMaterial({name,color,roughness});privateMats.push(m);tmp.owned.push(m);return m;};
  const green=material('nansansuo_common_green_glaze',0x396b4a,.43),red=material('nansansuo_common_plain_red',0x792e24,.73),wood=material('nansansuo_common_plain_timber',0x4b352b,.86);
  // Cached plain palette avoids importing another building's painted bands.
  const roofLib={material:n=>n==='roof_tile'?green:n==='wall_red'?red:wood,tileSize:()=>1,aspect:()=>1};
  frame=tmp.frame(item.x,item.z,0);frame.name=NAME;
  const box=(role,mat,w,h,d,x,y,z,parent=frame)=>tag(tmp.mesh(parent,new T.BoxGeometry(w,h,d),mat,x,y,z),role);
  const solid=(role,mat,w,h,d,x,y,z)=>{const m=box(role,mat,w,h,d,x,y,z);registerTriangles(tmp,m,`${role}-${ownerOrdinal++}`);return m;};
  // Real low platform; ordinary box stepping retains the existing .35 m
  // clearance. Its walkable is precisely its visible top, never a rescue roof.
  box('solid-platform',brick,14.8,.5,6,0,.25,0);tmp.col(frame,-7.4,0,-3,7.4,.5,3);tmp.walkBox(frame,-7.4,-3,7.4,3,.5);
  for(const side of[-1,1]){
   const role=side<0?'south-solid-ramp':'north-solid-ramp';tag(tmp.mesh(frame,wedge(-2,2,side*3,side*6,.5),stone,0,0,0),role);
   tmp.walkRamp(frame,-2,2,side*3,side*6,.5,0);
   // Strictly inscribed ordinary bodies, not full-ramp AABBs or an invisible
   // wedge extending into side air. Max vertical deficit = .5 / 24 = .02084 m.
   for(let i=0;i<24;i++){const a=side*(3+i/8),b=side*(3+(i+1)/8),top=.5*(1-(i+1)/24);if(top>0)tmp.col(frame,-2,0,a,2,top,b);}
   // Close the inherited 14.8m wall gap without enlarging the 12m gate body.
   solid('wall-gap-closure',red,1.4,5.7,1,side*6.7,2.85,0);
   // Flanking bays have no invented accessible rooms. Their enclosing panels
   // leave exactly one central opening through the actual dividing wall.
   solid('unverified-closed-flank-mass',red,4.0,5.7,5.0,side*4.0,3.35,0);
   solid('central-door-jamb',red,.20,4.8,.35,side*1.9,2.9,0);
   // Plain virtual open leaves: source is too dark to recover the real pose,
   // stud census, carving or hidden back. No nameboard is manufactured.
   const leaf=new T.Group();leaf.position.set(side*1.8,.5,0);leaf.rotation.y=side*Math.PI/2;frame.add(leaf);
   const panel=box('door-leaf',red,1.78,4.6,.12,-side*.89,2.3,0,leaf);registerTriangles(tmp,panel,`door-leaf-${side}`);
  }
  for(const z of[-2.5,2.5])for(const x of[-6,-2,2,6]){
   const m=tag(tmp.mesh(frame,new T.CylinderGeometry(.22,.24,5.7,12),red,x,3.35,z),'column');registerTriangles(tmp,m,`column-${x}-${z}`);
  }
  for(const z of[-2.5,2.5])solid('plain-front-back-beam',wood,12.4,.40,.40,0,6.0,z);
  solid('central-door-head',red,4.2,1.1,.35,0,5.65,0);
  const roof=buildRoof(roofLib,{type:'xieshan',width:12,depth:5,baseY:6.2,height:1.9,overhang:1.2,layers:1,brackets:false,detail:'low'});
  roof.traverse(m=>{if(m.isMesh)geometries.add(m.geometry)});frame.add(roof);roof.name='nansansuo-common-gate:roof';roof.userData.type='xieshan';roof.userData.eaves=1;
  roof.traverse(m=>{if(m.isMesh&&['roof_ridge_glaze','roof_finial_gold'].includes(m.material.name))m.material=green;});
  for(const m of roof.userData.ownedMaterials??[])m.dispose();roof.userData.ownedMaterials=[];
  // Complete generated roof source, not an envelope AABB, receives contact.
  // There is no newly fabricated beast row, hidden joinery or interior census.
  registerTriangles(tmp,roof,'complete-roof');
  geometry={...NANSANSUO_COMMON_GATE,x:item.x,z:item.z,rot:0,bays:3,depthBays:1,portals:1,columnAxes:[-6,-2,2,6],roof:'green-single-eave-xieshan',rampMaxInscribedError:.5/24,surveyed:false,wholeObjectAccepted:false,dimensionStatus:'INHERITED_12M_WIDTH_APPROXIMATE_DEPTH_AND_PHOTO_TYPE_ENGINEERING_FIT_NOT_SURVEY',doorPose:'VIRTUAL_PLAIN_TWO_LEAF_OPEN_NOT_PHOTOGRAPHED_POSE',unseen:'Exact green hue, leaf/stud census, plaque, carved motifs, hidden north details, roof ornaments and joinery unverified; not reconstructed',contact:'actual upper mesh triangles; actual low platform box; actual linear ramp tops and <=0.02084m inscribed ramp-body deficit under existing low-step clearance',source:'https://www.dpm.org.cn/explore/building/236452.html',photo:'https://img.dpm.org.cn/Uploads/pdf/1953/T00040_00.pdf',photoPage:40,photoSha256:'51fd6c0734dca087d1241acf02f74420d3a8a8ab4606b6625a9717f32214969f'};
  frame.userData[KEY]=geometry;frame.userData.structure={...geometry,id:'outer-east/items/10',objectId:ID,canonicalName:NAME,scope:'OWN_COMMON_GATE_ONLY_SIX_HALLS_AND_THIRD_ROW_UNCHANGED'};
  tmp.mapRect(frame,'gate',NAME,14.8,6,{objectId:ID,wholeObjectAccepted:false});
 }catch(error){dispose();throw error;}
 const children=[...kit.root.children],snapshots=Object.fromEntries(ARRAYS.map(k=>[k,[...kit[k]]]));
 try{kit.root.add(frame);for(const k of ARRAYS)kit[k].push(...tmp[k]);}
 catch(error){kit.root.children=children;for(const f of children)f.parent=kit.root;frame.parent=tmp.root;for(const k of ARRAYS)Array.prototype.splice.call(kit[k],0,kit[k].length,...snapshots[k]);dispose();throw error;}
 return {width:14.8,frame,geometry};
}
function registerTriangles(kit,root,role){
 kit.root.updateMatrixWorld(true);const values=[];root.traverse(m=>{if(!m.isMesh)return;const p=m.geometry.attributes.position,ix=m.geometry.index;for(let i=0;i<(ix?.count??p.count);i+=3){const vs=[0,1,2].map(k=>new T.Vector3().fromBufferAttribute(p,ix?ix.getX(i+k):i+k).applyMatrix4(m.matrixWorld));if(new T.Triangle(...vs).getArea()<1e-12)continue;for(const v of vs)values.push(v.x,v.y,v.z);}});
 const g=new T.BufferGeometry();g.setAttribute('position',new T.BufferAttribute(new Float64Array(values),3));try{const owner=triangleInstance(createTriangleTemplate(g),[0,0,0],`nansansuo-common-gate:${role}`),b=owner.box.clone();b.triangleSupport=owner;kit.colliders.push(b);}finally{g.dispose();}
}
function wedge(left,right,top,toe,height){
 const s=Math.sign(toe-top),a=[left,height,top],b=[right,height,top],c=[right,0,toe],d=[left,0,toe],aa=[left,0,top],bb=[right,0,top],values=[],uv=[];
 const face=(points,normal)=>{for(let i=1;i<points.length-1;i++){let q=[points[0],points[i],points[i+1]],n=new T.Vector3(...q[1]).sub(new T.Vector3(...q[0])).cross(new T.Vector3(...q[2]).sub(new T.Vector3(...q[0])));if(n.lengthSq()<1e-15)continue;if(n.dot(new T.Vector3(...normal))<0)q=[q[0],q[2],q[1]];for(const v of q){values.push(...v);uv.push(v[0],Math.abs(normal[1])>.5?v[2]:v[1]);}}};
 face([a,b,c,d],[0,1,0]);face([aa,d,c,bb],[0,-1,0]);face([a,aa,bb,b],[0,0,-s]);face([a,d,aa],[-1,0,0]);face([b,bb,c],[1,0,0]);
 const g=new T.BufferGeometry();g.setAttribute('position',new T.Float32BufferAttribute(values,3));g.setAttribute('uv',new T.Float32BufferAttribute(uv,2));g.computeVertexNormals();return g;
}
