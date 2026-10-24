import assert from 'node:assert/strict';
import { test } from 'node:test';
import { createRequire, registerHooks } from 'node:module';
import fs from 'node:fs';
const { preloadInteriors } = createRequire(import.meta.url)('./lib/stepwalk-runner.cjs');
registerHooks({load(url,ctx,next){if(url.endsWith('.json'))return{format:'module',source:`export default ${fs.readFileSync(new URL(url),'utf8')}`,shortCircuit:true};return next(url,ctx)}});
const { CollisionManager } = await import('../src/utils/Collision.js');
const THREE = await import('three');
const { TAIHE_CORE: P } = await import('../src/scene/palace/special/TaiheCoreProfile.js');
const { captureTaiheControl } = await import('./lib/taihe-core-fixture.mjs');
const { captureTaihePermanentNavigation: capture, assertTaihePermanentNavigationRetained: retained } = await import('./lib/taihe-permanent-navigation.mjs');
const cfg=JSON.parse(fs.readFileSync(new URL('../data/interiors/taihe.json',import.meta.url)));
function setup(){const a=captureTaiheControl('太和殿'),cm=new CollisionManager();cm.addColliders(a.builder.colliders);cm.addWalkables(a.builder.walkables);cm.addWalkable({type:'box',box:new THREE.Box3(new THREE.Vector3(-31.5,0,-18.5),new THREE.Vector3(31.5,P.frame.floorY,18.5))});return{...a,cm,floor:cm.walkables.at(-1)};}
test('actual permanent builder supplies exact permanent columns, dais, four sloped rails, four incense envelopes, 21 steps and cover',()=>{
 const s=setup();try{const before=capture(s.cm,cfg,P.frame.floorY,P);assert.equal(before.colliders.length,46);assert.equal(before.walkables.length,30);assert.deepEqual(retained(s.cm,before,cfg,P.frame.floorY,P),{permanentCol:46,permanentWalk:30,permanentRetained:true});}finally{s.builder.dispose();}
});
for(const mutation of ['missing-all','one-column','one-step','tagged-col','tagged-step','rescue','duplicate','wrong-floor','wrong-frame','remove-floor','wrong-floor-height','fixed-floor-bypass','one-table','one-rail','missing-cover','tagged-cover','wrong-cover-height','duplicate-cover'])test(`preload rejects initially invalid permanent navigation: ${mutation}`,()=>{
 const s=setup();try{const before=capture(s.cm,cfg,P.frame.floorY,P);let floor=P.frame.floorY,config=cfg;
  if(mutation==='missing-all'){s.cm.colliders=s.cm.colliders.filter(o=>!before.colliders.some(r=>r.object===o));s.cm.walkables=s.cm.walkables.filter(o=>!before.walkables.some(r=>r.object===o));}
  if(mutation==='one-column')s.cm.colliders.splice(s.cm.colliders.indexOf(before.colliders[0].object),1);
  if(mutation==='one-step')s.cm.walkables.splice(s.cm.walkables.indexOf(before.walkables[0].object),1);
  if(mutation==='tagged-col')before.colliders[0].object.tag='interior:taihe';
  if(mutation==='tagged-step')before.walkables[0].object.tag='zone:temporary';
  if(mutation==='rescue')before.walkables.find(r=>r.object.rescue===false).object.rescue=true;
  if(mutation==='duplicate')s.cm.colliders.push({...before.colliders[0].object});
  if(mutation==='wrong-floor')floor=0;
  if(mutation==='wrong-frame')config={...cfg,frame:{...cfg.frame,z:11}};
  if(mutation==='remove-floor'||mutation==='fixed-floor-bypass')s.cm.walkables.splice(s.cm.walkables.indexOf(s.floor),1);
  if(mutation==='wrong-floor-height')s.floor.box.max.y-=.1;
  if(mutation==='fixed-floor-bypass')config={...cfg,floor:{mode:'fixed',y:P.frame.floorY}};
  if(mutation==='one-table')s.cm.colliders.splice(s.cm.colliders.indexOf(before.colliders.at(-1).object),1);
  if(mutation==='one-rail')s.cm.colliders.splice(s.cm.colliders.indexOf(before.colliders[7].object),1);
  const cover=before.walkables.at(-1).object;
  if(mutation==='missing-cover')s.cm.walkables.splice(s.cm.walkables.indexOf(cover),1);
  if(mutation==='tagged-cover')cover.tag='interior:taihe';
  if(mutation==='wrong-cover-height')cover.y1+=.05;
  if(mutation==='duplicate-cover')s.cm.walkables.push({...cover});
  assert.throws(()=>capture(s.cm,config,floor,P),/Taihe/);
 }finally{s.builder.dispose();}
});
for(const mutation of ['same-box-new-object','new-box','bounds','remove-reinsert-duplicate','walk-bounds'])test(`preload rejects navigation changes during load: ${mutation}`,()=>{
 const s=setup();try{const before=capture(s.cm,cfg,P.frame.floorY,P),c=before.colliders[0];
  if(mutation==='same-box-new-object')s.cm.colliders[s.cm.colliders.indexOf(c.object)]={...c.object};
  if(mutation==='new-box')c.object.box=c.object.box.clone();
  if(mutation==='bounds')c.object.box.max.x+=.01;
  if(mutation==='remove-reinsert-duplicate')s.cm.colliders.push({...c.object,box:c.box.clone()});
  if(mutation==='walk-bounds')before.walkables[0].object.box.max.y+=.01;
  assert.throws(()=>retained(s.cm,before,cfg,P.frame.floorY,P),/Taihe/);
 }finally{s.builder.dispose();}
});
const taihe={id:'taihe',state:'loaded',col:0,walk:0,permanentCol:46,permanentWalk:30,permanentRetained:true};
test('preload accepts visual-only Taihe only with verified permanent navigation and keeps ordinary interior collider requirement',async()=>{
 const rows=[taihe,{id:'qianqing',state:'loaded',col:2,walk:1}];assert.equal(await preloadInteriors({evaluate:async()=>rows}),rows);
});
for(const change of [{state:'failed'},{col:1},{walk:1},{permanentCol:0},{permanentWalk:0},{permanentRetained:false}])test('preload does not blanket-exempt Taihe '+JSON.stringify(change),async()=>{
 await assert.rejects(preloadInteriors({evaluate:async()=>[{...taihe,...change}]}),/S 档内景预加载失败/);
});
test('other S hall with no tagged collider still fails',async()=>{
 await assert.rejects(preloadInteriors({evaluate:async()=>[taihe,{id:'qianqing',state:'loaded',col:0,walk:1}]}),/qianqing/);
});
