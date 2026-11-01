import test from 'node:test';
import assert from 'node:assert/strict';
import fs from 'node:fs';
import {captureGate} from '../../lib/wumen-practical-fixture.mjs';
import {replayGateTower} from '../../lib/gate-tower-walk.mjs';
import {Enclosure} from '../../../src/scene/Enclosure.js';
import {installWumenPracticalWallJunction} from '../../../src/scene/palace/special/WumenPracticalWallJunction.js';
import {preserveWumenPracticalDescentOwner,resolveWumenPracticalDescent} from '../../../src/scene/palace/special/WumenPracticalDescent.js';
import {CollisionManager} from '../../../src/utils/Collision.js';
import {installWumenPracticalAssembly} from '../../../src/scene/palace/special/WumenPracticalAssembly.js';
import {WUMEN_PRACTICAL_FIT as FIT} from '../../../src/scene/palace/special/WumenPracticalFit.js';
class PracticalDescentManager extends CollisionManager {
 addWalkable(source,tag){const before=this.walkables.length;super.addWalkable(source,tag);if(this.walkables.length>before)preserveWumenPracticalDescentOwner(this.walkables.at(-1),source);}
 resolveFurnitureVertical(state,delta,radius){return resolveWumenPracticalDescent(this,state,delta,radius)??super.resolveFurnitureVertical(state,delta,radius);}
}
function build(){const c=captureGate();const receipt=installWumenPracticalAssembly(c.builder,c.group,c.data,{colliderStart:0,walkableStart:0});const wall=new Enclosure(new c.THREE.Scene(),c.lib),wallGroup=new c.THREE.Group(),original=wall.addWallSegment;wall.addWallSegment=function(p,s,...rest){if(!installWumenPracticalWallJunction(this,p,s))original.call(this,p,s,...rest);};wall.buildOuterWalls(wallGroup);const cm=new PracticalDescentManager();cm.addColliders(c.builder.colliders);cm.addColliders(wall.colliders);cm.addWalkables(c.builder.walkables);return {...c,cm,receipt};}
function ascent(side){const parts=FIT.platform.recesses.filter(p=>p.id.startsWith(side+'/')),points=parts.map(p=>[p.axis==='x'?(p.a0+p.a1)/2:(p.minX+p.maxX)/2,p.axis==='z'?(p.a0+p.a1)/2:(p.minZ+p.maxZ)/2]),first=parts[0],s=side==='east'?-1:1;points.unshift([(first.minX+first.maxX)/2,first.maxZ+2]);points.push([s*60.61837748344371,points.at(-1)[1]]);return points;}
const Z=-419.6;
test('real default controller crosses both complete ascents, north deck and all five ground portals',t=>{
 const W=build(),rows=[];if(process.env.WUMEN_PRACTICAL_FRAMES_OUT)fs.writeFileSync(process.env.WUMEN_PRACTICAL_FRAMES_OUT,'');
 const routes=[{id:'east-ascent',points:ascent('east'),highEnd:true},{id:'west-ascent',points:ascent('west'),highEnd:true},{id:'north-deck',points:[[-10,13.5],[10,13.5]],feet:12.3},...[-14.5,0,14.5].map(x=>({id:`central-${x}`,points:[[x,-15.3],[x,20.6]],feet:0})),...[-1,1].map(s=>({id:`side-${s}`,points:[[s*38.6,-16.5],[s*48,-16.5],[s*48,20.6]],feet:0}))];
 for(const r of routes)for(const fps of[10,60])for(const sprint of[false,true])for(const reverse of[false,true]){
  const points=(reverse?[...r.points].reverse():r.points).map(([x,z])=>[x,z+Z]);let result;try{result=replayGateTower(t,W,points,{fps,sprint,startFeet:r.feet??(reverse?12.3:0)});}finally{t.mock.restoreAll();}
  const row={id:r.id,fps,sprint,reverse,arrived:result.arrived,end:result.end,frames:result.frames.length,logicalBodyFrames:result.logicalBodyCollisionFrames.length,cameraBodyFrames:result.cameraFeetCollisionFrames.length,maxGroundMinusFeet:Math.max(0,...result.frames.map(f=>f.ground-f.feet)),maxFeetMinusGround:Math.max(0,...result.frames.map(f=>f.feet-f.ground)),minFeet:result.minFeet,maxFeet:result.maxFeet};rows.push(row);let consecutive=0;row.longestFeetAbove03Seconds=0;for(const frame of result.frames){consecutive=frame.feet-frame.ground>.3?consecutive+1/fps:0;row.longestFeetAbove03Seconds=Math.max(row.longestFeetAbove03Seconds,consecutive);}if(process.env.WUMEN_PRACTICAL_FRAMES_OUT)fs.appendFileSync(process.env.WUMEN_PRACTICAL_FRAMES_OUT,JSON.stringify({...row,rawFrames:result.frames})+'\n');
  assert.equal(result.arrived,true,JSON.stringify(row));assert.ok(row.maxGroundMinusFeet<=.3,'visible ascending feet lag exceeds user 0.3m budget: '+JSON.stringify(row));assert.ok(result.minFeet>=-.001,JSON.stringify(row));assert.ok(Math.abs(result.end[2]-(r.feet??(reverse?0:12.3)))<.01,JSON.stringify(row));
 }
 const result={scope:'ACTUAL_NATIVE_CONTROLLER_WUMEN_PLUS_REAL_ENCLOSURE_NOT_FULL_WORLD_OR_GPU',colliders:W.cm.colliders.length,supports:W.cm.walkables.length,routes:rows};console.log(JSON.stringify(result));if(process.env.WUMEN_PRACTICAL_ROUTES_OUT)fs.writeFileSync(process.env.WUMEN_PRACTICAL_ROUTES_OUT,JSON.stringify(result,null,2)+'\n');assert.ok(rows.filter(r=>r.reverse).every(r=>r.maxFeetMinusGround<=.3),'visible descending feet flight exceeds 0.3m: '+JSON.stringify(rows.filter(r=>r.reverse&&r.maxFeetMinusGround>.3)));
});
test('the four fitted pavilions and two wings are closed solids, not new unverified entrances',()=>{const W=build();for(const t of FIT.targetGroups.filter(t=>t.kind!=='link')){const [x,z]=t.positionXZ;assert.equal(W.cm.checkCollision(new W.THREE.Vector3(x,14,z+Z),.5),true,t.id);}});

