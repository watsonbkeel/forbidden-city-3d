// Actual triangle intersection evidence, not a raster, WebGL or aesthetic sign-off.
// Both architectural runs use the identical candidate Kit 07 geometry and motion.
import assert from 'node:assert/strict';
import fs from 'node:fs';
import path from 'node:path';
import {fileURLToPath,pathToFileURL} from 'node:url';
import {createHash} from 'node:crypto';
import {execFileSync} from 'node:child_process';
import {gunzipSync,gzipSync} from 'node:zlib';
import * as T from 'three';
import {createCharacterGeometry} from '../src/scene/characters/CharacterKit.js';
import {characterGeometryOptionsFor} from '../src/scene/characters/CharacterGeometryOptions.js';
import {characterEnvironmentMotion} from '../src/scene/characters/CharacterBehavior.js';
import {deformCharacterVertex} from '../src/scene/characters/CharacterAnimation.js';
import {PatrolController} from '../src/scene/characters/PatrolController.js';
import {CHARACTER_REGISTRY as registry} from '../data/characters/index.js';
const root=path.resolve(path.dirname(fileURLToPath(import.meta.url)),'..');
const architectureRoot=path.resolve(process.argv[2]??root),out=path.resolve(process.argv[3]??path.join(root,'reports/r51-unified/world-sightlines-r49e.json.gz'));
const sha=b=>createHash('sha256').update(b).digest('hex');
assert.equal(sha(fs.readFileSync(path.join(root,'src/scene/characters/CharacterKit.js'))),'cc311f8fdaa912538fdfffebd66b7fa2c5de7f2c7063ffbc5bf462bc3f5edc6c','Original R51 Kit07 sightline capture is frozen; prove LOD0 byte inheritance instead of overwriting it.');
const freeze=JSON.parse(fs.readFileSync(path.join(architectureRoot,'data/characters/world-source-freeze.json')));
assert.equal(freeze.baselineCommit,'db20828f1a6411603a3d9388eebe3ba2a5d11e61','This new R51/R49E capture is version-bound; later architectures require a new capture identity.');
for(const f of freeze.files)assert.equal(sha(fs.readFileSync(path.join(architectureRoot,f.path))),f.sha256,'world source '+f.path);
const joint=JSON.parse(gunzipSync(fs.readFileSync(path.join(root,'reports/r51-unified/world-bindings-38-148.json.gz'))));
const {buildCharacterWorld}=await import(pathToFileURL(path.join(architectureRoot,'tests/p3c-world-fixture.mjs')));
const W=await buildCharacterWorld(),characterMeshes=[],states=[];
const time=0;
for(const [i,actor]of registry.actors.entries()){
 const binding=joint.bindings[i];let state={position:binding.position,rotationYRad:binding.rotationYRad,speed:0};
 if(binding.path){const controller=new PatrolController({path:binding.path,...actor.behavior});state=controller.sample(time,actor.behavior.followerIndex??0);}
 const geometry=createCharacterGeometry(actor.templateId,actor.behavior.basePose,0,characterGeometryOptionsFor(actor)),a=geometry.attributes;
 const animation=characterEnvironmentMotion(actor,time,state.speed??0);
 for(let k=0;k<a.position.count;k++){
  const d=deformCharacterVertex([a.position.getX(k),a.position.getY(k),a.position.getZ(k)],[a.normal.getX(k),a.normal.getY(k),a.normal.getZ(k)],{part:a.characterPart.getX(k),pivot:[a.characterPivot.getX(k),a.characterPivot.getY(k),a.characterPivot.getZ(k)],weight:a.characterWeight.getX(k),torsoWeight:a.characterTorsoWeight.getX(k)},animation);
  a.position.setXYZ(k,...d.position);a.normal.setXYZ(k,...d.normal);
 }
 geometry.computeBoundingBox();geometry.computeBoundingSphere();
 const mesh=new T.Mesh(geometry,new T.MeshStandardMaterial({vertexColors:true}));mesh.name='joint-character:'+actor.id;mesh.userData.actorId=actor.id;mesh.position.fromArray(state.position);mesh.rotation.y=state.rotationYRad;W.scene.add(mesh);characterMeshes.push(mesh);states.push({...state,animation});
}
W.scene.updateMatrixWorld(true);const visible=[];W.scene.traverse(o=>{if(!o.isMesh)return;for(let p=o;p;p=p.parent)if(!p.visible)return;visible.push(o);});
const ray=new T.Raycaster(),rows=[],a=new T.Vector3(),b=new T.Vector3(),c=new T.Vector3(),normal=new T.Vector3(),center=new T.Vector3();
const classify=h=>h?{name:h.object.name,actorId:h.object.userData.actorId??null,role:h.object.userData.role??null,materialName:(Array.isArray(h.object.material)?h.object.material[h.face?.materialIndex??0]:h.object.material)?.name??null,point:h.point.toArray(),distanceMeters:h.distance,triangleIndex:h.faceIndex,sourceMount:h.object.userData.sourceGuidedNameboardMount??h.object.userData.hallNameboardMount??null}:null;
for(const [i,actor]of registry.actors.entries()){
 const mesh=characterMeshes[i],geometry=mesh.geometry,position=geometry.attributes.position,index=geometry.index,box=geometry.boundingBox,height=box.max.y-box.min.y;
 const candidates=[];for(let k=0;k<(index?.count??position.count);k+=3){a.fromBufferAttribute(position,index?index.getX(k):k);b.fromBufferAttribute(position,index?index.getX(k+1):k+1);c.fromBufferAttribute(position,index?index.getX(k+2):k+2);normal.subVectors(b,a).cross(new T.Vector3().subVectors(c,a)).normalize();if(normal.z<.3)continue;center.copy(a).add(b).add(c).multiplyScalar(1/3);candidates.push({triangleIndex:k/3,local:center.clone()});}
 assert.ok(candidates.length>20,'front facing real character triangles');
 // Nine actual triangle centroids across three body-height bands; never a box target.
 const targets=[];for(const fraction of [.25,.55,.85])for(const x of [-.12,0,.12]){
  const targetY=box.min.y+fraction*height;
  const selected=candidates.reduce((best,v)=>{const score=(v.local.y-targetY)**2+(v.local.x-x)**2+.01*(box.max.z-v.local.z)**2;return !best||score<best.score?{...v,score}:best;},null);
  targets.push({heightFraction:fraction,lateralMeters:x,triangleIndex:selected.triangleIndex,local:selected.local.toArray(),world:mesh.localToWorld(selected.local.clone())});
 }
 for(const distance of [3,7]){
  const state=states[i],camera=new T.Vector3(...state.position).add(new T.Vector3(Math.sin(state.rotationYRad)*distance,1.65,Math.cos(state.rotationYRad)*distance)),hits=[];
  for(const target of targets){const delta=target.world.clone().sub(camera);ray.set(camera,delta.clone().normalize());ray.near=.001;ray.far=delta.length()+.01;const all=ray.intersectObjects(visible,false),first=all[0],own=all.find(h=>h.object===mesh);assert.ok(own,'target actual triangle must be ray intersectable '+actor.id);hits.push({...target,world:target.world.toArray(),targetVisible:first?.object===mesh,first:classify(first),own:classify(own)});}
  rows.push({actorId:actor.id,required:actor.required,sceneRef:actor.sceneRef,mode:distance===3?'near-front':'medium-front',camera:camera.toArray(),distanceMeters:distance,position:state.position,rotationYRad:state.rotationYRad,simulationSeconds:time,geometryOptions:characterGeometryOptionsFor(actor),actualVisibleTargets:hits.filter(h=>h.targetVisible).length,totalActualTriangleTargets:hits.length,hits});
 }
}
const report={kind:'CPU exact actual-geometry raycast comparison, NOT pixels, GPU, texture legibility, visual acceptance or walkable-camera certification.',architectureRoot:path.basename(architectureRoot),architectureCommit:execFileSync('git',['rev-parse','HEAD'],{cwd:architectureRoot,encoding:'utf8'}).trim(),architectureFreezeBaseline:freeze.baselineCommit,architectureSourcesVerified:freeze.files.length,characterKitSha256:sha(fs.readFileSync(path.join(root,'src/scene/characters/CharacterKit.js'))),scope:'Fresh production buildCharacterWorld static architecture plus loaded west-six, matching all 38 required actor sites; colliders cover all zones. R51 candidate Kit 07 and deterministic production motion. This is a fresh R49E world capture; prior R49B evidence remains separate.',cameraDefinition:'3 m near and 7 m medium, on each actual character +Z front, at root +1.65 m. Ray to nine real front-facing character triangle centroids at 25%, 55%, 85% of actual mesh height, three lateral samples. Every visible scene mesh is tested with full THREE triangle raycasting and production material side. Bounds only accelerate ray traversal, never count as a hit.',actors:38,cameras:rows.length,totalRays:rows.reduce((n,r)=>n+r.hits.length,0),rows};
const outputBytes=Buffer.from(JSON.stringify(report,null,2)+'\n');fs.writeFileSync(out,out.endsWith('.gz')?gzipSync(outputBytes):outputBytes);console.log(JSON.stringify({out,actors:38,cameras:report.cameras,totalRays:report.totalRays,visibleTargetCount:rows.reduce((n,r)=>n+r.actualVisibleTargets,0),partlyBlocked:rows.filter(r=>r.actualVisibleTargets<9).map(r=>({actor:r.actorId,mode:r.mode,visible:r.actualVisibleTargets,blockers:[...new Set(r.hits.filter(h=>!h.targetVisible).map(h=>h.first?.actorId??h.first?.name))]}))},null,2));
