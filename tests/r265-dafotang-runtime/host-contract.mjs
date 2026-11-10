// Independent compact CPU observations; no host construction on import.
import assert from 'node:assert/strict';
import {createHash} from 'node:crypto';
import fs from 'node:fs';
import * as T from 'three';
const f32=Math.fround;
const digest=()=>createHash('sha256');
const finish=h=>h.digest('hex');
const bytes=a=>Buffer.from(a.buffer,a.byteOffset,a.byteLength);
function feed(h,values){const a=new Float32Array(values);h.update(bytes(a));}
function indexCount(g){return g.index?.count??g.attributes.position.count;}
function indexAt(g,i){return g.index?g.index.getX(i):i;}
function transformedVertex(mesh,index,matrix,normalMatrix,hasNormal,hasUV,plaqueUV){
 const g=mesh.geometry,p=g.attributes.position,n=g.attributes.normal,uv=g.attributes.uv;
 const pos=new T.Vector3().fromBufferAttribute(p,index).applyMatrix4(matrix).toArray().map(f32);
 let norm=null;if(hasNormal&&n)norm=new T.Vector3().fromBufferAttribute(n,index).applyNormalMatrix(normalMatrix).toArray().map(f32);
 let tex=null;if(hasUV){tex=uv?[uv.getX(index),uv.getY(index)]:[0,0];if(plaqueUV)tex=[f32(tex[0]*96/2048),f32(tex[1])];tex=tex.map(f32);}
 return {pos,norm,tex};
}
function meshTriangles(mesh,matrix,hasNormal,hasUV,plaqueUV,each){
 const g=mesh.geometry,p=g.attributes.position;assert.ok(p&&p.itemSize===3);const count=indexCount(g);assert.equal(count%3,0);
 const normalMatrix=new T.Matrix3().getNormalMatrix(matrix),reverse=matrix.determinant()<0;
 for(let i=0;i<count;i+=3){
  let v=[0,1,2].map(k=>transformedVertex(mesh,indexAt(g,i+k),matrix,normalMatrix,hasNormal,hasUV,plaqueUV));
  if(reverse)[v[1],v[2]]=[v[2],v[1]];
  if(hasNormal&&!g.attributes.normal){
   // Production computes normals after transformation and Float32 rounding.
   const a=new T.Vector3(...v[0].pos),b=new T.Vector3(...v[1].pos),c=new T.Vector3(...v[2].pos);
   const face=new T.Vector3().subVectors(c,b).cross(new T.Vector3().subVectors(a,b)).toArray().map(f32);
   const norm=new T.Vector3(...face).normalize().toArray().map(f32);for(const q of v)q.norm=norm;
  }
  each(v);
 }
}
function streamTriangle(h,v){for(const q of v){feed(h,q.pos);if(q.norm)feed(h,q.norm);if(q.tex)feed(h,q.tex);}}
function triangleKey(v){const h=digest();streamTriangle(h,v);return finish(h);}
function countKey(map,key){map.set(key,(map.get(key)??0)+1);}
function sortedCounts(map){return [...map.entries()].sort((a,b)=>a[0].localeCompare(b[0]));}
export function captureMergeExpectation(host){
 const {root,plaques=[]}=host.kit;root.updateMatrixWorld(true);const inverse=new T.Matrix4().copy(root.matrixWorld).invert(),buckets=new Map(),keep=[];
 const plaqueMeshes=new Set(plaques.map(p=>p.mesh));
 if(plaques.length){assert.equal(plaques.length,1,'fixed one-plaque host');assert.notEqual(plaques[0].layout,'horizontal');assert.equal(plaques[0].text,'大佛堂');}
 root.traverse(m=>{
  if(m===root)return;
  if(!m.isMesh||m.isInstancedMesh||m.userData.noMerge||Array.isArray(m.material)){
   if((m.isInstancedMesh||m.userData.noMerge||m.isPoints||m.isLine||m.isSprite)&&m.parent)keep.push(m);return;
  }
  const plaque=plaqueMeshes.has(m);assert.ok(m.material||plaque,'unexpected missing material');
  const key=plaque?'deferred-kit-plaques':m.material;
  if(!buckets.has(key))buckets.set(key,{key,meshes:[],hasNormal:false,hasUV:false});
  const b=buckets.get(key);b.meshes.push({m,plaque,matrix:new T.Matrix4().multiplyMatrices(inverse,m.matrixWorld)});b.hasNormal ||= !!m.geometry.attributes.normal;b.hasUV ||= !!m.geometry.attributes.uv;
 });
 for(const b of buckets.values()){
  const h=digest();b.triangles=0;b.beamStart=null;b.beamCount=0;const beam=new Map();
  for(const {m,plaque,matrix} of b.meshes){const isBeam=m.userData.dafotangLayoutRole==='lower-front-entablature';if(isBeam){assert.equal(b.beamStart,null,'unique beam');b.beamStart=b.triangles;}
   meshTriangles(m,matrix,b.hasNormal,b.hasUV,plaque,v=>{streamTriangle(h,v);b.triangles++;if(isBeam){b.beamCount++;countKey(beam,triangleKey(v));}});
  }
  b.hash=finish(h);b.beam=sortedCounts(beam);delete b.meshes;
 }
 return {buckets:[...buckets.values()],keep};
}
function readMergedTriangles(g,hasNormal,hasUV,each){
 assert.equal(g.index,null,'production merged geometry is non-indexed');
 const names=['position',...(hasNormal?['normal']:[]),...(hasUV?['uv']:[])];
 for(const name of names){const a=g.attributes[name];assert.ok(a&&!a.isInterleavedBufferAttribute&&a.array instanceof Float32Array&&!a.normalized,'exact Float32 merged '+name);}
 const p=g.attributes.position,n=g.attributes.normal,uv=g.attributes.uv;
 for(let i=0;i<p.count;i+=3){const v=[0,1,2].map(k=>{const j=i+k;return {pos:[p.getX(j),p.getY(j),p.getZ(j)],norm:hasNormal?[n.getX(j),n.getY(j),n.getZ(j)]:null,tex:hasUV?[uv.getX(j),uv.getY(j)]:null};});each(v);}
}
export function assertMerged(merged,expected){
 const meshes=merged.children.filter(x=>x.isMesh&&!expected.keep.includes(x));assert.equal(meshes.length,expected.buckets.length,'complete material buckets');
 for(let i=0;i<expected.buckets.length;i++){
  const b=expected.buckets[i],m=meshes[i];assert.ok(m,'missing bucket');
  if(b.key==='deferred-kit-plaques')assert.equal(m.material.name,'kit_plaques');else assert.equal(m.material,b.key,'exact shared bucket material');
  const g=m.geometry;assert.equal(g.drawRange.start,0);assert.equal(g.drawRange.count,Infinity);assert.equal(indexCount(g),b.triangles*3,'triangle multiplicity');assert.equal(!!g.attributes.normal,b.hasNormal);assert.equal(!!g.attributes.uv,b.hasUV);
  const h=digest(),beam=new Map();let n=0;
  readMergedTriangles(g,b.hasNormal,b.hasUV,v=>{streamTriangle(h,v);if(b.beamStart!==null&&n>=b.beamStart&&n<b.beamStart+b.beamCount)countKey(beam,triangleKey(v));n++;});
  assert.equal(finish(h),b.hash,'oriented position/normal/UV stream');assert.deepEqual(sortedCounts(beam),b.beam,'beam triangle multiplicity');
 }
 for(const owner of expected.keep)assert.equal(merged.children.filter(x=>x===owner).length,1,'exact noMerge owner retained');
 return true;
}

