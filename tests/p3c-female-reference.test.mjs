import test from 'node:test';
import assert from 'node:assert/strict';
import { readFixtureArchive } from './helpers/p3c-fixture-archive.mjs';
import * as THREE from 'three';
import { inflateSync } from 'node:zlib';
import { createCharacterGeometry as build, createCharacterGeometrySteps as steps } from '../src/scene/characters/CharacterKit.js';
const original=JSON.parse(readFixtureArchive(new URL('../reports/r50-followup/kit-preparation-baseline.json.gz.index.json',import.meta.url)));
const female=new Set(['consort-daily','maid-daily']);
const raw=a=>Buffer.from(a.array.buffer,a.array.byteOffset,a.array.byteLength);
test('reference revision keeps all 90 male outputs byte exact',()=>{
 const cases=original.cases.filter(c=>!female.has(c.templateId)); assert.equal(cases.length,90);
 for(const c of cases){const g=build(c.templateId,c.pose,c.lod,{seatVariant:c.seatVariant});for(const [name,a]of [...Object.entries(g.attributes),['index',g.index]])assert.deepEqual(raw(a),inflateSync(Buffer.from((name==='index'?c.index:c.attributes[name]).deflateBase64,'base64')),`${c.templateId}/${c.pose}/${c.lod}/${c.seatVariant}/${name}`);assert.deepEqual(g.userData,c.userData);g.dispose();}
});
test('L0 female eyes contain separate sclera, iris and pupil geometry rather than black slits',()=>{
 const colors=[0xe5ddd0,0x6b4932,0x171716].map(hex=>new THREE.Color(hex));
 for(const id of female){const g=build(id),p=g.attributes.position,c=g.attributes.color,part=g.attributes.characterPart,counts=[0,0,0];
 for(let i=0;i<p.count;i++)if(part.getX(i)===1&&p.getY(i)>1.55&&p.getY(i)<1.61&&p.getZ(i)>.060)for(let j=0;j<colors.length;j++){const color=colors[j];if(Math.abs(c.getX(i)-color.r)<1e-6&&Math.abs(c.getY(i)-color.g)<1e-6&&Math.abs(c.getZ(i)-color.b)<1e-6)counts[j]++;}
 for(let j=0;j<colors.length;j++)assert.ok(counts[j]>=12,`${id}: eye color ${j} has ${counts[j]} vertices`);g.dispose();}
});
test('female walking sample has distinct actual lowered arm geometry and no male effect',()=>{
 const standing=build('maid-daily'),walking=build('maid-daily','standing',0,{femalePose:'walking'});
 assert.notDeepEqual(raw(standing.attributes.position),raw(walking.attributes.position));
 const p=walking.attributes.position,part=walking.attributes.characterPart;const hands=[];for(let i=0;i<p.count;i++)if([2,3].includes(part.getX(i)))hands.push(p.getY(i));assert.ok(Math.min(...hands)<.84);
 assert.throws(()=>build('guard-duty','standing',0,{femalePose:'walking'}),/female/i);assert.throws(()=>build('maid-daily','seated',0,{femalePose:'walking'}),/standing/i);
 standing.dispose();walking.dispose();
});
test('female contact contract, bounded same-source generation and per-LOD mesh budget stay intact',()=>{
 for(const c of original.cases.filter(c=>female.has(c.templateId))){const opts={seatVariant:c.seatVariant},g=build(c.templateId,c.pose,c.lod,opts),it=steps(c.templateId,c.pose,c.lod,opts);let n;do{n=it.next();if(!n.done)assert.ok(n.value.workUnits<=128);}while(!n.done);for(const [name,a] of Object.entries(g.attributes))assert.deepEqual(a.array,n.value.attributes[name].array);assert.deepEqual(g.index.array,n.value.index.array);
 const {triangles,...metadata}=g.userData;assert.deepEqual(metadata,(({triangles,...rest})=>rest)(c.userData));assert.ok(g.userData.triangles<=[12000,1500,600][c.lod],`${c.templateId} L${c.lod}: ${g.userData.triangles}`);for(const a of Object.values(g.attributes))assert.ok([...a.array].every(Number.isFinite));g.dispose();n.value.dispose();}
});

test('female L0/L1 robe is one connected shell across the waist, not a capped blouse over a skirt',()=>{
 for(const id of female)for(const pose of ['standing','seated','kneeling'])for(const lod of [0,1]){const g=build(id,pose,lod),part=g.attributes.characterPart;let bridges=0;for(let i=0;i<g.index.count;i+=3){const parts=[0,1,2].map(k=>part.getX(g.index.getX(i+k)));if(parts.includes(0)&&parts.includes(6))bridges++;}assert.ok(bridges>=12,`${id}/${pose}/L${lod}: ${bridges} continuous waist triangles`);g.dispose();}
});


test('female crown remains broad near the top instead of tapering into a pointed hat',()=>{
 const material=new THREE.MeshBasicMaterial({side:THREE.DoubleSide});
 for(const id of female){const g=build(id),mesh=new THREE.Mesh(g,material);mesh.updateMatrixWorld();for(const side of [-1,1]){const hits=new THREE.Raycaster(new THREE.Vector3(side*.2,1.705,-.008),new THREE.Vector3(-side,0,0)).intersectObject(mesh);assert.ok(hits.length,`${id}: crown missing`);assert.ok(Math.abs(hits[0].point.x)>.024,`${id}: crown tapers to a point`);}g.dispose();}material.dispose();
});

