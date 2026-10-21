import test from 'node:test';
import assert from 'node:assert/strict';
import {readFileSync} from 'node:fs';
import {createHash} from 'node:crypto';
import * as THREE from 'three';
import {CourtKit} from '../src/scene/palace/kit.js';
import {ZoneBase} from '../src/scene/zones/ZoneBase.js';
import {library} from './lib/inner-palace-fixture.mjs';
import {CollisionManager} from '../src/utils/Collision.js';
import {replayTerrace,traceTerraceGround} from './lib/terrace-walk.mjs';
import {resolveRemainingProfile,augmentRemainingHall} from '../src/scene/palace/special/RemainingResidentialHalls.js';
import {readYangxinEnvelope} from './r48-residential-glb-envelope.mjs';
const scope=JSON.parse(readFileSync(new URL('../docs/current-state/r48-remaining/residential-scope.json',import.meta.url)));
const row=scope.find(r=>r.name==='养心殿'),item=row.baselineItem;
const nodes=(f,role)=>{const a=[];f.traverse(o=>{if(o.userData.role===role)a.push(o);});return a;};
function roofDigest(roof){const rows=[];roof.traverse(m=>{if(m.isMesh)rows.push({position:m.position.toArray(),rotation:m.rotation.toArray(),scale:m.scale.toArray(),attributes:Object.fromEntries(Object.entries(m.geometry.attributes).map(([k,a])=>[k,[...a.array]])),index:m.geometry.index?[...m.geometry.index.array]:null});});return createHash('sha256').update(JSON.stringify(rows)).digest('hex');}
function fixture(){const kit=new CourtKit(library(),'west-six'),p=resolveRemainingProfile('west-six',item),built=kit.hall(item),oldColumns=built.f.children.filter(o=>o.geometry?.type==='CylinderGeometry'),roof=built.f.children.find(o=>o.type==='Group'),furniture=built.f.children.filter(o=>o.material===kit.gold||o.material===kit.lacquer),roofHash=roofDigest(roof);augmentRemainingHall(kit,item,built,p);kit.root.updateMatrixWorld(true);const cm=new CollisionManager();cm.rivers=[];cm.addColliders(kit.colliders);cm.addWalkables(kit.walkables);return{kit,p,...built,roof,roofHash,oldColumns,furniture,cm};}
test('R48 Yangxin replaces eleven-bay posts and facade with three primary bays and nine real subdivisions',()=>{const{f,oldColumns,kit,furniture,roof,roofHash}=fixture();assert.equal(oldColumns.length,24);assert.ok(oldColumns.every(o=>!o.parent),'all former 11-grid primary posts removed');const primary=nodes(f,'r48-yangxin-primary-column'),secondary=nodes(f,'r48-yangxin-secondary-front-post');assert.equal(primary.length,8);assert.equal(secondary.length,6);assert.deepEqual(primary.filter(o=>o.position.z<0).map(o=>o.position.x),[-18,-6,6,18]);assert.deepEqual(secondary.map(o=>o.position.x),[-14,-10,-2,2,10,14]);assert.equal(nodes(f,'r48-yangxin-front-window').length,8);assert.ok(f.children.includes(roof));assert.equal(roofDigest(roof),roofHash,'retained main roof vertices, normals, UVs and transforms unchanged');assert.ok(furniture.every(o=>f.children.includes(o)),'furniture and plaque identities unchanged');assert.equal(f.children.some(o=>o.material===kit.lib.material('lattice_doors')&&!o.userData.role?.startsWith('r48-yangxin-')),false,'old eleven-grid window and folded leaves removed');});
test('R48 Yangxin baoxia is a continuous middle/west projection, not mirrored three-part additions',()=>{const{f}=fixture(),g=nodes(f,'r48-yangxin-middle-west-baoxia')[0];assert.ok(g);assert.deepEqual(g.userData.sections.map(s=>[s.x0,s.x1]),[[-6,6],[6,18]]);const b=new THREE.Box3().setFromObject(g);assert.ok(b.min.x>=item.x-6.7&&b.max.x<=item.x+18.7);assert.ok(b.max.z<item.z-6.1);assert.equal(nodes(g,'r48-yangxin-baoxia-front-column').length,7);assert.equal(nodes(g,'r48-yangxin-roll-roof').length,1);});
test('R48 Yangxin all new facade and baoxia volumes avoid decoded GLB triangle surfaces',async()=>{const{f}=fixture(),rows=await readYangxinEnvelope(),volumes=[];f.traverse(o=>{if(o.isMesh&&/^r48-yangxin-(?:primary|secondary|front-|baoxia-|roll-|roof-seam)/.test(o.userData.role??'')){const box=new THREE.Box3().setFromObject(o);box.translate(new THREE.Vector3(-item.x,-item.ph,-item.z));volumes.push({box,role:o.userData.role});}});assert.ok(volumes.length>30);const triangle=new THREE.Triangle();for(const v of volumes)for(const r of rows){if(!v.box.intersectsBox(r.box))continue;for(const pts of r.triangles){triangle.set(...pts);assert.equal(v.box.intersectsTriangle(triangle),false,`${v.role} contacts GLB ${r.name}`);}}const bytes=readFileSync(new URL('../public/models/interiors/yangxin.glb',import.meta.url));assert.equal(createHash('sha256').update(bytes).digest('hex'),'e29192ab78f14811cbbbb94f8736d984f3c8bfece197e54cb81e023cb7c8fde3');});
for(const fps of [10,60])test(`R48 Yangxin relocated visible steps and central entry remain traversable at ${fps} Hz`,t=>{const{cm}=fixture(),trace=traceTerraceGround(cm,{flights:[]});try{const r=replayTerrace(t,{cm,THREE},[[item.x,item.z-16],[item.x,item.z-9],[item.x,item.z-3],[item.x,item.z-9],[item.x,item.z-16]],{fps});assert.equal(r.arrived,true,JSON.stringify(r));assert.equal(trace.samples.some(s=>s.source==='rescue'),false);}finally{trace.restore();}});

