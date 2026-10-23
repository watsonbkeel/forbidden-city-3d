// Candidate-only registry composition. Frozen actor records and release coverage
// remain byte-equivalent; conflicts cannot replace a production record.
import assert from 'node:assert/strict';
import {createHash} from 'node:crypto';
export const R53_LIFE_IDS=Object.freeze(['xianfu-eunuch-01','xianfu-maid-01','taiji-maid-01','taiji-eunuch-01','jingyang-eunuch-01','jingyang-eunuch-02']);
export const FROZEN_71_HASH='bc42abd8b0fcd448d95eb72b95577c97992acd93f95845301229d960c7013098';
export const FROZEN_R52_SHA='2a7c6fd09086e6b73c0745aa7cfca4534bbfd9a6';
export const canonicalHash=value=>createHash('sha256').update(JSON.stringify(value)).digest('hex');
export function assertR53LifeActorBaseline(registry){
 assert.ok([71,77].includes(registry.actors.length),'Registry must have 71 or 77 actors');
 assert.equal(canonicalHash(registry.actors.slice(0,71)),FROZEN_71_HASH,'Original frozen71 records changed');
 if(registry.actors.length===77)assert.deepEqual(registry.actors.slice(71).map(a=>a.id),R53_LIFE_IDS,'Integrated registry must contain exactly the six R53 IDs');
}
export function withR53LifeCandidates(base,fragment){
 assertR53LifeActorBaseline(base);const registry={...base};
 for(const key of ['actors','anchors','surfaces','paths','seats','evidence']){const rows=[...base[key]],map=new Map(rows.map(v=>[v.id,v]));for(const row of fragment[key]){if(map.has(row.id))assert.deepEqual(map.get(row.id),row,'Conflicting candidate '+key+'/'+row.id);else{rows.push(row);map.set(row.id,row);}}registry[key]=rows;}
 assert.deepEqual(registry.actors.slice(0,base.actors.length),base.actors);assert.equal(registry.scope,base.scope);assertR53LifeActorBaseline(registry);assert.equal(registry.actors.length,77);return registry;
}
export function lifeCandidateViews(fragment,adapter){
 const transform=(a,p)=>[a.position[0]+p[0]*Math.cos(a.rotationYRad)+p[2]*Math.sin(a.rotationYRad),a.position[1]+p[1],a.position[2]-p[0]*Math.sin(a.rotationYRad)+p[2]*Math.cos(a.rotationYRad)];
 return fragment.contexts.flatMap(c=>{const a=adapter.resolveAnchor(c.sceneRef+'-r53-hall');assert.equal(a.status,'ready');return c.views.map(v=>({...v,zoneRef:c.zoneRef,camera:transform(a,v.cameraLocalMeters),target:transform(a,v.targetLocalMeters)}));});
}
