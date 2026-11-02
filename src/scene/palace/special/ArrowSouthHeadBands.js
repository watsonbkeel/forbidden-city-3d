import * as THREE from 'three';

const ROLE='arrow-south-head-painted-face',KEY='arrowSouthHeadBands';
const SOURCE='https://img.dpm.org.cn/Uploads/Picture/2020/04/20/s5e9d4c87b554a.jpg';
const HASH='e7f98442e7236e082d9713e9572d3576c3148314c07cdbd1135304c5309c6225';
const fail=s=>{throw Error('Arrow south head '+s);};
const near=(a,b)=>Number.isFinite(a)&&Math.abs(a-b)<1e-6;
const at=(m,x,y,z)=>near(m.position.x,x)&&near(m.position.y,y)&&near(m.position.z,z)&&m.rotation.x===0&&m.rotation.y===0&&m.rotation.z===0&&m.scale.toArray().every(v=>v===1);
const definitions=[
 {x:-5.5,y:6.95,z:-6.8,w:5.5,h:2.9,d:.24,role:'arrow-facade-head'},
 {x:0,y:6.95,z:-6.8,w:5.5,h:2.9,d:.24,role:'arrow-facade-head'},
 {x:5.5,y:6.95,z:-6.8,w:5.5,h:2.9,d:.24,role:'arrow-facade-head'},
 {x:0,y:8.7,z:-8.8,w:32,h:.4,d:.35,role:'arrow-frame-beam'},
];

function availableMarker(object){
 if(!object||!Object.isExtensible(object))fail('requires extensible metadata');
 for(let p=object;p;p=Object.getPrototypeOf(p)){
  const d=Object.getOwnPropertyDescriptor(p,KEY);
  if(d)fail(p===object&&'value'in d?'already installed':'requires absent metadata key without inherited accessors');
 }
}
function writable(object,key){const d=Object.getOwnPropertyDescriptor(object,key);if(!d||!('value'in d)||!d.writable)fail('requires writable '+key);}
function buffers(g){return [g.index,...Object.values(g.attributes??{}),...Object.values(g.morphAttributes??{}).flat()].filter(Boolean).map(a=>(a.isInterleavedBufferAttribute?a.data.array:a.array)?.buffer).filter(Boolean);}
function disposeAll(resources){const errors=[];for(const r of new Set(resources.filter(Boolean)))try{r.dispose();}catch(e){errors.push(e);}return errors;}
function discard(resources,error){const errors=disposeAll(resources);if(errors.length)throw new AggregateError([error,...errors],error.message,{cause:error});throw error;}

// Guard actual vertices, normals, winding, face topology and original UVs, not
// only mutable BoxGeometry.parameters or a role label. No GPU allocation here.
function sourceRows(mesh,p){
 const g=mesh.geometry,a=g?.attributes,idx=g?.index;
 if(!g||g.type!=='BoxGeometry'||!idx||idx.count!==36||a?.position?.count!==24||
  Object.keys(a).sort().join()!=='normal,position,uv'||Object.values(a).some(v=>v.isInterleavedBufferAttribute||v.normalized)||
  Object.keys(g.morphAttributes).length||g.drawRange.start!==0||(g.drawRange.count!==Infinity&&g.drawRange.count!==36)||
  !near(g.parameters.width,p.w)||!near(g.parameters.height,p.h)||!near(g.parameters.depth,p.d))fail('requires exact source box topology');
 const rows=[],faceCounts=new Map(),half=[p.w/2,p.h/2,p.d/2];
 for(let i=0;i<36;i+=3){
  const ids=[0,1,2].map(k=>idx.getX(i+k));
  if(!ids.every(j=>Number.isInteger(j)&&j>=0&&j<24))fail('requires valid source indices');
  const vertices=ids.map(j=>new THREE.Vector3().fromBufferAttribute(a.position,j));
  const normal=new THREE.Vector3().fromBufferAttribute(a.normal,ids[0]);
  const cross=vertices[1].clone().sub(vertices[0]).cross(vertices[2].clone().sub(vertices[0]));
  if(cross.lengthSq()<1e-12||cross.normalize().dot(normal)<.999999)fail('requires source winding');
  const key=normal.toArray().join(),f=faceCounts.get(key)??{count:0,points:new Set()};f.count++;faceCounts.set(key,f);
  const tri={position:[],normal:[],uv:[],south:normal.z<-.999};
  for(const j of ids){
   const v=new THREE.Vector3().fromBufferAttribute(a.position,j),n=new THREE.Vector3().fromBufferAttribute(a.normal,j);
   if(!v.toArray().every((x,k)=>near(Math.abs(x),half[k]))||!n.equals(normal)||!n.toArray().some((x,k)=>near(Math.abs(x),1)&&near(v.getComponent(k)*x,half[k]))||!near(n.length(),1))fail('source vertices or normals changed');
   const u=Math.abs(n.x)>.9?-v.z*Math.sign(n.x)/p.d+.5:v.x*(n.z<-.9?-1:1)/p.w+.5;
   const vv=Math.abs(n.y)>.9?-v.z*Math.sign(n.y)/p.d+.5:v.y/p.h+.5;
   if(!near(a.uv.getX(j),u)||!near(a.uv.getY(j),vv))fail('source UV changed');
   f.points.add(v.toArray().join());
   for(const name of ['position','normal','uv'])tri[name].push(...a[name].array.subarray(j*a[name].itemSize,(j+1)*a[name].itemSize));
  }
  rows.push(tri);
 }
 if(faceCounts.size!==6||[...faceCounts.values()].some(f=>f.count!==2||f.points.size!==4)||rows.filter(r=>r.south).length!==2)fail('source face topology changed');
 return rows;
}
function arrays(){return {position:[],normal:[],uv:[]};}
function append(to,from){for(const k of Object.keys(to))to[k].push(...from[k]);}
function rect(out,x0,x1,y0,y1,z,uv=(x,y)=>[x,y]){
 if(!(x1>x0&&y1>y0))fail('invalid fitted surface rectangle');
 for(const [x,y]of [[x0,y0],[x0,y1],[x1,y1],[x0,y0],[x1,y1],[x1,y0]]){out.position.push(x,y,z);out.normal.push(0,0,-1);out.uv.push(...uv(x,y));}
}
// Disjoint coplanar fields, not a copied motif or a second offset skin.
function framed(grey,blue,x0,x1,y0,y1,z,border,lower=0){
 if(lower){rect(grey,x0,x1,y0,y0+lower,z);y0+=lower;}
 rect(grey,x0,x0+border,y0,y1,z);rect(grey,x1-border,x1,y0,y1,z);
 rect(grey,x0+border,x1-border,y0,y0+border,z);rect(grey,x0+border,x1-border,y1-border,y1,z);
 rect(blue,x0+border,x1-border,y0+border,y1-border,z);
}

