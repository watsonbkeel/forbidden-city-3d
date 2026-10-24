import * as THREE from 'three';
import { FirstPersonControls } from '../../../src/controls/FirstPerson.js';
import { PLAYER } from '../../../src/config/constants.js';
import { CollisionManager } from '../../../src/utils/Collision.js';
import { FlightEnvelope } from '../../../src/scene/flight/FlightEnvelope.js';
import { FlightTour } from '../../../src/scene/flight/FlightTour.js';
import { createHelicopterModel } from '../../../src/scene/flight/HelicopterModel.js';
import { FlightState, FLIGHT_RULES, HELICOPTER_HOME } from '../../../src/scene/flight/FlightState.js';

export const BODY_RADIUS = .5;
export function collisionFixture(w) {
  const cm = new CollisionManager(); cm.rivers = [];
  cm.addColliders(w.kit.colliders, 'r66-h-local');
  cm.addWalkables(w.kit.walkables, 'r66-h-local');
  return { ...w, cm };
}

/** Actual transformed renderer triangles, with per-mesh broadphase only.
 * No AABB replaces visible geometry in the narrowphase. Full feet-to-eye body
 * has only a 10 micrometre surface-contact tolerance, not step clearance. */
export function captureVisibleSolids(root) {
  root.updateMatrixWorld(true); const groups = [];
  root.traverseVisible(mesh => {
    if (!mesh.isMesh || !mesh.geometry?.attributes.position) return;
    if (mesh.isInstancedMesh) throw Error('This bounded fixture expects ordinary meshes');
    const p = mesh.geometry.attributes.position, ix = mesh.geometry.index;
    const triangles = [];
    for (let i = 0; i < (ix?.count ?? p.count); i += 3) {
      const tri = new THREE.Triangle(...[0,1,2].map(k => new THREE.Vector3()
        .fromBufferAttribute(p, ix ? ix.getX(i+k) : i+k).applyMatrix4(mesh.matrixWorld)));
      if (tri.getArea() > 1e-12) triangles.push(tri);
    }
    groups.push({ role: mesh.userData.role || mesh.name || mesh.material?.name || 'unnamed',
      bounds: new THREE.Box3().setFromObject(mesh), triangles });
  });
  return groups;
}
export function fullBody(position) {
  const e = 1e-5;
  return new THREE.Box3(new THREE.Vector3(position.x-BODY_RADIUS+e, position.feet+e, position.z-BODY_RADIUS+e),
    new THREE.Vector3(position.x+BODY_RADIUS-e, position.feet+PLAYER.HEIGHT-e, position.z+BODY_RADIUS-e));
}
export function contactsAt(w, groups, position) {
  const body = fullBody(position);
  const actualRoles = groups.filter(g => g.bounds.intersectsBox(body) && g.triangles.some(t => body.intersectsTriangle(t))).map(g => g.role);
  const fullProxyIndices = w.cm.colliders.flatMap((c,i) => !c.overhead && c.box.intersectsBox(body) ? [i] : []);
  const productionProxy = w.cm.checkCollision(new THREE.Vector3(position.x, position.feet+PLAYER.HEIGHT, position.z), BODY_RADIUS);
  return { actualRoles, fullProxyIndices, productionProxy };
}

/** Conditional physics probe, not an access route. Initial spawn is on the
 * existing finite floor; thereafter only production FirstPerson input/update
 * moves the player. No teleports, forced feet, reduced radii, or fake supports. */
