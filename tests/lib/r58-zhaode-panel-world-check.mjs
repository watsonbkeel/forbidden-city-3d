// Read-only consumer of EXISTING W.scene / W.cm. No world creation, loader,
// floor repair, registration, actor, controller alteration or browser startup.
import assert from 'node:assert/strict';
import * as THREE from 'three';
import {zhaodeGateGeometry} from '../../src/scene/palace/special/ZhaodeGateProfile.js';
import {bindProfileSupports} from './profile-support-trace.mjs';
const palette=[0x907253,0x346f70,0xc3c0a6,0x925042];
const near=(a,b)=>assert.ok(Math.abs(a-b)<1e-5,`${a} != ${b}`);
export function assertZhaodePanelsInWorld(W){
 assert.ok(W?.scene&&W?.cm,'Pass an already constructed W.scene and W.cm');W.scene.updateMatrixWorld(true);
 const records=[];W.scene.traverse(o=>{for(const r of [o.userData.structure,...(o.userData.architecture??[])])if(r?.profile==='zhaode')records.push(r);});
 assert.equal(records.length,1,'one actual Zhaode assembly');const s=records[0];assert.equal(s.id,'axis-courts/obj-010');
 const p=zhaodeGateGeometry({gateProfile:'zhaode',gateKind:'three-bay',x:s.x,z:s.z,rot:s.rot});
 assert.equal(s.portalCount,1);assert.equal(s.coreBayCount,3);assert.deepEqual(s.supports,p.supports);
 const supports=bindProfileSupports(W.cm,p);assert.equal(supports.size,3);
 const ray=(point,direction,far)=>{const [x,z]=p.toWorld(point[0],point[2]),d=new THREE.Vector3(...direction).applyAxisAngle(new THREE.Vector3(0,1,0),p.rot);return new THREE.Raycaster(new THREE.Vector3(x,point[1],z),d,0,far).intersectObject(W.scene,true).filter(h=>{for(let o=h.object;o;o=o.parent)if(!o.visible)return false;return h.object.material?.visible!==false;});};
 const paintProbes=[];
 for(const sign of [-1,1])for(const [x,pixel] of [[5.21,0],[3.365,1],[3.4425,2],[3.4725,3]]){
  const hits=ray([sign*x,6.117,-5],[0,0,1],1);assert.equal(hits.length,1,'one real south surface, no hidden duplicate');
  const hit=hits[0],mat=hit.object.material;assert.equal(mat.name,'zhaode_south_panel_paint','actual paint first hit, not metadata');
  const t=mat.map;assert.equal(t?.isDataTexture,true,'production palette');assert.equal(t.image.width,4);assert.equal(t.image.height,1);
  assert.equal(t.minFilter,THREE.NearestFilter);assert.equal(t.magFilter,THREE.NearestFilter);assert.equal(t.generateMipmaps,false);assert.equal(t.colorSpace,THREE.SRGBColorSpace);
  const i=Math.min(3,Math.max(0,Math.floor(hit.uv.x*4)));assert.equal(i,pixel);const color=(t.image.data[i*4]<<16)|(t.image.data[i*4+1]<<8)|t.image.data[i*4+2];assert.equal(color,palette[pixel]);
  const [wx,wz]=p.toWorld(sign*x,-4.424);near(hit.point.x,wx);near(hit.point.z,wz);
  paintProbes.push({local:[sign*x,6.117,-4.424],paletteTexel:i,color:color.toString(16),actualHit:hit.point.toArray()});
 }
 for(const sign of [-1,1]){
  for(const [z,direction] of [[0,-1],[7,-1]])assert.match(ray([sign*5.21,6.117,z],[0,0,direction],5)[0].object.material.name,/wall_red/,'inside/rear retained');
  assert.match(ray([sign*5.21,p.platformY+.4,-5],[0,0,1],1)[0].object.material.name,/wall_brick/,'original foot retained');
  assert.match(ray([sign*8.93,p.platformY+2.1,-5],[0,0,1],1)[0].object.material.name,/door_studded/,'unresolved lateral panel not silently replaced');
  const [x,z]=p.toWorld(sign*5.21,p.core.frontZ);assert.equal(W.cm.checkCollision(new THREE.Vector3(x,p.platformY+1.7,z),.5),true);
 }
 for(const x of [-1.5,0,1.5]){
  assert.equal(ray([x,p.platformY+1.7,-8],[0,0,1],16).length,0,'existing open portal has no new paint obstruction');
  for(const z of [-7,0,7]){const [wx,wz]=p.toWorld(x,z);assert.equal(W.cm.checkCollision(new THREE.Vector3(wx,p.platformY+1.7,wz),.5),false);near(W.cm.getGroundHeight(wx,wz,p.platformY),p.platformY);}
 }
 return {objectId:'FC-F838FEF7AB',scope:'SOUTH_PAINT_ONLY_PARTIAL_VERIFY_PENDING',paintProbes,supportCount:supports.size,browserAcceptance:false,narrowLateralLattice:'UNCHANGED_UNRESOLVED'};
}
