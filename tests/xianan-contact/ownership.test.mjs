import test from 'node:test';
import {makeFixture,assert,T} from './fixture.mjs';
const api=await import('../../src/scene/palace/special/XiananContactSources.js').catch(e=>{if(e.code==='ERR_MODULE_NOT_FOUND'&&e.message.includes('XiananContactSources.js'))return {};throw e});
const query=f=>api.queryXiananContact?.(f.cm,new T.Vector3(300.9,0,-245),new T.Vector3(300.9,0,-244.8),.5);
for(const [name,change] of [
 ['source position',f=>f.sources[1].mesh.position.x+=.01],
 ['source hidden',f=>f.sources[1].mesh.visible=false],
 ['source direct array',f=>f.sources[1].mesh.geometry.attributes.position.array[0]+=.01],
 ['source index',f=>f.sources[1].mesh.geometry.setIndex([0,1,2])],
 ['source material',f=>f.sources[1].mesh.material=f.sources[1].mesh.material.clone()],
 ['source detached',f=>f.frame.remove(f.sources[1].mesh)],
 ['source frame',f=>f.frame.scale.x=1.01],
 ['finished moved',f=>f.merged.position.z+=.01],
 ['finished hidden',f=>f.merged.visible=false],
 ['finished detached',f=>f.merged.removeFromParent()],
 ['finished bucket direct array',f=>f.merged.children[0].geometry.attributes.position.array[0]+=.01],
 ['finished bucket index replacement',f=>f.merged.children[0].geometry.setIndex([0,1,2])],
 ['finished material invisible',f=>f.merged.children[0].material.visible=false],
 ['finished geometry disposed',f=>f.merged.children[0].geometry.dispose()],
 ['owner descriptor',f=>f.cm.walkables[0].box.max.y+=.01],
 ['owner duplicate',f=>f.cm.addWalkable(f.builder.kit.walkables[0],'duplicate')],
 ['clear',f=>f.cm.clear()],
 ['removeByTag',f=>f.cm.removeByTag('xianan-only')],
 ['kit dispose',f=>f.builder.kit.dispose(f.merged)],
])test('revokes '+name,()=>{const f=makeFixture();try{assert.equal(query(f)?.status,'valid');change(f);assert.equal(query(f)?.status,'invalid',name+' must not fall back to legacy')}finally{f.dispose()}});
test('remove and re-add cannot revive old owner; rebuilt owner receives different generation',()=>{const a=makeFixture(),b=makeFixture();try{const old=query(a);a.cm.removeByTag('xianan-only');a.cm.addWalkable(a.builder.kit.walkables[0],'xianan-only');assert.equal(query(a)?.status,'invalid');assert.notEqual(query(b)?.generation,old.generation)}finally{a.dispose();b.dispose()}});
