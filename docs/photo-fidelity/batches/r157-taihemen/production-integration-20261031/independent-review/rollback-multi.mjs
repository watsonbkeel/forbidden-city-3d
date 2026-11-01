import assert from 'node:assert/strict';
import * as T from '/workspace/scratch/02a8023d1a85/r158-arrow-integrate/node_modules/three/build/three.module.js';
import {withTaihemenCandidateTransaction as fixed} from '/workspace/scratch/02a8023d1a85/r158-arrow-integrate/src/scene/palace/TaihemenObservedTransaction.js';
import {withTaihemenCandidateTransaction as old} from '/workspace/scratch/02a8023d1a85/r158-arrow-integrate/scripts/photo-fidelity/batches/r157-taihemen/hypothesis/facilities/TaihemenCandidateTransaction.mjs';
function probe(transaction){
 const parent=new T.Group(),profile={fixtures:[{id:'fixture',accepted:false}]},keeper=new T.Mesh(new T.BoxGeometry(),new T.MeshBasicMaterial());parent.add(keeper);parent.userData={retained:42};
 const b={colliders:['old'],walkables:['old'],ownedMaterials:[keeper.material],_own:new Map([['old',keeper.material]])};const original=new Error('ORIGINAL_BUILD'),cleanup=[],events=[],observations=[];let caught;
 try{transaction(b,parent,profile,()=>{
 for(let i=0;i<3;i++){
 const g=new T.BoxGeometry(),m=new T.MeshBasicMaterial(),child=new T.Mesh(g,m);parent.add(child);b.ownedMaterials.push(m);b._own.set(`m${i}`,m);
 for(const [kind,object] of [['g',g],['m',m]]){const error=new Error(`${kind}${i}`);cleanup.push(error);object.addEventListener('dispose',()=>{events.push(kind+i);observations.push({col:b.colliders.length,sup:b.walkables.length,own:b.ownedMaterials.length,cache:b._own.size,profile:structuredClone(profile),metadata:{...parent.userData},children:parent.children.length});throw error;});}
 }
 b.colliders.push('ghost');b.walkables.push('ghost');profile.fixtures[0].productionBinding='ghost';parent.userData.extra=true;throw original;
 });}catch(e){caught=e;}
 const result={message:caught.message,causeOriginal:caught.cause===original,firstOriginal:caught.errors?.[0]===original,errorMessages:caught.errors?.map(x=>x.message),events,remaining:{col:b.colliders.length,sup:b.walkables.length,own:b.ownedMaterials.length,cache:b._own.size,children:parent.children.length,profile,meta:parent.userData},observations};
 if(transaction===fixed){assert.equal(caught.cause,original);assert.equal(caught.errors[0],original);assert.equal(caught.errors.length,7);assert.equal(new Set(caught.errors.slice(1)).size,6);assert.ok(cleanup.every(x=>caught.errors.includes(x)));assert.deepEqual(events,['g0','g1','g2','m0','m1','m2']);for(const o of observations){assert.deepEqual(o,{col:1,sup:1,own:1,cache:1,profile:{fixtures:[{id:'fixture',accepted:false}]},metadata:{retained:42},children:1});}assert.deepEqual(parent.children,[keeper]);}
 return result;
}
const result={old:probe(old),fixed:probe(fixed)};assert.equal(result.old.remaining.col,2);assert.equal(result.old.remaining.sup,2);assert.equal(result.old.events.length,1);assert.equal(result.old.remaining.profile.fixtures[0].productionBinding,'ghost');console.log(JSON.stringify(result,null,2));
