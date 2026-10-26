import fs from 'node:fs';
import * as THREE from 'three';
import {baoheFirewallWorld} from './fixture.mjs';
import {exportProductionView} from '../lib/r51-production-raster.mjs';
const phase=process.argv[2]??'before',out=`reports/r92-joint/cpu/${phase}`;fs.mkdirSync(out,{recursive:true});
const W=baoheFirewallWorld();
const views=[{id:'east-oblique',position:[-91,35,71],target:[-35,9,123],fov:48},{id:'door',position:[-37,10,110],target:[-37,9.5,123],fov:60},{id:'joins',position:[-77,19,103],target:[-59,8,123],fov:55}];
for(const v of views){const camera=new THREE.PerspectiveCamera(v.fov,960/540,.03,220);camera.position.fromArray(v.position);camera.lookAt(...v.target);exportProductionView({scene:W.scene,camera,characters:{manager:{simulationSeconds:0}}},`${out}/${v.id}.json.gz`,{far:180});}
fs.writeFileSync(`reports/r92-joint/${phase}-geometry.json`,JSON.stringify({controls:W.builderData,meshCount:W.meshes.length,colliders:W.builder.colliders.length,walkables:W.builder.walkables.length,meshBoundsHash:W.geometryHash,views},null,2));
