import test from 'node:test';
import assert from 'node:assert/strict';
import fs from 'node:fs';
import crypto from 'node:crypto';
const read=p=>JSON.parse(fs.readFileSync(new URL('../'+p,import.meta.url)));
const cfg=read('data/interiors/huangji.json');
const hall=read('data/zones/ningshou.json').items.find(x=>x.name==='皇极殿');
const parse=p=>{const b=fs.readFileSync(new URL('../'+p,import.meta.url)),n=b.readUInt32LE(12);return{bytes:b,json:JSON.parse(b.subarray(20,20+n)),tail:b.subarray(20+n)}};
const old=parse('public/models/interiors/huangji.glb');
const expectedTZ=hall.d/2-Math.min(3.4,hall.d*.36),delta=expectedTZ-10.55;
test('Huangji S throne registration follows the current B back-door formula',()=>{
 assert.equal(hall.backDoor,true);assert.ok(Math.abs(expectedTZ-9.75)<1e-12);
 assert.ok(Math.abs(cfg.throne.tz-expectedTZ)<1e-12,'S throne still uses the pre-R6 no-back-door position');
 assert.ok(Math.abs(cfg.throne.ztb0-(expectedTZ-1.2))<1e-12);assert.ok(Math.abs(cfg.throne.ztb1-(expectedTZ+1.3))<1e-12);
 assert.notEqual(cfg.model,'/models/interiors/huangji.glb');
});
test('only exact furniture/proxy root translations differ; floors, geometry and materials are byte-retained',()=>{
 assert.notEqual(cfg.model,'/models/interiors/huangji.glb');
 assert.equal(crypto.createHash('sha256').update(old.bytes).digest('hex'),'53213f0c2247820ca15cd44c1b99e8104e309a93cf9ac962b9a24aaa59f1cf80');
 const now=parse('public'+cfg.model);assert.deepEqual(now.tail,old.tail);
 const expected=structuredClone(old.json);assert.equal(expected.nodes.length,15);assert.deepEqual(expected.scenes[0].nodes,[...Array(15).keys()]);
 let shifted=0;for(const node of expected.nodes){if(['floor_base','floor_tiles'].includes(node.name))continue;assert.equal(node.children,undefined);const t=node.translation??[0,0,0];node.translation=[t[0],t[1],t[2]+delta];shifted++;}
 assert.equal(shifted,13);assert.deepEqual(now.json,expected);
 assert.equal(now.json.nodes.filter(n=>n.name.startsWith('COL_')).length,5);assert.equal(now.json.nodes.filter(n=>n.name.startsWith('WALK_')).length,1);
});

test('registration converter rejects a second shift, wrong source bytes and changed hall contract',async()=>{
 const {alignHuangji}=await import('../assets-src/interiors/align_huangji_backdoor.mjs');
 const r=alignHuangji(old.bytes,hall);assert.deepEqual(r.bytes,parse('public'+cfg.model).bytes);
 assert.throws(()=>alignHuangji(r.bytes,hall),/exact pre-R6/);
 const bad=Buffer.from(old.bytes);bad[bad.length-1]^=1;assert.throws(()=>alignHuangji(bad,hall),/exact pre-R6/);
 for(const mutation of [{backDoor:false},{d:27},{w:50},{rot:Math.PI}])assert.throws(()=>alignHuangji(old.bytes,{...hall,...mutation}));
});
test('current S proxies preserve the exterior route and permit a rear-door crossing around all four gold columns',async()=>{
 const THREE=await import('three'),{buildWorld,walkStraight}=await import('./lib/world.mjs');
 const W=await buildWorld(),j=parse('public'+cfg.model).json;
 const floor=W.cm.getGroundHeight(cfg.frame.x,cfg.frame.z,0,999);assert.equal(floor,1.5);
 let col=0,walk=0;
 for(const n of j.nodes){
  if(!/^(COL_|WALK_)/.test(n.name))continue;
  const a=j.accessors[j.meshes[n.mesh].primitives[0].attributes.POSITION],t=n.translation??[0,0,0],off=[cfg.frame.x+t[0],floor+t[1],cfg.frame.z+t[2]];
  const box=new THREE.Box3(new THREE.Vector3(...a.min.map((v,i)=>v+off[i])),new THREE.Vector3(...a.max.map((v,i)=>v+off[i])));
  if(n.name.startsWith('COL_')){W.cm.addCollider(box,'interior:huangji');col++;}else{W.cm.addWalkable({type:'box',box,rescue:false},'interior:huangji');walk++;}
 }
 assert.equal(col,5);assert.equal(walk,1);
 const outside=read('tests/fixtures/r6-ningshou-route-delta.json').after.pts;
 const x=cfg.frame.x,front=[[x,269],[x,282],[x+5.5,282],[x+5.5,299.9],[x,299.9],[x,307]],inside=[...front,...front.slice(0,-1).reverse()];
 for(const [label,pts] of [['existing side portal',outside],['rear-door loop',inside]]){
  let feet=0;for(let i=1;i<pts.length;i++){const v=walkStraight(W,pts[i-1],pts[i],{feet0:feet,step:.05});assert.ok(v.reached>=v.total-.1,`${label} leg${i}: ${JSON.stringify(v)}`);feet=v.feet;}assert.equal(feet,0);
 }
});
