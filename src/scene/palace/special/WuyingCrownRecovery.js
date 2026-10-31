import * as T from 'three';
import {triangleBodyIntersects,triangleBodySweepFraction} from '../../../utils/TriangleSupport.js';

// Object-scoped contract used only by the explicit player/bridge hooks.
// A capability never leaves these closures. It is bound to one actual player,
// camera, manager, source-owner witness and original river object.
const RADIUS=.5,HEIGHT=1.7,VELOCITY=4.8,RISE=.84,LIFETIME=1050,COOLDOWN=1600;
const body=(x,z,y)=>new T.Box3(new T.Vector3(x-RADIUS,y+1e-8,z-RADIUS),new T.Vector3(x+RADIUS,y+HEIGHT,z+RADIUS));
const pose=p=>({x:p.camera.position.x-(p.bobOffset?.x??0),z:p.camera.position.z-(p.bobOffset?.z??0),feet:p.feetY});
const finite=p=>[p.x,p.z,p.feet].every(Number.isFinite);

/** The issuer supplies the private authored-owner witness; arbitrary objects,
 * names or imported JSON cannot manufacture a token in another instance. */
export function createWuyingCrownRecoveryContract(certify){
 if(typeof certify!=='function')throw new TypeError('Private authored witness required');
 const players=new WeakMap(),managers=new WeakMap();
 // Permission, residual ascent safety and the synchronous busy lock have
 // separate lifetimes. Only the move finally-block releases a running lock.
 const revoke=s=>{s.token=null;};
 function valid(s,checkPose=true){
  const p=s.player,t=s.token,now=performance.now();
  if(!t||p.collisionManager!==s.manager||p.camera!==s.camera||!p.airborne||!Number.isFinite(p.verticalVelocity)||![s.manager.rivers,s.manager.colliders,s.manager.walkables].every(Array.isArray)||!Number.isFinite(now)||now<t.started||now-t.started>LIFETIME){revoke(s);return null;}
  const q=pose(p),b=t.witness.bridge,side=t.witness.side;
  if(!finite(q)||(checkPose&&Math.abs(q.z-t.z)>1e-6)||q.feet<t.feet-.002||q.feet>t.feet+RISE||p.verticalVelocity>VELOCITY+1e-7||(checkPose&&(side*(q.x-t.x)>1e-6||side*(q.x-b.x)<0))||!s.manager.rivers.includes(t.witness.river)||!t.witness.authenticate()){revoke(s);return null;}
  return t;
 }
 function clearVertical(manager,q,toFeet){
  if(!finite(q)||!Number.isFinite(toFeet)||!Array.isArray(manager.colliders)||typeof manager.queryBox!=='function'||typeof manager.checkDynamicCollision!=='function')return false;
  const a=body(q.x,q.z,q.feet),b=body(q.x,q.z,toFeet),swept=a.clone().union(b);
  for(const c of manager.queryBox(swept)){
   if(c.triangleSupport){if(triangleBodyIntersects(c.triangleSupport,a)||triangleBodySweepFraction(c.triangleSupport,a,b)!==null)return false;}
   // Conservative for all other special/static shapes. No ordinary AABB
   // ceiling can be jumped through just because generic jump ignores it.
   else if(swept.intersectsBox(c.box))return false;
  }
  return !manager.checkDynamicCollision(new T.Vector3(q.x,toFeet+HEIGHT,q.z),RADIUS,new T.Vector3(q.x,q.feet+HEIGHT,q.z));
 }
 function attach(player){
  if(players.has(player))return players.get(player).api;
  const manager=player?.collisionManager,camera=player?.camera;
  if(!manager||!camera?.isCamera||!Array.isArray(manager.colliders)||!Array.isArray(manager.walkables)||!Array.isArray(manager.rivers)||typeof manager.queryBox!=='function'||typeof manager.checkDynamicCollision!=='function')throw new TypeError('Live player and collision scene required');
  const s={player,manager,camera,token:null,ascentGuard:false,movement:null,observed:null,lastGrant:-Infinity,disposed:false};
  const api=Object.freeze({
   observe({forward=0,right=0}={}){
    s.observed={...pose(player),at:performance.now(),forward,right};
    if(!player.airborne)s.ascentGuard=false;
    if(s.token)valid(s);
   },
   tryJump(){
    if(s.disposed||(!player.isMobile&&!player.controls?.isLocked&&!player.freeMove)||player.collisionManager!==manager||player.camera!==camera||player.jumpQueued!==true||player.airborne!==true||!Number.isFinite(player.verticalVelocity)||![manager.rivers,manager.colliders,manager.walkables].every(Array.isArray)||Math.abs(player.verticalVelocity)>1e-7||s.token)return null;
    const now=performance.now();if(!Number.isFinite(now)||now<s.lastGrant||now-s.lastGrant<COOLDOWN)return null;
    const q=pose(player);if(!finite(q)||!s.observed||now-s.observed.at<0||now-s.observed.at>100||Math.abs(q.x-s.observed.x)>1e-6||Math.abs(q.z-s.observed.z)>1e-6||Math.abs(q.feet-s.observed.feet)>1e-6)return null;
    camera.updateMatrix();const right=new T.Vector3().setFromMatrixColumn(camera.matrix,0),forward=new T.Vector3().crossVectors(camera.up,right),direction=forward.multiplyScalar(s.observed.forward).addScaledVector(right,s.observed.right);
    if(![direction.x,direction.z].every(Number.isFinite))return null;
    const witness=certify(manager,q);if(!witness||-witness.side*direction.x<.05||Math.abs(direction.z)>Math.abs(direction.x)+1e-7)return null;
    if(!clearVertical(manager,q,q.feet+RISE))return null;
    s.token={witness,x:q.x,z:q.z,feet:q.feet,started:now};s.ascentGuard=true;s.lastGrant=now;return VELOCITY;
   },
   withMovement(from,target,move){
    if(typeof move!=='function')throw new TypeError('Synchronous player movement required');
    if(s.movement||managers.has(manager))throw new TypeError('Recovery movement is non-reentrant');
    const t=valid(s,false),o=s.observed,now=performance.now();
    if(!t||!o||now-o.at<0||now-o.at>100||!from||!target||![from.x,from.y,from.z,target.x,target.y,target.z].every(Number.isFinite)||Math.abs(from.x-o.x)>1e-6||Math.abs(from.z-o.z)>1e-6||Math.abs(from.y-HEIGHT-o.feet)>1e-6||Math.abs(target.y-from.y)>1e-7||Math.abs(target.x-camera.position.x)>1e-6||Math.abs(target.z-camera.position.z)>1e-6)return move();
    s.movement={minX:Math.min(from.x,target.x),maxX:Math.max(from.x,target.x),feet:o.feet};managers.set(manager,s);
    try{return move();}finally{s.movement=null;if(managers.get(manager)===s)managers.delete(manager);}
   },
   limitVertical(fromFeet,toFeet){
    // Revoking water permission must never revoke safety for momentum already
    // issued. This guard only constrains this special hop, never grants support
    // or passage, and survives expiry/stop/cancel/owner loss until ascent ends.
    if(!s.ascentGuard)return toFeet;
    if(toFeet<=fromFeet){s.ascentGuard=false;return toFeet;}
    if(player.collisionManager!==manager||player.camera!==camera||!player.airborne||!Number.isFinite(player.verticalVelocity)||player.verticalVelocity>VELOCITY+1e-7)return fromFeet;
    const q=pose(player);q.feet=fromFeet;
    return clearVertical(manager,q,toFeet)?toFeet:fromFeet;
   },
   cancel(){revoke(s);},
   reset(){revoke(s);s.ascentGuard=false;},
   dispose(){revoke(s);s.disposed=true;players.delete(player);},
  });
  s.api=api;players.set(player,s);return api;
 }
 function allowsRiver(manager,river,from,to,radius,fromFeet,toFeet){
  // During getValidPosition the camera temporarily contains the proposed
  // target, not an accepted pose. Do not revoke on that speculative target;
  // observe()/limitVertical() validate accepted poses, and endpoints below
  // still constrain every offered river segment exactly.
  const s=managers.get(manager),t=s&&valid(s,false);
  if(!t||!s.movement||river!==t.witness.river||!from||radius!==RADIUS||![from.x,from.z,to.x,to.z,fromFeet,toFeet].every(Number.isFinite))return false;
  const {bridge:b,side}=t.witness,m=s.movement;
  if(from.x<m.minX-1e-7||from.x>m.maxX+1e-7||to.x<m.minX-1e-7||to.x>m.maxX+1e-7||Math.abs(fromFeet-m.feet)>1e-7)return false;
  if(Math.abs(from.z-t.z)>1e-6||Math.abs(to.z-t.z)>1e-6||Math.abs(to.x-from.x)>.251||side*(to.x-from.x)>=-1e-8||side*(from.x-t.x)>1e-6||side*(to.x-b.x)<0||fromFeet<t.feet-.002||fromFeet>t.feet+RISE||Math.abs(toFeet-fromFeet)>1e-7)return false;
  return true; // Only river eligibility; ordinary static/dynamic sweeps follow.
 }
 return Object.freeze({attach,allowsRiver});
}