export function replayBalcony(t, w, { fps=60, x=216, z=478.03, startFeet=7,
  sprint=false, diagonal=0, jump=false, seconds=2, stopAfter=null,
  forward=true, reverseAfter=null, moveAfter=0, resumeAfter=null, groups=captureVisibleSolids(w.kit.root) }={}) {
  if (![10,60].includes(fps) || ![-1,0,1].includes(diagonal) || seconds<=0 || seconds>8 || !Number.isFinite(startFeet)) throw Error('Bounded replay options required');
  const oldDocument=globalThis.document, oldWindow=globalThis.window, noop=()=>{};
  const document={...oldDocument,addEventListener:noop,removeEventListener:noop,exitPointerLock:noop};
  globalThis.document=document; globalThis.window={addEventListener:noop,removeEventListener:noop};
  let now=0, controls; const clock=t.mock.method(performance,'now',()=>now), camera=new THREE.PerspectiveCamera();
  try {
    controls=new FirstPersonControls(camera,{ownerDocument:document,addEventListener:noop,removeEventListener:noop},w.cm);
    controls.controls.isLocked=true; controls.setPosition(x,startFeet+PLAYER.HEIGHT,z);
    camera.lookAt(x,camera.position.y,z-10); camera.updateMatrixWorld(true);
    controls.canSprint=sprint; controls.moveForward=forward; controls.moveRight=diagonal===1; controls.moveLeft=diagonal===-1;
    const actualStartFeet=controls.feetY, initial={x,z,feet:controls.feetY};
    const initialContacts=contactsAt(w,groups,initial);
    if(jump) controls.jump();
    const frames=[], contacts=[], sweptContacts=[]; let previous=initial, maxBob=0;
    for(let n=0;n<Math.round(seconds*fps);n++) {
      if(n/fps<moveAfter){controls.moveForward=false;controls.moveLeft=false;controls.moveRight=false;}
      else if(stopAfter===null || n/fps<stopAfter || resumeAfter!==null && n/fps>=resumeAfter){controls.moveForward=forward;controls.moveRight=diagonal===1;controls.moveLeft=diagonal===-1;}
      if(stopAfter!==null && n/fps>=stopAfter && (resumeAfter===null || n/fps<resumeAfter)){controls.moveForward=false;controls.moveLeft=false;controls.moveRight=false;}
      if(reverseAfter!==null && n/fps>=reverseAfter){controls.moveForward=false;controls.moveBackward=true;}
      now+=1000/fps; controls.update();
      const position={x:camera.position.x-controls.bobOffset.x,z:camera.position.z-controls.bobOffset.z,feet:controls.feetY};
      const contact=contactsAt(w,groups,position);
      const frame={frame:n,time:now/1000,...position,ground:controls.groundY,airborne:controls.airborne,
        velocityY:controls.verticalVelocity,speed:controls.motion.speed,...contact};
      frames.push(frame);
      if(contact.actualRoles.length || contact.productionProxy) contacts.push(frame);
      // Independent conservative chord sampling exposes frame-rate tunnelling.
      // Report separately because update internally resolves XZ before gravity.
      const steps=Math.ceil(Math.hypot(position.x-previous.x,position.z-previous.z,position.feet-previous.feet)/.04);
      for(let k=1;k<steps;k++) {
        const a=k/steps,p={x:previous.x+(position.x-previous.x)*a,z:previous.z+(position.z-previous.z)*a,feet:previous.feet+(position.feet-previous.feet)*a};
        const hit=contactsAt(w,groups,p);
        if(hit.actualRoles.length){sweptContacts.push({frame:n,fraction:a,...p,...hit});break;}
      }
      previous=position;maxBob=Math.max(maxBob,controls.bobOffset.length());
    }
    return {fps,sprint,diagonal,jump,seconds,startFeet:actualStartFeet,initial,initialContacts,frames,contacts,sweptContacts,
      end:previous,minFeet:Math.min(actualStartFeet,...frames.map(f=>f.feet)),maxFeet:Math.max(actualStartFeet,...frames.map(f=>f.feet)),
      maxBob,headBobEnabled:controls.headBobEnabled,productionPath:'FirstPersonControls.setPosition once, jump/update',positionWritesAfterSpawn:0,
      triangleCount:groups.reduce((n,g)=>n+g.triangles.length,0)};
  } finally {controls?.dispose();clock.mock.restore();globalThis.document=oldDocument;globalThis.window=oldWindow;}
}

/** Local-envelope invariant, not whole-world route clearance. Production
 * flight rules/default home and real updates; no state position assignments. */
