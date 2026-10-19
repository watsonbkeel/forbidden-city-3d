import * as THREE from 'three';
import {mergeByMaterial} from '../../utils/MergeUtils.js';
import {loadQianqingCeilingPaint} from './QianqingCeilingPaint.js';
/** Selected official image establishes a continuous boxed ceiling, not a
 * caisson. Cell count/depth and paint are photo-relative, not surveyed tracing. */
export const QIANQING_CEILING={id:'qianqing-panelled-ceiling-r32',x:0,z:316.8,y:9.33,w:46,d:25,nx:23,nz:12,depth:.12,lodDistance:90,lodHysteresis:.1,source:'https://img.dpm.org.cn/Uploads/Picture/dc/1523%5B1024%5D.jpg'};
export function installQianqingCeiling(b,hall){
 const p=QIANQING_CEILING,raw=new THREE.Group();raw.name=p.id;
 const canvas=document.createElement('canvas');canvas.width=canvas.height=256;const c=canvas.getContext('2d');if(!c)throw Error('Qianqing ceiling requires canvas');
 c.fillStyle='#273331';c.fillRect(0,0,256,256);
 for(const [inset,color,width] of [[5,'#555744',8],[17,'#303e42',8],[28,'#66604a',4],[37,'#35454a',4]]){c.strokeStyle=color;c.lineWidth=width;c.strokeRect(inset,inset,256-2*inset,256-2*inset);}
 c.strokeStyle='#68634b';c.lineWidth=4;c.beginPath();c.arc(128,128,62,0,Math.PI*2);c.stroke();
 // A restrained self-authored coiled ornament, not a claimed dragon facsimile.
 c.beginPath();for(let i=0;i<=64;i++){const a=i/64*Math.PI*3.4,r=48-i*.48,x=128+Math.cos(a)*r,y=128+Math.sin(a)*r;c[i?'lineTo':'moveTo'](x,y);}c.stroke();
 const t=new THREE.CanvasTexture(canvas);t.colorSpace=THREE.SRGBColorSpace;t.wrapS=t.wrapT=THREE.RepeatWrapping;t.repeat.set(p.nx,p.nz);t.anisotropy=4;
 const panel=b.ownMat('qianqing-r32-ceiling-panel',{map:t,color:0xffffff,roughness:.89,metalness:.03,side:THREE.DoubleSide});panel.addEventListener('dispose',()=>t.dispose());
 const frame=b.ownMat('qianqing-r32-ceiling-frame',{color:0x475047,roughness:.82,metalness:.06});
 const plane=new THREE.Mesh(new THREE.PlaneGeometry(p.w,p.d),panel);plane.rotation.x=Math.PI/2;raw.add(plane);
 const add=(w,d,x,z)=>{const m=new THREE.Mesh(new THREE.BoxGeometry(w,p.depth,d),frame);m.position.set(x,-p.depth/2,z);m.castShadow=m.receiveShadow=true;raw.add(m);};
 for(let i=0;i<=p.nx;i++)add(.055,p.d,-p.w/2+i*p.w/p.nx,0);
 for(let i=0;i<=p.nz;i++)add(p.w,.055,0,-p.d/2+i*p.d/p.nz);
 const near=mergeByMaterial(raw,{name:p.id}),far=new THREE.Group();far.name='qianqing-ceiling-far';
 // The same panel texture preserves every cell at distance. Only the 55 mm
 // projecting grid battens are omitted after they become subpixel details.
 const flat=new THREE.Mesh(new THREE.PlaneGeometry(p.w,p.d),panel);flat.rotation.x=Math.PI/2;far.add(flat);
 const g=new THREE.LOD();g.name=p.id;g.addLevel(near,0);g.addLevel(far,p.lodDistance,p.lodHysteresis);far.visible=false;
 g.position.set(p.x,p.y,p.z);g.userData={caisson:false,layoutStatus:'PHOTO_RELATIVE_CELL_GRID_NOT_SURVEYED',paintStatus:'SELF_AUTHORED_APPROXIMATION',source:p.source,distanceDetail:'same-panel-texture-without-subpixel-battens'};loadQianqingCeilingPaint({canvas,texture:t,material:panel,metadata:g.userData,manager:b.library?.loader?.manager});hall.add(g);return g;
}
