import test from 'node:test';
import assert from 'node:assert/strict';
import fs from 'node:fs';
import * as T from 'three';
import {assertXiangxuInventory} from './teleport-inventory.mjs';
const F=JSON.parse(fs.readFileSync(new URL('./teleport-owner-fixture.json',import.meta.url)));
const box=a=>new T.Box3(new T.Vector3(...a.slice(0,3)),new T.Vector3(...a.slice(3)));
// Only descriptor contracts: no builder, ZoneManager, World or browser. The
// real neighboring-zone test separately exercises production registration.
function fixture(garden=true){
 const architecture=[{id:F.id,sourceObjectId:F.sourceObjectId,name:'祥旭门',scope:'LIMITED_CLOSED_GATE_FRONT_AND_OWN_SHORT_WINGS',portalCount:1,leafCount:2,pose:'CLOSED_PHOTOGRAPH_DATE_UNKNOWN',surveyed:false,wholeObjectAccepted:false,compoundComplete:false,currentAdmissionVerified:false,newMapItems:0,newRooms:0}];
 const east={group:{userData:{architecture}},colliders:[],walkables:[]};
 const cm={colliders:[],walkables:[]};
 for(const [i,c]of F.contacts.entries()){
  const raw=box(c.bounds);raw.xiangxuMesh=`owner-${i}`;
  if(c.kind==='triangle')raw.triangleSupport={id:`${F.id}/${c.role}/${raw.xiangxuMesh}`,offset:new T.Vector3(...F.pose),box:raw.clone(),template:{role:c.role}};
  east.colliders.push(raw);cm.colliders.push({mesh:raw,box:raw.clone(),tag:'east-six',...(raw.triangleSupport?{triangleSupport:{...raw.triangleSupport,offset:raw.triangleSupport.offset.clone(),box:raw.clone()}}:{})});
 }
 for(const s of F.supports){const i=F.contacts.findIndex(c=>c.role===s.role),raw={type:'box',box:box(s.bounds),rescue:false,xiangxuMesh:`owner-${i}`};east.walkables.push(raw);cm.walkables.push({type:'box',box:raw.box.clone(),rescue:false,tag:'east-six'});}
 const loaded=new Map([['east-six',{data:east}]]);
 for(const [tag,counts]of [['east-six',[2596,127]],...(garden?[['garden',[1781,111]]]:[])]){
  const data=tag==='east-six'?east:{group:{userData:{architecture:[]}},colliders:[],walkables:[]};
  if(tag==='garden')loaded.set(tag,{data});
  for(let i=0;i<counts[0];i++){const raw=box([i,0,0,i+.1,1,.1]);data.colliders.push(raw);cm.colliders.push({mesh:raw,box:raw.clone(),tag});}
  for(let i=0;i<counts[1];i++){const raw={type:'box',box:box([i,1,0,i+.1,1,.1]),rescue:true};data.walkables.push(raw);cm.walkables.push({...raw,box:raw.box.clone(),tag});}
 }
 return{loaded,cm,east,expected:garden?['east-six','garden']:['east-six']};
}
const check=s=>assertXiangxuInventory(s.loaded,s.cm,s.expected);
test('descriptor contract preserves both legacy inventories and proves the exact additive group',()=>{for(const [garden,base,total]of[[true,[4377,238],[4488,240]],[false,[2596,127],[2707,129]]]){const p=check(fixture(garden));assert.deepEqual(p.baseline,base);assert.deepEqual(p.e46,[111,2]);assert.deepEqual(p.total,total);assert.equal(p.triangles,109);assert.equal(p.stones,2);}});
const mutations={
 'missing architecture':s=>s.east.group.userData.architecture.pop(),
 'duplicate architecture':s=>s.east.group.userData.architecture.push({...s.east.group.userData.architecture[0]}),
 'wrong architecture identity':s=>s.east.group.userData.architecture[0].sourceObjectId='wrong',
 'wrong architecture pose':s=>s.east.group.userData.architecture[0].pose='OPEN',
 'missing source collider':s=>s.east.colliders.shift(),
 'duplicated source owner':s=>s.east.colliders[1].xiangxuMesh=s.east.colliders[0].xiangxuMesh,
 'extra source collider':s=>s.east.colliders.push(s.east.colliders[0]),
 'missing registered collider':s=>s.cm.colliders.shift(),
 'duplicate registered collider':s=>s.cm.colliders.push(s.cm.colliders[0]),
 'forged registered owner':s=>s.cm.colliders[0].mesh={...s.cm.colliders[0].mesh},
 'baseline falsely relabeled E46':s=>s.east.colliders.at(-1).xiangxuMesh='forged-owner',
 'wrong role':s=>s.east.colliders[0].triangleSupport.id=s.east.colliders[0].triangleSupport.id.replace('short-wing-stone-foot','invented'),
 'changed triangle owner':s=>s.east.colliders[0].triangleSupport.id+='wrong',
 'changed triangle offset':s=>s.east.colliders[0].triangleSupport.offset.x+=1,
 'changed source bounds':s=>s.east.colliders[0].min.x+=.01,
 'changed registered bounds':s=>s.cm.colliders[0].box.min.x+=.01,
 'changed registered triangle owner':s=>s.cm.colliders[0].triangleSupport.id+='wrong',
 'changed registered triangle offset':s=>s.cm.colliders[0].triangleSupport.offset.z+=1,
 'changed low stone bounds':s=>s.east.colliders.find(c=>c.xiangxuMesh&&!c.triangleSupport).max.y+=.01,
 'missing source support':s=>s.east.walkables.shift(),
 'duplicate source support':s=>s.east.walkables.push(s.east.walkables[0]),
 'support owner mismatch':s=>s.east.walkables[0].xiangxuMesh=s.east.colliders[0].xiangxuMesh,
 'support top altered':s=>s.east.walkables[0].box.max.y+=.01,
 'source rescue enabled':s=>s.east.walkables[0].rescue=true,
 'registered rescue enabled':s=>s.cm.walkables[0].rescue=true,
 'wrong registered support type':s=>s.cm.walkables[0].type='ramp',
 'missing registered support':s=>s.cm.walkables.shift(),
 'ambiguous support mapping':s=>s.cm.walkables.push({...s.cm.walkables[0],box:s.cm.walkables[0].box.clone()}),
 'wrong collider tag':s=>s.cm.colliders[0].tag='garden',
 'wrong support tag':s=>s.cm.walkables[0].tag='garden',
 'unknown registration tag':s=>s.cm.colliders.at(-1).tag='unknown',
 'baseline loss compensated by E46 duplicate':s=>{s.cm.colliders.pop();s.cm.colliders.push(s.cm.colliders[0]);},
 'baseline support loss compensated by E46 duplicate':s=>{s.cm.walkables.pop();s.cm.walkables.push(s.cm.walkables[0]);},
 'baseline count changes with E46 intact':s=>s.cm.colliders.pop(),
 'garden source ownership leak':s=>s.loaded.get('garden').data.colliders[0].xiangxuMesh='foreign-owner',
 'garden architecture leak':s=>s.loaded.get('garden').data.group.userData.architecture.push({...s.east.group.userData.architecture[0]}),
 'garden residual after rollback':s=>s.expected=['east-six'],
 'duplicate retry registration':s=>s.cm.colliders.push(...s.cm.colliders.slice(0,111)),
};
for(const[name,mutate]of Object.entries(mutations))test(`descriptor rejects ${name}`,()=>{const s=fixture();mutate(s);assert.throws(()=>check(s),{code:'XIANGXU_INVENTORY'});});
test('rollback rejects garden registration even when loaded no longer contains garden',()=>{const s=fixture(false);s.cm.walkables.push({type:'box',box:box([1,0,1,2,0,2]),rescue:true,tag:'garden'});assert.throws(()=>check(s),{code:'XIANGXU_INVENTORY'});});

