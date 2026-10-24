import test from 'node:test';import assert from 'node:assert/strict';import fs from 'node:fs';import * as THREE from 'three';
import {buildWorld,walkStraight} from './lib/world.mjs';
const west=JSON.parse(fs.readFileSync('data/zones/west-six.json'));
test('R73 route from Zunyi through glazed gate and rear screen reaches Yangxin front in both directions',async()=>{
 const W=await buildWorld({zones:[{file:'west-six.json',json:west}],statics:false});
 const routes=[[[65,248.9],[74,248.9],[109,248.9],[109,253],[109,257],[108.6,265]],[[109,253],[104.6,253],[104.6,257],[109,257]],[[109,253],[113.4,253],[113.4,257],[109,257]]];
 for(const route of routes)for(const pts of[route,[...route].reverse()]){let feet;for(let i=1;i<pts.length;i++){const r=walkStraight(W,pts[i-1],pts[i],{feet0:feet});assert.ok(r.reached>=r.total-.1,JSON.stringify({from:pts[i-1],to:pts[i],...r}));feet=r.feet;}}
 assert.ok(W.cm.checkCollision(new THREE.Vector3(109+2.6,3.7,251.8),.5));
});