export function replayBalconyFlight(w,{fps=60,t=null}={}) {
  if(![10,60].includes(fps))throw Error('Bounded flight rates required');
  const envelope=new FlightEnvelope().addRoot(w.kit.root), state=new FlightState(envelope),dt=1/fps;
  let now=0,frames=0,maxStep=0;const target={x:216,z:478.03},phases=[];
  const tick=(input={})=>{const p={...state.position};now+=1000/fps;frames++;state.update(dt,now,input);maxStep=Math.max(maxStep,Math.hypot(state.position.x-p.x,state.position.z-p.z));if(!envelope.isSafe(state.position,FLIGHT_RULES.radius,FLIGHT_RULES.maximumAltitude))throw Error('Unsafe production flight position');};
  const climb=()=>{for(let n=0;n<Math.ceil(100/9*fps)+2 && state.position.y<100-1e-7;n++)tick({vertical:Math.min(1,(100-state.position.y)/(9*dt))});};
  const boarded=state.board();climb();
  const travelLimit=Math.ceil(Math.hypot(target.x-state.position.x,target.z-state.position.z)/24*fps)+2;
  for(let n=0;n<travelLimit;n++){const dx=target.x-state.position.x,dz=target.z-state.position.z,d=Math.hypot(dx,dz);if(d<1e-7)break;const s=Math.min(1,d/(24*dt))/d;tick({right:-dx*s,forward:dz*s});}
  const balconySafeGround=envelope.safeGround(target.x,target.z,FLIGHT_RULES.radius),landAtBalcony=state.landAt(target);
  for(let n=0;n<Math.ceil(100/9*fps)+2;n++){tick({vertical:-1});if(state.blocked)break;}
  const blocked=state.blocked,minimumY=envelope.minimumY(target.x,target.z,FLIGHT_RULES.radius);
  tick(); const balconyDismount=t ? exerciseFlightTourExit(t,w,state,envelope) : null; const exitAtBalcony=balconyDismount ? balconyDismount.exited : state.exit(now);phases.push({name:'balcony-descent',position:{...state.position},blocked,minimumY,grounded:state.grounded,exitAtBalcony});
  climb();const returnAccepted=state.landAt(HELICOPTER_HOME);
  const returnLimit=Math.ceil((Math.hypot(target.x-HELICOPTER_HOME.x,target.z-HELICOPTER_HOME.z)/24+100/9+3)*fps);
  for(let n=0;n<returnLimit && (state.mode==='auto'||!state.grounded);n++)tick();
  tick();const homeDismount=t ? exerciseFlightTourExit(t,w,state,envelope) : null; const exitAtHome=homeDismount ? homeDismount.exited : state.exit(now);phases.push({name:'legal-home-exit',position:{...state.position},grounded:state.grounded,exitAtHome});
  return {fps,frames,boarded,balconySafeGround,landAtBalcony,blocked,minimumY,exitAtBalcony,returnAccepted,exitAtHome,
    radius:state.rules.radius,maxStep,phases,balconyDismount,homeDismount,envelope:envelope.summary(),scope:'ONE_HALL_LOCAL_ENVELOPE_NOT_WHOLE_WORLD_ROUTE',positionWrites:0};
}

/** Exercise the actual FlightTour.exit handoff with real FirstPerson controls,
 * real model exit offsets/parked boxes and collision manager. UI/DOM only are
 * stubbed; no whole-world loader or browser/pointer-lock success is claimed. */
export function exerciseFlightTourExit(t,w,state,envelope) {
  const oldDocument=globalThis.document,oldWindow=globalThis.window,noop=()=>{};
  const doc={...oldDocument,addEventListener:noop,removeEventListener:noop,exitPointerLock:noop};
  globalThis.document=doc;globalThis.window={addEventListener:noop,removeEventListener:noop};
  const camera=new THREE.PerspectiveCamera(),dom={ownerDocument:doc,addEventListener:noop,removeEventListener:noop};
  let controls,model;
  try {
    controls=new FirstPersonControls(camera,dom,w.cm);controls.controls.isLocked=true;doc.pointerLockElement=dom;
    controls.setPosition(18,PLAYER.HEIGHT,-494);const beforeEye=camera.position.toArray();
    model=createHelicopterModel();const f=Object.create(FlightTour.prototype),loaded=[];
    Object.assign(f,{state,envelope,model,camera,controls,cm:w.cm,isPaused:()=>false,zoneManager:{ensureLoadedAt:(x,z)=>loaded.push([x,z])},
      keys:new Set(),pointers:new Map(),status:{textContent:''},onModeChange:noop,updateUI:noop,savedLookLocked:false,savedHeadBob:true,
      walkingControlAttempt:0,resumeLockAttempt:0,flightUnlockPending:false,disposed:false});
    f.syncModel();const exited=f.exit();const afterEye=camera.position.toArray();
    const p={x:camera.position.x,z:camera.position.z,feet:controls.feetY};
    const groups=[...captureVisibleSolids(w.kit.root),...captureVisibleSolids(model.group)];
    return {exited,beforeEye,afterEye,feet:controls.feetY,headBobEnabled:controls.headBobEnabled,loaded,
      parkedColliderCount:w.cm.colliders.filter(c=>c.tag==='virtual-tour-helicopter').length,contacts:contactsAt(w,groups,p),
      productionPath:'FlightTour.exit -> real FirstPersonControls.setPosition/lookAt; real parked boxes/model exit offsets',ui:'STUBBED_NOT_BROWSER_VALIDATION'};
  } finally {w.cm.removeByTag('virtual-tour-helicopter');controls?.dispose();model?.dispose();globalThis.document=oldDocument;globalThis.window=oldWindow;}
}
