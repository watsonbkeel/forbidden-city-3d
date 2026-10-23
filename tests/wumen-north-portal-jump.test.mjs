import test from 'node:test';
import assert from 'node:assert/strict';
import * as THREE from 'three';
import {writeFileSync} from 'node:fs';
import {captureGate} from './lib/gate-tower-fixture.mjs';
import {withWumenNorthPortals} from './lib/wumen-north-portal-fixture.mjs';
import {CollisionManager} from '../src/utils/Collision.js';
import {captureWumenNorthHeadTriangles,replayWumenNorthJump} from './lib/wumen-north-jump.mjs';
const c=withWumenNorthPortals(captureGate()),scene=new THREE.Scene(),root=c.group.clone(true),cm=new CollisionManager();
root.position.set(c.data.position.x,0,c.data.position.z);scene.add(root);scene.updateMatrixWorld(true);cm.addColliders(c.builder.colliders);cm.addWalkables(c.builder.walkables);
const W={THREE,scene,cm},triangles=captureWumenNorthHeadTriangles(W),rows=[];
for(const fps of [5,10,60,120])for(const direction of [-1,1])for(const x of [-3.999,3.999])for(const mode of ['walk','stationary','diagonal','diagonalOut','outside'])test(`actual jumping central north rim x=${x}, ${fps}Hz, direction=${direction}, mode=${mode}`,t=>{
 const r=replayWumenNorthJump(t,W,{fps,direction,x,mode,triangles});rows.push(r);assert.equal(r.pass,true,JSON.stringify(r));
});
process.on('exit',()=>{if(process.env.WUMEN_JUMP_EVIDENCE)writeFileSync(process.env.WUMEN_JUMP_EVIDENCE,JSON.stringify(rows,null,2)+'\n');});