/** A south-surface colour/field fit only. The own undated photograph resolves
 * grey-blue head/beam bands over the central and two adjacent bays; trees hide
 * the end bays. Retain their original red, every unseen face, all door lattice,
 * knees, column/roof geometry and ALL physical/navigation registrations.
 *
 * Existing source envelopes are intentionally not resized. Their proportions,
 * plain framed fields and colours are reversible fits, NOT exact caihua art,
 * measured timber dimensions or restored historical pigment. No photo pixels,
 * texture, emissive material, extra relief or collision are introduced.
 */
export function applyArrowSouthHeadBands(kit,frame,item){
 const expected={name:'箭亭',kind:'hall',structure:'enclosed-pavilion',enclosureProfile:'arrow-enclosed-gallery-fit-v1',x:-154.7,z:78.8,w:31.5,d:17.6,colH:8,ph:.9,pad:1,bays:5,roof:'xieshan',enter:true,open:false};
 if(!item||Object.entries(expected).some(([k,v])=>item[k]!==v)||(item.rot!==undefined&&item.rot!==0))fail('requires exact retained identity');
 if(!frame?.isGroup||!kit?.root?.isGroup||frame.parent!==kit.root||!at(frame,item.x,0,item.z)||!at(kit.root,0,0,0)||!Array.isArray(kit.owned))fail('requires exact untransformed host');
 if(frame.userData.structure?.id!=='outer-east/arrow-enclosed'||frame.userData.structure?.profile!=='arrow-enclosed-gallery-fit-v1')fail('requires completed source host');
 availableMarker(frame.userData);availableMarker(frame.userData.structure);
 if(!Object.isExtensible(frame.children)||!Object.isExtensible(kit.owned))fail('requires mutable registration arrays');
 if(frame.children.filter(m=>m.userData.role==='arrow-south-central-knee').length!==2||frame.children.filter(m=>m.userData.role==='arrow-south-secondary-diagonal-lattice').length!==8||!frame.userData.arrowCentralNameboardRemoval)fail('requires retained reviewed south detail');
 const sources=definitions.map(p=>{
  const found=frame.children.filter(m=>m.isMesh&&m.userData.role===p.role&&at(m,p.x,p.y,p.z));
  if(found.length!==1)fail('requires unique source '+p.role);
  const m=found[0];writable(m,'geometry');
  if(m.isInstancedMesh||m.isSkinnedMesh||m.children.length||!m.visible||!m.castShadow||!m.receiveShadow||m.material?.name!=='arrow_red_fit'||m.material.color?.getHex()!==0x933f32||m.material.map||m.material.transparent)fail('requires retained source appearance');
  return {mesh:m,geometry:m.geometry,p,rows:sourceRows(m,p)};
 });
 for(const s of sources){const sourceBuffers=new Set(buffers(s.geometry));kit.root.traverse(o=>{if(o!==s.mesh&&o.geometry&&(o.geometry===s.geometry||buffers(o.geometry).some(b=>sourceBuffers.has(b))))fail('source geometry or attribute buffer is shared');});}
 const result={entityId:'FC-AF36D75128',source:SOURCE,sourceSha256:HASH,photographyDate:null,visualAcceptance:'VERIFY_PENDING',wholeObjectAccepted:false,
  scope:'CENTRAL_THREE_SOUTH_HEAD_FACES_AND_MATCHING_SOUTH_OUTER_BEAM_ONLY',sourceFaceCount:4,retainedOuterBays:true,
  dimensionStatus:'RETAINED_ENVELOPE_PLAIN_FIELD_PHOTO_FIT_NOT_SURVEYED',ornament:'PLAIN_GREY_BLUE_FIELDS_NOT_LITERAL_CAIHUA_MOTIFS',physics:'ALL_REGISTRATIONS_UNCHANGED'};
 const geometries=[],materials=[],replacements=[],members=[],grey=arrays(),blue=arrays();
 const makeGeometry=data=>{const g=new THREE.BufferGeometry();geometries.push(g);for(const [name,values]of Object.entries(data))g.setAttribute(name,new THREE.Float32BufferAttribute(values,name==='uv'?2:3));g.computeBoundingBox();g.computeBoundingSphere();return g;};
 try{
  for(const s of sources){
   const data=arrays();for(const row of s.rows)if(!row.south)append(data,row);
   if(s.p.role==='arrow-frame-beam'){
    const uv=(x,y)=>[-x/32+.5,y/.4+.5];
    rect(data,-16,-8.25,-.2,.2,-.175,uv);rect(data,8.25,16,-.2,.2,-.175,uv);
    for(const x of[-5.5,0,5.5])framed(grey,blue,x-2.75,x+2.75,8.5,8.9,-8.975,.05);
   }else framed(grey,blue,s.p.x-2.75,s.p.x+2.75,5.5,8.4,-6.92,.16,1.1);
   replacements.push(makeGeometry(data));
  }
  for(const [data,name,color]of[[grey,'arrow_south_head_grey_blue_fit',0x899596],[blue,'arrow_south_head_deep_blue_fit',0x4d6680]]){
   const geometry=makeGeometry(data),material=new THREE.MeshStandardMaterial({name,color,roughness:.88,metalness:0});materials.push(material);
   const m=new THREE.Mesh(geometry,material);m.name=ROLE;m.castShadow=m.receiveShadow=true;m.userData={...result,role:ROLE,field:name};members.push(m);
  }
 }catch(error){discard([...geometries,...materials],error);}
 const children=frame.children,oldChildren=[...children],owned=kit.owned,oldOwned=[...owned];
 try{
  kit.owned.push(...materials);frame.add(...members);
  for(let i=0;i<sources.length;i++)sources[i].mesh.geometry=replacements[i];
  frame.userData[KEY]=result;frame.userData.structure[KEY]=result;
 }catch(error){
  for(const m of members){if(m.parent){const a=m.parent.children,i=a.indexOf(m);if(i!==-1)Array.prototype.splice.call(a,i,1);}m.parent=null;}
  for(const m of oldChildren)m.parent=frame;frame.children=children;Array.prototype.splice.call(children,0,children.length,...oldChildren);
  kit.owned=owned;Array.prototype.splice.call(owned,0,owned.length,...oldOwned);
  for(const s of sources)s.mesh.geometry=s.geometry;
  delete frame.userData[KEY];delete frame.userData.structure[KEY];
  discard([...geometries,...materials],error);
 }
 const errors=disposeAll(sources.map(s=>s.geometry));
 if(errors.length){const error=new AggregateError(errors,'Arrow south head committed; retired geometry cleanup failed',{cause:errors[0]});Object.assign(error,{committed:true,cleanupPhase:'RETIRED_GEOMETRY_AFTER_COMMIT',result});throw error;}
 return result;
}

// Run once at the zone's normal pre-merge finalization boundary, not inside
// the historical pavilion constructor. Unrelated zones have no work here.
export function finishArrowSouthHeadBands(kit,zoneJson){
 if(zoneJson?.id!=='outer-east')return false;
 if(!Array.isArray(zoneJson.items))fail('requires real zone declarations');
 const items=zoneJson.items.filter(i=>i?.kind==='hall'&&(i.name==='箭亭'||i.enclosureProfile==='arrow-enclosed-gallery-fit-v1'));
 if(!items.length)return false;
 if(items.length!==1)fail('requires unique Arrow zone declaration');
 if(!kit?.root?.isGroup)fail('requires existing zone kit');
 const frames=kit.root.children.filter(f=>f.userData.structure?.key==='arrow'||f.userData.structure?.id==='outer-east/arrow-enclosed'||f.name==='箭亭·有围护布局局部拟合');
 if(frames.length!==1)fail('requires unique Arrow zone host');
 return applyArrowSouthHeadBands(kit,frames[0],items[0]);
}
