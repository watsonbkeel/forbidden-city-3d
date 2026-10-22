import test from 'node:test';
import assert from 'node:assert/strict';
import fs from 'node:fs';
import * as THREE from 'three';
import './lib/inner-palace-fixture.mjs';
import { realTextureLibrary } from './lib/r48-real-texture-library.mjs';
import { PalaceBuilder } from '../src/scene/PalaceBuilder.js';
import { PALACE_LAYOUT } from '../src/scene/Layout.js';
import { buildQianqingGate } from '../src/scene/palace/special/QianqingGate.js';
import { CourtKit } from '../src/scene/palace/kit.js';
import { buildQinanHall } from '../src/scene/palace/special/QinanHall.js';
import { CollisionManager } from '../src/utils/Collision.js';
import { replayTerrace } from './lib/terrace-walk.mjs';
const item = JSON.parse(fs.readFileSync(new URL('../data/zones/garden.json', import.meta.url))).items.find(i => i.qinanProfile);
function qinan() {
  const lib=realTextureLibrary(),kit=new CourtKit(lib,'garden'),{f,g}=buildQinanHall(kit,item),cm=new CollisionManager();
  cm.rivers=[];cm.addColliders(kit.colliders,'garden');cm.addWalkables(kit.walkables,'garden');f.updateMatrixWorld(true);
  return {lib,kit,f,g,cm,THREE};
}
test('R49 real production Qianqing Gate retains a front-visible name plaque on the rear-eave central lintel',()=>{
  const lib=realTextureLibrary(),b=new PalaceBuilder(new THREE.Scene(),lib),data=PALACE_LAYOUT.find(i=>i.name==='乾清门');
  try{
    const f=buildQianqingGate(b,data);f.updateMatrixWorld(true);
    assert.equal(lib.material('wood_column').name,'wood_column_material');
    const p=f.getObjectByName('qianqing-rear-eave-gate-name-plaque');
    assert.ok(p,'dedicated Qianqing builder must actually emit the missing name plaque');
    assert.equal(p.userData.gatePlaque.text,'乾清門');
    assert.equal(p.userData.gatePlaque.layout,'vertical');
    assert.equal(p.userData.gatePlaque.side,'south');
    assert.equal(p.userData.gatePlaque.mount.kind,'rear-eave-central-lintel');
    assert.equal(p.userData.noMerge,true);
    const bounds=new THREE.Box3().setFromObject(p);
    assert.ok(bounds.max.z<data.position.z+data.dimensions.depth/2);
    assert.ok(bounds.min.z>data.position.z,'not misplaced on the outer south eave');
    assert.ok(bounds.min.y>1.5+4.6,'clear the retained central door');
    for(const from of [[0,1.7,data.position.z-data.dimensions.depth/2-5],[0,3.2,data.position.z]]){
      const origin=new THREE.Vector3(...from),to=p.localToWorld(new THREE.Vector3(0,0,.12)),delta=to.sub(origin);
      const hits=new THREE.Raycaster(origin,delta.clone().normalize(),0,delta.length()+.01).intersectObject(f,true);
      assert.ok(hits[0]?.object===p,`walk-height visitor must see the plaque, not ${hits[0]?.object.name}`);
      assert.equal(hits[0]?.face.materialIndex,1,'letters only on outward face');
    }
  }finally{b.dispose();lib.dispose();}
});
for(const sign of [-1,1]) for(const fps of [60,10]) for(const sprint of [false,true]) for(const backward of [false,true]) {
  test(`R49 Qinan ${sign<0?'east':'west'} side stairs enter annex and main hall then return: ${fps}Hz sprint=${sprint} backward=${backward}`,t=>{
    const W=qinan(),g=W.g,z=g.z+g.terraceGuide.sideStairCenterZ;
    const points=[[sign*18,477],[sign*18,z],[sign*8,z],[0,z],[0,g.z],[0,z],[sign*8,z],[sign*18,z],[sign*18,477]];
    try{
      const r=replayTerrace(t,W,points,{fps,sprint,backward,recordFrames:true});
      assert.equal(r.arrived,true,JSON.stringify({...r,frames:undefined}));
      assert.ok(r.maxFeet>=g.datum.floorY-.01,'must climb the real stairs');
      assert.equal(r.end[2],0,'return to ground using the same physical stair');
      assert.ok(r.frames.some(p=>Math.abs(p.x)<1&&Math.abs(p.z-g.z)<1&&Math.abs(p.feet-g.datum.floorY)<.01),'actually enter the main hall');
      assert.ok(W.cm.checkCollision(new THREE.Vector3(0,g.datum.floorY+1.7,g.z+g.mainBody.columnFootGrid.zs.at(-1)),.5),'the north wall must remain solid');
      assert.ok(W.kit.walkables.every(w=>!w.rescue),'no rescue floor or magic support');
      assert.equal(g.provenance.currentConditionAccepted,false);
      assert.equal(g.navigation.gameAccess,'virtual-interior-return');
      assert.equal(g.portals.length,2);
    }finally{W.kit.dispose(W.kit.root);W.lib.dispose();}
  });
}

