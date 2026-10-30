import test from'node:test';import assert from'node:assert/strict';import*as T from'three';import{make}from'./fixture.mjs';import{applyYikunInnerSouthWindows,finishYikunInnerSouthWindows}from'../../../src/scene/palace/special/YikunInnerSouthWindows.js';import{meshList,meshRecord,sha}from'../../lib/r54-changchun-capture.mjs';
const sources=a=>a.f.children.filter(m=>m.isMesh&&m.material===a.kit.lib.material('lattice_doors')&&m.position.z===-6.9&&Math.abs(Math.abs(m.position.x)-27.1/5)<1e-9);
for(const[label,mutate]of[
 ['shader override',a=>sources(a)[0].material.onBeforeCompile=()=>{}],
 ['normal map replaced',a=>sources(a)[0].material.normalMap=new T.Texture()],
 ['tint drift',a=>sources(a)[0].material.color.setHex(0xff0000)],
 ['map replaced',a=>sources(a)[0].material.map=new T.Texture()],
 ['displacement source',a=>{sources(a)[0].material.displacementMap=new T.Texture();sources(a)[0].material.displacementScale=50;}],
 ['vertex',a=>sources(a)[1].geometry.attributes.position.array[0]+=.01],
 ['index',a=>sources(a)[1].geometry.setIndex([0,1,2])],
 ['morph',a=>sources(a)[1].geometry.morphAttributes.position=[sources(a)[1].geometry.attributes.position.clone()]],
 ['draw range',a=>sources(a)[1].geometry.setDrawRange(0,3)],
 ['unexpected metadata',a=>sources(a)[1].userData.level=1],
 ['source photo',a=>sources(a)[1].userData.source='https://img.dpm.org.cn/Uploads/Picture/dc/1537[1024].jpg'],
 ['source pose',a=>sources(a)[1].rotation.y=.01],
 ['eventful source',a=>sources(a)[1].addEventListener('removed',()=>{throw Error('must not call')})],
 ['eventful geometry',a=>sources(a)[1].geometry.addEventListener('dispose',()=>{throw Error('must not call')})],
 ['duplicate source',a=>a.f.add(sources(a)[0].clone())],
 ['Points geometry',a=>a.f.add(new T.Points(sources(a)[0].geometry,sources(a)[0].material))],
 ['Line geometry',a=>a.f.add(new T.Line(sources(a)[0].geometry,sources(a)[0].material))],
 ['morph borrowed buffer',a=>{const g=new T.BoxGeometry(1,1,1);g.morphAttributes.position=[new T.BufferAttribute(new Float32Array(sources(a)[0].geometry.attributes.position.array.buffer),3)];a.f.add(new T.Mesh(g,sources(a)[0].material))}],
 ['interleaved borrowed buffer',a=>{const g=new T.BufferGeometry(),buffer=new T.InterleavedBuffer(new Float32Array(sources(a)[0].geometry.attributes.position.array.buffer),3);g.setAttribute('position',new T.InterleavedBufferAttribute(buffer,3,0));a.f.add(new T.Points(g,sources(a)[0].material))}],
 ['borrowed geometry',a=>{const m=new T.Mesh(sources(a)[0].geometry,sources(a)[0].material);a.f.add(m)}],
 ['borrowed buffer',a=>{const m=sources(a)[0].clone();m.name='unrelated-borrowed-buffer';m.geometry=m.geometry.clone();m.geometry.attributes.position.array=new Float32Array(sources(a)[0].geometry.attributes.position.array.buffer);a.f.add(m)}],
 ['frozen metadata',a=>Object.freeze(a.f.userData)],
 ['wrong host profile',a=>a.f.userData.structure.profile='yikun-rear'],
 ['wrong retained bay count',a=>a.f.userData.structure.retainedEnvelope.bays=6]
])test('reject '+label+' without touching any source or shared arrays',()=>{const a=make(true);try{mutate(a);a.f.updateWorldMatrix(true,true);const children=[...a.f.children],records=sha(meshList(a.f).map(meshRecord)),owned=[...a.kit.owned],physics=sha([a.kit.colliders,a.kit.walkables,a.kit.rooms,a.kit.regions]);assert.throws(()=>applyYikunInnerSouthWindows(a.kit,a.f),/Yikun/);assert.deepEqual(a.f.children,children);assert.equal(sha(meshList(a.f).map(meshRecord)),records);assert.deepEqual(a.kit.owned,owned);assert.equal(sha([a.kit.colliders,a.kit.walkables,a.kit.rooms,a.kit.regions]),physics);}finally{for(const m of sources(a)){m._listeners={};m.geometry._listeners={};}a.dispose()}});
test('reject repeated finalizer; no-source zone does nothing',()=>{const a=make();try{assert.throws(()=>finishYikunInnerSouthWindows(a.kit),/Yikun/);assert.equal(finishYikunInnerSouthWindows({root:new T.Group()}),false);}finally{a.dispose()}});
test('late allocation failure leaves original windows intact and disposes all private allocations once',()=>{const a=make(true),originalAdd=T.Group.prototype.add,originalDispose=T.BufferGeometry.prototype.dispose,originalMat=T.Material.prototype.dispose,disposed=[],materials=[];let n=0;try{const children=[...a.f.children],owned=[...a.kit.owned],orig=new Set(sources(a).map(m=>m.geometry));T.BufferGeometry.prototype.dispose=function(){disposed.push(this);return originalDispose.call(this)};T.Material.prototype.dispose=function(){materials.push(this);return originalMat.call(this)};T.Group.prototype.add=function(...args){if(this.name.startsWith('yikun-south-window-bay-')&&++n===8)throw Error('injected late staging failure');return originalAdd.apply(this,args)};assert.throws(()=>applyYikunInnerSouthWindows(a.kit,a.f),/injected/);assert.ok(n===8);assert.deepEqual(a.f.children,children);assert.deepEqual(a.kit.owned,owned);assert.ok(disposed.length>=10);assert.equal(new Set(disposed).size,disposed.length);assert.ok(disposed.every(g=>!orig.has(g)));assert.equal(materials.length,6);assert.equal(new Set(materials).size,6);assert.equal(a.f.userData.yikunInnerSouthWindows,undefined);}finally{T.Group.prototype.add=originalAdd;T.BufferGeometry.prototype.dispose=originalDispose;T.Material.prototype.dispose=originalMat;a.dispose()}});
