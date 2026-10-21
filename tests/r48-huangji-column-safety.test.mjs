import test from 'node:test';
import assert from 'node:assert/strict';
import {readFileSync} from 'node:fs';
import {createHash} from 'node:crypto';
import * as THREE from 'three';
import {GLTFLoader} from 'three/examples/jsm/loaders/GLTFLoader.js';
import {cpuDracoLoader} from './lib/cpu-draco.mjs';
import {HUANGJI_COLUMN_SEGMENTS,huangjiColumnSafetyBoxes} from '../src/scene/interior/HuangjiColumnSafety.js';
const bytes=readFileSync(new URL('../public/models/interiors/huangji-aligned-0a79ec49e8cd.glb',import.meta.url));
assert.equal(createHash('sha256').update(bytes).digest('hex'),'0a79ec49e8cd442d363fdc6bccf4074d9e214ef3b0f3b56eba618297c1e88cc6');
const decoder=new GLTFLoader().setDRACOLoader(await cpuDracoLoader());
const root=(await decoder.parseAsync(bytes.buffer.slice(bytes.byteOffset,bytes.byteOffset+bytes.byteLength),'')).scene;
root.updateMatrixWorld(true);
const triangles=[];
root.traverse(m=>{if(!m.isMesh||!['gold_lacquer','stone'].includes(m.material?.name))return;const p=m.geometry.attributes.position,ix=m.geometry.index;for(let i=0;i<(ix?.count??p.count);i+=3){const vertices=[0,1,2].map(k=>new THREE.Vector3().fromBufferAttribute(p,ix?ix.getX(i+k):i+k).applyMatrix4(m.matrixWorld));if(!vertices.every(v=>Math.abs(v.x)>3.1))continue;assert.ok(vertices.every(v=>Math.sign(v.x)===Math.sign(vertices[0].x)&&(v.z<8.75)===(vertices[0].z<8.75)));triangles.push({component:`column${vertices[0].z<8.75?'Front':'Rear'}${vertices[0].x<0?'East':'West'}`,vertices});}});
function clip(poly,y,keepAbove){const out=[];for(let i=0;i<poly.length;i++){const a=poly[i],b=poly[(i+1)%poly.length],ia=keepAbove?a.y>=y:a.y<=y,ib=keepAbove?b.y>=y:b.y<=y;if(ia)out.push(a);if(ia!==ib)out.push(a.clone().lerp(b,(y-a.y)/(b.y-a.y)));}return out;}
test('R48 Huangji 48 safety segments are the exact independently redecoded pillar-only triangle slice bounds, never whole gold mesh bounds',()=>{
 assert.equal(HUANGJI_COLUMN_SEGMENTS.length,48);assert.equal(new Set(HUANGJI_COLUMN_SEGMENTS.map(s=>s[0])).size,4);
 for(const [component,x0,y0,z0,x1,y1,z1] of HUANGJI_COLUMN_SEGMENTS){const actual=new THREE.Box3();let count=0;for(const t of triangles){if(t.component!==component)continue;const a=clip(t.vertices,y0,true),b=clip(a,y1,false);if(b.length<2)continue;for(const p of b)actual.expandByPoint(p);count++;}assert.ok(count>0);const expected=[x0,y0,z0,x1,y1,z1],observed=[...actual.min.toArray(),...actual.max.toArray()];for(let i=0;i<6;i++)assert.ok(Math.abs(observed[i]-expected[i])<1e-7,component+' exact component bound');assert.ok(x1-x0<1.3&&z1-z0<1.3,'no whole-room air blocker');assert.ok(Math.abs(y1-y0-.25)<1e-10);}
});
test('R48 pillar safety boxes apply the loader frame exactly once, with only documented local 5cm head margin',()=>{
 const group=new THREE.Group();group.position.set(-293.2,1.5,287.7);group.rotation.y=.37;group.updateMatrixWorld(true);const boxes=huangjiColumnSafetyBoxes(group);assert.equal(boxes.length,48);for(let i=0;i<48;i++){const[,x0,y0,z0,x1,y1,z1]=HUANGJI_COLUMN_SEGMENTS[i],expected=new THREE.Box3(new THREE.Vector3(x0,Math.max(0,y0-.05),z0),new THREE.Vector3(x1,y1,z1)).applyMatrix4(group.matrixWorld);assert.deepEqual(boxes[i],expected);}assert.equal(root.children.length>0,true);
});
