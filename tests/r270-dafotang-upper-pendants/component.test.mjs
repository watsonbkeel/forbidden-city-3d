// Bounded direct component and real retained subassembly only. No host/World/build.
import test from 'node:test';
import assert from 'node:assert/strict';
import fs from 'node:fs';
import {createHash} from 'node:crypto';
import * as T from 'three';
import {buildDafotangHistoricLayout} from '../../src/scene/palace/special/DafotangHistoricLayout.js';
import {buildDafotangUpperCentralBand} from '../../src/scene/palace/special/DafotangUpperCentralBand.js';
import {buildDafotangUpperWestBand} from '../../src/scene/palace/special/DafotangUpperWestBand.js';
import {buildDafotangUpperEastBand} from '../../src/scene/palace/special/DafotangUpperEastBand.js';
import {triangleBodyIntersects} from '../../src/utils/TriangleSupport.js';
const url=new URL('../../src/scene/palace/special/DafotangUpperPendants.js',import.meta.url);
const hash=v=>createHash('sha256').update(typeof v==='string'?v:JSON.stringify(v)).digest('hex');
const near=(a,b,t=2e-6)=>assert.ok(Math.abs(a-b)<t,`${a} != ${b}`);
const OFFSET=[221.9,0,241.1],LAYOUT='dafotang-historic-spatial-fit-v1',ID='dafotang-upper-pendants-partial-fit-v1',S=1.62/346;
async function api(){assert.ok(fs.existsSync(url),'R270_COMPONENT_MISSING');return import(url);}
const EXPECTED=[{"id":"west-outer","axis":516,"column":2.43,"points":[[505,347],[530,347],[534,353],[534,369],[530,373],[523,375],[522,379],[519,382],[516,380],[514,376],[507,374],[502,371],[502,355],[503,351]]},{"id":"west-inner","axis":859,"column":0.81,"points":[[845,348],[872,348],[875,354],[875,371],[871,375],[866,377],[864,381],[860,384],[856,382],[853,378],[849,375],[844,371],[844,355]]},{"id":"east-inner","axis":1205,"column":-0.81,"points":[[1189,348],[1217,348],[1219,354],[1219,370],[1215,375],[1209,378],[1208,382],[1204,384],[1200,382],[1197,378],[1191,376],[1187,371],[1187,355]]},{"id":"east-outer","axis":1545,"column":-2.43,"points":[[1533,348],[1556,348],[1560,354],[1560,371],[1555,375],[1551,379],[1550,383],[1546,386],[1542,383],[1540,379],[1534,376],[1529,372],[1528,356],[1530,351]]}];
const HOST_HASH="5e5e8a65d94b10e29c2067e213027d17ac00c95f2481ba26506dc4bede3eb4fd";
function fixture(){
 const root=new T.Group();root.name='outer-west';const f=new T.Group();f.position.set(...OFFSET);root.add(f);
 const kit={root,colliders:[],owned:[],walkables:[],rooms:[]};
 const g={id:'place-outer-west-6cae88b6a2',w:45.7,d:16.2,y:.9,front:-8.1,rear:8.1,inventory:{status:'UNKNOWN'},historicalPrincipal:{id:'dafotang-shakyamuni-historical-fit',supportDimensions:[2.2,.8,1.8]}};
 const principal=new T.Group();principal.userData.dafotangPrincipal=g.historicalPrincipal.id;f.add(principal);
 const material=new T.MeshStandardMaterial({name:'dafotang_principal_fitted_support'});kit.owned.push(material);
 for(const[role,w,h,d,y]of[['support-foot',2.2,.16,1.8,.98],['support-waist',1.9,.46,1.52,1.29],['support-top',2.12,.18,1.72,1.61]]){const m=new T.Mesh(new T.BoxGeometry(w,h,d).translate(0,y,5.6),material);m.name=g.historicalPrincipal.id+'/'+role;principal.add(m);root.updateMatrixWorld(true);kit.colliders.push(new T.Box3().setFromObject(m));}
 const c={kit,f,g,p:{id:g.id,key:'dafotang',zone:'outer-west'}};const layout=buildDafotangHistoricLayout(c);g.mainPlaqueFit={id:'dafotang-main-plaque-modern-semantic-fit-v1'};const central=buildDafotangUpperCentralBand(c);const west=buildDafotangUpperWestBand(c);
 const east=buildDafotangUpperEastBand(c);
 return {...c,layout,central,west,east,close(){east.dispose();west.dispose();central.dispose();root.traverse(m=>m.geometry?.dispose());for(const m of kit.owned)m.dispose();root.clear();}};
}
const leafValue=m=>hash({name:m.name,data:m.userData,attributes:Object.fromEntries(Object.entries(m.geometry.attributes).map(([k,a])=>[k,Array.from(a.array)])),index:Array.from(m.geometry.index.array),position:m.position.toArray(),quaternion:m.quaternion.toArray(),scale:m.scale.toArray(),material:m.material.toJSON()});
const contactValue=c=>hash({box:[c.min.toArray(),c.max.toArray()],id:c.triangleSupport?.id,offset:c.triangleSupport?.offset.toArray(),triangles:c.triangleSupport?.template.triangles.map(q=>[q.triangle.a.toArray(),q.triangle.b.toArray(),q.triangle.c.toArray(),q.normal.toArray(),q.box.min.toArray(),q.box.max.toArray()])});
function snapshot(c){return {children:[...c.f.children],geometries:[...c.layout.frame.children,c.central.mesh,c.west.mesh,c.east.mesh].map(m=>m.geometry),materials:[...c.layout.frame.children,c.central.mesh,c.west.mesh,c.east.mesh].map(m=>m.material),leaves:[...c.layout.frame.children,c.central.mesh,c.west.mesh,c.east.mesh],values:[...c.layout.frame.children,c.central.mesh,c.west.mesh,c.east.mesh].map(leafValue),contacts:[...c.kit.colliders],contactValues:c.kit.colliders.map(contactValue),owned:[...c.kit.owned],meta:hash(c.g)};}
function retained(c,s,installed){assert.deepEqual([...c.layout.frame.children,c.central.mesh,c.west.mesh,c.east.mesh],s.leaves);assert.deepEqual(s.leaves.map(leafValue),s.values);assert.deepEqual(s.leaves.map(m=>m.geometry),s.geometries);assert.deepEqual(s.leaves.map(m=>m.material),s.materials);assert.deepEqual(c.kit.colliders.slice(0,s.contacts.length),s.contacts);assert.deepEqual(s.contacts.map(contactValue),s.contactValues);assert.deepEqual(c.kit.owned,s.owned);assert.deepEqual(c.f.children.slice(0,s.children.length),s.children);const g={...c.g};if(installed)delete g.upperPendantsFit;assert.equal(hash(g),s.meta);assert.deepEqual(c.kit.walkables,[]);assert.deepEqual(c.kit.rooms,[]);}
function triangles(g){const p=g.attributes.position;return Array.from({length:g.index.count/3},(_,i)=>new T.Triangle(...[0,1,2].map(k=>new T.Vector3().fromBufferAttribute(p,g.index.getX(i*3+k)))));}


