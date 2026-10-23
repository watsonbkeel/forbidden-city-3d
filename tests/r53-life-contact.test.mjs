import assert from 'node:assert/strict';
import fs from 'node:fs';
import test from 'node:test';
test('support contract distinguishes planted sole from an animated swing foot without admitting hovering',async()=>{
 assert.ok(fs.existsSync(new URL('./lib/r53-life-contact.mjs',import.meta.url)),'Walking sole support contract missing');
 const {assertLifeSoleSupport}=await import('./lib/r53-life-contact.mjs');
 const sole=gap=>({points:[{gapMeters:gap}]});
 assert.doesNotThrow(()=>assertLifeSoleSupport([sole(0),sole(0)],0));
 assert.doesNotThrow(()=>assertLifeSoleSupport([sole(0),sole(.064)],.4));
 assert.throws(()=>assertLifeSoleSupport([sole(.02),sole(.03)],.4),/grounded/);
 assert.throws(()=>assertLifeSoleSupport([sole(0),sole(.002)],0),/standing/);
 assert.throws(()=>assertLifeSoleSupport([sole(0),sole(-.02)],.4),/penetration/);
 assert.throws(()=>assertLifeSoleSupport([sole(0),sole(.07)],.4),/swing/i);
});

test('live renderer foot stream keeps a planted foot and both feet on support when paused',async()=>{
 const THREE=await import('three'),{CharacterRenderer}=await import('../src/scene/characters/CharacterRenderer.js'),{characterEnvironmentMotion}=await import('../src/scene/characters/CharacterBehavior.js'),{submittedLifeSoles}=await import('./lib/r53-life-contact.mjs');
 const scene=new THREE.Scene(),renderer=new CharacterRenderer({scene}),system={renderer},cache=new WeakMap();
 const base={id:'probe-maid',templateId:'maid-daily',zoneRef:'west-six',pose:'standing',lod:0,behavior:{seed:53002,basePose:'standing'},placement:{mode:'path',pathRef:'probe-route'},position:[145.2,0,418.3],rotationYRad:Math.PI/2,visibility:1};
 try{for(let t=0;t<6;t+=.1){const actor={...base,animation:characterEnvironmentMotion(base,t,.4)};renderer.render([actor],{simulationSeconds:t});const r=submittedLifeSoles(system,[actor],actor.id,cache);assert.ok(r.groundedFeet>=1);assert.ok(r.maximumGapMeters<=.066);}const actor={...base,animation:characterEnvironmentMotion(base,6,0)};renderer.render([actor],{simulationSeconds:6});assert.equal(submittedLifeSoles(system,[actor],actor.id,cache).groundedFeet,2);}finally{renderer.dispose();renderer.pool.dispose();}
});