// Preserve source reference multiplicity per zone, not global uniqueness.
for(const tag of ['east-six','garden']){
 const baselineIndex=s=>s.cm.colliders.findIndex(c=>c.tag===tag&&!c.mesh.xiangxuMesh);
 test(`descriptor rejects orphan unmarked E46-box compensation in ${tag}`,()=>{
  const s=fixture(),i=baselineIndex(s),stone=s.cm.colliders.find(c=>c.mesh.xiangxuMesh&&!c.triangleSupport);
  const raw=stone.mesh.clone();assert.equal(raw.xiangxuMesh,undefined);assert.ok(!s.loaded.get(tag).data.colliders.includes(raw));
  s.cm.colliders[i]={mesh:raw,box:stone.box.clone(),tag};
  assert.deepEqual([s.cm.colliders.length,s.cm.walkables.length],[4488,240]);
  assert.throws(()=>check(s),{code:'XIANGXU_INVENTORY'});
 });
 test(`descriptor rejects cross-zone borrowed baseline owner in ${tag}`,()=>{
  const s=fixture(),i=baselineIndex(s),other=s.cm.colliders.find(c=>c.tag!==tag&&!c.mesh.xiangxuMesh);
  s.cm.colliders[i]={...other,tag};assert.throws(()=>check(s),{code:'XIANGXU_INVENTORY'});
 });
 test(`descriptor rejects duplicate registered baseline occurrence in ${tag}`,()=>{
  const s=fixture(),i=baselineIndex(s),other=s.cm.colliders.find((c,n)=>n!==i&&c.tag===tag&&!c.mesh.xiangxuMesh);
  s.cm.colliders[i]={...other};assert.throws(()=>check(s),{code:'XIANGXU_INVENTORY'});
 });
 test(`descriptor rejects changed source occurrence distribution in ${tag}`,()=>{
  const s=fixture(),data=s.loaded.get(tag).data,i=data.colliders.findIndex(c=>!c.xiangxuMesh);
  data.colliders[i]=data.colliders[i+1];assert.throws(()=>check(s),{code:'XIANGXU_INVENTORY'});
 });
 test(`descriptor rejects missing registration of an extra source occurrence in ${tag}`,()=>{
  const s=fixture(),data=s.loaded.get(tag).data;data.colliders.push(data.colliders.find(c=>!c.xiangxuMesh));
  assert.throws(()=>check(s),{code:'XIANGXU_INVENTORY'});
 });
}
test('descriptor permits repeated legacy source references when every occurrence is registered',()=>{
 const s=fixture();for(const tag of s.expected){const d=s.loaded.get(tag).data,i=d.colliders.findIndex(c=>!c.xiangxuMesh),old=d.colliders[i],replacement=d.colliders[i+1];d.colliders[i]=replacement;const c=s.cm.colliders.find(c=>c.tag===tag&&c.mesh===old);c.mesh=replacement;c.box=replacement.clone();}
 assert.deepEqual(check(s).total,[4488,240]);
});
test('descriptor permits the same legacy source object in two zones with matching per-zone occurrences',()=>{
 const s=fixture(),raw=s.east.colliders.find(c=>!c.xiangxuMesh),d=s.loaded.get('garden').data,old=d.colliders[0];d.colliders[0]=raw;const c=s.cm.colliders.find(c=>c.tag==='garden'&&c.mesh===old);c.mesh=raw;c.box=raw.clone();
 assert.deepEqual(check(s).total,[4488,240]);
});
test('descriptor preserves non-registration of empty source boxes',()=>{
 const s=fixture();for(const {data}of s.loaded.values())data.colliders.push(new T.Box3());assert.deepEqual(check(s).total,[4488,240]);
});