export function assertOwnerRows(current,baseline){
 assert.equal(current.length,baseline.length,'owner count');let beam=0;
 for(let i=0;i<current.length;i++){
  const a=current[i],b=baseline[i];
  if(a.role==='lower-front-entablature'){
   beam++;assert.equal(b.role,a.role,'same beam owner');
   const {geometry:ag,...ap}=a,{geometry:bg,...bp}=b;
   assert.notDeepEqual(ag,bg,'beam geometry must differ');assert.deepEqual(ap,bp,'beam owner properties');
  }else assert.deepEqual(a,b,'unchanged owner '+i);
 }
 assert.equal(beam,1,'exactly one beam owner');return true;
}

const boxValue=b=>b?[b.min.toArray(),b.max.toArray()]:null;
function hashBytes(a){return createHash('sha256').update(bytes(a)).digest('hex');}
function attributeValue(a){assert.ok(a&&!a.isInterleavedBufferAttribute&&a.array,'ordinary buffer attributes required');return {type:a.array.constructor.name,itemSize:a.itemSize,normalized:a.normalized,count:a.count,usage:a.usage,sha256:hashBytes(a.array)};}
function geometrySnapshot(g,matrixWorld){
 const p=g.attributes.position;assert.ok(p,'mesh positions');const actual=new T.Box3().setFromBufferAttribute(p);assert.ok(!actual.isEmpty());
 if(g.boundingBox)assert.deepEqual(boxValue(g.boundingBox),boxValue(actual),'valid cached box');
 if(g.boundingSphere!==null){assert.ok(g.boundingSphere instanceof T.Sphere,'valid cached sphere type');const center=actual.getCenter(new T.Vector3());let r2=0;for(let i=0;i<p.count;i++)r2=Math.max(r2,center.distanceToSquared(new T.Vector3().fromBufferAttribute(p,i)));assert.deepEqual(g.boundingSphere.center.toArray(),center.toArray());assert.equal(g.boundingSphere.radius,Math.sqrt(r2));}
 return {attributes:Object.fromEntries(Object.keys(g.attributes).sort().map(k=>[k,attributeValue(g.attributes[k])])),index:g.index?attributeValue(g.index):null,
  groups:g.groups.map(x=>({...x})),drawRange:{start:g.drawRange.start,count:String(g.drawRange.count)},morphTargetsRelative:g.morphTargetsRelative,
  morphAttributes:Object.fromEntries(Object.keys(g.morphAttributes).sort().map(k=>[k,g.morphAttributes[k].map(attributeValue)])),storedBounds:boxValue(g.boundingBox),
  sphere:g.boundingSphere?{center:g.boundingSphere.center.toArray(),radius:g.boundingSphere.radius}:null,bounds:boxValue(actual),worldBounds:boxValue(actual.clone().applyMatrix4(matrixWorld))};
}
function supportSnapshot(mesh,contact){
 const g=mesh.geometry,p=g.attributes.position,s=contact?.triangleSupport;assert.ok(s?.template&&s.offset,'actual triangle support required');
 assert.equal(contact.dafotangLayoutMesh,mesh.uuid,'contact references exact owner');assert.equal(contact.dafotangLayoutRole,mesh.userData.dafotangLayoutRole);assert.equal(s.id,mesh.name+'/'+mesh.uuid);
 const e=mesh.matrixWorld.elements;assert.deepEqual([e[0],e[1],e[2],e[4],e[5],e[6],e[8],e[9],e[10]],[1,0,0,0,1,0,0,0,1],'support transform is translation only');
 assert.deepEqual(s.offset.toArray(),[e[12],e[13],e[14]],'support offset equals owner translation');assert.equal(s.template.triangles.length,indexCount(g)/3);
 const hash=digest(),bounds=new T.Box3();
 for(let i=0;i<indexCount(g);i+=3){
  const vertices=[0,1,2].map(k=>new T.Vector3().fromBufferAttribute(p,indexAt(g,i+k)));const t=new T.Triangle(...vertices),row=s.template.triangles[i/3];assert.ok(t.getArea()>1e-12);
  for(let k=0;k<3;k++)assert.deepEqual(row.triangle[['a','b','c'][k]].toArray(),vertices[k].toArray(),'actual support vertex');
  assert.deepEqual(row.normal.toArray(),t.getNormal(new T.Vector3()).toArray(),'actual support normal');const b=new T.Box3().setFromPoints(vertices);assert.deepEqual(boxValue(row.box),boxValue(b),'actual triangle box');bounds.union(b);
  for(const v of vertices)feed(hash,v.toArray());feed(hash,row.normal.toArray());feed(hash,[...b.min.toArray(),...b.max.toArray()]);
 }
 assert.deepEqual(boxValue(s.template.bounds),boxValue(bounds));const world=bounds.clone().translate(s.offset);assert.deepEqual(boxValue(s.box),boxValue(world));assert.deepEqual(boxValue(contact),boxValue(world));
 return {triangles:s.template.triangles.length,sha256:finish(hash),offset:s.offset.toArray(),box:boxValue(world)};
}
function completeSupportDigest(s){
 assert.ok(s?.template?.triangles&&s.template.bounds&&s.offset&&s.box,'complete support required');const h=digest(),buffer=Buffer.allocUnsafe(8);
 const add=n=>{assert.ok(Number.isFinite(n),'finite support numeric value');buffer.writeDoubleLE(n);h.update(buffer);};
 const vec=v=>{assert.ok(v);add(v.x);add(v.y);add(v.z);};const box=b=>{assert.ok(b);vec(b.min);vec(b.max);};
 vec(s.offset);box(s.box);box(s.template.bounds);add(s.template.triangles.length);
 for(const row of s.template.triangles){vec(row.triangle.a);vec(row.triangle.b);vec(row.triangle.c);vec(row.normal);box(row.box);}
 return finish(h);
}
export function snapshotHost(host){
 const {kit,g}=host,root=kit.root;root.updateMatrixWorld(true);const objects=[],objectIds=new Map(),uuidIds=new Map(),materials=[],materialIds=new Map(),textures=[],textureIds=new Map();
 function walk(o,path){objectIds.set(o,path);uuidIds.set(o.uuid,path);objects.push([o,path]);o.children.forEach((v,i)=>walk(v,path+'/'+i));}walk(root,'0');
 function textureId(t){if(!textureIds.has(t)){const id='texture-'+textureIds.size;textureIds.set(t,id);uuidIds.set(t.uuid,id);textures.push(t);}return textureIds.get(t);}
 function materialId(m){if(!materialIds.has(m)){const id='material-'+materialIds.size;materialIds.set(m,id);uuidIds.set(m.uuid,id);materials.push(m);}return materialIds.get(m);}
 for(const [o] of objects)if(o.material){for(const m of Array.isArray(o.material)?o.material:[o.material])if(m)materialId(m);}
 for(const m of kit.owned??[])materialId(m);
 for(const m of materials)for(const value of Object.values(m))if(value?.isTexture)textureId(value);
 for(const t of kit.ownedTextures??[])textureId(t);
 const normalizeString=s=>s.replace(/[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}/gi,id=>uuidIds.get(id)??id);
 function canonical(value,seen=new Map(),where='$'){
  if(value===null||value===undefined||typeof value==='boolean'||typeof value==='string')return typeof value==='string'?normalizeString(value):value??null;
  if(typeof value==='number')return Number.isFinite(value)?value:String(value);
  if(typeof value==='function')return '[function]';
  if(objectIds.has(value))return {object:objectIds.get(value)};if(materialIds.has(value))return {material:materialIds.get(value)};if(textureIds.has(value))return {texture:textureIds.get(value)};
  if(value.isVector2||value.isVector3||value.isVector4||value.isQuaternion||value.isEuler||value.isMatrix3||value.isMatrix4||value.isColor)return value.toArray();
  if(value.isBox3)return boxValue(value);if(ArrayBuffer.isView(value))return {type:value.constructor.name,length:value.length,sha256:hashBytes(value)};
  if(seen.has(value))return {reference:seen.get(value)};seen.set(value,where);
  if(Array.isArray(value))return value.map((x,i)=>canonical(x,seen,where+'/'+i));
  const result={};for(const key of Object.keys(value).sort()){if(key==='lowerFrontEntablatureProfile')continue;result[key]=canonical(value[key],seen,where+'/'+key);}return result;
 }
 const textureRows=textures.map(t=>{const props={};for(const key of ['name','mapping','channel','wrapS','wrapT','magFilter','minFilter','anisotropy','format','type','colorSpace','flipY','generateMipmaps','premultiplyAlpha','unpackAlignment','rotation','matrixAutoUpdate','offset','repeat','center','matrix'])props[key]=canonical(t[key]);const image=t.image;props.imageDimensions=image?[image.width??image.naturalWidth??null,image.height??image.naturalHeight??null]:null;return props;});
 const materialRows=materials.map(m=>{const result={};for(const key of Object.keys(m).sort()){if(['uuid','id','version','_listeners'].includes(key))continue;result[key]=canonical(m[key]);}return result;});
 const rows=objects.map(([o,path])=>{const row={path,type:o.type,name:o.name,role:o.userData?.dafotangLayoutRole??null,visible:o.visible,castShadow:o.castShadow,receiveShadow:o.receiveShadow,frustumCulled:o.frustumCulled,renderOrder:o.renderOrder,layers:o.layers.mask,matrix:o.matrix.toArray(),matrixWorld:o.matrixWorld.toArray(),matrixAutoUpdate:o.matrixAutoUpdate,matrixWorldAutoUpdate:o.matrixWorldAutoUpdate,userData:canonical(o.userData)};
  if(o.isMesh){row.material=Array.isArray(o.material)?o.material.map(materialId):o.material?materialId(o.material):null;row.geometry=geometrySnapshot(o.geometry,o.matrixWorld);}return row;});
 const layoutObject=objects.filter(([o])=>o.name===g.historicLayout?.id).map(([o])=>o);assert.equal(layoutObject.length,1,'unique layout group');const layout=layoutObject[0].children.map(m=>{assert.ok(m.isMesh);const matches=kit.colliders.filter(c=>c.dafotangLayoutMesh===m.uuid);assert.equal(matches.length,1,'one exact layout contact');return {path:objectIds.get(m),role:m.userData.dafotangLayoutRole,support:supportSnapshot(m,matches[0])};});
 const colliders=kit.colliders.map(c=>{const plain={};for(const k of Object.keys(c).sort())if(!['min','max','triangleSupport'].includes(k))plain[k]=canonical(c[k]);return {box:boxValue(c),properties:plain,support:c.triangleSupport?{id:canonical(c.triangleSupport.id),offset:c.triangleSupport.offset.toArray(),box:boxValue(c.triangleSupport.box),count:c.triangleSupport.template.triangles.length,sha256:completeSupportDigest(c.triangleSupport)}:null};});
 const snapshot={owners:rows,layout,colliders,materials:materialRows,textures:textureRows,owned:(kit.owned??[]).map(materialId),ownedTextures:(kit.ownedTextures??[]).map(textureId),walkables:canonical(kit.walkables),rooms:canonical(kit.rooms),mapItems:canonical(kit.mapItems),regions:canonical(kit.regions),metadata:canonical(g),beamProfile:g.historicLayout?.lowerFrontEntablatureProfile??null};
 assert.ok(Buffer.byteLength(JSON.stringify(snapshot))<=8*1024*1024,'host receipt limit');return snapshot;
}

