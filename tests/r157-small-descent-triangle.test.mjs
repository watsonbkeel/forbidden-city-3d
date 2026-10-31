import {groundControllerProbe} from './lib/r158-ground-controller-probe.mjs';
import test from 'node:test';import assert from 'node:assert/strict';import * as THREE from 'three';
import {FirstPersonControls} from '../src/controls/FirstPerson.js';
import {triangleBodyIntersects} from '../src/utils/TriangleSupport.js';
import {fixture} from './lib/r58-court-facade-fixture.mjs';
const body=c=>new THREE.Box3(new THREE.Vector3(c.camera.position.x-.5,c.feetY+1e-6,c.camera.position.z-.5),new THREE.Vector3(c.camera.position.x+.5,c.feetY+1.7,c.camera.position.z+.5));
test('Grounded small descent cannot lower body through a real pointed rail after foot disk leaves apex',()=>{
 const h=fixture('xiehe'),probe=groundControllerProbe();try{
 const c=probe.make(FirstPersonControls,h.cm,{feetY:3.7799999713897705,groundY:3.7799999713897705,airborne:false,verticalVelocity:0,onSupport:true});c.camera.position.set(-112.47,c.feetY+1.7,-291.6160602794143);
 const rails=h.cm.colliders.filter(c=>c.triangleSupport?.id.startsWith('xiehe-east-rail:'));
 assert.equal(rails.some(r=>triangleBodyIntersects(r.triangleSupport,body(c))),false,'initial pose clear');
 assert.ok(Math.abs(h.cm.supportHeight(c.camera.position.x,c.camera.position.z,c.feetY+.05)-3.57)<1e-6,'old adjacent return support triggers genuine small drop');
 c.updateGround(.1);
 assert.equal(rails.some(r=>triangleBodyIntersects(r.triangleSupport,body(c))),false,'continuous downward body must remain clear');
 assert.equal(c.airborne,true,'body contact is not foot standing or jump reset');
 }finally{try{probe.dispose();}finally{h.kit.dispose(h.kit.root);h.lib.dispose();}}
});

const {createR157FrozenSourceReader}=await import('./lib/r157-frozen-source-reader.mjs');
let oldSource=createR157FrozenSourceReader(process.cwd(),'4d614c22a8318027e51e149e435a3198f78ca4e5').read('src/controls/FirstPerson.js');
const oldURL=new URL('../src/controls/FirstPerson.js',import.meta.url);
oldSource=oldSource.replace(/from\s+(['"])([^'"]+)\1/g,(_,q,id)=>`from ${q}${id.startsWith('.')?new URL(id,oldURL).href:import.meta.resolve(id)}${q}`);
const {FirstPersonControls:ParentControls}=await import('data:text/javascript;base64,'+Buffer.from(oldSource).toString('base64'));
const {CollisionManager}=await import('../src/utils/Collision.js');
const {createTriangleTemplate,triangleInstance}=await import('../src/utils/TriangleSupport.js');
for(const fps of[10,60])for(const start of[2.4,2.62,2.8,3.1,3.4])for(const distantTriangle of[false,true])test(`Unchanged ordinary support trajectory ${fps} Hz feet ${start} distant triangle ${distantTriangle}`,()=>{
 const cm=new CollisionManager();cm.rivers=[];cm.addColliders([new THREE.Box3(new THREE.Vector3(-2,0,-2),new THREE.Vector3(2,2.62,2))]);
 if(distantTriangle){const geometry=new THREE.BoxGeometry(1,1,1),owner=triangleInstance(createTriangleTemplate(geometry),[8,1,8],'distant'),box=owner.box.clone();box.triangleSupport=owner;cm.addColliders([box]);geometry.dispose();}
 const probe=groundControllerProbe(),make=Class=>{const c=probe.make(Class,cm,{feetY:start,groundY:start,airborne:false,verticalVelocity:0,onSupport:true});c.camera.position.set(0,start+1.7,0);return c;};
 try{const a=make(ParentControls),b=make(FirstPersonControls),state=c=>[c.feetY,c.groundY,c.airborne,c.verticalVelocity,c.onSupport,c._landed,c.camera.position.toArray()];
 for(let i=0;i<fps*2;i++){a.updateGround(1/fps);b.updateGround(1/fps);assert.deepEqual(state(b),state(a),`frame ${i}`);}
 }finally{probe.dispose();}
});
