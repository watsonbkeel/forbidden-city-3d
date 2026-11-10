// Small CPU projections of the exact authored component, never GPU/World views.
import test from 'node:test';import assert from 'node:assert/strict';import fs from 'node:fs';import {createRequire} from 'node:module';import {pathToFileURL,fileURLToPath} from 'node:url';import path from 'node:path';
const repo=process.env.R255_REPO??fileURLToPath(new URL('../../',import.meta.url));
const writeViews=process.env.R255_WRITE_CPU_VIEWS==='1',viewDirectory=process.env.R255_CPU_VIEW_DIR;
if(writeViews)assert.ok(viewDirectory&&path.isAbsolute(viewDirectory)&&fs.statSync(viewDirectory).isDirectory(),'Explicit absolute existing CPU view directory required');const require=createRequire(pathToFileURL(repo+'/package.json')),T=await import(pathToFileURL(repo+'/node_modules/three/build/three.module.js'));
const {createCanvas}=require('@napi-rs/canvas');const {createDafotangWeituo}=await import(pathToFileURL(repo+'/src/scene/palace/special/DafotangWeituo.js'));
function save(name,canvas,cap){const bytes=canvas.toBuffer('image/png');assert.ok(bytes.length<=cap,`${name} output exceeds cap`);fs.writeFileSync(path.join(viewDirectory,name),bytes,{flag:'wx'});return{file:name,bytes:bytes.length};}
test('R255 component has finite sourced silhouette, outward closed geometry and natural soles',()=>{
 const mats={body:new T.MeshStandardMaterial({color:0x716b61}),trim:new T.MeshStandardMaterial({color:0x92887a})},out=createDafotangWeituo({materials:mats});let materialDisposals=0;for(const m of Object.values(mats))m.addEventListener('dispose',()=>materialDisposals++);
 const released=new Map();for(const m of out.meshes)m.geometry.addEventListener('dispose',()=>released.set(m.geometry,(released.get(m.geometry)??0)+1));
 try{
  const bounds=new T.Box3().setFromObject(out.group);assert.ok(Math.abs(bounds.min.y)<1e-7&&Math.abs(bounds.max.y-2.17)<1e-6);assert.equal(out.meshes.length,33);
  const roles=out.meshes.map(m=>m.userData.dafotangWeituoRole);for(const name of['boot--1','boot-1','gathered-palms','breast-armour','waist-armour','pointed-helmet','high-ribbon-loop','shoulder-ribbon-loop'])assert.ok(roles.includes(name));
  assert.equal(out.metadata.weaponModeled,false);assert.equal(out.metadata.heightSource,'WANG_JIAPENG_2015_PRINTED_304');
  const triangles=[];let naturalMin=Infinity,naturalMax=-Infinity;
  for(const m of out.meshes){let signedVolume=0;const p=m.geometry.attributes.position,ix=m.geometry.index;assert.ok([...p.array].every(Number.isFinite));for(let i=0;i<ix.count;i+=3){const v=[0,1,2].map(k=>new T.Vector3().fromBufferAttribute(p,ix.getX(i+k))),t=new T.Triangle(...v);assert.ok(t.getArea()>1e-12);signedVolume+=v[0].dot(v[1].clone().cross(v[2]))/6;if(m.userData.dafotangWeituoRole.startsWith('boot-')&&Math.max(...v.map(q=>q.y))-Math.min(...v.map(q=>q.y))<1e-8){const n=t.getNormal(new T.Vector3());assert.ok(v[0].y<.01?n.y<-.99:n.y>.99,'boot horizontal faces point outward');}triangles.push({v,n:t.getNormal(new T.Vector3()),colour:m.material.color});}assert.ok(signedVolume>1e-8,`${m.name} signed closed volume must be outward`);if(m.userData.dafotangWeituoRole.startsWith('boot-')){naturalMin=Math.min(naturalMin,m.geometry.boundingBox.min.x);naturalMax=Math.max(naturalMax,m.geometry.boundingBox.max.x);}}
  assert.ok(Math.abs(naturalMax-naturalMin-.77)<1e-6);assert.equal(triangles.length,3904);
  const viewSummary=[];
  if(writeViews){
  const light=new T.Vector3(-.45,.8,-.55).normalize(),views=[];
  for(const[name,position]of[['front',[0,1.14,-6]],['side',[6,1.14,0]]]){
   const canvas=createCanvas(360,480),ctx=canvas.getContext('2d');ctx.fillStyle='#eeeae2';ctx.fillRect(0,0,360,480);
   const camera=new T.OrthographicCamera(-.91,.91,1.215,-1.215,.01,30);camera.position.set(...position);camera.lookAt(0,1.085,0);camera.updateMatrixWorld(true);const draw=[];
   for(const t of triangles){const centre=t.v[0].clone().add(t.v[1]).add(t.v[2]).multiplyScalar(1/3);if(t.n.dot(camera.position.clone().sub(centre))<=0)continue;const points=t.v.map(v=>v.clone().project(camera));draw.push({points,z:centre.applyMatrix4(camera.matrixWorldInverse).z,c:t.colour.clone().multiplyScalar(.58+.42*Math.max(0,t.n.dot(light))).convertLinearToSRGB()});}
   draw.sort((a,b)=>a.z-b.z);for(const t of draw){ctx.beginPath();t.points.forEach((p,i)=>(i?ctx.lineTo:ctx.moveTo).call(ctx,(p.x+1)*180,(1-p.y)*240));ctx.closePath();ctx.fillStyle=`rgb(${Math.round(t.c.r*255)},${Math.round(t.c.g*255)},${Math.round(t.c.b*255)})`;ctx.fill();}
   views.push({...save('weituo-'+name+'.png',canvas,24*1024),camera:position,coordinateSpace:'AUTHORED_COMPONENT_BEFORE_HOST_YAW'});
  }
  const canvas=createCanvas(200,200),ctx=canvas.getContext('2d');ctx.fillStyle='#eeeae2';ctx.fillRect(0,0,200,200);ctx.fillStyle='#b9b09c';ctx.fillRect(15,15,170,170);ctx.fillStyle='#48566b';
  const soles=[];for(const side of[-1,1]){const m=out.meshes.find(m=>m.userData.dafotangWeituoRole==='boot-'+side),p=m.geometry.attributes.position,points=[];for(let i=0;i<6;i++){const v=new T.Vector3().fromBufferAttribute(p,i).applyAxisAngle(new T.Vector3(0,1,0),-Math.PI/4);assert.ok(Math.abs(v.x)<.405&&Math.abs(v.z)<.405);points.push([v.x,v.z]);}ctx.beginPath();points.forEach(([x,z],i)=>(i?ctx.lineTo:ctx.moveTo).call(ctx,100+200*x,100+200*z));ctx.closePath();ctx.fill();soles.push(points);}
  views.push(save('weituo-soles.png',canvas,8*1024));assert.ok(views.reduce((n,v)=>n+v.bytes,0)<60*1024);
  const receipt={kind:'CPU_TRIANGLE_AUTHORING_VIEW_NOT_RUNTIME_GPU',triangles:triangles.length,meshes:out.meshes.length,views,soleTopSize:[.85,.85],soleYaw:-Math.PI/4,soles,naturalProjectedWidth:.77,unverified:['GPU lighting/shadows','historical exact proportions/angle/back/colour','whole-hall visual acceptance']};const raw=JSON.stringify(receipt);assert.ok(Buffer.byteLength(raw)<4096);fs.writeFileSync(path.join(viewDirectory,'COMPONENT-QA-VIEWS.json'),raw,{flag:'wx'});
  viewSummary.push(...views.map(v=>({file:v.file,bytes:v.bytes})));
  }
  out.dispose();out.dispose();assert.equal(released.size,out.meshes.length);assert.ok([...released.values()].every(n=>n===1));assert.equal(materialDisposals,0);
  console.log('R255_COMPONENT_QA '+JSON.stringify({meshes:out.meshes.length,triangles:triangles.length,views:viewSummary}));
 }finally{out.dispose();for(const m of Object.values(mats))m.dispose();}
});
