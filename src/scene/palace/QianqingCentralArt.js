import * as THREE from 'three';
import {loadQianqingScreenPaint} from './QianqingScreenPaint.js';
import {loadQianqingFriezePaint} from './QianqingFriezePaint.js';
export const QIANQING_CENTRAL_ART=Object.freeze({id:'qianqing-central-private-atlas',width:1024,height:512,status:'SELF_AUTHORED_PHOTO_INFORMED_APPROXIMATION_NOT_CARVING_FACSIMILE',cells:{panel:0,step:1,frieze:2,plaque:3,gold:4,red:5,dark:6,blue:7}});
export function qianqingCentralMaterial(b){
 const p=QIANQING_CENTRAL_ART;if(b._own.has(p.id))return b._own.get(p.id);
 const canvas=document.createElement('canvas');canvas.width=p.width;canvas.height=p.height;const c=canvas.getContext('2d');if(!c)throw Error('Qianqing central atlas requires a canvas');
 const cell=(i,fn)=>{c.save();c.translate(i%4*256,Math.floor(i/4)*256);fn();c.restore();};const fill=color=>{c.fillStyle=color;c.fillRect(0,0,256,256);};
 const scroll=(cx,cy,s)=>{c.beginPath();c.moveTo(cx-s,cy);c.bezierCurveTo(cx-s,cy-s,cx+s,cy-s,cx+s,cy);c.bezierCurveTo(cx+s,cy+s,cx-s*.5,cy+s,cx-s*.5,cy);c.bezierCurveTo(cx-s*.5,cy-s*.45,cx+s*.3,cy-s*.45,cx+s*.3,cy);c.stroke();};
 const oldPanel=()=>{fill('#806032');c.strokeStyle='#c1a367';c.lineWidth=3;c.strokeRect(7,7,242,242);c.strokeRect(17,17,222,222);for(let y=36;y<244;y+=43)for(let x=34;x<242;x+=47)scroll(x,y,18);c.fillStyle='#a98e59';c.fillRect(91,52,74,138);c.strokeStyle='#d2b77b';c.strokeRect(94,55,68,132);};
 // Keep an independent copy of the old chair artwork in the right quarter.
 // Loading the screen sample may repaint only the left 192x256 rectangle.
 cell(0,()=>{c.save();c.scale(.75,1);oldPanel();c.restore();c.save();c.translate(192,0);c.scale(.25,1);oldPanel();c.restore();});
 cell(1,()=>{fill('#315564');c.fillStyle='#777c72';c.fillRect(0,0,256,56);c.fillStyle='#ba9d57';c.fillRect(0,64,256,9);c.fillRect(0,239,256,9);c.strokeStyle='#c3a762';c.lineWidth=6;for(let x=30;x<250;x+=62)scroll(x,159,24);});
 cell(2,()=>{fill('#913a31');c.strokeStyle='#bb9d60';c.lineWidth=4;c.strokeRect(4,5,248,246);c.strokeRect(12,13,232,230);for(let y=52;y<235;y+=76)for(let x=36;x<250;x+=63)scroll(x,y,25);});
 cell(3,()=>{fill('#635a41');c.fillStyle='#af9560';c.fillRect(7,7,242,242);c.fillStyle='#b7a77c';c.fillRect(13,13,230,230);c.fillStyle='#1e2528';c.fillRect(21,25,214,206);c.fillStyle='#d4c297';c.save();c.scale(1.25/3.8,1);c.font='bold 147px "STKaiti","KaiTi","Kaiti SC","Songti SC","SimSun",serif';c.textAlign='center';c.textBaseline='middle';[...'明光大正'].forEach((ch,i)=>c.fillText(ch,(48+i*53)/(1.25/3.8),131));c.restore();});
 ['#c3a365','#87362e','#282927'].forEach((s,i)=>cell(4+i,()=>fill(s)));
 cell(7,()=>{fill('#d4cba9');
  // The official view shows a light cover, a dark top and two hanging bands.
  // Restrained cloth folds are a visual approximation, not measured textile.
  for(let x=0;x<256;x+=4){const shade=Math.round(7*Math.sin(x*.11)+3*Math.sin(x*.037));c.fillStyle=`rgb(${212+shade},${203+shade},${169+shade})`;c.fillRect(x,38,4,218);}
  c.fillStyle='#252d32';c.fillRect(0,0,256,42);
  c.strokeStyle='#596067';c.lineWidth=1;for(const x of[22,52,84,116,148,180,214,242]){c.beginPath();c.moveTo(x,1);c.lineTo(x-9,39);c.stroke();}
  for(const x of[68,188]){c.fillStyle='#242c32';c.fillRect(x,28,8,166);c.fillStyle='#495052';c.fillRect(x,42,1,150);}
  c.fillStyle='#aaa184';c.fillRect(0,252,256,4);
 });
 const t=new THREE.CanvasTexture(canvas);t.colorSpace=THREE.SRGBColorSpace;t.anisotropy=4;const responseCanvas=document.createElement('canvas');responseCanvas.width=p.width;responseCanvas.height=p.height;const rc=responseCanvas.getContext('2d');if(!rc)throw Error('Qianqing response atlas requires canvas');
 // Local atlas cells separate gilt, lacquer, cloth and dark paint. These are
 // visual trial response parameters; they do not claim conservation measurements.
 const response=[[.55,.38],[.62,.20],[.57,.30],[.61,.25],[.50,.42],[.69,.08],[.81,.02],[.93,0]];
 response.forEach(([rough,metal],i)=>{rc.fillStyle=`rgb(255,${Math.round(rough*255)},${Math.round(metal*255)})`;rc.fillRect(i%4*256,Math.floor(i/4)*256,256,256);});
 const rt=new THREE.CanvasTexture(responseCanvas);rt.colorSpace=THREE.NoColorSpace;rt.minFilter=THREE.LinearFilter;rt.magFilter=THREE.LinearFilter;rt.generateMipmaps=false;
 const m=new THREE.MeshStandardMaterial({map:t,roughnessMap:rt,metalnessMap:rt,roughness:1,metalness:1,side:THREE.DoubleSide});m.name=p.id;m.userData.artStatus=p.status;let disposed=false;m.addEventListener('dispose',()=>{if(!disposed){disposed=true;t.dispose();rt.dispose();}});loadQianqingScreenPaint({canvas,texture:t,material:m,manager:b.library?.loader?.manager});loadQianqingFriezePaint({canvas,texture:t,material:m,manager:b.library?.loader?.manager});b._own.set(p.id,m);b.ownedMaterials.push(m);return m;
}
export function qianqingCentralUV(g,cell,{solid=false,frontOnly=false,backCell=5,screenPanel=false}={}){
 if(!Number.isInteger(cell)||cell<0||cell>7||!Number.isInteger(backCell)||backCell<0||backCell>7)throw Error('Registered Qianqing atlas cell required');const pos=g.attributes.position,uv=g.attributes.uv,n=g.attributes.normal,out=new Float32Array(pos.count*2),pad=2/256;
 if(!solid&&!uv)throw Error('Qianqing textured geometry requires UV');
 for(let i=0;i<pos.count;i++){const painted=!frontOnly||n.getZ(i)<-.9,c=painted?cell:backCell,u=solid||!painted?.5:Math.max(0,Math.min(1,uv.getX(i))),v=solid||!painted?.5:Math.max(0,Math.min(1,uv.getY(i)));const left=c===0?(screenPanel?0:.75):0,width=c===0?(screenPanel?.75:.25):1;out[2*i]=(c%4+left+pad+u*(width-2*pad))/4;out[2*i+1]=1-(Math.floor(c/4)+1-pad-v*(1-2*pad))/2;}
 g.setAttribute('uv',new THREE.BufferAttribute(out,2));return g;
}