const owners=c=>[...c.layout.frame.children,c.central.mesh,c.west.mesh,c.east.mesh];
function bounds(m){return new T.Box3().setFromBufferAttribute(m.geometry.attributes.position);}
function forwardInSourceRegion(m,o){
 const b=bounds(m),xy=o.points.map(([x,y])=>[o.column-(x-o.axis)*S,6.23-(y-316)*S]);
 const region=new T.Box3(new T.Vector3(Math.min(...xy.map(p=>p[0]))-2e-6,Math.min(...xy.map(p=>p[1]))-2e-6,4.42999),new T.Vector3(Math.max(...xy.map(p=>p[0]))+2e-6,Math.max(...xy.map(p=>p[1]))+2e-6,4.51001));
 return region.containsBox(b)&&triangles(m.geometry).some(t=>[t.a,t.b,t.c].every(v=>Math.abs(v.z-4.43)<2e-6)&&t.getNormal(new T.Vector3()).z<-.999);
}
test('real baseline has four long upper columns and 88 retained leaves, but needs independent front contours',async()=>{
 const c=fixture();let out;try{
 const old=owners(c),columns=old.filter(m=>m.userData.dafotangLayoutRole==='upper-column');assert.equal(old.length,88);assert.equal(columns.length,4);
 for(const o of EXPECTED){const m=columns.find(m=>Math.abs(bounds(m).getCenter(new T.Vector3()).x-o.column)<2e-6);assert.ok(m);assert.ok(bounds(m).getSize(new T.Vector3()).y>1.8);assert.equal(old.filter(m=>forwardInSourceRegion(m,o)).length,0);}
 console.log('R270_REAL_BASELINE '+JSON.stringify({owners:old.length,longUpperColumns:columns.length,independentForwardContoursBefore:EXPECTED.map(o=>old.filter(m=>forwardInSourceRegion(m,o)).length),contactOwners:old.map(m=>c.kit.colliders.filter(q=>q.triangleSupport?.id===m.name+'/'+m.uuid).length)}));
 if(fs.existsSync(url))out=(await api()).buildDafotangUpperPendants(c);
 const all=out?[...old,...out.meshes]:old;
 assert.deepEqual(EXPECTED.map(o=>all.filter(m=>forwardInSourceRegion(m,o)).length),[1,1,1,1],'R270_REAL_88_OWNER_BASELINE_MISSING_FOUR_INDEPENDENT_FRONT_CONTOURS');
 }finally{out?.dispose();c.close();}
});

