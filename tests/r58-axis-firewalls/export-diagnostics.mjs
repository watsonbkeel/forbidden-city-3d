import fs from 'node:fs';
import * as THREE from 'three';
import {axisFirewallBaseline} from './baseline.mjs';
import {createTaiheEastFirewallProfile} from '../../src/scene/palace/special/AxisFirewallProfiles.js';
import {buildTaiheEastFirewall} from '../../src/scene/palace/special/AxisFirewalls.js';
import {exportProductionView} from '../lib/r51-production-raster.mjs';
import {firewallFootprint} from '../lib/r58-axis-firewall-qa.mjs';
const output=process.argv[2]??'/tmp/r58-axis-firewall-raster';fs.mkdirSync(output,{recursive:true});
const W=axisFirewallBaseline(),profile=createTaiheEastFirewallProfile({hall:W.builderData.halls[0],rect:W.builderData.rects[0],...W.builderData.options,linkWall:W.axis.items[13]});
const beforeColliders=W.builder.colliders.length,beforeWalkables=W.builder.walkables.length,beforeMeshes=[];
W.scene.traverse(m=>{if(m.isMesh)beforeMeshes.push(m);});
const cameras=[
 {id:'east-oblique',position:[-91,26,24],target:[-42,8,-12.2],fov:58},
 {id:'doorway',position:[-43,10,-22],target:[-43,9.9,-12.2],fov:65},
 {id:'three-rail-junctions',position:[-71,11,-25],target:[-58,6.4,-12.2],fov:60},
];
const views=[];
function capture(phase){for(const view of cameras){const camera=new THREE.PerspectiveCamera(view.fov,960/540,.03,220);camera.position.fromArray(view.position);camera.lookAt(...view.target);views.push({phase,id:view.id,...exportProductionView({scene:W.scene,camera,characters:{manager:{simulationSeconds:0}}},`${output}/${phase}-${view.id}.json.gz`,{far:180})});}}
capture('before');const group=buildTaiheEastFirewall(W.builder,W.scene.children[0],profile);W.scene.updateMatrixWorld(true);capture('after');
const masonry=[];group.traverse(m=>{if(m.isMesh&&m.userData.firewallPart==='masonry')masonry.push(new THREE.Box3().setFromObject(m));});
const envelope=firewallFootprint(profile),rails=[];
for(const m of beforeMeshes){if(m.material?.name!=='balustrade')continue;const box=new THREE.Box3().setFromObject(m);if(!box.intersectsBox(envelope))continue;
 const intersection=box.clone().intersect(envelope),cover=masonry.find(b=>b.clone().expandByScalar(1e-6).containsBox(intersection));
 const childIndex=W.scene.children[0].children.indexOf(m.parent);
 const colliderMatches=W.builder.colliders.slice(0,beforeColliders).flatMap((b,index)=>b.clone().expandByScalar(1e-6).containsBox(box.clone().set(new THREE.Vector3(box.min.x,Math.max(box.min.y,b.min.y),box.min.z),new THREE.Vector3(box.max.x,Math.min(box.max.y,b.max.y),box.max.z)))?[{index,min:b.min.toArray(),max:b.max.toArray()}]:[]);
 rails.push({groupChildIndex:childIndex,meshIndex:m.parent.children.indexOf(m),material:m.material.name,bounds:{min:box.min.toArray(),max:box.max.toArray()},intersection:{min:intersection.min.toArray(),max:intersection.max.toArray()},fullyEnclosedWithinMasonry:!!cover,wallTop:cover?.max.y??null,renderedTop:box.max.y,verticalCoverMeters:cover?cover.max.y-box.max.y:null,colliderMatches,action:cover?'RETAIN: crossing volume is wholly inside masonry; external rail portions terminate visually at wall faces':'REVIEW_EXPOSED_INTERSECTION'});
}
const report={scope:'actual unmerged three-hall fragment + existing east connecting corridor and transverse gates; no fullworld',baseCommit:'755dd9ac5c6f8a8766c1db3e8e4f8fe17fa142da',profile,beforeGeometryHash:W.geometryHash,delta:{colliders:W.builder.colliders.length-beforeColliders,walkables:W.builder.walkables.length-beforeWalkables,meshes:group.getObjectsByProperty('isMesh',true).length},railIntersections:rails,views};
fs.writeFileSync(`${output}/mesh-review.json`,JSON.stringify(report,null,2)+'\n');console.log(JSON.stringify({output,delta:report.delta,rails:rails.map(r=>({child:r.groupChildIndex,min:r.bounds.min,max:r.bounds.max,covered:r.fullyEnclosedWithinMasonry,colliders:r.colliderMatches.map(c=>c.index)})),views:views.length}));
