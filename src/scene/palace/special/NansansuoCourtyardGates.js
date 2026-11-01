import * as T from 'three';
import {validateNansansuoInventoryPolicy} from '../NansansuoInventoryPolicy.js';
import {isBuiltNansansuoFrontFrame} from './NansansuoFrontHalls.js';
import {createTriangleTemplate,triangleInstance} from '../../../utils/TriangleSupport.js';
const KEY='nansansuoCourtyardGates',ARRAYS=['colliders','walkables','rooms','regions','mapItems','plaques','owned'];
const COURT={kind:'courtWalls',x0:-335,x1:-234,z0:20,z1:100,h:7,gates:[{side:'s',at:-285,gate:'南三所宫门'}]};
const COMMON={kind:'gate',name:'南三所宫门',x:-285,z:20,w:12,source:'D1'};
const RECORDS=[{index:16,x:-317.4,key:'east',id:'FC-2E6207278C'},{index:14,x:-285.4,key:'middle',id:'FC-C1914091EC'},{index:12,x:-251.8,key:'west',id:'FC-172C8CBF68'}];
const REAR=[{index:13,id:'place-outer-east-3f2ebd1b02'},{index:15,id:'place-outer-east-1db501eb23'},{index:17,id:'place-outer-east-4642f5088e'}];
const fail=m=>{throw Error(`Nansansuo courtyard gates ${m}`)},eq=(a,b)=>JSON.stringify(a)===JSON.stringify(b);
const writable=a=>Array.isArray(a)&&Object.isExtensible(a)&&Object.getOwnPropertyDescriptor(a,'length')?.writable;
export const NANSANSUO_COURTYARD_GATE_FIT=Object.freeze({z:30,portalWidth:2.6,portalHeight:2.8,pierWidth:.6,wallHeight:3,wallThickness:.6,capTop:3.8,routeZ:28.5});
function validate(kit,d){
 if(d?.id!=='outer-east')return false;
 const items=d.items??[];if(!items.some(i=>i?.name==='南三所宫门'||i?.name?.startsWith('南三所')&&i.kind==='hall'))return false;
 if(!eq(items[10],COMMON)||!eq(items[11],COURT)||items.filter(q=>q?.name==='南三所宫门').length!==1)fail('declaration source mismatch');
 for(const i of[12,13,14,15,16,17]){const item=items[i];validateNansansuoInventoryPolicy({zoneId:d.id,itemIndex:i,item});if(items.filter(q=>q?.name===item.name).length!==1)fail('duplicate hall declaration');}
 const r=kit.root;
 if(r.name!==d.id||r.parent||!r.visible||!r.matrixAutoUpdate||!writable(r.children)||!Object.getOwnPropertyDescriptor(r,'children')?.writable||ARRAYS.some(k=>!writable(kit[k]))||r.position.lengthSq()||r.rotation.toArray().slice(0,3).some(Boolean)||!r.scale.equals(new T.Vector3(1,1,1)))fail('root/array source mismatch');
 if(r.children.some(f=>f.userData[KEY]))fail('already installed / duplicate');
 const common=r.children.filter(f=>f.userData.nansansuoCommonGate);
 if(common.length!==1||common[0].parent!==r||!eq(common[0].position.toArray(),[-285,0,20])||common[0].userData.structure?.objectId!=='FC-B0B56A63EE')fail('requires actual common gate host');
 for(const q of RECORDS){const f=r.children.filter(f=>f.userData.nansansuoFrontHall?.objectId===q.id);if(f.length!==1||!isBuiltNansansuoFrontFrame(f[0])||f[0].parent!==r||!eq(f[0].position.toArray(),[q.x,0,39])||f[0].userData.structure?.scope!=='OWN_EXISTING_FRONT_HALL_ONLY')fail('requires actual retained front host');}
 for(const q of REAR){const f=r.children.filter(f=>f.userData.structure?.remainingId===q.id);if(f.length!==1||f[0].parent!==r||!eq(f[0].position.toArray(),[items[q.index].x,0,68.9]))fail('requires retained rear source host');}
 // Actual empty strip only, not a plan-image guess. Original perimeter walls at
 // x=-335/-234 are the intended joins and lie outside this open interior guard.
 if(kit.colliders.some(c=>c.min.x< -234.51&&c.max.x> -334.49&&c.min.z<30.7&&c.max.z>29.3&&c.min.y<4&&c.max.y>.05))fail('occupied actual forecourt band');
 return true;
}
/** Additive, finite fit of the three separately attested south courtyard gates.
 * No middle/rear identity, additional row, household inventory or precise survey. */
