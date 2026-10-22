import test from 'node:test';
import assert from 'node:assert/strict';
import {readFileSync} from 'node:fs';
import * as THREE from 'three';
import './lib/inner-palace-fixture.mjs';
import {realTextureLibrary} from './lib/r48-real-texture-library.mjs';
import {ZoneBase} from '../src/scene/zones/ZoneBase.js';

// These inequalities come from actual official photo composition, not from
// an assumption that a nameboard must be visible from every courtyard view.
// Whole backing, not only the lettering, must stay above the main door head.
for (const [zone,name] of [['east-six','景仁宫'],['east-six','钟粹宫'],['west-six','翊坤宫'],['west-six','储秀宫'],['west-six','长春宫'],['east-six','承乾宫'],['east-six','景阳宫'],['west-six','太极殿'],['west-six','永寿宫'],['west-six','咸福宫']]) {
 test(`${name}: complete nameboard is above door and in front of beam without shrinking`,()=>{
  const data=JSON.parse(readFileSync(new URL(`../data/zones/${zone}.json`,import.meta.url)));
  const item=data.items.find(i=>i.name===name),lib=realTextureLibrary(),b=new ZoneBase(lib,data);
  try {
   const result=b.buildHall(item),p=b.kit.plaques.find(p=>p.text===(item.plaqueText??name));
   assert.ok(p?.frame,'registered face and its own backing required');
   const beamH=THREE.MathUtils.clamp(item.colH*.12,.45,.85);
   const doorTop=item.ph+(item.colH-beamH)*.8,mainBeamBottom=item.ph+item.colH-beamH;
   const halfFrame=p.frame.geometry.parameters.height*p.frame.scale.y/2;
   assert.ok(p.frame.position.y-halfFrame>=doorTop+.02,
    `full frame bottom ${p.frame.position.y-halfFrame} must be above main door head ${doorTop}`);
   assert.equal(p.mesh.geometry.parameters.height*p.mesh.scale.y,THREE.MathUtils.clamp(item.colH*.3,1.1,2.2),'keep the existing face height, do not shrink to fit a false below-beam band');
   assert.equal(p.mesh.position.y,p.frame.position.y);
   assert.ok(Math.abs(p.frame.position.z-p.mesh.position.z-.06)<1e-9);
   assert.ok(p.mesh.position.z> -item.d/2-1,'remain at main hall, not shifted to canopy front');
   b.kit.root.updateMatrixWorld(true);
   const volume=new THREE.Box3().setFromObject(p.frame).expandByScalar(-.002),tri=new THREE.Triangle(),blockers=new Set();
   b.kit.root.traverse(m=>{if(!m.isMesh||m===p.mesh||m===p.frame)return;const g=m.geometry,a=g.attributes.position,idx=g.index,n=idx?.count??a.count;for(let i=0;i<n;i+=3){for(const [k,key]of ['a','b','c'].entries())tri[key].fromBufferAttribute(a,idx?idx.getX(i+k):i+k).applyMatrix4(m.matrixWorld);if(volume.intersectsTriangle(tri))blockers.add(m.name||m.userData.role||m.material?.name||'anonymous');}});
   assert.deepEqual([...blockers],[],'whole plaque/frame must not intersect real roof or wall triangles');
  } finally {b.kit.dispose(b.kit.root);lib.dispose();}
 });
}
