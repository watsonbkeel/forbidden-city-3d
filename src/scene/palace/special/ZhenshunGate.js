import * as T from 'three';
import {applyBoxUV} from '../../../utils/GeometryUV.js';
import {createTriangleTemplate,triangleInstance} from '../../../utils/TriangleSupport.js';
const NAME='贞顺门',ID='place-ningshou-fff2a55955',done=new WeakSet();
const SOURCE={kind:'gate',name:NAME,x:-272.3,z:518.9};
const WALL={kind:'wall',from:[-354,520],to:[-233.2,520],h:7,gaps:[{at:-272.3,gate:NAME}]};
const same=(a,b)=>JSON.stringify(a)===JSON.stringify(b),mutable=a=>Array.isArray(a)&&Object.isExtensible(a)&&Object.getOwnPropertyDescriptor(a,'length')?.writable;
function validate(kit,item,c){
 if(c.zoneId!=='ningshou'||c.itemIndex!==9)return false;
 const r=kit?.root,z=c.zoneJson;
 if(!same(item,SOURCE)||z?.id!=='ningshou'||z.items?.[9]!==item||!same(z.items[42],WALL)||z.items.filter(i=>i.name===NAME).length!==1||!r||r.name!=='ningshou'||r.parent||!r.matrixAutoUpdate||!r.matrixWorldAutoUpdate||r.position.lengthSq()||!r.quaternion.equals(new T.Quaternion())||!r.scale.equals(new T.Vector3(1,1,1))||!r.matrix.equals(new T.Matrix4())||!r.matrixWorld.equals(new T.Matrix4())||!mutable(r.children)||['colliders','walkables','mapItems','owned','rooms','regions','plaques'].some(k=>!mutable(kit[k]))||done.has(kit)||r.children.some(f=>f.userData.structure?.id===ID))throw Error('Exact mutable Zhenshun source and retained north wall required once only');
 return true;
}
/** One source-backed wall gate body. The old photograph proves the separate
 * stone-base/glazed-frame entrance, not colour, measured scale or current pose.
 * Existing 3.6m passage and 6.4m wall gap remain; no invented inscription. */