test('both ascent landings connect around the pavilions across the real north terrace',t=>{
 const W=build(),neck=side=>FIT.platform.recesses.find(r=>r.id===side+'/neck'),east=neck('east'),west=neck('west'),zE=(east.minZ+east.maxZ)/2+Z,zW=(west.minZ+west.maxZ)/2+Z,x=FIT.platform.envelope.halfWidth-1.5,points=[[-60.61837748344371,zE],[-x,zE],[-x,13.5+Z],[x,13.5+Z],[x,zW],[60.61837748344371,zW]],rows=[];
 for(const fps of[10,60])for(const sprint of[false,true])for(const reverse of[false,true]){let r;try{r=replayGateTower(t,W,reverse?[...points].reverse():points,{fps,sprint,startFeet:12.3});}finally{t.mock.restoreAll();}const row={fps,sprint,reverse,arrived:r.arrived,minFeet:r.minFeet,maxFeet:r.maxFeet,end:r.end,frameCount:r.frames.length};rows.push(row);assert.equal(r.arrived,true,JSON.stringify(row));assert.ok(r.minFeet>=12.3-.3,JSON.stringify(row));}
 console.log(JSON.stringify({scope:'CURRENT_WUMEN_PLUS_ACTUAL_ENCLOSURE_NORTH_TERRACE_LINK_NOT_FULL_WORLD',rows}));
});
