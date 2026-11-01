import {mock} from 'node:test';
import {fixture,world,dispose,THREE,hash} from './fixture.mjs';
import {replayTerrace} from '../../../lib/terrace-walk.mjs';
const {CollisionManager}=await import('../../../../src/utils/Collision.js');
const f=fixture(false,'wuying'),W=world(f,true),rows=[];
for(const fps of[10,60]){
 const local=[[-12,0],[-9.75,0],[0,0],[9.75,0],[12,0]].map(([z,x])=>[f.g.x+x,f.g.z+z]);
 const r=replayTerrace({mock},W,[...local,...local.slice(0,-1).reverse()],{fps,recordFrames:true,sprint:fps===10});
 rows.push({fps,arrived:r.arrived,startFeet:r.startFeet,maxFeet:r.maxFeet,end:r.end,frames:hash(r.frames)});
}
for(const x of[-9.98,-6.98,-3.04,0,3.04,6.98,9.98])for(const z of[-11,-10,-9,0,9,10,11])for(const y of[0,.8,2])rows.push({x,z,y,ground:f.cm.getGroundHeight(f.g.x+x,f.g.z+z,y),support:f.cm.supportHeight(f.g.x+x,f.g.z+z,y),collision:f.cm.checkCollision(new THREE.Vector3(f.g.x+x,y+1.7,f.g.z+z),.5)});
const cm=new CollisionManager();cm.rivers=[];cm.moats=[];cm.addWalkable({type:'ramp',axis:'z',minX:-5,maxX:5,minZ:-5,maxZ:5,a0:-5,a1:5,y0:0,y1:2,crossMin0:-5,crossMax0:5,crossMin1:-2,crossMax1:2});
for(const x of[-5,-3,0,3,5])for(const z of[-5,0,5])rows.push({ordinary:[x,z],height:cm.getGroundHeight(x,z,2),collision:cm.checkCollision(new THREE.Vector3(x,3.7,z),.5)});
process.stdout.write(JSON.stringify(rows));dispose(f);
