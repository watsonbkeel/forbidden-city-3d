import * as T from 'three';
import {triangleBodySweptIntersects} from '../../../utils/TriangleSupport.js';
import {PLAYER} from '../../../config/constants.js';
import {pathFootprintCovered} from '../../../controls/WumenJointAscentCoverage.js';
import {wumenJointBodySweep} from '../../../controls/WumenJointAscentSweep.js';
const PREFIX='luanjia-south-gameplay23/',KEY='luanjiaSouthTwoLevel',hosts=new WeakMap(),owners=new WeakMap(),previous=new WeakMap();
const near=(a,b)=>Number.isFinite(a)&&Math.abs(a-b)<2e-5;
const rect=w=>({minX:w.box.min.x,maxX:w.box.max.x,minZ:w.box.min.z,maxZ:w.box.max.z});
const inside=(r,x,z)=>x>=r.minX&&x<=r.maxX&&z>=r.minZ&&z<=r.maxZ;
const unchanged=(w,b)=>w?.type==='box'&&w.rescue===false&&w.box?.isBox3&&w.box.equals(b);
function validHost(p){
 const{kit,f,detail,meta,rows,definitions,solids}=p,r=kit.root;
 return r?.name==='outer-east'&&r.visible&&f.visible&&detail.visible&&r.position.lengthSq()===0&&r.rotation.x===0&&r.rotation.y===0&&r.rotation.z===0&&r.scale.equals(new T.Vector3(1,1,1))&&f.parent===r&&f.position.equals(new T.Vector3(-340,0,-378))&&f.rotation.x===0&&f.rotation.y===Math.PI&&f.rotation.z===0&&f.scale.equals(new T.Vector3(1,1,1))&&f.userData[KEY]===meta&&meta.floorY===3.3&&meta.stepCount===20&&f.userData.structure?.modeledStairs===1&&detail.parent===f&&detail.children.length===solids.length&&solids.every(q=>q.mesh.parent===detail&&q.object.equals(q.box)&&kit.colliders.indexOf(q.object)===kit.colliders.lastIndexOf(q.object)&&kit.colliders.includes(q.object)&&q.object.triangleSupport===q.shape&&q.object.overhead===q.overhead&&q.object.luanjiaSouthAccess?.floorTriangles===q.floorShape)&&rows.every((w,i)=>unchanged(w,definitions[i])&&kit.walkables.includes(w)&&w.luanjiaSouthContactId===PREFIX+i);
}
/** Called only after the actual south adapter has successfully published every
 * visible solid. Twenty actual tread tops plus three actual cut deck pieces;
 * no ramp, support allocation, guessed substitute or historical-access claim. */
