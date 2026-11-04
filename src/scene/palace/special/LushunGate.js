import * as T from 'three';
import {applyBoxUV} from '../../../utils/GeometryUV.js';
import {createTriangleTemplate,triangleInstance} from '../../../utils/TriangleSupport.js';
const NAME='履顺门',ID='place-ningshou-1557e43903',done=new WeakSet();
const SOURCE={kind:'gate',name:NAME,x:-233.4,z:255,rot:'west'};
const WALL={kind:'wall',from:[-233.2,118],to:[-233.2,520],h:7,gaps:[{at:135.5,gate:'锡庆门'},{at:255,gate:NAME},{at:304.3,gate:'蹈和门'}]};
const same=(a,b)=>JSON.stringify(a)===JSON.stringify(b),mutable=a=>Array.isArray(a)&&Object.isExtensible(a)&&Object.getOwnPropertyDescriptor(a,'length')?.writable;
function validate(kit,item,c){
 if(c.zoneId!=='ningshou'||c.itemIndex!==4)return false;
 const r=kit?.root,z=c.zoneJson;
 if(!same(item,SOURCE)||z?.id!=='ningshou'||z.items?.[4]!==item||!same(z.items[41],WALL)||z.items.filter(i=>i.name===NAME).length!==1||!r||r.name!=='ningshou'||r.parent||!r.matrixAutoUpdate||!r.matrixWorldAutoUpdate||r.position.lengthSq()||!r.quaternion.equals(new T.Quaternion())||!r.scale.equals(new T.Vector3(1,1,1))||!r.matrix.equals(new T.Matrix4())||!r.matrixWorld.equals(new T.Matrix4())||!mutable(r.children)||['colliders','walkables','mapItems','owned','rooms','regions','plaques'].some(k=>!mutable(kit[k]))||done.has(kit)||r.children.some(f=>f.userData.structure?.id===ID))throw Error('Exact mutable Lushun source and retained west wall required once only');
 return true;
}
/** A limited body fit to the Palace Museum's historical construction account:
 * one west-facing Lushun gate, pale stone Sumeru base, glazed structural
 * members and yellow tile. This is not a current elevation survey.
 * Original passage/ground/map stay. Exact profiles, colours other than
 * yellow roof, roof outline, hidden rear and open game pose are fitted. */
