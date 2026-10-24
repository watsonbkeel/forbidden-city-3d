import test from 'node:test';import assert from 'node:assert/strict';import * as THREE from 'three';import {registerHooks} from 'node:module';
import {buildR52World} from './lib/r52-world.mjs';import {walkStraight} from './lib/world.mjs';import {actualYangxinRoot} from './r53-yangxin/glb-fixture.mjs';
test('R73 real merged complete world and real Yangxin GLB retain gate-to-hall round trip',async()=>{
 const W=await buildR52World({loadAll:true});W.THREE=THREE;let loader;
 const routes=[[[65,248.9],[74,248.9],[109,248.9],[109,253],[109,257],[108.6,261.5],[108.6,274.5],[113.4,274.5],[113.4,276.66]],[[109,253],[104.6,253],[104.6,257],[109,257]],[[109,253],[113.4,253],[113.4,257],[109,257]]];
 const audit=()=>{for(const route of routes)for(const pts of[route,[...route].reverse()]){let feet;for(let i=1;i<pts.length;i++){const r=walkStraight(W,pts[i-1],pts[i],{feet0:feet});assert.ok(r.reached>=r.total-.1,JSON.stringify({from:pts[i-1],to:pts[i],...r}));feet=r.feet;}}};
 try{audit();const hook=registerHooks({load(u,c,n){return n(u,u.endsWith('.json')?{...c,importAttributes:{...c.importAttributes,type:'json'}}:c);}});try{const {InteriorLoader}=await import('../src/scene/interior/InteriorLoader.js'),{INTERIORS}=await import('../src/scene/interior/registry.js');loader=new InteriorLoader(W.scene,W.cm,{registry:{yangxin:INTERIORS.yangxin}});}finally{hook.deregister();}
 loader.gltf.load=(_url,ok,_p,error)=>actualYangxinRoot().then(root=>ok({scene:root}),error);assert.equal(await loader.load('yangxin'),true);loader.update({x:108.6,z:277.5},performance.now()+500);W.scene.updateMatrixWorld(true);audit();
 }finally{loader?.dispose();W.dispose();}
});
