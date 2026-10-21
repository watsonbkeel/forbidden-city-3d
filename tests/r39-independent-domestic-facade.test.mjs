import test from 'node:test';
import assert from 'node:assert/strict';
import {readFileSync} from 'node:fs';
import * as THREE from 'three';
import {ZoneBase} from '../src/scene/zones/ZoneBase.js';
import {CollisionManager} from '../src/utils/Collision.js';
import {library} from './lib/inner-palace-fixture.mjs';
import {walkStraight} from './lib/world.mjs';
const config=JSON.parse(readFileSync(new URL('../data/zones/west-six.json',import.meta.url)));
for(const name of ['长春宫','翊坤宫'])test(`R39 independent: ${name} central entry and all facade shortcut rejection checks run from clear starts`,()=>{
 const item=config.items.find(i=>i.kind==='hall'&&i.name===name),b=new ZoneBase(library(),config),{f}=b.buildHall(item);b.kit.root.updateMatrixWorld(true);const cm=new CollisionManager();cm.rivers=[];cm.addColliders(b.kit.colliders);cm.addWalkables(b.kit.walkables);const front=-item.d/2,bay=item.w/5;
 const doors=b.kit.rooms.flatMap(r=>r.doors),entries=doors.filter(d=>Math.abs(d.x-item.x)<1e-7&&Math.abs(d.z-item.z-front)<1e-7);assert.equal(entries.length,1,'find real front entrance across navigation zones, not first room');assert.equal(cm.checkCollision(new THREE.Vector3(entries[0].x,item.ph+1.7,entries[0].z),.5),false);
 const blocked=(label,a,z)=>{const start=[item.x+a[0],item.z+a[1]],end=[item.x+z[0],item.z+z[1]];assert.equal(cm.checkCollision(new THREE.Vector3(start[0],item.ph+1.7,start[1]),.5),false,`${label} needs clear start`);const r=walkStraight({cm,THREE},start,end,{feet0:item.ph,step:.05});assert.ok(r.reached>=.1,`${label} must actually move: ${JSON.stringify(r)}`);assert.ok(r.reached<r.total-.5,`${label} must block: ${JSON.stringify(r)}`);};
 for(let i=0;i<5;i++)if(i!==2)blocked(`closed-window-${i}`,[-item.w/2+(i+.5)*bay,front-1.4],[-item.w/2+(i+.5)*bay,front+1.4]);
 for(let i=1;i<5;i++)blocked(`front-column-${i}`,[-item.w/2+i*bay,front-1.4],[-item.w/2+i*bay,front+1.4]);
 for(const side of[-1,1]){blocked(`side-wall-${side}`,[side*(item.w/2-1.4),0],[side*(item.w/2+1.4),0]);blocked(`rear-wall-${side}`,[side*item.w/4,item.d/2-1.4],[side*item.w/4,item.d/2+1.4]);}
 const i=name==='长春宫'?2:1,p=new THREE.Vector3(item.x-item.w/2+i*bay,item.ph+1.7,item.z+front+1.4);assert.equal(cm.checkCollision(p,.5),true,'old probe starts occupied');const visible=[];f.traverse(o=>{if(o.isMesh&&o.userData.role?.startsWith('west-domestic'))visible.push(new THREE.Box3().setFromObject(o));});assert.ok(visible.some(v=>v.distanceToPoint(p)<.5),'old start obstruction has actual visible timber');b.kit.dispose(b.kit.root);
});
