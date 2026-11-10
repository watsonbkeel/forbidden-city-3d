import {test} from 'node:test';
import assert from 'node:assert/strict';
import fs from 'node:fs';
import {fixture,candidate,beam,sectionFloor} from './fixture.mjs';
const profile=JSON.parse(fs.readFileSync(new URL('./fixtures/profile.json',import.meta.url)));
test('actual lower envelope follows approved central three profiles rather than old straight 4.13',async()=>{
 const f=fixture();try{const out=(await candidate()).buildDafotangHistoricLayout(f.context),g=beam(out).geometry;
  for(const bay of profile.samples.bays)for(const point of bay.points){const actual=sectionFloor(g,point.modelX);assert.ok(Math.abs(actual-point.modelY)<5e-7,`${bay.name} sourceX=${point.sourceX}: actual=${actual}, approved=${point.modelY}`);}
 }finally{f.dispose();f.dispose();}
});
process.on('exit',()=>console.log('RESOURCE_USAGE',JSON.stringify({limits:{oldMiB:128,semiMiB:8,timeoutSeconds:30},usage:process.resourceUsage(),memory:process.memoryUsage()})));

// Tests below compare actual buffers and independently derived geometry. They do
// not infer equivalence from metadata, owner count or one aggregate signature.
import {T,baseline,triangles} from './fixture.mjs';
const near=(a,b,e=5e-7)=>assert.ok(Math.abs(a-b)<=e,`${a} != ${b} (tolerance ${e})`);
const key=v=>v.toArray().join(',');
const report={scope:'COMPONENT_ONLY_NO_HOST_GPU_OR_DEPLOY',preservedOwners:[],supportChecks:[],limits:{nodeOldMiB:128,nodeSemiMiB:8,timeoutSeconds:30}};
function geometryEqual(a,b){
 assert.deepEqual(Object.keys(a.attributes),Object.keys(b.attributes));
 for(const name of Object.keys(a.attributes)){const x=a.attributes[name],y=b.attributes[name];assert.equal(x.itemSize,y.itemSize,name);assert.equal(x.normalized,y.normalized,name);assert.equal(x.array.constructor,y.array.constructor,name);assert.deepEqual(Buffer.from(x.array.buffer,x.array.byteOffset,x.array.byteLength),Buffer.from(y.array.buffer,y.array.byteOffset,y.array.byteLength),name);assert.equal(x.usage,y.usage,name);}
 assert.equal(!!a.index,!!b.index);if(a.index){assert.equal(a.index.array.constructor,b.index.array.constructor);assert.deepEqual(Buffer.from(a.index.array.buffer,a.index.array.byteOffset,a.index.array.byteLength),Buffer.from(b.index.array.buffer,b.index.array.byteOffset,b.index.array.byteLength));}
 assert.deepEqual(a.groups,b.groups);assert.deepEqual(a.drawRange,b.drawRange);assert.deepEqual(a.morphAttributes,b.morphAttributes);assert.equal(a.morphTargetsRelative,b.morphTargetsRelative);
}
function materialValue(m){const v=m.toJSON();delete v.uuid;return v;}
function meshEqual(a,b){geometryEqual(a.geometry,b.geometry);for(const k of['position','quaternion','scale','matrix','matrixWorld'])assert.deepEqual(a[k].toArray(),b[k].toArray(),k);for(const k of['name','visible','castShadow','receiveShadow','frustumCulled','renderOrder','matrixAutoUpdate','matrixWorldAutoUpdate'])assert.equal(a[k],b[k],k);assert.deepEqual(a.userData,b.userData);assert.deepEqual(materialValue(a.material),materialValue(b.material));assert.equal(a.layers.mask,b.layers.mask);}
function supportEqual(a,b){assert.deepEqual(a.box.min.toArray(),b.box.min.toArray());assert.deepEqual(a.box.max.toArray(),b.box.max.toArray());assert.deepEqual(a.offset.toArray(),b.offset.toArray());assert.equal(a.template.triangles.length,b.template.triangles.length);for(let i=0;i<a.template.triangles.length;i++){for(const k of['a','b','c'])assert.deepEqual(a.template.triangles[i].triangle[k].toArray(),b.template.triangles[i].triangle[k].toArray());assert.deepEqual(a.template.triangles[i].normal.toArray(),b.template.triangles[i].normal.toArray());assert.ok(a.template.triangles[i].box.equals(b.template.triangles[i].box));}}

