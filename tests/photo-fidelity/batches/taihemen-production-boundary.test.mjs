import test from 'node:test';import assert from 'node:assert/strict';import {existsSync,readFileSync} from 'node:fs';import * as T from 'three';
import {PalaceBuilder} from '../../../src/scene/PalaceBuilder.js';import {PALACE_LAYOUT} from '../../../src/scene/Layout.js';import {library} from '../../lib/inner-palace-fixture.mjs';
test('unregistered ceiling hypothesis is absent from every production module and actual merged Taihemen',()=>{
 assert.equal(existsSync(new URL('../../../src/scene/palace/special/TaihemenSouthCeiling.js',import.meta.url)),false);
 assert.doesNotMatch(readFileSync(new URL('../../../src/scene/palace/special/TaihemenEnclosure.js',import.meta.url),'utf8'),/buildTaihemenSouthCeiling/);
 const scene=new T.Scene(),b=new PalaceBuilder(scene,library());try{b.buildGate(PALACE_LAYOUT.find(x=>x.name==='太和门'));const g=scene.getObjectByName('太和门');
 assert.ok(g.userData.architecture.every(x=>x.id!=='axis/taihemen-south-ceiling'));g.traverse(m=>{if(m.isMesh)assert.ok(!m.material.name?.startsWith('taihemen-south-ceiling-'));});
 }finally{b.dispose();}
});
