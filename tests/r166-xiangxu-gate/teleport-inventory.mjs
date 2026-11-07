import assert from 'node:assert/strict';
import fs from 'node:fs';
import {Box3} from 'three';

// Test-only contract. The fixed descriptors are independent of this runtime;
// never derive the expected contribution by subtracting observed totals.
const F=JSON.parse(fs.readFileSync(new URL('./teleport-owner-fixture.json',import.meta.url)));
const ID='xiangxu-glazed-gate-fit', SOURCE='FC-4D8561AE5D';
const LEGACY={'east-six':[2596,127],garden:[1781,111]};
const bounds=b=>[...b.min.toArray(),...b.max.toArray()];
const key=r=>JSON.stringify([r.role,r.kind,r.bounds]);
const same=(a,b,message)=>assert.deepEqual(a,b,message);
const marked=c=>c?.xiangxuMesh!==undefined||c?.triangleSupport?.id?.startsWith(ID+'/');
const architecture=r=>r?.sourceObjectId===SOURCE||r?.id===ID||r?.name==='祥旭门';
function finiteBox(b){const a=bounds(b);assert.equal(a.length,6);assert.ok(a.every(Number.isFinite),'finite bounds');for(let i=0;i<3;i++)assert.ok(a[i]<=a[i+3],'ordered bounds');return a;}
function inReserve(a){for(let i=0;i<3;i++)assert.ok(a[i]>=F.reserve[i]&&a[i+3]<=F.reserve[i+3],'fixed E46 reserve');}
function consume(map,k){assert.ok(map.get(k)>0,'fixed role/bounds membership');map.set(k,map.get(k)-1);}

/** Validate raw loaded.data owners against actual CollisionManager rows.
 * CM clones stone walkables without xiangxuMesh; match their exact descriptor
 * uniquely, including the zone tag, rather than trusting an absent field. */
