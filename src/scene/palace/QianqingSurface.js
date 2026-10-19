import * as THREE from 'three';
// Local illustration only. The official interior shows fine joints in dark
// polished square bricks; court stone remains pale, rougher and distinct.
// Tile/joint dimensions and colour are visual trials, not survey measurements.
export const QIANQING_SURFACE=Object.freeze({
 interior:Object.freeze({key:'qianqing-interior-brick-r31',size:256,tiles:4,tileMetres:2.56,base:[66,69,72],joint:[48,51,53],roughness:.32,contrast:2}),
 court:Object.freeze({key:'qianqing-front-stone-r31',size:256,tiles:4,tileMetres:6,base:[156,153,146],joint:[139,137,131],roughness:.78,contrast:3}),
});
export function qianqingSurfacePixels(kind){
 const p=QIANQING_SURFACE[kind];if(!p)throw Error('Unknown Qianqing surface');const data=new Uint8Array(p.size*p.size*4),cell=p.size/p.tiles;
 for(let y=0;y<p.size;y++)for(let x=0;x<p.size;x++){
  const tx=Math.floor(x/cell),ty=Math.floor(y/cell),edge=Math.min(x%cell+.5,cell-x%cell-.5,y%cell+.5,cell-y%cell-.5),seam=Math.max(0,1-edge/(kind==='interior'?.8:1));
  const shade=(((tx*13+ty*7+tx*ty*3)%17)-8)/8*p.contrast,grain=(((x*37+y*73+x*y*11)%101)/100-.5)*.8,i=(y*p.size+x)*4;
  for(let c=0;c<3;c++)data[i+c]=Math.round(p.base[c]*(1-seam)+p.joint[c]*seam+shade+grain);data[i+3]=255;
 }return data;
}
export function qianqingSurfaceMaterial(builder,kind){
 const p=QIANQING_SURFACE[kind];if(!p)throw Error('Unknown Qianqing surface');if(builder._own.has(p.key))return builder._own.get(p.key);
 const t=new THREE.DataTexture(qianqingSurfacePixels(kind),p.size,p.size,THREE.RGBAFormat);t.name=p.key;t.colorSpace=THREE.SRGBColorSpace;t.wrapS=t.wrapT=THREE.RepeatWrapping;t.generateMipmaps=true;t.minFilter=THREE.LinearMipmapLinearFilter;t.magFilter=THREE.LinearFilter;t.anisotropy=Math.min(builder.library.anisotropy??4,4);t.needsUpdate=true;
 const m=builder.ownMat(p.key,{name:p.key,map:t,color:0xffffff,metalness:0,roughness:p.roughness});let disposed=false;m.addEventListener('dispose',()=>{if(!disposed){disposed=true;t.dispose();}});return m;
}
