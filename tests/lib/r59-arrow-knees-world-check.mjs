// Pure consumer of an ALREADY BUILT merged W.scene / W.cm. No builder, load,
// source import patch, geometry allocation, registration or browser is invoked.
import assert from 'node:assert/strict';
import * as THREE from 'three';
import {solidMaterialNameAt} from '../../src/render/SolidMaterialBatch.js';
import {PLAYER} from '../../src/config/constants.js';
const MATERIAL='arrow_south_knee_gray_fit',RED='arrow_red_fit';
const X=-154.7,Z=78.8,SOUTH=70,FLOOR=.9,TOL=5e-5;
const visible=o=>{for(let p=o;p;p=p.parent)if(!p.visible)return false;return true;};
const near=(a,b,label)=>assert.ok(Math.abs(a-b)<TOL,`${label}: ${a} != ${b}`);
const key=p=>p.toArray().map(x=>x.toFixed(4)).join(',');
function halfHealth(triangles){
 const center=triangles.flat().reduce((a,p)=>a.add(p),new THREE.Vector3()).multiplyScalar(1/(triangles.length*3)),edges=new Map();let minArea=Infinity,volume=0;
 for(const v of triangles){const a=v[0].clone().sub(center),b=v[1].clone().sub(center),c=v[2].clone().sub(center);minArea=Math.min(minArea,b.clone().sub(a).cross(c.clone().sub(a)).length()/2);volume+=a.dot(b.clone().cross(c))/6;
  for(let j=0;j<3;j++){const a=key(v[j]),b=key(v[(j+1)%3]),k=[a,b].sort().join('|'),e=edges.get(k)??[];e.push(a<b?1:-1);edges.set(k,e);}
 }
 return{triangles:triangles.length,closed:[...edges.values()].every(e=>e.length===2&&e[0]+e[1]===0),minArea,signedVolume:volume};
}
export function assertArrowSouthKneesInWorld(W){
 assert.ok(W?.scene?.traverse&&W.cm?.getGroundHeight&&W.cm?.checkCollision,'Supply already-built W.scene and real W.cm');
 W.scene.updateWorldMatrix(true,true);
 const records=[],rows=[],buckets=new Set();
 W.scene.traverse(o=>{
  for(const r of [o.userData.structure,...(o.userData.architecture??[])])if(r?.id==='outer-east/arrow-enclosed')records.push(r);
  if(!o.isMesh||!o.geometry?.attributes.position)return;
  // Direct merged buckets and the optional solid-material source table both
  // preserve real material identity; discarded pre-merge mesh roles are unused.
  if(o.material?.name!==MATERIAL&&!o.userData.solidMaterialBatch?.sources?.some(s=>s.materialName===MATERIAL))return;
  assert.ok(visible(o),'knee bucket must remain visible');const p=o.geometry.attributes.position,idx=o.geometry.index;
  for(let i=0;i<(idx?.count??p.count);i+=3){if(solidMaterialNameAt(o,i/3)!==MATERIAL)continue;const v=[0,1,2].map(j=>new THREE.Vector3().fromBufferAttribute(p,idx?idx.getX(i+j):i+j).applyMatrix4(o.matrixWorld));assert.ok(v.every(p=>p.toArray().every(Number.isFinite)),'finite actual knee positions');rows.push(v);buckets.add(o);}
 });
 assert.equal(rows.length,88,'actual merged knee geometry must contain exactly 88 triangles');assert.equal(buckets.size,1,'one merged added material bucket');assert.equal(records.length,1,'one actual Arrow identity');
 const bounds=new THREE.Box3();rows.flat().forEach(p=>bounds.expandByPoint(p));
 for(const[a,b,label]of[[bounds.min.x,-157.23,'west/negative-X bound'],[bounds.max.x,-152.17,'east/positive-X bound'],[bounds.min.y,7.91,'lowest height'],[bounds.max.y,8.53,'top height'],[bounds.min.z,69.86,'south bound'],[bounds.max.z,70.14,'north bound']])near(a,b,label);
 const halves=[rows.filter(t=>t.every(p=>p.x<X)),rows.filter(t=>t.every(p=>p.x>X))].map(halfHealth);
 for(const h of halves){assert.equal(h.triangles,44,'two spatially separate actual knee halves');assert.ok(h.closed&&h.minArea>1e-7&&h.signedVolume>0,'closed finite nondegenerate outward-wound half');}
 const ray=(p,d,far,material=null)=>new THREE.Raycaster(new THREE.Vector3(...p),new THREE.Vector3(...d),0,far).intersectObject(W.scene,true).filter(h=>visible(h.object)&&(!material||solidMaterialNameAt(h.object,h.faceIndex)===material));
 const contacts=[];
 for(const[columnX,inward]of[[X-2.75,1],[X+2.75,-1]]){
  const rootX=columnX+inward*.24,rootY=8.53-.62*.7,midX=columnX+inward*.8;
  const rootFront=ray([rootX,rootY,SOUTH-.5],[0,0,1],1,MATERIAL)[0],rootBack=ray([rootX,rootY,SOUTH+.5],[0,0,-1],1,MATERIAL)[0];
  const columnFront=ray([rootX,rootY,SOUTH-.5],[0,0,1],1,RED)[0],columnBack=ray([rootX,rootY,SOUTH+.5],[0,0,-1],1,RED)[0];
  assert.ok(rootFront&&rootBack&&columnFront&&columnBack,'actual knee root and column contact skins exist');
  assert.ok(columnFront.point.z<rootFront.point.z&&columnBack.point.z>rootBack.point.z,'closed root is inside the actual retained column skins');
  const front=ray([midX,8.3,SOUTH-.5],[0,0,1],1,MATERIAL)[0],back=ray([midX,8.3,SOUTH+.5],[0,0,-1],1,MATERIAL)[0];assert.ok(front&&back,'actual knee face and reverse exist');near(front.point.z,69.86,'front depth');near(back.point.z,70.14,'back depth');
  const top=ray([midX,9,SOUTH],[0,-1,0],1,MATERIAL)[0],beamFront=ray([midX,8.52,SOUTH-.5],[0,0,1],1,RED)[0],beamBack=ray([midX,8.52,SOUTH+.5],[0,0,-1],1,RED)[0];
  assert.ok(top&&beamFront&&beamBack,'actual retained beam contact exists');near(top.point.y,8.53,'actual top skin');assert.ok(beamFront.point.z<front.point.z&&beamBack.point.z>back.point.z,'knee top enters the actual beam depth');
  contacts.push({columnX,inward,rootFront:rootFront.point.toArray(),columnFront:columnFront.point.toArray(),top:top.point.toArray(),beamContact:true,columnContact:true});
 }
 const jumpHeadY=FLOOR+PLAYER.HEIGHT+PLAYER.JUMP_VELOCITY**2/(2*PLAYER.GRAVITY)+.5;assert.ok(bounds.min.y>jumpHeadY);
 const route=[];
 const stations=[...[-9,-8.8,-7.5,-6.8,0,6.8,8.8,9].map(z=>[0,z]),...[-14.65,14.65].flatMap(x=>[-7.8,0,7.8].map(z=>[x,z])),[-1.75,-8.8],[1.75,-8.8]];
 for(const[x,z]of stations){const wx=X+x,wz=Z+z,ground=W.cm.getGroundHeight(wx,wz,FLOOR,.03);near(ground,FLOOR,'retained route floor');assert.equal(W.cm.checkCollision(new THREE.Vector3(wx,FLOOR+PLAYER.HEIGHT,wz),.5),false,'retained passage collision-free');
  const floor=ray([wx,FLOOR+.3,wz],[0,-1,0],.6)[0];assert.ok(floor&&Math.abs(floor.point.y-FLOOR)<.06,'actual visible floor beneath supported route');
  assert.equal(ray([wx,FLOOR+PLAYER.HEIGHT,wz-.2],[0,0,1],.4).length,0,'retained short head route stays empty');assert.equal(ray([wx,jumpHeadY,wz-.2],[0,0,1],.4,MATERIAL).length,0,'no knee inside conservative jump envelope');route.push({x:wx,z:wz,ground,visibleFloorY:floor.point.y});
 }
 return{entityId:'FC-AF36D75128',scope:'ACTUAL ALREADY-BUILT MERGED WORLD TRIANGLES; NO BROWSER ACCEPTANCE',triangles:rows.length,mergedAddedBuckets:buckets.size,halves,contacts,bounds:{min:bounds.min.toArray(),max:bounds.max.toArray()},routeChecks:route.length,route,jumpHeadY,minimumJumpHeadGap:bounds.min.y-jumpHeadY,retentionBasis:'Current merged support/passage probes plus the separately frozen exact component registrations; no unsupported whole-world delta assertion.',browserAcceptance:false,status:'VERIFY_PENDING_BROWSER'};
}