export function assertBeamGeometry(actual,expected){
 if(actual.storedBounds!==null)assert.deepEqual(actual.storedBounds,actual.bounds,'live cached bounds must be valid');
 const pick=x=>({attributes:x.attributes,index:x.index,groups:x.groups,drawRange:x.drawRange,morphAttributes:x.morphAttributes,morphTargetsRelative:x.morphTargetsRelative,bounds:x.bounds});
 assert.deepEqual(pick(actual),pick(expected),'exact reviewed beam geometry bytes');
}
export function assertSameStage(current,baseline){
 const contract=JSON.parse(fs.readFileSync(new URL('../r265-dafotang-frieze/fixtures/beam-contract.json',import.meta.url),'utf8'));
 assert.equal(current.layout.length,85);assert.equal(baseline.layout.length,85);
 assert.deepEqual(current.layout.map(x=>x.role),contract.orderedRoles);assert.deepEqual(baseline.layout.map(x=>x.role),contract.orderedRoles);
 assertOwnerRows(current.owners,baseline.owners);
 const cBeam=current.layout.find(x=>x.role==='lower-front-entablature'),bBeam=baseline.layout.find(x=>x.role==='lower-front-entablature');
 assert.equal(cBeam.path,bBeam.path);assert.equal(cBeam.support.triangles,1620);assert.equal(bBeam.support.triangles,12);
 const owner=(s,p)=>{const v=s.owners.filter(x=>x.path===p);assert.equal(v.length,1);return v[0];};
 assertBeamGeometry(owner(current,cBeam.path).geometry,contract.current);assertBeamGeometry(owner(baseline,bBeam.path).geometry,contract.baseline);
 for(let i=0;i<85;i++)if(current.layout[i].path!==cBeam.path)assert.deepEqual(current.layout[i],baseline.layout[i],'unchanged layout owner/contact '+i);
 assert.equal(current.colliders.length,baseline.colliders.length);let beamContacts=0;
 for(let i=0;i<current.colliders.length;i++){
  const a=current.colliders[i],b=baseline.colliders[i];
  if(a.properties.dafotangLayoutMesh===cBeam.path){beamContacts++;assert.equal(b.properties.dafotangLayoutMesh,bBeam.path);assert.deepEqual(a.properties,b.properties);assert.equal(a.support.count,1620);assert.equal(b.support.count,12);}
  else assert.deepEqual(a,b,'unchanged collider '+i);
 }
 assert.equal(beamContacts,1);for(const k of ['materials','textures','owned','ownedTextures','walkables','rooms','mapItems','regions','metadata'])assert.deepEqual(current[k],baseline[k],'same-stage '+k);
 assert.deepEqual(current.beamProfile,{endTreatment:'PLAIN_MODEL_RETURNS_NOT_SOURCE_CARVING',columnInset:.08,narrowBays:'UNCHANGED_PLAIN',dimensionStatus:'MODEL_FIT_NOT_SURVEY'});assert.equal(baseline.beamProfile,null);
 const replaced=[];for(const role of ['guardian-pedestal-foot','guardian-pedestal-waist','guardian-pedestal-top']){
  const candidates=current.layout.filter(x=>x.role===role&&owner(current,x.path).geometry.bounds[0][0]<0);assert.equal(candidates.length,1,'one post-Weituo east '+role);
  const row=candidates[0],prior=baseline.layout.find(x=>x.path===row.path);assert.deepEqual(row,prior);replaced.push({role,path:row.path,geometry:owner(current,row.path).geometry,contact:row.support});
 }
 return {owners:current.owners.length,layoutOwners:85,beamCurrentTriangles:1620,beamBaselineTriangles:12,eastReplacedPedestals:replaced};
}