test('one exact closed strip solid, hard outward normals, frozen samples and six returns',async()=>{
 const f=fixture();try{const out=(await candidate()).buildDafotangHistoricLayout(f.context),g=beam(out).geometry,ts=triangles(g),edges=new Map(),faces=new Set(),vertices=new Set();
  for(const a of Object.values(g.attributes))assert.ok([...a.array].every(Number.isFinite));if(g.index)assert.ok([...g.index.array].every(Number.isFinite));
  let volume=0,minArea=Infinity;const faceAdj=Array.from({length:ts.length},()=>[]);
  for(let i=0;i<ts.length;i++){const t=ts[i],vs=[t.a,t.b,t.c],ks=vs.map(key),normal=t.getNormal(new T.Vector3());minArea=Math.min(minArea,t.getArea());assert.ok(t.getArea()>1e-12);volume+=t.a.dot(t.b.clone().cross(t.c))/6;
   const face=ks.slice().sort().join('|');assert.ok(!faces.has(face),'duplicate face');faces.add(face);ks.forEach(k=>vertices.add(k));
   for(let j=0;j<3;j++){const a=ks[j],b=ks[(j+1)%3],k=[a,b].sort().join('|');if(!edges.has(k))edges.set(k,[]);edges.get(k).push({face:i,direction:a<b?1:-1});
    const ni=g.index?g.index.getX(i*3+j):i*3+j,n=new T.Vector3().fromBufferAttribute(g.attributes.normal,ni);assert.ok(n.dot(normal)>.999999,'stored hard normal disagrees with face');}
   if(vs.every(v=>v.z===Math.fround(4.24)))near(normal.z,-1,1e-12);
   else if(vs.every(v=>v.z===Math.fround(4.56)))near(normal.z,1,1e-12);
   else if(vs.every(v=>v.y===Math.fround(4.35)))near(normal.y,1,1e-12);
   else if(vs.every(v=>v.x===3.25))near(normal.x,1,1e-12);
   else if(vs.every(v=>v.x===-3.25))near(normal.x,-1,1e-12);
   else assert.ok(normal.y<0,'lower wall must face outward/down');
  }
  for(const v of edges.values()){assert.equal(v.length,2,'each welded edge exactly two incident faces');assert.equal(v[0].direction+v[1].direction,0,'opposite oriented edge');faceAdj[v[0].face].push(v[1].face);faceAdj[v[1].face].push(v[0].face);}
  const visited=new Set([0]),todo=[0];while(todo.length)for(const j of faceAdj[todo.pop()])if(!visited.has(j)){visited.add(j);todo.push(j);}assert.equal(visited.size,ts.length);assert.equal(vertices.size-edges.size+ts.length,2);assert.ok(volume>0);
  g.computeBoundingBox();const b=g.boundingBox;assert.deepEqual(b.min.toArray(),[-3.25,Math.fround(profile.approval.geometryFloor),Math.fround(4.24)]);assert.deepEqual(b.max.toArray(),[3.25,Math.fround(4.35),Math.fround(4.56)]);assert.ok(b.min.y>=profile.approval.geometryFloor);
  const expected=profile.path.closedPath.slice(2,-1),lower=[];const positions=g.attributes.position;
  for(let i=0;i<positions.count;i++)if(positions.getZ(i)===Math.fround(4.24)&&positions.getY(i)<Math.fround(4.35)){const p=[positions.getX(i),positions.getY(i)];if(!lower.some(q=>q[0]===p[0]&&q[1]===p[1]))lower.push(p);}
  lower.sort((a,b)=>b[0]-a[0]);assert.equal(lower.length,203);assert.deepEqual(lower,expected.map(p=>p.map(Math.fround)));
  for(const[x,y]of expected)near(sectionFloor(g,x),y);
  for(const curve of profile.path.bayCurves){const ys=[];for(let i=0;i<65;i++){const[x,y]=curve.modelPolyline[i],actual=sectionFloor(g,x);near(actual,y);ys.push(actual);const interval=Math.min(7,Math.floor(i/8)),lo=Math.min(curve.modelPolyline[interval*8][1],curve.modelPolyline[(interval+1)*8][1]),hi=Math.max(curve.modelPolyline[interval*8][1],curve.modelPolyline[(interval+1)*8][1]);assert.ok(actual>=lo-5e-7&&actual<=hi+5e-7);}
   report[curve.bay]={minimum:Math.min(...ys),maximum:Math.max(...ys),amplitude:Math.max(...ys)-Math.min(...ys)};
  }
  for(const pair of profile.path.plainReturnSegments)for(const k of['leftReturn','rightReturn']){const{from,to}=pair[k];for(const t of[.25,.5,.75])near(sectionFloor(g,from[0]+t*(to[0]-from[0])),from[1]+t*(to[1]-from[1]));}
  for(const x of[-3.25,-3.15,-2.5,-2.43,-.81,.81,2.43,2.5,3.15,3.25])near(sectionFloor(g,x),4.13);
  // Quantized actual mesh envelope, not .08 - nominal .075 arithmetic.
  const columns=out.frame.children.filter(m=>m.userData.dafotangLayoutRole==='lower-column'),columnMargins=[];
  out.frame.updateWorldMatrix(true,true);
  for(const pair of profile.path.plainReturnSegments)for(const k of['leftReturn','rightReturn']){const[fromX]=pair[k].from[1]===4.13?pair[k].from:pair[k].to,col=columns.reduce((a,b)=>{a.geometry.computeBoundingBox();b.geometry.computeBoundingBox();return Math.abs(a.geometry.boundingBox.getCenter(new T.Vector3()).x-fromX)<Math.abs(b.geometry.boundingBox.getCenter(new T.Vector3()).x-fromX)?a:b;});const bb=new T.Box3().setFromObject(col),cx=bb.getCenter(new T.Vector3()).x,qx=new T.Vector3(Math.fround(fromX),Math.fround(4.13),Math.fround(4.24)).applyMatrix4(beam(out).matrixWorld).x;const margin=qx>cx?qx-bb.max.x:bb.min.x-qx;assert.ok(margin>.004999&&margin<.02,`actual gap=${margin}, anchor=${qx}, center=${cx}, bounds=${bb.min.x},${bb.max.x}`);columnMargins.push({anchorX:qx,actualColumnBounds:[bb.min.toArray(),bb.max.toArray()],conservativeMeshXGap:margin});}
  report.geometry={triangles:ts.length,vertices:positions.count,weldedVertices:vertices.size,weldedEdges:edges.size,minArea,closedComponents:1,signedVolume:volume,bounds:[b.min.toArray(),b.max.toArray()],sixReturns:6,columnMargins};
 }finally{f.dispose();}
});

