import test from'node:test';import assert from'node:assert/strict';import{readFileSync}from'node:fs';import*as T from'three';
import'./lib/inner-palace-fixture.mjs';import{realTextureLibrary}from'./lib/r48-real-texture-library.mjs';import{ZoneBase}from'../src/scene/zones/ZoneBase.js';
for(const[zone,name]of[['outer-east','文华门'],['outer-west','武英门']])test(name+': exact pair is over inset door, not outer eave',()=>{
 const d=JSON.parse(readFileSync(new URL('../data/zones/'+zone+'.json',import.meta.url))),lib=realTextureLibrary(),z=new ZoneBase(lib,d);
 try{z.buildGate(d.items.find(i=>i.name===name));const p=z.kit.plaques.find(p=>p.text===name);assert.ok(p.mesh.position.z>-.5&&p.mesh.position.z<-.4);assert.ok(p.frame.position.y-(p.frame.geometry.parameters.height/2)>=.8+4.6+.05);
 z.kit.root.updateMatrixWorld(true);const bounds=new T.Box3().setFromObject(p.frame).expandByScalar(-.002),hits=[];
 p.mesh.parent.traverse(m=>{if(!m.isMesh||m===p.mesh||m===p.frame)return;const a=m.geometry.attributes.position,idx=m.geometry.index;for(let k=0;k<(idx?.count??a.count);k+=3){const v=[0,1,2].map(j=>new T.Vector3().fromBufferAttribute(a,idx?idx.getX(k+j):k+j).applyMatrix4(m.matrixWorld));if(bounds.intersectsTriangle(new T.Triangle(...v))){hits.push(m.name||m.material?.name);break;}}});assert.deepEqual(hits,[]);
 }finally{z.dispose();lib.dispose();}
});