// Inspect every emitted near-route triangle, not material-name guesses or rays at
// a point avatar. Only exact triangles from the unchanged stair/support solids
// are step contacts; no wall, furniture, leaf or window is exempted.
function triangles(root, visit) {
  root.updateMatrixWorld(true);
  root.traverse(m=>{
    if(!m.isMesh||!m.geometry?.attributes.position)return;
    for(let n=m;n;n=n.parent)if(!n.visible)return;
    const p=m.geometry.attributes.position,index=m.geometry.index;
    const count=index?.count??p.count;
    for(let inst=0;inst<(m.isInstancedMesh?m.count:1);inst++){
      const matrix=m.matrixWorld.clone();
      if(m.isInstancedMesh){const local=new THREE.Matrix4();m.getMatrixAt(inst,local);matrix.multiply(local);}
      for(let i=0;i<count;i+=3){
        const v=[0,1,2].map(k=>new THREE.Vector3().fromBufferAttribute(p,index?index.getX(i+k):i+k).applyMatrix4(matrix));
        const box=new THREE.Box3().setFromPoints(v);
        if(box.max.x< -19||box.min.x>19||box.max.z<476||box.min.z>495||box.min.y>3.8||box.max.y<0)continue;
        visit({triangle:new THREE.Triangle(...v),box,mesh:m,key:v.map(p=>p.toArray().map(n=>(Math.round(n*1e4)/1e4).toFixed(4)).join(',')).sort().join('|')});
      }
    }
  });
}

test('R49 full garden, production merged geometry: both side round trips clear a 1m wide / 1.7m tall body at every frame',async t=>{
  const {buildWorld}=await import('./lib/world.mjs');
  const {ZoneBase}=await import('../src/scene/zones/ZoneBase.js');
  const W=await buildWorld({realMaterials:true,retainScene:true});
  const lib=realTextureLibrary(),zone=new ZoneBase(lib,JSON.parse(fs.readFileSync(new URL('../data/zones/garden.json',import.meta.url))));
  const raw=qinan(),stepTriangles=new Set();
  raw.f.traverse(m=>{if(['qinan-support-body','qinan-support-paving','qinan-side-stair-step'].includes(m.userData.role))triangles(m,v=>stepTriangles.add(v.key));});
  const data=zone.build();W.scene.add(data.group);
  const bins=new Map(),cell=4,groundSkins=new Set();let triangleCount=0;
  triangles(W.scene,v=>{
    triangleCount++;
    // GardenBuilder deliberately layers the large ground/path skins at 1.2 / 2.8cm
    // above logical ground. Match exact flat triangles, not all low materials.
    if(v.mesh.name.startsWith('garden_static_')&&[.012,.028].some(y=>Math.abs(v.box.max.y-y)<1e-6)&&Math.abs(v.box.max.y-v.box.min.y)<1e-7&&v.triangle.getArea()>1)groundSkins.add(v.key);
    for(let x=Math.floor(v.box.min.x/cell);x<=Math.floor(v.box.max.x/cell);x++)for(let z=Math.floor(v.box.min.z/cell);z<=Math.floor(v.box.max.z/cell);z++){
      const key=`${x},${z}`;if(!bins.has(key))bins.set(key,[]);bins.get(key).push(v);
    }
  });
  assert.ok(triangleCount>1000);assert.ok(stepTriangles.size>200);
  let tested=0,acceptedStepContacts=0;
  try{
    for(const sign of[-1,1])for(const fps of[60,10])for(const sprint of[false,true])for(const backward of[false,true]){
      const z=raw.g.z+raw.g.terraceGuide.sideStairCenterZ;
      const points=[[sign*18,477],[sign*18,z],[sign*8,z],[0,z],[0,raw.g.z],[0,z],[sign*8,z],[sign*18,z],[sign*18,477]];
      const r=replayTerrace(t,W,points,{fps,sprint,backward,recordFrames:true});
      assert.equal(r.arrived,true,JSON.stringify({...r,frames:undefined}));assert.equal(r.end[2],0);
      for(const frame of r.frames){
        const body=new THREE.Box3(new THREE.Vector3(frame.x-.499,frame.ground+.001,frame.z-.499),new THREE.Vector3(frame.x+.499,frame.ground+1.7,frame.z+.499));
        const candidates=new Set();
        for(let x=Math.floor(body.min.x/cell);x<=Math.floor(body.max.x/cell);x++)for(let z=Math.floor(body.min.z/cell);z<=Math.floor(body.max.z/cell);z++)for(const v of bins.get(`${x},${z}`)??[])candidates.add(v);
        for(const v of candidates){
          if(!body.intersectsBox(v.box)||!body.intersectsTriangle(v.triangle))continue;
          if(frame.ground===0&&groundSkins.has(v.key))continue;
          if(stepTriangles.has(v.key)&&v.box.max.y<=frame.ground+.35+.001){acceptedStepContacts++;continue;}
          assert.fail(`Body intersects actual triangle: ${JSON.stringify({sign,fps,sprint,backward,frame,role:v.mesh.userData.role,name:v.mesh.name,material:v.mesh.material?.name,triangle:v.key})}`);
        }
        tested++;
      }
    }
    assert.ok(tested>1000);assert.ok(acceptedStepContacts>0);
    t.diagnostic(`${triangleCount} nearby finished triangles; ${tested} full-body frames; ${acceptedStepContacts} exact <=0.35m stair/support contacts, no exempt furniture/walls`);
  }finally{raw.kit.dispose(raw.kit.root);raw.lib.dispose();zone.dispose();lib.dispose();}
});

