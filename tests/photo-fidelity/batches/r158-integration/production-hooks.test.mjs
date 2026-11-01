// No registerHooks, injected module or manually applied finalizer: actual entry points.
import test from 'node:test';import assert from 'node:assert/strict';import fs from 'node:fs';
import {ZoneBase} from '../../../../src/scene/zones/ZoneBase.js';
import {buildSouthWaterSystem} from '../../../../src/scene/palace/special/SouthWaterSystem.js';
import {PALACE_LAYOUT} from '../../../../src/scene/Layout.js';
import {library} from '../../../lib/inner-palace-fixture.mjs';
const zone=JSON.parse(fs.readFileSync(new URL('../../../../data/zones/outer-east.json',import.meta.url)));
test('Uninjected complete outer-east production path installs six Wenhua leaves once before merge',()=>{
 const b=new ZoneBase(library(),zone);let built;try{built=b.build();const records=built.group.userData.architecture.filter(r=>r.id==='outer-east/wenhua-front');assert.equal(records.length,1);assert.equal(records[0].wenhuaCentralDoors?.leaves,6);assert.equal(records[0].wenhuaCentralDoors.accepted,false);const materials=new Set();built.group.traverse(m=>{if(m.isMesh&&m.material.name.startsWith('wenhua-central-door-'))materials.add(m.material.name);});assert.equal(materials.size,3);const f=b.kit.root.children.find(o=>o.userData.structure?.id==='outer-east/wenhua-front');assert.equal(f.userData.wenhuaSouthWindows.centralDoors,'SIX_SOURCE_COUNTED_LEAVES_FITTED_OPEN_POSE_SEE_WENHUA_CENTRAL_DOORS');}finally{b.kit.dispose(built?.group??b.kit.root);}
});
test('Uninjected production water path replaces only Wenyuan rails with34 owned triangles and retains32 deck supports',()=>{
 const lib=library(),built=buildSouthWaterSystem(lib,PALACE_LAYOUT.find(p=>p.southWaterProfile),lib.material('water'));try{assert.equal(built.group.userData.wenyuanPondRails.length,1);const own=built.colliders.filter(c=>c.triangleSupport?.id.startsWith('wenyuan-pond-rails:'));assert.equal(own.length,34);assert.equal(new Set(own.map(c=>c.triangleSupport.id)).size,34);assert.equal(built.walkables.filter(w=>w.structureId==='wenyuan-pond').length,32);assert.equal(built.group.userData.wuyingBridgeRails.length,3);}finally{built.group.traverse(m=>m.geometry?.dispose());}
});