export function authorizeLuanjiaSouthContact(kit,f,{detail,meta,walkables,colliders,meshes}){
 if(hosts.has(f)||f.userData[KEY]!==meta||meta.status!=='GAMEPLAY_FIT_NOT_HISTORICAL_INTERIOR_RECONSTRUCTION'||walkables.length!==23||colliders.length!==meshes.length||detail.parent!==f||walkables.some(w=>w.type!=='box'||w.rescue!==false||w.luanjiaSouthContactId!==undefined||!Object.isExtensible(w)))throw Error('Luanjia contact requires actual successfully published23 faces');
 const supports=colliders.filter(c=>['upper-floor','closed-stair-tread'].includes(c.luanjiaSouthAccess?.role));
 if(supports.length!==23||walkables.some(w=>supports.filter(c=>near(c.min.x,w.box.min.x)&&near(c.max.x,w.box.max.x)&&near(c.min.z,w.box.min.z)&&near(c.max.z,w.box.max.z)&&near(c.max.y,w.box.max.y)).length!==1))throw Error('Luanjia contact faces must exactly represent visible rectangular tops');
 const definitions=walkables.map(w=>w.box.clone()),solids=colliders.map((c,i)=>({object:c,box:c.clone(),shape:c.triangleSupport,overhead:c.overhead,floorShape:c.luanjiaSouthAccess?.floorTriangles,mesh:meshes[i]}));
 const proof={kit,f,detail,meta,rows:walkables,definitions,solids,inverse:f.matrixWorld.clone().invert(),rects:walkables.map(rect)};
 for(let i=0;i<walkables.length;i++){walkables[i].luanjiaSouthContactId=PREFIX+i;owners.set(walkables[i],{proof,index:i});}hosts.set(f,proof);
 if(!validHost(proof))throw Error('Luanjia actual host publication differs');
}
export function preserveLuanjiaSouthContactOwner(target,original){
 const id=original?.luanjiaSouthContactId;if(id===undefined)return false;const p=owners.get(original);
 if(!p||id!==PREFIX+p.index||!validHost(p.proof)||!unchanged(original,p.proof.definitions[p.index])||!unchanged(target,p.proof.definitions[p.index]))throw Error('Luanjia contact cannot be copied from an unregistered or changed owner');
 target.luanjiaSouthContactId=id;owners.set(target,p);return true;
}
function live(cm){
 const rows=cm.walkables.filter(w=>w.luanjiaSouthContactId?.startsWith(PREFIX));if(rows.length!==23)return null;
 const first=owners.get(rows[0]),p=first?.proof;if(!p||!validHost(p))return null;
 const seen=new Set();for(const w of rows){const o=owners.get(w);if(!o||o.proof!==p||seen.has(o.index)||w.luanjiaSouthContactId!==PREFIX+o.index||!unchanged(w,p.definitions[o.index]))return null;seen.add(o.index);}
 for(const s of p.solids){const a=cm.colliders.filter(c=>c.mesh===s.object);if(a.length!==1||!a[0].box.equals(s.box)||!!a[0].triangleSupport!==!!s.shape||!!a[0].overhead!==!!s.overhead||s.overhead&&JSON.stringify(a[0].overhead)!==JSON.stringify(s.overhead)||s.shape&&a[0].triangleSupport.template!==s.shape.template)return null;}
 return p;
}
// The three owned flat slabs are literal boxes, not unsupported foreign curved
// roofs. Sweep their ORIGINAL VISIBLE triangles with the full feet-to-eye body
// first. Then use the unchanged ordinary sweep for all other solids; the bound
// raw manager still checks real overhead endpoints, water and dynamic people.
function sweep(cm,p,from,to,r){
 const body=v=>new T.Box3(new T.Vector3(v.x-r,v.y+1e-8,v.z-r),new T.Vector3(v.x+r,v.y+PLAYER.HEIGHT,v.z+r));
 const a=body(from),b=body(to);if(p.solids.some(s=>s.floorShape&&triangleBodySweptIntersects(s.floorShape,a,b)))return true;
 const owned=new Set(p.solids.filter(s=>s.floorShape).map(s=>s.object));
 const view={checkCollision:(...args)=>cm.checkCollision(...args),queryBox:box=>cm.queryBox(box).filter(c=>!c.overhead||!owned.has(c.mesh))};
 return wumenJointBodySweep(view,from,to,r).blocked;
}
export function resolveLuanjiaSouthContact(cm,state,delta,radius=.5){
 const old=previous.get(cm);previous.delete(cm);
 if(!state||state.airborne!==false||state.verticalVelocity>0||radius!==.5||![state.x,state.z,state.feetY,state.groundY,state.verticalVelocity,delta].every(Number.isFinite)||delta<=0||delta>.100001||state.x< -340.61||state.x> -329.79||state.z< -381.61||state.z> -379.39)return null;
 const p=live(cm);if(!p)return null;const fit=p.meta,local=new T.Vector3(state.x,0,state.z).applyMatrix4(p.inverse);
 if(local.z-radius<fit.stairZ-fit.stairWidth/2||local.z+radius>fit.stairZ+fit.stairWidth/2||local.x<fit.stairStart-1.6||local.x>fit.stairEnd+1.6)return null;
 const rise=PLAYER.SPRINT_SPEED*delta*fit.floorY/(fit.stairEnd-fit.stairStart)+fit.floorY/fit.stepCount;
 const ground=cm.getGroundHeight(state.x,state.z,Math.max(state.feetY,state.groundY)+rise,0),on=p.rows.some(w=>inside(rect(w),state.x,state.z)&&near(w.box.max.y,ground));
 // The toe is ordinary existing ground inside the retained flush stone slab,
 // never a new walkable. No upper-deck rescue is allowed from the lower storey.
 const toe=near(ground,0)&&local.x<fit.stairStart&&local.x>=fit.stairStart-1.6;
 if(!(on||toe)||ground<0||ground>fit.floorY+1e-7)return null;
 if(!old||old.proof!==p){if(Math.abs(state.feetY-ground)<=.3&&Math.abs(state.groundY-ground)<=.3)previous.set(cm,{proof:p,x:state.x,z:state.z,ground});return null;}
 if(Math.abs(state.feetY-old.ground)>.3||Math.min(Math.abs(state.groundY-old.ground),Math.abs(state.groundY-ground))>.3||Math.abs(ground-old.ground)>rise+1e-6||Math.hypot(state.x-old.x,state.z-old.z)>PLAYER.SPRINT_SPEED*delta+1e-6)return null;
 const prior=new T.Vector3(old.x,0,old.z).applyMatrix4(p.inverse);if(prior.z-radius<fit.stairZ-fit.stairWidth/2||prior.z+radius>fit.stairZ+fit.stairWidth/2)return null;
 const a=new T.Vector3(fit.stairStart-1.6,0,fit.stairZ-fit.stairWidth/2).applyMatrix4(p.f.matrixWorld),b=new T.Vector3(fit.stairStart,0,fit.stairZ+fit.stairWidth/2).applyMatrix4(p.f.matrixWorld),toeRect={minX:Math.min(a.x,b.x),maxX:Math.max(a.x,b.x),minZ:Math.min(a.z,b.z),maxZ:Math.max(a.z,b.z)};
 if(!pathFootprintCovered([...p.rects,toeRect],[old.x,old.z],[state.x,state.z],radius))return null;
 previous.set(cm,{proof:p,x:state.x,z:state.z,ground});if(Math.abs(ground-old.ground)<1e-6)return null;
 const from=new T.Vector3(old.x,state.feetY,old.z),to=new T.Vector3(state.x,ground,state.z),corner=ground>old.ground?new T.Vector3(old.x,ground,old.z):new T.Vector3(state.x,state.feetY,state.z);
 if(sweep(cm,p,from,corner,radius)||sweep(cm,p,corner,to,radius)){previous.delete(cm);return null;}
 return{feetY:ground,groundY:ground,airborne:false,verticalVelocity:0,onSupport:true,landed:false,luanjiaSouthContact:true};
}