test('84 owners identical by each attribute, transform, material and support; all 85 actual support triangles match',async()=>{
 const a=fixture(),b=fixture();try{const old=baseline.buildDafotangHistoricLayout(a.context),now=(await candidate()).buildDafotangHistoricLayout(b.context);assert.equal(old.frame.children.length,85);assert.equal(now.frame.children.length,85);assert.equal(now.contacts.length,85);
  const ids=new Set(),roleCounts={};a.context.kit.root.updateMatrixWorld(true);b.context.kit.root.updateMatrixWorld(true);
  for(let i=0;i<85;i++){const x=old.frame.children[i],y=now.frame.children[i],role=y.userData.dafotangLayoutRole,ordinal=roleCounts[role]=(roleCounts[role]??0)+1;assert.equal(x.userData.dafotangLayoutRole,role);
   if(role!=='lower-front-entablature'){meshEqual(x,y);supportEqual(old.contacts[i].triangleSupport,now.contacts[i].triangleSupport);report.preservedOwners.push({role,ordinal,attributes:Object.keys(y.geometry.attributes),indexBytes:y.geometry.index?.array.byteLength??0,triangleCount:now.contacts[i].triangleSupport.template.triangles.length,checks:['attributeBytes','indexBytes','groups','drawRange','morphs','transform','materialValues','visibility','shadows','supportTriangles','supportBounds','supportNormals']});}
   else{assert.equal(y.material,now.frame.children[0].material);assert.equal(y.parent,now.frame);assert.notEqual(triangles(x.geometry).length,triangles(y.geometry).length);assert.deepEqual(materialValue(x.material),materialValue(y.material));}
   const c=now.contacts[i],s=c.triangleSupport,ts=triangles(y.geometry);assert.equal(c.dafotangLayoutMesh,y.uuid);assert.equal(c.dafotangLayoutRole,role);assert.equal(s.id,y.name+'/'+y.uuid);assert.ok(!ids.has(s.id));ids.add(s.id);assert.equal(ts.length,s.template.triangles.length);let count=0;
   for(let j=0;j<ts.length;j++){const actual=ts[j],stored=s.template.triangles[j];for(const v of['a','b','c']){assert.deepEqual(actual[v].toArray(),stored.triangle[v].toArray());const visible=actual[v].clone().applyMatrix4(y.matrixWorld),collision=stored.triangle[v].clone().add(s.offset);assert.deepEqual(visible.toArray(),collision.toArray());}assert.deepEqual(actual.getNormal(new T.Vector3()).toArray(),stored.normal.toArray());assert.ok(new T.Box3().setFromPoints([actual.a,actual.b,actual.c]).equals(stored.box));count++;}
   assert.ok(new T.Box3().setFromObject(y).equals(c));assert.ok(s.box.equals(c));assert.equal(b.context.kit.colliders.filter(q=>q.dafotangLayoutMesh===y.uuid).length,1);report.supportChecks.push({role,ordinal,triangles:count});
  }
  assert.equal(report.preservedOwners.length,84);
  for(let i=0;i<3;i++){meshEqual(old.changedPedestals[i].mesh,now.changedPedestals[i].mesh);assert.ok(old.changedPedestals[i].newCollider.equals(now.changedPedestals[i].newCollider));assert.equal(old.changedPedestals[i].newCollider.dafotangPrincipalRole,now.changedPedestals[i].newCollider.dafotangPrincipalRole);assert.equal(now.changedPedestals[i].newCollider.dafotangPrincipalMesh,now.changedPedestals[i].mesh.uuid);}
  for(const k of['walkables','rooms','mapItems','regions','plaques'])assert.deepEqual(a.context.kit[k],b.context.kit[k]);const preservedMetadata=structuredClone(b.context.g);assert.deepEqual(preservedMetadata.historicLayout.lowerFrontEntablatureProfile,{endTreatment:'PLAIN_MODEL_RETURNS_NOT_SOURCE_CARVING',columnInset:.08,narrowBays:'UNCHANGED_PLAIN',dimensionStatus:'MODEL_FIT_NOT_SURVEY'});delete preservedMetadata.historicLayout.lowerFrontEntablatureProfile;assert.deepEqual(a.context.g,preservedMetadata);
 }finally{a.dispose();b.dispose();}
});

