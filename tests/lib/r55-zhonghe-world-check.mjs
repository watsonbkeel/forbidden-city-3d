// Integration adapter: consumes an existing production W and optional real
// Teleport. Never builds a world, changes registrations or loads an asset.
import assert from 'node:assert/strict';
import * as THREE from 'three';
import {FirstPersonControls} from '../../src/controls/FirstPerson.js';
import {PLAYER} from '../../src/config/constants.js';
import {createPhysicalWaypointDriver} from './physical-waypoints.mjs';
import {traceTerraceGround} from './terrace-walk.mjs';
const FLOOR=8.6,Z=65,close=(a,b)=>Math.abs(a-b)<1e-6;
// South entry, front observation, both sides behind the independent screen,
// north exit / return, both lateral doors and a legal diagonal room crossing.
export const ZHONGHE_DISPLAY_ROUTE=[[0,-10.8],[0,-3.0],[0,.4],[3.8,.4],[3.8,7.25],[0,7.25],[0,10.8],[0,7.25],[-3.8,7.25],[-3.8,0],[-10.8,0],[-3.8,0],[-3.8,-3],[3.8,-3],[10.8,0],[3.8,0],[0,-3],[0,-10.8]].map(([x,z])=>[x,Z+z]);
export const ZHONGHE_PLATFORM_ROUTE=[[-3.5,2.1],[0,2.1],[3.5,2.1],[0,.4],[0,2.1],[0,.4]].map(([x,z])=>[x,Z+z]);

export function assertZhongheDisplayInWorld(W,{teleport=null,registry=null,expectedLanding=null}={}){
 assert.ok(W.scene&&W.cm);W.scene.updateMatrixWorld(true);const rows=[];
 W.scene.traverse(o=>{if(o.userData.structure?.id==='zhonghedian')rows.push(o.userData.structure);rows.push(...(o.userData.architecture??[]).filter(r=>r.id==='zhonghedian'));});
 assert.equal(rows.length,1);const hall=rows[0],p=hall.displaySetting;assert.equal(p?.id,'zhonghe-display-setting-r55');assert.equal(hall.floorY,FLOOR);
 for(const e of p.colliders)assert.equal(W.cm.colliders.filter(c=>['min','max'].every(key=>e[key].every((v,i)=>close((c.box??c)[key].getComponent(i),v)))).length,1,e.owner+' actual physical registration');
 for(const e of p.walkables)assert.equal(W.cm.walkables.filter(w=>w.type==='box'&&w.rescue===false&&['min','max'].every(key=>e[key].every((v,i)=>close(w.box[key].getComponent(i),v)))).length,1,'one visible non-rescue platform support');
 assert.equal(W.cm.colliders.some(c=>{const b=c.box??c;return close(b.min.x,-2.28)&&close(b.max.x,2.28)&&close(b.min.z,64.9)&&close(b.max.z,71.4)&&close(b.max.y,11.6);}),false,'removed high legacy envelope');
 for(const portal of hall.portals.filter(p=>p.state==='open-for-playable-route'))assert.equal(W.cm.checkCollision(new THREE.Vector3(portal.center[0],FLOOR+PLAYER.HEIGHT,portal.center[1]),.5),false,portal.side);
 assert.equal(hall.portals.filter(p=>p.state==='open-for-playable-route').length,4);
 const meshes=[];W.scene.traverse(m=>{if(m.isMesh&&m.material?.name?.startsWith('r55-zhonghe-'))meshes.push(m);});
 const ray=new THREE.Raycaster(new THREE.Vector3(0,12,Z+2.1),new THREE.Vector3(0,-1,0));const hit=ray.intersectObjects(meshes,false)[0];assert.ok(hit);
 const support=W.cm.getGroundHeight(0,Z+2.1,FLOOR,.6);assert.ok(Math.abs(hit.point.y-support)<1e-6,'real base top equals new support, not a lifted invisible floor');
 for(const [x,z]of [[0,.4],[3.8,3.5],[-3.8,3.5],[0,7.7]]){assert.equal(W.cm.checkCollision(new THREE.Vector3(x,FLOOR+PLAYER.HEIGHT,Z+z),.5),false);assert.ok(close(W.cm.getGroundHeight(x,Z+z,FLOOR,.01),FLOOR));}
 let landing=null;if(teleport){landing=teleport.resolveLanding('中和殿');if(expectedLanding)assert.deepEqual(landing,expectedLanding,'exact independently measured complete-world baseline landing');else assert.equal(landing.fallback,false,'local-fragment preferred landing');assert.equal(teleport.isSafe(landing,teleport.geometryFor('中和殿')),true);}
 if(registry)assert.equal(registry.actors.filter(a=>a.sceneRef==='zhonghe').length,0,'bounded furnishing slice adds no Zhonghe NPC anchor');
 return{scope:'ACTUAL_B_GEOMETRY_AND_COLLISION; NO_WEBGL_OR_MEASURED_RESTORATION_CLAIM',colliders:p.colliders.length,walkables:p.walkables,platform:{visibleY:hit.point.y,supportY:support},retainedFloor:{walkableY:FLOOR,visibleY:FLOOR+.03,historicalOffset:.03,modified:false},landing,triangles:meshes.reduce((n,m)=>n+(m.geometry.index?.count??m.geometry.attributes.position.count)/3,0)};
}

