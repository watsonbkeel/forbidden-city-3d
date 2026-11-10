import test from 'node:test';
import {T,assert,makeFixture,query,from,to,Environment,realTextureLibrary} from './supplement.fixture.mjs';
import {xiananGroundCovered} from '../../src/controls/XiananGroundWitness.js';
for(const [name,change] of [
 ['source layer',f=>f.sources[1].mesh.layers.set(1)],
 ['finished target bucket layer',f=>f.merged.children.find(m=>m.name===f.finishedBoxes[1].matches[0].mesh).layers.set(1)],
 ['finished group matrixAutoUpdate',f=>f.merged.matrixAutoUpdate=false],
 ['finished group matrixWorldAutoUpdate',f=>f.merged.matrixWorldAutoUpdate=false],
 ['finished group layer',f=>f.merged.layers.set(1)],
 ['finished actual same-world parent change without event',f=>{const parent=new T.Group();f.scene.add(parent);f.scene.children.splice(f.scene.children.indexOf(f.merged),1);f.merged.parent=parent;parent.children.push(f.merged)}],
])test('supplement visibility/matrix: '+name,()=>{const f=makeFixture();try{assert.equal(query(f)?.status,'valid');change(f);assert.equal(query(f)?.status,'invalid')}finally{f.dispose()}});
test('supplement real camera: excluded target layer blocks view without destroying source identity',()=>{const f=makeFixture();try{const camera=new T.PerspectiveCamera();assert.equal(query(f,camera)?.status,'valid');camera.layers.set(1);assert.equal(query(f,camera)?.status,'invalid');camera.layers.set(0);assert.equal(query(f,camera)?.status,'valid')}finally{f.dispose()}});
test('supplement real camera: excluded ground layer cannot authorize world0',()=>{const f=makeFixture();try{const camera=new T.PerspectiveCamera();assert.equal(xiananGroundCovered(f.scene,from,to,.5,camera),true);camera.layers.set(1);assert.equal(xiananGroundCovered(f.scene,from,to,.5,camera),false)}finally{f.dispose()}});
test('supplement ground layer mutation invalidates ground certificate',()=>{const f=makeFixture();try{f.ground.layers.set(1);assert.equal(xiananGroundCovered(f.scene,from,to,.5),false)}finally{f.dispose()}});
for(const [name,transform] of [
 ['translated up',scene=>scene.position.y=10],
 ['translated sideways',scene=>scene.position.x=100],
 ['rotated',scene=>scene.rotation.z=.1],
 ['scaled',scene=>scene.scale.x=2],
])test('supplement world0: ancestor '+name+' BEFORE birth cannot use localXY as worldXZ',()=>{
 const scene=new T.Scene(),lib=realTextureLibrary(),environment=new Environment(scene,null,lib);try{transform(scene);environment.setupGround();assert.equal(xiananGroundCovered(scene,from,to,.5),false)}finally{environment.dispose();lib.dispose()}
});
test('supplement world0 control: identity ancestor ground remains supported',()=>{const f=makeFixture();try{assert.equal(xiananGroundCovered(f.scene,from,to,.5),true)}finally{f.dispose()}});
