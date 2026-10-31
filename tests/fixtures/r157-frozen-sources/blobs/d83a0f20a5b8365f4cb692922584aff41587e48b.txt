import * as THREE from 'three';
const KEY='jiaotai-central-atlas';
export const JIAOTAI_CENTRAL_ART={width:1024,height:512,columns:4,rows:2,status:'SELF_AUTHORED_SCHEMATIC_NOT_MEASURED_OR_PHOTOGRAPHIC',cells:{frieze:0,brackets:1,plaque:2,screen:3,gold:4,red:5,dark:6,silver:7}};
export function jiaotaiCentralMaterial(builder){
 if(builder._own.has(KEY))return builder._own.get(KEY);
 const canvas=document.createElement('canvas');canvas.width=1024;canvas.height=512;const c=canvas.getContext('2d');if(!c)throw Error('Jiaotai central atlas requires canvas');
 const cell=(i,fn)=>{c.save();c.translate(i%4*256,Math.floor(i/4)*256);fn();c.restore();};const fill=color=>{c.fillStyle=color;c.fillRect(0,0,256,256);};
 cell(0,()=>{fill('#705228');c.strokeStyle='#c1a053';c.lineWidth=4;for(const y of[14,27,229,242]){c.beginPath();c.moveTo(0,y);c.lineTo(256,y);c.stroke();}for(let x=0;x<256;x+=64){c.beginPath();c.moveTo(x,126);c.bezierCurveTo(x+10,64,x+58,64,x+62,126);c.bezierCurveTo(x+50,190,x+8,187,x+7,126);c.stroke();c.beginPath();c.arc(x+32,127,14,0,Math.PI*2);c.stroke();}});
 cell(1,()=>{fill('#574525');for(let y=8;y<255;y+=34)for(let x=(y/34%2)*16;x<256;x+=32){c.fillStyle='#b39453';c.fillRect(x,y,24,9);c.fillStyle='#d1b56c';c.fillRect(x+7,y-5,10,20);c.fillStyle='#806538';c.fillRect(x+9,y+15,7,10);}});
 cell(2,()=>{fill('#9d3d2d');c.fillStyle='#a9ad91';c.fillRect(6,6,244,244);c.fillStyle='#704435';c.fillRect(11,11,234,234);c.fillStyle='#b7b99d';c.fillRect(16,16,224,224);c.fillStyle='#a54a35';c.fillRect(23,23,210,210);c.fillStyle='#c9b27c';c.fillRect(35,35,186,186);c.fillStyle='#202d29';c.save();c.scale(.49,1);c.font='bold 160px "STKaiti","KaiTi","Kaiti SC","Songti SC","SimSun",serif';c.textAlign='center';c.textBaseline='middle';c.fillText('為',77/.49,132);c.fillText('無',179/.49,132);c.restore();});
 // Official front and plaque close-up show red ground, gilt dragon/cloud
 // masses and a small blue medallion. These curves are original schematic art,
 // not a trace, historical carving replica, inscription or hidden inventory.
 cell(3,()=>{fill('#9b3026');c.strokeStyle='#b89a54';c.lineWidth=4;c.strokeRect(5,5,246,246);c.strokeStyle='#d3b66f';c.lineWidth=2;c.strokeRect(10,10,236,236);
  for(const side of[-1,1]){c.save();c.translate(128,0);c.scale(side,1);
   const dragon=()=>{c.beginPath();c.moveTo(17,232);c.bezierCurveTo(111,222,107,166,66,161);c.bezierCurveTo(12,156,25,111,79,121);c.bezierCurveTo(125,129,119,70,64,70);c.bezierCurveTo(32,70,32,40,67,34);};
   dragon();c.strokeStyle='#66451e';c.lineWidth=13;c.stroke();dragon();c.strokeStyle='#bea05b';c.lineWidth=10;c.stroke();dragon();c.strokeStyle='#e0c383';c.lineWidth=2;c.stroke();
   // Muzzle, two swept horns and limb silhouettes stay subordinate to the field.
   c.fillStyle='#c8ab69';c.beginPath();c.ellipse(70,33,13,8,-.25,0,Math.PI*2);c.fill();c.strokeStyle='#d5b879';c.lineWidth=3;for(const dy of[0,6]){c.beginPath();c.moveTo(66,29+dy);c.lineTo(56,16+dy);c.lineTo(45,19+dy);c.stroke();}
   for(const [x,y]of[[72,83],[56,145],[83,193]]){c.beginPath();c.moveTo(x,y);c.lineTo(x-15,y+12);c.lineTo(x-10,y+21);c.moveTo(x-15,y+12);c.lineTo(x-24,y+18);c.stroke();}
   c.restore();
  }
  c.strokeStyle='#c9ab68';c.lineWidth=3;
  for(let row=0;row<8;row++)for(let col=0;col<7;col++){const x=20+col*35+(row%2)*9,y=20+row*29;if(x>242)continue;c.beginPath();c.moveTo(x-8,y+3);c.bezierCurveTo(x-11,y-4,x-3,y-5,x,y-1);c.bezierCurveTo(x+5,y-8,x+10,y-3,x+8,y+2);c.lineTo(x+13,y+3);c.stroke();}
  c.fillStyle='#263e79';c.beginPath();c.arc(128,27,12,0,Math.PI*2);c.fill();c.strokeStyle='#cfb575';c.lineWidth=3;c.stroke();
 });
 ['#b09551','#82372a','#494c35','#939b91'].forEach((s,i)=>cell(4+i,()=>fill(s)));
 const t=new THREE.CanvasTexture(canvas);t.colorSpace=THREE.SRGBColorSpace;t.anisotropy=4;const m=new THREE.MeshStandardMaterial({map:t,roughness:.68,metalness:.15,side:THREE.DoubleSide});m.name=KEY;m.userData.artStatus=JIAOTAI_CENTRAL_ART.status;
 let done=false;m.addEventListener('dispose',()=>{if(!done){done=true;t.dispose();}});builder._own.set(KEY,m);builder.ownedMaterials.push(m);return m;
}
export function centralUV(g,cell,{solid=false}={}){
 if(!Number.isInteger(cell)||cell<0||cell>7)throw Error('Unknown central atlas cell');const p=g.attributes.position,src=g.attributes.uv;if(!solid&&!src)throw Error('Textured central geometry requires UV');const out=new Float32Array(p.count*2),pad=2/256;
 for(let i=0;i<p.count;i++){const u=solid ? .5 : src.getX(i),v=solid ? .5 : src.getY(i);out[i*2]=(cell%4+pad+Math.max(0,Math.min(1,u))*(1-2*pad))/4;out[i*2+1]=1-(Math.floor(cell/4)+1-pad-Math.max(0,Math.min(1,v))*(1-2*pad))/2;}
 g.setAttribute('uv',new THREE.BufferAttribute(out,2));return g;
}
