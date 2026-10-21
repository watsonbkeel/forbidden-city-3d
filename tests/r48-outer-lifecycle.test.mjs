import test from 'node:test';
import assert from 'node:assert/strict';
import * as THREE from 'three';
import {readFileSync} from 'node:fs';
import {CourtKit} from '../src/scene/palace/kit.js';
import {library} from './lib/inner-palace-fixture.mjs';
import * as api from '../src/scene/palace/special/RemainingOuterHalls.js';
import {buildWenyuanPavilion} from '../src/scene/palace/special/WenyuanPavilion.js';
import {buildYudeBath} from '../src/scene/palace/special/YudeBath.js';
const rows=JSON.parse(readFileSync(new URL('../docs/current-state/r48-remaining/outer-scope.json',import.meta.url)));
const names=['宝相楼','吉云楼','慈荫楼','慈宁宫','大佛堂','寿安宫','南薰殿','含清斋','延寿堂','延春阁','文渊阁','浴德堂'];
for(const name of names)test(`R48 ${name} new triangles are nondegenerate and merge/dispose remains balanced`,()=>{
 const row=rows.find(r=>r.name===name),kit=new CourtKit(library(),row.zone),p=api.resolveRemainingProfile(row.zone,row.baselineItem),{f}=p.mode==='replace'?api.buildRemainingHall(kit,row.baselineItem,p):api.augmentRemainingHall(kit,row.baselineItem,(p.key==='wenyuan'?buildWenyuanPavilion:buildYudeBath)(kit,row.baselineItem),p);
 const disposals=new Map(),materials=new Map();
 for(const m of kit.owned){materials.set(m,0);m.addEventListener('dispose',()=>materials.set(m,materials.get(m)+1));}
 const a=new THREE.Vector3(),b=new THREE.Vector3(),c=new THREE.Vector3();
 f.traverse(o=>{if(!o.isMesh)return;if(!disposals.has(o.geometry)){disposals.set(o.geometry,0);o.geometry.addEventListener('dispose',()=>disposals.set(o.geometry,disposals.get(o.geometry)+1));}if(!o.userData.remainingOuterId)return;const g=o.geometry,pos=g.attributes.position,idx=g.index?.array,n=idx?.length??pos.count;for(let k=0;k<n;k+=3){a.fromBufferAttribute(pos,idx?idx[k]:k);b.fromBufferAttribute(pos,idx?idx[k+1]:k+1);c.fromBufferAttribute(pos,idx?idx[k+2]:k+2);assert.ok(b.sub(a).cross(c.sub(a)).lengthSq()>1e-14,`${o.name} degenerate triangle ${k/3}`);}});
 const merged=kit.finish();for(const count of disposals.values())assert.equal(count,1,'raw geometry disposed once by material merge');
 assert.equal(merged.userData.architecture.filter(a=>a.remainingProfile===p.key).length,1);
 assert.ok(merged.children.length<40,'material merging must not keep individual door lattice draws');
 for(const m of kit.owned)if(!materials.has(m)){materials.set(m,0);m.addEventListener('dispose',()=>materials.set(m,materials.get(m)+1));}
 const finalGeos=new Map();merged.traverse(o=>{if(o.geometry){finalGeos.set(o.geometry,0);o.geometry.addEventListener('dispose',()=>finalGeos.set(o.geometry,finalGeos.get(o.geometry)+1));}});
 kit.dispose(merged);for(const count of finalGeos.values())assert.equal(count,1);for(const count of materials.values())assert.equal(count,1);assert.equal(kit.colliders.length,0);assert.equal(kit.walkables.length,0);
});
test('R48 Jiyun unlocated stairs do not become an upper automatic navigation destination',()=>{const row=rows.find(r=>r.name==='吉云楼'),kit=new CourtKit(library(),row.zone);api.buildRemainingHall(kit,row.baselineItem,api.resolveRemainingProfile(row.zone,row.baselineItem));try{assert.equal(kit.rooms.some(r=>r.name.includes('二层')),false);assert.equal(kit.regions.some(r=>r.name?.includes('二层')),false);}finally{kit.dispose(kit.root)}});
