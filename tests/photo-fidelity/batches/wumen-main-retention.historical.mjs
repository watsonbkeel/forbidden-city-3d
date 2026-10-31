import test from 'node:test';import assert from 'node:assert/strict';import fs from 'node:fs';import crypto from 'node:crypto';
import {captureGate,meshFingerprint,outerColumnSignature} from '../../lib/gate-tower-fixture.mjs';
const old=JSON.parse(fs.readFileSync(new URL('../../fixtures/r157-wumen-main-controls.json',import.meta.url)));
const hash=x=>crypto.createHash('sha256').update(JSON.stringify(x)).digest('hex');
function renderStateHash(group){const rows=[];group.traverse(m=>{if(!m.isMesh)return;const material=(Array.isArray(m.material)?m.material:[m.material]).map(mat=>{const textures=Object.entries(mat).filter(([,v])=>v?.isTexture),meta={textures:Object.fromEntries(textures.map(([,t])=>[t.uuid,{}])),images:{}};const {uuid,...data}=mat.toJSON(meta);for(const [key,t]of textures)data[key]={name:t.name,wrap:[t.wrapS,t.wrapT],repeat:t.repeat.toArray(),offset:t.offset.toArray(),colorSpace:t.colorSpace};return data;});rows.push({material,flags:[m.castShadow,m.receiveShadow,m.visible,m.frustumCulled,m.renderOrder],groups:m.geometry.groups,drawRange:m.geometry.drawRange});});return hash(rows);}
test('R157 main tower preserves exact d70a4a02 outside-body geometry/material/physics and every support primitive',()=>{
 const c=captureGate(),copy=c.group.clone(true);copy.remove(copy.children[c.group.children.indexOf(c.tower)]);
 assert.equal(meshFingerprint(copy),old.unscopedGeometry);assert.equal(renderStateHash(copy),old.unscopedRenderState);
 const pending=c.tower.userData.colliders.map(b=>b.clone().translate(new c.THREE.Vector3(0,c.tower.position.y,c.data.position.z)));
 const outside=c.builder.colliders.filter(b=>{const i=pending.findIndex(v=>v.equals(b));if(i<0)return true;pending.splice(i,1);return false;});assert.equal(pending.length,0);
 assert.equal(hash(outside),old.unscopedPhysics);assert.equal(hash(c.builder.walkables),old.walkables);
 assert.deepEqual(outerColumnSignature(c.tower),old.outerColumns);
 assert.deepEqual(c.tower.children.filter(m=>['open-lattice-leaf','threshold','interior-floor','ceiling','retained-upper-beam','gable-wall'].includes(m.userData.gatePart)).map(m=>({part:m.userData.gatePart,geometry:meshFingerprint(m)})),old.protectedBody);
});