test('R49 Qinan source-visible inter-eave plaque is present after production finish and its Han characters face the south approach',()=>{
  const W=qinan();let root;
  try{
    root=W.kit.finish();root.updateMatrixWorld(true);
    const p=root.getObjectByName('qinan-south-name-plaque');
    assert.ok(p,'official south photograph proves a name plaque missing from the dedicated hall builder');
    const d=p.userData.gatePlaque;
    assert.equal(d.text,'欽安殿');assert.equal(d.layout,'vertical');assert.equal(d.renderedLayout,'HAN_ONLY_SEMANTIC_APPROXIMATION');
    assert.equal(d.omittedScript.status,'DEFERRED_UNVERIFIED_TRANSCRIPTION_AND_FONT');
    const bounds=new THREE.Box3().setFromObject(p);
    assert.ok(bounds.min.y>W.g.datum.columnBaseTopY+W.g.mainBody.enclosureApproximation.upperDrumBottomRelativeY);
    assert.ok(bounds.max.y<W.g.levels.upperEavePurlinBottom);
    // Entire fitted board volume must clear the actual roof and enclosure,
    // not just place a readable center in front of an intersecting mesh.
    const safeBounds=bounds.clone();safeBounds.min.addScalar(.0001);safeBounds.max.addScalar(-.0001);
    root.traverse(m=>{
      if(!m.isMesh||m===p)return;
      const pos=m.geometry.attributes.position,index=m.geometry.index;
      for(let i=0;i<(index?.count??pos.count);i+=3){
        const verts=[0,1,2].map(k=>new THREE.Vector3().fromBufferAttribute(pos,index?index.getX(i+k):i+k).applyMatrix4(m.matrixWorld));
        const box=new THREE.Box3().setFromPoints(verts);if(!safeBounds.intersectsBox(box))continue;
        assert.ok(!safeBounds.intersectsTriangle(new THREE.Triangle(...verts)),`Qinan nameboard penetrates ${m.name}`);
      }
    });
    for(const from of[[0,1.7,465],[10,1.7,465],[-10,1.7,465]])for(const y of[-.32,0,.32]){
      const origin=new THREE.Vector3(...from),target=p.localToWorld(new THREE.Vector3(0,y,d.dimensions.depth)),delta=target.sub(origin);
      const hits=new THREE.Raycaster(origin,delta.clone().normalize(),0,delta.length()+.02).intersectObject(root,true);
      assert.ok(hits[0]?.object===p,`Qinan character y=${y} blocked from ${from} by ${hits[0]?.object.name}`);
      assert.equal(hits[0]?.face.materialIndex,1);
    }
  }finally{W.kit.dispose(root??W.kit.root);W.lib.dispose();}
});
