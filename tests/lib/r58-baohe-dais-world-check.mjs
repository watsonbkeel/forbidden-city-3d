// Read-only consumer of the integrator's existing W. No world construction,
// source repair, support synthesis, actor placement or browser invocation.
import assert from 'node:assert/strict';import * as THREE from 'three';
import {FirstPersonControls} from '../../src/controls/FirstPerson.js';
import {PLAYER} from '../../src/config/constants.js';
import {createPhysicalWaypointDriver} from './physical-waypoints.mjs';
const ID='baohe-three-flight-dais',near=(a,b)=>Math.abs(a-b)<2e-5;
function profile(W){assert.ok(W?.scene?.isScene&&W?.cm,'Supply the existing W.scene and W.cm');const rows=[];W.scene.traverse(o=>{if(o.userData.structure?.id===ID)rows.push(o.userData.structure);rows.push(...(o.userData.architecture??[]).filter(s=>s.id===ID));});assert.equal(rows.length,1,'one installed Baohe dais');return rows[0];}
function visible(h){for(let o=h.object;o;o=o.parent)if(!o.visible)return false;const m=Array.isArray(h.object.material)?h.object.material[h.face.materialIndex]:h.object.material;return m?.visible!==false&&m?.opacity!==0;}
const down=(W,x,z,y,far=.15)=>new THREE.Raycaster(new THREE.Vector3(x,y,z),new THREE.Vector3(0,-1,0),0,far).intersectObject(W.scene,true).filter(visible)[0];
export function assertBaoheDaisInWorld(W){
 const p=profile(W);W.scene.updateMatrixWorld(true);assert.equal(p.accepted,false);assert.equal(p.flights.length,3);assert.equal(p.furnitureColliders.length,10);
 const matches=(a,b)=>W.cm.colliders.filter(c=>{const q=c.box??c;return q.min.toArray().every((v,i)=>near(v,a[i]))&&q.max.toArray().every((v,i)=>near(v,b[i]));});
 for(const c of [...p.colliderBounds,...p.furnitureColliders]){
  assert.equal(matches(c.min,c.max).length,1,`exact solid ${c.id}`);
  const hits=new THREE.Raycaster(new THREE.Vector3(c.min[0]-.02,(c.min[1]+c.max[1])/2,(c.min[2]+c.max[2])/2),new THREE.Vector3(1,0,0),0,c.max[0]-c.min[0]+.04).intersectObject(W.scene,true).filter(visible);
  assert.ok(hits.some(h=>near(h.point.x,c.min[0])),`actual rendered side of solid ${c.id}`);
 }
 for(const s of p.supports){const x=(s.minX+s.maxX)/2,z=(s.minZ+s.maxZ)/2,h=down(W,x,z,s.topY+.06);
  assert.ok(h&&near(h.point.y,s.topY),`visible support ${s.id}`);
  const rows=W.cm.walkables.filter(w=>w.type==='box'&&near(w.box.min.x,s.minX)&&near(w.box.max.x,s.maxX)&&near(w.box.min.z,s.minZ)&&near(w.box.max.z,s.maxZ)&&near(w.box.max.y,s.topY));
  assert.equal(rows.length,1);assert.equal(rows[0].rescue,false);assert.ok(near(W.cm.getGroundHeight(x,z,s.topY,.001),s.topY));
 }
 assert.ok(near(W.cm.getGroundHeight(p.x0,p.front+.4,p.y,.6),p.y),'no ground-to-dais rescue');
 const old=[p.x0-p.thW/2,p.y,p.ztb0-1.3,p.x0+p.thW/2,p.y+3,p.ztb1];
 assert.equal(matches(old.slice(0,3),old.slice(3)).length,0,'old air box must be removed');
 for(const dx of[-1.7,0,1.7]){const x=p.x0+dx,z=p.ztb1+.7;assert.equal(W.cm.checkCollision(new THREE.Vector3(x,p.y+PLAYER.HEIGHT,z),.5),false,'rear room passage preserved');assert.ok(near(W.cm.getGroundHeight(x,z,p.y,.03),p.y),'no ghost dais beyond rear face');}
 return {profile:p,scope:'THREE_FLIGHT_DAIS_PARTIAL_CPU_NOT_BROWSER_ACCEPTANCE',supports:p.supports.length,exactNewSolids:p.colliderBounds.length,furnitureSolids:p.furnitureColliders.length,rearPassageSamples:3};
}