function trackResources(fn){const gp=T.BufferGeometry.prototype,mp=T.Material.prototype,gd=gp.dispose,md=mp.dispose,geos=new Map(),mats=new Map(),beforeG=new T.BufferGeometry(),beforeM=new T.Material();gp.dispose=function(){geos.set(this,(geos.get(this)??0)+1);return gd.call(this);};mp.dispose=function(){mats.set(this,(mats.get(this)??0)+1);return md.call(this);};let error;try{fn();}catch(e){error=e;}finally{gp.dispose=gd;mp.dispose=md;}const afterG=new T.BufferGeometry(),afterM=new T.Material();const out={error,geos,mats,geometryAllocations:afterG.id-beforeG.id-1,materialAllocations:afterM.id-beforeM.id-1};for(const v of[beforeG,afterG,beforeM,afterM])v.dispose();return out;}
for(const stage of['f.add-after-attach','metadata-after-support-replacement'])test('publication rollback restores originals and disposes exactly once: '+stage,async()=>{
 const fx=fixture(),{kit,f,g}=fx.context,children=[...f.children],colliders=[...kit.colliders],owned=[...kit.owned],geometries=children[0].children.map(m=>m.geometry),meta=structuredClone(g),originalAdd=f.add;
 if(stage==='f.add-after-attach')f.add=function(...x){originalAdd.apply(this,x);throw Error('injected publication failure');};
 else fx.context.g=new Proxy(g,{set(target,k,v){if(k==='historicLayout')throw Error('injected publication failure');return Reflect.set(target,k,v);}});
 const mod=await candidate(),r=trackResources(()=>mod.buildDafotangHistoricLayout(fx.context));assert.match(r.error?.message??'',/injected publication failure/);assert.deepEqual(f.children,children);assert.deepEqual(kit.colliders,colliders);assert.deepEqual(kit.owned,owned);assert.deepEqual(g,meta);assert.deepEqual(children[0].children.map(m=>m.geometry),geometries);
 assert.equal(r.geometryAllocations,88);assert.equal(r.materialAllocations,2);assert.equal(r.geos.size,88);assert.equal(r.mats.size,2);for(const n of[...r.geos.values(),...r.mats.values()])assert.equal(n,1);for(const x of[...geometries,...owned])assert.ok(!r.geos.has(x)&&!r.mats.has(x));report[stage]={geometryAllocations:88,newGeometryDisposeOnce:88,newMaterialDisposeOnce:2,originalResourcesDisposed:0};f.add=originalAdd;fx.dispose();
});
test('duplicate and read-only rejection before geometry/material allocation; fixture disposal idempotent',async()=>{
 const mod=await candidate();for(const which of['duplicate','historicLayout-readonly','support-dimensions-readonly','support-geometry-readonly']){const fx=fixture();if(which==='duplicate')mod.buildDafotangHistoricLayout(fx.context);else if(which==='historicLayout-readonly')Object.defineProperty(fx.context.g,'historicLayout',{value:undefined,writable:false});else if(which==='support-dimensions-readonly')Object.defineProperty(fx.context.g.historicalPrincipal,'supportDimensions',{writable:false});else Object.defineProperty(fx.context.f.children[0].children[0],'geometry',{writable:false});
  const r=trackResources(()=>mod.buildDafotangHistoricLayout(fx.context));assert.ok(r.error);assert.equal(r.geometryAllocations,0);assert.equal(r.materialAllocations,0);assert.equal(r.geos.size,0);assert.equal(r.mats.size,0);const d=trackResources(()=>{fx.dispose();fx.dispose();});assert.ok([...d.geos.values(),...d.mats.values()].every(n=>n===1));}
});
process.on('exit',()=>{if(process.env.R265_REPORT)fs.writeFileSync(process.env.R265_REPORT,JSON.stringify(report,null,2));});
