// Consume an already-built, matrix-updated W. No world/zone/builder invocation,
// geometry rewrite, actor change, collision repair or synthetic support.
import assert from 'node:assert/strict';
import * as THREE from 'three';

const ids=[1,2,4,5].map(n=>`inner-jinshui:bridge-${n}`);
const close=(a,b,label)=>assert.ok(Math.abs(a-b)<2e-5,`${label}: ${a} != ${b}`);
function visible(object){for(let q=object;q;q=q.parent)assert.equal(q.visible,true,`${q.name} is hidden`);}
export function assertInnerJinshuiFinialsInWorld(W){
 assert.ok(W?.scene&&W?.cm,'Pass existing W.scene and W.cm; this helper does not build a world');
 const roots=[],rivers=[];W.scene.traverse(o=>{if(o.name==='inner-jinshui-side-finials')roots.push(o);if(o.userData.innerJinshui)rivers.push(o);});
 assert.equal(roots.length,1,'exactly one owner-installed finial group required');assert.equal(rivers.length,1,'existing five-bridge group must be unique');
 const root=roots[0],river=rivers[0],profile=river.userData.innerJinshui,record=root.userData.innerJinshuiSideFinials;
 visible(root);visible(river);assert.equal(profile.bridges.length,5);assert.deepEqual(record.bridgeIds,ids);assert.equal(record.placements.length,88);
 assert.equal(record.historicalPostCountVerified,false);assert.equal(record.carvedGroovesVerified,false);
 const mesh=root.children[0];assert.equal(root.children.length,1);assert.equal(mesh.isInstancedMesh,true);assert.equal(mesh.count,88);visible(mesh);
 assert.notEqual(mesh.material.visible,false);assert.ok(!mesh.material.transparent||mesh.material.opacity>0);
 const matrix=new THREE.Matrix4(),point=new THREE.Vector3();
 const required=ids.flatMap(bridgeId=>[-1,1].flatMap(side=>Array.from({length:11},(_,postIndex)=>({bridgeId,side,postIndex}))));
 record.placements.forEach((p,i)=>{
  assert.deepEqual({bridgeId:p.bridgeId,side:p.side,postIndex:p.postIndex},required[i],'unique required existing-post binding');
  assert.ok(ids.includes(p.bridgeId),'central imperial bridge must remain undecorated');const bridge=profile.bridges.find(b=>b.id===p.bridgeId);
  const expectedZ=bridge.minZ+1+(bridge.length-2)*p.postIndex/10;
  const upper=bridge.deck.findIndex(q=>q.z>=p.z),a=bridge.deck[Math.max(0,upper-1)],b=bridge.deck[Math.max(1,upper)],expectedY=a.y+(b.y-a.y)*(p.z-a.z)/(b.z-a.z)+1.17;
  close(p.y,expectedY,'profile post top y');
  const postHit=new THREE.Raycaster(new THREE.Vector3(p.x,expectedY+.1,p.z),new THREE.Vector3(0,-1,0),0,.2).intersectObject(river,true)[0];
  assert.ok(postHit,'existing masonry post is missing');visible(postHit.object);close(postHit.point.y,expectedY,'actual retained post top');
  close(p.x,bridge.x+p.side*bridge.railX,'profile post x');close(p.z,expectedZ,'profile post z');
  mesh.getMatrixAt(i,matrix);point.setFromMatrixPosition(matrix).applyMatrix4(mesh.matrixWorld);
  close(point.x,p.x,'cap world x');close(point.y,p.y,'cap world y');close(point.z,p.z,'cap world z');
  const hit=new THREE.Raycaster(new THREE.Vector3(p.x,p.y+.5,p.z),new THREE.Vector3(0,-1,0),0,.6).intersectObject(mesh,false)[0];
  assert.ok(hit,'actual rendered cap is missing');close(hit.point.y,p.y+.22,'actual cap tip');
 });
 let supportSamples=0;
 for(const b of profile.bridges){
  const ramps=W.cm.walkables.filter(w=>w.type==='ramp'&&w.axis==='z'&&Math.abs(w.minX-(b.x-b.width/2+.24))<1e-7&&Math.abs(w.maxX-(b.x+b.width/2-.24))<1e-7&&w.minZ>=b.minZ-1e-7&&w.maxZ<=b.maxZ+1e-7);assert.equal(ramps.length,24,`${b.id} retained sampled ramps`);
  for(const z of [b.minZ+1,b.z,b.maxZ-1]){const ramp=ramps.find(w=>z>=w.minZ&&z<=w.maxZ),expected=ramp.y0+(ramp.y1-ramp.y0)*(z-ramp.a0)/(ramp.a1-ramp.a0);
   close(W.cm.getGroundHeight(b.x,z,expected,.03),expected,'existing bridge support');
   const hit=new THREE.Raycaster(new THREE.Vector3(b.x,3,z),new THREE.Vector3(0,-1,0),0,4).intersectObject(river,true)[0];assert.ok(hit);visible(hit.object);close(hit.point.y,expected,'actual bridge deck');supportSamples++;
  }
 }
 return {bridgeCount:5,capCount:88,decoratedBridgeIds:ids,supportSamples,status:'CPU_GEOMETRY_ONLY_NOT_VISUAL_ACCEPTANCE'};
}
