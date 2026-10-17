import {replayKunning} from './kunning-walk.mjs';
import {traceTerraceGround} from './terrace-walk.mjs';
import {PLAYER} from '../../src/config/constants.js';
/** Reuse the existing physical-crossing driver unchanged. Its sprint runs walk
 * within 2m of turns/endpoints; this is disclosed, not a full-speed-turn claim.
 * Actual FirstPerson physics, collision, body and support rules are untouched. */
export function replayGateTower(t,W,points,options={}){
 const saved=W.cm.walkables;
 W.cm.walkables=saved.map(w=>w.type==='box'?{...w,rescue:false}:w);
 const trace=traceTerraceGround(W.cm,{flights:[]});
 try{
  const result=replayKunning(t,W,points,{...options,recordFrames:true});
  const occupied=(feetSelector)=>result.frames.filter(f=>W.cm.checkCollision(new W.THREE.Vector3(f.x,feetSelector(f)+PLAYER.HEIGHT,f.z),.5));
  return {...result,bodyRadius:.5,logicalBodyCollisionFrames:occupied(f=>Math.max(f.feet,f.ground)),cameraFeetCollisionFrames:occupied(f=>f.feet),supportQueries:trace.samples};
 }finally{trace.restore();W.cm.walkables=saved;}
}
