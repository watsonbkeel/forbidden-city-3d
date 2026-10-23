import test from 'node:test';
import assert from 'node:assert/strict';
import {execFileSync} from 'node:child_process';
import {mkdirSync,writeFileSync} from 'node:fs';
import * as THREE from 'three';
import {fixture,hash,meshRows,physical,roles,geometryHealth,triangles} from './lib/r58-court-facade-fixture.mjs';
import {buildXieheCourtyardKnees,XIEHE_COURTYARD_KNEE_FIT as fit} from '../src/scene/palace/special/XieheCourtyardKnees.js';
import {assertXieheCourtyardKneesInWorld,replayXieheCourtyardJumps} from './lib/r58-xiehe-courtyard-world-check.mjs';
import {replayTerrace} from './lib/terrace-walk.mjs';

const url=new URL('../src/scene/palace/special/SideGate.js',import.meta.url);
let source=execFileSync('git',['show','c85e770:src/scene/palace/special/SideGate.js'],{encoding:'utf8'});
source=source.replace(/from\s+(['"])([^'"]+)\1/g,(_,q,id)=>`from ${q}${id==='three'?import.meta.resolve('three'):new URL(id,url).href}${q}`);
const {buildSideGate:baseline}=await import('data:text/javascript;base64,'+Buffer.from(source).toString('base64'));
const isKnee=o=>o.userData.role==='xiehe-courtyard-knee';

test('six independently sourced Xiehe courtyard knees; all existing triangles and physical records remain exact',()=>{
 for(const profile of ['xiehe','xihe','jingyun','longzong']){
  const a=fixture(profile,{},baseline),b=fixture(profile),knees=roles(b.frame,'xiehe-courtyard-knee');
  assert.equal(knees.length,profile==='xiehe'?6:0);
  assert.equal(hash(physical(a.kit)),hash(physical(b.kit)));
  assert.equal(hash(meshRows(a.frame)),hash(meshRows(b.frame,isKnee)));
  assert.deepEqual(a.frame.userData.structure,b.frame.userData.structure);
  for(const knee of knees){assert.equal(knee.userData.side,'rear');assert.equal(knee.userData.visualAcceptance,'VERIFY_PENDING');assert.equal(knee.userData.objectId,'FC-9E59B14A3C');assert.equal(knee.position.z,b.g.depth/2);}
 }
 const fake={profile:'xihe'};assert.deepEqual(buildXieheCourtyardKnees(null,null,fake),[]);
});

test('production-merged component retains six visible knees and real controller walk/jump clearance',t=>{
 const f=fixture('xiehe'),scene=f.kit.finish(),W={scene,cm:f.cm,THREE};scene.updateMatrixWorld(true);
 const result=assertXieheCourtyardKneesInWorld(W);assert.equal(result.probes.length,6);
 const report={scope:'Actual production-merged SideGate component, not full-world or browser acceptance',merged:result,jumps:[],routes:[]};
 for(const fps of [10,60]){const jump=replayXieheCourtyardJumps(t,W,{fps});assert.equal(jump.rows.length,6);report.jumps.push(jump);}
 for(const p of f.g.portals)for(const fps of [10,60])for(const backward of [false,true]){
  const points=[-25,-6,0,6,25].map(z=>f.g.toWorld(p.centerX,z));
  const result=replayTerrace(t,W,points,{fps,sprint:true,backward,recordFrames:true});
  assert.equal(result.arrived,true);assert.ok(result.maxFeet>=f.g.platformY);assert.ok(Math.abs(result.end[2])<1e-8);
  for(const row of result.frames){assert.equal(f.cm.checkCollision(new THREE.Vector3(row.x,row.ground+1.7,row.z),.5),false);}
  report.routes.push({bay:p.bay,fps,backward,sprint:true,arrived:result.arrived,frames:result.frames.length,maxFeet:result.maxFeet,endFeet:result.end[2]});
 }
 if(process.env.XIEHE_EVIDENCE_DIR){mkdirSync(process.env.XIEHE_EVIDENCE_DIR,{recursive:true});writeFileSync(`${process.env.XIEHE_EVIDENCE_DIR}/controller.json`,JSON.stringify(report,null,2)+'\n');}
});

test('source-fitted scalloped solids meet exact column facet and beam underside without overlap or contact skins',()=>{
 const f=fixture('xiehe'),knees=roles(f.frame,'xiehe-courtyard-knee'),g=f.g;
 for(const knee of knees){
  const {direction,columnX}=knee.userData;const p=knee.geometry.attributes.position;
  const column=roles(f.frame,'gate-column').find(c=>Math.abs(c.position.x-columnX)<1e-8&&c.position.z===g.depth/2);
  assert.ok(column);geometryHealth(knee);
  const n=p.count;
  const normal=knee.geometry.attributes.normal,seen=new Set();
  for(let i=0;i<n;i++){
   const x=p.getX(i),y=p.getY(i),z=p.getZ(i),surface=Math.sin(2*Math.PI/5)*g.radius*(1+.04*(.65-y)/g.columnH);
   assert.ok(x>=surface-2e-7);assert.ok(y<=1e-8);assert.ok(y>=-fit.drop-2e-7);assert.ok(Math.abs(z)<=fit.depth/2+1e-8);
   if(Math.abs(x-surface)<2e-7){
    const worldY=knee.position.y+y,origin=new THREE.Vector3(columnX+direction*.8,worldY,g.depth/2+direction*z).applyMatrix4(f.frame.matrixWorld);
    const rayDirection=new THREE.Vector3(-direction,0,0).transformDirection(f.frame.matrixWorld);
    const hit=new THREE.Raycaster(origin,rayDirection,0,1).intersectObject(column)[0];
    assert.ok(hit);const local=f.frame.worldToLocal(hit.point.clone());assert.ok(Math.abs(local.x-(columnX+direction*x))<3e-7,'root vertices touch actual tapered decagon facet');
   }
  }
  for(let i=0;i<n;i+=3){
   const vertices=[0,1,2].map(j=>new THREE.Vector3().fromBufferAttribute(p,i+j)),face=new THREE.Vector3().subVectors(vertices[1],vertices[0]).cross(new THREE.Vector3().subVectors(vertices[2],vertices[0])).normalize();
   assert.ok(face.dot(new THREE.Vector3().fromBufferAttribute(normal,i))>.99999,'consistent outward winding and finite normals');
   const key=vertices.map(v=>v.toArray().join(',')).sort().join('|');assert.ok(!seen.has(key),'no duplicate coincident triangles');seen.add(key);
   const ys=[0,1,2].map(j=>p.getY(i+j));assert.ok(!ys.every(y=>Math.abs(y)<1e-8),'no duplicate beam-contact skin');
   const root=[0,1,2].map(j=>Math.abs(p.getX(i+j)-Math.sin(2*Math.PI/5)*g.radius*(1+.04*(.65-p.getY(i+j))/g.columnH))<2e-7);assert.ok(!root.every(Boolean),'no duplicate column-contact skin');
  }
  assert.ok(Math.abs(knee.position.y-(g.platformY+g.columnH-.65))<1e-8);
 }
 const turns=fit.outline.map((a,i,all)=>{const b=all[(i+1)%all.length],c=all[(i+2)%all.length];return (b[0]-a[0])*(c[1]-b[1])-(b[1]-a[1])*(c[0]-b[0]);});
 assert.ok(turns.filter(t=>t>1e-5).length>=4&&turns.filter(t=>t< -1e-5).length>=4,'irregular convex and concave outline, not a wedge');
 assert.equal(triangles(f.frame)-triangles(fixture('xiehe',{},baseline).frame),6*fit.trianglesPerKnee);
});

test('fresh knees keep isolated geometry and production merge releases every source once',()=>{
 const a=fixture('xiehe'),b=fixture('xiehe'),owned=new Map(roles(a.frame,'xiehe-courtyard-knee').map(o=>[o.geometry,0]));
 assert.ok(roles(b.frame,'xiehe-courtyard-knee').every(o=>!owned.has(o.geometry)));
 for(const geo of owned.keys())geo.addEventListener('dispose',()=>owned.set(geo,owned.get(geo)+1));
 let materialDisposals=0;const material=roles(a.frame,'xiehe-courtyard-knee')[0].material;material.addEventListener('dispose',()=>materialDisposals++);
 const merged=a.kit.finish();for(const count of owned.values())assert.equal(count,1);
 a.kit.dispose(merged);assert.equal(materialDisposals,0,'shared palette material remains library-owned');
 geometryHealth(b.frame);
});
