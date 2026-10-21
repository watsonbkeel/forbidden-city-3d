import test from 'node:test';import assert from 'node:assert/strict';import {readFileSync} from 'node:fs';
import {buildWorld,walkStraight} from './lib/world.mjs';import {buildAutoRoutes,zoneRoutes} from './lib/auto-routes.mjs';
import {resolveRemainingProfile} from '../src/scene/palace/special/RemainingNingshouHalls.js';
// Independently regenerated from actual frozen R47 and deep-compared before
// reuse. R47 itself retained these exact R46 route objects, not just their names.
const baseline=JSON.parse(readFileSync(new URL('./fixtures/r47-r46-auto-routes.json',import.meta.url)));
const W=await buildWorld(),routes=buildAutoRoutes(W,W.zones.map(z=>z.json)).filter(r=>r.gateProfile!=='zhaode');
const changedHall=new Set(['皇极殿','宁寿宫','养性殿','乐寿堂','慈宁宫','大佛堂','寿安宫','养心殿','武英殿','敬思殿','文华殿','主敬殿']);
test('R48 retains all63 actual R47 route names and every unaffected exact route object',()=>{
 assert.equal(routes.length,63);assert.deepEqual(routes.map(r=>r.name).sort(),baseline.map(r=>r.name).sort());
 let retained=0,changed=0;for(const old of baseline){const current=routes.find(r=>r.name===old.name);
  // Linxi geometry is unchanged: only the approach planner detours around the
  // explicitly changed Hanqing/Yanshou front-house footprint in its courtyard.
  const allowed=changedHall.has(old.hall)||old.hall==='临溪亭'||old.name.startsWith('[跨区]');
  if(!allowed){assert.deepEqual(current,old,old.name);retained++;}else{assert.notDeepEqual(current,old,old.name);changed++;}
 }assert.equal(retained,48);assert.equal(changed,15);
});
test('R48 raised offset entry planner must carry actual feet between connected segments',()=>{
 const item=W.halls.find(h=>h.item.name==='宁寿宫').item,p=resolveRemainingProfile('ningshou',item),a=p.navigation.approachPoints;
 const i=a.findIndex((q,j)=>j<a.length-1&&q.feetY>=1&&a[j+1].feetY>=1);assert.ok(i>=0);const start=[a[i].x,a[i].z],end=[a[i+1].x,a[i+1].z];
 assert.ok(walkStraight(W,start,end,{feet0:0}).reached<0,'courtyard-height restart falsely collides at the raised platform');
 const real=walkStraight(W,start,end,{feet0:a[i].feetY});assert.ok(real.reached>=real.total-.05);assert.equal(real.feet,a[i+1].feetY);
});
test('R48 registered Huangji side-passage planner still rejects both physically blocked side portals',()=>{
 const z=W.zones.find(z=>z.json.id==='ningshou').json;
 try{for(const side of['东','西']){const wall=z.items.find(i=>i.name===`皇极殿${side}隔墙`),gap=wall.gaps.find(g=>g.name===`${side}垂花门通道暂拟`);W.cm.addCollider(new W.THREE.Box3(new W.THREE.Vector3(gap.at-gap.w/2,0,wall.from[1]-.4),new W.THREE.Vector3(gap.at+gap.w/2,8,wall.from[1]+.4)),'r48-negative-side-portals');}
  assert.throws(()=>zoneRoutes(W,z),/No clear registered Huangji side passage/);
 }finally{W.cm.removeByTag('r48-negative-side-portals');}
});
