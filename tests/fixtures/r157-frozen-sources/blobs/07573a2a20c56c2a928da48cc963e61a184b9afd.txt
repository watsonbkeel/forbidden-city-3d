import * as THREE from 'three';
const KEY='jiaotai-room-atlas-r119';
export const JIAOTAI_ROOM_ART=Object.freeze({width:512,height:256,status:'SOURCE_BOUNDED_SCHEMATIC_NOT_A_TEXTURE_TRACE_OR_SURVEY'});
/** One owned atlas, shared by all documented inner-frame faces. No image fetch,
 * hidden quality fallback, per-mesh clone, or dependency on the covered display. */
export function jiaotaiRoomMaterial(builder){
 if(builder._own.has(KEY))return builder._own.get(KEY);
 const canvas=document.createElement('canvas');canvas.width=512;canvas.height=256;
 const c=canvas.getContext('2d');if(!c)throw Error('Jiaotai room atlas requires Canvas2D');
 c.fillStyle='#163b41';c.fillRect(0,0,512,256);
 // A fitted blue-green field and gold framing, not a transcription of each
 // dragon/phoenix or an assertion of the real repeat count.
 for(const [inset,color]of[[3,'#ae945a'],[8,'#376763'],[13,'#b9a16d'],[17,'#122d4c']]){c.fillStyle=color;c.fillRect(inset,inset,512-2*inset,128-2*inset);}
 c.strokeStyle='#b99c60';c.lineWidth=2;
 for(const cx of[70,256,442]){
  const half=cx===256?111:42;c.beginPath();c.moveTo(cx-half,26);c.lineTo(cx+half,26);c.lineTo(cx+half-13,64);c.lineTo(cx+half,102);c.lineTo(cx-half,102);c.lineTo(cx-half+13,64);c.closePath();c.stroke();
  c.beginPath();c.moveTo(cx-half*.65,72);c.bezierCurveTo(cx-half*.20,24,cx+half*.45,99,cx+half*.65,53);c.bezierCurveTo(cx+half*.1,91,cx-half*.5,44,cx-half*.65,72);c.stroke();
  for(const s of[-1,1])for(let k=0;k<3;k++){c.beginPath();c.moveTo(cx+s*(16+k*8),58+k*4);c.lineTo(cx+s*(22+k*8),42+k*4);c.lineTo(cx+s*(27+k*8),44+k*4);c.stroke();}
 }
 // Bracket face cell: blue/green members with a restrained gilt edge.
 c.fillStyle='#234a4b';c.fillRect(0,128,512,128);
 for(let x=0;x<512;x+=64){c.fillStyle='#142d48';c.fillRect(x+7,140,50,99);c.strokeStyle='#b19b65';c.lineWidth=2;c.strokeRect(x+8,141,48,97);for(const y of[155,182,209]){c.beginPath();c.moveTo(x+9,y);c.lineTo(x+19,y+9);c.lineTo(x+45,y+9);c.lineTo(x+55,y);c.stroke();}}
 const map=new THREE.CanvasTexture(canvas);map.name=KEY;map.colorSpace=THREE.SRGBColorSpace;map.wrapS=THREE.RepeatWrapping;map.anisotropy=4;
 const material=new THREE.MeshStandardMaterial({name:KEY,map,roughness:.73,metalness:.1});material.userData.artStatus=JIAOTAI_ROOM_ART.status;
 let disposed=false;material.addEventListener('dispose',()=>{if(!disposed){disposed=true;map.dispose();}});
 builder._own.set(KEY,material);builder.ownedMaterials.push(material);return material;
}
export function jiaotaiRoomUV(geometry,bracket=false){
 const uv=geometry.attributes.uv;if(!uv)throw Error('Jiaotai frame geometry requires UV');
 const out=new Float32Array(uv.count*2),pad=2/512,n=geometry.attributes.normal;
 const {width,height,depth}=geometry.parameters;
 for(let i=0;i<uv.count;i++){
  // The top atlas field is 4:1. Repeat only horizontally on long vertical
  // faces; do not stretch a single cartouche over the entire 18.4 m wall.
  const span=Math.abs(n.getX(i))>.9?depth:width;
  const repeat=bracket||Math.abs(n.getY(i))>.9?1:Math.max(1,span/height/4);
  out[i*2]=pad+Math.max(0,Math.min(1,uv.getX(i)))*(1-2*pad)*repeat;
  out[i*2+1]=(bracket?0:.5)+2/256+Math.max(0,Math.min(1,uv.getY(i)))*(.5-4/256);
 }
 geometry.setAttribute('uv',new THREE.BufferAttribute(out,2));return geometry;
}