export function finishNansansuoCourtyardGates(kit,zoneJson){
 if(!validate(kit,zoneJson))return null;
 const tmp=Object.assign(Object.create(Object.getPrototypeOf(kit)),kit,{root:new T.Group()});tmp.root.name=kit.root.name;for(const a of ARRAYS)tmp[a]=[];
 const geos=new Set(),mats=[],originalMesh=kit.mesh;tmp.mesh=function(p,g,...a){geos.add(g);return originalMesh.call(this,p,g,...a)};
 const dispose=()=>{for(const g of geos)g.dispose();for(const m of mats)m.dispose()};let frame,gates,walls,ordinal=0;
 try{
  const mat=(name,color,roughness)=>{const m=new T.MeshStandardMaterial({name,color,roughness});mats.push(m);tmp.owned.push(m);return m;};
  const red=mat('nansansuo_court_gate_plain_red',0x883c31,.81),green=mat('nansansuo_court_gate_green_glaze',0x41694a,.46),stone=kit.lib.material('wall_brick');
  frame=tmp.frame(0,0,0);frame.name='南三所三所南端琉璃门与短横墙';
  const box=(role,material,w,h,d,x,y,z)=>{const m=tmp.mesh(frame,new T.BoxGeometry(w,h,d),material,x,y,z);m.name=`nansansuo-courtyard:${role}`;m.userData[KEY]={role};registerTriangles(tmp,m,`nansansuo-courtyard:${role}:${ordinal++}`);return m;};
  gates=RECORDS.map(q=>({...NANSANSUO_COURTYARD_GATE_FIT,x:q.x,key:q.key,parentFrontId:q.id,surveyed:false,portals:1}));
  walls=[];let left=-335;for(const right of [...gates.map(g=>g.x-1.9),-234]){walls.push({x0:left,x1:right,z:30});const w=right-left,x=(right+left)/2;box('wall-base',stone,w,.35,.6,x,.175,30);box('wall-red-field',red,w,2.65,.6,x,1.675,30);box('wall-green-coping',green,w,.15,.72,x,3.075,30);left=right+3.8;}
  for(const g of gates){for(const side of[-1,1]){const x=g.x+side*1.6;box('gate-pier-base',stone,.6,.35,.6,x,.175,30);box('gate-red-pier',red,.6,2.85,.6,x,1.775,30);box('plain-green-jamb-face',green,.10,2.8,.08,g.x+side*1.35,1.4,29.66);}box('gate-lintel',red,3.8,.4,.6,g.x,3,30);box('plain-green-head-face',green,2.6,.15,.08,g.x,2.875,29.66);
   const geometry=capGeometry(),m=tmp.mesh(frame,geometry,green,g.x,0,30);m.name='nansansuo-courtyard:plain-low-green-cap';m.userData[KEY]={role:'plain-low-green-cap'};registerTriangles(tmp,m,`nansansuo-courtyard:${g.key}:cap`);
  }
  const metadata={id:'nansansuo-courtyard-south-gates',scope:'NANSANSUO_THREE_SOUTH_COURTYARD_GATES_ONLY',parentObjectId:'FC-C640AE8651',source:'https://www.dpm.org.cn/explore/building/236452.html',photo:'https://img.dpm.org.cn/Uploads/Picture/dc/4647[1024].jpg',map:'https://img.dpm.org.cn/static/themes/image/xf/map3.jpg',gates,walls,surveyed:false,wholeObjectAccepted:false,dimensionStatus:'ALL_NEW_DIMENSIONS_AND_PLACEMENT_REVERSIBLE_ENGINEERING_FIT_WITHIN_ACTUAL_EMPTY_FORECOURT_STRIP_NOT_SURVEY',gateType:'ONE_CLEAR_PORTAL_WITH_PLAIN_GREEN_GLAZED_CAP__NOT_A_THREE_BAY_COMMON_GATE',unknown:'Door leaves and their pose, carving, glazed ornament census, exact cap curvature, colour and hidden back unverified; withheld. No middle/rear row assignment, third row, well or side hall reconstruction.',contact:'Every new box and closed cap face has complete actual source-triangle contact, including upward header impacts. Ground-level openings add no steps or walkable override.'};
  frame.userData[KEY]=metadata;frame.userData.structure=metadata;
 }catch(error){dispose();throw error;}
 const children=[...kit.root.children],snapshots=Object.fromEntries(ARRAYS.map(a=>[a,[...kit[a]]]));
 try{kit.root.add(frame);for(const a of ARRAYS)kit[a].push(...tmp[a]);}
 catch(error){kit.root.children=children;for(const f of children)f.parent=kit.root;frame.parent=tmp.root;for(const a of ARRAYS)Array.prototype.splice.call(kit[a],0,kit[a].length,...snapshots[a]);dispose();throw error;}
 return{frame,gates,walls};
}
function capGeometry(){
 const a=[-2.2,3.2,-.55],b=[2.2,3.2,-.55],c=[2.2,3.2,.55],d=[-2.2,3.2,.55],e=[-1.4,3.8,0],f=[1.4,3.8,0],values=[],uv=[];
 const face=(points,normal)=>{for(let i=1;i<points.length-1;i++){let v=[points[0],points[i],points[i+1]],n=new T.Vector3(...v[1]).sub(new T.Vector3(...v[0])).cross(new T.Vector3(...v[2]).sub(new T.Vector3(...v[0])));if(n.dot(new T.Vector3(...normal))<0)v=[v[0],v[2],v[1]];for(const p of v){values.push(...p);uv.push(p[0],p[2]);}}};
 face([a,b,f,e],[0,1,-1]);face([d,e,f,c],[0,1,1]);face([a,e,d],[-1,1,0]);face([b,c,f],[1,1,0]);face([a,d,c,b],[0,-1,0]);
 const g=new T.BufferGeometry();g.setAttribute('position',new T.Float32BufferAttribute(values,3));g.setAttribute('uv',new T.Float32BufferAttribute(uv,2));g.computeVertexNormals();return g;
}
function registerTriangles(kit,mesh,id){kit.root.updateMatrixWorld(true);const p=mesh.geometry.attributes.position,ix=mesh.geometry.index,values=[];for(let i=0;i<(ix?.count??p.count);i++){const v=new T.Vector3().fromBufferAttribute(p,ix?ix.getX(i):i).applyMatrix4(mesh.matrixWorld);values.push(...v.toArray());}const g=new T.BufferGeometry();g.setAttribute('position',new T.BufferAttribute(new Float64Array(values),3));try{const owner=triangleInstance(createTriangleTemplate(g),[0,0,0],id),box=owner.box.clone();box.triangleSupport=owner;kit.colliders.push(box);}finally{g.dispose();}}