/** A single legal initial placement; every following movement is a real
 * FirstPersonControls frame. W/S, optional W+D/S+D and reverse path are actual
 * independent inputs. No per-waypoint teleports or patched movement speed. */
export function replayZhongheDisplayRoute(t,W,{fps=60,sprint=false,backward=false,diagonal=false,reverse=false,platform=false}={}){
 const points=(platform?ZHONGHE_PLATFORM_ROUTE:ZHONGHE_DISPLAY_ROUTE);const route=reverse?points.toReversed():points;
 const oldDoc=globalThis.document,oldWindow=globalThis.window,noop=()=>{};
 const doc={...oldDoc,addEventListener:noop,removeEventListener:noop,exitPointerLock:noop};globalThis.document=doc;globalThis.window={addEventListener:noop,removeEventListener:noop};
 let now=0;const clock=t.mock.method(performance,'now',()=>now),camera=new THREE.PerspectiveCamera();
 const controls=new FirstPersonControls(camera,{ownerDocument:doc,addEventListener:noop,removeEventListener:noop},W.cm);
 const initial=W.cm.getGroundHeight(...route[0],FLOOR,.01);assert.ok(close(initial,FLOOR));
 controls.controls.isLocked=true;controls.setPosition(route[0][0],initial+PLAYER.HEIGHT,route[0][1]);
 assert.equal(W.cm.checkCollision(camera.position,.5),false,'legal human-radius initial position');
 controls.moveForward=!backward;controls.moveBackward=backward;controls.moveRight=diagonal;
 const trace=traceTerraceGround(W.cm,{flights:[]}),driver=createPhysicalWaypointDriver(route),frames=[];
 let legFrames=0,maxFeet=initial,maxSpeed=0;
 try{
  const physical=()=>[camera.position.x-controls.bobOffset.x,camera.position.z-controls.bobOffset.z];
  while(!driver.complete){const before=physical(),command=driver.command(before,sprint),[x,z]=command.target;controls.canSprint=command.canSprint;now+=1000/fps;
   camera.position.sub(controls.bobOffset);
   const dx=x-camera.position.x,dz=z-camera.position.z,length=Math.hypot(dx,dz),angle=(backward?Math.PI:0)+(diagonal?(backward?Math.PI/4:-Math.PI/4):0),cx=(dx*Math.cos(angle)-dz*Math.sin(angle))/length,cz=(dx*Math.sin(angle)+dz*Math.cos(angle))/length;
   camera.lookAt(camera.position.x+cx,camera.position.y,camera.position.z+cz);camera.position.add(controls.bobOffset);camera.updateMatrixWorld(true);controls.update();
   const after=physical();maxFeet=Math.max(maxFeet,controls.feetY);maxSpeed=Math.max(maxSpeed,controls.motion.speed);
   const frame={x:after[0],z:after[1],feet:controls.feetY,ground:controls.groundY};frames.push(frame);
   assert.equal(W.cm.checkCollision(new THREE.Vector3(frame.x,frame.ground+PLAYER.HEIGHT,frame.z),.5),false,'every real frame has body clearance');
   if(driver.observe(before,after)){legFrames=0;continue;}
   legFrames++;const k=driver.index,limit=Math.ceil(Math.hypot(route[k][0]-route[k-1][0],route[k][1]-route[k-1][1])/2*fps)+fps*4;
   assert.ok(legFrames<limit,JSON.stringify({stuckAt:route[k],at:after,options:{fps,sprint,backward,diagonal,reverse,platform}}));
  }
  controls.moveForward=false;controls.moveBackward=false;controls.moveRight=false;for(let i=0;i<fps*2;i++){now+=1000/fps;controls.update();}
  assert.ok(Math.abs(controls.feetY-FLOOR)<.001,'returns to original floor');assert.equal(trace.samples.some(s=>['rescue','unverified'].includes(s.source)),false);
  if(platform)assert.ok(close(maxFeet,FLOOR+.21),'actually stepped onto low platform');else assert.ok(close(maxFeet,FLOOR),'circulation stays on retained floor');
  return{fps,sprint,backward,diagonal,reverse,platform,arrived:true,frames:frames.length,crossings:driver.diagnostics.crossings.length,expectedCrossings:route.length-1,maxFeet,maxSpeed,selectedRescue:false};
 }finally{trace.restore();controls.dispose();clock.mock.restore();globalThis.document=oldDoc;globalThis.window=oldWindow;}
}
