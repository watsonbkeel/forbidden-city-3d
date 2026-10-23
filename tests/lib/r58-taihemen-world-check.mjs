// Read-only consumer of an already-built W. No builder, loader, zone, actor,
// collider repair, floor synthesis, teleport, or browser startup is performed.
import assert from 'node:assert/strict';
import * as THREE from 'three';
import {PALACE_LAYOUT} from '../../src/scene/Layout.js';
export const TAIHEMEN_DIAGNOSTIC_VIEWS=Object.freeze([
  {id:'south-front',eye:[0,1.7,-276],target:[0,9,-214.2],fov:55},
  {id:'south-oblique',eye:[32,1.7,-259],target:[0,8,-214.2],fov:60},
  {id:'porch-looking-south',eye:[0,5.14,-217],target:[0,8,-230],fov:85},
]);
function visibleHit(hit) {
  for(let object=hit.object;object;object=object.parent)if(!object.visible)return false;
  const material=Array.isArray(hit.object.material)?hit.object.material[hit.face.materialIndex]:hit.object.material;
  return material?.visible!==false&&!(material?.transparent&&material.opacity<=0);
}
export function assertTaihemenInWorld(W) {
  assert.ok(W?.scene&&W?.cm,'Pass existing W.scene and W.cm; this helper does not build a world');
  const {scene,cm}=W,root=scene.getObjectByName('太和门'),p=root?.userData.taihemenSouthEnclosure;
  assert.ok(p,'Taihemen south enclosure owner hookup is missing');
  assert.equal(p.entityId,'FC-B3B12CF397');assert.equal(p.accepted,false);
  assert.equal(p.depthStatus,'BLOCKED_SOURCE');assert.equal(p.documentedDepthBays,4);assert.equal(p.retainedModelDepthBays,3);
  assert.equal(p.northStatus,'RETAINED_UNVERIFIED');
  const records=(root.userData.architecture??[]).filter(r=>r.id==='axis/taihemen-south-open-veranda');
  assert.equal(records.length,1,'one source-scoped structure, not accumulated helper copies');
  const data=PALACE_LAYOUT.find(h=>h.name==='太和门');
  const x0=root.position.x+data.position.x,z0=root.position.z+data.position.z,y=3.44,w=data.dimensions.width,bayW=w/9;
  const rays=(origin,direction,range)=>new THREE.Raycaster(origin,direction,0,range).intersectObject(root,true).filter(visibleHit);
  const hits=(x,z,range=1.4)=>rays(new THREE.Vector3(x,y+1.7,z-range/2),new THREE.Vector3(0,0,1),range);
  const body=(x,z)=>cm.checkCollision(new THREE.Vector3(x,y+1.7,z),.5);
  const eave=z0+p.southEaveZ,inner=z0+p.innerEnclosureZ;
  for(const bay of [1,2,3,4,5,6,7]) {
    const x=x0-w/2+(bay+.5)*bayW;
    assert.equal(body(x,eave),false,`open south eave bay ${bay} has an old invisible wall`);
    assert.equal(hits(x,eave).length,0,`open south eave bay ${bay} is visibly filled`);
    assert.ok(Math.abs(cm.getGroundHeight(x,eave,y,.03)-y)<1e-9);
    assert.ok(cm.walkables.some(s=>s.type==='box'&&Math.abs(s.box.max.y-y)<1e-9&&x>=s.box.min.x&&x<=s.box.max.x&&eave>=s.box.min.z&&eave<=s.box.max.z));
    const floor=rays(new THREE.Vector3(x,y+.08,eave),new THREE.Vector3(0,-1,0),.16)[0];
    // Retained slab caps are 0.02/0.03 above the unchanged 3.44 support datum.
    assert.ok(floor&&floor.point.y>=y-2e-4&&floor.point.y<=y+.04,`porch bay ${bay} has no visible rendered floor within retained paving tolerance`);
  }
  for(const bay of [0,8]) {
    const x=x0-w/2+(bay+.5)*bayW;
    assert.equal(body(x,eave),true);assert.ok(hits(x,eave).length,`closed eave bay ${bay} has no visible enclosure`);
  }
  for(const bay of [0,1,2,6,7,8]) {
    const x=x0-w/2+(bay+.5)*bayW;
    assert.equal(body(x,inner),true);assert.ok(hits(x,inner).length,`closed inner bay ${bay} has no visible enclosure`);
  }
  for(const bay of [3,4,5]) {
    const x=x0-w/2+(bay+.5)*bayW;
    assert.equal(body(x,inner),false);assert.equal(hits(x,inner).length,0);
  }
  return {openPorchSamples:7,closedEndSamples:2,blockedInnerSamples:6,retainedInnerPassages:3,
    renderedSupportSamples:7,supportY:y,documentedDepthBays:4,retainedModelDepthBays:3,depthStatus:p.depthStatus,
    scope:'SOUTH_VERANDA_PARTIAL; INNER_PATTERN_UNVERIFIED; NO_BROWSER_OR_FULL_HALL_ACCEPTANCE'};
}
