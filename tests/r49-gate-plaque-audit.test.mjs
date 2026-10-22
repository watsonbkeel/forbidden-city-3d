import test from 'node:test';
import assert from 'node:assert/strict';
import fs from 'node:fs';
import * as THREE from 'three';
import './lib/inner-palace-fixture.mjs';
import {realTextureLibrary} from './lib/r48-real-texture-library.mjs';
import {ZoneBase} from '../src/scene/zones/ZoneBase.js';
import {PalaceBuilder} from '../src/scene/PalaceBuilder.js';
import {PALACE_LAYOUT} from '../src/scene/Layout.js';

// A separate gate denominator, not the hall-name audit. Presence and ordinary
// approach visibility are checked against production merged triangles. This is
// not a verification of the historical wording, calligraphy or modern access.
function visibility(root,mesh,{outward=new THREE.Vector3(0,0,-1),depth=0}={}){
  mesh.updateWorldMatrix(true,false);root.updateMatrixWorld(true);
  const center=mesh.localToWorld(new THREE.Vector3(0,0,depth));
  const normal=outward.clone().transformDirection(mesh.matrixWorld);
  let visible=0,blocked=[];
  for(const distance of[8,20,40,80]){
    const origin=center.clone().addScaledVector(normal,distance);origin.y=1.7;
    const delta=center.clone().sub(origin);
    const hit=new THREE.Raycaster(origin,delta.clone().normalize(),0,delta.length()+.02).intersectObject(root,true)[0];
    const material=Array.isArray(hit?.object.material)?hit.object.material[hit.face.materialIndex]:hit?.object.material;
    const expected=Array.isArray(mesh.material)?mesh.material[1]:mesh.material;
    if(material===expected&&hit.point.distanceTo(center)<.02)visible++;
    else blocked.push(hit?.object.name??'no hit');
  }
  return {visible,blocked};
}

test('R49 all named modeled gates are audited separately from halls using real materials',()=>{
  const records=[];
  for(const file of fs.readdirSync(new URL('../data/zones/',import.meta.url)).filter(f=>f.endsWith('.json'))){
    const data=JSON.parse(fs.readFileSync(new URL(`../data/zones/${file}`,import.meta.url)));
    for(const item of data.items.filter(i=>['gate','cityGate'].includes(i.kind)&&i.name)){
      const lib=realTextureLibrary(),zone=new ZoneBase(lib,{id:data.id,items:[]});
      try{
        if(item.kind==='cityGate')zone.buildCityGate(item);else zone.buildGate(item);
        const plaques=zone.kit.plaques.map(p=>p.mesh),merged=zone.kit.finish();
        const views=plaques.map(p=>visibility(merged,p));
        records.push({zone:data.id,name:item.name,profile:item.gateProfile??item.southGateProfile??item.cityGateProfile??'generic',historical:!!item.historicalSite,plaques:plaques.length,visible:views.map(v=>v.visible),blocked:views.map(v=>v.blocked)});
        zone.group=merged;
      }finally{zone.dispose();lib.dispose();}
    }
  }
  for(const item of PALACE_LAYOUT.filter(i=>i.type==='gate')){
    const lib=realTextureLibrary(),b=new PalaceBuilder(new THREE.Scene(),lib),plain=[];
    const original=b.plaqueMesh.bind(b);b.plaqueMesh=(...args)=>{const mesh=original(...args);plain.push(mesh);return mesh;};
    let merged;const finish=b.finish.bind(b);b.finish=g=>{merged=finish(g);return merged;};
    try{
      b.buildGate(item);const plaques=[];merged.traverse(m=>{if(m.userData.gatePlaque)plaques.push(m);});
      const views=plaques.map(p=>visibility(merged,p,{outward:new THREE.Vector3(0,0,1),depth:p.userData.gatePlaque.dimensions.depth}));
      // Generic PalaceBuilder plaques have local +Z fronts, transformed by the
      // original caller. Their exact mesh can be merged but material is retained.
      views.push(...plain.map(p=>visibility(merged,p,{outward:new THREE.Vector3(0,0,1),depth:p.geometry.parameters.depth/2})));
      records.push({zone:'axis-static',name:item.name,profile:'PalaceBuilder',plaques:plaques.length+plain.length,visible:views.map(v=>v.visible),blocked:views.map(v=>v.blocked),omissions:merged.userData.gatePlaqueOmissions??[]});
    }finally{b.dispose();lib.dispose();}
  }
  if(process.env.R49_GATE_AUDIT_FILE)fs.writeFileSync(process.env.R49_GATE_AUDIT_FILE,JSON.stringify(records,null,2)+'\n');
  const missing=records.filter(r=>!r.plaques&&!r.historical).map(r=>r.name);
  const hidden=records.filter(r=>r.visible.some(n=>n===0)).map(r=>r.name);
  assert.deepEqual(missing,['皇极门'],'do not fabricate an unverified historic sign; known pre-existing omission remains explicit');
  assert.deepEqual(hidden,[],JSON.stringify(records.filter(r=>r.visible.some(n=>n===0))));
  assert.ok(records.length>60);assert.ok(records.some(r=>r.name==='乾清门'&&r.plaques===1));
});
