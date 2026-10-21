import test from 'node:test';
import assert from 'node:assert/strict';
import{readFileSync,readdirSync}from'node:fs';
import{ZoneBase}from'../src/scene/zones/ZoneBase.js';
import{FlightEnvelope}from'../src/scene/flight/FlightEnvelope.js';
import{library}from'./lib/inner-palace-fixture.mjs';
function finite(root,label){let meshes=0;root.updateMatrixWorld(true);root.traverse(o=>{
 for(const[k,v]of Object.entries({position:o.position.toArray(),quaternion:o.quaternion.toArray(),scale:o.scale.toArray(),world:o.matrixWorld.toArray()}))assert.ok(v.every(Number.isFinite),`${label}/${o.name}/${k}`);
 if(!o.isMesh)return;meshes++;for(const[k,a]of Object.entries(o.geometry.attributes))assert.ok([...a.array].every(Number.isFinite),`${label}/${o.name}/${k}`);
});assert.ok(meshes>0,label+' has actual geometry');}
for(const file of readdirSync(new URL('../data/zones/',import.meta.url)).filter(f=>f.endsWith('.json')))test(`R40 ${file} entire raw and merged zone is finite before actual flight envelope construction`,()=>{
 const data=JSON.parse(readFileSync(new URL('../data/zones/'+file,import.meta.url))),b=new ZoneBase(library(),data),original=b.kit.finish.bind(b.kit);let checked=false;
 b.kit.finish=(...args)=>{finite(b.kit.root,file+' raw');checked=true;return original(...args);};const result=b.build();assert.equal(checked,true);finite(result.group,file+' merged');const envelope=new FlightEnvelope();assert.doesNotThrow(()=>envelope.addRoot(result.group));
 for(const item of data.items.filter(i=>i.kind==='hall')){assert.ok(Number.isFinite(item.x)&&Number.isFinite(item.z));const points=[[0,0]];if(Number.isFinite(item.w)&&Number.isFinite(item.d))points.push([-item.w/2,0],[item.w/2,0],[0,-item.d/2],[0,item.d/2]);for(const[dx,dz]of points){const sample=envelope.sample(item.x+dx,item.z+dz);assert.ok(Number.isFinite(sample.height));}}
 b.dispose();
});
