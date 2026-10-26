import fs from 'node:fs';
import * as THREE from 'three';
import {baoheFirewallWorld} from './fixture.mjs';
const W=baoheFirewallWorld();
const gateGroups=W.kit.root.children.map(g=>({name:g.name,box:new THREE.Box3().setFromObject(g)})).filter(g=>g.box.min.x < -70 && g.box.max.x > -82);
const result={base:'9cf1460148124b56a9d485197f7f2af4d24dd312',rects:W.builderData.rects,gateGroups,geometryHash:W.geometryHash,westMeshHash:'pending exact scoped comparison',note:'Actual baseline geometry; candidate bounds not applied'};
fs.writeFileSync('reports/r92-joint/baseline-probe.json',JSON.stringify(result,null,2));console.log(JSON.stringify(result,null,2));