test('four separately frozen pixel polylines map to actual mesh vertices with one XY scale',async()=>{
 const mod=await api(),material=new T.MeshStandardMaterial(),out=mod.createDafotangUpperPendants({material});try{
 assert.equal(out.meshes.length,4);assert.deepEqual(out.meshes,out.group.children);const meta=out.metadata;
 assert.equal(meta.id,ID);assert.equal(meta.evidenceCount,1);assert.equal(meta.sourceImage.sha256,'cad1cefcb0767d94ed76415206e8b6ab642a0c0ba52fdabbe7b249a538ad2c48');
 near(meta.commonMapping.scaleXY,S);assert.equal(meta.commonMapping.referenceY,316);assert.equal(meta.commonMapping.modelReferenceY,6.23);
 assert.equal(meta.complete,false);assert.equal(meta.wholeHeightRegistered,false);assert.equal(meta.newReligiousFigures,0);assert.equal(meta.newWalkables,0);assert.equal(meta.newRooms,0);assert.equal(meta.historicalDepth,null);assert.equal(meta.historicalBack,null);assert.equal(meta.historicalAttachment,null);assert.match(meta.visualAcceptance,/PENDING/);
 for(const[i,o]of EXPECTED.entries()){
 const mesh=out.meshes[i],p=mesh.geometry.attributes.position,m=meta.objects[i];assert.equal(mesh.material,material);assert.equal(mesh.name,ID+'/'+o.id);assert.equal(mesh.userData.noMerge,true);assert.equal(mesh.userData.dafotangUpperPendantsRole,o.id);
 assert.equal(m.id,o.id);assert.deepEqual(m.sourcePoints,o.points);assert.deepEqual(m.perPointToleranceXYpx,o.points.map(()=>[3,4]));assert.equal(m.sourceAxisX,o.axis);assert.equal(m.axisTolerancePx,4);assert.equal(m.modelColumnX,o.column);assert.equal(m.depthStatus,'MODEL_FIT_NOT_SURVEY');assert.match(m.topClosure,/PLAIN_STRAIGHT/);assert.match(m.mountStatus,/HISTORICAL_RELATION_UNKNOWN/);
 const actual=new Set(Array.from({length:p.count},(_,i)=>[p.getX(i),p.getY(i),p.getZ(i)].join(','))),wanted=new Set();
 for(const[x,y]of o.points)for(const z of[4.43,4.51]){const point=[Math.fround(o.column-(x-o.axis)*S),Math.fround(6.23-(y-316)*S),Math.fround(z)];wanted.add(point.join(','));}
 assert.deepEqual(actual,wanted);assert.equal(actual.size,o.points.length*2);assert.ok(forwardInSourceRegion(mesh,o));
 }
 assert.throws(()=>mod.createDafotangUpperPendants({material:new T.MeshStandardMaterial({side:T.DoubleSide})}));
 }finally{out.dispose();material.dispose();}
});

