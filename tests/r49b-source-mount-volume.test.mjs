import test from'node:test';import assert from'node:assert/strict';import{readFileSync}from'node:fs';import*as T from'three';
import'./lib/inner-palace-fixture.mjs';import{realTextureLibrary}from'./lib/r48-real-texture-library.mjs';import{ZoneBase}from'../src/scene/zones/ZoneBase.js';
const cases=[['west-six','养心殿'],['outer-east','文渊阁'],['outer-west','咸若馆'],['outer-west','寿康宫'],['ningshou','皇极殿'],['outer-west','慈宁宫'],...['古华轩','遂初堂','畅音阁','阅是楼','颐和轩','倦勤斋','宁寿宫','乐寿堂','梵华楼'].map(n=>['ningshou',n])];
for(const[zone,name]of cases)test(name+': complete registered frame outside actual structural triangles',()=>{
 const d=JSON.parse(readFileSync(new URL('../data/zones/'+zone+'.json',import.meta.url))),lib=realTextureLibrary(),z=new ZoneBase(lib,d);
 try{const r=z.buildHall(d.items.find(i=>i.name===name)),p=z.kit.plaques.find(p=>p.text===name);z.kit.root.updateMatrixWorld(true);
 const bounds=new T.Box3().setFromObject(p.frame).expandByScalar(-.002),hits=new Set();
 r.f.traverse(m=>{if(!m.isMesh||m===p.frame||m===p.mesh)return;const a=m.geometry.attributes.position,idx=m.geometry.index;if(!a)return;
 for(let k=0;k<(idx?.count??a.count);k+=3){const v=[0,1,2].map(j=>new T.Vector3().fromBufferAttribute(a,idx?idx.getX(k+j):k+j).applyMatrix4(m.matrixWorld));if(bounds.intersectsTriangle(new T.Triangle(...v))){hits.add(m.name||m.material?.name||'unnamed');break;}}});
 if(name==='养心殿'){assert.ok(p.frame.position.y-p.frame.geometry.parameters.height*p.frame.scale.y/2>=6.064+.07);assert.equal(p.mesh.geometry.parameters.height*p.mesh.scale.y,2.2);}
 assert.deepEqual([...hits],[],'not merely six rays or text visibility');
 }finally{z.dispose();lib.dispose();}
});
