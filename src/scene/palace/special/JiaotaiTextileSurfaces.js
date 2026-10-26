import * as THREE from 'three';

// Self-authored, non-semantic curves following the photographs' color/field
// relationship. Not an identification or reproduction of a historic weave.
export const JIAOTAI_TEXTILE_ART=Object.freeze({size:512,clothRepeatMetres:.64,status:'PHOTO_INSPIRED_SIMPLIFICATION_NOT_REPLICA',photographyDate:null});
const SIZE=512;
function raster(base){
 const data=new Uint8Array(SIZE*SIZE*4);
 for(let y=0;y<SIZE;y++)for(let x=0;x<SIZE;x++){
  const k=(y*SIZE+x)*4,thread=(x%4===0?1:0)-(y%4===0?1:0);
  for(let c=0;c<3;c++)data[k+c]=base[c]+thread;data[k+3]=255;
 }
 function line(a,b,color,width){
  const dx=b[0]-a[0],dy=b[1]-a[1],len=dx*dx+dy*dy,r=width/2;
  const x0=Math.max(0,Math.floor(Math.min(a[0],b[0])-r-1)),x1=Math.min(SIZE-1,Math.ceil(Math.max(a[0],b[0])+r+1));
  const y0=Math.max(0,Math.floor(Math.min(a[1],b[1])-r-1)),y1=Math.min(SIZE-1,Math.ceil(Math.max(a[1],b[1])+r+1));
  for(let y=y0;y<=y1;y++)for(let x=x0;x<=x1;x++){
   const t=len?Math.max(0,Math.min(1,((x+.5-a[0])*dx+(y+.5-a[1])*dy)/len)):0;
   const coverage=Math.max(0,Math.min(1,r+.5-Math.hypot(x+.5-a[0]-t*dx,y+.5-a[1]-t*dy)));
   if(!coverage)continue;const k=(y*SIZE+x)*4;for(let c=0;c<3;c++)data[k+c]=Math.round(data[k+c]*(1-coverage)+color[c]*coverage);
  }
 }
 function curve(a,b,c,d,color,width){let prev=a;for(let i=1;i<=24;i++){const t=i/24,u=1-t,p=[0,1].map(k=>u*u*u*a[k]+3*u*u*t*b[k]+3*u*t*t*c[k]+t*t*t*d[k]);line(prev,p,color,width);prev=p;}}
 const rect=(inset,color,width)=>{const lo=inset,hi=SIZE-inset;line([lo,lo],[hi,lo],color,width);line([hi,lo],[hi,hi],color,width);line([hi,hi],[lo,hi],color,width);line([lo,hi],[lo,lo],color,width);};
 return{data,line,curve,rect};
}
export function jiaotaiClothPixels(){
 const r=raster([205,179,82]),light=[225,210,157],soft=[216,197,126];
 for(let y=0;y<4;y++)for(let x=0;x<4;x++){
  const ox=x*128,oy=y*128,flip=(x+y)%2?-1:1,point=(a,b)=>[ox+64+(a-64)*flip,oy+b];
  r.curve(point(22,20),point(112,12),point(108,84),point(63,75),light,3.2);
  r.curve(point(63,75),point(22,65),point(20,118),point(104,108),light,3.2);
  r.curve(point(37,37),point(82,31),point(89,61),point(65,56),soft,2.1);
  r.curve(point(89,92),point(55,111),point(37,83),point(57,89),soft,2.1);
  r.curve(point(28,22),point(6,47),point(22,57),point(35,53),light,2.3);
 }
 return r.data;
}
export function jiaotaiRugPixels(){
 const r=raster([112,119,94]),blue=[57,88,105],pale=[157,157,116],muted=[86,111,113];
 for(const[inset,color,width]of[[9,blue,5],[18,pale,3],[27,blue,3],[49,blue,4],[59,pale,2]])r.rect(inset,color,width);
 for(let i=0;i<12;i++){
  const a=36+i*36;for(const y of[37,475])r.curve([a-9,y],[a-2,y-8],[a+6,y+8],[a+13,y],muted,2.5);
  for(const x of[37,475])r.curve([x,a-9],[x-8,a-2],[x+8,a+6],[x,a+13],muted,2.5);
 }
 // A bounded abstract inner field, not dragons, seals, writing or named icons.
 for(const sx of[-1,1])for(const sy of[-1,1]){
  const p=(x,y)=>[256+sx*x,256+sy*y];
  r.curve(p(0,25),p(105,-35),p(177,62),p(110,114),blue,5);
  r.curve(p(110,114),p(51,164),p(30,105),p(74,92),blue,4);
  r.curve(p(50,30),p(108,0),p(148,70),p(103,81),muted,3);
  r.curve(p(164,168),p(105,172),p(155,108),p(174,136),blue,4);
 }
 return r.data;
}
function attach(material,data,repeat){
 if(material.map)return;
 const t=new THREE.DataTexture(data,SIZE,SIZE,THREE.RGBAFormat,THREE.UnsignedByteType);
 t.name=material.name+'-r102';t.colorSpace=THREE.SRGBColorSpace;t.flipY=false;
 t.wrapS=t.wrapT=repeat?THREE.RepeatWrapping:THREE.ClampToEdgeWrapping;
 t.magFilter=THREE.LinearFilter;t.minFilter=THREE.LinearMipmapLinearFilter;t.generateMipmaps=true;t.anisotropy=4;t.needsUpdate=true;
 material.color.set(0xffffff);material.map=t;material.userData.artStatus=JIAOTAI_TEXTILE_ART.status;material.needsUpdate=true;
 let disposed=false;material.addEventListener('dispose',()=>{if(!disposed){disposed=true;t.dispose();}});
}
export function installJiaotaiTextileMaps(materials){
 if(!materials.textile.map)attach(materials.textile,jiaotaiClothPixels(),true);
 if(!materials.carpet.map)attach(materials.carpet,jiaotaiRugPixels(),false);
}
export function jiaotaiClothUV(geometry){
 // Tiny existing tips retain their continuous cylindrical unwrap; dominant-axis
 // projection across smooth cylinder normals would collapse four triangles.
 if(geometry.type==='CylinderGeometry')return geometry;
 const p=geometry.attributes.position,n=geometry.attributes.normal,uv=new Float32Array(p.count*2),scale=1/JIAOTAI_TEXTILE_ART.clothRepeatMetres;
 for(let i=0;i<p.count;i++){
  const nx=Math.abs(n.getX(i)),ny=Math.abs(n.getY(i)),nz=Math.abs(n.getZ(i));
  const u=nx>=ny&&nx>=nz?p.getZ(i):p.getX(i),v=ny>nx&&ny>=nz?p.getZ(i):p.getY(i);
  uv[i*2]=u*scale;uv[i*2+1]=v*scale;
 }
 geometry.setAttribute('uv',new THREE.BufferAttribute(uv,2));return geometry;
}