test('actual Float32 triangles form outward closed nondegenerate oriented solids',async()=>{
 const mod=await api(),material=new T.MeshStandardMaterial(),out=mod.createDafotangUpperPendants({material});try{
 const metrics=[];for(const[i,mesh]of out.meshes.entries()){
 const g=mesh.geometry,ts=triangles(g),edges=new Map(),vertices=new Set(),faces=new Set();let volume=0,frontArea=0,backArea=0;
 for(const a of Object.values(g.attributes))assert.ok(a.array.every(Number.isFinite));assert.equal(ts.length,4*EXPECTED[i].points.length-4);assert.equal(g.attributes.position.count,ts.length*3);
 for(const[ti,t]of ts.entries()){
 assert.ok(t.getArea()>1e-12);const vs=[t.a,t.b,t.c],ks=vs.map(v=>v.toArray().join(',')),n=t.getNormal(new T.Vector3()),key=ks.slice().sort().join('|');assert.ok(!faces.has(key));faces.add(key);ks.forEach(k=>vertices.add(k));
 for(let j=0;j<3;j++){const a=ks[j],b=ks[(j+1)%3],k=[a,b].sort().join('|');if(!edges.has(k))edges.set(k,[]);edges.get(k).push(a<b?1:-1);const stored=new T.Vector3().fromBufferAttribute(g.attributes.normal,g.index.getX(ti*3+j));assert.ok(stored.dot(n)>.999999);}
 volume+=t.a.dot(t.b.clone().cross(t.c))/6;
 if(vs.every(v=>v.z===Math.fround(4.43))){near(n.z,-1);frontArea+=t.getArea();}else if(vs.every(v=>v.z===Math.fround(4.51))){near(n.z,1);backArea+=t.getArea();}else{near(n.z,0);}
 }
 const adj=new Map([...vertices].map(k=>[k,[]]));for(const[k,signs]of edges){assert.equal(signs.length,2);assert.equal(signs[0]+signs[1],0);const[a,b]=k.split('|');adj.get(a).push(b);adj.get(b).push(a);}
 const todo=[[...vertices][0]],seen=new Set(todo);while(todo.length)for(const next of adj.get(todo.pop()))if(!seen.has(next)){seen.add(next);todo.push(next);}assert.equal(seen.size,vertices.size);assert.equal(vertices.size-edges.size+ts.length,2);assert.ok(volume>0);near(frontArea,backArea,1e-10);near(volume,frontArea*(Math.fround(4.51)-Math.fround(4.43)),1e-10);
 metrics.push({id:EXPECTED[i].id,triangles:ts.length,attributeVertices:g.attributes.position.count,indices:g.index.count,bytes:Object.values(g.attributes).reduce((n,a)=>n+a.array.byteLength,0)+g.index.array.byteLength,volume,frontArea,bounds:[bounds(mesh).min.toArray(),bounds(mesh).max.toArray()]});
 }console.log('R270_GEOMETRY '+JSON.stringify(metrics));
 }finally{out.dispose();material.dispose();}
});

test('real new triangle contacts and actual column attachment preserve all original 88 identities and values',async()=>{
 const mod=await api(),c=fixture(),s=snapshot(c);let out;try{
 out=mod.buildDafotangUpperPendants(c);retained(c,s,true);assert.equal(s.leaves.length,88);assert.equal(c.g.upperPendantsFit,out.metadata);assert.equal(out.group.parent,c.f);assert.equal(c.kit.colliders.length,s.contacts.length+4);assert.equal(c.f.children.length,s.children.length+1);
 for(const[i,mesh]of out.meshes.entries()){
 const contact=out.contacts[i],support=contact.triangleSupport,ts=triangles(mesh.geometry);assert.equal(contact.dafotangUpperPendantsMesh,mesh.uuid);assert.equal(contact.dafotangUpperPendantsRole,EXPECTED[i].id);assert.equal(contact.dafotangLayoutMesh,undefined);assert.equal(mesh.material,c.central.mesh.material);assert.equal(support.id,mesh.name+'/'+mesh.uuid);assert.deepEqual(support.offset.toArray(),OFFSET);assert.equal(support.template.triangles.length,ts.length);assert.ok(contact.equals(bounds(mesh).translate(new T.Vector3(...OFFSET))));
 ts.forEach((t,j)=>{for(const k of['a','b','c'])assert.deepEqual(support.template.triangles[j].triangle[k],t[k]);});
 for(const band of[c.central.mesh,c.west.mesh,c.east.mesh]){const a=bounds(mesh),b=bounds(band);assert.ok(Math.max(a.min.x-b.max.x,b.min.x-a.max.x)>.0889);}
 // A small volume around the source-axis at y360 lies inside BOTH actual solids.
 // This tests real triangular narrowphase, not just two overlapping AABBs.
 const x=EXPECTED[i].column,y=6.23-(360-316)*S;
 const sample=new T.Box3(new T.Vector3(x-.001,y-.001,4.502),new T.Vector3(x+.001,y+.001,4.508)).translate(new T.Vector3(...OFFSET));
 const column=c.layout.frame.children.find(m=>m.userData.dafotangLayoutRole==='upper-column'&&Math.abs(bounds(m).getCenter(new T.Vector3()).x-x)<2e-6);const columnContact=c.kit.colliders.find(q=>q.dafotangLayoutMesh===column.uuid);
 assert.equal(triangleBodyIntersects(support,sample),true);assert.equal(triangleBodyIntersects(columnContact.triangleSupport,sample),true);
 }
 assert.throws(()=>mod.buildDafotangUpperPendants(c),/once only/);
 }finally{out?.dispose();retained(c,s,false);assert.deepEqual(c.f.children,s.children);assert.deepEqual(c.kit.colliders,s.contacts);c.close();}
});