export function replayBaoheDaisRoute(t,W,{side=0,fps=60,sprint=false,backward=false,diagonal=false}={}){
 const p=profile(W),f=p.flights.find(f=>f.side===side);assert.ok(f);
 const off=diagonal?(side===0?.45:.04):0,x=f.centerX,z=p.front+(side===0?.55:.025);
 const points=[[x-off,p.toe-2],[x+off,z],[x-off,p.toe-2]];
 const doc0=globalThis.document,win0=globalThis.window,noop=()=>{},doc={...doc0,addEventListener:noop,removeEventListener:noop,exitPointerLock:noop};
 globalThis.document=doc;globalThis.window={addEventListener:noop,removeEventListener:noop};
 let now=0;const clock=t.mock.method(performance,'now',()=>now),camera=new THREE.PerspectiveCamera(),controls=new FirstPersonControls(camera,{ownerDocument:doc,addEventListener:noop,removeEventListener:noop},W.cm);
 controls.controls.isLocked=true;controls.headBobEnabled=false;
 assert.ok(near(W.cm.getGroundHeight(...points[0],p.y,.03),p.y),'route starts on existing hall floor, not elevated rescue');
 controls.setPosition(points[0][0],p.y+PLAYER.HEIGHT,points[0][1]);controls.moveForward=!backward;controls.moveBackward=backward;
 const driver=createPhysicalWaypointDriver(points),frames=[];let last=points[0],stuck=0,maxFeet=p.y,selected=[];
 try{
  for(let i=0;!driver.complete&&i<fps*35;i++){
   const before=[camera.position.x,camera.position.z],command=driver.command(before,sprint),[tx,tz]=command.target;
   controls.canSprint=command.canSprint;camera.lookAt(backward?2*camera.position.x-tx:tx,camera.position.y,backward?2*camera.position.z-tz:tz);camera.updateMatrixWorld(true);now+=1000/fps;controls.update();
   const after=[camera.position.x,camera.position.z];maxFeet=Math.max(maxFeet,controls.feetY);driver.observe(before,after);
   const ground=controls.groundY;assert.equal(W.cm.checkCollision(new THREE.Vector3(...[after[0],ground+PLAYER.HEIGHT,after[1]]),.5),false,'unmodified body clears the actual solids');
   // Production supportHeight retains a real stair edge while any part of its
   // unchanged 0.3m square footprint still touches it during descent. Verify
   // that exact contact, rather than incorrectly requiring only a center ray.
   let hit=down(W,after[0],after[1],ground+.08,.16);
   if(ground>p.y+.05&&!(hit&&near(hit.point.y,ground))){
    const touching=p.supports.find(s=>near(s.topY,ground)&&after[0]+.3>=s.minX&&after[0]-.3<=s.maxX&&after[1]+.3>=s.minZ&&after[1]-.3<=s.maxZ);
    assert.ok(touching,'elevated support must touch the actual production footprint');
    const px=Math.min(touching.maxX-1e-5,Math.max(touching.minX+1e-5,after[0])),pz=Math.min(touching.maxZ-1e-5,Math.max(touching.minZ+1e-5,after[1]));
    hit=down(W,px,pz,ground+.08,.16);
   }
   if(ground>p.y+.05)assert.ok(hit&&near(hit.point.y,ground),'selected ground has a real rendered center/footprint contact');
   const support=p.supports.find(s=>after[0]>=s.minX&&after[0]<=s.maxX&&after[1]>=s.minZ&&after[1]<=s.maxZ&&near(s.topY,ground));if(support)selected.push(support.id);
   frames.push({x:after[0],z:after[1],feet:controls.feetY,ground,speed:controls.motion.speed});
   if(i%fps===0){stuck=Math.hypot(after[0]-last[0],after[1]-last[1])<.03?stuck+1:0;last=after;if(stuck>=3)break;}
  }
  assert.equal(driver.complete,true,`route stalled side=${side} fps=${fps} ${JSON.stringify(frames.at(-1))}`);assert.ok(maxFeet>=p.topY-.04,`real ascent reaches full height ${maxFeet}`);
  controls.moveForward=controls.moveBackward=false;for(let i=0;i<fps*2;i++){now+=1000/fps;controls.update();}
  assert.ok(near(controls.feetY,p.y),'descent and braking return to existing hall floor');
  return {side,fps,sprint,backward,diagonal,arrived:true,maxFeet,endFeet:controls.feetY,frames:frames.length,selectedSupports:[...new Set(selected)],maxSpeed:Math.max(...frames.map(f=>f.speed)),driver:driver.diagnostics};
 }finally{controls.dispose();clock.mock.restore();globalThis.document=doc0;globalThis.window=win0;}
}
