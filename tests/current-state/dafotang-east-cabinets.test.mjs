import {priorUpperCentralBandHostSource} from '../r266-dafotang-upper-band/prior-host.mjs';
import {priorR264LayoutSource,SOURCE_PATH} from '../r265-dafotang-frieze/source-view.mjs';
// Component/synthetic tests only: deliberately no real host, finish, World or GPU.
import test from 'node:test';
import assert from 'node:assert/strict';
import fs from 'node:fs';
import {createHash} from 'node:crypto';
import * as T from 'three';
import {createDafotangEastCabinets,buildDafotangEastCabinets} from '../../src/scene/palace/special/DafotangEastCabinets.js';
import {mergeByMaterial} from '../../src/utils/MergeUtils.js';
import {triangleBodyIntersects} from '../../src/utils/TriangleSupport.js';
const ID='dafotang-east-cabinets-source-fit-v1',PLACE='place-outer-west-6cae88b6a2';
const near=(a,b)=>assert.ok(Math.abs(a-b)<2e-6,`${a} != ${b}`);
function fixture(){
 const root=new T.Group();root.name='outer-west';const f=new T.Group();f.position.set(221.9,0,241.1);root.add(f);
 const g={id:PLACE,w:45.7,d:16.2,y:.9,front:-8.1,rear:8.1,inventory:{status:'UNKNOWN'},historicalPrincipal:{id:'dafotang-shakyamuni-historical-fit'},historicLayout:{id:'dafotang-historic-spatial-fit-v1',arhatPlatforms:[{side:'west',figureCount:9,position:[8.48,.92,.6]},{side:'east',figureCount:9,position:[-8.48,.92,.6]}]},triadFit:{id:'dafotang-three-design-figures-v1'},weituoFit:{id:'dafotang-east-weituo-source-fit-v1'},woodPagodasFit:{id:'dafotang-wood-pagodas-source-fit-v1'},warmRoomPartitions:[-1,1].map(side=>({x:side*45.7/7*1.5,doorZ:-5.9,doorW:1.8,doorH:2.65}))};
 const material=new T.MeshStandardMaterial();
 const mesh=()=>new T.Mesh(new T.BoxGeometry(.1,.1,.1).translate(0,7,7),material);
 for(const [key,data]of[['historicLayout','dafotangHistoricLayout'],['weituoFit','dafotangWeituo'],['woodPagodasFit','dafotangWoodPagodas']]){const group=new T.Group();group.name=g[key].id;group.userData[data]=g[key];if(key==='woodPagodasFit'){for(const side of[-1,1]){const tower=new T.Group();tower.userData.side=side;for(let n=0;n<114;n++)tower.add(mesh());group.add(tower);}}else group.add(mesh());f.add(group);}
 const kit={root,colliders:[],owned:[material],rooms:[],walkables:[]};
 return{kit,f,g,p:{id:PLACE,key:'dafotang'},dispose(){root.traverse(o=>o.geometry?.dispose());for(const m of kit.owned)m.dispose();}};
}
test('R257 six physical panels have independent east fit, four tall centres and two shorter ends',()=>{
 const materials={back:new T.MeshStandardMaterial(),frame:new T.MeshStandardMaterial()};let out;
 try{out=createDafotangEastCabinets({materials});assert.equal(out.group.children.length,6);assert.equal(out.meshes.length,30);assert.equal(new Set(out.meshes.map(m=>m.geometry)).size,30);let triangles=0,bytes=0;
 const z=[-3.75,-1.23,-.01,1.21,2.43,4.95];for(let i=0;i<6;i++){const panel=out.group.children[i],b=new T.Box3().setFromObject(panel),short=i===0||i===5;assert.equal(panel.children.length,5);near(b.min.x,-9.67);near(b.max.x,-9.55);near(b.min.y,short?2.70:2.90);near(b.max.y,short?4.95:6.50);near(b.getCenter(new T.Vector3()).z,z[i]);near(b.max.z-b.min.z,short?.90:1.16);assert.equal(panel.children.filter(m=>m.userData.cabinetRole==='back').length,1);}
 for(const m of out.meshes){assert.ok(m.visible&&m.castShadow&&m.receiveShadow);const p=m.geometry.attributes.position,ix=m.geometry.index;assert.ok([...p.array].every(Number.isFinite));let volume=0;for(let i=0;i<ix.count;i+=3){const v=[0,1,2].map(k=>new T.Vector3().fromBufferAttribute(p,ix.getX(i+k)));assert.ok(new T.Triangle(...v).getArea()>1e-12);volume+=v[0].dot(v[1].clone().cross(v[2]))/6;triangles++;}assert.ok(volume>0);bytes+=Object.values(m.geometry.attributes).reduce((n,a)=>n+a.array.byteLength,0)+ix.array.byteLength;}
 assert.equal(triangles,360);assert.equal(bytes,25200);const b=new T.Box3().setFromObject(out.group);near(b.min.z,-4.20);near(b.max.z,5.40);near(b.max.y,6.50);near(b.max.z-b.min.z,9.60);assert.ok(b.min.y-1.60>1.099);assert.ok(b.min.x-(-45.7/7*1.5+.07)>.052);assert.ok(b.min.z-(-5) >.799);assert.ok(7.90-b.max.y>1.399);assert.ok(7.975-b.max.z>2.574);
 assert.deepEqual(out.metadata.sourceFigures,['2015:printed306:fig22']);assert.equal(out.metadata.smallFiguresModeled,0);assert.equal(out.metadata.unmodeledDoesNotMeanHistoricallyEmpty,true);assert.equal(out.metadata.completeHistoricalDisplay,false);
 let gd=0,md=0;out.meshes.forEach(m=>m.geometry.addEventListener('dispose',()=>gd++));Object.values(materials).forEach(m=>m.addEventListener('dispose',()=>md++));out.dispose();out.dispose();assert.equal(gd,30);assert.equal(md,0);console.log('R257_COMPONENT '+JSON.stringify({meshes:30,triangles,geometryBytes:bytes,scope:'component-only; old clearances static source envelopes'}));
 }finally{out?.dispose();Object.values(materials).forEach(m=>m.dispose());}
});
test('R257 synthetic owners match every vertex and survive private two-bucket merge',()=>{
 const c=fixture();try{const before={children:[...c.f.children],contacts:[...c.kit.colliders],owned:[...c.kit.owned],rooms:c.kit.rooms,walks:c.kit.walkables},out=buildDafotangEastCabinets(c);assert.equal(c.g.eastCabinetsFit,out.metadata);assert.equal(out.group.userData.dafotangEastCabinets,out.metadata);assert.deepEqual(c.f.children.slice(0,3),before.children);assert.deepEqual(c.kit.colliders.slice(0,before.contacts.length),before.contacts);assert.equal(c.kit.rooms,before.rooms);assert.equal(c.kit.walkables,before.walks);assert.equal(c.kit.owned.length,before.owned.length+2);assert.equal(out.contacts.length,30);
 for(const m of out.meshes){const os=out.contacts.filter(o=>o.dafotangEastCabinetMesh===m.uuid);assert.equal(os.length,1);const o=os[0],s=o.triangleSupport,p=m.geometry.attributes.position,ix=m.geometry.index;assert.ok(o.equals(new T.Box3().setFromObject(m)));assert.equal(s.id,m.name+'/'+m.uuid);assert.deepEqual(s.offset.toArray(),[221.9,0,241.1]);assert.equal(s.template.triangles.length,12);for(let i=0;i<12;i++)for(const[k,v]of[[0,s.template.triangles[i].triangle.a],[1,s.template.triangles[i].triangle.b],[2,s.template.triangles[i].triangle.c]])assert.ok(v.equals(new T.Vector3().fromBufferAttribute(p,ix.getX(i*3+k))));}
 const body=(x,y,z)=>new T.Box3().setFromCenterAndSize(new T.Vector3(x+221.9,y,z+241.1),new T.Vector3(.01,.01,.01));const hit=b=>out.contacts.some(o=>triangleBodyIntersects(o.triangleSupport,b));assert.ok(hit(body(-9.65,3,-1.23)));assert.ok(hit(body(-9.60,3,-1.785)));assert.equal(hit(body(-9.59,3,-1.23)),false);assert.equal(hit(body(-9.4,3,-1.23)),false);
 let merged;try{merged=mergeByMaterial(out.group);assert.equal(merged.children.length,2);assert.ok(merged.children.every(m=>c.kit.owned.includes(m.material)&&!before.owned.includes(m.material)));assert.equal(merged.children.reduce((n,m)=>n+m.geometry.attributes.position.count,0),1080);assert.ok(hit(body(-9.65,3,-1.23)));}finally{merged?.traverse(m=>m.geometry?.dispose());}
 const snap=[...c.f.children];assert.throws(()=>buildDafotangEastCabinets(c));assert.deepEqual(c.f.children,snap);
 }finally{c.dispose();}
});
test('R257 rejects altered synthetic nested host without publication',()=>{
 for(const change of[c=>c.p.id='wrong',c=>c.f.position.x++,c=>c.kit.root.scale.x=2,c=>c.g.inventory.status='KNOWN',c=>c.g.warmRoomPartitions[0].x++,c=>c.g.historicLayout.arhatPlatforms[1].position[0]++,c=>c.f.children[2].children.pop(),c=>c.f.children[2].children[0].children[0].visible=false,c=>c.f.children[2].children[0].position.x=1,c=>c.f.children[0].userData.dafotangHistoricLayout={},c=>Object.freeze(c.kit.owned),c=>Object.defineProperty(c.g,'eastCabinetsFit',{set(){},configurable:true})]){const c=fixture();try{change(c);const old=[...c.f.children],contacts=[...c.kit.colliders],owned=[...c.kit.owned];assert.throws(()=>buildDafotangEastCabinets(c));assert.deepEqual(c.f.children,old);assert.deepEqual(c.kit.colliders,contacts);assert.deepEqual(c.kit.owned,owned);}finally{c.dispose();}}
});
test('R257 partial publication restores old ownership and releases every allocation',()=>{
 const c=fixture(),old=[...c.f.children],owned=[...c.kit.owned],contacts=[...c.kit.colliders];let gd=0,md=0;const push=c.kit.owned.push;c.kit.owned.push=function(...ms){ms.forEach(m=>m.addEventListener('dispose',()=>md++));Array.prototype.push.apply(this,ms);throw Error('injected publish failure');};c.f.addEventListener('childadded',e=>{if(e.child.name===ID)e.child.traverse(m=>m.geometry?.addEventListener('dispose',()=>gd++));});
 try{assert.throws(()=>buildDafotangEastCabinets(c),/injected publish failure/);assert.deepEqual(c.f.children,old);assert.deepEqual([...c.kit.owned],owned);assert.deepEqual(c.kit.colliders,contacts);assert.equal('eastCabinetsFit'in c.g,false);assert.equal(gd,30);assert.equal(md,2);}finally{c.kit.owned.push=push;c.dispose();}
});
test('R257 construction failure releases geometry allocated before transform',()=>{
 const materials={back:new T.MeshStandardMaterial(),frame:new T.MeshStandardMaterial()},translate=T.BufferGeometry.prototype.translate,dispose=T.BufferGeometry.prototype.dispose,touched=new Set(),released=new Set();let n=0;
 T.BufferGeometry.prototype.translate=function(...args){touched.add(this);if(++n===4)throw Error('injected geometry failure');return translate.apply(this,args);};T.BufferGeometry.prototype.dispose=function(){assert.ok(!released.has(this));released.add(this);return dispose.call(this);};
 try{assert.throws(()=>createDafotangEastCabinets({materials}),/injected geometry failure/);assert.equal(touched.size,4);assert.deepEqual(released,touched);}finally{T.BufferGeometry.prototype.translate=translate;T.BufferGeometry.prototype.dispose=dispose;Object.values(materials).forEach(m=>m.dispose());}assert.throws(()=>createDafotangEastCabinets(),/materials/i);
});
test('R257 HISTORICAL_HOST_VIEW: unique call and old evidence except explicit R258 west inset height delta',()=>{
 const source=n=>fs.readFileSync(new URL('../../src/scene/palace/special/'+n,import.meta.url),'utf8'),host=r259PriorHost(priorUpperCentralBandHostSource(source('RemainingOuterHalls.js')));assert.equal((host.match(/buildDafotangEastCabinets\(c\)/g)||[]).length,1);assert.equal((host.match(/import \{buildDafotangEastCabinets\} from '\.\/DafotangEastCabinets.js';/g)||[]).length,1);const body=host.slice(host.indexOf('function buildCeremonialHall(kit,item,p) {')),blocks=body.match(/^  if\(p.key==='dafotang'\)\{buildDafotangMainBuddha\(c\);[^\n]+\}$/gm)||[];assert.equal(blocks.length,1);assert.ok(blocks[0].includes('buildDafotangWeituo(c);buildDafotangWoodPagodas(c);registerDafotangPhotoSlots(c);buildDafotangEastCabinets(c);'));
 for(const[n,h]of[['DafotangHistoricLayout.js','b4a8363eaa7f74fa11638aeeef5f660dcb45bb1268117a75d633035209c2cfeb'],['DafotangWeituo.js','ba583527d4a1d0cfcd754610528c54cb1e468dd426e61e7009e531131233adc4'],['DafotangWoodPagodas.js','d4a6bc821a2391c07f51566449e9468989796c943b0ff98aa2fc551807d25625'],['DafotangPhotoPresentation.js','2238d98f6d2f383d16d3691853ded2b7115d3500be755fcf04c9b0e177ed1905']])assert.equal(createHash('sha256').update(n==='DafotangHistoricLayout.js'?priorR264LayoutSource(source(n),SOURCE_PATH):source(n)).digest('hex'),h);
 const zone=JSON.parse(fs.readFileSync(new URL('../../data/zones/outer-west.json',import.meta.url),'utf8'));const halls=zone.items.filter(o=>o.name==='大佛堂');assert.equal(halls.length,1);assert.equal(halls[0].colH,7.84);assert.equal(halls[0].ph,.9);near(halls[0].ph+halls[0].colH-.72-.24/2,7.90);
 const oldHost=host.replace("import {buildDafotangEastCabinets} from './DafotangEastCabinets.js';\n",'').replace('registerDafotangPhotoSlots(c);buildDafotangEastCabinets(c);','registerDafotangPhotoSlots(c);');assert.equal(createHash('sha256').update(oldHost).digest('hex'),'204e253f9c48d88147112c8d1c4e43982ea9277be02395f5aa87b4124909579c');
});

// Explicit R259 additive host compatibility; no original SHA/other assertion changes.
function r259PriorHost(host){const a="import {buildDafotangMainPlaque} from './DafotangMainPlaque.js';\n",b="  if(p.key==='dafotang')buildDafotangMainPlaque(c);\n";assert.equal(host.split(a).length,2);assert.equal(host.split(b).length,2);return host.replace(a,'').replace(b,'');}
