// Reproducible bounded fixture export. Does not build the whole palace.
import fs from 'node:fs';import {gzipSync} from 'node:zlib';import * as THREE from 'three';
import {nansansuoFixture} from '../../tests/lib/r59-nansansuo-inventory-fixture.mjs';
import {geometryKeys,boxKey} from '../../tests/lib/r58-gallery-world-check.mjs';
const before=nansansuoFixture({candidate:false}),after=nansansuoFixture();before.z.kit.buildPlaqueAtlas();after.z.kit.buildPlaqueAtlas();
const rows=after.rows.map(a=>{const b=before.rows.find(r=>r.index===a.index),bounds=new THREE.Box3().setFromObject(a.frame),room=a.rooms[0],{id,...roomContract}=room;
 return{index:a.index,target:room.furnishingPolicy.target,bounds:{min:bounds.min.toArray(),max:bounds.max.toArray()},rooms:[roomContract],retainedTriangles:[...geometryKeys(a.frame)],removedTriangles:b.props.flatMap(p=>p.meshes.flatMap(m=>[...geometryKeys(m)])),retainedColliders:a.colliders.map(b=>boxKey(new THREE.Box3(new THREE.Vector3(...b.min),new THREE.Vector3(...b.max)))),removedColliders:b.props.flatMap(p=>p.colliders.map(boxKey)),walkables:after.z.kit.walkables.filter(w=>w.type==='box'&&w.box.intersectsBox(bounds)).map(w=>boxKey(w.box))};});
fs.writeFileSync('tests/fixtures/r59-nansansuo-inventory-world-contract.json.gz',gzipSync(JSON.stringify({schema:'r59-nansansuo-unknown-contract-v1',source:'R58 2b983ae exact declaration JSON, preserved unmarked fallback against explicit R59 policy',scope:'Not known empty, not resolved three-stage room identities',rows}),{level:9}));before.dispose();after.dispose();
