import test from 'node:test';
import assert from 'node:assert/strict';
import { existsSync, readFileSync } from 'node:fs';
import * as THREE from 'three';
import { ZoneBase } from '../src/scene/zones/ZoneBase.js';
import { library } from './lib/inner-palace-fixture.mjs';
import { FlightEnvelope } from '../src/scene/flight/FlightEnvelope.js';
const path=new URL('../src/scene/palace/special/SouthCourtTrees.js',import.meta.url);
const api=existsSync(path)?await import(path):{};
const config=id=>JSON.parse(readFileSync(new URL(`../data/zones/${id}.json`,import.meta.url)));
function profile(id){assert.equal(typeof api.southTreeProfile,'function','source-bounded southern tree profile is absent');return api.southTreeProfile(id);}
for(const id of ['outer-east','outer-west']){
 test(`${id} tree profile is explicit partial photo fit with species and count uncertainty`,()=>{
  const p=profile(id);assert.equal(config(id).southTreeProfile,p.id);assert.equal(p.zone,id);
  assert.equal(p.dimensionStatus,'REVERSIBLE_MODEL_FIT_NOT_SURVEYED');assert.equal(p.countStatus,'PARTIAL_REPRESENTATION_NOT_CENSUS');
  assert.ok(p.trees.length>=2&&p.trees.length<=6);
  for(const t of p.trees){assert.equal(t.species,'UNKNOWN');assert.ok(t.photoLandmark);assert.ok(p.sources.some(s=>s.id===t.source));assert.ok([t.x,t.z,t.height,t.crownRadius,t.trunkRadius].every(Number.isFinite));}
  for(const s of p.sources){assert.match(s.url,/^https:\/\/(intl\.|img\.|file-pano\.)?dpm.org.cn\//);assert.equal(s.photographyDate,null);}
 });
 test(`${id} generated trees have real trunks and crowns, no visitor identity or walkable canopy`,()=>{
  const p=profile(id),b=new ZoneBase(library(),config(id));const result=api.buildSouthCourtTrees(b.kit,config(id));
  assert.equal(result.trees.length,p.trees.length);assert.equal(b.kit.rooms.length,0);assert.equal(b.kit.mapItems.length,0);assert.equal(b.kit.walkables.length,0);
  const trunks=[],crowns=[];b.kit.root.traverse(o=>{if(o.userData.role==='south-tree-trunk')trunks.push(o);if(o.userData.role==='south-tree-crown')crowns.push(o);});
  assert.equal(trunks.length,p.trees.length);assert.ok(crowns.length>=p.trees.length);b.kit.root.updateMatrixWorld(true);
  for(const trunk of trunks){const box=new THREE.Box3().setFromObject(trunk),collider=b.kit.colliders.find(c=>c.containsBox(box));assert.ok(collider,'actual complete trunk must be contained by its collider');}
  for(const crown of crowns){const box=new THREE.Box3().setFromObject(crown);assert.ok(box.min.y>2.2,'photo-fitted lower crown remains above pedestrian head height');assert.ok(b.kit.owned.includes(crown.material));assert.equal(crown.material.vertexColors,false,'colors survive ordinary merge');}
  assert.ok(b.kit.colliders.length===p.trees.length);assert.ok(result.triangles<16000);
 });
 test(`${id} final merged tree geometry forbids flight landing and retains open axial pedestrian approach`,()=>{
  const p=profile(id),b=new ZoneBase(library(),config(id));api.buildSouthCourtTrees(b.kit,config(id));const group=b.kit.finish();const env=new FlightEnvelope().addRoot(group);
  for(const t of p.trees){assert.equal(env.safeGround(t.x,t.z,1),false);assert.ok(env.minimumY(t.x,t.z,0)>t.height*.6);}
  for(let z=-236;z<-211;z+=.5)assert.equal(b.kit.colliders.some(c=>c.clone().expandByScalar(.5).containsPoint(new THREE.Vector3(p.axisX,1.7,z))),false);
  b.kit.dispose(group);
 });
}
test('tree profile cannot be transplanted or malformed and central court has no opt-in',()=>{
 profile('outer-east');assert.equal(api.southTreeProfile('axis-courts'),null);assert.equal(config('axis-courts').southTreeProfile,undefined);
 for(const z of [{id:'axis-courts',southTreeProfile:'wenhua-approach'},{...config('outer-east'),southTreeProfile:'unknown'}]){const b=new ZoneBase(library(),z);assert.throws(()=>api.buildSouthCourtTrees(b.kit,z),/tree profile/i);assert.equal(b.kit.root.children.length,0);}
});
test('Wuying photographed individual planting pits use bounded ground-level soil and stone footprints, not a grass band',()=>{const p=profile('outer-west'),b=new ZoneBase(library(),config('outer-west'));api.buildSouthCourtTrees(b.kit,config('outer-west'));const pits=[];b.kit.root.traverse(o=>{if(o.userData.role==='south-tree-pit-soil')pits.push(o);});assert.equal(pits.length,2);b.kit.root.updateMatrixWorld(true);for(const m of pits){const t=p.trees.find(t=>t.id===m.userData.treeId),box=new THREE.Box3().setFromObject(m);assert.ok(box.min.x<t.x&&box.max.x>t.x&&box.min.z<t.z&&box.max.z>t.z);assert.ok(box.max.y<=.025,'thin footprint cue is not a raised support');assert.ok(box.max.x-box.min.x<3);assert.equal(m.userData.reconstruction,'GROUND_LEVEL_FOOTPRINT_ONLY_CURB_HEIGHT_UNKNOWN');}assert.equal(b.kit.walkables.length,0);assert.equal(b.kit.colliders.length,2);});