export function buildLushunGate(kit,item,context){
 if(!validate(kit,item,context))return null;
 const frame=new T.Group();frame.name=NAME;frame.position.set(item.x,0,item.z);frame.rotation.y=-Math.PI/2;
 const geometries=[],materials=[],contacts=[];
 const own=()=>{const g=new T.BufferGeometry();geometries.push(g);return g},material=(name,color,roughness)=>{const m=new T.MeshStandardMaterial();materials.push(m);m.setValues({name:'r164_lushun_'+name,color,roughness});return m};
 const mesh=(name,g,m,x,y,z)=>{const q=new T.Mesh(g,m);q.name='lushun/'+name;q.position.set(x,y,z);q.castShadow=q.receiveShadow=true;q.userData.lushunGate=true;frame.add(q);return q};
 const box=(name,m,w,h,d,x,y,z,tileSize)=>{const g=own(),p=boxPayload(w,h,d);
  if(tileSize===undefined){g.setIndex(new T.BufferAttribute(p.index,1));for(const key of['position','normal','uv'])g.setAttribute(key,new T.BufferAttribute(p[key],key==='uv'?2:3));}
  else{for(const key of['position','normal']){const a=new Float32Array(p.index.length*3);for(let i=0;i<p.index.length;i++)for(let j=0;j<3;j++)a[i*3+j]=p[key][p.index[i]*3+j];g.setAttribute(key,new T.BufferAttribute(a,3));}applyBoxUV(g,tileSize);}
  for(const a of p.groups)g.addGroup(a.start,a.count,a.materialIndex);return mesh(name,g,m,x,y,z)};
 try{
  const stone=material('plain_profiled_stone_fit',0xc6c2ae,.9),red=material('red_fields_and_leaves_fit',0x984537,.72),green=material('green_glaze_fit',0x355d4c,.6),gold=material('yellow_glaze_fit',0xb59547,.6),roof=material('roof_tile_glaze_fit',0xb78e32,.6);roof.map=kit.lib.material('roof_tile').map??null;
  for(const s of[-1,1]){
   const x=s*2.5;
   // Five plain profile courses express a Sumeru base without invented relief.
   for(const [label,w,h,d,y]of [
    ['foot',1.4,.18,2.8,.09],['lower-shoulder',1.3,.12,2.7,.24],
    ['waist',1.08,.32,2.5,.46],['upper-shoulder',1.3,.13,2.7,.685],
    ['cap',1.4,.15,2.8,.825]])box('stone-'+label+'/'+s,stone,w,h,d,x,y,0);
   box('glazed-pier/'+s,green,1.4,4.6,2.8,x,3.2,0);
   // Plain recessed-looking fields, not a claim to reproduce the carved motifs.
   for(const z of[-1.42,1.42]){
    box('plain-glaze-field/'+s+'/'+z,red,1.16,3.95,.04,x,3.125,z);
    for(const dx of[-.6,.6])box('field-side/'+s+'/'+z+'/'+dx,gold,.04,4.03,.04,x+dx,3.125,z);
    for(const dy of[-1.995,1.995])box('field-end/'+s+'/'+z+'/'+dy,gold,1.24,.04,.04,x,3.125+dy,z);
   }
   box('open-leaf/'+s,red,.12,4.3,1.75,s*1.88,2.15,2.295);
  }
  box('door-head',green,3.6,1.1,2.8,0,4.95,0);
  // Plain beam and two shallow supporting courses are a structural fit,
  // not the number or carving of the historical bracket clusters.
  box('front-green-band/0',green,6.4,.36,.08,0,4.88,-1.47);
  for(const sign of[-1,1])box('front-band-edge/0/'+sign,gold,6.4,.035,.08,0,4.88+sign*.1975,-1.47);
  box('plain-support-course/lower',green,6.55,.11,3,0,5.555,0);
  box('plain-support-course/upper',gold,6.65,.11,3.15,0,5.665,0);
  // Close only the pre-existing high-wall band behind the lower canopy.
  box('upper-wall-backing',red,6.4,1.5,1,0,6.25,-.2);
  const canopy=own();hip(canopy,6.7,3.3,.7);mesh('low-hip-canopy-fit',canopy,roof,0,5.72,0);
  box('plain-ridge-fit',roof,3.4,.12,.12,0,6.48,0);
  const cap=own();hip(cap,6.4,1.12,.12);mesh('retained-wall-height-cap-fit',cap,roof,0,7,-.2);
  // Retain the legacy .1m visual paving and ground-level movement semantics.
  // It is not promoted to a new raised physical platform in this scope.
  const slab=box('retained-visual-paving',kit.lib.material('stone_slab'),6.6,.1,3.3,0,.05,0,kit.lib.tileSize('stone_slab'));slab.userData.retainedVisualPaving=true;
  frame.updateWorldMatrix(true,true);
  for(const m of frame.children){if(m.userData.retainedVisualPaving)continue;const g=own();try{g.copy(m.geometry);g.applyMatrix4(m.matrixWorld);const shape=triangleInstance(createTriangleTemplate(g),[0,0,0],m.name),b=shape.box.clone();b.triangleSupport=shape;b.lushunMesh=m.name;contacts.push(b)}finally{g.dispose();geometries.splice(geometries.indexOf(g),1)}}
 }catch(error){for(const g of geometries)g.dispose();for(const m of materials)m.dispose();throw error}
 const geometry={id:ID,objectId:'FC-1557E43903',name:NAME,scope:'HISTORICAL_SOURCE_SINGLE_GATE_BODY_FIT',gateKind:'single-wall-gate',portalCount:1,clearWidth:3.6,width:6.4,depth:2.8,x:item.x,z:item.z,rot:-Math.PI/2,wholeObjectAccepted:false,surveyed:false,currentAdmissionVerified:false,source:'https://www.dpm.org.cn/Uploads/File/2019/12/15/u5df60cf540978.pdf',sourcePages:[125,128],evidenceType:'Official-hosted historical construction account, not a complete present-day elevation',supported:['Named west-facing Lushun gate in NingShou','Pale stone Sumeru base, glazed beams/drop posts/bracket work and yellow roof tiles'],fitted:['Original coordinates, 3.6m passage and 6.4m gap retained','Five-course plain base, canopy outline and plain structural members; not surveyed bracket counts','Glaze colours except historically recorded yellow tiles, hidden rear and fully-open leaves for game circulation'],unknown:['Current complete elevation and exact carving or roof structure','Surveyed scale, hidden rear and current public access','World/browser/GPU/mobile acceptance'],excludedPhoto:'Ambiguously tagged Huitu Lushun image excluded as identity/elevation evidence; no photo bytes or derived texture shipped',nameboard:'No unverified calligraphy or Manchu panel; formal map name retained',legacyPaving:'Old .1m visual slab and ground0 movement retained'};
 frame.userData.structure=geometry;frame.userData.gateGeometry=geometry;kit.root.add(frame);kit.colliders.push(...contacts);kit.owned.push(...materials);kit.mapItems.push({kind:'gate',name:NAME,x:item.x,z:item.z,w:2.8,d:6.4});done.add(kit);return{frame,geometry,width:6.4,contacts,materials};
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