test('walking preview preserves same-source incremental generation and carries only geometry pose metadata',()=>{
 for(const id of female)for(const lod of [0,1,2]){const g=build(id,'standing',lod,{femalePose:'walking'}),it=steps(id,'standing',lod,{femalePose:'walking'});let result;do{result=it.next();if(!result.done)assert.ok(result.value.workUnits<=128);}while(!result.done);assert.equal(g.userData.samplePose,'walking');assert.equal(Object.hasOwn(g.userData,'productionIntegration'),false);for(const [name,a]of Object.entries(g.attributes))assert.deepEqual(a.array,result.value.attributes[name].array);assert.deepEqual(g.index.array,result.value.index.array);g.dispose();result.value.dispose();}
});

test('reference closure is visible on the new curved path rather than the preserved candidate05 coordinates',()=>{
 const material=new THREE.MeshBasicMaterial({side:THREE.DoubleSide});
 for(const id of female){const g=build(id),mesh=new THREE.Mesh(g,material),acceptable=(id==='consort-daily'?[0x234a47,0xb89b60]:[0x354a59]).map(c=>new THREE.Color(c));mesh.updateMatrixWorld();
 for(const [x,y]of [[.0315,1.3975],[-.0115,1.3665],[-.0855,1.3215],[-.139,1.2495],[-.161,1.1325]]){const h=new THREE.Raycaster(new THREE.Vector3(x,y,.8),new THREE.Vector3(0,0,-1)).intersectObject(mesh)[0];assert.ok(h,`${id}: missing surface`);const c=g.attributes.color,i=h.face.a;assert.ok(acceptable.some(a=>Math.abs(c.getX(i)-a.r)<1e-6&&Math.abs(c.getY(i)-a.g)<1e-6&&Math.abs(c.getZ(i)-a.b)<1e-6),`${id}: new closure hidden at ${x}/${y}`);}g.dispose();}material.dispose();
});

test('female neck top is embedded inside the actual skull rather than exposing a cut cylinder rim',()=>{
 const material=new THREE.MeshBasicMaterial({side:THREE.DoubleSide});
 for(const id of female)for(const [pose,off,z]of [['standing',0,0],['seated',-.29,-.04],['kneeling',-.58,.04]]){const g=build(id,pose,0),p=g.attributes.position,part=g.attributes.characterPart;let neckStart=0;while(part.getX(neckStart)!==1)neckStart++;const skullStart=neckStart+130,skullEnd=skullStart+418,index=[];for(let i=0;i<g.index.count;i+=3){const ids=[0,1,2].map(k=>g.index.getX(i+k));if(ids.every(v=>v>=skullStart&&v<skullEnd))index.push(...ids);}assert.ok(index.length>1000);
 const skull=new THREE.BufferGeometry();skull.setAttribute('position',p);skull.setIndex(index);const mesh=new THREE.Mesh(skull,material);mesh.updateMatrixWorld();const center=new THREE.Vector3(0,1.495+off,z-.005);
 for(let i=neckStart+96;i<neckStart+128;i++){const v=new THREE.Vector3().fromBufferAttribute(p,i);assert.ok(Math.abs(v.y-center.y)<1e-6);const delta=v.clone().sub(center),distance=delta.length(),hits=new THREE.Raycaster(center,delta.normalize()).intersectObject(mesh);assert.ok(hits.length&&hits[0].distance>distance+.003,`${id}/${pose}: neck top reaches outside skull`);}skull.dispose();g.dispose();}material.dispose();
});

// Candidate06 explicitly maps upper-head sample coordinates. The original
// candidate05 probes remain unchanged and red at their historical coordinates.
const revisedHeadY=y=>y<=1.595?y+.020:1.615+(y-1.595)*(.098/.118);
test('candidate06 scalp tapers at the relocated upper-forehead section',()=>{
 for(const id of female){const g=build(id),p=g.attributes.position,c=g.attributes.color,part=g.attributes.characterPart;let count=0;for(let i=0;i<p.count;i++)if(part.getX(i)===1&&Math.max(c.getX(i),c.getY(i),c.getZ(i))<.035&&p.getY(i)>revisedHeadY(1.635)&&p.getZ(i)>.02){count++;assert.ok(p.getZ(i)<.071);}assert.ok(count>40);g.dispose();}
});
test('candidate06 skull and hair remain covered at transformed upper-cranium ray locations for all LODs',()=>{
 for(const id of female)for(const lod of [0,1,2]){const g=build(id,'standing',lod),mesh=new THREE.Mesh(g,new THREE.MeshBasicMaterial());mesh.updateMatrixWorld();for(const a of [0,Math.PI/3,Math.PI/2,Math.PI*2/3,Math.PI])for(const oldY of [1.626,1.635,1.645,1.655,1.675,1.69]){const dir=new THREE.Vector3(Math.sin(a),0,Math.cos(a)),hits=new THREE.Raycaster(new THREE.Vector3(dir.x*.3,revisedHeadY(oldY),dir.z*.3),dir.negate()).intersectObject(mesh);assert.ok(hits.length);const c=g.attributes.color;for(const i of [hits[0].face.a,hits[0].face.b,hits[0].face.c])assert.ok(Math.max(c.getX(i),c.getY(i),c.getZ(i))<.035||c.getY(i)/c.getZ(i)>2,`${id}/${lod}: bare skull at ${oldY}/${a}`);}mesh.material.dispose();g.dispose();}
});
test('candidate06 unchanged nose volume remains readable on both profiles after facial translation',()=>{
 for(const id of female){const g=build(id),mesh=new THREE.Mesh(g,new THREE.MeshBasicMaterial());mesh.updateMatrixWorld();for(const sign of [-1,1])assert.ok(new THREE.Raycaster(new THREE.Vector3(sign*.2,revisedHeadY(1.54),.087),new THREE.Vector3(-sign,0,0)).intersectObject(mesh).length);mesh.material.dispose();g.dispose();}
});
