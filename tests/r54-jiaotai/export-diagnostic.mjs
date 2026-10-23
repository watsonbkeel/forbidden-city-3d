import fs from 'node:fs';
import {mock} from 'node:test';
import path from 'node:path';
import * as THREE from 'three';
import {gzipSync,gunzipSync} from 'node:zlib';
import {rearPalaceFragment,hallFragment,geometrySignature,hash} from '../lib/r54-jiaotai-fragment.mjs';
import {CollisionManager} from '../../src/utils/Collision.js';
import {exportProductionView} from '../lib/r51-production-raster.mjs';
import {assertJiaotaiDisplayInWorld,replayJiaotaiDisplayRoute,JIAOTAI_DISPLAY_CAMERAS,JIAOTAI_DISPLAY_ROUTE} from '../lib/r54-jiaotai-world-check.mjs';
const out=process.argv[2]??'docs/validation/r54-jiaotai-display/base-materials';fs.mkdirSync(out,{recursive:true});
const {scene,builder}=rearPalaceFragment(),cm=new CollisionManager();cm.addColliders(builder.colliders);cm.addWalkables(builder.walkables);
const proof=assertJiaotaiDisplayInWorld({scene,cm}),replays=[];
for(const fps of [10,60])for(const sprint of [false,true])for(const backward of [false,true])replays.push(replayJiaotaiDisplayRoute({mock},{scene,cm,THREE},{fps,sprint,backward}));
for(const c of JIAOTAI_DISPLAY_CAMERAS){
  const camera=new THREE.PerspectiveCamera(c.fov??65,c.aspect??16/9,.1,100);camera.position.fromArray(c.position);camera.lookAt(...c.target);camera.updateMatrixWorld(true);
  const dest=path.join(out,c.id+'.json.gz');
  exportProductionView({scene,camera,characters:{manager:{simulationSeconds:0}}},dest,{far:24});
  const data=JSON.parse(gunzipSync(fs.readFileSync(dest)));delete data.characterSourceHashes;delete data.simulationSeconds;
  data.diagnosticSize=c.diagnosticSize??[960,540];
  data.kind='Actual merged rear-palace fragment only; no full-world or CharacterRenderer claim. CPU source-bound blockout diagnostic; no textures/GPU/photosurvey acceptance.';
  fs.writeFileSync(dest,gzipSync(JSON.stringify(data)));
}
const {group,shell}=hallFragment(),boxes=[];group.traverse(m=>{if(!m.isMesh||!m.userData.jiaotaiDisplayId)return;const b=new THREE.Box3().setFromObject(m);boxes.push({id:m.name,min:b.min.toArray(),max:b.max.toArray()});});
fs.writeFileSync(path.join(out,'geometry-and-navigation.json'),JSON.stringify({unmergedGeometryHash:geometrySignature(group),physicalHash:hash({colliders:shell.userData.structure.displaySetting.colliders,walkables:shell.userData.structure.displaySetting.walkables}),stage:shell.userData.structure.displaySetting.stage,backdropRevision:shell.userData.structure.displaySetting.backdropRevision,proof,replays,boxes,route:JIAOTAI_DISPLAY_ROUTE},null,2)+'\n');
console.log(JSON.stringify({out,triangles:proof.triangles,colliders:proof.colliders.length,walkables:proof.walkables.length}));