export function buildZhenshunGate(kit,item,context){
 if(!validate(kit,item,context))return null;
 const frame=new T.Group();frame.name=NAME;frame.position.set(item.x,0,item.z);
 const geometries=[],materials=[],contacts=[];
 const own=()=>{const g=new T.BufferGeometry();geometries.push(g);return g},material=(name,color,roughness)=>{const m=new T.MeshStandardMaterial();materials.push(m);m.setValues({name:'r164_zhenshun_'+name,color,roughness});return m};
 const mesh=(name,g,m,x,y,z)=>{const q=new T.Mesh(g,m);q.name='zhenshun/'+name;q.position.set(x,y,z);q.castShadow=q.receiveShadow=true;q.userData.zhenshunGate=true;frame.add(q);return q};
 const box=(name,m,w,h,d,x,y,z,tileSize)=>{const g=own(),p=boxPayload(w,h,d);
  if(tileSize===undefined){g.setIndex(new T.BufferAttribute(p.index,1));for(const key of['position','normal','uv'])g.setAttribute(key,new T.BufferAttribute(p[key],key==='uv'?2:3));}
  else{for(const key of['position','normal']){const a=new Float32Array(p.index.length*3);for(let i=0;i<p.index.length;i++)for(let j=0;j<3;j++)a[i*3+j]=p[key][p.index[i]*3+j];g.setAttribute(key,new T.BufferAttribute(a,3));}applyBoxUV(g,tileSize);}
  for(const a of p.groups)g.addGroup(a.start,a.count,a.materialIndex);return mesh(name,g,m,x,y,z)};
 try{
  const stone=material('plain_profiled_stone_fit',0xc6c2ae,.9),red=material('red_fields_and_leaves_fit',0x984537,.72),green=material('green_glaze_fit',0x355d4c,.6),gold=material('yellow_glaze_fit',0xb59547,.6),roof=material('roof_tile_glaze_fit',0xb78e32,.6);roof.map=kit.lib.material('roof_tile').map??null;
  for(const s of[-1,1]){
   const x=s*2.5;
   box('stone-foot/'+s,stone,1.4,.2,2.8,x,.1,0);
   box('stone-waist/'+s,stone,1.24,.4,2.68,x,.4,0);
   box('stone-cap/'+s,stone,1.4,.15,2.8,x,.675,0);
   box('glazed-pier/'+s,green,1.4,4.75,2.8,x,3.125,0);
   // Plain recessed-looking fields, not a claim to reproduce the carved motifs.
   for(const z of[-1.42,1.42]){
    box('plain-glaze-field/'+s+'/'+z,red,1.16,3.95,.04,x,3.125,z);
    for(const dx of[-.6,.6])box('field-side/'+s+'/'+z+'/'+dx,gold,.04,4.03,.04,x+dx,3.125,z);
    for(const dy of[-1.995,1.995])box('field-end/'+s+'/'+z+'/'+dy,gold,1.24,.04,.04,x,3.125+dy,z);
   }
   box('open-leaf/'+s,red,.12,4.3,1.75,s*1.88,2.15,2.295);
  }
  box('door-head',green,3.6,1.1,2.8,0,4.95,0);
  // Close only the pre-existing high-wall band behind the lower canopy.
  box('upper-wall-backing',red,6.4,1.5,1,0,6.25,1.1);
  const canopy=own();hip(canopy,6.7,3.3,.7);mesh('low-hip-canopy-fit',canopy,roof,0,5.5,0);
  box('plain-ridge-fit',roof,3.4,.12,.12,0,6.26,0);
  const cap=own();hip(cap,6.4,1.12,.12);mesh('retained-wall-height-cap-fit',cap,roof,0,7,1.1);
  // Retain the legacy .1m visual paving and ground-level movement semantics.
  // It is not promoted to a new raised physical platform in this scope.
  const slab=box('retained-visual-paving',kit.lib.material('stone_slab'),6.6,.1,3.3,0,.05,0,kit.lib.tileSize('stone_slab'));slab.userData.retainedVisualPaving=true;
  frame.updateWorldMatrix(true,true);
  for(const m of frame.children){if(m.userData.retainedVisualPaving)continue;const g=own();try{g.copy(m.geometry);g.applyMatrix4(m.matrixWorld);const shape=triangleInstance(createTriangleTemplate(g),[0,0,0],m.name),b=shape.box.clone();b.triangleSupport=shape;b.zhenshunMesh=m.name;contacts.push(b)}finally{g.dispose();geometries.splice(geometries.indexOf(g),1)}}
 }catch(error){for(const g of geometries)g.dispose();for(const m of materials)m.dispose();throw error}
 const geometry={id:ID,objectId:'FC-FFF2A55955',name:NAME,scope:'SINGLE_GLAZED_WALL_GATE_BODY_FIT',gateKind:'single-wall-gate',portalCount:1,clearWidth:3.6,width:6.4,depth:2.8,x:item.x,z:item.z,rot:0,wholeObjectAccepted:false,surveyed:false,currentAdmissionVerified:false,source:'https://www.dpm.org.cn/building/talk/224072.html',photograph:'https://img.dpm.org.cn/Uploads/pdf/1948/T00006_00.pdf',photoPage:6,supported:['Single glazed wall-gate tower below the palace wall','Own labelled old photograph: one opening, profiled stone bases and framed piers'],fitted:['Original coordinates and retained 3.6m clear opening/6.4m wall gap','Plain green/red/yellow palette; old photograph is monochrome','Simplified low hipped canopy, missing roof end detail and hidden rear','Fully-open leaves for game circulation, not actual admission or measured pose'],unknown:['Surveyed dimensions, exact colours, relief carving and complete roof form','Current condition and public access','World/browser/GPU/mobile acceptance'],legacyPaving:'Old .1m visual slab and ground0 movement retained without a new physical step'};
 frame.userData.structure=geometry;frame.userData.gateGeometry=geometry;kit.root.add(frame);kit.colliders.push(...contacts);kit.owned.push(...materials);kit.mapItems.push({kind:'gate',name:NAME,x:item.x,z:item.z,w:6.4,d:2.8});done.add(kit);return{frame,geometry,width:6.4,contacts,materials};
}
function hip(g,w,d,h){const x=w/2,z=d/2,r=Math.max(.25,x-z),v=[[-x,0,-z],[x,0,-z],[x,0,z],[-x,0,z],[-r,h,0],[r,h,0]],faces=[[0,4,5],[0,5,1],[1,5,2],[2,5,4],[2,4,3],[3,4,0],[0,1,2],[0,2,3]],p=[],uv=[];for(const f of faces)for(const i of f){p.push(...v[i]);uv.push(v[i][0],v[i][2])}g.setAttribute('position',new T.Float32BufferAttribute(p,3));g.setAttribute('uv',new T.Float32BufferAttribute(uv,2));g.computeVertexNormals();return g}
function boxPayload(width,height,depth){
 const position=[],normal=[],uv=[],index=[],groups=[];
 const planes=[['z','y','x',-1,-1,depth,height,width],['z','y','x',1,-1,depth,height,-width],['x','z','y',1,1,width,depth,height],['x','z','y',1,-1,width,depth,-height],['x','y','z',1,-1,width,height,depth],['x','y','z',-1,-1,width,height,-depth]];
 for(const [face,[u,v,w,udir,vdir,pw,ph,pd]] of planes.entries()){
  for(let iy=0;iy<2;iy++)for(let ix=0;ix<2;ix++){const p={x:0,y:0,z:0},n={x:0,y:0,z:0};p[u]=(ix*pw-pw/2)*udir;p[v]=(iy*ph-ph/2)*vdir;p[w]=pd/2;n[w]=pd>0?1:-1;position.push(p.x,p.y,p.z);normal.push(n.x,n.y,n.z);uv.push(ix,1-iy);}
  const a=face*4;index.push(a,a+2,a+1,a+2,a+3,a+1);groups.push({start:face*6,count:6,materialIndex:face});
 }
 return{position:new Float32Array(position),normal:new Float32Array(normal),uv:new Float32Array(uv),index:new Uint16Array(index),groups};
}