function trackResources(action){
 const original=T.BufferGeometry.prototype.dispose,all=new Map(),set=T.BufferGeometry.prototype.setAttribute;let materialDisposes=0;
 T.BufferGeometry.prototype.setAttribute=function(...a){if(!all.has(this))all.set(this,0);return set.apply(this,a);};
 T.BufferGeometry.prototype.dispose=function(){all.set(this,(all.get(this)||0)+1);return original.call(this);};
 try{action(all);}finally{T.BufferGeometry.prototype.dispose=original;T.BufferGeometry.prototype.setAttribute=set;}
 for(const n of all.values())assert.equal(n,1);return all.size;
}

test('2nd/3rd/4th mesh construction and real contact creation failures release each new geometry once',async()=>{
 const mod=await api();for(const stage of['construction','contact'])for(const failAt of[2,3,4]){
 const c=fixture(),s=snapshot(c);let md=0;c.central.mesh.material.addEventListener('dispose',()=>md++);
 try{const count=trackResources(()=>{
 const proto=stage==='construction'?T.BufferGeometry.prototype:T.Box3.prototype,key=stage==='construction'?'setIndex':'clone',original=proto[key];let calls=0;
 proto[key]=function(...a){calls++;if(calls===(stage==='construction'?failAt:2*failAt-1))throw Error('injected '+stage+' '+failAt);return original.apply(this,a);};
 try{assert.throws(()=>mod.buildDafotangUpperPendants(c),new RegExp('injected '+stage));}finally{proto[key]=original;}
 });assert.equal(count,stage==='construction'?failAt:4);assert.equal(md,0);retained(c,s,false);assert.deepEqual(c.f.children,s.children);assert.deepEqual(c.kit.colliders,s.contacts);
 console.log('R270_ROLLBACK '+stage+' '+failAt+' geometries='+count);
 }finally{c.close();}
 }
});

test('attach/collider/metadata failures restore exact host arrays and property descriptor',async()=>{
 const mod=await api();for(const stage of['attach','collider','metadata']){
 const c=fixture();Object.defineProperty(c.g,'upperPendantsFit',{value:undefined,writable:true,enumerable:false,configurable:true});const desc=Object.getOwnPropertyDescriptor(c.g,'upperPendantsFit'),s=snapshot(c),g=c.g;
 try{const count=trackResources(()=>{
 if(stage==='attach'){const add=c.f.add;c.f.add=function(...xs){add.apply(this,xs);throw Error('injected attach');};}
 if(stage==='collider'){const push=c.kit.colliders.push;c.kit.colliders.push=function(...xs){push.apply(this,xs);throw Error('injected collider');};}
 if(stage==='metadata')c.g=new Proxy(g,{set(target,key,value){Reflect.set(target,key,value);if(key==='upperPendantsFit')throw Error('injected metadata');return true;}});
 try{assert.throws(()=>mod.buildDafotangUpperPendants(c),new RegExp('injected '+stage));}finally{delete c.f.add;delete c.kit.colliders.push;c.g=g;}
 });assert.equal(count,4);assert.deepEqual(Object.getOwnPropertyDescriptor(g,'upperPendantsFit'),desc);retained(c,s,false);assert.deepEqual(c.f.children,s.children);assert.deepEqual(c.kit.colliders,s.contacts);
 }finally{c.close();}
 }
});

test('invalid retained host, moved columns, any changed band and owner are rejected before allocation',async()=>{
 const mod=await api(),c=fixture(),s=snapshot(c);try{
 const mutations=[()=>{c.kit.root.scale.x=2;return()=>c.kit.root.scale.x=1;},()=>{c.g.w=46;return()=>c.g.w=45.7;},()=>{const m=c.layout.frame.children.find(m=>m.userData.dafotangLayoutRole==='upper-column');m.position.y=.01;return()=>m.position.y=0;},...['central','west','east'].map(k=>()=>{c[k].mesh.position.x=.01;return()=>c[k].mesh.position.x=0;}),...['central','west','east'].map(k=>()=>{const owner=c.kit.colliders.find(q=>q.triangleSupport?.id===c[k].mesh.name+'/'+c[k].mesh.uuid),id=owner.triangleSupport.id;owner.triangleSupport.id='wrong';return()=>owner.triangleSupport.id=id;})];
 for(const mutate of mutations){const restore=mutate();let allocated=0;const set=T.BufferGeometry.prototype.setAttribute;T.BufferGeometry.prototype.setAttribute=function(...a){allocated++;return set.apply(this,a);};try{assert.throws(()=>mod.buildDafotangUpperPendants(c));assert.equal(allocated,0);}finally{restore();T.BufferGeometry.prototype.setAttribute=set;}retained(c,s,false);}
 }finally{c.close();}
});

