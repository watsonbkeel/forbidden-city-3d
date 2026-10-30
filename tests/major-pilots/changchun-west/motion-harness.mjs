import{buildNightBeds}from'../../../src/scene/characters/NightBeds.js';
import assert from 'node:assert/strict';
import * as T from 'three';
import {make} from './fixture.mjs';
import {CollisionManager} from '../../../src/utils/Collision.js';
import {withTerrainController} from '../../lib/r91-controller-clock.mjs';
import {PLAYER} from '../../../src/config/constants.js';
export function world({beds=false}={}){
 const a=make({parent:process.env.CHANGCHUN_PARENT==='1'}),cm=new CollisionManager();if(beds)buildNightBeds(a.b.kit,{id:'west-six'});a.b.kit.root.updateMatrixWorld(true);
 cm.rivers=[];cm.addColliders(a.b.kit.colliders);cm.addWalkables(a.b.kit.walkables);
 // Independent render-source bounds: do not derive the oracle from colliders.
 const solids=[];a.f.traverse(m=>{if(!m.isMesh)return;const western=m.name.startsWith('changchun-west-')||(m.position.x>0&&['changchun-north-kang','changchun-kang-cover-post','changchun-kang-cover-head'].includes(m.name));if(!western)return;const p=m.geometry.attributes.position,points=Array.from({length:p.count},(_,i)=>new T.Vector3().fromBufferAttribute(p,i).applyMatrix4(m.matrixWorld).toArray().map(Math.fround));solids.push({name:m.name,box:new T.Box3().setFromPoints(points.map(v=>new T.Vector3(...v)))});});
 return {...a,cm,solids};
}
function inspect(a,c,camera,label){const p=camera.position.clone().sub(c.bobOffset),lo=[p.x-.5,c.feetY,p.z-.5],hi=[p.x+.5,c.feetY+PLAYER.HEIGHT,p.z+.5];for(const {name,box}of a.solids){const min=box.min.toArray(),max=box.max.toArray();assert.equal(min.every((v,i)=>Math.min(max[i],hi[i])-Math.max(v,lo[i])>0),false,JSON.stringify({label,name,p:p.toArray(),feet:c.feetY}));}}
export function route(a,{fps,run,jump,reverse,endZ=380.5,endX=161.04}){return withTerrainController(a.cm,(c,camera,tick)=>{
 let points=[[150.2,378.4],[endX,378.4],[endX,endZ]];if(reverse)points=points.reverse();
 c.setPosition(points[0][0],.6+PLAYER.HEIGHT,points[0][1]);c.feetY=.6;c.groundY=.6;c.airborne=false;
 for(const[tx,tz]of points.slice(1)){
  const start=camera.position.clone().sub(c.bobOffset),direction=new T.Vector3(tx-start.x,0,tz-start.z).normalize();let arrived=false;
  for(let i=0;i<fps*12;i++){
   const p=camera.position.clone().sub(c.bobOffset),d=new T.Vector3(p.x-tx,0,p.z-tz),along=d.dot(direction),lateral=d.clone().addScaledVector(direction,-along).length();
   if(d.length()<.15||(along>=0&&along<=PLAYER.SPRINT_SPEED/fps+1e-6&&lateral<.15)){arrived=true;break;}
   camera.lookAt(tx,camera.position.y,tz);camera.updateMatrixWorld(true);c.moveForward=true;c.canSprint=run;
   if(jump&&i===Math.round(fps/3))c.jump();tick(fps);inspect(a,c,camera,{fps,run,jump,reverse,i});
  }
  assert.ok(arrived,JSON.stringify({fps,run,jump,reverse,target:[tx,tz],position:camera.position.toArray(),feet:c.feetY}));
 }
 c.moveForward=false;for(let i=0;i<fps*2;i++){tick(fps);inspect(a,c,camera,'settle');}
 assert.equal(c.airborne,false);return {feet:c.feetY,position:camera.position.clone().sub(c.bobOffset).toArray()};
});}
