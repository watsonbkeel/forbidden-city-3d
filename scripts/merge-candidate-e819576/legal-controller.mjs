import fs from 'node:fs';
import assert from 'node:assert/strict';
import {pathToFileURL} from 'node:url';
import {execFileSync} from 'node:child_process';
const root=process.argv[2]??process.cwd();
const imp=p=>import(pathToFileURL(root+'/'+p));
const {buildWorld,walkStraight,collidersIn}=await imp('tests/lib/world.mjs');
const {withTerrainController}=await imp('tests/lib/r91-controller-clock.mjs');
const {PLAYER}=await imp('src/config/constants.js');
const W=await buildWorld(),{cm,THREE}=W,R=.5;
const box=c=>({bounds:[c.box.min.toArray(),c.box.max.toArray()],owner:W.ownerOf(c),scope:c.furnitureMotionScope??null,source:c.mesh?.retainedCourtyardSource??null});
const routes=[{name:'Lijing',start:[94.5,439.7],target:[94.5,448.7]},{name:'Tongdao',start:[149.3,439.3],target:[149.3,446.1]}];
const result={commit:execFileSync('git',['rev-parse','HEAD'],{cwd:root,encoding:'utf8'}).trim(),limits:'CPU actual World/FirstPerson only. Target crossing may overshoot by at most one frame. No browser/GPU acceptance. checkCollision is legacy collision query, not an independent swept-body proof.',routes:[]};
for(const route of routes){
 const [x,z]=route.start,feet=cm.getGroundHeight(x,z,0,PLAYER.STEP_UP),startPose=new THREE.Vector3(x,feet+PLAYER.HEIGHT,z);
 const legal={feet,finite:Number.isFinite(feet),initialCollision:cm.checkCollision(startPose,R),groundAtFeet:cm.getGroundHeight(x,z,feet,PLAYER.STEP_UP)};
 legal.accepted=legal.finite&&!legal.initialCollision&&Math.abs(legal.groundAtFeet-feet)<1e-8;
 const row={...route,legalStart:legal,legacyWalkStraight:walkStraight(W,route.start,route.target),nearbyCollisionSources:collidersIn(W,x-R,z,x+R,route.target[1]).map(box),runs:[]};
 if(!legal.accepted)throw Error('Illegal start '+route.name);
 for(const hz of[10,60])for(const sprint of[false,true]){
  row.runs.push(withTerrainController(cm,(c,camera,tick)=>{
   camera.position.copy(startPose);camera.rotation.y=Math.PI;camera.updateMatrix();
   c.feetY=feet;c.groundY=feet;c.airborne=false;c.verticalVelocity=0;c.moveForward=true;c.canSprint=sprint;
   let maxFrameStep=0,maxUnbobbedFrameStep=0,maxVerticalFeetStep=0,legacyCollisionFrames=0,frames=0;
   const trace=[];
   for(let i=0;i<hz*8;i++){
    const before=camera.position.clone(),beforeBase=camera.position.clone().sub(c.bobOffset),beforeFeet=c.feetY;tick(hz);frames++;
    const base=camera.position.clone().sub(c.bobOffset);maxUnbobbedFrameStep=Math.max(maxUnbobbedFrameStep,Math.hypot(base.x-beforeBase.x,base.z-beforeBase.z));
    const step=Math.hypot(camera.position.x-before.x,camera.position.z-before.z);maxFrameStep=Math.max(maxFrameStep,step);maxVerticalFeetStep=Math.max(maxVerticalFeetStep,Math.abs(c.feetY-beforeFeet));
    const bodyPose=new THREE.Vector3(camera.position.x,c.feetY+PLAYER.HEIGHT,camera.position.z),collision=cm.checkCollision(bodyPose,R);
    if(collision)legacyCollisionFrames++;
    trace.push({frame:frames,x:camera.position.x,z:camera.position.z,feet:c.feetY,ground:c.groundY,airborne:c.airborne,onSupport:c.onSupport,step,legacyCollision:collision});
    if(camera.position.z>=route.target[1])break;
   }
   const last=trace.at(-1),distanceToTarget=Math.hypot(last.x-route.target[0],last.z-route.target[1]);
   return{hz,mode:sprint?'sprint':'walk',crossedTarget:last.z>=route.target[1],frames,seconds:frames/hz,final:last,distanceToTarget,maxFrameStep,maxUnbobbedFrameStep,maxVerticalFeetStep,theoreticalFrameTravel:(sprint?PLAYER.SPRINT_SPEED:PLAYER.MOVE_SPEED)/hz,legacyCollisionFrames,trace};
  }));
 }
 result.routes.push(row);
}
for(const route of result.routes)for(const run of route.runs){assert.ok(route.legalStart.accepted);assert.ok(run.crossedTarget,route.name+' '+run.hz+' '+run.mode);assert.equal(run.legacyCollisionFrames,0);assert.ok(run.maxUnbobbedFrameStep<=run.theoreticalFrameTravel+1e-7);assert.equal(run.final.airborne,false);}
assert.equal(result.routes.reduce((n,r)=>n+r.runs.length,0),8);
fs.writeFileSync(root+'/reports/merge-candidate-e819576/legal-controller.json',JSON.stringify(result,null,2)+'\n');
console.log('8/8 actual controller legal-start target crossings pass; no browser/GPU or swept-body claim.');