test('retained mesh coordinates and true triangle owner correspondence must still agree before installation',async()=>{
 const mod=await api(),c=fixture(),s=snapshot(c);try{
 for(const mesh of[c.layout.frame.children[0],c.central.mesh,c.west.mesh,c.east.mesh]){
  const p=mesh.geometry.attributes.position,original=p.getY(0);p.setY(0,original+.01);
  try{assert.throws(()=>mod.buildDafotangUpperPendants(c),/Retained .* contact geometry changed/);}finally{p.setY(0,original);}
  retained(c,s,false);
 }
 const owner=c.kit.colliders.find(q=>q.dafotangLayoutMesh===c.layout.frame.children[0].uuid),original=owner.triangleSupport.offset.x;owner.triangleSupport.offset.x+=.1;
 try{assert.throws(()=>mod.buildDafotangUpperPendants(c),/Retained .* contact geometry changed/);}finally{owner.triangleSupport.offset.x=original;}
 retained(c,s,false);
 }finally{c.close();}
});

test('ordinary double unload and host-geometry unload never dispose borrowed material or resurrect leaves',async()=>{
 const mod=await api();for(const host of[false,true]){const c=fixture(),s=snapshot(c);let out;try{
 out=mod.buildDafotangUpperPendants(c);const counts=out.meshes.map(()=>0);let md=0;out.meshes[0].material.addEventListener('dispose',()=>md++);out.meshes.forEach((m,i)=>m.geometry.addEventListener('dispose',()=>counts[i]++));
 if(host){const kept=new T.Group();for(const m of out.meshes)kept.add(m);for(const m of out.meshes)m.geometry.dispose();assert.ok(out.meshes.every(m=>!m.visible));}
 out.dispose();out.dispose();assert.deepEqual(counts,[1,1,1,1]);assert.equal(md,0);assert.ok(out.meshes.every(m=>m.parent===null&&!m.visible));assert.equal(out.group.parent,null);retained(c,s,false);assert.deepEqual(c.f.children,s.children);assert.deepEqual(c.kit.colliders,s.contacts);
 }finally{out?.dispose();c.close();}}
});

test('host delta stays exactly one adjacent import and one call; README keeps failed acceptance truthful',async()=>{
 await api();const host=fs.readFileSync(new URL('../../src/scene/palace/special/RemainingOuterHalls.js',import.meta.url),'utf8'),imp="import {buildDafotangUpperPendants} from './DafotangUpperPendants.js';\n",call="  if(p.key==='dafotang')buildDafotangUpperPendants(c);\n";
 assert.equal(host.split(imp).length,2);assert.equal(host.split(call).length,2);assert.ok(host.includes("  if(p.key==='dafotang')buildDafotangUpperEastBand(c);\n"+call));assert.ok(host.includes("import {buildDafotangUpperEastBand} from './DafotangUpperEastBand.js';\n"+imp));assert.equal(hash(host.replace(imp,'').replace(call,'')),HOST_HASH);
 const readme=fs.readFileSync(new URL('../../README.md',import.meta.url),'utf8');assert.match(readme,/release 标识为 \*\*R262\*\*/);assert.match(readme,/R269[^\n]*四图[^\n]*清理[^\n]*FAIL/);assert.match(readme,/四处前向垂头粗轮廓[^\n]*待[^\n]*实景/);assert.match(readme,/4 GiB 冷返门禁失败/);assert.equal(readme.includes('## R270'),false);
});
process.on('exit',()=>console.log('R270_RESOURCE '+JSON.stringify({scope:'COMPONENT_AND_REAL_88_OWNER_SMALL_SUBASSEMBLY_ONLY',usage:process.resourceUsage(),memory:process.memoryUsage(),limits:{oldMiB:128,semiMiB:8,seconds:30},noNodeAddressSpaceLimit:true})));
