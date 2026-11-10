// Diagnostic-only indexed PNGs with a proved byte bound; no runtime changes.
import test from 'node:test';import assert from 'node:assert/strict';import fs from 'node:fs';import path from 'node:path';import {createRequire} from 'node:module';import {fileURLToPath,pathToFileURL} from 'node:url';import {inflateSync} from 'node:zlib';
const repo=process.env.R255_REPO??fileURLToPath(new URL('../../',import.meta.url)),destination=process.env.R255_DIAGNOSTIC_DIR;
const require=createRequire(pathToFileURL(repo+'/package.json')),T=await import(pathToFileURL(repo+'/node_modules/three/build/three.module.js')),{createCanvas}=require('@napi-rs/canvas');
const {createDafotangWeituo}=await import(pathToFileURL(repo+'/src/scene/palace/special/DafotangWeituo.js'));
const crcTable=Uint32Array.from({length:256},(_,n)=>{let c=n;for(let k=0;k<8;k++)c=(c&1)?0xedb88320^(c>>>1):c>>>1;return c>>>0;});
function chunk(type,data){const t=Buffer.from(type),out=Buffer.alloc(12+data.length);out.writeUInt32BE(data.length,0);t.copy(out,4);data.copy(out,8);let c=0xffffffff;for(const b of t)c=crcTable[(c^b)&255]^(c>>>8);for(const b of data)c=crcTable[(c^b)&255]^(c>>>8);out.writeUInt32BE((c^0xffffffff)>>>0,out.length-4);return out;}
function boundedPNG(canvas){
 const w=canvas.width,h=canvas.height;assert.ok((w===120&&h===180)||(w===80&&h===80));
 const rgba=canvas.getContext('2d').getImageData(0,0,w,h).data,raw=Buffer.alloc((w+1)*h);
 for(let y=0;y<h;y++)for(let x=0;x<w;x++){const i=(y*w+x)*4;assert.equal(rgba[i+3],255);raw[y*(w+1)+1+x]=(rgba[i]>>5)<<5|(rgba[i+1]>>5)<<2|(rgba[i+2]>>6);}
 // One BFINAL=1/BTYPE=00 stored block. 2-byte zlib header + 5-byte block
 // header + raw data + 4-byte Adler32. No guessed compression ratio.
 assert.ok(raw.length<65536);const z=Buffer.alloc(raw.length+11);z[0]=0x78;z[1]=0x01;z[2]=1;z.writeUInt16LE(raw.length,3);z.writeUInt16LE((~raw.length)&65535,5);raw.copy(z,7);let a=1,b=0;for(const n of raw){a=(a+n)%65521;b=(b+a)%65521;}z.writeUInt32BE(((b<<16)|a)>>>0,z.length-4);assert.ok(inflateSync(z).equals(raw));
 const ihdr=Buffer.alloc(13);ihdr.writeUInt32BE(w,0);ihdr.writeUInt32BE(h,4);ihdr[8]=8;ihdr[9]=3;
 const palette=Buffer.alloc(768);for(let n=0;n<256;n++){palette[n*3]=Math.round((n>>5)*255/7);palette[n*3+1]=Math.round(((n>>2)&7)*255/7);palette[n*3+2]=(n&3)*85;}
 const result=Buffer.concat([Buffer.from([137,80,78,71,13,10,26,10]),chunk('IHDR',ihdr),chunk('PLTE',palette),chunk('IDAT',z),chunk('IEND',Buffer.alloc(0))]);
 assert.equal(result.length,(w+1)*h+848);assert.equal(result.readUInt32BE(result.length-4),0xae426082);return result;
}
test('R255 bounded RGB332 diagnostics preserve authored projection and fixed byte limits',{skip:!destination},()=>{
 assert.ok(path.isAbsolute(destination)&&fs.statSync(destination).isDirectory());
 const materials={body:new T.MeshStandardMaterial({color:0x716b61}),trim:new T.MeshStandardMaterial({color:0x92887a})},out=createDafotangWeituo({materials}),views=[];
 const save=(name,canvas,max)=>{const bytes=boundedPNG(canvas);assert.ok(bytes.length<=max);fs.writeFileSync(path.join(destination,name),bytes,{flag:'wx'});views.push({file:name,bytes:bytes.length,width:canvas.width,height:canvas.height});};
 try{
  const triangles=[];for(const m of out.meshes){const p=m.geometry.attributes.position,ix=m.geometry.index;for(let i=0;i<ix.count;i+=3){const v=[0,1,2].map(k=>new T.Vector3().fromBufferAttribute(p,ix.getX(i+k)));triangles.push({v,n:new T.Triangle(...v).getNormal(new T.Vector3()),colour:m.material.color});}}
  assert.equal(triangles.length,3904);const light=new T.Vector3(-.45,.8,-.55).normalize();
  for(const[name,position]of[['front',[0,1.14,-6]],['side',[6,1.14,0]]]){
   const canvas=createCanvas(120,180),ctx=canvas.getContext('2d');ctx.fillStyle='#eeeae2';ctx.fillRect(0,0,120,180);
   const camera=new T.OrthographicCamera(-.91,.91,1.215,-1.215,.01,30);camera.position.set(...position);camera.lookAt(0,1.085,0);camera.updateMatrixWorld(true);const draw=[];
   for(const t of triangles){const centre=t.v[0].clone().add(t.v[1]).add(t.v[2]).multiplyScalar(1/3);if(t.n.dot(camera.position.clone().sub(centre))<=0)continue;draw.push({points:t.v.map(v=>v.clone().project(camera)),z:centre.applyMatrix4(camera.matrixWorldInverse).z,c:t.colour.clone().multiplyScalar(.58+.42*Math.max(0,t.n.dot(light))).convertLinearToSRGB()});}
   draw.sort((a,b)=>a.z-b.z);for(const t of draw){ctx.beginPath();t.points.forEach((p,i)=>(i?ctx.lineTo:ctx.moveTo).call(ctx,(p.x+1)*60,10+(1-p.y)*80));ctx.closePath();ctx.fillStyle=`rgb(${Math.round(t.c.r*255)},${Math.round(t.c.g*255)},${Math.round(t.c.b*255)})`;ctx.fill();}
   save('weituo-'+name+'-bounded.png',canvas,24*1024);
  }
  const canvas=createCanvas(80,80),ctx=canvas.getContext('2d');ctx.fillStyle='#eeeae2';ctx.fillRect(0,0,80,80);ctx.fillStyle='#b9b09c';ctx.fillRect(6,6,68,68);ctx.fillStyle='#48566b';
  for(const side of[-1,1]){const m=out.meshes.find(m=>m.userData.dafotangWeituoRole==='boot-'+side),p=m.geometry.attributes.position;ctx.beginPath();for(let i=0;i<6;i++){const v=new T.Vector3().fromBufferAttribute(p,i).applyAxisAngle(new T.Vector3(0,1,0),-Math.PI/4);assert.ok(Math.abs(v.x)<.405&&Math.abs(v.z)<.405);(i?ctx.lineTo:ctx.moveTo).call(ctx,40+80*v.x,40+80*v.z);}ctx.closePath();ctx.fill();}
  save('weituo-soles-bounded.png',canvas,8*1024);assert.equal(views.reduce((s,v)=>s+v.bytes,0),52584);
  const report={kind:'LOW_RESOLUTION_RGB332_CPU_DIAGNOSTIC_NOT_GPU_ACCEPTANCE',space:'AUTHORED_COMPONENT_BEFORE_HOST_YAW',images:views,frontSideViewport:[120,160],verticalPadding:10,originalCameraUnchanged:true,originalTrianglesUnchanged:true,fitSoleYaw:-Math.PI/4,fitSoleTop:[.85,.85],limits:['120x180 diagnostic colour quantization','no GPU lighting or host scene','not artifact colour/precise historic proportions']};const raw=JSON.stringify(report);assert.ok(Buffer.byteLength(raw)<=4096);fs.writeFileSync(path.join(destination,'BOUNDED-VIEWS.json'),raw,{flag:'wx'});
  console.log('R255_BOUNDED_VIEWS '+JSON.stringify({images:views,totalPNGBytes:52584}));
 }finally{out.dispose();Object.values(materials).forEach(m=>m.dispose());}
});