export function assertXiangxuInventory(loaded,cm,expectedLoaded){
 try{
  assert.ok(loaded instanceof Map);same([...loaded.keys()].sort(),[...expectedLoaded].sort(),'expected loaded zones');
  assert.ok(expectedLoaded.includes('east-six'));assert.equal(new Set(expectedLoaded).size,expectedLoaded.length);
  for(const tag of expectedLoaded)assert.ok(Object.hasOwn(LEGACY,tag),'only the two actual neighbors');
  assert.ok(cm.colliders.every(c=>expectedLoaded.includes(c.tag)),'no unknown or rolled-back collider tags');
  assert.ok(cm.walkables.every(w=>expectedLoaded.includes(w.tag)),'no unknown or rolled-back support tags');
  for(const [tag,{data}]of loaded){
   const identities=(data.group.userData.architecture??[]).filter(architecture);
   if(tag==='east-six'){
    assert.equal(identities.length,1,'one retained E46 architecture');const m=identities[0];
    for(const [field,want]of Object.entries({id:ID,sourceObjectId:SOURCE,name:'祥旭门',scope:'LIMITED_CLOSED_GATE_FRONT_AND_OWN_SHORT_WINGS',portalCount:1,leafCount:2,pose:'CLOSED_PHOTOGRAPH_DATE_UNKNOWN',surveyed:false,wholeObjectAccepted:false,compoundComplete:false,currentAdmissionVerified:false,newMapItems:0,newRooms:0}))same(m[field],want,'E46 '+field);
   }else{
    assert.equal(identities.length,0,'no E46 architecture in garden');
    assert.equal(data.colliders.filter(marked).length,0,'no E46 contact in garden');
    assert.equal(data.walkables.filter(w=>w?.xiangxuMesh!==undefined).length,0,'no E46 support in garden');
   }
  }
  // Close every collider occurrence against its own zone's source array.
  // Source references may repeat, even across zones. Match multiplicities,
  // not global uniqueness, and preserve addCollider's empty-box omission.
  const colliderSourceClosure={};
  for(const [tag,{data}]of loaded){
   const remaining=new Map();let sourceOccurrences=0;
   for(const raw of data.colliders){
    const box=raw.isBox3?raw:new Box3().setFromObject(raw);
    if(box.isEmpty())continue;
    remaining.set(raw,(remaining.get(raw)??0)+1);sourceOccurrences++;
   }
   const rows=cm.colliders.filter(c=>c.tag===tag);
   for(const c of rows){assert.ok(remaining.has(c.mesh),'registered collider belongs to its zone source');assert.ok(remaining.get(c.mesh)>0,'no duplicated registered source occurrence');remaining.set(c.mesh,remaining.get(c.mesh)-1);}
   assert.ok([...remaining.values()].every(n=>n===0),'every nonempty source collider occurrence is registered');
   colliderSourceClosure[tag]={sourceOccurrences,registeredOccurrences:rows.length,distinctSourceReferences:remaining.size};
  }
  const data=loaded.get('east-six').data, rawContacts=data.colliders.filter(marked), rawSupports=data.walkables.filter(w=>w?.xiangxuMesh!==undefined);
  assert.equal(rawContacts.length,111,'exact source collider contribution');assert.equal(rawSupports.length,2,'two source stone tops');
  const expected=new Map();for(const r of F.contacts)expected.set(key(r),(expected.get(key(r))??0)+1);
  assert.equal(F.contacts.length,111);assert.equal(F.supports.length,2);
  const owners=new Map(), registered=new Set(), ownerMap=[], supportMap=[];let triangles=0,stones=0;
  for(const raw of rawContacts){
   assert.equal(typeof raw.xiangxuMesh,'string');assert.ok(raw.xiangxuMesh.length);assert.ok(!owners.has(raw.xiangxuMesh),'distinct source owner UUID');
   const a=finiteBox(raw);inReserve(a);let role,kind;
   if(raw.triangleSupport){
    const shape=raw.triangleSupport;const parts=shape.id.split('/');same(parts.length,3,'triangle owner ID parts');same(parts[0],ID);same(parts[2],raw.xiangxuMesh,'triangle owner UUID');role=parts[1];kind='triangle';
    same(shape.offset.toArray(),F.pose,'fixed component translation');same(finiteBox(shape.box),a,'source triangle bounds');assert.ok(shape.template,'source triangle template');triangles++;
   }else{
    kind='stone';const matches=F.contacts.filter(r=>r.kind==='stone'&&JSON.stringify(r.bounds)===JSON.stringify(a));assert.equal(matches.length,1,'one fixed low stone');role=matches[0].role;stones++;
   }
   consume(expected,key({role,kind,bounds:a}));owners.set(raw.xiangxuMesh,{raw,role,kind,bounds:a});
   const matches=cm.colliders.filter(c=>c.mesh===raw);assert.equal(matches.length,1,'one registered row per source contact');const c=matches[0];registered.add(c);
   ownerMap.push({uuid:raw.xiangxuMesh,role,kind,sourceIndex:data.colliders.indexOf(raw),registeredIndex:cm.colliders.indexOf(c)});
   same(c.tag,'east-six');same(finiteBox(c.box),a,'registered contact bounds');
   if(raw.triangleSupport){const shape=c.triangleSupport;assert.ok(shape,'registered triangle');same(shape.id,raw.triangleSupport.id);same(shape.offset.toArray(),F.pose,'registered triangle offset');same(finiteBox(shape.box),a);assert.equal(shape.template,raw.triangleSupport.template,'same owned triangle template');}
   else assert.equal(c.triangleSupport,undefined,'low stones remain ordinary boxes');
  }
  assert.ok([...expected.values()].every(n=>n===0),'all fixed role/bounds descriptors consumed');same([triangles,stones],[109,2]);
  const markedRegistered=cm.colliders.filter(c=>marked(c.mesh)||c.triangleSupport?.id?.startsWith(ID+'/'));
  assert.equal(markedRegistered.length,111,'no extra E46 registered contacts');assert.ok(markedRegistered.every(c=>registered.has(c)),'no forged E46 registration');
  const supportOwners=new Set(),supportRows=new Set();
  for(const raw of rawSupports){
   assert.ok(!supportOwners.has(raw.xiangxuMesh),'distinct support owners');supportOwners.add(raw.xiangxuMesh);
   const owner=owners.get(raw.xiangxuMesh);assert.ok(owner&&owner.kind==='stone','support belongs to a low stone');
   same(raw.type,'box');same(raw.rescue,false);const a=finiteBox(raw.box);inReserve(a);
   const top=[...owner.bounds];top[1]=top[4];same(a,top,'support exactly on its visible stone top');
   const want=F.supports.find(s=>s.role===owner.role);assert.ok(want);same(a,want.bounds,'fixed support bounds');
   // Search all tags so a wrong-tag duplicate cannot masquerade as absence.
   const matches=cm.walkables.filter(w=>w.type==='box'&&w.box&&JSON.stringify(bounds(w.box))===JSON.stringify(a));
   assert.equal(matches.length,1,'unique exact registered stone top');const w=matches[0];same(w.tag,'east-six');same(w.rescue,false);assert.ok(!supportRows.has(w));supportRows.add(w);
   supportMap.push({uuid:raw.xiangxuMesh,role:owner.role,sourceIndex:data.walkables.indexOf(raw),registeredIndex:cm.walkables.indexOf(w)});
  }
  same(supportOwners.size,2);same(supportRows.size,2);
  const zones={};
  for(const tag of expectedLoaded){
   const e46=tag==='east-six'?[registered.size,supportRows.size]:[0,0];
   const total=[cm.colliders.filter(c=>c.tag===tag).length,cm.walkables.filter(w=>w.tag===tag).length];
   const baseline=total.map((n,i)=>n-e46[i]);same(baseline,LEGACY[tag],'unchanged '+tag+' baseline inventory');
   zones[tag]={baseline,e46,total};
  }
  const baseline=Object.values(zones).reduce((a,r)=>a.map((v,i)=>v+r.baseline[i]),[0,0]);
  const total=[cm.colliders.length,cm.walkables.length];same(total,baseline.map((v,i)=>v+[111,2][i]),'exact full inventory');
  return{baseline,e46:[111,2],total,triangles,stones,zones,ownerMap,supportMap,colliderSourceClosure};
 }catch(error){if(error instanceof assert.AssertionError)error.code='XIANGXU_INVENTORY';throw error;}
}
