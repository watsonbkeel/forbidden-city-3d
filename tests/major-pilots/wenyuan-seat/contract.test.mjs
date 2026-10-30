import test from'node:test';import assert from'node:assert/strict';import*as T from'three';import{make}from'./fixture.mjs';import{applyWenyuanUpperSeat,finishWenyuanUpperSeat}from'../../../src/scene/palace/special/WenyuanUpperSeat.js';import{meshList,meshRecord,sha}from'../../lib/r54-changchun-capture.mjs';
const sources=a=>a.f.children.filter(m=>m.name.startsWith('wenyuan-third-floor-photo-bed-'));
for(const[label,mutate]of[
 ['vertex',a=>sources(a)[3].geometry.attributes.position.array[0]+=.01],
 ['index',a=>sources(a)[3].geometry.index.array[0]=2],
 ['morph',a=>sources(a)[3].geometry.morphAttributes.position=[sources(a)[3].geometry.attributes.position.clone()]],
 ['draw range',a=>sources(a)[3].geometry.setDrawRange(0,3)],
 ['source level',a=>sources(a)[3].userData.level=1],
 ['source photo',a=>sources(a)[3].userData.source='https://img.dpm.org.cn/Uploads/Picture/dc/1537[1024].jpg'],
 ['source pose',a=>sources(a)[3].rotation.y=.01],
 ['eventful source',a=>sources(a)[3].addEventListener('removed',()=>{throw Error('must not call')})],
 ['eventful geometry',a=>sources(a)[3].geometry.addEventListener('dispose',()=>{throw Error('must not call')})],
 ['duplicate source',a=>a.f.add(sources(a)[0].clone())],
 ['Points geometry',a=>a.f.add(new T.Points(sources(a)[0].geometry,sources(a)[0].material))],
 ['Line geometry',a=>a.f.add(new T.Line(sources(a)[0].geometry,sources(a)[0].material))],
 ['morph borrowed buffer',a=>{const g=new T.BoxGeometry(1,1,1);g.morphAttributes.position=[new T.BufferAttribute(new Float32Array(sources(a)[0].geometry.attributes.position.array.buffer),3)];a.f.add(new T.Mesh(g,sources(a)[0].material))}],
 ['interleaved borrowed buffer',a=>{const g=new T.BufferGeometry(),buffer=new T.InterleavedBuffer(new Float32Array(sources(a)[0].geometry.attributes.position.array.buffer),3);g.setAttribute('position',new T.InterleavedBufferAttribute(buffer,3,0));a.f.add(new T.Points(g,sources(a)[0].material))}],
 ['borrowed geometry',a=>{const m=new T.Mesh(sources(a)[0].geometry,sources(a)[0].material);a.f.add(m)}],
 ['borrowed buffer',a=>{const m=sources(a)[0].clone();m.name='unrelated-borrowed-buffer';m.geometry=m.geometry.clone();m.geometry.attributes.position.array=new Float32Array(sources(a)[0].geometry.attributes.position.array.buffer);a.f.add(m)}],
 ['frozen metadata',a=>Object.freeze(a.f.userData)],
 ['missing high frame',a=>delete a.f.userData.r143WenyuanFrame],
 ['navigation override',a=>a.f.userData.structure.navigation.upperDestinations='ENABLED']
])test('reject '+label+' without touching any source or shared arrays',()=>{const a=make(true);try{mutate(a);a.f.updateWorldMatrix(true,true);const children=[...a.f.children],records=sha(meshList(a.f).map(meshRecord)),owned=[...a.kit.owned],physics=sha([a.kit.colliders,a.kit.walkables,a.kit.rooms,a.kit.regions]);assert.throws(()=>applyWenyuanUpperSeat(a.kit,a.f),/Wenyuan/);assert.deepEqual(a.f.children,children);assert.equal(sha(meshList(a.f).map(meshRecord)),records);assert.deepEqual(a.kit.owned,owned);assert.equal(sha([a.kit.colliders,a.kit.walkables,a.kit.rooms,a.kit.regions]),physics);}finally{for(const m of sources(a)){m._listeners={};m.geometry._listeners={};}a.dispose()}});
test('reject repeated finalizer; no-source zone does nothing',()=>{const a=make();try{assert.throws(()=>finishWenyuanUpperSeat(a.kit),/Wenyuan/);assert.equal(finishWenyuanUpperSeat({root:new T.Group()}),false);}finally{a.dispose()}});
test('late allocation failure leaves original seat intact and disposes all private allocations once',()=>{const a=make(true),originalAdd=T.Group.prototype.add,originalDispose=T.BufferGeometry.prototype.dispose,originalMat=T.Material.prototype.dispose,disposed=[],materials=[];let n=0;try{const children=[...a.f.children],owned=[...a.kit.owned],orig=new Set(sources(a).map(m=>m.geometry));T.BufferGeometry.prototype.dispose=function(){disposed.push(this);return originalDispose.call(this)};T.Material.prototype.dispose=function(){materials.push(this);return originalMat.call(this)};T.Group.prototype.add=function(...args){if(this.name.startsWith('wenyuan-upper-seat-part-')&&++n===8)throw Error('injected late staging failure');return originalAdd.apply(this,args)};assert.throws(()=>applyWenyuanUpperSeat(a.kit,a.f),/injected/);assert.ok(n===8);assert.deepEqual(a.f.children,children);assert.deepEqual(a.kit.owned,owned);assert.ok(disposed.length>=12);assert.equal(new Set(disposed).size,disposed.length);assert.ok(disposed.every(g=>!orig.has(g)));assert.equal(materials.length,4);assert.equal(new Set(materials).size,4);assert.equal(a.f.userData.wenyuanUpperSeat,undefined);}finally{T.Group.prototype.add=originalAdd;T.BufferGeometry.prototype.dispose=originalDispose;T.Material.prototype.dispose=originalMat;a.dispose()}});