test('R48 Yangxin front load-bearing beam reaches the actual underside of the roll roof',()=>{const{f}=fixture(),roof=nodes(f,'r48-yangxin-roll-roof')[0],beam=nodes(f,'r48-yangxin-baoxia-front-beam')[0],ray=new THREE.Raycaster();assert.ok(beam&&roof);for(const x of[-5,0,6,12,17])for(const z of[-11.65,-11.5,-11.35]){ray.set(new THREE.Vector3(item.x+x,20,item.z+z),new THREE.Vector3(0,-1,0));const rh=ray.intersectObject(roof)[0],bh=ray.intersectObject(beam)[0];assert.ok(rh&&bh,`missing bearing at ${x},${z}`);assert.ok(Math.abs(rh.point.y-bh.point.y-.10)<.02,`unsupported roof gap at ${x},${z}: ${rh.point.y-bh.point.y}`);}});

test('R48 Yangxin roof seam is on actual main-roof triangles with only a raised narrow cover',()=>{
 const{f,roof:main}=fixture(),roll=nodes(f,'r48-yangxin-roll-roof')[0],seam=roll.userData.seam,cap=nodes(f,'r48-yangxin-roof-seam-cap')[0],ray=new THREE.Raycaster();
 assert.equal(seam.length,51);assert.ok(cap);const roofTileMeshes=[];main.traverse(o=>{if(o.isMesh&&o.material.name==='roof_tile')roofTileMeshes.push(o);});
 for(let i=0;i<seam.length-1;i++)for(const t of [0,.25,.5,.75]){
  const a=seam[i],b=seam[i+1],x=THREE.MathUtils.lerp(a.x,b.x,t),z=THREE.MathUtils.lerp(a.z,b.z,t);
  ray.set(new THREE.Vector3(item.x+x,25,item.z+z),new THREE.Vector3(0,-1,0));
  const mh=ray.intersectObjects(roofTileMeshes)[0];assert.ok(mh);const expected=THREE.MathUtils.lerp(a.y,b.y,t);
  assert.ok(Math.abs(mh.point.y-expected)<.012,`seam gap at ${x}: ${mh.point.y-expected}`);
  const ch=ray.intersectObject(cap)[0];assert.ok(ch);assert.ok(ch.point.y>mh.point.y+.012&&ch.point.y<mh.point.y+.04,'cover is raised, not coplanar with roof');
 }
 const pos=roll.geometry.attributes.position;
 for(let i=0;i<seam.length;i++){const q=seam[i],j=i*25+24;assert.ok(Math.abs(pos.getX(j)-q.x)<1e-5);assert.ok(Math.abs(pos.getY(j)-q.y)<1e-5);assert.ok(Math.abs(pos.getZ(j)-q.z)<1e-5);}
});
test('R48 Yangxin visible stair support replaces, rather than covers, the old front stairs',()=>{
 const{f,kit}=fixture(),steps=nodes(f,'r48-yangxin-baoxia-visible-step');assert.equal(steps.length,6);
 assert.equal(f.children.some(o=>o.isMesh&&o.material?.name==='marble'&&o.position.z>-9&&o.position.z<-7),false,'no buried old step meshes');
 assert.equal(kit.walkables.some(w=>w.type==='ramp'&&w.axis==='z'&&Math.abs(w.a0-(item.z-7))<1e-5),false,'no ghost old ramp');
 const ray=new THREE.Raycaster();for(let k=0;k<4;k++){const z=-12.05-(k+.5)*.24;ray.set(new THREE.Vector3(item.x,4,item.z+z),new THREE.Vector3(0,-1,0));const hit=ray.intersectObjects(steps)[0];assert.ok(hit);assert.ok(Math.abs(hit.point.y-(.6-(k+1)*.12))<1e-5);}
 for(const post of [...nodes(f,'r48-yangxin-baoxia-front-column'),...nodes(f,'r48-yangxin-primary-column')]){
  const box=new THREE.Box3().setFromObject(post),x=(box.min.x+box.max.x)/2,z=(box.min.z+box.max.z)/2;
  ray.set(new THREE.Vector3(x,.65,z),new THREE.Vector3(0,-1,0));assert.ok(ray.intersectObject(f,true).some(h=>h.point.y>=.52),'post has visible platform below it');
 }
});
test('R48 Yangxin full WestSix shell build keeps its new projection clear of every other visible building and court wall',()=>{
 const west=JSON.parse(readFileSync(new URL('../data/zones/west-six.json',import.meta.url)));
 class TestZone extends ZoneBase{buildHall(i){const result=super.buildHall(i);if(i.name==='养心殿'){if(!result.f.userData.r48ResidentialAugmented)augmentRemainingHall(this.kit,i,result,resolveRemainingProfile('west-six',i));this.yangxin=result.f;}return result;}}
 const zone=new TestZone(library(),west),built=zone.build(),annex=nodes(zone.yangxin,'r48-yangxin-middle-west-baoxia')[0],box=new THREE.Box3().setFromObject(annex),triangle=new THREE.Triangle(),v=[new THREE.Vector3(),new THREE.Vector3(),new THREE.Vector3()];let checked=0;
 for(const frame of zone.kit.root.children){if(frame===zone.yangxin)continue;frame.traverse(m=>{if(!m.isMesh)return;checked++;const bounds=new THREE.Box3().setFromObject(m);if(!bounds.intersectsBox(box))return;const pos=m.geometry.attributes.position,idx=m.geometry.index;for(let i=0;i<(idx?.count??pos.count);i+=3){for(let j=0;j<3;j++)v[j].fromBufferAttribute(pos,idx?idx.getX(i+j):i+j).applyMatrix4(m.matrixWorld);triangle.set(...v);assert.equal(box.intersectsTriangle(triangle),false,`projection intersects other geometry ${m.name}/${m.material.name}`);}});}
 assert.ok(checked>500);const cm=new CollisionManager();cm.rivers=[];cm.addColliders(built.colliders);cm.addWalkables(built.walkables);for(const[x,z]of[[0,-14],[0,-10],[0,-3],[-7.5,-10],[19.5,-10]])assert.equal(cm.checkCollision(new THREE.Vector3(item.x+x,2.3,item.z+z),.45),false);
 zone.dispose();
});
